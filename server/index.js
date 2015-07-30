var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static('public'));

http.listen(3000, function(){
	console.log('Port 3000 BITCH');
});

app.post('/create', function(req, res) {
	console.log(req, res)
});

/*
	Local modules
*/

var addPlayerSockets = require('./socket/addPlayerSockets');
	addPlayerSockets(http);