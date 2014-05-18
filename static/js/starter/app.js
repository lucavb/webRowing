var App = Ember.Application.create({

});
var attr = DS.attr;
var socket = io.connect();
var store;

// Router

App.Router.map(function() {
	this.resource("sections", function() {
		this.resource("singleSection", {path : "/:race_id/:section_id"});
	});
});




// Controller




App.ApplicationController = Ember.Controller.extend({
	actions: {
		
 	}
});




// Routes






App.ApplicationRoute = Ember.Route.extend({
	afterModel : function() {
		store = this.store; // gives me access to the store from the outside for socket.io
	}
});

App.IndexRoute = Ember.Route.extend({
	beforeModel: function() {
		this.transitionTo('sections'); // reroute stuff
	}
});

App.SectionsIndexRoute = Ember.Route.extend({
	model : function() {
		return this.store.find("section");
	}
});

App.SingleSectionRoute = Ember.Route.extend({
	model : function(params) {
		alert(params.race_id + " " + params.section_id);
		return this.store.find("section", params.race_id + "/" + params.section_id);
	}
});




// Models

App.Section = DS.Model.extend({
	Rennen : attr(),
	Lauf : attr(),
	SollStartZeit : attr(),
	hasStarted : attr(),
	NameK : attr(),
	NameD : attr(),
	lauf_pretty : attr()
});

App.SingleSection = DS.Model.extend({

});

// socket.io stuff

socket.on("update", function(data) {
	store.push(data.model, data.payload);
});