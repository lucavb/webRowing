var start = {
	"general" : {
		"name" : "Rennen",
		"nameE" : "Race",
		"anzahl_ruderer" : 0,
		"anzahl_abteilungen" : 0,
		"bootsklasse" : "",
		"rennen_id" : ""
	},
	"abteilungen" : {

	}
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

module.exports.start = clone(start);
