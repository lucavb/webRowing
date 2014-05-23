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
});

App.SingleSectionController = Ember.Controller.extend({
	needs : ["sectionsIndex"],
	actions : {
		nextSection : function () {

			this.advanceSection(1);
		},
		previousSection : function () {
			this.advanceSection(-1);
		}
	},
	advanceSection : function (delta) {
		var controller = this.get("controllers.sectionsIndex");
		var currentModel = this.get("model");
		var currentSectionId = currentModel.section.general.Rennen + "-" + currentModel.section.general.Lauf;
		var self = this;
		var currentlyInStore = this.store.all("section");
		// sections is empty -> load it!
		if (currentlyInStore.objectAt(0) == undefined) {
			this.store.find("section").then(function(model) {
				var section = this.store.getById("section", currentSectionId);
				var index = model.indexOf(section);
				var new_model = model.objectAt(index + delta);
				if (new_model != undefined) {
					self.transitionToRoute("singleSection", new_model.get("Rennen"), new_model.get("Lauf"));
				}
			});
		}
		// there is already something in the store. no need to bother the server
		else {

			var section = this.store.getById("section", currentSectionId);
			var index = currentlyInStore.indexOf(section);
			var new_model = currentlyInStore.objectAt(index + delta);
			
			if (new_model != undefined) {
				self.transitionToRoute("singleSection", new_model.get("Rennen"), new_model.get("Lauf"));
			}
		}
		
	}
});

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
		var currentlyInStore = this.store.all("section");
		// sections is empty -> load it!
		if (currentlyInStore.objectAt(0) == undefined) {
			return this.store.find("section");
		}
		// there is already something in the store. no need to bother the server
		else {
			return currentlyInStore;
		}
	}
});

App.SingleSectionRoute = Ember.Route.extend({
	model : function(params) {
		return this.store.find("startlist", params.race_id).then(function(model) {
			var sections = model.getProperties("abteilungen").abteilungen; // let's chop this
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
	if (data.model = "startlist") {
		store.push(data.model, data.payload); // this allows me to push data live into the store
	}
});