'use strict';

$('document').ready(function () {

	function alertType(type, message) {
		require(['alerts'], function (alerts) {
			alerts[type](message);
		});
	}

	function escapeHtml(s) {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	}

	function renderInline(s) {
		return s
			.replace(/`([^`]+)`/g, '<code>$1</code>')
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			.replace(/__([^_]+)__/g, '<strong>$1</strong>')
			.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
			.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>')
			.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
	}

	function renderMarkdownSafe(md) {
		const escaped = escapeHtml(md);
		const lines = escaped.split(/\r?\n/);
		const out = [];
		let inUl = false;
		let inOl = false;
		let inCode = false;
		let para = [];
		const flushPara = () => {
			if (para.length) {
				out.push('<p>' + renderInline(para.join(' ')) + '</p>');
				para = [];
			}
		};
		const closeLists = () => {
			if (inUl) { out.push('</ul>'); inUl = false; }
			if (inOl) { out.push('</ol>'); inOl = false; }
		};
		for (const raw of lines) {
			if (/^```/.test(raw)) {
				flushPara(); closeLists();
				if (inCode) { out.push('</code></pre>'); inCode = false; }
				else { out.push('<pre><code>'); inCode = true; }
				continue;
			}
			if (inCode) { out.push(raw); continue; }
			const heading = raw.match(/^(#{1,6})\s+(.*)$/);
			if (heading) {
				flushPara(); closeLists();
				const level = heading[1].length;
				out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
				continue;
			}
			const ul = raw.match(/^\s*[-*+]\s+(.*)$/);
			if (ul) {
				flushPara();
				if (inOl) { out.push('</ol>'); inOl = false; }
				if (!inUl) { out.push('<ul>'); inUl = true; }
				out.push('<li>' + renderInline(ul[1]) + '</li>');
				continue;
			}
			const ol = raw.match(/^\s*\d+\.\s+(.*)$/);
			if (ol) {
				flushPara();
				if (inUl) { out.push('</ul>'); inUl = false; }
				if (!inOl) { out.push('<ol>'); inOl = true; }
				out.push('<li>' + renderInline(ol[1]) + '</li>');
				continue;
			}
			if (!raw.trim()) {
				flushPara(); closeLists();
				continue;
			}
			closeLists();
			para.push(raw);
		}
		flushPara(); closeLists();
		if (inCode) out.push('</code></pre>');
		return out.join('\n');
	}

	$(window).on('action:topic.tools.load', function () {
		$('.openai-summarize-topic').on('click', summarizeTopic);
	});

	function summarizeTopic() {
		const tid = ajaxify.data.tid;
		require(['bootbox'], function (bootbox) {
			const modal = bootbox.dialog({
				title: '[[openai:topic-summary]]',
				message: `<div class="openai-summarize-topic"><div class="loading text-center"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div></div>`,
				size: 'large',
				buttons: {
					ok: {
						label: 'OK',
						className: 'btn-primary',
					},
				},
			});
			socket.emit('plugins.openai.summarizeTopic', { tid }, function (err, data) {
				if (err) {
					return alertType('error', err.message);
				}
				if (!data) {
					return modal.modal('hide');
				}
				const summaryText = typeof data === 'string' ? data : data.summary;
				const renderMarkdown = typeof data === 'object' && data.renderMarkdown;
				const $container = modal.find('.openai-summarize-topic');
				if (!summaryText) {
					return modal.modal('hide');
				}
				if (renderMarkdown) {
					$container.html(renderMarkdownSafe(summaryText));
				} else {
					$container.css('white-space', 'pre-wrap').text(summaryText);
				}
			});
		});
	}
});
