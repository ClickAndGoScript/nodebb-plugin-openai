'use strict';

const groups = nodebb.require('./src/groups');

const Controllers = module.exports;

Controllers.renderAdminPage = async function (req, res/* , next */) {
	const groupsData = await groups.getNonPrivilegeGroups('groups:createtime', 0, -1);
	groupsData.sort((a, b) => b.system - a.system);
	res.render('admin/plugins/openai', {
		title: 'OpenAI',
		groups: groupsData,
		// Suggestions only: the model field is free text (datalist in the template)
		models: [
			{ id: 'gpt-3.5-turbo' },
			{ id: 'gpt-4' },
			{ id: 'gpt-4-turbo' },
			{ id: 'gpt-4.1' },
			{ id: 'gpt-4.1-mini' },
			{ id: 'gpt-4.1-nano' },
			{ id: 'gpt-4o' },
			{ id: 'gpt-4o-mini' },
			{ id: 'gpt-5-codex' },
			{ id: 'gpt-5-mini' },
			{ id: 'gpt-5-nano' },
			{ id: 'gpt-5-pro' },
			{ id: 'gpt-5.1' },
			{ id: 'gpt-5.1-codex' },
			{ id: 'gpt-5.1-codex-max' },
			{ id: 'gpt-5.1-codex-mini' },
			{ id: 'gpt-5.2' },
			{ id: 'gpt-5.2-codex' },
			{ id: 'gpt-5.2-pro' },
			{ id: 'gpt-5.3-codex' },
			{ id: 'gpt-5.4' },
			{ id: 'gpt-5.4-mini' },
			{ id: 'gpt-5.4-nano' },
			{ id: 'gpt-5.4-pro' },
			{ id: 'gpt-5.5' },
			{ id: 'gpt-5.5-pro' },
			{ id: 'gpt-5.6-luna' },
			{ id: 'gpt-5.6-sol' },
			{ id: 'gpt-5.6-terra' },
			{ id: 'gpt-5.6' },
			{ id: 'gpt-6-astra' },
			{ id: 'gpt-6-luna' },
			{ id: 'gpt-6-sol' },
			{ id: 'gpt-6.1-sol' },
			{ id: 'gemini-2.0-flash' },
			{ id: 'gemini-2.5-pro' },
			{ id: 'gemini-2.5-flash' },
			{ id: 'gemini-2.5-flash-lite' },
			{ id: 'gemini-3-flash' },
			{ id: 'gemini-3.1-flash-lite' },
			{ id: 'gemma-3-27b-it' },
			{ id: 'gemma-3-12b-it' },
			{ id: 'gemma-3-4b-it' },
			{ id: 'gemma-4-31b-it' },
			{ id: 'gemma-4-26b-a4b-it' },
			{ id: 'gemma-4-e4b-it' },
			{ id: 'gemma-4-e2b-it' },
		],
	});
};
