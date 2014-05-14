$(document).ready(function() {
    var socket = io.connect();
    var sections = [];
    var currentSpot = -1; // the current spot in the array
    var raceNext = -1; // the spot of the race that should be up next
    var countdownTime = 1000;
    moment.lang("de");
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
    var last_race = null;

    /**
    *
    * jQuery
    *
    */
    $(document).on("click", "a.fake", function(e) {
        e.preventDefault();
        return false;
    });

    $(document).on("click", ".mover", function(e) {
        e.preventDefault();
        moveSection($(this).attr("data-move"));
        //console.log(sections[currentSpot]);
        return false;
    });

    // the awesome stuff

    $(document).on('keypress', function(e) {
        var tag = e.target.tagName.toLowerCase();
        // left arrow a
        if ((e.which === 97 || e.keyCode === 37) && tag != 'input' && tag != 'textarea') {
            moveSection(-1);
        }
        // right arrow d
        else if ((e.which === 100 || e.keyCode === 39) && tag != 'input' && tag != 'textarea') {
            moveSection(1);
        }

    });

    $("#goNext").click(function() {
        currentSpot = raceNext;
        moveSection(0);
    });

    /**
     *
     * socket.io
     *
     */

    socket.emit("sections", " ");

    socket.on("sections", function(data) {
        updateSections(data);
    });
    socket.on("request", function (data) {
        displayStartlist(data);
    });

    

    Handlebars.registerHelper("momentFormat", function (timestamp) {
        return moment(timestamp).format('LLL');
    });
    Handlebars.registerHelper("momentCalendar", function (timestamp) {
        return moment(timestamp).calendar();
    });
    Handlebars.registerHelper("momentNow", function (timestamp) {
        return moment(timestamp).fromNow();
    });

    Handlebars.registerHelper("isCurrent", function (race, options) {
        if (race.general.Lauf == sections[currentSpot].Lauf) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper("consolelog", function(obj) {
        console.log(obj);
    });

    Handlebars.registerHelper("detectRowColor", function (boat) {
        if (boat.Abgemeldet == 1 && boat.ZielZeit == null) {
            return new Handlebars.SafeString("<tr class='danger'>");
        }
        else if (boat.Nachgemeldet == 1 && 1 == 0) {
            return new Handlebars.SafeString('<tr class="success">');
        }
        else {
            return Handlebars.SafeString("<tr>");
        }
    });

    Handlebars.registerHelper("ruderer", function (obj) {
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

    Handlebars.registerHelper("addition", function(boat) {
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

    function moveSection (value) {
        var valueInt = parseInt(value);
        if ( (currentSpot + valueInt) < 0 || (currentSpot + valueInt) >= sections.length ) {
          return;
        }
        currentSpot += valueInt;
        getRace();
    }

    function updateSections(new_sections) {
        sections = new_sections;
        for (var i = 0; i < sections.length; i++) {
            if (sections[i].hasStarted == 0) {
                raceNext = i;
                currentSpot = i;
                //console.log(sections);
                getRace();
                break;
            }
        }
        if (currentSpot == -1) {
            currentSpot = sections.length - 1;
            raceNext = currentSpot;
            getRace();
        }
    }

    function getRace () {
        if (last_race == null || last_race.general.Rennen != sections[currentSpot].Rennen) {
            socket.emit("request", { "type" : "startlist", "race_id" : sections[currentSpot].Rennen});
        }
        else {
            displayStartlist(last_race);
        }
    }

    function displayStartlist(race) {
        var source = $("#general_startlist").html();
        var template = Handlebars.compile(source);
        var html = template(race);
        last_race = race;
        $("#container").html(html);
        timers();
    }
});