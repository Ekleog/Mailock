const file  = require("file");
const os    = require("os");
const self  = require("self");
const utils = require("utils");

function tmpdir() {
   if (os.getOS() == "Windows")
      return "%tmp%"; // TODO: Check it's working
   else
      return "/tmp"; // TODO: Check on other than linux
}

exports.mktemp = function(name) {
   if (!name) name = "tmp";
   return file.join(tmpdir(), self.name + "-" + name + "-" + utils.randstr());
}
