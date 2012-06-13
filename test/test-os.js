const os = require("os");

function checked(func) {
   return function(test) {
      test.assertEqual(os.getOS(), "Linux",
            "Capable of testing OS only on linux-like machines. " +
            "Yes, it's dummy.");
      func(test);
   }
}

exports.test_inPath = checked(function(test) {
   test.assertEqual(os.inPath("touch"), "/usr/bin/touch",
         "Unable to find touch");
   test.assertEqual(os.inPath("echo"), "/bin/echo",
         "Unable to find echo");
   test.assertEqual(os.inPath("/bin/ls"), "/bin/ls",
         "Unable to find /bin/ls");
   test.assertEqual(os.inPath("nonexisting"), null,
         "Found nonexisting binary");
   test.assertEqual(os.inPath("/nonexisting"), null,
         "Found /nonexisting binary");
})

exports.test_isInPath = checked(function(test) {
   test.assert(os.isInPath("touch"), "touch not in path ?");
   test.assert(os.isInPath("/bin/ls"), "/bin/ls not in path ?");
   test.assert(!os.isInPath("zlurb"), "zlurb in path ?");
   test.assert(!os.isInPath("/zlurb"), "/zlurb in path ?");
})
