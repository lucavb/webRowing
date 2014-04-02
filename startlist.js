var mysql = require('mysql');
var retModel = require('./retModel.js');
var step = require("step");
var async = require("async");

var connection = mysql.createConnection({
	host : 'localhost',
	user : 'php',
	password : 'php'
})

connection.connect();

connection.query("SET NAMES 'UTF8'");
connection.query("USE perp");



function getRaceByID(id, callback) {
	var ret = retModel.start;
	var query = "SELECT l.Regatta_ID, l.Rennen, r.NameD, r.NameK, r.NameE, l.Lauf, l.SollStartZeit, m.Position \
				 FROM laeufe l \
				 INNER JOIN rennen r ON (r.Rennen = l.Rennen AND r.Regatta_ID = l.Regatta_ID) \
				 INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = l.Regatta_ID \
				 INNER JOIN messpunkte m ON (m.Regatta_ID = l.Regatta_ID AND r.ZielMesspunktNr = m.MesspunktNr) \
				 WHERE l.Rennen = " + id + " \
				 LIMIT 1";
	connection.query(query, function (err, rows) {
		if (err) {
			callback(retModel.start);
		}
		else {
			ret.general = rows;
			parseRace(34, id, null, function(value) {
				ret.abteilungen = value;
				//console.log(ret);
			})
			
		}
	});
}

function getCurrentRace() {

}

function getRace(regatta_id, rennen_id, lauf, callback) {
	var ret = new Object();
	var query = "SELECT laeufe.Rennen, laeufe.Lauf, laeufe.SollStartZeit, rennen.NameD \
				 FROM laeufe \
				 LEFT JOIN rennen ON (laeufe.Regatta_ID = rennen.Regatta_ID AND laeufe.Rennen = rennen.Rennen) \
				 WHERE laeufe.Rennen = " + rennen_id + "  AND laeufe.Regatta_ID = " + regatta_id + " \
				 ORDER BY  laeufe.`SollStartZeit` ASC";
	connection.query(query, function (err, rows) {
		var counter = rows.length;
		async.each(rows,
			function(row, callback) {
				ret[row.Lauf] = { "general" : "", "boote" : {}};
				ret[row.Lauf].general = row;

				var query2 = "	SELECT startlisten.Bahn, meldungen.BugNr, teams.Teamname, meldungen.Abgemeldet, meldungen.Nachgemeldet \
								FROM startlisten \
								LEFT JOIN meldungen ON (startlisten.`TNr` = meldungen.`TNr` AND meldungen.Regatta_ID = startlisten.Regatta_ID AND meldungen.Rennen = startlisten.Rennen ) \
								LEFT JOIN teams ON (meldungen.`Team_ID` = teams.`ID` AND teams.Regatta_ID = "+regatta_id+") \
								WHERE startlisten.Rennen = "+rennen_id+" AND startlisten.Lauf = '"+row.Lauf+"' AND startlisten.Regatta_ID = " + regatta_id;
				console.log(query2);
				connection.query(query2, function (err, rows2) {
					// i need to wait for this
					ret[row.Lauf].boote = rows2;
				});

			}, function(err) {
				if (err) {
					console.log(err);
				}
			});
		console.log(ret);
		callback(ret);
	});
	
}

function parseBoote(regatta_id, rennen_id, lauf, callback) {
	
}
getRaceByID(208);