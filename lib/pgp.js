const os       = require("os");
const scripts  = os.loadScripts();

exports.install   = function()            { return scripts.install();         }
exports.handshake = function(other)       { return scripts.handshake(other);  }
exports.sign      = function(msg)         { return scripts.sign(msg);         }
exports.check     = function(msg, sign)   { return scripts.check(msg, sign);  }
exports.encrypt   = function(msg)         { return scripts.encrypt(msg);      }
exports.decrypt   = function(msg)         { return scripts.decrypt(msg);      }
