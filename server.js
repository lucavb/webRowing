var express = require('express');
var app = express();
var io = require('socket.io').listen(app.listen(8000), {
	"log level" : 1
});

// load perp module for the output
var perp = require('./perp.js');

// load news module for news
var news = require("./news.js");

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
			perp.getCurrentRace("startlist", function(value) {
				socket.broadcast.emit(data.type, value);
			});
			
		}
		else if (data.type == "result") {
			perp.getCurrentRace("result", function(value) {
				socket.broadcast.emit(data.type, value);
			});
		}
		else if (data.type == "news") {
			socket.broadcast.emit("news", news.getAllNews());
		}
	});

	socket.on("broadtcastNews", function (data) {
		// first validate it
		if (news.validate(data)) {
			news.addNews(data);
			// print them all
			socket.broadcast.emit("news", news.getAllNews());
		}
	});

	// on requests this code will be executed and either return
	// a requested race or the next one
	socket.on("request", function(data) {
		console.log("    info    - Got the following Request: " + data.type + " for the ID " + data.race_id);
		if (data.type == "result") {
			if (data.race_id == 0) {
				perp.getCurrentRace("result", function(value) {
					socket.emit("request", value);
				});
			}
			else {
				perp.getRaceByID("result", data.race_id, function(value) {
					socket.emit("request", value);
				})
			}
		}
		else if (data.type == "startlist") {
			if (data.race_id == 0) {
				perp.getCurrentRace("startlist", function(value) {
					socket.emit("request", value);
				});
				
			}
			else {
				perp.getRaceByID("startlist", data.race_id, function(value) {
					socket.emit("request", value);
				})
			}
		}
		else if (data.type == "news") {
			socket.emit("news", news.getAllNews());
		}
	});
});