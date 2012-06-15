const mktemp = require("mktemp").mktemp;
const os     = require("os");

exports.test_mktemp_unnamed = function(test) {
   if (!os.getOS() == "Linux")
      test.fail("Able to test mktemp only on Linux ATM");
   else {
      var temp1 = mktemp(), temp2 = mktemp();
      test.assertEqual(temp1.substr(0, 13), "/tmp/mailock-",
            "Temp should start with \"/tmp/mailock-\"")
      test.assertEqual(temp2.substr(0, 13), "/tmp/mailock-",
            "Temp should start with \"/tmp/mailock-\"")
      test.assertNotEqual(temp1, temp2,
            "Two temps should not have the same name");
   }
}

exports.test_mktemp_named = function(test) {
   if (!os.getOS() == "Linux")
      test.fail("Able to test mktemp only on Linux ATM");
   else {
      var hello1 = mktemp("hello"), hello2 = mktemp("hello");
      test.assertEqual(hello1.substr(0, 19), "/tmp/mailock-hello-",
            "Named temp should start with \"/tmp/mailock-hello-\"")
      test.assertEqual(hello2.substr(0, 19), "/tmp/mailock-hello-",
            "Named temp should start with \"/tmp/mailock-hello-\"")
      test.assertNotEqual(hello1, hello2,
            "Two temps should not have the same name");
   }
}
