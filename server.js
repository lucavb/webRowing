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

app.get("/news", function(req, res) {
	console.log("    info    - REST news");
	// json parse is necessary since it will not be recognized by ember otherwise
	var back = {
		"news" : JSON.parse(news.getAllNews())
	}
	res.send(back);
});

app.get("/races", function(req, res) {
	console.log("    info    - REST races");
	perp.getAllRaces(function(callback) {
		var back = {
			"races" : callback
		}
		res.send(back);
	});
});

app.get("/sections", function(req, res) {
	console.log("    info    - REST sections");
	perp.getAllSections(function(callback) {
		res.send({"sections" : callback });
	});
});

app.get("/startlists/:id", function(req, res) {
	console.log("    info    - REST startlist " + req.params.id);
	switch (req.params.id) {
		case "0":
			perp.getCurrentRace("startlist", function(callback) {
				res.send({ "startlists" : callback});
			});
			break;
		default :
			perp.getRaceByID("startlist", req.params.id, function(callback) {
				res.send({ "startlists" : callback});
			});
	}
});

app.get("/results/:id", function(req, res) {
	console.log("    info    - REST result " + req.params.id);
	switch (req.params.id) {
		case "0":
			perp.getCurrentRace("result", function(callback) {
				res.send({ "results" : callback});
			});
			break;
		default :
			perp.getRaceByID("result", req.params.id, function(callback) {
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
	console.log("    info    - New connection from " + socket.request.socket.remoteAddress + ":" + socket.request.socket.remotePort);

	// stuff from the admin page goes here
	socket.on("push", function(data) {
		
		if (data.type == "news") {
			socket.broadcast.emit("news", news.getAllNews());
			console.log("    info    - broadcasting news");
			return;
		}
		else if (data.type == "section") {
			perp.getAllSections(function(value) {
				var back = {
					"model" : data.type,
					"payload" : value,
					"clear" : true,
					"many" : true
				}
				console.log("    info    - broadcasting " + data.type);
				socket.broadcast.emit("update", back);
			});
		}
		else if (data.type == "race") {
			perp.getAllRaces(function(value) {
				var back = {
					"model" : data.type,
					"payload" : value,
					"clear" : true,
					"many" : true
				}
				console.log("    info    - broadcasting " + data.type);
				socket.broadcast.emit("update", back);
			});

		}
		else {
			switch(data.race) {
				case "0" : 
					perp.getCurrentRace(data.type, function(value) {
						console.log("    info    - broadcasting " + data.type + " " + data.race + " ---> " + value.id);
						var back = {
							"model" : data.type,
							"payload" : value
						}
						socket.broadcast.emit("update", back);
					});
					break;
				default: 
					perp.getRaceByID(data.type, data.race, function(value) {
						console.log("    info    - broadcasting " + data.type + " " + value.id);
						var back = {
							"model" : data.type,
							"payload" : value
						}
						socket.broadcast.emit("update", back);
					});
			}
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
});
