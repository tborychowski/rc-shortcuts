/* global rcmail */

const shortcutsMap = {
	refresh: {
		key: 'u',
		action: e => rcmail.command('checkmail', '', e.target, e)
	},
	edit: {
		key: 'e',
		action: e => {
			const mode = rcmail.env.mailbox == rcmail.env.drafts_mailbox ? '' : 'new';
			return rcmail.command('edit', mode, e.target, e);
		}
	},
	searchFocus: {
		key: '/',
		action: () => {
			window.top.document.querySelector('#mailsearchform').focus();
		}
	},
	nextMsg: {
		key: 'j',
		action: e => {
			if (rcmail.message_list)rcmail.message_list.select_next();
			else rcmail.command('nextmessage', '', '', e);
		}
	},
	prevMsg: {
		key: 'k',
		action: e => {
			if (rcmail.message_list) rcmail.message_list.use_arrow_key(38, false);
			else rcmail.command('previousmessage', '', '', e);
		}
	},
	replyall: {
		key: 'a',
		action: e => rcmail.command('reply-all', 'sub', e.target, e),
	},
	reply: {
		key: 'r',
		action: e => rcmail.command('reply', '', e.target, e)
	},
	send: {
		key: 'Enter',
		meta: true,
		condition: e => e.target.closest('#tinymce'),
		action: e => rcmail.command('send', '', e.target, e)
	}
};



function onKeyPress (e) {
	if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

	const hasPopup = document.querySelector('.ui-dialog,.popover');
	if (hasPopup) return;


	for (const handler in Object.values(shortcutsMap)) {
		const key = e.key === handler.key &&
			e.metaKey == handler.meta &&
			e.altKey == handler.alt &&
			e.ctrlKey == handler.ctrl;
		const condition = (typeof handler.condition === 'function') ? handler.condition(e) : true;

		if (key && condition) {
			e.preventDefault();
			handler.action(e);
			break;
		}
	}
}



if (window.rcmail) {
	document.addEventListener('DOMContentLoaded', () => {
		document.addEventListener('keypress', onKeyPress);
	});

	const composeIframe = document.getElementById('composebody_ifr');
	if (composeIframe && composeIframe.contentDocument) {
		composeIframe.contentDocument.addEventListener('DOMContentLoaded', () => {
			composeIframe.contentDocument.addEventListener('keypress', onKeyPress);
		});
	}
}
