<?php

class RCShortcuts extends rcube_plugin	{

	// all task except login and logout
	public $task = '?(?!login|logout).*';

	// no ajax handlers
	public $noajax = true;

	function init() {
		$this->include_script('rc-shortcuts.js');
	}
}
