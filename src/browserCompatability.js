export default function testBrowseryCompatability() {

	if (!window.chrome) {
		alert('You are using a browser that is not Chrome! Until I fix the cross-browser issues, please use Chrome for Twitch Roooms.')
	}

	var havePointerLock = 'pointerLockElement' in document ||
	    'mozPointerLockElement' in document ||
	    'webkitPointerLockElement' in document;

	if (!havePointerLock) throw 'PointerLock not supported on your browser!';
}