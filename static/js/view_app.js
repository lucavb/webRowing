var App = Ember.Application.create();

// Router

App.Router.map(function() {
	this.resource("race", function() {
		this.resource("startlists", function() {
			this.resource("startlist", {path : '/:race_id'});
		});
		this.resource("results", function() {
			this.resource("result", {path : '/:race_id'});
		});
	});
});

App.StartlistsRoute = Ember.Route.extend({

});

App.StartlistRoute = Ember.Route.extend({
	model: function(params) {
		alert(params.race_id);
		//this.store.find("abc", 1);
	}
});

App.store = DS.Store.create({
	adapter: 'ApplicationAdapter'
});

App.ApplicationAdapter = DS.Adapter.extend({
	find: function(store, type, id) {
		alert("find method called");
		return null;
	}
});