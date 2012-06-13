const {Cc, Ci} = require("chrome");

function parse(command) {
   var cmd = {}
   cmd.args       = command.split(" ");
   cmd.executable = cmd.args.shift();
   cmd.count      = cmd.args.length;
   return cmd;
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

exports.run = function(command) {
   var cmd = parse(command);
   var process = build(cmd.executable);
   process.run(true, cmd.args, cmd.count);
   return process.exitValue;
}

exports.runAsync = function(command, observer, holdWeak) {
   var cmd = parse(command);
   var process = build(cmd.executable);
   process.runAsync(cmd.args, cmd.count, observer, holdWeak);
   return process;
}
