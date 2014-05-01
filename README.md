# webRowing 
### by Luca Becker


<p>This project generates a web page containing results and startlists based on the database of the perp regatta software. For further information on perp see http://perp.de/ . In addition it does also provide a way to broadcast information.</p>
<p>This project doesn't work with the perp database alone. You will need to either modify the getCurrentRace method (check some old versions, startlist.js or result.js might still have the query) or run the sortRaces project ( https://github.com/lucavb/sortRaces ). This project allows you to hide certain sections and sort them in case one section is squezzed in somewhere. The second solution is recommended.</p>


## Preparation

### node.js dependencies

please install socket.io (obviously this version supports socket.io v1.0.0-pre2), express, async, moment and the mysql module in the main folder.
also add a file called 'mysql_conf' with the following structure
<pre>
{
	"host" : "YOUR HOSTNAME",
	"user" : "YOUR USERNAME",
	"password" : "YOUR PASSWORD",
	"database" : "YOUR DATABASENAME"
}
</pre>

### html dependencies

<p>Please place Bootstrap 3 ( http://getbootstrap.com/ ) into the static folder; jQuery ( https://jquery.com/ ), handlebars ( http://handlebarsjs.com/ ) and momemnt ( http://momentjs.com/ ) are also required for the project to work.
The concrete paths can be seen from the index.html in the static folder.</p>

### Further stuff

<p>Also you might wanna replace the string for the organizer of the regatta.</p>

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
