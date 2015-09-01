export default class ChatLog {
	constructor(selector) {
		this.element = document.querySelector(selector);
		this.comments = [];
		this._maxComments = 10;

		this.state = 0;
	}

	addComment(comment, playerName, playerColor) {
		var commentElement = document.createElement('li');

		commentElement.classList.add('chat-comment');
		commentElement.innerHTML = `<span class="player-name">[${playerName}]</span> ${comment.content}`
		commentElement.style.color = playerColor;

		this.comments.unshift(
			commentElement
		);

		for (var i = 0; i < this.comments.length; i++) {
			if (i > this._maxComments) {
				this.element.removeChild(this.comments[i]);
				this.comments.length = this._maxComments + 1;
				break;
			}
			else {
				this.comments[i].style.bottom = i * 30 + 'px';
			}
		};

		this.element.appendChild(commentElement);
	}

	toggle() {
		return (this.state = !this.state) ? this.show() : this.hide();
	}

	show() {
		this.element.style.display = 'block';
	}

	hide() {
		this.element.style.display = 'none';
	}
}