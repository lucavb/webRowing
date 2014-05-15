var App = Ember.Application.create();
var attr = DS.attr;

// Router

App.Router.map(function() {
	this.resource("startlists", function() {
		this.resource("startlist", {path : '/:race_id'});
	});
	this.resource("results", function() {
		this.resource("result", {path : '/:race_id'});
	});});

App.StartlistsRoute = Ember.Route.extend({
	model : function() {
		this.store.find("startlists");
	}
});

App.StartlistRoute = Ember.Route.extend({
	model: function(params) {
		this.store.find("startlist", params.race_id);
	}
});


App.Startlist = DS.Model.extend({
	general : attr(),
	abteilungen : attr()
});

App.Startlists = DS.Model.extend({
	Rennen : attr(),
	Lauf : attr(),
	SollStartZeit : attr(),
	hasStarted : attr()
});