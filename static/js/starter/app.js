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
		test : function() {
			alert("application controller");
		}
 	}
});

App.SingleSectionController = Ember.Controller.extend({
	needs : ["sectionsIndex"],
	actions : {
		test : function () {
			var controller = this.get("controllers.sectionsIndex");
			var currentModel = this.get("model");
			var currentSectionId = currentModel.section.general.Rennen + "-" + currentModel.section.general.Lauf;
			var self = this;
			this.store.find("section").then(function(model) {
				var section = this.store.getById("section", currentSectionId);
				var index = model.indexOf(section);
				var new_model = model.objectAt(index + 1);
				if (new_model != undefined) {
					self.transitionToRoute("singleSection", new_model.get("Rennen"), new_model.get("Lauf"));
				}
			});
		}
	}
});

var test;

App.SectionsIndexController = Ember.ArrayController.extend({

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
		var model = this.store.find("section");
		return model;
	}
});

App.SingleSectionRoute = Ember.Route.extend({
	model : function(params) {
		return this.store.find("startlist", params.race_id).then(function(model) {
			var sections = model.getProperties("abteilungen").abteilungen;
			for (var i = 0; i < sections.length; i++) {
				if (sections[i].general.Lauf == params.section_id) {
					var back = {
						"general" : model.getProperties("general").general,
						"section" : sections[i]
					}
					return back;
				}
			}
		});
	},
	setupController : function(controller, model) {
		controller.set('model', model);
	},
	actions : {
		test : function () {
			alert("section route");
		}
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

App.Startlist = DS.Model.extend({
	general : attr(),
	abteilungen : attr(),
	section : attr(),
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

// socket.io stuff

socket.on("update", function(data) {
	store.push(data.model, data.payload);
});