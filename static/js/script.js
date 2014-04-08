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
			printErrMsg("Entschuldigung", "Bitte geben Sie eine Nummer an.")
		}		
	});


	$(document).on("click", "a.fake", function(e) {
		e.preventDefault();
		return false;
	});

	$(document).on("mouseover", "a.popoverRower", function() {
		$(this).popover("show");
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
		$("a.popoverRower").popover("destroy");
		if (data.general.typ == "result") {
			var source = $("#content-template-result").html();
		}
		else if (data.general.typ == "startlist") {
			var source = $("#content-template-startlist").html();
		}
		else {
			// so this no race. let's print the error message
			printErrMsg(data.general.header, data.general.msg);
			return;
		}
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
});