'use strict';

var FamousEngine = require('famous/core/FamousEngine');
var KeyHandler   = require('./room/inputs/KeyHandler');
var AssetLoader  = require('./room/helpers/asset-loader');
var startApp = require('./room/index');
var handleLogin = require('./login/main')

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
			'obj/room2.obj',
			'obj/character2.obj',
			'obj/character.json'
		]
	}
)
	// .then(startApp);

