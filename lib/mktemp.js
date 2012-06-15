const file  = require("file");
const os    = require("os");
const self  = require("self");

function tmpdir() {
   if (os.getOS() == "Windows")
      return "%tmp%"; // TODO: Check it's working
   else
      return "/tmp"; // TODO: Check on other than linux
}

function randstr() {
   // cf. http://stackoverflow.com/a/1349426
   var ret = "";
   var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
      "abcdefghijklmnopqrstuvwxyz" +
      "0123456789";
   for (var i = 0 ; i < 5 ; i++)
      ret += alphabet[Math.floor(Math.random() * alphabet.length)];
   return ret;
}

exports.mktemp = function(name) {
   if (!name) name = "tmp";
   return file.join(tmpdir(), self.name + "-" + name + "-" + randstr());
}
