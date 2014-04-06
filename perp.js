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
connection.connect(function(err) {
	if (err) {
		console.log("    error   - couldn't connect to the server. that's bad");
	}
});
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
				 INNER JOIN messpunkte m ON (m.Regatta_ID = l.Regatta_ID AND r.StartMesspunktNr = m.MesspunktNr) \
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
			ret.general.Position = 2000 - ret.general.Position;
			getSections(type, rows[0].Regatta_ID, id, function(value) {
				ret.abteilungen = value;
				callback(ret);
			})
			
		}
	});
}

function getSections(type, regatta_id, rennen_id, callback) {
	var ret = new Object();
	var query = "SELECT l.Rennen, l.Lauf, l.SollStartZeit, rennen.NameD, CONCAT(aU.`Vorname`, ' ', aU.`Name`) AS umpire, CONCAT(aJ.`Vorname`, ' ', aJ.`Name`) AS judge \
				 FROM laeufe l \
				 LEFT JOIN rennen ON (l.Regatta_ID = rennen.Regatta_ID AND l.Rennen = rennen.Rennen) \
				 LEFT JOIN `addressen` aU ON (aU.`ID` = l.`Schiedsrichter_ID_Umpire` AND aU.`IstSchiedsrichter` = 1) \
				 LEFT JOIN addressen aJ ON (aJ.ID = l.`Schiedsrichter_ID_Judge` AND aJ.`IstSchiedsrichter` = 1) \
				 WHERE l.Rennen = ? AND l.Regatta_ID = ? \
				 ORDER BY  l.`SollStartZeit` ASC";
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