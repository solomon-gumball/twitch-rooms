import Famous from 'famous/core/FamousEngine';
import DOMElement from 'famous/dom-renderables/DOMElement';
import GestureHandler from 'famous/components/GestureHandler';
import Camera from 'famous/components/Camera';
import {Character} from './Character';
import {Player} from './Player';
import {Room} from './Room';
import ChatDialogue from './chat/ChatDialogue';

export default function initialize(collection) {
	var ctx = Famous.createScene('body');
	var socket = io();

	var worldCenterNode = ctx.addChild()
		.setAlign(0.5, 0.5, 0.0)
		.setMountPoint(0.5, 0.5, 0.5)
		.setOrigin(0.5, 0.5, 0.5)
		.setSizeMode(1, 1, 1)
		.setAbsoluteSize(5000, 5000, 5000)
		.setRotation(-Math.PI * 0.2, 0, 0)

	var roomNode = worldCenterNode.addChild()
		.setAlign(0.5, 1.28, 0.5)
		.setMountPoint(0.5, 1, 0.5);

	var room         = new Room(roomNode)
	var chatDialogue = new ChatDialogue('chat', socket);

	var players = [];

	socket.on('initialize-player', function(msg) {

		/*
			Initialize player
		*/

		var playerNode = worldCenterNode.addChild()
			.setMountPoint(0.5, 0, 0.5)
			.setAlign(0.5, 1, 0.5)
			.setProportionalSize(0.03, 0.03, 0.03)
			.setMountPoint(0.5, 1, 0.5)
			.setOrigin(0.5, 0.5, 0.5);

		var player = new Player(playerNode, msg, socket);
			player.on('toggle-chat', () => chatDialogue.toggle());
			player.on('submit-chat', () => {
				socket.emit('chat-entry', {
					ID: player.ID,
					content: chatDialogue.pullValue()
				});
			});

		/*
			Add player to scene
		*/

		var cameraNode = playerNode.addChild()
			.setAlign(0.5, -2.3, 0.9)

		var camera = new Camera(cameraNode);
			camera.setDepth(1000);

		var character;
		socket.on('chat-entry', function(entry) {
			room.chatWindow.addComment(entry);
			if (entry.ID !== player.ID) {
				character = players[entry.ID];
				character.showComment(entry);
			}
		});

		/*
			Add socket listeners
		*/

		socket.on('update-frame', function(msg){
			var i = msg.players.length;
			var characterNode;

			while (i--) {
				var target = msg.players[i];

				/*
					If self, do not update
				*/

				if (target.ID === player.ID) {
					continue;
				}

				/*
					If new entry, create player
				*/

				else if (!players[target.ID]) {
					characterNode = worldCenterNode.addChild()
						.setMountPoint(0.5, 0, 0.5)
						.setAlign(0.5, 1, 0.5)
						.setProportionalSize(0.03, 0.03, 0.03)
						.setMountPoint(0.5, 1, 0.5)
						.setOrigin(0.5, 0.5, 0.5);

					players[target.ID] = new Character(characterNode, target);
				}

				/*
					Update character
				*/


				players[target.ID].receive(msg.players[i]);
			}
		});
	});	
}
