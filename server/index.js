var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var RoomsManager = require('./socket/RoomsManager');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

http.listen(3000, function(){
	console.log('Port 3000 BITCH');
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
	Local modules
*/
