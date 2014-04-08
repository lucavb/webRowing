# webRowing 
### by Luca Becker


<p>This project generates a web page containing results and startlists based on the database of the perp regatta software. For further information on perp see http://perp.de/ .</p>
<p>This project doesn't work with the perp database alone. You will need to either modify the getCurrentRace method (check some old versions, startlist.js or result.js might still have the query) or run the sortRaces project ( https://github.com/lucavb/sortRaces ). This project allows you to hide certain sections and sort them in case one section is squezzed in somewhere. The second solution is recommended.</p>


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

<p>Please place Bootstrap 3 ( http://getbootstrap.com/ ) into the static folder; jQuery ( https://jquery.com/ ) and handlebars ( http://handlebarsjs.com/ ) are also required for the project to work.
The concrete paths can be seen from the index.html in the static folder.</p>


## Starting

simple. either run:
<pre>
node server.js
</pre>
or run:
<pre>
nodejs server.js
</pre>
depeneding on your node.js installation.
