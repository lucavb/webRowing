var track_length = 2000; // enter the distance of the track here

// import stuff
var async = require("async");
var connection = require("./mysql_conn.js").connection;

// finds the current race according to the table "ablauf" (order)
// please use the sortRaces project to fill the table.
// the table ablauf is not included in perp!
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
	var query = "SELECT l.Regatta_ID, l.Rennen, r.NameD, r.NameK, r.NameE, l.Lauf, l.SollStartZeit, m.Position as Distanz \
				 FROM laeufe l \
				 INNER JOIN rennen r ON (r.Rennen = l.Rennen AND r.Regatta_ID = l.Regatta_ID) \
				 INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = l.Regatta_ID \
				 INNER JOIN messpunkte m ON (m.Regatta_ID = l.Regatta_ID AND r.StartMesspunktNr = m.MesspunktNr) \
				 WHERE l.Rennen = ? \
				 LIMIT 1";
	connection.query(query, [id], function (err, rows) {
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
			ret.general.Distanz = track_length - ret.general.Distanz;	// let's find the real distance
			getSections(type, id, function(value) {
				if (value != null) {
					ret.abteilungen = value;
					callback(ret);
				}
			})
			
		}
	});
}

// gathers information on the section and finds all boats that where set for the section
function getSections(type, rennen_id, callback) {
	var ret = [];
	var query = "SELECT CONCAT(l.Rennen, '-', l.Lauf) as id, l.Rennen, l.Lauf, l.SollStartZeit, l.ErgebnisKorrigiert, l.ErgebnisEndgueltig, rennen.NameD, rennen.NameK, \
				 CONCAT(pL.Wert, ' ', SUBSTRING(l.Lauf, 2)) AS lauf_pretty, \
				 CONCAT(aU.`Vorname`, ' ', aU.`Name`) AS umpire, CONCAT(aJ.`Vorname`, ' ', aJ.`Name`) AS judge, \
				 IF(l.`IstStartZeit` IS NULL, 0, 1) AS hasStarted, \
				 m.Position as Distanz \
				 FROM laeufe l \
				 LEFT JOIN rennen ON (l.Regatta_ID = rennen.Regatta_ID AND l.Rennen = rennen.Rennen) \
				 LEFT JOIN schiedsrichterliste sJ ON (sJ.Schiedsrichter_ID = l.`Schiedsrichter_ID_Judge` AND sJ.Regatta_ID = l.Regatta_ID) \
				 LEFT JOIN schiedsrichterliste sU ON (sU.Schiedsrichter_ID = l.`Schiedsrichter_ID_Umpire` AND sU.Regatta_ID = l.Regatta_ID) \
				 LEFT JOIN `addressen` aU ON (aU.`ID` = sU.`Schiedsrichter_ID` AND aU.`IstSchiedsrichter` = 1) \
				 LEFT JOIN addressen aJ ON (aJ.ID = sJ.`Schiedsrichter_ID` AND aJ.`IstSchiedsrichter` = 1) \
				 INNER JOIN parameter pL ON (pL.Sektion = 'Uebersetzer_Lauftypen' AND pL.Schluessel = SUBSTRING(l.Lauf,1,1)) \
				 INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = l.Regatta_ID \
				 INNER JOIN ablauf ab ON (ab.Regatta_ID = l.Regatta_ID AND ab.Rennen = l.Rennen AND ab.Lauf = l.Lauf AND publish >= ?) \
				 INNER JOIN rennen r ON (r.Rennen = l.Rennen AND r.Regatta_ID = l.Regatta_ID) \
				 INNER JOIN messpunkte m ON (m.Regatta_ID = l.Regatta_ID AND r.StartMesspunktNr = m.MesspunktNr) \
				 WHERE l.Rennen = ? \
				 ORDER BY ab.Order ASC, l.`SollStartZeit` ASC";

	// in order to allow the ablauf table to hide races
	// the right level needs to be selected
	var param = 0;				 
	if (type == "result") {
		param = 2;
	}
	else if (type == "startlist") {
		param = 1;
	}

	connection.query(query, [param, rennen_id], function (err, rows) {
		if (err) {
			console.log("    error   - The query, to find the sections, failed for the follwing reason.");
			console.log(err);
			callback(null);
		}
		var counter = rows.length;
		async.each(rows,
			function(row, callback) {
				var section = { "general" : "", "boote" : {}};
				row.Distanz = track_length - row.Distanz;
				section.general = row;
				section.general.typ = type;
				if (type == "startlist") {
					// i'd like to mention that the datastructure has not been made by me and has been made around 2000 i think.
					var query2 = "	SELECT s.Bahn, m.BugNr, teams.Teamname, m.Abgemeldet, m.Nachgemeldet, \
									CONCAT(r1.`VName`, ' ', r1.`NName`, ' (', r1.`JahrG`, ')') as r1_string, \
									CONCAT(r2.`VName`, ' ', r2.`NName`, ' (', r2.`JahrG`, ')') as r2_string, \
									CONCAT(r3.`VName`, ' ', r3.`NName`, ' (', r3.`JahrG`, ')') as r3_string, \
									CONCAT(r4.`VName`, ' ', r4.`NName`, ' (', r4.`JahrG`, ')') as r4_string, \
									CONCAT(r5.`VName`, ' ', r5.`NName`, ' (', r5.`JahrG`, ')') as r5_string, \
									CONCAT(r6.`VName`, ' ', r6.`NName`, ' (', r6.`JahrG`, ')') as r6_string, \
									CONCAT(r7.`VName`, ' ', r7.`NName`, ' (', r7.`JahrG`, ')') as r7_string, \
									CONCAT(r8.`VName`, ' ', r8.`NName`, ' (', r8.`JahrG`, ')') as r8_string, \
									CONCAT(rS.`VName`, ' ', rS.`NName`, ' (', rS.`JahrG`, ')') as rS_string, \
									IF(r.`MitSteuermann` && (r.`MinimalesSteuermanngewicht` - g.`Gewicht`) > 0, ROUND((r.`MinimalesSteuermanngewicht` - g.`Gewicht`), 2), NULL) as zusatzGewicht \
									FROM startlisten s \
									LEFT JOIN meldungen m ON (s.`TNr` = m.`TNr` AND m.Regatta_ID = s.Regatta_ID \
										AND m.Rennen = s.Rennen ) \
									LEFT JOIN teams ON (m.`Team_ID` = teams.`ID` AND teams.Regatta_ID = s.Regatta_ID) \
									LEFT JOIN laeufe l ON (l.Lauf = s.Lauf AND l.Regatta_ID = s.Regatta_ID AND l.Rennen = s.Rennen) \
									INNER JOIN rennen r ON (r.`Regatta_ID` = s.`Regatta_ID` AND r.`Rennen` = s.`Rennen`) \
									INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = s.Regatta_ID \
									INNER JOIN ruderer r1 ON (m.`ruderer1_ID` = r1.`ID`) \
									LEFT JOIN ruderer r2 ON (m.`ruderer2_ID` = r2.`ID`) \
									LEFT JOIN ruderer r3 ON (m.`ruderer3_ID` = r3.`ID`) \
									LEFT JOIN ruderer r4 ON (m.`ruderer4_ID` = r4.`ID`) \
									LEFT JOIN ruderer r5 ON (m.`ruderer5_ID` = r5.`ID`) \
									LEFT JOIN ruderer r6 ON (m.`ruderer6_ID` = r6.`ID`) \
									LEFT JOIN ruderer r7 ON (m.`ruderer7_ID` = r7.`ID`) \
									LEFT JOIN ruderer r8 ON (m.`ruderer8_ID` = r8.`ID`) \
									LEFT JOIN ruderer rS ON (m.`ruderers_ID` = rS.`ID`) \
									LEFT JOIN gewichte g ON (g.`Ruderer_ID` = rS.`ID` AND DATEDIFF(g.`Datum`, l.`SollStartZeit`) = 0) \
									WHERE s.Rennen = ? AND s.Lauf = ? \
									ORDER BY m.Abgemeldet ASC, s.Bahn ASC";
				}
				else if (type == "result") {
					var query2 = "	SELECT e.Bahn, m.BugNr, teams.Teamname, m.Abgemeldet, m.Nachgemeldet, z.Zeit as zielZeit, e.`Ausgeschieden` AS ausgeschieden, e.`Kommentar`, \
									m0.Position AS position_1, \
									m1.Position AS position_2, \
									m2.Position AS position_3, \
									z0.Zeit AS zeit_1, \
									z1.Zeit AS zeit_2, \
									z2.Zeit AS zeit_3, \
									CONCAT(r1.`VName`, ' ', r1.`NName`, ' (', r1.`JahrG`, ')') as r1_string, \
									CONCAT(r2.`VName`, ' ', r2.`NName`, ' (', r2.`JahrG`, ')') as r2_string, \
									CONCAT(r3.`VName`, ' ', r3.`NName`, ' (', r3.`JahrG`, ')') as r3_string, \
									CONCAT(r4.`VName`, ' ', r4.`NName`, ' (', r4.`JahrG`, ')') as r4_string, \
									CONCAT(r5.`VName`, ' ', r5.`NName`, ' (', r5.`JahrG`, ')') as r5_string, \
									CONCAT(r6.`VName`, ' ', r6.`NName`, ' (', r6.`JahrG`, ')') as r6_string, \
									CONCAT(r7.`VName`, ' ', r7.`NName`, ' (', r7.`JahrG`, ')') as r7_string, \
									CONCAT(r8.`VName`, ' ', r8.`NName`, ' (', r8.`JahrG`, ')') as r8_string, \
									CONCAT(rS.`VName`, ' ', rS.`NName`, ' (', rS.`JahrG`, ')') as rS_string, \
									IF(l.`IstStartZeit` IS NULL, 0, 1) AS hasStarted \
									FROM startlisten s \
									INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = s.Regatta_ID \
									LEFT JOIN ergebnisse e ON (e.Lauf = s.Lauf AND e.Regatta_ID = s.Regatta_ID AND e.Rennen = s.Rennen AND e.`TNr` = s.`TNr`) \
									LEFT JOIN laeufe l ON (l.Lauf = s.Lauf AND l.Regatta_ID = s.Regatta_ID AND l.Rennen = s.Rennen) \
									INNER JOIN rennen r ON (r.`Regatta_ID` = s.`Regatta_ID` AND r.`Rennen` = s.`Rennen`) \
									LEFT JOIN zeiten z ON (z.`Regatta_ID` = s.`Regatta_ID` AND z.Rennen = s.Rennen \
										AND s.Lauf = z.Lauf AND s.`TNr` = z.`TNr` AND z.`MesspunktNr` = r.`ZielMesspunktNr`) \
									LEFT JOIN meldungen m ON (s.`TNr` = m.`TNr` AND m.Regatta_ID = s.Regatta_ID AND m.Rennen = s.Rennen ) \
									LEFT JOIN teams ON (m.`Team_ID` = teams.`ID` AND teams.Regatta_ID = s.`Regatta_ID`) \
									LEFT JOIN zeiten z0 ON (z0.Regatta_ID = e.Regatta_ID AND z0.Rennen = e.Rennen AND e.Lauf = z0.Lauf \
										AND e.TNr = z0.TNr AND z0.MesspunktNr = 1) \
									LEFT JOIN zeiten z1 ON (z1.Regatta_ID = e.Regatta_ID AND z1.Rennen = e.Rennen AND e.Lauf = z1.Lauf \
										AND e.TNr = z1.TNr AND z1.MesspunktNr = 2) \
									LEFT JOIN zeiten z2 ON (z2.Regatta_ID = e.Regatta_ID AND z2.Rennen = e.Rennen AND e.Lauf = z2.Lauf \
										AND e.TNr = z2.TNr AND z2.MesspunktNr = 3) \
									LEFT JOIN messpunkte m0 ON (m0.Regatta_ID = z0.Regatta_ID AND z0.MesspunktNr = m0.MesspunktNr) \
									LEFT JOIN messpunkte m1 ON (m1.Regatta_ID = z1.Regatta_ID AND z1.MesspunktNr = m1.MesspunktNr) \
									LEFT JOIN messpunkte m2 ON (m2.Regatta_ID = z2.Regatta_ID AND z2.MesspunktNr = m2.MesspunktNr) \
									INNER JOIN ruderer r1 ON (m.`ruderer1_ID` = r1.`ID`) \
									LEFT JOIN ruderer r2 ON (m.`ruderer2_ID` = r2.`ID`) \
									LEFT JOIN ruderer r3 ON (m.`ruderer3_ID` = r3.`ID`) \
									LEFT JOIN ruderer r4 ON (m.`ruderer4_ID` = r4.`ID`) \
									LEFT JOIN ruderer r5 ON (m.`ruderer5_ID` = r5.`ID`) \
									LEFT JOIN ruderer r6 ON (m.`ruderer6_ID` = r6.`ID`) \
									LEFT JOIN ruderer r7 ON (m.`ruderer7_ID` = r7.`ID`) \
									LEFT JOIN ruderer r8 ON (m.`ruderer8_ID` = r8.`ID`) \
									LEFT JOIN ruderer rS ON (m.`ruderers_ID` = rS.`ID`) \
									WHERE s.Rennen = ? AND s.Lauf = ? \
									ORDER BY m.Abgemeldet ASC, ISNULL(z.Zeit), z.`Zeit` ASC, zeit_3 ASC, zeit_2 ASC, zeit_1 ASC, e.Bahn ASC, teams.`Teamname`;";
				}
				
				connection.query(query2, [rennen_id, row.Lauf], function (err, rows2) {
					if (err) {
						console.log(err);
					}
					else if (rows2.length == 0 || (rows2[0].hasStarted == 0 && type == "result" && rows2[0].zeit_1 == null)) {
						//delete ret[row.Lauf];
						callback();
					}
					else {
						async.each(rows2,
							function(row2, callback) {
								// race has not been finished yet but there are already times available
								if (row2.hasStarted == 0 && row2.zeit_1 != null && type == "result") {
									section.general.interim = true;
								}
							}
						);
						section.boote = rows2;
						ret.push(section);
						callback();
					}
				});
			},
			function(err) {
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

// creates an object that will contain the error message. if it is
// delivered to the client it will be displayed
function createError(header, msg) {
	var ret = {
		general: {
			"header" : header,
			"msg" : msg
		}
	}
	return ret;
}

// returns an array of all the sections that will be done.
function getAllSections(callback) {
	var query = "SELECT CONVERT(CONCAT(ab.Rennen, '-', ab.Lauf), CHAR) as id, ab.Rennen, ab.Lauf, l.SollStartZeit, \
				 CONCAT(pL.Wert, ' ', SUBSTRING(l.Lauf, 2)) AS lauf_pretty, \
				 r.NameK, r.NameD, \
				 IF(l.`IstStartZeit` IS NULL, 0, 1) AS hasStarted \
				 FROM ablauf ab \
				 INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = ab.Regatta_ID \
				 INNER JOIN laeufe l ON (ab.Rennen = l.Rennen AND l.Lauf = ab.Lauf AND ab.Regatta_ID = l.Regatta_ID) \
				 INNER JOIN parameter pL ON (pL.Sektion = 'Uebersetzer_Lauftypen' AND pL.Schluessel = SUBSTRING(l.Lauf,1,1)) \
				 INNER JOIN rennen r ON (r.Regatta_ID = ab.Regatta_ID AND r.Rennen = ab.Rennen) \
				 WHERE ab.publish >= 1 \
				 ORDER BY ab.ORDER ASC, l.SollStartZeit";
	connection.query(query, function(err, rows) {
		if (err) {
			console.log(err);
		}
		callback(rows);
	});			 
}

function getAllRaces(callback) {
	var query = "SELECT r.Rennen as id, r.Rennen as rennen, r.NameK as bootsklasse, r.NameD as nameGerman, r.NameE as nameEnglish \
				 FROM rennen r \
				 INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = r.Regatta_ID \
				 ORDER BY r.Rennen ASC";
	connection.query(query, function(err, rows) {
		callback(rows);
	});
}

module.exports.getRaceByID = getRaceByID;
module.exports.getCurrentRace = getCurrentRace;
module.exports.getAllSections = getAllSections;
module.exports.getAllRaces = getAllRaces;
module.exports.getSections = getSections;