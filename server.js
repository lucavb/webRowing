var express = require('express');
var async = require('async');
var app = express();
var io = require('socket.io').listen(app.listen(8000), {
	"log level" : 1
});

// load both modules for the output
var startlist = require('./startlist.js');
var result = require('./result.js');

// let's serve some static content 
app.use('/', express.static(__dirname + '/static'));

// make / return the index.html file
app.get('/', function(req, res) {
    res.render('static/index.html');
});


console.log('    info    - Listening on port 8000');

// actual stuff

io.sockets.on('connection', function(socket) {
	// stuff from the admin page goes here
	socket.on("push", function(data) {
		console.log("    info    - broadcasting " + data.type);
		if (data.type == "startlist") {
			startlist.getCurrentRace(function(value) {
				socket.broadcast.emit(data.type, value);
			});
			
		}
		else if (data.type == "result") {
			result.getCurrentRace(function(value) {
				socket.broadcast.emit(data.type, value);
			});
		}
	});

	// on requests this code will be executed and either return
	// a requested race or the next one
	socket.on("request", function(data) {
		console.log("    info    - Got the following Request: " + data.type + " for the ID " + data.race_id);
		if (data.type == "result") {
			if (data.race_id == 0) {
				result.getCurrentRace(function(value) {
					socket.emit("request", value);
				});
			}
			else {
				result.getRaceByID(data.race_id, function(value) {
					socket.emit("request", value);
				})
			}
		}
		else if (data.type == "startlist") {
			if (data.race_id == 0) {
				startlist.getCurrentRace(function(value) {
					socket.emit("request", value);
				});
				
			}
			else {
				startlist.getRaceByID(data.race_id, function(value) {
					socket.emit("request", value);
				})
			}
		}
	});
});