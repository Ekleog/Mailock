const {Cc, Ci} = require("chrome");
const os       = require("os");

function arrayize(v) {
   if (typeof v == "string")
      return [v];
   else
      return v;
}

function getfile(command) {
   var file = Cc["@mozilla.org/file/local;1"]
               .createInstance(Ci.nsILocalFile);
   file.initWithPath(os.inPath(command));
   return file;
}

function build(command) {
   var process = Cc["@mozilla.org/process/util;1"]
                  .createInstance(Ci.nsIProcess);
   var file = getfile(command);
   process.init(file);
   return process;
}

exports.run = function(command, args) {
   args = arrayize(args);
   var process = build(command);
   process.run(true, args, args.length);
   return process.exitValue;
}

exports.runAsync = function(command, args, observer, holdWeak) {
   args = arrayize(args);
   var process = build(command);
   process.runAsync(args, args.length, observer, holdWeak);
   return process;
}
