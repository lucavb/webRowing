
// setting up mysql connection
var connection = require("./mysql_conn.js").connection;

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
	var query = "UPDATE ablauf SET publish = ? WHERE Regatta_ID = 38 AND Rennen = ? AND LOWER(Lauf) = ? ";
	connection.query(query, [arr[2], arr[0], arr[1]], function(err, rows) {
		if (err) {
			console.log("    error   - The query returned the following error.");
			console.log(err);
		}
		else {
			console.log("    info    - Change visibility: Race " + arr[0] + " Section " + arr[1] + " -> " + arr[2]);
		}
	});
}

module.exports.setState = setState;