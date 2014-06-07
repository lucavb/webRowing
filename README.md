# webRowing 
### by Luca Becker


This project generates a web page containing results and startlists based on the database of the [perp](http://perp.de/) regatta software. In addition it does also provide a way to broadcast information.

This project doesn't work with the regular perp database. You will have to either modify the getCurrentRace method (check some older versions, startlist.js or result.js might still have the query) or run the [sortRaces]( https://github.com/lucavb/sortRaces ) project. sortRaces allows you to hide certain sections and sort them in case one section is squezzed in somewhere and what not. The second solution is recommended.


## Preparation

### node.js dependencies

please install [socket.io](https://www.npmjs.org/package/socket.io) (apparently it does now work also with socket.io@1.0.2), [express](https://www.npmjs.org/package/express), [async](https://www.npmjs.org/package/async), [moment](https://www.npmjs.org/package/moment) and the [mysql](https://www.npmjs.org/package/mysql) module in the main folder.
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

Please place [Bootstrap 3](http://getbootstrap.com/) into the static folder; [jQuery]( https://jquery.com/ ), [handlebars]( http://handlebarsjs.com/ ) and [moment]( http://momentjs.com/ ), [emberjs]( http://emberjs.com/ ) and [emberdata] ( https://github.com/emberjs/data/releases ) are also required for the project to work.
The concrete paths can be seen from the index.html file in the static folder.

### Further stuff

Also you might wanna replace the string for the organizer of the regatta.

There is no translation currently. But since this project uses handlebars all that needs to be done is to replace the strings. 

## Starting (development)

simple. either run:
<pre>
node server.js
</pre>
or run:
<pre>
nodejs server.js
</pre>
depeneding on your node.js installation.

## REST

See this [file] (REST.md) for further information on this topic.

## Deployment

First of all you might wanna move the admin.html file. It can not cause that much harm but you never know.

### socket.io

As to socket.io I recommend using the suggestion made on this [here](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO#recommended-production-settings).

### ember.js

Of course you want to include the production copies of ember and ember data. this will also keep ember from showing debug information in the console

### Webserver

This branch provides a REST API. If you want to use express as your webserver you will not have read any further.

However if you want to use apache (for instance) you will either have to tell it to have express answer certain requests. Do not forgot to fix certain things like (paths, the url for ember's restadapter).

### Running the server

To keep the server up and running we recommend [forever](https://github.com/nodejitsu/forever).
<pre>
forever start server.js
</pre>
is enough to fire the server up and forever will automatically gather all the output and put it into a log file.