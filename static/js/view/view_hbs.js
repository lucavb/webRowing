// register a handlebars helper for moment js
Ember.Handlebars.helper("momentFormat", function (timestamp) {
    return moment(timestamp).format('LLL');
});
Ember.Handlebars.helper("momentCalendar", function (timestamp) {
    return moment(timestamp).calendar();
});
Ember.Handlebars.helper("momentNow", function (timestamp) {
	return moment(timestamp).fromNow();
});

// every other
Handlebars.registerHelper("everyOther", function (amount, scope) {
	var index = scope.data.view.contentIndex;
    if ( ++index % amount) 
        return scope.inverse(this, scope);
    else 
        return scope.fn(this, scope);
});
// row color not that easy after all
Ember.Handlebars.helper("detectRowColor", function (boat) {
	if (boat.Abgemeldet == 1 && boat.zielZeit == null) {
		return new Handlebars.SafeString("<tr class='danger'>");
	}
	else if (boat.Nachgemeldet == 1) {
		return new Handlebars.SafeString('<tr class="success">');
	}
	else {
		return new Handlebars.SafeString("<tr>");
	}
});
// interim times -> special displaying
Handlebars.registerHelper("interimTimes", function (general, options) {
	var value = Ember.get(this, general);
	if (value.interim) {
		return options.inverse(this);
	}
	else {
		return options.fn(this);
	}
});
// returns the newest interim time of the boat and the place of measure
Ember.Handlebars.helper("latestInterim", function (boat) {
	if (boat.zeit_3 != null) {
		return boat.zeit_3 + " (bei " + boat.position_3 + "m)";
	}
	else if (boat.zeit_2 != null) {
		return boat.zeit_2 + " (bei " + boat.position_2 + "m)";
	}
	else if (boat.zeit_1 != null) {
		return boat.zeit_1 + " (bei " + boat.position_1 + "m)";
	}
	else {
		return "-";
	}
});
// if equals helper
Handlebars.registerHelper('if_eq', function(a, b, opts) {
	var value = Ember.get(this, a); // resolve this 
    if(value == b) // Or === depending on your needs
        return opts.fn(this);
    else
        return opts.inverse(this);
});
// determines the output for the finish time column(did not start, finish time, ...)
Ember.Handlebars.helper("endTime", function (boat) {
	if (boat.zielZeit != null) {
		return boat.zielZeit;
	}
	if (boat.zielZeit == null && boat.ausgeschieden != 1 && boat.Abgemeldet != 1) {
		return "Nicht am Start erschienen";
	}
	else if (boat.zielZeit == null && boat.ausgeschieden == 1) {
		return boat.Kommentar;
	}
	else if (boat.zielZeit == null && boat.ausgeschieden != 1 && boat.Abgemeldet == 1) {
		return "Abgemeldet";
	}
});

Ember.Handlebars.helper("ruderer", function (obj) {
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
	return new Handlebars.SafeString(ret);
});