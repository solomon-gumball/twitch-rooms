import EventEmitter from '../base/event-emitter';

export default class ChatDialogue extends EventEmitter {
	constructor(id, socket) {
		this.element = document.getElementById(id);
		this.inputEl = this.element.querySelector('input');
		this.tagElement = this.element.querySelector('#player-name');
		this.socket = socket;

		this.tagElement.innerText = '[redwoodfavorite]: ';
		this.state = true;
		this.toggle();
	}

	toggle() {
		return (this.state = !this.state) ? this.show() : this.hide();
	}

	hide() {
		this.element.style.display = 'none';
	}

	pullValue() {
		var value = this.inputEl.value;
		this.inputEl.value = '';
		return value;
	}

	show() {
		this.element.style.display = 'block';
		this.inputEl.focus();
	}
}