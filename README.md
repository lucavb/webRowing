# webRowing 
### by Luca Becker


This project generates a web page containing results and startlists based on the database of the [perp](http://perp.de/) regatta software. In addition it does also provide a way to broadcast information.

This project doesn't work with the perp database alone. You will have to either modify the getCurrentRace method (check some older versions, startlist.js or result.js might still have the query) or run the [sortRaces]( https://github.com/lucavb/sortRaces ) project. sortRaces allows you to hide certain sections and sort them in case one section is squezzed in somewhere and what not. The second solution is recommended.


## Preparation

### node.js dependencies

please install [socket.io](https://www.npmjs.org/package/socket.io) (0.9.16 | for 1.0.x please see this [branch](https://github.com/lucavb/webRowing/tree/socket.io-v1-testing)), [express](https://www.npmjs.org/package/express), [async](https://www.npmjs.org/package/async), [moment](https://www.npmjs.org/package/moment) and the [mysql](https://www.npmjs.org/package/mysql) module in the main folder.
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

Please place [Bootstrap 3](http://getbootstrap.com/) into the static folder; [jQuery]( https://jquery.com/ ), [handlebars]( http://handlebarsjs.com/ ) and [moment]( http://momentjs.com/ ) are also required for the project to work.
The concrete paths can be seen from the index.html file in the static folder.

### Further stuff

Also you might wanna replace the string for the organizer of the regatta.

There is no translation currently. But since i used handlebars all that needs to be done is to replace the strings. 

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

## Deployment

First of all you might wanna move the admin.html file. It can not cause that much harm but you never know.

As to socket.io I recommend using the suggestion made on this site [here](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO#recommended-production-settings).

I recommend [forever](https://github.com/nodejitsu/forever) to keep the server up and running. If you want to use express as your webserver you are done. 

Most people do use apache as their webserver. However this is no problem. Edit the script.js files for both pages (view.html and starter.html) so the websocket connection is made to the correct server and port. Also you will have to copy the static folder to your Webroot, so apache can server those files. Of course you do have to start the server. Then you should be good to go.

As to other Webservers I haven't tried it yet. But I don't see any reasons why i shouldn't be the same procedure as with apache.
