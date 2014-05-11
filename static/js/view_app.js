var App = Ember.Application.create();

App.Data = Ember.Object.extend({
	general : null,
	sections : null
});

App.Router.map(function() {
	this.resource("race", function() {
		this.resource("startlists");
		this.resource("results");
		this.resource("resultsDetails");
	});
	this.resource("resultsDetails");
});

App.IndexRoute = Ember.Route.extend({
	beforeModel: function() {
		this.transitionTo('startlists');
	}
});

App.StartlistsRoute = Ember.Route.extend({
	beforeModel : function() {
		socket.emit('request', { "type" : "startlist", "race_id" : "0"});
	},
	model : function () {
		var startlist = App.Data.create({
			"dummy" : "element",
			general : null,
			sections : null
		});
		startlistOutside = startlist;
		return startlist;
	}
});



// change us :P
var raceOutside;
var startlistOutside;
var resultOutside;
var newsOutside;

var socket = io.connect();



socket.on("request", function(data) {
	startlistOutside.set("general", data.general);
	startlistOutside.set("sections", data.abteilungen);

});

Ember.Handlebars.helper('console', function(value) {
    console.log(value);
});

Handlebars.registerHelper("everyOther", function (amount, scope) {
	var index = scope.data.view.contentIndex;
    if ( ++index % amount) 
        return scope.inverse(this, scope);
    else 
        return scope.fn(this, scope);
});