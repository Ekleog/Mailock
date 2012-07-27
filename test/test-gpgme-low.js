const gpgme = require("gpgme/low");

exports.test_check_version = function(test) {
   test.assertEqual(gpgme.check_version(), "1.3.1");
}

exports.test_protocol_name = function(test) {
   test.assertEqual(gpgme.get_protocol_name(gpgme.protocol.OpenPGP), "OpenPGP");
   test.assertEqual(gpgme.get_protocol_name(gpgme.protocol.CMS),     "CMS"    );
   test.assertEqual(gpgme.get_protocol_name(gpgme.protocol.GPGCONF), "GPGCONF");
   test.assertEqual(gpgme.get_protocol_name(gpgme.protocol.ASSUAN),  "Assuan" );
   test.assertEqual(gpgme.get_protocol_name(gpgme.protocol.G13),     "G13"    );
   test.assertEqual(gpgme.get_protocol_name(gpgme.protocol.UISERVER),
                                                                    "UIServer");
   test.assertEqual(gpgme.get_protocol_name(gpgme.protocol.DEFAULT), "default");
   test.assertEqual(gpgme.get_protocol_name(gpgme.protocol.UNKNOWN), "unknown");
}

exports.test_engine_check_version = function(test) {
   test.assertEqual(gpgme.engine_check_version(gpgme.protocol.OpenPGP),
                    gpgme.err.code.NO_ERROR);
}

exports.test_engine_info = function(test) {
   function check_get_engine_info(file, home) {
      let ret = gpgme.get_engine_info();
      test.assertEqual(ret.ret, gpgme.err.code.NO_ERROR);

      test.assertEqual(ret.res.protocol   , gpgme.protocol.OpenPGP);
      test.assertEqual(ret.res.file_name  , file);
      test.assertEqual(ret.res.home_dir   , home);
      //test.assertEqual(ret.res.version    , "2.0.19");// Useless to check this
      test.assertEqual(ret.res.req_version, "1.4.0");
   }

   // TODO: Adapt for windows
   check_get_engine_info("/usr/bin/gpg", null);
   test.assertEqual(
      gpgme.set_engine_info(gpgme.protocol.OpenPGP, "my_gpg2", "my_home"),
      gpgme.err.code.NO_ERROR
   );
   check_get_engine_info("my_gpg2", "my_home");
   // Restore normal state
   test.assertEqual(
      // TODO: Adapt for windows
      gpgme.set_engine_info(gpgme.protocol.OpenPGP, "/usr/bin/gpg", null),
      gpgme.err.code.NO_ERROR
   );
   check_get_engine_info("/usr/bin/gpg", null);
}

exports.test_algo_names = function(test) {
   test.assertEqual(gpgme.pubkey_algo_name(gpgme.pk.RSA), "RSA");
   test.assertEqual(gpgme.pubkey_algo_name(gpgme.pk.RSA_E), "RSA-E");
   test.assertEqual(gpgme.pubkey_algo_name(gpgme.pk.RSA_S), "RSA-S");
   test.assertEqual(gpgme.pubkey_algo_name(gpgme.pk.ELG_E), "ELG-E");
   test.assertEqual(gpgme.pubkey_algo_name(gpgme.pk.DSA), "DSA");
   test.assertEqual(gpgme.pubkey_algo_name(gpgme.pk.ELG), "ELG");
   test.assertEqual(gpgme.pubkey_algo_name(gpgme.pk.ECDSA), "ECDSA");
   test.assertEqual(gpgme.pubkey_algo_name(gpgme.pk.ECDH), "ECDH");

   test.assertEqual(gpgme.hash_algo_name(gpgme.md.NONE),   null       );
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.MD5),    "MD5"      );
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.SHA1),   "SHA1"     );
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.RMD160), "RIPEMD160");
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.MD2),    "MD2"      );
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.TIGER),  "TIGER192" );
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.HAVAL),  "HAVAL"    );
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.SHA256), "SHA256"   );
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.SHA384), "SHA384"   );
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.SHA512), "SHA512"   );
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.MD4),    "MD4"      );
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.CRC32),  "CRC32"    );
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.CRC32_RFC1510),
                                                                "CRC32RFC1510");
   test.assertEqual(gpgme.hash_algo_name(gpgme.md.CRC24_RFC2440),
                                                                "CRC24RFC2440");
}
