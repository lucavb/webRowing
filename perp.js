// import stuff
var mysql = require('mysql');
var async = require("async");
var fs = require("fs");

// read info about the replacement for sections V1 = Vorlauf 1
var sections_conf = JSON.parse(fs.readFileSync("./sections.json"));


// setting up mysql connection
var mysql_conf = JSON.parse(fs.readFileSync("./mysql_conf"));
var connection = mysql.createConnection(mysql_conf);
connection.connect(function(err) {
	if (err) {
		console.log("    error   - couldn't connect to the server. that's bad.");
	}
});
connection.query("USE " + mysql_conf.database);
connection.query("SET NAMES 'UTF8'");

function getCurrentRace(type, callback) {
	var query = "SELECT ab.Regatta_ID, ab.Rennen, ab.Lauf \
					FROM ablauf ab \
					INNER JOIN laeufe l ON (ab.Rennen = l.Rennen AND l.Lauf = ab.Lauf AND ab.Regatta_ID = l.Regatta_ID) \
					INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = ab.Regatta_ID \
					INNER JOIN startlisten s ON s.Regatta_ID = ab.Regatta_ID AND s.Lauf = ab.Lauf AND s.Rennen = ab.Rennen \
					WHERE l.IstStartZeit IS NULL\
					ORDER BY ab.Order ASC, l.SollStartZeit ASC, l.Rennen ASC \
					LIMIT 1";
	connection.query(query, function(err, rows) {
		if (err || rows.length == 0) {
			console.log("    warning - there was no current race found");
			callback(createError("Entschuldigung", "Es wird kein weiteres Rennen mehr durchgeführt."));
		}
		else if (err) {
			console.log("    error   - The query returned the following error.");
			console.log(err);
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
			console.log("  warning   - " + err);
			callback(ret);
		}
		else if (rows.length == 0) {
			console.log("  warning   - there was no race found for " + id);
			callback(createError("Entschuldigung", "Es wurde kein Rennen mit der Nummer " + id + " gefunden."));
		}
		else {	
			ret.general = rows[0];
			ret.general.typ = type;
			// let's find the real position
			ret.general.Position = 2000 - ret.general.Position;
			getSections(type, rows[0].Regatta_ID, id, function(value) {
				if (value != null) {
					ret.abteilungen = value;
					callback(ret);
				}
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
				 INNER JOIN ablauf ab ON (ab.Regatta_ID = l.Regatta_ID AND ab.Rennen = l.Rennen AND ab.Lauf = l.Lauf AND publish = 1) \
				 WHERE l.Rennen = ? AND l.Regatta_ID = ? \
				 ORDER BY  l.`SollStartZeit` ASC";
	connection.query(query, [rennen_id, regatta_id], function (err, rows) {
		if (err) {
			console.log("    error   - The query, to find the sections, failed for the follwing reason.");
			console.log(err);
			callback(null);
		}
		var counter = rows.length;
		async.each(rows,
			function(row, callback) {
				row.Lauf_Reframe = reframeSections(row.Lauf);
				ret[row.Lauf] = { "general" : "", "boote" : {}};
				ret[row.Lauf].general = row;
				if (type == "startlist") {
					// i'd like to mention that the datastructure has not been made by me and has been made around 2000 i think.
					var query2 = "	SELECT startlisten.Bahn, m.BugNr, teams.Teamname, m.Abgemeldet, m.Nachgemeldet, \
									CONCAT(r1.`VName`, ' ', r1.`NName`, ' (', r1.`JahrG`, ')') as r1_string, \
									CONCAT(r2.`VName`, ' ', r2.`NName`, ' (', r2.`JahrG`, ')') as r2_string, \
									CONCAT(r3.`VName`, ' ', r3.`NName`, ' (', r3.`JahrG`, ')') as r3_string, \
									CONCAT(r4.`VName`, ' ', r4.`NName`, ' (', r4.`JahrG`, ')') as r4_string, \
									CONCAT(r5.`VName`, ' ', r5.`NName`, ' (', r5.`JahrG`, ')') as r5_string, \
									CONCAT(r6.`VName`, ' ', r6.`NName`, ' (', r6.`JahrG`, ')') as r6_string, \
									CONCAT(r7.`VName`, ' ', r7.`NName`, ' (', r7.`JahrG`, ')') as r7_string, \
									CONCAT(r8.`VName`, ' ', r8.`NName`, ' (', r8.`JahrG`, ')') as r8_string, \
									CONCAT(rS.`VName`, ' ', rS.`NName`, ' (', rS.`JahrG`, ')') as rS_string \
									FROM startlisten \
									LEFT JOIN meldungen m ON (startlisten.`TNr` = m.`TNr` AND m.Regatta_ID = startlisten.Regatta_ID AND m.Rennen = startlisten.Rennen ) \
									LEFT JOIN teams ON (m.`Team_ID` = teams.`ID` AND teams.Regatta_ID = startlisten.Regatta_ID) \
									INNER JOIN ruderer r1 ON (m.`ruderer1_ID` = r1.`ID`) \
									LEFT JOIN ruderer r2 ON (m.`ruderer2_ID` = r2.`ID`) \
									LEFT JOIN ruderer r3 ON (m.`ruderer3_ID` = r3.`ID`) \
									LEFT JOIN ruderer r4 ON (m.`ruderer4_ID` = r4.`ID`) \
									LEFT JOIN ruderer r5 ON (m.`ruderer5_ID` = r5.`ID`) \
									LEFT JOIN ruderer r6 ON (m.`ruderer6_ID` = r6.`ID`) \
									LEFT JOIN ruderer r7 ON (m.`ruderer7_ID` = r7.`ID`) \
									LEFT JOIN ruderer r8 ON (m.`ruderer8_ID` = r8.`ID`) \
									LEFT JOIN ruderer rS ON (m.`ruderers_ID` = rS.`ID`) \
									WHERE startlisten.Rennen = ? AND startlisten.Lauf = ? AND startlisten.Regatta_ID = ? \
									ORDER BY startlisten.Bahn ASC";
				}
				else if (type == "result") {
					var query2 = "	SELECT e.Bahn, m.BugNr, teams.Teamname, m.Abgemeldet, m.Nachgemeldet, z.`MesspunktNr`, z.Zeit, e.`Ausgeschieden`, e.`Kommentar`, \
									CONCAT(r1.`VName`, ' ', r1.`NName`, ' (', r1.`JahrG`, ')') as r1_string, \
									CONCAT(r2.`VName`, ' ', r2.`NName`, ' (', r2.`JahrG`, ')') as r2_string, \
									CONCAT(r3.`VName`, ' ', r3.`NName`, ' (', r3.`JahrG`, ')') as r3_string, \
									CONCAT(r4.`VName`, ' ', r4.`NName`, ' (', r4.`JahrG`, ')') as r4_string, \
									CONCAT(r5.`VName`, ' ', r5.`NName`, ' (', r5.`JahrG`, ')') as r5_string, \
									CONCAT(r6.`VName`, ' ', r6.`NName`, ' (', r6.`JahrG`, ')') as r6_string, \
									CONCAT(r7.`VName`, ' ', r7.`NName`, ' (', r7.`JahrG`, ')') as r7_string, \
									CONCAT(r8.`VName`, ' ', r8.`NName`, ' (', r8.`JahrG`, ')') as r8_string, \
									CONCAT(rS.`VName`, ' ', rS.`NName`, ' (', rS.`JahrG`, ')') as rS_string \
									FROM ergebnisse e \
									LEFT JOIN zeiten z ON (z.`Regatta_ID` = e.`Regatta_ID` AND z.Rennen = e.Rennen AND e.Lauf = z.Lauf AND e.`TNr` = z.`TNr`) \
									INNER JOIN rennen r \
										ON (r.`Regatta_ID` = e.`Regatta_ID` AND r.`Rennen` = e.`Rennen` AND r.`ZielMesspunktNr` = z.`MesspunktNr` OR r.`Regatta_ID` = e.`Regatta_ID` \
										AND r.`Rennen` = e.`Rennen` AND z.`MesspunktNr` IS NULL) \
									LEFT JOIN meldungen m ON (e.`TNr` = m.`TNr` AND m.Regatta_ID = e.Regatta_ID AND m.Rennen = e.Rennen ) \
									LEFT JOIN teams ON (m.`Team_ID` = teams.`ID` AND teams.Regatta_ID = e.`Regatta_ID`) \
									INNER JOIN ruderer r1 ON (m.`ruderer1_ID` = r1.`ID`) \
									LEFT JOIN ruderer r2 ON (m.`ruderer2_ID` = r2.`ID`) \
									LEFT JOIN ruderer r3 ON (m.`ruderer3_ID` = r3.`ID`) \
									LEFT JOIN ruderer r4 ON (m.`ruderer4_ID` = r4.`ID`) \
									LEFT JOIN ruderer r5 ON (m.`ruderer5_ID` = r5.`ID`) \
									LEFT JOIN ruderer r6 ON (m.`ruderer6_ID` = r6.`ID`) \
									LEFT JOIN ruderer r7 ON (m.`ruderer7_ID` = r7.`ID`) \
									LEFT JOIN ruderer r8 ON (m.`ruderer8_ID` = r8.`ID`) \
									LEFT JOIN ruderer rS ON (m.`ruderers_ID` = rS.`ID`) \
									WHERE e.Rennen = ? AND e.Lauf = ? AND e.Regatta_ID = ? \
									ORDER BY ISNULL(z.`Zeit`), z.`Zeit` ASC, e.Bahn ASC, teams.`Teamname`";
				}
				
				connection.query(query2, [rennen_id, row.Lauf, regatta_id], function (err, rows2) {
					if (rows2.length == 0) {
						delete ret[row.Lauf];
						callback();
					}
					else {

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
					}
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
	for (var key in sections_conf) {
		var regEx = new RegExp(sections_conf[key].first_letter + sections_conf[key].range_regex);
		if (regEx.test(section)) {
			return sections_conf[key].replacement + " " + section.substring(1);
		}
	}
	// well this is awkward. let's just return it then
	return section;
}

function createError(header, msg) {
	var ret = {
		general: {
			"header" : header,
			"msg" : msg
		}
	}
	return ret;
}

module.exports.getRaceByID = getRaceByID;
module.exports.getCurrentRace = getCurrentRace;