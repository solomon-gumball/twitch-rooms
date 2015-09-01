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
		var player = {
			position: [0, 0, 0],
			rotation: [0, 0],
			name: playerName,
			ID: playerID,
			color: randomColor()
		};

		room.players.push(player);
		socket.join(roomID);

		socket.emit('initialize-player', {
			player: player,
			stream: room.streamName
		});

		socket.on('update-player', function(msg) {
			player.position = msg.position;
			player.rotation = msg.rotation;
		});

		socket.on('chat-entry', function(entry) {
			_this.io.emit('chat-entry', entry);
		});

		socket.on('disconnect', function() {
			var i = room.players.indexOf(player);
			var removed = room.players.splice(i, 1)[0];

			_this.io.emit('remove-player', removed);
		});
	});

	// Update every 16ms (60fps)

	setInterval(this.updateAll.bind(this), 16);
}

RoomsManager.prototype.getRandomRoomID = function getRandomRoomID () {
	var roomID;

	if (this._rooms.length === 0) {
		roomID = this.addRoom('gsl');
	}
	else {
		roomID = Math.floor(Math.random() * this._rooms.length);
	}

	return roomID;
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
}

var colors = [
	'pink',
	'lightblue',
	'lightgreen',
	'palevioletred',
	'palegoldenrod',
	'skyblue',
	'tomato',
	'turquoise',
	'violet',
	'mistyrose',
	'lightsteelblue',
	'lemonchiffon',
	'aquamarine'
];

function randomColor() {
	return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = RoomsManager;