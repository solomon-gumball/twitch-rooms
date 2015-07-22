'use strict';

var FamousEngine = require('famous/core/FamousEngine');
var KeyHandler   = require('./app/inputs/KeyHandler');
var AssetLoader  = require('./app/helpers/asset-loader');
var startApp = require('./app/index');

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
	.then(startApp);

