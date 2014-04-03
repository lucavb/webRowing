var mysql = require('mysql');
var async = require("async");

var connection = mysql.createConnection({
	host : 'localhost',
	user : 'php',
	password : 'php'
})

connection.connect();
connection.query("USE perp");
connection.query("SET NAMES 'UTF8'");


function getCurrentRace(callback) {
	var query = "SELECT l.Regatta_ID, l.Rennen, l.Lauf, l.SollStartZeit, r.NameD, r.NameK, r.NameE, m.Position \
				FROM startlisten s \
				INNER JOIN laeufe l ON (s.Regatta_ID = l.Regatta_ID AND s.Rennen = l.Rennen AND s.Lauf = l.Lauf) \
				LEFT JOIN rennen r ON (l.Regatta_ID = r.Regatta_ID AND l.Rennen = r.Rennen) \
				LEFT JOIN regatten ON l.Regatta_ID = regatten.ID \
				INNER JOIN parameter p ON p.Sektion = 'Global' AND p.Schluessel = 'AktRegatta' AND p.Wert = l.Regatta_ID \
				INNER JOIN messpunkte m ON (m.Regatta_ID = s.Regatta_ID AND r.ZielMesspunktNr = m.MesspunktNr) \
				WHERE l.`IstStartZeit` IS NOT NULL \
				ORDER BY  l.`SollStartZeit` DESC, l.Rennen ASC \
				LIMIT 1";
	connection.query(query, function(err, rows) {

		getRaceByID(rows[0].Rennen, function(ret) {
			callback(ret);
		})
	});
}


function getRaceByID(id, callback) {
	var ret = start = {
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
				 WHERE l.Rennen = ? \
				 LIMIT 1";
	connection.query(query, [id], function (err, rows) {
		if (err) {
			callback(retModel.start);
		}
		else {

			ret.general = rows[0];
			ret.general.typ = "ergebniss";
			getRace(34, id, null, function(value) {
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
				 WHERE laeufe.Rennen = ? AND laeufe.Regatta_ID = ? \
				 ORDER BY  laeufe.`SollStartZeit` ASC";
	connection.query(query, [rennen_id, regatta_id], function (err, rows) {
		var counter = rows.length;
		async.each(rows,
			function(row, callback) {
				ret[row.Lauf] = { "general" : "", "boote" : {}};
				ret[row.Lauf].general = row;

				var query2 = "	SELECT e.Bahn, meldungen.BugNr, teams.Teamname, meldungen.Abgemeldet, meldungen.Nachgemeldet, z.`MesspunktNr`, z.Zeit, e.`Ausgeschieden`, e.`Kommentar` \
										FROM ergebnisse e \
										LEFT JOIN zeiten z ON (z.`Regatta_ID` = e.`Regatta_ID` AND z.Rennen = e.Rennen AND e.Lauf = z.Lauf AND e.`TNr` = z.`TNr`) \
										INNER JOIN rennen r ON (r.`Regatta_ID` = e.`Regatta_ID` AND r.`Rennen` = e.`Rennen` AND r.`ZielMesspunktNr` = z.`MesspunktNr` OR r.`Regatta_ID` = e.`Regatta_ID` AND r.`Rennen` = e.`Rennen` AND z.`MesspunktNr` IS NULL) \
										LEFT JOIN meldungen ON (e.`TNr` = meldungen.`TNr` AND meldungen.Regatta_ID = e.Regatta_ID AND meldungen.Rennen = e.Rennen ) \
										LEFT JOIN teams ON (meldungen.`Team_ID` = teams.`ID` AND teams.Regatta_ID = e.`Regatta_ID`) \
										WHERE e.Rennen = ? AND e.Lauf = ? AND e.Regatta_ID = ? \
										ORDER BY ISNULL(z.`Zeit`), z.`Zeit` ASC, teams.`Teamname`";
				connection.query(query2, [rennen_id, row.Lauf, regatta_id], function (err, rows2) {
					async.each(rows2,
						function(row2, callback) {
							if (row2.Abgemeldet == 0) {
								delete row2.Abgemeldet;
							}
							if (row2.Nachgemeldet == 0) {
								delete row2.Nachgemeldet;
							}
							if (row2.Ausgeschieden == "") {
								delete row2.Ausgeschieden;
								delete row2.Kommentar;
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
					callback(ret);
				}
			});
		

	});
	
}


module.exports.getRaceByID = getRaceByID;
module.exports.getCurrentRace = getCurrentRace;








