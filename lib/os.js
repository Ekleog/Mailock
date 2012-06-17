const {env}    = require("environment");
const file     = require("file");
const runtime  = require("runtime");

exports.getOS = function() {
   let OS = runtime.OS;
   if (OS == "WINNT")
      return "Windows";
   else
      return "Linux"; // By default, acting like for linux
}

exports.loadScripts = function() {
   let OS = exports.getOS();
   if (OS == "Windows")
      return require("os/windows");
   else // if (OS == "Linux") -- by default
      return require("os/linux");
}

exports.inPath = function(command) {
   if (exports.getOS() == "Windows") {
      if (command[1] == ":" && command[2] == "\\") {
         if (file.exists(command))
            return command; // Full path given
         else
            return null; // Full and wrong path given
      }
      for each (path in env.Path.split(";")) {
         cmd = file.join(path, command);
         if (file.exists(cmd))
            return cmd;
      }
   } else {
      if (command[0] == "/") {
         if (file.exists(command))
            return command; // Full path given
         else
            return null; // Full and wrong path given;
      }
      for each (path in env.PATH.split(":")) {
         cmd = file.join(path, command);
         if (file.exists(cmd))
            return cmd;
      }
   }
   return null; // No matching file
}

exports.isInPath = function(command) {
   return exports.inPath(command) != null;
}
