webRowing by Luca Becker


this project generates a web page for the perp regatta software.
for further information on perp see perp.de


PREPARATION

node.js dependencies

please install socket.io, express, async and the mysql module in the main folder.
also add a file called 'mysql_conf' with the following structure
{
	"host" : "YOUR HOSTNAME",
	"username" : "YOUR USERNAME",
	"password" : "YOUR PASSWORD",
	"database" : "YOUR DATABASENAME"
}


html dependencies

also place bootstrap in to the static folder
jquery and handlebars are also required for the html file
the concrete paths can be seen from the index.html in the static folder


STARTING

simply run 'node server.js'
