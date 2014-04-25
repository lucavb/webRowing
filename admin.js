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
connection.query("SET NAMES 'UTF8'");

function setState (string) {
	string = string.toLowerCase();
	console.log(string);
	var regEx = new RegExp("[0-9]+[;][a,q,v,s,f,z,h][0-9]+[;][0-2]");
	if (!regEx.test(string)) {
		console.log("    error   - the string was found invalid");
		return;
	}
	// gather information
	var arr = string.split(";");
	console.log(arr);
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
			console.log("    info    - Rennen ");
		}
	});
}

module.exports.setState = setState;