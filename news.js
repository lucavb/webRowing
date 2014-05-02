// import
var fs = require("fs");
var news = [];
var moment = require('moment');

// one might wanna change this to something more secure
var secret = "test";

if (fs.existsSync('./news.store')) {
	news = JSON.parse(fs.readFileSync("./news.store"));
}
else {
	console.log('    info    - Starting off with an empty news array.');
	console.log('    info    - Creating one.');
	write2File();
}

// constantly updating the array in case one might wanna change something
// note that you will have to rebroadcast it
fs.watchFile("./news.store", function (current, previous) {
	console.log("    info    - The news file has been updated. Loading ...");
	news = JSON.parse(fs.readFileSync("./news.store"));
	console.log("    info    - Loaded!");
});

// adds news and removes the secret
function addNews (new_news) {
	if (new_news["secret"] != null) {
		delete new_news.secret;
	}
	new_news.timestamp = moment().format();
	news.push(new_news);
	write2File();
}

// returns the latest news
function getLastNews() {
	if (news.length > 0) {
		return news[news.length - 1];
	}
	else {
		return null;
	}
}

// returns a string representation of all news
function getAllNews() {
	return JSON.stringify(news);
}

// returns the amount of news stored
function amountNews() {
	return news.length;
}

// retruns a certain piece of information
function getByID (id) {
	if (isInt(id) && id < news.length) {
		return news[id];
	}
	else {
		return null;
	}
}

// checks if the value is an integer
function isInt(n) {
   return (n % 1 == 0);
}

// writes the news to a file so they won't get lost
function write2File () {
	fs.writeFile("./news.store", JSON.stringify(news), function() {
		console.log('    info    - Wrote news to file');
	});
}

// checks the secret of a given news
function validate (test_news) {
	return (test_news.secret == secret);
}

module.exports.addNews = addNews;
module.exports.getLastNews = getLastNews;
module.exports.amountNews = amountNews;
module.exports.validate = validate;
module.exports.getAllNews = getAllNews;