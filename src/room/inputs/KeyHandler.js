import {KEY_MAP} from './keymap';
var KeyHandler = {};

KeyHandler.init = function init() {
	this._activeKeys = {};
	this._handlers = {};
	this._updateFns = [];

	this.EVENTTYPES = {
		'PRESS' : {}
	}

	this.boundKeyDown = registerKeyDown.bind(this);
	this.boundKeyUp = registerKeyUp.bind(this);

	document.addEventListener('keydown', this.boundKeyDown);
	document.addEventListener('keyup', this.boundKeyUp);
}

KeyHandler.update = function update() {
	var handlers;
	var handlersLength;
	var updatesLength = this._updateFns.length;
	var i;
	
	for(var key in this._activeKeys){
		if(this._activeKeys[key] === true){
			handlers = this._handlers[key];
			if(handlers) {
				handlersLength = handlers.length;
				for (i = 0; i < handlersLength; i++) {
					handlers[i]();
				}
			}
		}
	}

	for (var i = 0; i < updatesLength; i++) {
		this._updateFns[i](this._activeKeys);
	}
}

KeyHandler.on = function on(eventName, callback) {
	eventName = eventName.toUpperCase();
	if( eventName.indexOf(':') !== -1 ) {
		var eventName = eventName.split(':');
		var type = eventName[0];
		var key = eventName[1];
		var storage = this.EVENTTYPES[type];
		if( !storage ) throw "invalid eventType";
		if( !storage[key] ) storage[key] = [];
		storage[key].push(callback);
	}
	else if( KEY_MAP.letters[eventName] ) {
		if(!this._handlers[eventName]) this._handlers[eventName] = [];
		this._handlers[eventName].push(callback);
	}
	else if (eventName === "UPDATE") {
		this._updateFns.push(callback);
	}
	else throw "invalid eventName";
}

KeyHandler.off = function off(key, callback) {
	var callbackIndex;
	var callbacks;

	if(this._handlers[key]) {
		callbacks = this._handlers[key];
		callbackIndex = callbacks.indexOf(callback);
		if(callbackIndex !== -1) {
			callbacks.splice(callbackIndex, 1);
			if(!callbacks.length) {
				delete this._handlers[key];
				delete this._activeKeys[key];
			}
		}
	}
}

function registerKeyDown(event) {
	var keyName = KEY_MAP.keys[event.keyCode];
	if (keyName && !this._activeKeys[keyName]) {
		this._activeKeys[keyName] = true;
		var pressEvents = this.EVENTTYPES.PRESS[keyName];
		if (pressEvents) {
			for (var i = 0; i < pressEvents.length; i++) {
				pressEvents[i](event);
			}
		}
	}
}

function registerKeyUp(event) {
	var keyName = KEY_MAP.keys[event.keyCode];
	if (keyName) this._activeKeys[keyName] = false;	
}

module.exports = KeyHandler;