// import stuff
var mysql = require('mysql');
var fs = require("fs");

// setting up mysql connection
var mysql_conf = JSON.parse(fs.readFileSync("./mysql_conf"));
var connection = mysql.createConnection(mysql_conf);
connection.connect(function(err) {
	if (err) {
		console.log("    error   - couldn't connect to the server. that's bad.");
	}
});
connection.query("USE " + mysql_conf.database);
connection.query("SET NAMES 'UTF8'", function(err, rows) {
	if (!err){
		console.log("    info    - Connection to the database for admin.js has been established");
	}
});

function setState (string) {
	string = string.toLowerCase();
	var regEx = new RegExp("[0-9]+;[a,q,v,s,z,h][0-9]+;[0-2]");
	var regEx2 = new RegExp("[0-9]+;[f][a-z]+;[0-2]");
	if (!regEx.test(string) && !regEx2.test(string)) {
		console.log("    error   - the string was found invalid");
		return;
	}
	// gather information
	var arr = string.split(";");
	var query = "UPDATE ablauf SET publish = ? WHERE Regatta_ID = 37 AND Rennen = ? AND LOWER(Lauf) = ? ";
	connection.query(query, [arr[2], arr[0], arr[1]], function(err, rows) {
		if (err || rows.length == 0) {
			console.log("    warning - there was no current race found");
			callback(createError("Entschuldigung", "Es wird kein weiteres Rennen mehr durchgeführt."));
		}
		else if (err) {
			console.log("    error   - The query returned the following error.");
			console.log(err);
		}
		else {
			console.log("    info    - Change visibility: Race " + arr[0] + " Section " + arr[1] + " -> " + arr[2]);
		}
	});
}

module.exports.setState = setState;