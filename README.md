# webRowing 
### by Luca Becker


<p>this project generates a web page for the perp regatta software. for further information on perp see http://perp.de/</p>
<p>This project doesn't work with the perp database alone. You will need to either modify the getCurrentRace method or run the sortRaces project ( https://github.com/lucavb/sortRaces ). This project allows you to hide certain sections and sort them in case one section is squezzed in somewhere.</p>


## Preparation

### node.js dependencies

please install socket.io, express, async and the mysql module in the main folder.
also add a file called 'mysql_conf' with the following structure
<pre>
{
	"host" : "YOUR HOSTNAME",
	"username" : "YOUR USERNAME",
	"password" : "YOUR PASSWORD",
	"database" : "YOUR DATABASENAME"
}
</pre>

### html dependencies

also place bootstrap in to the static folder
jquery and handlebars are also required for the html file
the concrete paths can be seen from the index.html in the static folder


# Starting

simply run 'node server.js'
