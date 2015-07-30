var socketIO = require('socket.io');

function RoomsManager(http) {
	this._rooms = [];

	this.io = socketIO(http);

	/*
		New player event
	*/

	var _this = this;
	this.io.on('connection', function(socket) {
		var requestData = socket.request;
		var roomID = requestData._query['roomID'];
		var playerName = requestData._query['playerName'];

		var room = _this._rooms[roomID];
		var playerID = room.players.length;

		room.players[playerID] = {
			position: [0, 0, 0],
			rotation: [0, 0],
			name: playerName,
			ID: playerID
		}

		socket.join(roomID);

		socket.emit('initialize-player', { player: room.players[playerID], stream: room.streamName });

		socket.on('update-player', function(msg) {
			room.players[playerID].position = msg.position;
			room.players[playerID].rotation = msg.rotation;
		});

		socket.on('chat-entry', function(entry) {
			_this.io.emit('chat-entry', entry);
		});
	});

	// Update every 16ms (60fps)

	setInterval(this.updateAll.bind(this), 16);
}

RoomsManager.prototype.addRoom = function addRoom (streamName) {
	this._rooms.push({
		streamName: streamName,
		duration: 0,
		players: []
	});

	var roomNumber = this._rooms.length - 1;

	return roomNumber;
}

RoomsManager.prototype.updateAll = function updateAll() {
	for (var i = 0, len = this._rooms.length; i < len; i++) {
		this.io.to(i).emit('update-frame', this._rooms[i].players);
	}

	// this.io.emit('update-frame', this._rooms[0]);
}

module.exports = RoomsManager;