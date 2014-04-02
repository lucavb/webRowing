var express = require('express');
var async = require('async');
var app = express();
var io = require('socket.io').listen(app.listen(8000), {
	"log level" : 2
});

var startlist = require('./startlist.js');
 
app.use('/', express.static(__dirname + '/static'));
 
app.get('/', function(req, res) {
    res.render('static/index.html');
});

app.get("/startlists/", function(request, response) {
	
});

app.get("/startlists/:id", function(request, response) {

});

console.log('Listening on port 8000');

// actual stuff

io.sockets.on('connection', function(socket) {
	socket.on("push", function(data) {
		console.log("broadcasting " + data.type);
		if (data.type == "startlist") {
			startlist.getCurrentRace(function(value) {
				socket.broadcast.emit(data.type, value);
			});
			
		}
		else if (data.type == "result") {
			socket.broadcast.emit(data.type, result_example);
		}
	});

	// on requests this code will be executed and either return
	// a requested race or the next one
	socket.on("request", function(data) {
		if (data.type == "result") {
			if (data.race_id == 0) {
				socket.emit("request", result_example);
			}
			else {
				socket.emit("request", result_example);
			}
		}
		else if (data.type == "startlist") {
			if (data.race_id == 0) {
				startlist.getCurrentRace(function(value) {
					socket.emit("request", value);
				});
				
			}
			else {
				socket.emit("request", startlist_example);
			}
		}
	});

	/*
	socket.emit("news", { hello : 'world' });
	socket.on('abc event', function (data) {
	    console.log("\t" + data.my);
	});
	*/
});

var result_example = JSON.parse('{"general":{"name":"Junioren-Zweier ohne Steuermann A","nameE":"","anzahl_ruderer":54,"anzahl_abteilungen":9,"bootsklasse":"JM 2- A","rennen_id":12,"distanz":"2000 m","typ":"ergebniss"},"abteilungen":{"V1":{"general":{"Rennen":"12","Lauf":"V1","SollStartZeit":"2013-06-20 15:40:00","NameD":"Junioren-Zweier ohne Steuermann A","ZielMesspunktNr":"4"},"boote":[{"Bahn":"3","BugNr":"3","Teamname":"Rgm\u00a0RV\u00a0Wandsbek\u00a0\/ RC\u00a0Favorite\u00a0Hammonia","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"6:50,35","Ausgeschieden":"0","Kommentar":""},{"Bahn":"5","BugNr":"5","Teamname":"RC\u00a0N\u00fcrtingen","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"6:53,00","Ausgeschieden":"0","Kommentar":""},{"Bahn":"2","BugNr":"2","Teamname":"SC\u00a0Magdeburg","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:03,95","Ausgeschieden":"0","Kommentar":""},{"Bahn":"1","BugNr":"1","Teamname":"Rgm\u00a0Ratzeburger\u00a0RC\u00a0\/ Domschulruderclub\u00a0Schleswig","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:07,20","Ausgeschieden":"0","Kommentar":""},{"Bahn":"4","BugNr":"4","Teamname":"Rgm\u00a0Dresdner\u00a0RC\u00a0\/ Pirnaer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:08,60","Ausgeschieden":"0","Kommentar":""},{"Bahn":"6","BugNr":"6","Teamname":"RV\u00a0M\u00fcnster","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:15,75","Ausgeschieden":"0","Kommentar":""}]},"V2":{"general":{"Rennen":"12","Lauf":"V2","SollStartZeit":"2013-06-20 15:45:00","NameD":"Junioren-Zweier ohne Steuermann A","ZielMesspunktNr":"4"},"boote":[{"Bahn":"2","BugNr":"8","Teamname":"Rgm\u00a0RK\u00a0am\u00a0Baldeneysee\u00a0\/ Renn-Rugm.\u00a0M\u00fclheim","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:01,20","Ausgeschieden":"0","Kommentar":""},{"Bahn":"4","BugNr":"10","Teamname":"RC\u00a0Potsdam","Abgemeldet":"1","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:02,30","Ausgeschieden":"0","Kommentar":""},{"Bahn":"6","BugNr":"13","Teamname":"Hallesche-Rvg.\u00a0B\u00f6llberg\u00a0u.\u00a0Nelson","Abgemeldet":"1","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:04,05","Ausgeschieden":"0","Kommentar":""},{"Bahn":"5","BugNr":"12","Teamname":"Rgm\u00a0RV\u00a0M\u00fcnster\u00a0\/ RC\u00a0Germania\u00a0D\u00fcsseldorf","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:07,35","Ausgeschieden":"0","Kommentar":""},{"Bahn":"1","BugNr":"7","Teamname":"Rgm\u00a0Der\u00a0Hamburger\u00a0und\u00a0Germania\u00a0RC\u00a0\/ RC\u00a0Favorite\u00a0Hammonia","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:20,40","Ausgeschieden":"0","Kommentar":""},{"Bahn":"3","BugNr":"9","Teamname":"Rgm\u00a0RR\u00a0ETUF\u00a0Essen\u00a0\/ RR\u00a0TVK\u00a0Essen","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:33,05","Ausgeschieden":"0","Kommentar":""}]},"V3":{"general":{"Rennen":"12","Lauf":"V3","SollStartZeit":"2013-06-20 15:50:00","NameD":"Junioren-Zweier ohne Steuermann A","ZielMesspunktNr":"4"},"boote":[{"Bahn":"5","BugNr":"18","Teamname":"Rgm\u00a0Bremer\u00a0RC\u00a0HANSA\u00a0\/ Bremer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"6:54,75","Ausgeschieden":"0","Kommentar":""},{"Bahn":"4","BugNr":"17","Teamname":"SC\u00a0Magdeburg","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"6:58,25","Ausgeschieden":"0","Kommentar":""},{"Bahn":"2","BugNr":"15","Teamname":"Bremer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:09,60","Ausgeschieden":"0","Kommentar":""},{"Bahn":"1","BugNr":"14","Teamname":"RC\u00a0Allemannia","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:28,15","Ausgeschieden":"0","Kommentar":""},{"Bahn":"6","BugNr":"19","Teamname":"Crefelder\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:29,60","Ausgeschieden":"0","Kommentar":""},{"Bahn":"3","BugNr":"16","Teamname":"Rgm\u00a0RG\u00a0Heidelberg\u00a0\/ RG\u00a0Eberbach","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:49,10","Ausgeschieden":"0","Kommentar":""}]},"H1":{"general":{"Rennen":"12","Lauf":"H1","SollStartZeit":"2013-06-21 14:55:00","NameD":"Junioren-Zweier ohne Steuermann A","ZielMesspunktNr":"4"},"boote":[{"Bahn":"3","BugNr":"2","Teamname":"SC\u00a0Magdeburg","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:06,43","Ausgeschieden":"0","Kommentar":""},{"Bahn":"1","BugNr":"6","Teamname":"RV\u00a0M\u00fcnster","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:07,57","Ausgeschieden":"0","Kommentar":""},{"Bahn":"4","BugNr":"15","Teamname":"Bremer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:07,79","Ausgeschieden":"0","Kommentar":""},{"Bahn":"5","BugNr":"12","Teamname":"Rgm\u00a0RV\u00a0M\u00fcnster\u00a0\/ RC\u00a0Germania\u00a0D\u00fcsseldorf","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:08,40","Ausgeschieden":"0","Kommentar":""},{"Bahn":"6","BugNr":"9","Teamname":"Rgm\u00a0RR\u00a0ETUF\u00a0Essen\u00a0\/ RR\u00a0TVK\u00a0Essen","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:15,40","Ausgeschieden":"0","Kommentar":""},{"Bahn":"2","BugNr":"19","Teamname":"Crefelder\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:18,40","Ausgeschieden":"0","Kommentar":""}]},"H2":{"general":{"Rennen":"12","Lauf":"H2","SollStartZeit":"2013-06-21 15:00:00","NameD":"Junioren-Zweier ohne Steuermann A","ZielMesspunktNr":"4"},"boote":[{"Bahn":"1","BugNr":"4","Teamname":"Rgm\u00a0Dresdner\u00a0RC\u00a0\/ Pirnaer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:05,10","Ausgeschieden":"0","Kommentar":""},{"Bahn":"4","BugNr":"1","Teamname":"Rgm\u00a0Ratzeburger\u00a0RC\u00a0\/ Domschulruderclub\u00a0Schleswig","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:06,80","Ausgeschieden":"0","Kommentar":""},{"Bahn":"5","BugNr":"7","Teamname":"Rgm\u00a0Der\u00a0Hamburger\u00a0und\u00a0Germania\u00a0RC\u00a0\/ RC\u00a0Favorite\u00a0Hammonia","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:08,00","Ausgeschieden":"0","Kommentar":""},{"Bahn":"2","BugNr":"14","Teamname":"RC\u00a0Allemannia","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:18,20","Ausgeschieden":"0","Kommentar":""},{"Bahn":"6","BugNr":"16","Teamname":"Rgm\u00a0RG\u00a0Heidelberg\u00a0\/ RG\u00a0Eberbach","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:18,60","Ausgeschieden":"0","Kommentar":""}]},"S1":{"general":{"Rennen":"12","Lauf":"S1","SollStartZeit":"2013-06-22 17:45:00","NameD":"Junioren-Zweier ohne Steuermann A","ZielMesspunktNr":"4"},"boote":[{"Bahn":"3","BugNr":"3","Teamname":"Rgm\u00a0RV\u00a0Wandsbek\u00a0\/ RC\u00a0Favorite\u00a0Hammonia","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:03,10","Ausgeschieden":"0","Kommentar":""},{"Bahn":"4","BugNr":"18","Teamname":"Rgm\u00a0Bremer\u00a0RC\u00a0HANSA\u00a0\/ Bremer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:06,45","Ausgeschieden":"0","Kommentar":""},{"Bahn":"2","BugNr":"2","Teamname":"SC\u00a0Magdeburg","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:14,95","Ausgeschieden":"0","Kommentar":""},{"Bahn":"5","BugNr":"10","Teamname":"RC\u00a0Potsdam","Abgemeldet":"1","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:18,05","Ausgeschieden":"0","Kommentar":""},{"Bahn":"1","BugNr":"1","Teamname":"Rgm\u00a0Ratzeburger\u00a0RC\u00a0\/ Domschulruderclub\u00a0Schleswig","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:20,05","Ausgeschieden":"0","Kommentar":""},{"Bahn":"6","BugNr":"15","Teamname":"Bremer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:25,30","Ausgeschieden":"0","Kommentar":""}]},"S2":{"general":{"Rennen":"12","Lauf":"S2","SollStartZeit":"2013-06-22 17:50:00","NameD":"Junioren-Zweier ohne Steuermann A","ZielMesspunktNr":"4"},"boote":[{"Bahn":"5","BugNr":"5","Teamname":"RC\u00a0N\u00fcrtingen","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:02,20","Ausgeschieden":"0","Kommentar":""},{"Bahn":"2","BugNr":"17","Teamname":"SC\u00a0Magdeburg","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:08,55","Ausgeschieden":"0","Kommentar":""},{"Bahn":"4","BugNr":"4","Teamname":"Rgm\u00a0Dresdner\u00a0RC\u00a0\/ Pirnaer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:09,35","Ausgeschieden":"0","Kommentar":""},{"Bahn":"4","BugNr":"8","Teamname":"Rgm\u00a0RK\u00a0am\u00a0Baldeneysee\u00a0\/ Renn-Rugm.\u00a0M\u00fclheim","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:15,10","Ausgeschieden":"0","Kommentar":""},{"Bahn":"6","BugNr":"6","Teamname":"RV\u00a0M\u00fcnster","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:16,70","Ausgeschieden":"0","Kommentar":""},{"Bahn":"1","BugNr":"7","Teamname":"Rgm\u00a0Der\u00a0Hamburger\u00a0und\u00a0Germania\u00a0RC\u00a0\/ RC\u00a0Favorite\u00a0Hammonia","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:21,90","Ausgeschieden":"0","Kommentar":""}]},"FA":{"general":{"Rennen":"12","Lauf":"FA","SollStartZeit":"2013-06-23 13:58:00","NameD":"Junioren-Zweier ohne Steuermann A","ZielMesspunktNr":"4"},"boote":[{"Bahn":"3","BugNr":"3","Teamname":"Rgm\u00a0RV\u00a0Wandsbek\u00a0\/ RC\u00a0Favorite\u00a0Hammonia","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"6:50,70","Ausgeschieden":"0","Kommentar":""},{"Bahn":"4","BugNr":"5","Teamname":"RC\u00a0N\u00fcrtingen","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"6:54,35","Ausgeschieden":"0","Kommentar":""},{"Bahn":"1","BugNr":"2","Teamname":"SC\u00a0Magdeburg","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"6:56,80","Ausgeschieden":"0","Kommentar":""},{"Bahn":"5","BugNr":"18","Teamname":"Rgm\u00a0Bremer\u00a0RC\u00a0HANSA\u00a0\/ Bremer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"6:58,45","Ausgeschieden":"0","Kommentar":""},{"Bahn":"2","BugNr":"17","Teamname":"SC\u00a0Magdeburg","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:02,55","Ausgeschieden":"0","Kommentar":""},{"Bahn":"6","BugNr":"4","Teamname":"Rgm\u00a0Dresdner\u00a0RC\u00a0\/ Pirnaer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:10,10","Ausgeschieden":"0","Kommentar":""}]},"FB":{"general":{"Rennen":"12","Lauf":"FB","SollStartZeit":"2013-06-23 14:02:00","NameD":"Junioren-Zweier ohne Steuermann A","ZielMesspunktNr":"4"},"boote":[{"Bahn":"6","BugNr":"15","Teamname":"Bremer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:07,80","Ausgeschieden":"0","Kommentar":""},{"Bahn":"2","BugNr":"1","Teamname":"Rgm\u00a0Ratzeburger\u00a0RC\u00a0\/ Domschulruderclub\u00a0Schleswig","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:08,05","Ausgeschieden":"0","Kommentar":""},{"Bahn":"1","BugNr":"7","Teamname":"Rgm\u00a0Der\u00a0Hamburger\u00a0und\u00a0Germania\u00a0RC\u00a0\/ RC\u00a0Favorite\u00a0Hammonia","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:08,70","Ausgeschieden":"0","Kommentar":""},{"Bahn":"3","BugNr":"8","Teamname":"Rgm\u00a0RK\u00a0am\u00a0Baldeneysee\u00a0\/ Renn-Rugm.\u00a0M\u00fclheim","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:12,10","Ausgeschieden":"0","Kommentar":""},{"Bahn":"5","BugNr":"6","Teamname":"RV\u00a0M\u00fcnster","Abgemeldet":"0","Nachgemeldet":"0","MesspunktNr":"4","Zeit":"7:13,50","Ausgeschieden":"0","Kommentar":""}]}}}');
var startlist_example = JSON.parse('{"general":{"name":"Leichtgewichts-Junioren-Einer A","nameE":"","anzahl_ruderer":62,"anzahl_abteilungen":12,"bootsklasse":"JM 1X A LG","rennen_id":"15","distanz":"2000 m","typ":"startliste"},"abteilungen":{"V1":{"general":{"Rennen":"14","Lauf":"V1","SollStartZeit":"2013-06-20 18:10:00","NameD":"Leichtgewichts-Junioren-Einer A"},"boote":[{"Bahn":"1","BugNr":"1","Teamname":"Koblenzer\u00a0RC\u00a0Rhenania","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"2","BugNr":"2","Teamname":"Frankfurter\u00a0RG\u00a0Borussia","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"3","Teamname":"Stralsunder\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"4","Teamname":"H\u00fcrther\u00a0RG","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"5","Teamname":"RG\u00a0Treis-Karden","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"6","BugNr":"6","Teamname":"Mannheimer\u00a0RV\u00a0Amicitia","Abgemeldet":"0","Nachgemeldet":"0"}]},"V2":{"general":{"Rennen":"14","Lauf":"V2","SollStartZeit":"2013-06-20 18:15:00","NameD":"Leichtgewichts-Junioren-Einer A"},"boote":[{"Bahn":"1","BugNr":"7","Teamname":"Hannoverscher\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"2","BugNr":"8","Teamname":"RC\u00a0Allemannia","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"9","Teamname":"Frankfurter\u00a0RG\u00a0Germania","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"10","Teamname":"RA\u00a0TSV\u00a0Bremerv\u00f6rde","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"11","Teamname":"Frankfurter\u00a0RG\u00a0Germania","Abgemeldet":"0","Nachgemeldet":"0"}]},"V3":{"general":{"Rennen":"14","Lauf":"V3","SollStartZeit":"2013-06-20 18:20:00","NameD":"Leichtgewichts-Junioren-Einer A","active":"true"},"boote":[{"Bahn":"1","BugNr":"12","Teamname":"Berliner\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"2","BugNr":"13","Teamname":"Schweriner\u00a0RG","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"14","Teamname":"RV\u00a0Wandsbek","Abgemeldet":"1","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"15","Teamname":"Renn-Rugm.\u00a0M\u00fclheim","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"16","Teamname":"RV\u00a0Neptun\u00a0Konstanz","Abgemeldet":"0","Nachgemeldet":"0"}]},"V4":{"general":{"Rennen":"14","Lauf":"V4","SollStartZeit":"2013-06-20 18:25:00","NameD":"Leichtgewichts-Junioren-Einer A"},"boote":[{"Bahn":"1","BugNr":"17","Teamname":"WSV\u00a0Honnef","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"2","BugNr":"18","Teamname":"Deutscher\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"19","Teamname":"RV\u00a0Blankenstein-Ruhr","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"20","Teamname":"Mainzer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"21","Teamname":"Frankfurter\u00a0RG\u00a0Germania","Abgemeldet":"0","Nachgemeldet":"0"}]},"H1":{"general":{"Rennen":"14","Lauf":"H1","SollStartZeit":"2013-06-21 15:10:00","NameD":"Leichtgewichts-Junioren-Einer A"},"boote":[{"Bahn":"2","BugNr":"21","Teamname":"Frankfurter\u00a0RG\u00a0Germania","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"6","Teamname":"Mannheimer\u00a0RV\u00a0Amicitia","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"9","Teamname":"Frankfurter\u00a0RG\u00a0Germania","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"13","Teamname":"Schweriner\u00a0RG","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"6","BugNr":"4","Teamname":"H\u00fcrther\u00a0RG","Abgemeldet":"0","Nachgemeldet":"0"}]},"H2":{"general":{"Rennen":"14","Lauf":"H2","SollStartZeit":"2013-06-21 15:15:00","NameD":"Leichtgewichts-Junioren-Einer A"},"boote":[{"Bahn":"2","BugNr":"2","Teamname":"Frankfurter\u00a0RG\u00a0Borussia","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"8","Teamname":"RC\u00a0Allemannia","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"16","Teamname":"RV\u00a0Neptun\u00a0Konstanz","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"19","Teamname":"RV\u00a0Blankenstein-Ruhr","Abgemeldet":"0","Nachgemeldet":"0"}]},"H3":{"general":{"Rennen":"14","Lauf":"H3","SollStartZeit":"2013-06-21 15:20:00","NameD":"Leichtgewichts-Junioren-Einer A"},"boote":[{"Bahn":"2","BugNr":"11","Teamname":"Frankfurter\u00a0RG\u00a0Germania","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"12","Teamname":"Berliner\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"20","Teamname":"Mainzer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"3","Teamname":"Stralsunder\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0"}]},"H4":{"general":{"Rennen":"14","Lauf":"H4","SollStartZeit":"2013-06-21 15:25:00","NameD":"Leichtgewichts-Junioren-Einer A"},"boote":[{"Bahn":"2","BugNr":"14","Teamname":"RV\u00a0Wandsbek","Abgemeldet":"1","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"18","Teamname":"Deutscher\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"1","Teamname":"Koblenzer\u00a0RC\u00a0Rhenania","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"10","Teamname":"RA\u00a0TSV\u00a0Bremerv\u00f6rde","Abgemeldet":"0","Nachgemeldet":"0"}]},"S1":{"general":{"Rennen":"14","Lauf":"S1","SollStartZeit":"2013-06-22 17:55:00","NameD":"Leichtgewichts-Junioren-Einer A"},"boote":[{"Bahn":"1","BugNr":"13","Teamname":"Schweriner\u00a0RG","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"2","BugNr":"1","Teamname":"Koblenzer\u00a0RC\u00a0Rhenania","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"5","Teamname":"RG\u00a0Treis-Karden","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"15","Teamname":"Renn-Rugm.\u00a0M\u00fclheim","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"16","Teamname":"RV\u00a0Neptun\u00a0Konstanz","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"6","BugNr":"20","Teamname":"Mainzer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0"}]},"S2":{"general":{"Rennen":"14","Lauf":"S2","SollStartZeit":"2013-06-22 18:00:00","NameD":"Leichtgewichts-Junioren-Einer A"},"boote":[{"Bahn":"1","BugNr":"14","Teamname":"RV\u00a0Wandsbek","Abgemeldet":"1","Nachgemeldet":"0"},{"Bahn":"2","BugNr":"6","Teamname":"Mannheimer\u00a0RV\u00a0Amicitia","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"17","Teamname":"WSV\u00a0Honnef","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"7","Teamname":"Hannoverscher\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"12","Teamname":"Berliner\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"6","BugNr":"8","Teamname":"RC\u00a0Allemannia","Abgemeldet":"0","Nachgemeldet":"0"}]},"FA":{"general":{"Rennen":"14","Lauf":"FA","SollStartZeit":"2013-06-23 14:20:00","NameD":"Leichtgewichts-Junioren-Einer A"},"boote":[{"Bahn":"1","BugNr":"13","Teamname":"Schweriner\u00a0RG","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"2","BugNr":"7","Teamname":"Hannoverscher\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"5","Teamname":"RG\u00a0Treis-Karden","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"12","Teamname":"Berliner\u00a0RC","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"15","Teamname":"Renn-Rugm.\u00a0M\u00fclheim","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"6","BugNr":"6","Teamname":"Mannheimer\u00a0RV\u00a0Amicitia","Abgemeldet":"0","Nachgemeldet":"0"}]},"FB":{"general":{"Rennen":"14","Lauf":"FB","SollStartZeit":"2013-06-23 14:24:00","NameD":"Leichtgewichts-Junioren-Einer A"},"boote":[{"Bahn":"1","BugNr":"8","Teamname":"RC\u00a0Allemannia","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"2","BugNr":"1","Teamname":"Koblenzer\u00a0RC\u00a0Rhenania","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"3","BugNr":"17","Teamname":"WSV\u00a0Honnef","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"4","BugNr":"16","Teamname":"RV\u00a0Neptun\u00a0Konstanz","Abgemeldet":"0","Nachgemeldet":"0"},{"Bahn":"5","BugNr":"14","Teamname":"RV\u00a0Wandsbek","Abgemeldet":"1","Nachgemeldet":"0"},{"Bahn":"6","BugNr":"20","Teamname":"Mainzer\u00a0RV","Abgemeldet":"0","Nachgemeldet":"0"}]},"Abmeldungen":{"general":{"Rennen":"14","Lauf":"Abmeldungen","SollStartZeit":" ","NameD":" "},"boote":[{"Bahn":"5","BugNr":"14","Teamname":"RV\u00a0Wandsbek"},{"Bahn":"2","BugNr":"14","Teamname":"RV\u00a0Wandsbek"},{"Bahn":"1","BugNr":"14","Teamname":"RV\u00a0Wandsbek"},{"Bahn":"3","BugNr":"14","Teamname":"RV\u00a0Wandsbek"}]}}}');