$(document).ready(function() {
	var currentType = false; // false = startlist; true = result
	var autoUpdate = true;
	var requested_id = 0;
	var socket = io.connect();

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

	$(".switch_page").click(function() {
		if ($(this).attr("data-page") == "startlist") {
			currentType = false;
		}
		else {
			currentType = true;
		}
		socket.emit('request', { "type" : $(this).attr("data-page"), "race_id" : requested_id});
	})

	$("#request_race").submit(function(e) {
		var value = $("#request_race input").val();
		e.preventDefault();
		if (isInt(value)) {
			requested_id = value;
			setAutoMode(false);
			socket.emit("request", { "type" : startOrResult(), "race_id" : requested_id});
		}
		
	})
	// let's get some stuff
	parseHash();
	socket.emit('request', { "type" : startOrResult(), "race_id" : requested_id});

	$("#toggleUpdate").click(function() {
		toggleAutoMode();
	});

	// auto updates
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

	function toggleAutoMode() {
		autoUpdate = !autoUpdate;
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

	function isInt(n) {
	   return (n % 1 == 0);
	}

	function countElementObject(obj) {
		var counter = 0;
		$.each(obj, function(key, value) {
			counter++;
		});
		return counter;
	}

	function startOrResult() {
		if (currentType) {
			return "result";
		}
		else {
			return "startlist";
		}
	}
});