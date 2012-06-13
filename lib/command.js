const {Cc, Ci} = require("chrome");
const {env}    = require("environment");
const file     = require("file");
const os       = require("os");

function arrayize(v) {
   if (typeof v != "Array")
      return [v];
   else
      return v;
}

function pathize(command) {
   if (command[0] == '/' || (command[1] == ':' && command[2] == '\\'))
      return command; // Already native path format
   if (os.getOS() == "Windows") {
      for each (path in env.Path.split(";")) {
         cmd = file.join(path, command);
         if (file.exists(cmd)) {
            return cmd;
         }
      }
   } else {
      for each (path in env.PATH.split(":")) {
         cmd = file.join(path, command);
         if (file.exists(cmd)) {
            return cmd;
         }
      }
   }
   return command; // No better match found
}

function getfile(executable) {
   var file = Cc["@mozilla.org/file/local;1"]
               .createInstance(Ci.nsILocalFile);
   file.initWithPath(executable);
   return file;
}

function build(executable) {
   var process = Cc["@mozilla.org/process/util;1"]
                  .createInstance(Ci.nsIProcess);
   var file = getfile(executable);
   process.init(file);
   return process;
}

exports.run = function(command, args) {
   args     = arrayize(args);
   command  = pathize(command);
   var process = build(command);
   process.run(true, args, args.length);
   return process.exitValue;
}

exports.runAsync = function(command, args, observer, holdWeak) {
   args     = arrayize(args);
   command  = pathize(command);
   var process = build(command);
   process.runAsync(args, args.length, observer, holdWeak);
   return process;
}
