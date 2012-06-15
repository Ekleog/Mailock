const pgp   = require("pgp");
const file  = require("file");
const os    = require("os");

function checked(func) {
   return function(test) {
      if (os.getOS() != "Linux") {
         test.fail("Able to test only on Linux ATM");
      } else {
         func(test);
      }
   }
}

function nogpg(func) {
   return function(test) {
      if (file.exists("~/.gnupg")) {
         test.fail("You already have GPG installed !");
      } else {
         func(test);
      }
   }
}

exports.test_all = checked(nogpg(function(test) {
   // Install
   pgp.install("Some Test User", "non existing", "test@example.org");

   // Check identity
   test.assertEqual(pgp.identity(), pgp.identity(),
      "pgp.identity() not stable");

   // Check handshake
   pgp.handshake("75DC9CAAAFFB3F629E315F5936621BE556D9F845");
      // Random key generated for this usage
   
   // Check knows
   test.assert(pgp.knows("joe@foo.bar"));
   test.assert(pgp.knows("joe@bar.foo"));

   // Check incoming (for signed messages, I just can't encrypt to an
   // unknown key)
   var msg = "\
-----BEGIN PGP SIGNED MESSAGE-----\
Hash: SHA1\
\
Hello, World !\
-----BEGIN PGP SIGNATURE-----\
Version: GnuPG v2.0.19 (GNU/Linux)\
\
iQEcBAEBAgAGBQJP23aKAAoJEDZiG+VW2fhF9HYIAIBcB24VPoIxMp7OXZUSPcsE\
yQfXqKjYaP4dX08r5yaC1f/pgtimEDH6Nhb7SO6FIUyRQL6kyWr+EDl0eNROojP9\
DI79SOaRTcPh4rshuKRg0BHHEJQos8GezVwlYTGMQSfBSrtSAzOcgd2wGyDA/xc5\
roluJIbk2s6B9CVA7yCpXKkzQe1UGNsvZKVUo1L3y/15xl6KsCfRb9StnyArzNJN\
OVSCpqfikblZTt07QKfcv2Ve6Xg8cJHBRM2rza3RGFH8f9Ny18c1tJveusQ9w1P+\
4CCnjx2q+PhmWxHwmC5BS1Vanue7Acd3a25+ezjh6RRRPeiW0CCHpyhZPHlr9nc=\
=LDtT\
-----END PGP SIGNATURE-----\
";
   test.assertEqual(pgp.incoming({
                           content: msg,
                           dests: ["test@example.org"],
                           attachments: [],
                        }, "joe@foo.bar"),
                     "Hello, World !",
         "Unable to validate valid signature");

   // Check sending to at least one unknown dest => should clearsign
   var clear = "I'm there !";
   var cipher = pgp.outgoing({
      content: clear,
      dests: ["joe@foo.bar", "unknown@somewhere.org"],
      attachments: []
   });
   test.assertEqual(cipher.indexOf(clear), -1,
         "Sending to unknown dest encrypted");

   // Check sending to only known dests => should encrypt
   cipher = pgp.outgoing({
      content: clear,
      dests: ["joe@foo.bar", "joe@bar.foo"],
      attachments: []
   });
   test.assertEqual(cipher.indexOf(clear), -1,
         "Cleartext appearing in ciphered message");

   // Check decrypting (we should always encrypt to ourselves)
   var deciphered = pgp.incoming({
      content: cipher,
      dests: ["joe@foo.bar", "joe@bar.foo"],
      attachments: []
   });
   test.assertEqual(deciphered, clear,
         "Deciphering didn't give the exact same message");
}))
