const pgp_utils = require("pgp-utils");

exports.test_keyid = function(test) {
   test.assertEqual(pgp_utils.keyid("75DC9CAAAFFB3F629E315F5936621BE556D9F845"),
                     "56D9F845",
                     "Wrong extraction of key ID from fingerprint");
}
