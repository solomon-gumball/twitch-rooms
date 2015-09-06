export default function testBrowseryCompatability() {

	var isChrome = !!window.chrome;
	var isFirefox = typeof InstallTrigger !== 'undefined';

	if (!isChrome && !isFirefox) {
		alert('You are using a browser that is not Chrome or Firefox! Until I fix the cross-browser issues, please use either of these browsers for Twitch Roooms.')
	}

	window.havePointerLock = 'pointerLockElement' in document ||
	    'mozPointerLockElement' in document ||
	    'webkitPointerLockElement' in document;

	if (!havePointerLock) console.warn('PointerLock not supported on your browser!');
}