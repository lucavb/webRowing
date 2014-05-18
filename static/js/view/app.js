var App = Ember.Application.create({

});
var attr = DS.attr;
var socket = io.connect();
var store;

// Router

App.Router.map(function() {
	this.resource("races");
	this.resource("startlist", {path : 'startlists/:race_id'});
	this.resource("result", {path : 'results/:race_id'});
	this.resource("resultDetail", {path : 'resultDetails/:race_id'});
	this.resource("news");
});




// Controller




App.ApplicationController = Ember.Controller.extend({
	actions: {
		getRace : function() {
			var race = this.get("wishRace");
			this.transitionToRoute(this.get("lastRoute"), race);
		},
		toggleUpdate : function() {
			var autoMode = this.get("autoMode");
			autoMode = !autoMode;
			controller.set("autoMode", autoMode);
			if (autoMode) {

			}
		}
 	}
});




// Routes






App.ApplicationRoute = Ember.Route.extend({
	afterModel : function() {
		store = this.store; // gives me access to the store from the outside for socket.io
		this.controllerFor("application").set("autoMode", true); // set automode value
	}
});

App.IndexRoute = Ember.Route.extend({
	beforeModel: function() {
		this.transitionTo('races'); // reroute stuff
	}
});

App.RacesRoute = Ember.Route.extend({
	beforeModel : function () {
		var controller = this.controllerFor('application');
		controller.set("lastRoute", "startlist"); // setting the lastRoute
		// from races you will go to startlist for now
	},
	model : function() {
		return this.store.find("race");
	}
});

App.StartlistRoute = Ember.Route.extend({
	beforeModel : function (obj) {
		var controller = this.controllerFor('application');
		controller.set("lastRoute", "startlist"); // setting the lastRoute

		var lastRace = controller.get('lastRace');
		if (obj.params.startlist.race_id == -1 && lastRace != undefined) {
			this.transitionTo("startlist", lastRace);
		}
		else if(obj.params.startlist.race_id == -1) {
			this.transitionTo("startlist", 1);
		}
	},
	model: function(params) {
		// writing down the last race
		this.controllerFor("application").set("lastRace", params.race_id);
		return this.store.find("startlist", params.race_id);
	}
});

App.ResultRoute = Ember.Route.extend({
	beforeModel : function (obj) {
		var controller = this.controllerFor('application');
		controller.set("lastRoute", "result");

		var lastRace = controller.get('lastRace');
		if (obj.params.result.race_id == -1 && lastRace != undefined) {
			this.transitionTo("result", lastRace);
		}
		else if(obj.params.result.race_id == -1) {
			this.transitionTo("result", 1); // request 1 if there has been no race requested before
		}
	},
	model: function(params) {
		this.controllerFor("application").set("lastRace", params.race_id); // write last race 
		return this.store.find("result", params.race_id);
	}
});

App.ResultDetailRoute = Ember.Route.extend({
	beforeModel : function (obj) {
		var controller = this.controllerFor('application');
		controller.set("lastRoute", "resultDetail");

		var lastRace = controller.get('lastRace');
		if (obj.params.resultDetail.race_id == -1 && lastRace != undefined) {
			this.transitionTo("resultDetail", lastRace);
		}
		else if(obj.params.resultDetail.race_id == -1) {
			this.transitionTo("resultDetail", 1); // request 1 if there has been no race requested before
		}
	},
	model: function(params) {
		this.controllerFor("application").set("lastRace", params.race_id); // write last race 
		return this.store.find("result", params.race_id);
	}
});

App.NewsRoute = Ember.Route.extend({
	model : function() {
		return this.store.find("news");		
	}
});


// Models




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

App.Race = DS.Model.extend({
	rennen : attr(),
	bootsklasse : attr(),
	nameGerman : attr(),
	nameEnglish : attr()
});

App.News = DS.Model.extend({
	header : attr(),
	msg : attr(),
	timestamp : attr()
});


// socket.io stuff

socket.on("update", function(data) {
	store.push(data.model, data.payload);
});