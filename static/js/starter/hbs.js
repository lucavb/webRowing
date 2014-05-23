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

// generates a string containing the names of all rowers
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

// if there are any further information as to a boat this helper
// will find and generate the right string
// though one might do it within the template
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

Ember.Handlebars.registerBoundHelper("rows", function(sections) {
	var arr = sections.content;
	var back = "";
	for (var i = 0; i < arr.length; i++) {
		back += "<tr><td>" + arr[i].get("Rennen") + "</td><td>" + arr[i].get("lauf_pretty") + "</td><td>" +
		 arr[i].get("NameK") + "</td><td>" + moment(arr[i].get("SollStartZeit")).fromNow() +
		 "</td><td>";
		if (arr[i].get("hasStarted") == 1) {
			back += "Ja";
		}
		else {
			back += "Nein";
		} 
		back += "</td><td><a href='starter.html#/sections/" + arr[i].get("Rennen") + "/" + arr[i].get("Lauf") + "'>GoTo</a></td></tr>";
	}
	return new Handlebars.SafeString(back);
});