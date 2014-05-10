var App = Ember.Application.create();

App.Data = Ember.Object.extend({
	data : null
});

App.Router.map(function() {
	this.resource("race", function() {
		this.resource("startlists");
		this.resource("results");
	});
  //this.resource("startlists");
  //this.resource("results");
  //this.resource("resultsDetails");
  this.resource("news");
});

App.IndexRoute = Ember.Route.extend({
  beforeModel: function() {
    this.transitionTo('startlists');
  }
});

App.RaceRoute = Ember.Route.extend({
	model : function () {
		var startlist = App.Data.create({
			"dummy" : "element",
			data : null
		});
		startlistOutside = startlist;
		return startlist;
	}
});

App.StartlistsRoute = Ember.Route.extend({
	model : function () {
		var startlist = App.Data.create({
			"dummy" : "element",
			data : null
		});
		startlistOutside = startlist;
		return startlist;
	}
});



// change us :P
var startlistOutside;
var resultOutside;
var newsOutside;

var socket = io.connect();

socket.emit('request', { "type" : "startlist", "race_id" : "0"});

socket.on("request", function(data) {
	console.log("setze neue daten");
	startlistOutside.set("data", data);
});

Ember.Handlebars.helper('console', function(value) {
    console.log(value);
});

Ember.Handlebars.helper("everyOther", function (index, amount, scope) {
    if ( ++index % amount) 
        return scope.inverse(this);
    else 
        return scope.fn(this);
});