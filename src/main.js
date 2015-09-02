'use strict';

var FamousEngine = require('famous/core/FamousEngine');
var KeyHandler   = require('./room/inputs/KeyHandler');
var AssetLoader  = require('./room/helpers/asset-loader');
var startApp = require('./room/index');
var handleLogin = require('./login/main');
var testBrowserCompatability = require('./browserCompatability');

testBrowserCompatability();

/*
	Famo.us boilerplate
*/

KeyHandler.init();
FamousEngine.init();

var updater = {
	onUpdate: onUpdate
}

FamousEngine.requestUpdateOnNextTick(updater);

function onUpdate () {

	// Update systems

	KeyHandler.update();

	FamousEngine.requestUpdateOnNextTick(updater);
}

handleLogin()
	.then(startApp);

/*
	Require application code
*/

AssetLoader.load(
	{
		fromURL: [
			'obj/room-walls-model.json',
			'obj/room-floor-model.json',
			'obj/room-screen-model.json',
			'obj/character-new.json',
		]
	}
)
	// .then(startApp);

