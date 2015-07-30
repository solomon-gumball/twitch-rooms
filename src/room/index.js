import Famous from 'famous/core/FamousEngine';
import DOMElement from 'famous/dom-renderables/DOMElement';
import GestureHandler from 'famous/components/GestureHandler';
import Camera from 'famous/components/Camera';
import {Character} from './Character';
import {Player} from './Player';
import {Room} from './Room';
import ChatDialogue from './chat/ChatDialogue';

export default function initialize(options) {
	var ctx = Famous.createScene('body');
	var socket = io.connect(undefined, { query: `roomID=${options.roomID}&playerName=${options.playerName}` });

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

	var playersLocal = [];

	socket.on('initialize-player', function(msg) {

		/*
			Initialize player
		*/

		room.screen.setTwitchStream(msg.stream);

		var playerNode = worldCenterNode.addChild()
			.setMountPoint(0.5, 0, 0.5)
			.setAlign(0.5, 1, 0.5)
			.setProportionalSize(0.03, 0.03, 0.03)
			.setMountPoint(0.5, 1, 0.5)
			.setOrigin(0.5, 0.5, 0.5);

		var player = new Player(playerNode, msg.player, socket);
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

		socket.on('update-frame', function(players){
			var i = players.length;
			var characterNode;

			while (i--) {
				var target = players[i];

				/*
					If self, do not update
				*/

				if (target.ID === player.ID) {
					continue;
				}

				/*
					If new entry, create player
				*/

				else if (!playersLocal[target.ID]) {
					characterNode = worldCenterNode.addChild()
						.setMountPoint(0.5, 0, 0.5)
						.setAlign(0.5, 1, 0.5)
						.setProportionalSize(0.03, 0.03, 0.03)
						.setMountPoint(0.5, 1, 0.5)
						.setOrigin(0.5, 0.5, 0.5);

					playersLocal[target.ID] = new Character(characterNode, target);
				}

				/*
					Update character
				*/


				playersLocal[target.ID].receive(players[i]);
			}
		});
	});	
}
