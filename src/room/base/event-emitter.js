export default class EventEmitter {
	constructor() {
		this.eventHash = {};
	}

	on(eventName, callback) {
		if (!this.eventHash[eventName]) this.eventHash[eventName] = [];

		this.eventHash[eventName].push(callback);
	}

	emit(eventName, payload) {
		for (var i = 0, len = this.eventHash[eventName].length; i < len; i++) {
			this.eventHash[eventName][i](payload);
		}
	}
}