import DOMElement from 'famous/dom-renderables/DOMElement';

export default class ChatWindow {
	constructor(node) {
		var element = new DOMElement(node, {
			classes: ['chat-window']
		});

		this.comments = [];
		this.node = node;
		this.scrollNode = this.node.addChild();
	}

	addComment(comment, playerName) {
		var commentNode = this.scrollNode.addChild()
			.setProportionalSize(1, 0.1, 0)
			.setAlign(0, 0.1 * this.comments.length, 0)

		this.comments.push(
			new ChatComment(commentNode, comment, playerName)
		);
	}
}

class ChatComment {
	constructor(node, comment, playerName) {
		this.element = new DOMElement(node, {
			classes: ['chat-comment'],
			content: `<span class="player-name">[${playerName}]</span>: ${comment.content}`
		});
	}
}