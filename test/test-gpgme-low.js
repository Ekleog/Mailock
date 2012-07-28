const gpgme = require("gpgme/low");
const libc = require("gpgme/libc");

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

exports.test_errors = function(test) {
   test.assertNotEqual(libc.setlocale(libc.lc.ALL, "C"), null);
   let tst = [
      gpgme.err_make(gpgme.err.source.PINENTRY, gpgme.err.code.KEYSERVER),
      gpgme.error(gpgme.err.code.INV_PASSPHRASE),
      gpgme.err_make_from_errno(gpgme.err.source.KEYBOX, 33), // EDOM
      gpgme.error_from_errno(84), // ILSEQ
      gpgme.err_code_from_errno(34) // ERANGE
   ];
   test.assertEqual(gpgme.err_code_to_errno(tst[4]), 34);
   let ans = [
      ["Pinentry",           "Keyserver error"],
      ["Unspecified source", "Invalid passphrase"],
      ["Keybox",             "Numerical argument out of domain"],
      ["User defined source 1",
                           "Invalid or incomplete multibyte or wide character"],
      ["Unspecified source", "Numerical result out of range"]
   ];
   for (let i = 0 ; i < 5 ; ++i) {
      test.assertEqual(gpgme.strsource(tst[i]), ans[i][0]);
      test.assertEqual(gpgme.strerror (tst[i]), ans[i][1]);
   }
}

exports.test_strab = function(test) {
   let buf = gpgme.str2ab("Hello, World !");
   test.assertEqual(gpgme.ab2str(buf), "Hello, World !");
}

const str2ab = gpgme.str2ab;
const ab2str = gpgme.ab2str;

exports.test_data_mem = function(test) {
   let data = gpgme.data_new_from_mem(str2ab("Hello, World !"));
   test.assertEqual(data.ret, gpgme.err.code.NO_ERROR);
   let buf = gpgme.data_release_and_get_mem(data.res);
   test.assertEqual(ab2str(buf), "Hello, World !");
}

exports.test_data_rws = function(test) {
   let ret = gpgme.data_new();
   test.assertEqual(ret.ret, gpgme.err.code.NO_ERROR);
   let data = ret.res;
   test.assertEqual(gpgme.data_write(data, str2ab("42")), 2);
   test.assertEqual(gpgme.data_write(data, str2ab(" 42... !")), 8);
   test.assertEqual(gpgme.data_seek(data, 0, gpgme.SEEK_SET), 0);
   test.assertEqual(ab2str(gpgme.data_read(data, 8)), "42 42...");
   test.assertEqual(gpgme.data_seek(data, -5, gpgme.SEEK_CUR), 3);
   test.assertEqual(ab2str(gpgme.data_read(data, 7)), "42... !");
   test.assertEqual(gpgme.data_seek(data, 3, gpgme.SEEK_SET), 3);
   test.assertEqual(ab2str(gpgme.data_read(data, 3)), "42.");
   gpgme.data_release(data);
}

exports.test_data_file = function(test) {
   // TODO: echo 'helloworld' > /tmp/Mailock-test
   // TODO: Make this test work on windows
   let ret = gpgme.data_new_from_file("/tmp/Mailock-test");
   test.assertEqual(ret.ret, gpgme.err.code.NO_ERROR);
   let data = ret.res;
   test.assertEqual(ab2str(gpgme.data_read(data, 64)), "helloworld\n");
   gpgme.data_release(data);

   ret = gpgme.data_new_from_filepart("/tmp/Mailock-test", 5, 3);
   test.assertEqual(ret.ret, gpgme.err.code.NO_ERROR);
   data = ret.res;
   test.assertEqual(ab2str(gpgme.data_read(data, 64)), "wor");
   gpgme.data_release(data);
}

exports.test_data_filename = function(test) {
   let ret = gpgme.data_new();
   test.assertEqual(ret.ret, gpgme.err.code.NO_ERROR);
   let data = ret.res;
   test.assertEqual(gpgme.data_set_file_name(data, "<memory-based>"),
                    gpgme.err.code.NO_ERROR);
   test.assertEqual(gpgme.data_get_file_name(data), "<memory-based>");
   gpgme.data_release(data);
}

exports.test_data_encoding = function(test) {
   let ret = gpgme.data_new();
   test.assertEqual(ret.ret, gpgme.err.code.NO_ERROR);
   let data = ret.res;
   test.assertEqual(gpgme.data_get_encoding(data), gpgme.data_encoding.NONE);
   test.assertEqual(gpgme.data_set_encoding(data, gpgme.data_encoding.BASE64),
                    gpgme.err.code.NO_ERROR);
   test.assertEqual(gpgme.data_get_encoding(data), gpgme.data_encoding.BASE64);
   gpgme.data_release(data);
}
