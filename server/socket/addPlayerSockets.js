function addPlayerSockets(http) {
	var io = require('socket.io')(http);

	/*
		Game Data
	*/

	var playerID = 0;

	var data = {
		duration: 0,
		players: []
	};

	/*
		New player event
	*/

	io.on('connection', function(socket) {
		var ID = playerID++;

		data.players[ID] = {
			position: [0, 0, 0],
			rotation: [0, 0],
			ID: ID
		}

		socket.emit('initialize-player', data.players[ID]);

		socket.on('update-player', function(msg) {
			data.players[ID].position = msg.position;
			data.players[ID].rotation = msg.rotation;
		});

		socket.on('chat-entry', function(entry) {
			io.emit('chat-entry', entry);
		});
	});


	/*
		Update frame events
	*/

	setInterval(function() {
		io.emit('update-frame', data);
	}, 16)
}

module.exports = addPlayerSockets;