var mysql = require('mysql');

var async = require("async");

var connection = mysql.createConnection({
	host : 'localhost',
	user : 'php',
	password : 'php'
})

// set up a connection
connection.connect();

connection.query("SET NAMES 'UTF8'");
connection.query("USE perp");




function getCurrentRace(callback) {

	var query = "SELECT ab.Regatta_ID, ab.Rennen, ab.Lauf \
					FROM ablauf ab \
					INNER JOIN laeufe l ON (ab.Rennen = l.Rennen AND l.Lauf = ab.Lauf AND ab.Regatta_ID = l.Regatta_ID) \
					INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = ab.Regatta_ID \
					WHERE l.IstStartZeit IS NULL\
					ORDER BY l.SollStartZeit ASC, l.Rennen ASC \
					LIMIT 1";
	connection.query(query, function(err, rows) {
		if (err || rows.length == 0) {
			callback(null);
		}
		getRaceByID(rows[0].Rennen, function(ret) {
			callback(ret);
		})
	});
}


function getRaceByID(id, callback) {
	var ret = {
		"general" : {
		},
		"abteilungen" : {

		}
	};
	var query = "SELECT l.Regatta_ID, l.Rennen, r.NameD, r.NameK, r.NameE, l.Lauf, l.SollStartZeit, m.Position \
				 FROM laeufe l \
				 INNER JOIN rennen r ON (r.Rennen = l.Rennen AND r.Regatta_ID = l.Regatta_ID) \
				 INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = l.Regatta_ID \
				 INNER JOIN messpunkte m ON (m.Regatta_ID = l.Regatta_ID AND r.ZielMesspunktNr = m.MesspunktNr) \
				 WHERE l.Rennen = " + id + " \
				 LIMIT 1";
	connection.query(query, function (err, rows) {
		if (err) {
			console.log("    warning    - " + err);
			callback(ret);
		}
		else if (rows.length == 0) {
			console.log("    warning    - there was no race found for "+ id);
			callback(ret);
		}
		else {
			
			ret.general = rows[0];
			ret.general.typ = "startliste";
			getRace(rows[0].Regatta_ID, id, null, function(value) {
				ret.abteilungen = value;
				callback(ret);
			})
			
		}
	});
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
								LEFT JOIN teams ON (meldungen.`Team_ID` = teams.`ID` AND teams.Regatta_ID = startlisten.Regatta_ID) \
								WHERE startlisten.Rennen = ? AND startlisten.Lauf = ? AND startlisten.Regatta_ID = ?";
				connection.query(query2, [rennen_id, row.Lauf, regatta_id], function (err, rows2) {
					// fixing certain stuff
					async.each(rows2,
						function(row2, callback) {
							if (row2.Abgemeldet == 0) {
								delete row2.Abgemeldet;
							}
							if (row2.Nachgemeldet == 0) {
								delete row2.Nachgemeldet;
							}
						}, function(err) {
							if (err) {

							}
							else {

							}
						});
					ret[row.Lauf].boote = rows2;
					callback();
				});
				

			}, function(err) {
				if (err) {
					console.log(err);
				}
				else {
					// when the each is done this part will be executed
					callback(ret);
				}
			});
		

	});
	
}


module.exports.getRaceByID = getRaceByID;
module.exports.getCurrentRace = getCurrentRace;




