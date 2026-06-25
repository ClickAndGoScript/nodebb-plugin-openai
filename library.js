'use strict';

const { OpenAI } = require('openai');

let openai;

const db = require.main.require('./src/database');
const meta = require.main.require('./src/meta');
const controllers = require('./lib/controllers');
const routeHelpers = require.main.require('./src/routes/helpers');
const socketHelpers = require.main.require('./src/socket.io/helpers');
const topics = require.main.require('./src/topics');
const posts = require.main.require('./src/posts');
const categories = require.main.require('./src/categories');
const user = require.main.require('./src/user');
const messaging = require.main.require('./src/messaging');
const api = require.main.require('./src/api');
const privileges = require.main.require('./src/privileges');
const groups = require.main.require('./src/groups');
const sockets = require.main.require('./src/socket.io');
const socketPlugins = require.main.require('./src/socket.io/plugins');
const summary = require('./lib/summary');

const plugin = module.exports;

const defaults = {
	apikey: '',
	'chatgpt-username': '',
	enablePrivateMessages: 'off',
	model: 'gpt-3.5-turbo',
	minimumReputation: 0,
	allowedGroups: '[]',
	systemPrompt: 'You are a helpful assistant',
	summarySystemPrompt: '',
	summaryFinalSystemPrompt: '',
	summaryRenderMarkdown: 'off',
	mentionApiKey: '',
	mentionApiBaseUrl: '',
	mentionMinimumReputation: '',
	mentionAllowedGroups: '',
	pmMinimumReputation: '',
	pmAllowedGroups: '',
	pmNoPermissionMessage: 'Sorry, you do not have permission to chat with me.',
};


plugin.init = async (params) => {
	const { router /* , middleware , controllers */ } = params;
	const settings = await meta.settings.get('openai');
	if (settings && settings.apikey) {
		openai = new OpenAI({
			apiKey: settings.apikey,
			baseURL: settings.apiBaseUrl || 'https://api.openai.com/v1',
		});

		plugin.openai = openai;
	}

	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/openai', controllers.renderAdminPage);
};

async function getSettings() {
	const settings = await meta.settings.get('openai');
	return {...defaults, ...settings };
}

plugin.actionMentionsNotify = async function (hookData) {
	try {
		const { notification } = hookData;
		console.log('[openai] actionMentionsNotify fired, notification:', JSON.stringify(notification));

		if (!notification) {
			console.log('[openai] no notification object, returning');
			return;
		}

		const settings = await getSettings();
		console.log('[openai] chatgpt-username:', settings['chatgpt-username'], '| openai client:', !!openai, '| mentionApiBaseUrl:', settings.mentionApiBaseUrl || '(none)');

		const allowed = await canUseMention(notification.from, settings);
		console.log('[openai] canUseMention for uid', notification.from, ':', allowed);
		if (!allowed) {
			return;
		}

		const chatgptusername = settings['chatgpt-username'];
		const chatgptUid = await user.getUidByUsername(chatgptusername);
		console.log('[openai] chatgptUid:', chatgptUid);
		if (!chatgptUid) {
			console.log('[openai] chatgpt user not found, returning');
			return;
		}

		const rawContent = await posts.getPostField(notification.pid, 'content');
		console.log('[openai] rawContent (markdown):', rawContent && rawContent.slice(0, 150));
		console.log('[openai] notification.tid:', notification.tid, '| rawContent starts with @username (case-insensitive):', rawContent && rawContent.toLowerCase().startsWith(`@${chatgptusername.toLowerCase()}`));
		if (notification.tid && rawContent && rawContent.toLowerCase().startsWith(`@${chatgptusername.toLowerCase()}`)) {
			const canReply = await privileges.topics.can('topics:reply', notification.tid, chatgptUid);
			console.log('[openai] canReply:', canReply);
			if (!canReply) {
				return;
			}

			const message = rawContent.replace(new RegExp(`^@${chatgptusername}`, 'i'), '').trim();
			console.log('[openai] message after stripping username (length:', message.length, '):', message.slice(0, 100));
			if (message.length) {
				const context = await buildMentionContext(notification);
				console.log('[openai] context built:', context);

				const fullMessage = `[Context]\n${context}\n\n[Message]\n${message}`;
				const payload = JSON.stringify({
					tid: notification.tid,
					pid: notification.pid,
					content: fullMessage,
				});
				console.log('[openai] sending payload to API (length:', payload.length, ')');

				if (settings.mentionApiBaseUrl) {
					await postMentionToCustomApi(payload, settings);
					console.log('[openai] payload sent to custom API, reply will be handled externally');
				} else {
					const response = await chatComplete(payload, openai);
					console.log('[openai] API response received (length:', response ? response.length : 0, '):', response ? response.slice(0, 100) : null);

					if (response) {
						const postData = await topics.reply({
							uid: chatgptUid,
							content: response,
							tid: notification.tid,
							toPid: notification.pid,
						});

						await user.updateOnlineUsers(chatgptUid);
						await socketHelpers.notifyNew(chatgptUid, 'newPost', {
							posts: [postData],
							'reputation:disabled': meta.config['reputation:disabled'] === 1,
							'downvote:disabled': meta.config['downvote:disabled'] === 1,
						});
						console.log('[openai] reply posted successfully, pid:', postData && postData.pid);
					}
				}
			}
		} else {
			console.log('[openai] condition not met: tid present =', !!notification.tid, '| rawContent =', rawContent && rawContent.slice(0, 80));
		}
	} catch (err) {
		console.error('[openai] actionMentionsNotify error:', err.stack);
	}
};

plugin.actionMessagingSave = async function (hookData) {
	try {
		const { message } = hookData;
		if (message.system) {
			return;
		}
		const settings = await getSettings();

		const chatgptusername = settings['chatgpt-username'];
		const chatgptUid = await user.getUidByUsername(chatgptusername);
		const { roomId, content, fromuid } = message;
		// don't reply to self
		if (parseInt(fromuid, 10) === parseInt(chatgptUid, 10)) {
			return;
		}

		const [roomData, inRoom] = await Promise.all([
			messaging.getRoomData(roomId),
			messaging.isUserInRoom(chatgptUid, roomId),
		]);

		if (!roomData || !inRoom) {
			return;
		}
		const isPrivate = !roomData.public && !roomData.groupChat;
		if (isPrivate && settings.enablePrivateMessages === 'off') {
			return;
		}
		const shouldReply = isPrivate || content.startsWith(`@${chatgptusername}`);

		// only reply in 1v1 chats or in public group chats when @<chat-gpt-username> is used
		if (!shouldReply) {
			return;
		}

		if (!await canUsePm(fromuid, settings)) {
			const noPermMsg = settings.pmNoPermissionMessage || 'Sorry, you do not have permission to chat with me.';
			await api.chats.post({ uid: chatgptUid, session: {} }, {
				roomId,
				message: noPermMsg,
				toMid: message.mid,
			});
			return;
		}

		let conversation = [{ role: 'user', content: message.content }];
		if (isPrivate) {
			const mids = await getMessageIds(roomId, chatgptUid, 0, 20);

			// dont allow chats to get too long
			if (mids.length > 20) {
				await api.chats.post({ uid: chatgptUid, session: {} }, {
					roomId,
					message: 'Conversation too long, please start a new chat',
					toMid: message.mid,
				});
				return;
			}
			let messages = await messaging.getMessagesFields(mids, ['fromuid', 'content', 'system']);
			messages = messages.filter(m => m && !m.system);
			conversation = messages.map(
				msg => ({ role: msg.fromuid === chatgptUid ? 'assistant' : 'user', content: msg.content })
			);
		}

		const response = await chatComplete(conversation, openai);

		if (response) {
			await api.chats.post({ uid: chatgptUid, session: {} }, {
				roomId,
				message: response,
				toMid: isPrivate ? undefined : message.mid,
			});
		}
	} catch (err) {
		console.error(err.stack);
	}
};

function getMentionEffectiveSettings(settings) {
	const mentionMinRep = settings.mentionMinimumReputation !== '' && settings.mentionMinimumReputation != null
		? settings.mentionMinimumReputation
		: settings.minimumReputation;
	const mentionGroups = settings.mentionAllowedGroups && settings.mentionAllowedGroups !== '[]' && settings.mentionAllowedGroups !== ''
		? settings.mentionAllowedGroups
		: settings.allowedGroups;
	return { ...settings, minimumReputation: mentionMinRep, allowedGroups: mentionGroups };
}

async function canUseOpenAI(uid, settings, silent = false) {
	if (!await checkReputation(uid, settings, silent)) {
		return false;
	}
	if (!await checkGroupMembership(uid, settings, silent)) {
		return false;
	}
	return true;
}

async function canUseMention(uid, settings, silent = false) {
	return canUseOpenAI(uid, getMentionEffectiveSettings(settings), silent);
}

function getPmEffectiveSettings(settings) {
	const pmMinRep = settings.pmMinimumReputation !== '' && settings.pmMinimumReputation != null
		? settings.pmMinimumReputation
		: settings.minimumReputation;
	const pmGroups = settings.pmAllowedGroups && settings.pmAllowedGroups !== '[]' && settings.pmAllowedGroups !== ''
		? settings.pmAllowedGroups
		: settings.allowedGroups;
	return { ...settings, minimumReputation: pmMinRep, allowedGroups: pmGroups };
}

async function canUsePm(uid, settings) {
	return canUseOpenAI(uid, getPmEffectiveSettings(settings), true);
}

async function checkReputation(uid, settings, silent) {
	const reputation = await user.getUserField(uid, 'reputation');
	const hasEnoughRep = parseInt(settings.minimumReputation, 10) === 0 ||
		parseInt(reputation, 10) >= parseInt(settings.minimumReputation, 10);

	if (!hasEnoughRep && !silent) {
		sockets.server.in(`uid_${uid}`).emit('event:alert', {
			type: 'danger',
			title: '[[global:alert.error]]',
			message: `[[openai:error.need-x-reputation-to-mention, ${settings.minimumReputation}]]`,
		});
	}
	return hasEnoughRep;
}

async function checkGroupMembership(uid, settings, silent) {
	let allowedGroups = [];
	try {
		allowedGroups = JSON.parse(settings.allowedGroups) || [];
	} catch (err) {
		console.error('[openai] Failed to parse allowedGroups:', settings.allowedGroups, err);
		allowedGroups = [];
	}


	if (!allowedGroups.length) {
		return true;
	}

	const isMembers = await groups.isMemberOfGroups(uid, allowedGroups);
	const memberOfAny = isMembers.includes(true);
	if (!memberOfAny && !silent) {
		sockets.server.in(`uid_${uid}`).emit('event:alert', {
			type: 'danger',
			title: '[[global:alert.error]]',
			message: `[[error:no-privileges]]`,
		});
	}
	return memberOfAny;
}

async function postMentionToCustomApi(payload, settings) {
	const url = settings.mentionApiBaseUrl;
	const apiKey = settings.mentionApiKey || settings.apikey;
	console.log('[openai] POSTing to custom mention API:', url);

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
		},
		body: payload,
	});

	console.log('[openai] custom API response status:', res.status);
	if (!res.ok) {
		const errText = await res.text();
		throw new Error(`${res.status} ${errText}`);
	}

	const contentType = res.headers.get('content-type') || '';
	if (contentType.includes('application/json')) {
		const data = await res.json();
		return data.content || data.response || data.message || data.reply || data.text || JSON.stringify(data);
	}
	return await res.text();
}

function stripHtml(html) {
	return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function buildMentionContext(notification) {
	const { tid, pid, from } = notification;

	const [topicData, askerUsername] = await Promise.all([
		topics.getTopicFields(tid, ['title', 'cid', 'postcount', 'tags', 'locked']),
		user.getUserField(from, 'username'),
	]);

	const lines = [];
	lines.push(`Topic: "${topicData.title}"`);

	if (topicData.cid) {
		try {
			const categoryData = await categories.getCategoryFields(topicData.cid, ['name']);
			if (categoryData && categoryData.name) {
				lines.push(`Category: ${categoryData.name}`);
			}
		} catch (e) { /* skip if unavailable */ }
	}

	try {
		let tags = topicData.tags;
		if (typeof tags === 'string') {
			tags = JSON.parse(tags);
		}
		if (Array.isArray(tags) && tags.length) {
			const tagValues = tags.map(t => (t && typeof t === 'object' ? t.value : t)).filter(Boolean);
			if (tagValues.length) {
				lines.push(`Tags: ${tagValues.join(', ')}`);
			}
		}
	} catch (e) { /* skip if unavailable */ }

	lines.push(`Posts in topic so far: ${topicData.postcount}`);

	if (parseInt(topicData.locked, 10) === 1) {
		lines.push(`Topic status: locked`);
	}

	lines.push(`Asked by: @${askerUsername}`);

	try {
		const postData = await posts.getPostFields(pid, ['toPid']);
		if (postData.toPid) {
			const toPidIndex = await posts.getPidIndex(postData.toPid, tid, 'oldest_to_newest');
			lines.push(`Replying to: post #${toPidIndex} in this topic (pid: ${postData.toPid})`);
		}
	} catch (e) { /* skip if unavailable */ }

	return lines.join('\n');
}

async function getMessageIds(roomId, uid, start, stop) {
	const isPublic = await db.getObjectField(`chat:room:${roomId}`, 'public');
	if (parseInt(isPublic, 10) === 1) {
		return await db.getSortedSetRange(
			`chat:room:${roomId}:mids`, start, stop
		);
	}
	const userjoinTimestamp = await db.sortedSetScore(`chat:room:${roomId}:uids`, uid);
	return await db.getSortedSetRangeByScore(
		`chat:room:${roomId}:mids`, start, stop === -1 ? -1 : stop - start + 1, userjoinTimestamp, '+inf'
	);
}

async function chatComplete(messages, client) {
	const openaiClient = client || openai;
	if (!openaiClient) {
		throw new Error('API not created!');
	}
	const isConversation = Array.isArray(messages);
	const { model, systemPrompt } = await getSettings();
	const conversation = [];
	if (systemPrompt) {
		conversation.push({ role: 'system', content: systemPrompt });
	}
	if (isConversation) {
		conversation.push(...messages);
	} else {
		conversation.push({ role: 'user', content: messages });
	}

	const chatCompletion = await openaiClient.chat.completions.create({
		model: model || 'gpt-3.5-turbo',
		messages: conversation,
	});

	return chatCompletion.choices[0]?.message?.content;
}

plugin.addAdminNavigation = (header) => {
	header.plugins.push({
		route: '/plugins/openai',
		icon: 'fa-robot',
		name: 'OpenAI',
	});

	return header;
};

plugin.filterTopicThreadTools = async (hookData) => {
	const settings = await getSettings();
	const allowed = await canUseOpenAI(hookData.uid, settings, true);
	if (!allowed) {
		return hookData;
	}
	hookData.tools.push({
		class: 'openai-summarize-topic',
		icon: 'fa-wand-magic-sparkles',
		title: '[[openai:summarize-topic]]',
	});
	return hookData;
};

plugin.actionTopicReply = async (hookData) => {
	await summary.clearTopicSummary([hookData.post.tid]);
};

plugin.actionPostEdit = async (hookData) => {
	await summary.clearTopicSummary([hookData.post.tid]);
};

plugin.actionPostsPurge = async (hookData) => {
	const { posts } = hookData;
	const uniqTids = [...new Set(posts.map(p => p.tid))];
	await summary.clearTopicSummary(uniqTids);
};

plugin.actionPostRestore = async (hookData) => {
	await summary.clearTopicSummary([hookData.post.tid]);
};

plugin.actionPostDelete = async (hookData) => {
	await summary.clearTopicSummary([hookData.post.tid]);
};

plugin.actionPostMove = async (hookData) => {
	await summary.clearTopicSummary([hookData.post.tid, hookData.tid]);
};

plugin.actionPostChangeOwner = async (hookData) => {
	const { posts } = hookData;
	const uniqTids = [...new Set(posts.map(p => p.tid))];
	await summary.clearTopicSummary(uniqTids);
};

socketPlugins.openai = {};

socketPlugins.openai.summarizeTopic = async function (socket, data) {
	const { tid } = data;
	if (!await privileges.topics.can('topics:read', tid, socket.uid)) {
		throw new Error('[[error:no-privileges]]');
	}
	const settings = await getSettings();
	if (!await canUseOpenAI(socket.uid, settings)) {
		return;
	}

	let openaiSummary = await topics.getTopicField(tid, 'openai:summary');
	if (!openaiSummary) {
		openaiSummary = await summary.summarizeTopic(tid, openai, settings);
		await topics.setTopicField(tid, 'openai:summary', openaiSummary);
	}
	return {
		summary: summary.stripReasoning(openaiSummary),
		renderMarkdown: settings.summaryRenderMarkdown === 'on',
	};
};
