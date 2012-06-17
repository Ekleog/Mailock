const prefs = require("prefs");

exports.test_set = function(test) {
   prefs.set("set", "burk");
   test.assertEqual(require("preferences-service")
                     .get("extensions.mailock.set"),
                    "burk");
}

exports.test_get = function(test) {
   prefs.set("get", "bark");
   test.assertEqual(prefs.get("get"), "bark");
   test.assertEqual(prefs.get("get_invalid", 42), 42);
}

exports.test_has = function(test) {
   test.assert(!prefs.has("has"));
   test.assert(!prefs.has("has_not"));
   prefs.set("has", "berk");
   test.assert(prefs.has("has"));
   test.assert(!prefs.has("has_not"));
}

exports.test_isSet = function(test) {
   test.assert(!prefs.isSet("isset"));
   prefs.set("isset", "abc");
   test.assert(prefs.isSet("isset"));
}

exports.test_reset = function(test) {
   test.assertUndefined(prefs.get("reset"));
   prefs.set("reset", "42");
   test.assertEqual(prefs.get("reset"), "42");
   prefs.reset("reset");
   test.assertUndefined(prefs.get("reset"));
}
