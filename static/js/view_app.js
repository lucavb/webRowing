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

moment.lang("de");
var autoMode = true;
var socket = io.connect();



socket.on("request", function(data) {
	processRace(data);
	raceOutside.set("general", data.general);
	raceOutside.set("sections", data.abteilungen);
});

function processRace(race) {
	race.general.anzahl_abteilungen = race.abteilungen.length;
	race.general.anzahl_boote = 0;
	$.each(race.abteilungen, function(key, abteilung ) {
		race.general.anzahl_boote += abteilung.boote.length;
	});
}



