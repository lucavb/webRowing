$(document).ready(function() {

	/**
	 *
	 * jQuery
	 *
	 */

	moment.lang("de");

	// for fake a's
	$(document).on("click", "a.fake", function(e) {
		e.preventDefault();
		return false;
	});

	// enables those cool popovers
	$(document).on("mouseover", "a.popoverToggle", function() {
		$(this).popover({
			html: true
		}).popover("show");
	});

	$(document).on("mouseleave", "a.popoverToggle", function() {
		$(this).popover("hide");
	});

	/*
	 *
	 * FUNCTIONS
	 *
	 */

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

	function clearErrorMsg() {
		$("#pre-container").html("");
	}
 });

function isOdd(num) { 
	return num % 2;
}