const command  = require("command");
const file     = require("file");
const mktemp   = require("mktemp").mktemp;

function check(test) {
   if (file.exists("/tmp/") && file.exists("/usr/bin/touch")) {
      return true;
   } else {
      // TODO: Make tests work on windows-like systems ?
      test.fail(
         "Can test command.js only on linux-like systems " +
         "(requires a /tmp directory and a /usr/bin/touch utility)"
      );
      return false;
   }
}

function checked(func) {
   return function(test) { if (check(test)) func(test); }
}

exports.test_run = checked(function(test) {
   let filename = mktemp("test-command-run");
   command.run("/usr/bin/touch", filename);
   test.assert(file.exists(filename), "Command not being executed");
   file.remove(filename);
})

exports.test_runAsync = checked(function(test) {
   let filename = mktemp("test-command-runAsync");
   command.runAsync("touch", [filename], function() {
      test.assert(file.exists(filename),
                  "Command not being asynchronously executed");
      file.remove(filename);
      test.done();
   });
   test.waitUntilDone(1000);
})
