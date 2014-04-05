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
		
	})
	
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
		if (data.general.typ == "result") {
			var source = $("#content-template-result").html();
		}
		else if (data.general.typ == "startlist") {
			var source = $("#content-template-startlist").html();
		}
		else {
			return;
		}
		var counter = 0;
		var boote = 0;
		$.each(data.abteilungen, function(key, abteilung ) {
			counter++;
			abteilung.general.SollStartZeit = moment(abteilung.general.SollStartZeit).fromNow();
			boote = boote + countElementObject(abteilung.boote);
		});
		data.general.anzahl_abteilungen = counter;
		data.general.anzahl_boote = boote;
		requested_id = data.general.Rennen;
		var template = Handlebars.compile(source);
		var html = template(data);
		$("#container").html(html);
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