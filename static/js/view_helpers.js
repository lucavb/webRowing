Ember.Handlebars.helper("momentFormat", function (timestamp) {
    return moment(timestamp).format('LLL');
});
Ember.Handlebars.helper("momentCalendar", function (timestamp) {
    return moment(timestamp).calendar();
});
// generates a string containing all the rowers based on the obj handed over
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
// creates the string for toggle that appears when you hover of the finish time
Ember.Handlebars.helper("interimTimesToggle", function (boat) {
	var ret = "";
	if (boat.position_1 != null) {
		ret += boat.position_1 + "m: " + boat.zeit_1 + "<br />";
	}
	if (boat.position_2 != null) {
		ret += boat.position_2 + "m: " + boat.zeit_2 + "<br />";
	}
	if (boat.position_3 != null) {
		ret += boat.position_3 + "m: " + boat.zeit_3;
	}
	return new Handlebars.SafeString(ret);
});
Ember.Handlebars.helper('console', function(value) {
    console.log(value);
});

Handlebars.registerHelper("everyOther", function (amount, scope) {
	var index = scope.data.view.contentIndex;
    if ( ++index % amount) 
        return scope.inverse(this, scope);
    else 
        return scope.fn(this, scope);
});
// true if startlist, false otherwise
Handlebars.registerHelper("detectType", function (race, options) {
	if (race == "startlist") {
		return options.fn(this);
	}
	else {
		return options.inverse(this);
	}
});
// result compact or detail
Handlebars.registerHelper("resultDetail", function (options) {
	if (currentType == "result") {
		return options.inverse(this);
	}
	else if (currentType == "resultDetail") {
		return options.fn(this);
	}
});
// determines the output for the finish time column(did not start, finish time, ...)
Ember.Handlebars.helper("endTime", function (boat) {
	if (boat.ZielZeit != null) {
		return boat.ZielZeit;
	}
	if (boat.ZielZeit == null && boat.Ausgeschieden != 1 && boat.Abgemeldet != 1) {
		return "Nicht am Start erschienen";
	}
	else if (boat.ZielZeit == null && boat.Ausgeschieden == 1) {
		return boat.Kommentar;
	}
	else if (boat.ZielZeit == null && boat.Ausgeschieden != 1 && boat.Abgemeldet == 1) {
		return "Abgemeldet";
	}
});
// register SafeString
Ember.Handlebars.helper("safeString", function (text) {
	return new Handlebars.SafeString(text);
});
// row color not that easy after all
Ember.Handlebars.helper("detectRowColor", function (boat) {
	if (boat.Abgemeldet == 1 && boat.ZielZeit == null) {
		return new Handlebars.SafeString("<tr class='danger'>");
	}
	else if (boat.Nachgemeldet == 1) {
		return new Handlebars.SafeString('<tr class="success">');
	}
	else {
		return Handlebars.SafeString("<tr>");
	}
});
// interim times -> special displaying
Handlebars.registerHelper("interimTimes", function (section, options) {
	if (section.general.interim == true) {
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
Ember.Handlebars.helper('if_eq', function(a, b, opts) {
    if(a == b) // Or === depending on your needs
        return opts.fn(this);
    else
        return opts.inverse(this);
});