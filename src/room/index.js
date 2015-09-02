import Famous from 'famous/core/FamousEngine';
import DOMElement from 'famous/dom-renderables/DOMElement';
import GestureHandler from 'famous/components/GestureHandler';
import Camera from 'famous/components/Camera';
import {Character} from './Character';
import {Player} from './Player';
import {Room} from './Room';
import ChatDialogue from './chat/ChatDialogue';
import ChatLog from './chat/ChatLog';
import NotificationBox from './chat/NotificationBox';

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

	var playersLocal = [];

	socket.on('initialize-player', function(msg) {
		var notificationBox = new NotificationBox('#help');
		var chatDialogue = new ChatDialogue('chat-new', msg.player.name, msg.player.color, socket);
		var chatLog = new ChatLog('#chat-log');

		/*
			Initialize player
		*/

		room.screen.setTwitchStream(msg.stream);

		var playerNode = worldCenterNode.addChild()
			.setAlign(0.5, 1, 0.7)
			.setProportionalSize(0.02, 0.02, 0.02)
			.setMountPoint(0.5, -0.9, 0.5)
			.setOrigin(0.5, 0.5, 0.5);

		var playerNode2 = playerNode.addChild()
			.setOrigin(0.5, 0.5, 0.5)
			.setAlign(0.5, 0.5, 0.5)
			.setMountPoint(0.5, 0.5, 0.5)

		var player = new Player(playerNode, playerNode2, msg.player, socket);
			player.on('toggle-chat', () => {
				chatDialogue.toggle();
				chatLog.toggle();
			});
			player.on('submit-chat', () => {
				socket.emit('chat-entry', {
					ID: player.ID,
					content: chatDialogue.pullValue()
				});	
			});

		playersLocal[player.ID] = player;

		/*
			Add player to scene
		*/

		var cameraNode = playerNode2.addChild()
			.setAlign(0.5, -2.3, 0.9)

		var camera = new Camera(cameraNode);
			camera.setDepth(1000);

		var character;
		socket.on('chat-entry', function(entry) {
			character = playersLocal[entry.ID];

			if (entry.ID !== player.ID) {
				character.showComment(entry);
			}

			chatLog.addComment(entry, character.name, character.color);
		});

		socket.on('remove-player', function(message) {
			var removed = playersLocal[message.ID].node;
			worldCenterNode.removeChild(removed);
			playersLocal[message.ID] = null;
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
						.setAlign(0.5, 1, 0.7)
						.setProportionalSize(0.02, 0.02, 0.02)
						.setMountPoint(0.5, -0.9, 0.5)
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
