import {Character} from './Character';
import KeyHandler from './inputs/KeyHandler';
import GestureHandler from 'famous/components/GestureHandler';
import DOMElement from 'famous/dom-renderables/DOMElement';

export class Player extends Character {
	constructor(node, options, socket) {
		super(node, options);

		this.socket = socket;
		this.mobile = true;
		this.name = options.name;
		
		var _this = this;

		KeyHandler.on('UPDATE', function(activeKeys) {
			var changed;

			if (!_this.mobile) return;

			/*
				Handle move
			*/

			if (activeKeys['W']) {
				_this.state.position[2] -= (Math.cos(_this.state.rotation[1]) * Player.VELOCITY);
				_this.state.position[0] -= (Math.sin(_this.state.rotation[1]) * Player.VELOCITY);
				changed = true;
			}
			if (activeKeys['S']) {
				_this.state.position[2] += (Math.cos(_this.state.rotation[1]) * Player.VELOCITY);
				_this.state.position[0] += (Math.sin(_this.state.rotation[1]) * Player.VELOCITY);
				changed = true;
			}
			if (activeKeys['A']) {
				_this.state.position[2] -= (Math.cos(_this.state.rotation[1] + Math.PI / 2) * Player.VELOCITY);
				_this.state.position[0] -= (Math.sin(_this.state.rotation[1] + Math.PI / 2) * Player.VELOCITY);
				changed = true;
			}
			if (activeKeys['D']) {
				_this.state.position[2] -= (Math.cos(_this.state.rotation[1] - Math.PI / 2) * Player.VELOCITY);
				_this.state.position[0] -= (Math.sin(_this.state.rotation[1] - Math.PI / 2) * Player.VELOCITY);
				changed = true;
			}

			/*
				Handle look
			*/

			if (mousePosX < innerWidth * 0.4) {
				_this.state.rotation[1] += Player.TURN_SPEED * scaleX; changed = true;
			}
			else if (mousePosX > innerWidth * 0.6) {
				_this.state.rotation[1] -= Player.TURN_SPEED * scaleX; changed = true;
			}

			if (changed) {
				_this.receive(_this.state);
				_this.socket.emit('update-player', _this.state);
			}
		});

		KeyHandler.on('PRESS:ESC', () => {
			this.toggleMove();
			this.emit('toggle-chat')
		});
		KeyHandler.on('PRESS:ENTER', () => this.emit('submit-chat'));

		var mousePosX = innerWidth * 0.5;
		var mousePosY = innerHeight * 0.5;
		var scaleX = 0;
		var scaleY = 0;
		window.onmousemove = function(e) {
			var changed = false;

			mousePosX = e.x;
			mousePosY = e.y;

			var halfWidth = 0.5 * innerWidth;
			var halfHeight = 0.5 * innerHeight;

			if (mousePosX > halfWidth) {
				scaleX = (mousePosX - halfWidth) / halfWidth * 0.5;
			}
			else if (mousePosX < halfWidth) {
				scaleX = (halfWidth - mousePosX) / halfWidth * 0.5;
			}

			if (mousePosY > halfHeight) {
				scaleY = (mousePosY - halfHeight) / halfHeight;
			}
			else if (mousePosY < halfHeight) {
				scaleY = (halfHeight - mousePosY) / halfHeight;
			}
		}

		this.chatStatus = false;
		this.labelNode.setAbsoluteSize(0, 0, 0);
	}

	toggleMove() {
		this.mobile = !this.mobile;
	}
}

Player.VELOCITY = 9;
Player.TURN_SPEED = 0.10;