const command = require("command");
const file = require("file");

function randomString() {
   // Gracefully taken at http://stackoverflow.com/questions/1349404
   var text = "";
   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
   for(var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
   }
   return text;
}

function mktemp(base) {
   if (file.exists("/tmp"))
      return "/tmp/"     + base + "-" + randomString();
   else
      return "C:\\tmp\\" + base + "-" + randomString();
}

function touch(filename) {
   // TODO: Build platform-independant test
   return "/usr/bin/touch " + filename;
}

exports.test_run = function(test) {
   var filename = mktemp("test-command-run");
   command.run(touch(filename));
   test.assert(file.exists(filename), "Command not being executed");
   file.remove(filename);
}

exports.test_runAsync = function(test) {
   var filename = mktemp("test-command-runAsync");
   command.runAsync(touch(filename), function() {
      test.assert(file.exists(filename),
                  "Command not being asynchronously executed");
      file.remove(filename);
      test.done();
   });
   test.waitUntilDone(1000);
}
