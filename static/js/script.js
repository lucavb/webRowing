$(document).ready(function() {

	// some basic variables and objects
	var currentType = false; // false = startlist; true = result
	var autoUpdate = true;
	var requested_id = 0;
	var socket = io.connect();

	/*
	 *
	 * execute me stuff
	 *
	 */

	// set the language for moment.js
	moment.lang("de");
	// register a handlebars helper for moment js
	Handlebars.registerHelper("momentFromNow", function(timestamp) {
	    return moment(timestamp).fromNow();
	});
	Handlebars.registerHelper("momentFormat", function(timestamp) {
	    return moment(timestamp).format('LLL');
	});
	Handlebars.registerHelper("momentCalendar", function(timestamp) {
	    return moment(timestamp).calendar();
	});
	// generates a string containing all the rowers based on the obj handed over
	Handlebars.registerHelper("ruderer", function(obj) {
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
		return ret ;
	});
	Handlebars.registerHelper("betweenTimes", function(boat) {
		var ret = "";
		if (boat.Zeit_1 != null) {
			ret += boat.Zeit_1 + "<br />";
		}
		if (boat.Zeit_2 != null) {
			ret += boat.Zeit_2 + "<br />";
		}
		if (boat.Zeit_3 != null) {
			ret += boat.Zeit_3;
		}
		return new Handlebars.SafeString(ret);
	});
	// think it's fairly obvious
	Handlebars.registerHelper("everyOther", function (index, amount, scope) {
	    if ( ++index % amount) 
	        return scope.inverse(this);
	    else 
	        return scope.fn(this);
	});
	// true if startlist, false otherwise
	Handlebars.registerHelper("detectType", function(race, options){
		if (race == "startlist") {
			return options.fn(this);
		}
		else {
			return options.inverse(this);
		}
	});
	Handlebars.registerPartial("table_type_startlist", $("#table-template-startlist").html());
	Handlebars.registerPartial("table_type_result", $("#table-template-result").html());
	// gather information about the hashtag
	parseHash();
	// initial request so the site won't be empty
	socket.emit('request', { "type" : startOrResult(), "race_id" : requested_id});

	/*
	`*
	 * jQuery Stuff
	 *
	 */
	
	// those to a's for switching the page
	$(".switch_page").click(function() {
		if ($(this).attr("data-page") == "startlist") {
			currentType = false;
		}
		else {
			currentType = true;
		}
		$(".switch_page").removeClass("active");
		$(this).addClass("active");
		socket.emit('request', { "type" : $(this).attr("data-page"), "race_id" : requested_id});
	})

	// that form to request a certain race
	$("#request_race").submit(function(e) {
		var value = $("#request_race input").val();
		e.preventDefault();
		if (isInt(value)) {
			requested_id = value;
			setAutoMode(false);
			socket.emit("request", { "type" : startOrResult(), "race_id" : requested_id});
		}
		else {
			printErrMsg("Entschuldigung", "Bitte geben Sie eine Nummer als Rennen an.")
		}		
	});


	// for fake a's
	$(document).on("click", "a.fake", function(e) {
		e.preventDefault();
		return false;
	});

	$(document).on("mouseover", "a.popoverRower", function() {
		$(this).popover({
			html: true
		}).popover("show");
	});

	$(document).on("mouseleave", "a.popoverRower", function() {
		$(this).popover("hide");
	});

	
	// that funny little button in the upper right
	$("#toggleUpdate").click(function() {
		toggleAutoMode();
	});

	/*
	 *
	 * SOCKET.IO
	 *
	 */

	socket.on("startlist", function(data) {
		if (autoUpdate && startOrResult() == "startlist") {
			handleResponse(data);
		}
	});

	socket.on("result", function(data) {
		if (autoUpdate && startOrResult() == "result") {
			handleResponse(data);
		}
	});

	// requested response
	socket.on("request", function(data) {
		handleResponse(data);
	});


	/*
	 *
	 * FUNCTIONS
	 *
	 */

	// sets the function pased on the hash
	function parseHash() {
		var hash = window.location.hash.split("#")[1];

		if(hash !== undefined){
			if (hash == "startlist") {
				currentType = false;
			}
			else {
				currentType = true;
			}
		}
	}

	// sets the mode for auto updates
	function setAutoMode(wish) {
		autoUpdate = wish;
		if (autoUpdate == false) {
			$("#toggleUpdate").removeClass("btn-success");
			$("#toggleUpdate").addClass("btn-danger");
		}
		else {
			$("#toggleUpdate").removeClass("btn-danger");
			$("#toggleUpdate").addClass("btn-success");
			requested_id = 0;
			socket.emit("request", { "type" : startOrResult(), "race_id" : requested_id});
		}
	}

	// reverses the current status of the automode
	function toggleAutoMode() {
		setAutoMode(!autoUpdate);
	}

	// deals with a response from the server 
	// and triggers the necessary handlebars template
	function handleResponse(data) {
		if (!data.general.hasOwnProperty("Rennen")) {
			// so this no race. let's print the error message
			printErrMsg(data.general.header, data.general.msg);
			return;
		}
		clearErrorMsg();
		$("a.popoverRower").popover("destroy");
		var source = $("#template-general-race").html();
		var counter = 0;
		var boote = 0;
		$.each(data.abteilungen, function(key, abteilung ) {
			counter++;
			boote = boote + countElementObject(abteilung.boote);
		});
		data.general.anzahl_abteilungen = counter;
		data.general.anzahl_boote = boote;
		requested_id = data.general.Rennen;
		var template = Handlebars.compile(source);
		var html = template(data);
		$("#container").html(html);
	}

	function printErrMsg(header, content) {
		var ret = '<div class="alert alert-warning alert-dismissable"> \
			<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> \
			<strong>';
		ret += header + "</strong> " + content + "</div>";
		$("#pre-container").html(ret);
	}

	// checks whether a given variable is numeric 
	// and an integer or not
	function isInt(n) {
	   return (n % 1 == 0);
	}

	// counts the attributes a given object has
	function countElementObject(obj) {
		var counter = 0;
		$.each(obj, function(key, value) {
			counter++;
		});
		return counter;
	}

	// returns the current type of site
	function startOrResult() {
		if (currentType) {
			return "result";
		}
		else {
			return "startlist";
		}
	}

	function clearErrorMsg() {
		$("#pre-container").html("");
	}
 });