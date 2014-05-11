var App = Ember.Application.create();

App.Data = Ember.Object.extend({
	general : null,
	sections : null
});

App.ApplicationController = Ember.Controller.extend({
	actions: {
		toggleUpdate : function () {
			autoMode = !autoMode;
		},
		getRace : function () {
			currentRace = this.get("race_id");
			autoMode = false;
			socket.emit("request", { "type" : this.get("currentPath"), "race_id" : currentRace});
		}
	}
});

App.Router.map(function() {
	this.resource("startlists");
	this.resource("results");
	this.resource("resultsDetails");
	this.resource("news");
});

App.IndexRoute = Ember.Route.extend({
	beforeModel: function() {
		this.transitionTo('startlists');
	}
});

App.StartlistsRoute = Ember.Route.extend({
	beforeModel : function() {
		socket.emit('request', { "type" : "startlists", "race_id" : currentRace});
	},
	model : function () {
		var startlist = App.Data.create({
			"dummy" : "element",
			general : null,
			sections : null
		});
		raceOutside = startlist;
		return startlist;
	}
});

App.ResultsRoute = Ember.Route.extend({
	beforeModel : function() {
		socket.emit('request', { "type" : "results", "race_id" : currentRace});
	},
	model : function () {
		var results = App.Data.create({
			"dummy" : "element",
			general : null,
			sections : null
		});
		raceOutside = results;
		return results;
	}
});

App.ResultsDetailsRoute = Ember.Route.extend({
	beforeModel : function() {
		socket.emit('request', { "type" : "results", "race_id" : currentRace});
	},
	model : function () {
		var results = App.Data.create({
			"dummy" : "element",
			general : null,
			sections : null
		});
		raceOutside = results;
		return results;
	}
});



// change us :P
var raceOutside;
var currentRace = 0;
var autoMode = true;
var socket = io.connect();



socket.on("request", function(data) {
	data.general.anzahl_abteilungen = data.abteilungen.length;
	raceOutside.set("general", data.general);
	raceOutside.set("sections", data.abteilungen);
});

/**
 *
 *handlebars helpers
 *
 */


Ember.Handlebars.helper('console', function(value) {
    console.log(value);
});

Handlebars.registerHelper("ruderer", function (obj) {
	var ret = "";
	ret += obj.r1_string;
	for (var i = 2; i <= 8; i++) {
		if (!obj.hasOwnProperty("r" + i + "_string") || obj["r" + i + "_string"] == null) {
			break;
		}
		ret += ", " + obj["r" + i + "_string"];
	}
	if (obj.hasOwnProperty("rS_string") && obj.rS_string != null) {
		ret += ", St. " + obj.rS_string;
	}
	return ret;
});
Handlebars.registerHelper("everyOther", function (amount, scope) {
	var index = scope.data.view.contentIndex;
    if ( ++index % amount) 
        return scope.inverse(this, scope);
    else 
        return scope.fn(this, scope);
});