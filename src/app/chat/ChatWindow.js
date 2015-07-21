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

	addComment(comment) {
		var commentNode = this.scrollNode.addChild()
			.setProportionalSize(1, 0.1, 0)
			.setAlign(0, 0.1 * this.comments.length, 0)

		this.comments.push(
			new ChatComment(commentNode, comment)
		);
	}
}

class ChatComment {
	constructor(node, comment) {
		this.element = new DOMElement(node, {
			classes: ['chat-comment'],
			content: `<span class="player-name">[${comment.player}]</span>: ${comment.content}`
		});
	}
}