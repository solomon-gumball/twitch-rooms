import EventEmitter from '../base/event-emitter';

export default class ChatDialogue extends EventEmitter {
	constructor(id, playerName, playerColor, socket) {
		super();
		
		this.element = document.getElementById(id);
		this.inputEl = this.element.querySelector('#chat-new input');
		this.tagElement = this.element.querySelector('#player-name');
		this.socket = socket;

		this.inputEl.onfocus = function(e) {
			e.preventDefault();
			e.stopPropagation();
		}

		this.tagElement.innerText = '[' + playerName + ']: ';
		this.tagElement.style.color = playerColor;
		
		this.state = true;
		this.toggle();
	}

	toggle() {
		return (this.state = !this.state) ? this.show() : this.hide();
	}

	hide() {
		this.element.style.visibility = 'hidden';
	}

	pullValue() {
		var value = this.inputEl.value;
		this.inputEl.value = '';
		return value;
	}

	show() {
		this.element.style.visibility = 'visible';
		this.inputEl.focus();
	}
}