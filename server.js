// import
var express = require('express');
var app = express();
var io = require('socket.io').listen(app.listen(8000), {
	"log level" : 1
});

// load perp module for the output
var perp = require('./perp.js');

// load news module for news
var news = require("./news.js");

// load admin module
var admin = require("./admin.js");

// let's serve some static content 
app.use('/', express.static(__dirname + '/static'));

// make / return the index.html file
app.get('/', function(req, res) {
    res.render('static/index.html');
});

/*
 *
 * REST API
 *
 */

app.get("/races", function(req, res) {
	console.log("    info    - REST races");
	perp.getAllRaces(function(callback) {
		var back = {
			"races" : callback
		}
		res.send(back);
	});
});

app.get("/startlists", function(req, res) {
	console.log("    info    - REST startlists");
	perp.getAllSections(function(callback) {
		res.send({"startlists" : callback });
	});
});

app.get("/startlists/:id", function(req, res) {
	console.log("    info    - REST startlist " + req.params.id);
	switch (req.params.id) {
		case "0":
			perp.getCurrentRace("startlist", function(callback) {
				callback.id = callback.general.Rennen;
				res.send({ "startlists" : callback});
			});
			break;
		default :
			perp.getRaceByID("startlist", req.params.id, function(callback) {
				callback.id = callback.general.Rennen;
				res.send({ "startlists" : callback});
			});
	}
});

app.get("/results/:id", function(req, res) {
	console.log("    info    - REST result " + req.params.id);
	switch (req.params.id) {
		case "0":
			perp.getCurrentRace("result", function(callback) {
				callback.id = callback.general.Rennen;
				res.send({ "results" : callback});
			});
			break;
		default :
			perp.getRaceByID("result", req.params.id, function(callback) {
				callback.id = callback.general.Rennen;
				res.send({ "results" : callback});
			});
	}
});

console.log('    info    - Express listening on port 8000');

/**
 *
 * Socket.io
 *
 */

// actual stuff
io.sockets.on('connection', function(socket) {
	// output when a socket connects
	var address = socket.handshake.address;
	console.log("    info    - New connection from " + address.address + ":" + address.port);

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

	// news stuff. new one comes in -> add it -> broadcast all
	socket.on("broadtcastNews", function (data) {
		// first validate it
		if (news.validate(data)) {
			news.addNews(data);
			// print them all
			socket.broadcast.emit("news", news.getAllNews());
		}
	});

	// update the visibility of a race
	socket.on("publishResult", function (data) {
		admin.setState(data);
	});

	socket.on("sections", function (data) {
		perp.getAllSections(function(callback) {
			socket.emit("sections", callback);
		});
	});

	// on requests this code will be executed and either return
	// a requested race or the next one
	socket.on("request", function(data) {
		console.log("    info    - Request: " + data.type + " for the ID " + data.race_id);
		if (data.type == "resultDetail") {
			data.type = "result";
		}
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