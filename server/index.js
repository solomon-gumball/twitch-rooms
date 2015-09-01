var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var RoomsManager = require('./socket/RoomsManager');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

http.listen(process.env.PORT || 3000, function(){
	console.log('NOW SERVING');
});

/*
	Class to create and retreive rooms
*/

var roomsManager = new RoomsManager(http);

/*
	Handle room creation
*/

app.post('/create', function(req, res) {
	var playerName = req.body.playerName;
	var streamName = req.body.streamName;

	var roomID = roomsManager.addRoom(streamName);

	res.send({ roomID: roomID });
});

/*
	Handle room joining
*/

app.post('/join', function(req, res) {
	var roomID = req.body.roomID;

	if (roomsManager._rooms[roomID]) {

		// room exists

		res.send({ roomID: roomID });
	}
	else {

		// room does not exist

		res.status(400)
			.send('Room number ' + roomID + ' does not exist! Try creating a new room!');
	}

});

/*
	Get random room
*/

app.get('/random', function(req, res) {
	var roomID = roomsManager.getRandomRoomID();

	res.send({ roomID: roomID });
});