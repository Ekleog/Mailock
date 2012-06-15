const utils = require("utils");

exports.test_unique = function(test) {
   test.assertEqual(utils.unique(["a", "a", "b", "c", "c", "d"]).toString(),
                     ["a", "b", "c", "d"].toString(),
                     "Not removing duplicates");
   test.assertEqual(utils.unique(["a", "b", "c", "d"]).toString(),
                     ["a", "b", "c", "d"].toString(),
                     "Removing non duplicates");
   test.assertEqual(utils.unique([42, "b", 42, "c"]).toString(),
                     [42, "b", "c"].toString(),
                     "Not removing separated duplicates");
}
