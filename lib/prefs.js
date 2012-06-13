const preferences = require("preferences-service");
const self = require("self");

function normalize(name) {
   return "extensions." + self.name + "." + name;
}

exports.set = function(name, value) {
   preferences.set(normalize(name), value);
}

exports.get = function(name, defaultValue) {
   return preferences.get(normalize(name), defaultValue);
}

exports.has = function(name) {
   return preferences.has(normalize(name));
}

exports.isSet = function(name) {
   return preferences.isSet(normalize(name));
}

exports.reset = function(name) {
   return preferences.reset(normalize(name));
}

exports.getLocalized = function(name, defaultValue) {
   return preferences.getLocalized(normalize(name), defaultValue);
}

exports.setLocalized = function(name, value) {
   preferences.setLocalized(normalize(name), value);
}
