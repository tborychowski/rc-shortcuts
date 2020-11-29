const RCM = window.top.rcmail;

const CONDITIONS = {
	isInInput: e => e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT',
	isInEditor: e => !!e.target.closest('#tinymce'),
	hasModifier: e => e.metaKey || e.ctrlKey || e.altKey,
	isModifier: e => e.key === 'Meta' || e.key === 'Alt' || e.key === 'Control',
	hasVisiblePopup: () => (document.querySelector('.ui-dialog,.popover')?.style?.display === 'block') || false,
};

const ACTIONS = {
	goToInbox: (e, mailbox = 'INBOX') => RCM.command('list', mailbox, e.target, e),
	refresh: e => RCM.command('checkmail', '', e.target, e),
	compose: e => RCM.command('compose', '', '', e),
	cancel: e => {
		if (RCM.env.action === 'compose') RCM.command('mail', '', '', e);
		else ACTIONS.goToInbox(e, RCM.env.mailbox);
	},
	del: e => RCM.command('delete', '', '', e),
	edit: e => {
		const mode = RCM.env.mailbox == RCM.env.drafts_mailbox ? '' : 'new';
		return RCM.command('edit', mode, e.target, e);
	},
	focusSearch: () => {
		const searchField = window.top.document.querySelector('#mailsearchform');
		searchField && searchField.focus();
	},
	nextMessage: e => {
		if (RCM.message_list) {
			if (!RCM.message_list.selection.length) RCM.message_list.select_first();
			else RCM.message_list.select_next();
		}
		else RCM.command('nextmessage', '', '', e);
	},
	prevMessage: e => {
		if (RCM.message_list) {
			if (!RCM.message_list.selection.length) RCM.message_list.select_last();
			else RCM.message_list.use_arrow_key(38, false);
		}
		else RCM.command('previousmessage', '', '', e);
	},
	reply: e => RCM.command('reply', '', e.target, e),
	replyAll: e => RCM.command('reply-all', 'sub', e.target, e),
	forward: e => RCM.command('forward', '', e.target, e),
	send: e => {
		e.stopPropagation();
		RCM.command('send', '', '', e);
	},
};

const shortcutsMap = {
	inbox      : { key: 'i', action: ACTIONS.goToInbox },
	refresh    : { key: 'u', action: ACTIONS.refresh },
	compose    : { key: 'n', action: ACTIONS.compose },
	cancel     : { key: 'c', ctrl: true, action: ACTIONS.cancel },
	del        : { key: '#', action: ACTIONS.del },
	edit       : { key: 'e', action: ACTIONS.edit },
	searchFocus: { key: 's', action: ACTIONS.focusSearch },
	next       : { key: 'j', action: ACTIONS.nextMessage },
	prev       : { key: 'k', action: ACTIONS.prevMessage },
	reply      : { key: 'r', action: ACTIONS.reply },
	replyall   : { key: 'a', action: ACTIONS.replyAll },
	forward    : { key: 'f', action: ACTIONS.forward },
	send       : { key: 'Enter', meta: true,
		condition: () => RCM.env.action === 'compose',
		action: ACTIONS.send
	}
};



function onKey (e) {
	const isInEditor = CONDITIONS.isInEditor(e);
	const isInInput = CONDITIONS.isInInput(e);
	const hasModifier = CONDITIONS.hasModifier(e);

	// Ignore modifiers only
	if (CONDITIONS.isModifier(e)) return true;

	// Don't shadow single letter shortcuts in input or editor
	if ((isInInput || isInEditor) && !hasModifier) return true;

	// Ignore when popup is open
	if (CONDITIONS.hasVisiblePopup()) return true;

	for (const [, handler] of Object.entries(shortcutsMap)) {
		const key = e.key === handler.key &&
			(!!handler.meta === e.metaKey) &&
			(!!handler.alt === e.altKey) &&
			(!!handler.ctrl === e.ctrlKey);
		const condition = (typeof handler.condition === 'function') ? handler.condition(e) : true;

		if (key && condition) {
			e.preventDefault();
			handler.action(e);
			return false;
		}
	}
	return true;
}


function initEvents () {
	document.addEventListener('keydown', onKey);
	setTimeout(() => {
		const composeFrame = document.getElementById('composebody_ifr');
		const composeDoc = composeFrame && composeFrame.contentDocument;
		if (composeDoc) composeDoc.addEventListener('keydown', onKey);

		const msgFrame = document.getElementById('messagecontframe');
		const msgDoc = msgFrame && msgFrame.contentDocument;
		if (msgDoc) msgDoc.addEventListener('keydown', onKey);
	}, 1000);
}


if (window.rcmail) document.addEventListener('DOMContentLoaded', initEvents);
