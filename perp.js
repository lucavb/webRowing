// import stuff
var mysql = require('mysql');
var async = require("async");
var fs = require("fs");


// setting up mysql connection
var mysql_conf = JSON.parse(fs.readFileSync("./mysql_conf"));
var connection = mysql.createConnection({
	host : mysql_conf.host,
	user : mysql_conf.username,
	password : mysql_conf.password
});
connection.connect();
connection.query("USE " + mysql_conf.database);
connection.query("SET NAMES 'UTF8'");

function getCurrentRace(type, callback) {
	var query = "SELECT ab.Regatta_ID, ab.Rennen, ab.Lauf \
					FROM ablauf ab \
					INNER JOIN laeufe l ON (ab.Rennen = l.Rennen AND l.Lauf = ab.Lauf AND ab.Regatta_ID = l.Regatta_ID) \
					INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = ab.Regatta_ID \
					WHERE l.IstStartZeit IS NULL\
					ORDER BY l.SollStartZeit ASC, l.Rennen ASC \
					LIMIT 1";
	connection.query(query, function(err, rows) {
		if (err || rows.length == 0) {
			console.log("    warning    - there was no current race found");
			callback(null);
		}
		else {
			getRaceByID(type, rows[0].Rennen, function(ret) {
				callback(ret);
			});
		}
	});
}

// @param type startlist or result
// @param id the race requested; if this function should not be able 
// 	to find it it will return an empty result
function getRaceByID(type, id, callback) {
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
			ret.general.typ = type;
			getSections(type, rows[0].Regatta_ID, id, function(value) {
				ret.abteilungen = value;
				callback(ret);
			})
			
		}
	});
}

function getSections(type, regatta_id, rennen_id, callback) {
	var ret = new Object();
	var query = "SELECT laeufe.Rennen, laeufe.Lauf, laeufe.SollStartZeit, rennen.NameD \
				 FROM laeufe \
				 LEFT JOIN rennen ON (laeufe.Regatta_ID = rennen.Regatta_ID AND laeufe.Rennen = rennen.Rennen) \
				 WHERE laeufe.Rennen = ? AND laeufe.Regatta_ID = ? \
				 ORDER BY  laeufe.`SollStartZeit` ASC";
	connection.query(query, [rennen_id, regatta_id], function (err, rows) {
		var counter = rows.length;
		async.each(rows,
			function(row, callback) {
				row.Lauf_Reframe = reframeSections(row.Lauf);
				ret[row.Lauf] = { "general" : "", "boote" : {}};
				ret[row.Lauf].general = row;
				if (type == "startlist") {
					var query2 = "	SELECT startlisten.Bahn, meldungen.BugNr, teams.Teamname, meldungen.Abgemeldet, meldungen.Nachgemeldet \
									FROM startlisten \
									LEFT JOIN meldungen ON (startlisten.`TNr` = meldungen.`TNr` AND meldungen.Regatta_ID = startlisten.Regatta_ID AND meldungen.Rennen = startlisten.Rennen ) \
									LEFT JOIN teams ON (meldungen.`Team_ID` = teams.`ID` AND teams.Regatta_ID = startlisten.Regatta_ID) \
									WHERE startlisten.Rennen = ? AND startlisten.Lauf = ? AND startlisten.Regatta_ID = ?";
				}
				else if (type == "result") {
					var query2 = "	SELECT e.Bahn, meldungen.BugNr, teams.Teamname, meldungen.Abgemeldet, meldungen.Nachgemeldet, z.`MesspunktNr`, z.Zeit, e.`Ausgeschieden`, e.`Kommentar` \
									FROM ergebnisse e \
									LEFT JOIN zeiten z ON (z.`Regatta_ID` = e.`Regatta_ID` AND z.Rennen = e.Rennen AND e.Lauf = z.Lauf AND e.`TNr` = z.`TNr`) \
									INNER JOIN rennen r ON (r.`Regatta_ID` = e.`Regatta_ID` AND r.`Rennen` = e.`Rennen` AND r.`ZielMesspunktNr` = z.`MesspunktNr` OR r.`Regatta_ID` = e.`Regatta_ID` AND r.`Rennen` = e.`Rennen` AND z.`MesspunktNr` IS NULL) \
									LEFT JOIN meldungen ON (e.`TNr` = meldungen.`TNr` AND meldungen.Regatta_ID = e.Regatta_ID AND meldungen.Rennen = e.Rennen ) \
									LEFT JOIN teams ON (meldungen.`Team_ID` = teams.`ID` AND teams.Regatta_ID = e.`Regatta_ID`) \
									WHERE e.Rennen = ? AND e.Lauf = ? AND e.Regatta_ID = ? \
									ORDER BY ISNULL(z.`Zeit`), z.`Zeit` ASC, teams.`Teamname`";
				}
				
				connection.query(query2, [rennen_id, row.Lauf, regatta_id], function (err, rows2) {
					async.each(rows2,
						function(row2, callback) {
							if (row2.Abgemeldet == 0) {
								delete row2.Abgemeldet;
							}
							if (row2.Nachgemeldet == 0) {
								delete row2.Nachgemeldet;
							}
							if (type == "result" && row2.Ausgeschieden == "") {
								delete row2.Ausgeschieden;
								delete row2.Kommentar;
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
					// let's return everything
					callback(ret);
				}
			});
	});
}


// rename function in order to rename A1 to Abteilung 1
function reframeSections(section) {
	var regexVorlauf = new RegExp("V[0-9]+");
	var regexHoffnung = new RegExp("H[0-9]+");
	var regexSemi = new RegExp("S[0-9]+");
	var regexAbteilung = new RegExp("A[0-9]+");
	var regexFinale = new RegExp("F[A-Z]+");
	var regexViertelFinale = new RegExp("Q[0-9]+");
	var regexZwischen = new RegExp("Z[0-9]+");
	var firstPart = "";
	if (regexVorlauf.test(section)) {
		firstPart = "Vorlauf";
	}
	else if (regexHoffnung.test(section)) {
		firstPart = "Hoffnungslauf";
	}
	else if (regexSemi.test(section)) {
		firstPart = "Semifinale";
	}
	else if (regexAbteilung.test(section)) {
		firstPart = "Abteilung";
	}
	else if (regexFinale.test(section)) {
		firstPart = "Finale";
	}
	else if (regexZwischen.test(section)) {
		firstPart = "Zwischenlauf";
	}
	else {
		return section + "";
	}
	return firstPart + " " + section.substring(1);
}

module.exports.getRaceByID = getRaceByID;
module.exports.getCurrentRace = getCurrentRace;