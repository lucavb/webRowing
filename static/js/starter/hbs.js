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

Ember.Handlebars.registerBoundHelper("addition", function(boat) {
    if (boat.Abgemeldet == 1) {
        return "Abgemeldet";
    }
    else if (boat.zusatzGewicht != null) {
        return "Zusatzgewicht: " + boat.zusatzGewicht + " kg";
    }
    else {
        return "-";
    }
});