var App = Ember.Application.create();
var attr = DS.attr;
var socket = io.connect();
var store;

// Router

App.Router.map(function() {
	this.resource("races");
	this.resource("startlist", {path : 'startlists/:race_id'});
	this.resource("result", {path : 'results/:race_id'});
});

App.ApplicationRoute = Ember.Route.extend({
	afterModel : function() {
		store = this.store;
	}
});

App.ApplicationController = Ember.Controller.extend({

});

App.IndexRoute = Ember.Route.extend({
	actions: {
		switch_page : function() {
		},
		getRace : function() {
			alert("submit");
		}
	},
	beforeModel: function() {
		store = this.store; // allows me access to the store
		this.transitionTo('races');
	}
});

App.RacesRoute = Ember.Route.extend({
	model : function() {
		return this.store.find("race");
	}
});

App.StartlistRoute = Ember.Route.extend({
	beforeModel : function (obj) {
		var lastRace = this.controllerFor('application').get('lastRace');
		if (obj.params.startlist.race_id == -1 && lastRace != undefined) {
			this.transitionTo("startlist", lastRace);
			console.log("lastRace: " + lastRace);
		}
		else if(obj.params.startlist.race_id == -1) {
			this.transitionTo("startlist", 1);
		}
	},
	model: function(params) {
		this.controllerFor("application").set("lastRace", params.race_id);
		return this.store.find("startlist", params.race_id);
	}
});

App.ResultRoute = Ember.Route.extend({
	beforeModel : function (obj) {
		var lastRace = this.controllerFor('application').get('lastRace');
		if (obj.params.result.race_id == -1 && lastRace != undefined) {
			this.transitionTo("result", lastRace);
			console.log("lastRace: " + lastRace);
		}
		else if(obj.params.result.race_id == -1) {
			this.transitionTo("result", 1);
		}
	},
	model: function(params) {
		this.controllerFor("application").set("lastRace", params.race_id);
		return this.store.find("result", params.race_id);
	}
});

App.Startlist = DS.Model.extend({
	general : attr(),
	abteilungen : attr(),
	amountSections : function () {
		var abteilungen = this.get("abteilungen");
		return abteilungen.length;
	}.property('abteilungen'),
	amountBoats : function() {
		var abteilungen = this.get("abteilungen");
		var back = 0;
		$.each(abteilungen, function(key, abteilung ) {
			back = back + abteilung.boote.length;
		});
		return back;
	}.property("abteilungen")
});

App.Result = DS.Model.extend({
	general : attr(),
	abteilungen : attr(),
	result : null
});

App.Race = DS.Model.extend({
	rennen : attr(),
	bootsklasse : attr(),
	nameGerman : attr(),
	nameEnglish : attr()
});