const os    = require("os");
const prefs = require("prefs");

exports.install = function() {
   if (!os.isInPath("gpg2")) {
      require("os/linux/install").install();
   }
}

exports.fingerprint = function() {
   // TODO
}

exports.handshake = function(other) {
   // TODO
}

exports.sign = function(other) {
   // TODO
}

exports.check = function(other) {
   // TODO
}

exports.encrypt = function(other) {
   // TODO
}

exports.decrypt = function(other) {
   // TODO
}
