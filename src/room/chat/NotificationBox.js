import KeyHandler from '../inputs/KeyHandler';

export default function NotificationBox(selector) {
	this.element = document.querySelector(selector);

	this.clickEl = document.querySelector('.famous-dom-renderer');
	var firstClick = false;

	this.setContent('Click to enable FPS controls!');

	this.clickEl.addEventListener('click', () => {
		if (!firstClick) {
			this.setContent('Press ALT to toggle chat and WASD to move around!');
			firstClick = true;
		}
	});

	KeyHandler.on('PRESS:ALT', () => this.element.style.display = 'none');
}

NotificationBox.prototype.setContent = function setContent(content) {
	this.element.innerText = content;
}

