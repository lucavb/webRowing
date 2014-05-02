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
		console.log("    info    - Connection to the database has been established");
	}
});

module.exports.connection = connection;