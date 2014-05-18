$(document).ready(function() {
	moment.lang("de");
	var countdownTime = 1000;
	var timers = function() {
	    $( ".countdown" ).each(function() {
	        var target = $(this).attr("data-time");
	        $(this).html(moment(target).fromNow());
	        if (moment(target) > moment()) {
	            $(this).addClass("green");
	            $(this).removeClass("red");
	        }
	        else {
	            $(this).addClass("red");
	            $(this).removeClass("green");
	        }
	    });
	    $(".now").html(moment().format('MMMM Do YYYY, H:mm:ss'));
	}
	$(".now").html(moment().format('MMMM Do YYYY, H:mm:ss'));
	var countdownInterval = setInterval(timers, countdownTime);

	/**
	*
	* jQuery
	*
	*/
	$(document).on("click", "a.fake", function(e) {
	    e.preventDefault();
	    return false;
	});
});