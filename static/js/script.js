$(document).ready(function() {
	var currentType = false; // false = startlist; true = result
	var autoUpdate = true;
	var requested_id = 0;
	var socket = io.connect();

	$(".switch_page").click(function() {
		socket.emit('request', { "type" : $(this).attr("data-page"), "race_id" : requested_id});
	})

	$("#request_race").submit(function() {
		socket.emit("request", { "type" : startlist, "race_id" : requested_id});
	})
	// let's get some stuff
	socket.emit('request', { "type" : "startlist", "race_id" : requested_id});


	socket.on("startlist", function(data) {
		if (autoUpdate) {
			handleResponse(data);
		}
	});

	socket.on("result", function(data) {
		if (autoUpdate) {
			handleResponse(data);
		}
	});

	// requested response
	socket.on("request", function(data) {
		handleResponse(data);
	});

	function handleResponse(data) {
		if (data.general.typ == "ergebniss") {
			var source = $("#content-template-result").html();
		}
		else if (data.general.typ == "startliste") {
			var source = $("#content-template-startlist").html();
		}
		else {
			return;
		}
		console.log(data);
		var template = Handlebars.compile(source);
		var html = template(data);
		$("#container").html(html);
	}
});