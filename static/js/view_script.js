$(document).ready(function() {

	// some basic variables and objects
	var currentType = "startlist"; // false = startlist; true = result
	var autoUpdate = true;
	var requested_id = 0;
	var socket = io.connect();

	/*
	 *
	 * preparation: handlebars and moment.js
	 *
	 */

	// set the language for moment.js
	moment.lang("de");
	
	// register both partials for either startlists or results
	Handlebars.registerPartial("panel_startlist", $("#panel_startlist").html());
	Handlebars.registerPartial("panel_result", $("#panel_result").html());
	Handlebars.registerPartial("panel_interim", $("#panel_interim").html());
	Handlebars.registerPartial("panel_interim_detail", $("#panel_interim_detail").html());
	Handlebars.registerPartial("panel_result_detail", $("#panel_result_detail").html());

	/**
	 *
	 * Execute me stuff
	 *
	 */



	/*
	`*
	 * jQuery Stuff
	 *
	 */
	
	// those to a's for switching the page
	$(".switch_page").click(function() {
		$(".switch_page").removeClass("active");
		$(this).addClass("active");
		currentType = $(this).attr("data-page");
		socket.emit('request', { "type" : currentType, "race_id" : requested_id});
		if (currentType == "news") {
			setAutoMode(false);
		}
	})

	// that form to request a certain race
	$("#request_race").submit(function(e) {
		var value = $("#request_race input").val();
		e.preventDefault();
		if (isInt(value)) {
			requested_id = value;
			setAutoMode(false);
			// in case we are in the news section we are going to switch to startlist
			if (currentType != "startlist" && currentType != "result" && currentType != "resultDetail") {
				forceSwitch("startlist");
			}
			socket.emit("request", { "type" : currentType, "race_id" : requested_id});
		}
		else {
			// value is not a number. might wanna translate that into english for different regions
			printErrMsg("Entschuldigung", "Bitte geben Sie eine Nummer als Rennen an.")
		}		
	});


	// for fake a's
	$(document).on("click", "a.fake", function(e) {
		e.preventDefault();
		return false;
	});

	// enables those cool popovers
	$(document).on("mouseover", ".popoverToggle", function() {
		$(this).popover({
			html: true
		}).popover("show");
	});

	$(document).on("mouseleave", ".popoverToggle", function() {
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

	socket.on("startlist", function (data) {
		if (autoUpdate && currentType == "startlist") {
			handleResponse(data);
		}
	});

	socket.on("result", function (data) {
		if (autoUpdate && (currentType == "result" || currentType == "resultDetail")) {
			handleResponse(data);
		}
	});

	// requested response
	socket.on("request", function (data) {
		handleResponse(data);
	});

	socket.on("news", function (data) {
		if (currentType == "news") {
			printNews(data);
		}
	});


	/*
	 *
	 * FUNCTIONS
	 *
	 */

	function printNews (data) {
		data = JSON.parse(data);
		// we need to reverse it for the order
		data.reverse();
		var source = $("#template-news").html();
		var template = Handlebars.compile(source);
		var html = template(data);
		$("#container").html(html);
	}

	// sets the function of the page based on the hash
	function parseHash() {
		var hash = window.location.hash.split("#")[1];

		if(hash !== undefined){
			if (hash == "startlist") {
				currentType = "startlist";
			}
			else if (hash == "result") {
				currentType = "result";
			}
			else if (hash == "news") {
				currentType = "news";
			}
			else if (hash == "resultDetail") {
				currentType = "resultDetail";
			}
		}
		$(".switch_page").removeClass("active");
		$(".switch_page[data-page=" + currentType + "]").addClass("active");
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
			if (currentType != "startlist" && currentType != "result" && currentType != "resultDetail") {
				forceSwitch("startlist");
			}
			socket.emit("request", { "type" : currentType, "race_id" : requested_id});
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
		$("a.popoverToggle").popover("destroy");
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
		var html = '<div class="alert alert-warning alert-dismissable"> \
			<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> \
			<strong>';
		html += header + "</strong> " + content + "</div>";
		$("#pre-container").html(html);
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

	function clearErrorMsg() {
		$("#pre-container").html("");
	}

	function forceSwitch(new_page) {
		$(".switch_page[data-page='" + new_page + "']").click();
		window.location.hash = "#" + new_page;
	}
 });