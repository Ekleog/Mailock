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
   pgp.install({ name: "Some Test User",
                 comment: "non existing",
                 email: "test@example.org" });

   // Check identity
   test.assertEqual(pgp.identity(), pgp.identity(),
      "pgp.identity() not stable");

   // Check handshake
   pgp.handshake("75DC9CAAAFFB3F629E315F5936621BE556D9F845",
                 function(emails) { return true; },
                 { trust: 0, depth: 0 });
      // Random key generated for this usage
   
   // Check knows
   test.assert(pgp.knows("joe@foo.bar"));
   test.assert(pgp.knows("joe@bar.foo"));
   test.assert(!pgp.knows("unknown@somewhere.org"));

   // Check incoming (for signed messages, I just can't encrypt to an
   // unknown key)
   let msg = "\
-----BEGIN PGP SIGNED MESSAGE-----\n\
Hash: SHA1\n\
\n\
Hello, World !\n\
-----BEGIN PGP SIGNATURE-----\n\
Version: GnuPG v2.0.19 (GNU/Linux)\n\
\n\
iQEcBAEBAgAGBQJP23aKAAoJEDZiG+VW2fhF9HYIAIBcB24VPoIxMp7OXZUSPcsE\n\
yQfXqKjYaP4dX08r5yaC1f/pgtimEDH6Nhb7SO6FIUyRQL6kyWr+EDl0eNROojP9\n\
DI79SOaRTcPh4rshuKRg0BHHEJQos8GezVwlYTGMQSfBSrtSAzOcgd2wGyDA/xc5\n\
roluJIbk2s6B9CVA7yCpXKkzQe1UGNsvZKVUo1L3y/15xl6KsCfRb9StnyArzNJN\n\
OVSCpqfikblZTt07QKfcv2Ve6Xg8cJHBRM2rza3RGFH8f9Ny18c1tJveusQ9w1P+\n\
4CCnjx2q+PhmWxHwmC5BS1Vanue7Acd3a25+ezjh6RRRPeiW0CCHpyhZPHlr9nc=\n\
=LDtT\n\
-----END PGP SIGNATURE-----\n\
";
   let tampered_msg = "\
-----BEGIN PGP SIGNED MESSAGE-----\n\
Hash: SHA1\n\
\n\
Hella, World !\n\
-----BEGIN PGP SIGNATURE-----\n\
Version: GnuPG v2.0.19 (GNU/Linux)\n\
\n\
iQEcBAEBAgAGBQJP23aKAAoJEDZiG+VW2fhF9HYIAIBcB24VPoIxMp7OXZUSPcsE\n\
yQfXqKjYaP4dX08r5yaC1f/pgtimEDH6Nhb7SO6FIUyRQL6kyWr+EDl0eNROojP9\n\
DI79SOaRTcPh4rshuKRg0BHHEJQos8GezVwlYTGMQSfBSrtSAzOcgd2wGyDA/xc5\n\
roluJIbk2s6B9CVA7yCpXKkzQe1UGNsvZKVUo1L3y/15xl6KsCfRb9StnyArzNJN\n\
OVSCpqfikblZTt07QKfcv2Ve6Xg8cJHBRM2rza3RGFH8f9Ny18c1tJveusQ9w1P+\n\
4CCnjx2q+PhmWxHwmC5BS1Vanue7Acd3a25+ezjh6RRRPeiW0CCHpyhZPHlr9nc=\n\
=LDtT\n\
-----END PGP SIGNATURE-----\n\
";
   let unknown_msg = "\
-----BEGIN PGP SIGNED MESSAGE-----\n\
Hash: SHA1\n\
\n\
Hello, World !\n\
-----BEGIN PGP SIGNATURE-----\n\
Version: GnuPG v2.0.19 (GNU/Linux)\n\
\n\
iQEcBAEBAgAGBQJP3c6AAAoJENFpM6FZLSCrh48IAIVa1LZ7a2O+eil4SQuqn3LH\n\
moUVxG9q/1g/6NDiHeOqkd0uXoaW9C2ViaLnVE2389xvekO79XgtB9a/ObBfLpCy\n\
9q1Ey8OnAeG6DUmwpFPu55ltYsNW82rw8kwZEB1N02uQZk+WmMePF+RL4rnQeHyR\n\
PJfDvKdljiOd8Nc0t4aUoDkNJrTk+GaZ1+mUYPSeSybENhH+Wr1fdaYiGkjs0I31\n\
4oMvNLLm7X4hcQ+dJCrYxXnQPMPzNBG0JCN/hpPiUjl8x1CQnVuGe7O4w6Qivngt\n\
l/UR06pPWdx3wjt/vaCSEZA87oQeY0X+I9n4iS8qwAD35QTwjoFGLelh7IUJ940=\n\
=5gJM\n\
-----END PGP SIGNATURE-----\n\
";
   test.assertEqual(JSON.stringify(pgp.incoming({
                           content: msg,
                           dests: ["test@example.org"],
                           attachments: [],
                        }, "joe@foo.bar")),
                     JSON.stringify({ msg: "Hello, World !\n", ok: "valid" }),
         "Unable to validate valid signature");
   test.assertEqual(JSON.stringify(pgp.incoming({
                           content: msg,
                           dests: ["test@example.org"],
                           attachments: [],
                        }, "joe@bar.foo")),
                     JSON.stringify({ msg: "Hello, World !\n", ok: "valid" }),
         "Unable to validate valid signature");
   test.assertEqual(JSON.stringify(pgp.incoming({
                           content: tampered_msg,
                           dests: ["test@example.org"],
                           attachments: [],
                        }, "joe@foo.bar")),
                     JSON.stringify({ msg: "Hella, World !\n", ok: "invalid" }),
         "Unable to invalidate invalid signature");
   test.assertEqual(JSON.stringify(pgp.incoming({
                           content: unknown_msg,
                           dests: ["test@example.org"],
                           attachments: [],
                        }, "unknown@somewhere.org")),
                     JSON.stringify({ msg: "Hello, World !\n", ok: "unknown" }),
         "Unable to invalidate signature from unknown user");
   test.assertEqual(JSON.stringify(pgp.incoming({
                           content: "Hello, World !\n",
                           dests: ["test@example.org"],
                           attachments: [],
                        }, "joe@foo.bar")),
                     JSON.stringify({ msg: "Hello, World !\n", ok: "none" }),
         "Unable to invalidate unexisting signature");

   // Check sending to at least one unknown dest => should clearsign
   let clear = "I'm there !";
   let cipher = pgp.outgoing({
      content: clear,
      dests: ["joe@foo.bar", "unknown@somewhere.org"],
      attachments: []
   });
   test.assertNotEqual(cipher.indexOf(clear), -1,
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
   let deciphered = pgp.incoming({
      content: cipher,
      dests: ["joe@foo.bar", "joe@bar.foo"],
      attachments: []
   }, "test@example.org");
   test.assertEqual(JSON.stringify(deciphered),
                    JSON.stringify({ msg: clear + " ", ok: true }),
         "Deciphering didn't give the exact same message");
}))
