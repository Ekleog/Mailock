const gpgme = require("gpgme/low");
const libc = require("gpgme/libc");
const file = require("file");

// {{{ 2
exports.test_check_version = function(test) {
   test.assertEqual(gpgme.check_version(), "1.3.1");
}
// }}}
// {{{ 3
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

function check_engine_info(test, info, file, home) {
   test.assertEqual(info.protocol   , gpgme.protocol.OpenPGP);
   test.assertEqual(info.file_name  , file);
   test.assertEqual(info.home_dir   , home);
   //test.assertEqual(info.version    , "2.0.19"); // Useless to check this
   test.assertEqual(info.req_version, "1.4.0");

   test.assertEqual(info.next.protocol, gpgme.protocol.CMS);
   test.assertEqual(info.next.next.protocol, gpgme.protocol.GPGCONF);
   test.assertEqual(info.next.next.next.protocol, gpgme.protocol.ASSUAN);
   test.assertEqual(info.next.next.next.next, null);
}

exports.test_engine_info = function(test) {
   function check_get_engine_info(file, home) {
      let ret = gpgme.get_engine_info();
      test.assertEqual(ret.ret, gpgme.err.code.NO_ERROR);
      check_engine_info(test, ret.res, file, home);
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
// }}}
// {{{ 4
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
// }}}
// {{{ 5
exports.test_errors = function(test) {
   test.assertNotEqual(libc.setlocale(libc.lc.ALL, "C"), null);
   let tst = [
      gpgme.err_make(gpgme.err.source.PINENTRY, gpgme.err.code.KEYSERVER),
      gpgme.error(gpgme.err.code.INV_PASSPHRASE),
      gpgme.err_make_from_errno(gpgme.err.source.KEYBOX, 33), // EDOM
      gpgme.error_from_errno(84), // ILSEQ
      gpgme.err_code_from_errno(34) // ERANGE
   ];

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

   test.assertEqual(gpgme.err_code(tst[0]), gpgme.err.code.KEYSERVER);
   test.assertEqual(gpgme.err_source(tst[0]), gpgme.err.source.PINENTRY);
   test.assertEqual(gpgme.err_code_to_errno(tst[4]), 34);
}
// }}}
// {{{ 6
exports.test_strab = function(test) {
   let buf = gpgme.str2ab("Hello, World !");
   test.assertEqual(gpgme.ab2str(buf), "Hello, World !");

   test.assertEqual(gpgme.ab2str(gpgme.str2ab("")), "");
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
   test.assertEqual(gpgme.data_seek(data, 0, gpgme.seek.SET), 0);
   test.assertEqual(ab2str(gpgme.data_read(data, 8)), "42 42...");
   test.assertEqual(gpgme.data_seek(data, -5, gpgme.seek.CUR), 3);
   test.assertEqual(ab2str(gpgme.data_read(data, 7)), "42... !");
   test.assertEqual(gpgme.data_seek(data, 3, gpgme.seek.SET), 3);
   test.assertEqual(ab2str(gpgme.data_read(data, 3)), "42.");
   test.assertEqual(gpgme.data_write(data, str2ab(" :-D")), 4);
   // TODO: Re-enable and disable following line (upstream bug report sent)
   //test.assertEqual(gpgme.data_seek(data, -7, gpgme.seek.END), 3);
   test.assertEqual(gpgme.data_seek(data, 3, gpgme.seek.SET), 3);
   test.assertEqual(ab2str(gpgme.data_read(data, 64)), "42. :-D");
   gpgme.data_release(data);
}

exports.test_data_file = function(test) {
   // TODO: Make this test work on windows
   let f = file.open("/tmp/Mailock-test", "w");
   f.write("helloworld");
   f.close();

   let ret = gpgme.data_new_from_file("/tmp/Mailock-test");
   test.assertEqual(ret.ret, gpgme.err.code.NO_ERROR);
   let data = ret.res;
   test.assertEqual(ab2str(gpgme.data_read(data, 64)), "helloworld");
   gpgme.data_release(data);

   ret = gpgme.data_new_from_filepart("/tmp/Mailock-test", 5, 3);
   test.assertEqual(ret.ret, gpgme.err.code.NO_ERROR);
   data = ret.res;
   test.assertEqual(ab2str(gpgme.data_read(data, 64)), "wor");
   gpgme.data_release(data);

   file.remove("/tmp/Mailock-test");
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
// }}}
// {{{ 7
exports.test_ctx_conf = function(test) {
   let ret = gpgme.new();
   test.assertEqual(ret.ret, gpgme.err.code.NO_ERROR);
   let ctx = ret.res;

   test.assertEqual(gpgme.get_protocol(ctx), gpgme.protocol.OpenPGP);
   test.assertEqual(gpgme.set_protocol(ctx, gpgme.protocol.CMS),
                    gpgme.err.code.NO_ERROR);
   test.assertEqual(gpgme.get_protocol(ctx), gpgme.protocol.CMS);

   function check_get_engine_info(file, home) {
      check_engine_info(test, gpgme.ctx_get_engine_info(ctx), file, home);
   }

   // TODO: Adapt for windows
   check_get_engine_info("/usr/bin/gpg", null);
   test.assertEqual(
      gpgme.ctx_set_engine_info(ctx, gpgme.protocol.OpenPGP,
                                "my_gpg2", "my_home"),
      gpgme.err.code.NO_ERROR
   );
   check_get_engine_info("my_gpg2", "my_home");
   test.assertEqual(
      gpgme.ctx_set_engine_info(ctx, gpgme.protocol.OpenPGP,
                                "/usr/bin/gpg", null),
      gpgme.err.code.NO_ERROR
   );
   check_get_engine_info("/usr/bin/gpg", null);

   test.assertEqual(gpgme.get_armor(ctx), false);
   gpgme.set_armor(ctx, true);
   test.assertEqual(gpgme.get_armor(ctx), true);

   test.assertEqual(gpgme.get_textmode(ctx), false);
   gpgme.set_textmode(ctx, true);
   test.assertEqual(gpgme.get_textmode(ctx), true);

   test.assertEqual(gpgme.get_include_certs(ctx), gpgme.include_certs.DEFAULT);
   gpgme.set_include_certs(ctx, 42);
   test.assertEqual(gpgme.get_include_certs(ctx), 42);

   let mode = gpgme.get_keylist_mode(ctx);
   test.assertEqual(mode, gpgme.keylist_mode.LOCAL);
   test.assertEqual(
      gpgme.set_keylist_mode(
         ctx,
         (mode | gpgme.keylist_mode.EXTERN) & ~gpgme.keylist_mode.LOCAL
      ),
      gpgme.err.code.NO_ERROR
   );
   test.assertEqual(
      gpgme.get_keylist_mode(ctx),
      (mode | gpgme.keylist_mode.EXTERN) & ~gpgme.keylist_mode.LOCAL
   );

   test.assertEqual(
      gpgme.set_locale(ctx, gpgme.lc.ALL, "en_GB"),
      gpgme.err.code.NO_ERROR
   );

   gpgme.release(ctx);
}
// }}}
