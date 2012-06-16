exports.keyid = function(fingerprint) {
   return fingerprint.substr(-8);
}

const keyservers = require("pgp-utils-generated").keyservers;

exports.random_keyserver = function() {
   return keyservers[Math.floor(Math.random() * keyservers.length)];
}
