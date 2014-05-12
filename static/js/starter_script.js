$(document).ready(function() {
  var socket = io.connect();
  var sections = [];
  var currentSpot = -1;
  var countdownTime = 1000;
  var countdownInterval = setInterval(function() {
    $( ".countdown" ).each(function() {
      var target = $(this).attr("data-time");
      $(this).html(moment(target).calendar());
    });
    $(".now").html(moment().format('LLLL'));
  }, countdownTime);
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

  $(document).on("click", ".pager li", function(e) {
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

  socket.emit("sections", " ");

  socket.on("sections", function(data) {
    updateSections(data);
  });
  socket.on("request", function (data) {
    displayStartlist(data);
  });

  moment.lang("de");

  Handlebars.registerHelper("momentFormat", function (timestamp) {
      return moment(timestamp).format('LLL');
  });
  Handlebars.registerHelper("momentCalendar", function (timestamp) {
      return moment(timestamp).calendar();
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
    else if (boat.Nachgemeldet == 1) {
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

  function moveSection (value) {
    var valueInt = parseInt(value);
    if ( (currentSpot + valueInt) < 0 || (currentSpot + valueInt) >= sections.length ) {
      return;
    }
    currentSpot += parseInt(value);
    getRace();
  }

  function updateSections(new_sections) {
    sections = new_sections;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].hasStarted == 0) {
        if (currentSpot != -1 && currentSpot != i) {
          alert("wir sind weiter");
          break;
        }
        currentSpot = i;
        //console.log(sections);
        getRace();
        break;
      }
    }
  }

  function getRace () {
    if (last_race == null || last_race.general.Rennen != sections[currentSpot].Rennen) {
      socket.emit("request", { "type" : "startlists", "race_id" : sections[currentSpot].Rennen});
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
  }
});