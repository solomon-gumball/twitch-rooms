import { Character } from './Character';
import KeyHandler from './inputs/KeyHandler';
import GestureHandler from 'famous/components/GestureHandler';
import DOMElement from 'famous/dom-renderables/DOMElement';

export class Player extends Character {
	constructor(node, node2, options, socket) {
		options.isPlayer = true;

		super(node, options);

		this.socket = socket;
		this.mobile = true;

		this.rotation = [0, 0, 0];
		this.boundingBox = {
			x: [-1650, 1650],
			z: [-2550, 1300]
		};

		var element = document.querySelector('.famous-dom-renderer');
		var first = false;

		if (havePointerLock) {
			element.addEventListener('click', function() {
				element.requestPointerLock();
			});
			element.requestPointerLock = element.requestPointerLock ||
			     element.mozRequestPointerLock ||
			     element.webkitRequestPointerLock;
			element.requestPointerLock();
			element.addEventListener('mousemove', moveCallback);
		}
		
		// Ask the browser to lock the pointer


		var _this = this;
		var changed;

		function moveCallback(e) {
			var movementX = e.movementX ||
				e.mozMovementX          ||
				e.webkitMovementX       ||
				0,
			movementY = e.movementY ||
				e.mozMovementY      ||
				e.webkitMovementY   ||
				0;

			if (movementX) {
				_this.state.rotation[1] -= Player.TURN_SPEED * movementX;
				changed = true;
			}

			if (movementY) {
				_this.rotation[0] += Player.TURN_SPEED * movementY;
			}
		}

		var updatedPosition = [];
		KeyHandler.on('UPDATE', function(activeKeys) {
			updatedPosition[0] = _this.state.position[0];
			updatedPosition[2] = _this.state.position[2];

			if (!_this.mobile) return;

			/*
				Handle move
			*/

			if (activeKeys['W']) {
				updatedPosition[2] -= (Math.cos(_this.state.rotation[1]) * Player.VELOCITY);
				updatedPosition[0] -= (Math.sin(_this.state.rotation[1]) * Player.VELOCITY);
				changed = true;
			}
			if (activeKeys['S']) {
				updatedPosition[2] += (Math.cos(_this.state.rotation[1]) * Player.VELOCITY);
				updatedPosition[0] += (Math.sin(_this.state.rotation[1]) * Player.VELOCITY);
				changed = true;
			}
			if (activeKeys['A']) {
				updatedPosition[2] -= (Math.cos(_this.state.rotation[1] + Math.PI / 2) * Player.VELOCITY);
				updatedPosition[0] -= (Math.sin(_this.state.rotation[1] + Math.PI / 2) * Player.VELOCITY);
				changed = true;
			}
			if (activeKeys['D']) {
				updatedPosition[2] -= (Math.cos(_this.state.rotation[1] - Math.PI / 2) * Player.VELOCITY);
				updatedPosition[0] -= (Math.sin(_this.state.rotation[1] - Math.PI / 2) * Player.VELOCITY);
				changed = true;
			}

			if (changed) {
				changed = _this.applyBoundaries(
					updatedPosition,
					_this.state.position
				);
			}

			/*
				Handle look
			*/

			if (changed) {
				_this.receive(_this.state);
				_this.socket.emit('update-player', _this.state);

				node2.setRotation(
					_this.rotation[0],
					_this.rotation[1],
					_this.rotation[2]
				)
			}

			changed = false;
		});

		KeyHandler.on('PRESS:ALT', e => {
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
	}

	applyBoundaries(newPos, currentPos) {
		var changed = false;

		if (newPos[0] > this.boundingBox.x[0] && newPos[0] < this.boundingBox.x[1])
			currentPos[0] = newPos[0], changed = true;

		if (newPos[2] > this.boundingBox.z[0] && newPos[2] < this.boundingBox.z[1])
			currentPos[2] = newPos[2], changed = true;

		return changed;
	}

	toggleMove() {
		this.mobile = !this.mobile;
	}
}

Player.VELOCITY = 9;
Player.TURN_SPEED = 0.002;