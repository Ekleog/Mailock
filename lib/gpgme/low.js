// TODO: Use ctypes.CDataFinalizer on firefox 15 release
const ctypes = require("chrome").Cu
               .import("resource://gre/modules/ctypes.jsm").ctypes;

const gpgme = ctypes.open(require("os").getDynLib("gpgme"));

const libc = require("gpgme/libc");

const string = ctypes.char.ptr;
const int_t  = ctypes.int;
const uint_t = ctypes.unsigned_int;
const off_t  = ctypes.long;

let ns = {};
let keep_live = []; // Used to tell JS's GC not to collect our data

// {{{ decl, decle
function decl() {
   let args = [v for each (v in arguments)];
   let name = args.shift();
   let call = ["gpgme_" + name, ctypes.default_abi].concat(args);
   ns[name] = gpgme.declare.apply(gpgme, call);
}

function decle() {
   let args = [v for each (v in arguments)];
   let name = args.shift();
   let call = ["gpgme_" + name, ctypes.default_abi].concat(args);
   exports[name] = gpgme.declare.apply(gpgme, call);
}
// }}}
// {{{ toJs, fromJs
function fromJs(str) {
   if (!str && str !== "") return string(0);
   else                    return str;
}

function toJs(str) {
   if (str.isNull()) return null;
   else              return str.readString();
}
// }}}
// {{{ bitfield_get(obj, bitfield, bit, name)
function bitfield_get(obj, bitfield, bit, name) {
   obj.__defineGetter__(name, function() {
      return bitfield >> bit & 1;
   });
}
// }}}

const enum_t = uint_t;

const error_t = uint_t; // Forward from 5.1

// {{{ 2
// {{{ 2.6
decl("check_version", string, string);
exports.check_version = function(ver) {
   return toJs(ns.check_version(fromJs(ver)));
}
// }}} 2.6
// }}} 2
// {{{ 3
// {{{ 3.0
const protocol_t = enum_t;
exports.protocol = {};
exports.protocol.OpenPGP   = 0;
exports.protocol.CMS       = 1;
exports.protocol.GPGCONF   = 2;
exports.protocol.ASSUAN    = 3;
exports.protocol.G13       = 4;
exports.protocol.UISERVER  = 5;
exports.protocol.DEFAULT   = 254;
exports.protocol.UNKNOWN   = 255;

decl("get_protocol_name", string, protocol_t);
exports.get_protocol_name = function(proto) {
   return toJs(ns.get_protocol_name(proto));
}
// }}} 3.0
// {{{ 3.1
decle("engine_check_version", error_t, protocol_t);
// }}} 3.1
// {{{ 3.2
const engine_info_t_def = ctypes.StructType("gpgme_engine_info_t");
const engine_info_t_ptr = engine_info_t_def.ptr;
engine_info_t_def.define([
      { next        : engine_info_t_ptr },
      { protocol    : protocol_t        },
      { file_name   : string            },
      { version     : string            },
      { req_version : string            },
      { home_dir    : string            },
   ]);

function engine_info_t_from_ptr(ptr) {
   if (ptr.isNull())
      return null;
   else
      return new engine_info_t(
         ptr.contents.next,
         ptr.contents.protocol,
         toJs(ptr.contents.file_name),
         toJs(ptr.contents.home_dir),
         toJs(ptr.contents.version),
         toJs(ptr.contents.req_version)
      );
}

function engine_info_t(next, protocol, file_name, home_dir,
                       version, req_version) {
   this.protocol    = protocol;
   this.file_name   = file_name;
   this.home_dir    = home_dir;
   this.version     = version;
   this.req_version = req_version;

   this.__defineGetter__("next", function() {
      return engine_info_t_from_ptr(next);
   });
   // Yeah, no setter, it would be meaningless
}

decl("get_engine_info", error_t, engine_info_t_ptr.ptr);
exports.get_engine_info = function() {
   let res = engine_info_t_ptr();
   let ret = ns.get_engine_info(res.address());
   return {
      ret: ret,
      res: engine_info_t_from_ptr(res),
   };
}
// }}} 3.2
// {{{ 3.3
decl("set_engine_info", error_t, protocol_t, string, string);
exports.set_engine_info = function(proto, file, home) {
   return ns.set_engine_info(proto, fromJs(file), fromJs(home));
}
// }}} 3.3
// }}} 3
// {{{ 4
// {{{ 4.1
const pubkey_algo_t = enum_t;
exports.pk = {};
exports.pk.RSA   = 1;
exports.pk.RSA_E = 2;
exports.pk.RSA_S = 3;
exports.pk.ELG_E = 16;
exports.pk.DSA   = 17;
exports.pk.ELG   = 20;
exports.pk.ECDSA = 301;
exports.pk.ECDH  = 302;

decl("pubkey_algo_name", string, pubkey_algo_t);
exports.pubkey_algo_name = function(algo) {
   return toJs(ns.pubkey_algo_name(algo));
}
// }}} 4.1
// {{{ 4.2
const hash_algo_t = enum_t;
exports.md = {};
exports.md.NONE          = 0;
exports.md.MD5           = 1;
exports.md.SHA1          = 2;
exports.md.RMD160        = 3;
exports.md.MD2           = 5;
exports.md.TIGER         = 6;
exports.md.HAVAL         = 7;
exports.md.SHA256        = 8;
exports.md.SHA384        = 9;
exports.md.SHA512        = 10;
exports.md.MD4           = 301;
exports.md.CRC32         = 302;
exports.md.CRC32_RFC1510 = 303;
exports.md.CRC24_RFC2440 = 304;

decl("hash_algo_name", string, hash_algo_t);
exports.hash_algo_name = function(algo) {
   return toJs(ns.hash_algo_name(algo));
}
// }}} 4.2
// }}} 4
// {{{ 5
// {{{ 5.1
const err_code_t   = enum_t;
const err_source_t = enum_t;
const err = exports.err = require("gpgme/gpg-error");

// const error_t = uint_t; (forwarded)

exports.err_code = function(error) {
   return (error & err.code.MASK);
}
exports.err_source = function(error) {
   return ((error >> err.source.SHIFT) & err.source.MASK);
}

exports.err_make = function(source, code) {
   return code == err.code.NO_ERROR ? err.code.NO_ERROR
      : (((source & err.source.MASK) << err.source.SHIFT)
         | (code & err.code.MASK));
}

exports.error = function(code) {
   return exports.err_make(err.SOURCE_USER_1, code);
}

decle("err_make_from_errno", error_t, err_source_t, int_t);
decle("error_from_errno", error_t, int_t);
decle("err_code_from_errno", err_code_t, int_t);
decle("err_code_to_errno", int_t, err_code_t);
// }}} 5.1
// {{{ 5.4
decl("strerror", string, error_t);
exports.strerror = function(error) {
   return toJs(ns.strerror(error));
}

// TODO: Declare strerror_r ?

decl("strsource", string, error_t);
exports.strsource = function(error) {
   return toJs(ns.strsource(error));
}
// }}} 5.4
// }}} 5
// {{{ 6
// {{{ 6.0
const data_t = ctypes.StructType("gpgme_data_t").ptr;

exports.ab2str = function(buf) {
   return String.fromCharCode.apply(null, new Uint8Array(buf));
}
exports.str2ab = function(str) {
   // TODO: Is there a "normal" helper ?
   let buf = new ArrayBuffer(str.length);
   let bufView = new Uint8Array(buf);
   for (let i = 0, strLen = str.length ; i < strLen ; ++i) {
      bufView[i] = str.charCodeAt(i);
   }
   return buf;
}
// }}} 6.0
// {{{ 6.1
// {{{ 6.1.1
decl("data_new", error_t, data_t.ptr);
exports.data_new = function() {
   let res = data_t();
   let ret = ns.data_new(res.address());
   return { ret: ret, res: res };
}

decl("data_new_from_mem",
      error_t,
      data_t.ptr, ctypes.uint8_t.ptr, ctypes.size_t, ctypes.int);
exports.data_new_from_mem = function(data) {
   let res = data_t();
   // TODO: On firefox 15 release, do just :
   //let ret = ns.data_new_from_mem(res.address(), data, data.byteLength, 1);
   let view = Uint8Array(data);
   let ary = ctypes.ArrayType(ctypes.uint8_t)(view.length);
   for (let i = 0 ; i < view.length ; ++i)
      ary[i] = view[i];
   let ret = ns.data_new_from_mem(res.address(), ary, data.byteLength, 1);
   return { ret: ret, res: res };
}

decl("data_new_from_file", error_t, data_t.ptr, string, ctypes.int);
exports.data_new_from_file = function(file) {
   let res = data_t();
   let ret = ns.data_new_from_file(res.address(), fromJs(file), 1);
   return { ret: ret, res: res };
}

decl("data_new_from_filepart",
      error_t,
      data_t.ptr, string, ctypes.voidptr_t, off_t, ctypes.size_t);
exports.data_new_from_filepart = function(file, off, len) {
   let res = data_t();
   let ret = ns.data_new_from_filepart(res.address(), fromJs(file), null, off, len);
   return { ret: ret, res: res };
}
// }}} 6.1.1
// {{{ 6.1.2
// TODO: data_new_from_fd ?
// TODO: data_new_from_stream ?
// }}} 6.1.2
// {{{ 6.1.3
const data_read_cb_t =
   ctypes.FunctionType(ctypes.default_abi,
      ctypes.ssize_t,
      [ctypes.voidptr_t, ctypes.voidptr_t, ctypes.size_t]).ptr;
const data_write_cb_t = data_read_cb_t; // const doesn't matter

const data_seek_cb_t =
   ctypes.FunctionType(ctypes.default_abi,
      off_t,
      [ctypes.voidptr_t, off_t, ctypes.int]).ptr;
const data_release_cb_t =
   ctypes.FunctionType(ctypes.default_abi,
      ctypes.void_t,
      [ctypes.voidptr_t]).ptr;

const data_cbs_t =
   ctypes.StructType("gpgme_data_cbs", [
      { read   : data_read_cb_t    },
      { write  : data_write_cb_t   },
      { seek   : data_seek_cb_t    },
      { release: data_release_cb_t },
   ]);

/* TODO: Uncomment and test
decl("data_new_from_cbs", data_t.ptr, data_cbs_t, ctypes.voidptr_t);
exports.data_new_from_cbs = function(cbs) {
   if (!cbs.read)    cbs.read    = function()           { return 0; };
   if (!cbs.write)   cbs.write   = function(a, b, size) { return size; };
   if (!cbs.seek)    cbs.seek    = function()           { return 0; };
   if (!cbs.release) cbs.release = function()           { };
   let the_cbs = new data_cbs_t;
   the_cbs.read    = function(hnd, buf, siz) { return cbs.read (buf, siz); };
   the_cbs.write   = function(hnd, buf, siz) { return cbs.write(buf, siz); };
   the_cbs.seek    = function(hnd, off, whe) { return cbs.seek (off, whe); };
   the_cbs.release = function(hnd)           { return cbs.release();       };
   let res = data_t();
   let ret = ns.data_new_from_cbs(res.address(), the_cbs, null);
   return { ret: ret, res: res };
}

decl("data_new_with_read_cb",
      error_t,
      data_t.ptr,
      data_read_cb_t,
      ctypes.FunctionType(ctypes.default_abi,
         ctypes.int,
         ctypes.voidptr_t, ctypes.char.ptr, ctypes.size_t, ctypes.size_t.ptr),
      ctypes.voidptr_t);
exports.data_new_with_read_cb = function(func) {
   let cb = function(hook, buffer, count, nread) {
      let ret = func(buffer, count); // TODO: A better way of managing arrays
      nread.content = ret.nread;
      return ret.ret;
   }
   let res = data_t();
   let ret = ns.data_new_with_read_cb(ret.address(), cb, null);
   return { ret: ret, res: res };
}
*/
// }}} 6.1.3
// }}} 6.1
// {{{ 6.2
decle("data_release", ctypes.void_t, data_t);

decl("free", ctypes.void_t, ctypes.uint8_t.ptr);
// TODO: File a bug for building ArrayBuffer from pointer and size
decl("data_release_and_get_mem", ctypes.uint8_t.ptr, data_t, ctypes.size_t.ptr);
exports.data_release_and_get_mem = function(data) {
   let size = ctypes.size_t();
   let ptr = ns.data_release_and_get_mem(data, size.address());
   if (size.toSource().substr(0, 27) == "ctypes.size_t(ctypes.UInt64")
      size = ctypes.UInt64.lo(size.value);
   let buffer = ArrayBuffer(size);
   let view = Uint8Array(buffer);
   for (let i = 0 ; i < size ; ++i, ptr = ptr.increment())
      view[i] = ptr.contents;
   ns.free(ptr);
   return buffer;
}
// }}} 6.2
// {{{ 6.3
// {{{ 6.3.1
decl("data_read",  ctypes.ssize_t, data_t, ctypes.voidptr_t, ctypes.size_t);
exports.data_read = function(data, size) {
   // TODO: Isn't it possible to pass an ArrayBuffer ? ("On firefox 15 release")
   let ary = ctypes.ArrayType(ctypes.uint8_t)(size);
   let read = ns.data_read(data, ary.address(), size);
   let buffer = new ArrayBuffer(read);
   let view = Uint8Array(buffer);
   for (let i = 0 ; i < read ; ++i)
      view[i] = ary[i];
   return buffer;
}

decl("data_write", ctypes.ssize_t, data_t, ctypes.voidptr_t, ctypes.size_t);
exports.data_write = function(data, buf) {
   // TODO: Isn't it possible to pass an ArrayBuffer ? ("On firefox 15 release")
   let view = Uint8Array(buf);
   let ary = ctypes.ArrayType(ctypes.uint8_t)(view.length);
   for (let i = 0 ; i < view.length ; ++i)
      ary[i] = view[i];
   return ns.data_write(data, ary.address(), buf.byteLength);
}

exports.SEEK_SET = 0;
exports.SEEK_CUR = 1;
//exports.SEEK_END = 2; // TODO: Acts really weird when used... ?

decle("data_seek",  off_t, data_t, off_t, ctypes.int);
// }}} 6.3.1
// {{{ 6.3.2
decl("data_get_file_name", string, data_t);
exports.data_get_file_name = function(data) {
   return toJs(ns.data_get_file_name(data));
}

decl("data_set_file_name", error_t, data_t, string);
exports.data_set_file_name = function(data, file) {
   return ns.data_set_file_name(data, fromJs(file));
}

const data_encoding_t = enum_t;
exports.data_encoding = {};
exports.data_encoding.NONE   = 0;
exports.data_encoding.BINARY = 1;
exports.data_encoding.BASE64 = 2;
exports.data_encoding.ARMOR  = 3;
exports.data_encoding.URL    = 4;
exports.data_encoding.URLESC = 5;
exports.data_encoding.URL0   = 6;

decle("data_get_encoding", data_encoding_t, data_t);
decle("data_set_encoding", error_t, data_t, data_encoding_t);
// }}} 6.3.2
// }}} 6.3
// }}} 6
// {{{ 7
// {{{ 7.0
const ctx_t = ctypes.StructType("gpgme_ctx_t").ptr;
// }}} 7.0
// {{{ 7.1
decl("new", error_t, ctx_t.ptr);
exports.new = function() {
   let res = ctx_t();
   let ret = ns.new(res.address());
   return { ret: ret, res: res };
}
// }}} 7.1
// {{{ 7.2
decle("release", ctypes.void_t, ctx_t);
// }}} 7.2
// {{{ 7.3
decle("result_ref", ctypes.void_t, ctypes.voidptr_t);
decle("result_unref", ctypes.void_t, ctypes.voidptr_t);
// }}} 7.3
// {{{ 7.4
// {{{ 7.4.1
decle("set_protocol", error_t, ctx_t, protocol_t);
decle("get_protocol", protocol_t, ctx_t);
// }}} 7.4.1
// {{{ 7.4.2
decl("ctx_get_engine_info", engine_info_t_ptr, ctx_t);
exports.ctx_get_engine_info = function(ctx) {
   return engine_info_t_from_ptr(ns.ctx_get_engine_info(ctx));
}

decl("ctx_set_engine_info", error_t, ctx_t, protocol_t, string, string);
exports.ctx_set_engine_info = function(ctx, proto, file, home) {
   return ns.ctx_set_engine_info(ctx, proto, fromJs(file), fromJs(home));
}
// }}} 7.4.2
// {{{ 7.4.3
decl("set_armor", ctypes.void_t, ctx_t, ctypes.int);
exports.set_armor = function(ctx, yes) { ns.set_armor(ctx, yes ? 1 : 0); }

decl("get_armor", ctypes.int, ctx_t);
exports.get_armor = function(ctx) { return ns.get_armor(ctx) ? true : false; }
// }}} 7.4.3
// {{{ 7.4.4
decl("set_textmode", ctypes.void_t, ctx_t, ctypes.int);
exports.set_textmode = function(ctx, yes) { ns.set_textmode(ctx, yes ? 1 : 0); }

decl("get_textmode", ctypes.int, ctx_t);
exports.get_textmode = function(ctx) { return ns.get_textmode(ctx) ? true : false; }
// }}} 7.4.4
// {{{ 7.4.5
exports.INCLUDE_CERTS_DEFAULT = -256;
decle("set_include_certs", ctypes.void_t, ctx_t, ctypes.int);
decle("get_include_certs", ctypes.int, ctx_t);
// }}} 7.4.5
// {{{ 7.4.6
const keylist_mode_t = enum_t;
exports.keylist_mode = {};
exports.keylist_mode.LOCAL        = 1;
exports.keylist_mode.EXTERN       = 2;
exports.keylist_mode.SIGS         = 4;
exports.keylist_mode.SIG_NOTATION = 8;
exports.keylist_mode.EPHEMERAL    = 128;
exports.keylist_mode.VALIDATE     = 256;

decle("set_keylist_mode", error_t, ctx_t, keylist_mode_t);
decle("get_keylist_mode", keylist_mode_t, ctx_t);
// }}} 7.4.6
// {{{ 7.4.7
const passphrase_cb_t =
   ctypes.FunctionType(ctypes.default_abi,
      error_t,
      [ctypes.voidptr_t, string, string, ctypes.int, ctypes.int]).ptr;

// Format for a cb :
// { ret: error_t, res: ArrayBuffer } cb(uid_hint, passphrase_info, prev_was_bad)
decl("set_passphrase_cb", ctypes.void_t, ctx_t, passphrase_cb_t, ctypes.voidptr_t);
exports.set_passphrase_cb = function(ctx, cb) {
   keep_live.push(passphrase_cb_t( // TODO: Could lead to mem leak... Fix ?
      function(hook, uid_hint, passphrase_info, prev_was_bad, fd) {
         let ret = cb(toJs(uid_hint), toJs(passphrase_info), prev_was_bad ? true : false);
         // TODO: Write ret.res to fd
         return ret.ret;
      }
   ));
   ns.set_passphrase_cb(ctx, keep_live[keep_live.length - 1], null);
}

// TODO: get_passphrase_cb_t ? (no meaning for JS-based callbacks :/)
// }}} 7.4.7
// {{{ 7.4.8
const progress_cb_t =
   ctypes.FunctionType(ctypes.default_abi,
      ctypes.void_t,
      [ctypes.voidptr_t, string, ctypes.int, ctypes.int, ctypes.int]).ptr;

// Format for a cb :
// void cb(what, type, curent, total)
decl("set_progress_cb", ctypes.void_t, ctx_t, progress_cb_t, ctypes.voidptr_t);
exports.set_progress_cb = function(ctx, cb) {
   keep_live.push(progress_cb_t( // TODO: Could lead to mem leak... Fix ?
      function(hook, what, type, current, total) {
         cb(toJs(what), type, current, total);
      }
   ));
   ns.set_progress_cb(ctx, keep_live[keep_live.length - 1], null);
}

// TODO: get_progress_cb_t ? (no meaning for JS-based callbacks :/)
// }}} 7.4.8
// {{{ 7.4.9
exports.lc = libc.lc;

decl("set_locale", error_t, ctx_t, ctypes.int, string);
exports.set_locale = function(ctx, type, locale) {
   return ns.set_locale(ctx, type, fromJs(locale));
}
// }}} 7.4.9
// }}} 7.4
// {{{ 7.5
// {{{ 7.5.0
// {{{ subkey_t
const subkey_t_def = ctypes.StructType("gpgme_subkey_t");
const subkey_t_ptr = subkey_t_def.ptr;
subkey_t_def.define([
      { next        : subkey_t_ptr          },
      { _bitfield   : ctypes.uint32_t       },
      { pubkey_algo : pubkey_algo_t         },
      { length      : ctypes.unsigned_int   },
      { keyid       : string                },
      { _reserved   : ctypes.char.array(17) },
      { fpr         : string                },
      { timestamp   : ctypes.long           },
      { expires     : ctypes.long           },
      { card_number : string                },
   ]);
function subkey_t_from_ptr(ptr) {
   if (ptr.isNull())
      return null;
   else
      return new subkey_t(
         ptr.contents.next,
         ptr.contents._bitfield,
         ptr.contents.pubkey_algo,
         ptr.contents.length,
         toJs(ptr.contents.keyid),
         toJs(ptr.contents.fpr),
         ptr.contents.timestamp,
         ptr.contents.expires,
         toJs(ptr.contents.card_number)
      );
}
function subkey_t(next, _bitfield, pubkey_algo, length, keyid, fpr, timestamp,
                  expires, card_number) {
   this.pubkey_algo = pubkey_algo;
   this.length      = length;
   this.keyid       = keyid;
   this.fpr         = fpr;
   this.timestamp   = timestamp;
   this.expires     = expires;
   this.card_number = card_number;

   this.__defineGetter__("next", function() {
      return subkey_t_from_ptr(next);
   });

   bitfield_get(this, _bitfield, 31, "revoked");
   bitfield_get(this, _bitfield, 30, "expired");
   bitfield_get(this, _bitfield, 29, "disabled");
   bitfield_get(this, _bitfield, 28, "invalid");
   bitfield_get(this, _bitfield, 27, "can_encrypt");
   bitfield_get(this, _bitfield, 26, "can_sign");
   bitfield_get(this, _bitfield, 25, "can_certify");
   bitfield_get(this, _bitfield, 24, "secret");
   bitfield_get(this, _bitfield, 23, "can_authenticate");
   bitfield_get(this, _bitfield, 22, "is_qualified");
   bitfield_get(this, _bitfield, 21, "is_cardkey");
}
// }}}
// {{{ sig_notation_flags_t
const sig_notation_flags_t = ctypes.unsigned_int;
// }}}
// {{{ sig_notation_t
const sig_notation_t_def = ctypes.StructType("gpgme_sig_notation_t");
const sig_notation_t_ptr = sig_notation_t_def.ptr;
sig_notation_t_def.define([
      { next      : sig_notation_t_ptr   },
      { name      : string               },
      { value     : string               },
      { name_len  : ctypes.int           },
      { value_len : ctypes.int           },
      { flags     : sig_notation_flags_t },
      { _bitfield : ctypes.uint32_t      },
   ]);
function sig_notation_t_from_ptr(ptr) {
   if (ptr.isNull())
      return null;
   else
      return new sig_notation_t(
         ptr.contents.next,
         toJs(ptr.contents.name),
         toJs(ptr.contents.value),
         ptr.contents.name_len,
         ptr.contents.value_len,
         ptr.contents.flags,
         ptr.contents._bitfield
      );
}
function sig_notation_t(next, name, value, name_len, value_len, flags,
                        _bitfield) {
   this.name      = name;
   this.value     = value;
   this.name_len  = name_len;
   this.value_len = value_len;
   this.flags     = flags;

   this.__defineGetter__("next", function() {
      return sig_notation_t_from_ptr(next);
   });

   bitfield_get(this, _bitfield, 31, "human_readable");
   bitfield_get(this, _bitfield, 30, "critical");
}
// }}}
// {{{ key_sig_t
const key_sig_t_def = ctypes.StructType("gpgme_key_sig_t");
const key_sig_t_ptr = key_sig_t_def.ptr;
key_sig_t_def.define([
      { next        : key_sig_t_ptr           },
      { _bitfield   : ctypes.uint32_t         },
      { pubkey_algo : pubkey_algo_t           },
      { keyid       : string                  },
      { _reserved_1 : ctypes.char.array(16+1) },
      { timestamp   : ctypes.long             },
      { expires     : ctypes.long             },
      { status      : error_t                 },
      { _reserved_2 : ctypes.unsigned_int     },
      { uid         : string                  },
      { name        : string                  },
      { email       : string                  },
      { comment     : string                  },
      { sig_class   : ctypes.unsigned_int     },
      { notations   : sig_notation_t_ptr      },
      { _reserved_3 : sig_notation_t_ptr      },
   ]);
function key_sig_t_from_ptr(ptr) {
   if (ptr.isNull())
      return null;
   else
      return new key_sig_t(
         ptr.contents.next,
         ptr.contents._bitfield,
         ptr.contents.pubkey_algo,
         toJs(ptr.contents.keyid),
         ptr.contents.timestamp,
         ptr.contents.expires,
         ptr.contents.status,
         toJs(ptr.contents.uid),
         toJs(ptr.contents.name),
         toJs(ptr.contents.email),
         toJs(ptr.contents.comment),
         ptr.contents.sig_class,
         ptr.contents.notations
      );
}
function key_sig_t(next, _bitfield, pubkey_algo, keyid, timestamp, expires,
                   status, uid, name, email, comment, sig_class, notations) {
   this.pubkey_algo  = pubkey_algo;
   this.keyid        = keyid;
   this.timestamp    = timestamp;
   this.expires      = expires;
   this.status       = status;
   this.uid          = uid;
   this.name         = name;
   this.email        = email;
   this.comment      = comment;
   this.sig_class    = sig_class;

   this.__defineGetter__("next", function() {
      return key_sig_t_from_ptr(next);
   });
   this.__defineGetter__("notations", function() {
      return sig_notation_t_from_ptr(notations);
   });

   bitfield_get(this, _bitfield, 31, "revoked");
   bitfield_get(this, _bitfield, 30, "expired");
   bitfield_get(this, _bitfield, 29, "invalid");
   bitfield_get(this, _bitfield, 28, "exportable");
}
// }}}
// {{{ validity_t
const validity_t = enum_t;
exports.validity = {};
exports.validity.UNKNOWN   = 0;
exports.validity.UNDEFINED = 1;
exports.validity.NEVER     = 2;
exports.validity.MARGINAL  = 3;
exports.validity.FULL      = 4;
exports.validity.ULTIMATE  = 5;
// }}}
// {{{ user_id_t
const user_id_t_def = ctypes.StructType("gpgme_user_id_t");
const user_id_t_ptr = user_id_t_def.ptr;
user_id_t_def.define([
      { next       : user_id_t_ptr   },
      { _bitfield  : ctypes.uint32_t },
      { validity   : validity_t      },
      { uid        : string          },
      { name       : string          },
      { email      : string          },
      { comment    : string          },
      { signatures : key_sig_t_ptr   },
      { _reserved  : key_sig_t_ptr   },
   ]);
function user_id_t_from_ptr(ptr) {
   if (ptr.isNull())
      return null;
   else
      return new user_id_t(
         ptr.contents.next,
         ptr.contents._bitfield,
         ptr.contents.validity,
         toJs(ptr.contents.uid),
         toJs(ptr.contents.name),
         toJs(ptr.contents.email),
         toJs(ptr.contents.comment),
         ptr.contents.signatures
      );
}
function user_id_t(next, _bitfield, validity, uid, name, email, comment,
                   signatures) {
   this.validity = validity;
   this.uid      = uid;
   this.name     = name;
   this.email    = email;
   this.comment  = comment;

   this.__defineGetter__("next", function() {
      return user_id_t_from_ptr(next);
   });
   this.__defineGetter__("signatures", function() {
      return key_sig_t_from_ptr(signatures);
   });

   bitfield_get(this, _bitfield, 31, "revoked");
   bitfield_get(this, _bitfield, 30, "invalid");
}
// }}}
// {{{ key_t
const key_t_def = ctypes.StructType("gpgme_key_t");
const key_t_ptr = key_t_def.ptr;
key_t_def.define([
      { _reserved_1   : ctypes.unsigned_int },
      { _bitfield     : ctypes.uint32_t     },
      { protocol      : protocol_t          },
      { issuer_serial : string              },
      { issuer_name   : string              },
      { chain_id      : string              },
      { owner_trust   : validity_t          },
      { subkeys       : subkey_t_ptr        },
      { uids          : user_id_t_ptr       },
      { _reserved_2   : subkey_t_ptr        },
      { _reserved_3   : user_id_t_ptr       },
      { keylist_mode  : keylist_mode_t      },
   ]);
function key_t_from_ptr(ptr) {
   if (ptr.isNull())
      return null;
   else
      return new key_t(
         ptr.contents._bitfield,
         ptr.contents.protocol,
         toJs(ptr.contents.issuer_serial),
         toJs(ptr.contents.issuer_name),
         toJs(ptr.contents.chain_id),
         ptr.contents.owner_trust,
         ptr.contents.subkeys,
         ptr.contents.uids,
         ptr.contents.keylist_mode
      );
}
function key_t(_bitfield, protocol, issuer_serial, issuer_name, chain_id,
               owner_trust, subkeys, uids, keylist_mode) {
   this.protocol      = protocol;
   this.issuer_serial = issuer_serial;
   this.issuer_name   = issuer_name;
   this.chain_id      = chain_id;
   this.owner_trust   = owner_trust;
   this.keylist_mode  = keylist_mode;

   this.__defineGetter__("subkeys", function() {
      return subkey_t_from_ptr(subkeys);
   });
   this.__defineGetter__("uids", function() {
      return user_id_t_from_ptr(uids);
   });

   bitfield_get(this, _bitfield, 31, "revoked");
   bitfield_get(this, _bitfield, 30, "expired");
   bitfield_get(this, _bitfield, 29, "disabled");
   bitfield_get(this, _bitfield, 28, "invalid");
   bitfield_get(this, _bitfield, 27, "can_encrypt");
   bitfield_get(this, _bitfield, 26, "can_sign");
   bitfield_get(this, _bitfield, 25, "can_certify");
   bitfield_get(this, _bitfield, 24, "secret");
   bitfield_get(this, _bitfield, 23, "can_authenticate");
   bitfield_get(this, _bitfield, 22, "is_qualified");
}
// }}}
// }}} 7.5.0
// {{{ 7.5.1
decl("key_ref", ctypes.void_t, key_t_ptr);

decl("op_keylist_start", error_t, ctx_t, string, ctypes.int);
exports.op_keylist_start = function (ctx, pattern, secret_only) {
   return ns.op_keylist_start(ctx, fromJs(pattern), secret_only ? 1 : 0);
}

decl("op_keylist_ext_start", error_t, ctx_t, string.ptr, ctypes.int, ctypes.int);
exports.op_keylist_ext_start = function(ctx, patterns, secret_only) {
   let pat = ctypes.ArrayType(string)(patterns.length + 1);
   for (let i = 0 ; i < patterns.length ; ++i) 
      pat[i] = fromJs(patterns[i]);
   pat[patterns.length] = null;
   return ns.op_keylist_ext_start(ctx, pat, secret_only ? 1 : 0, 0);
}

decl("op_keylist_next", error_t, ctx_t, key_t_ptr.ptr);
exports.op_keylist_next = function(ctx) {
   let res = key_t_ptr();
   let ret = ns.op_keylist_next(ctx, res.address());
   return { ret: ret, res: res };
}

decle("op_keylist_end", error_t, ctx_t);

const keylist_result_t_def = ctypes.StructType("gpgme_keylist_result_t", [
      { _bitfield : ctypes.uint32_t },
   ]);
const keylist_result_t_ptr = keylist_result_t_def.ptr;
function keylist_result_t(truncated) {
   this.truncated = truncated;
}
function keylist_result_t_from_ptr(ptr) {
   return keylist_result_t(ptr.contents & 1); // TODO: Check it's valid
}

decl("op_keylist_result", keylist_result_t_ptr, ctx_t);
exports.op_keylist_result = function(ctx) {
   return keylist_result_t_from_ptr(ns.op_keylist_result(ctx));
}

decl("get_key", error_t, ctx_t, string, key_t_ptr.ptr, ctypes.int);
exports.get_key = function(ctx, fpr, secret) {
   let res = key_t_ptr();
   let ret = ns.get_key(ctx, fpr, res.address(), secret ? 1 : 0);
   return { ret: ret, res: res };
}
// }}} 7.5.1
// {{{ 7.5.2
// See validity in 7.5.0
// Deprecated interfaces not included
// }}} 7.5.2
// {{{ 7.5.3
// Deprecated interfaces not included
// }}} 7.5.3
// {{{ 7.5.4
// See 7.5.1 key_ref|unref (not to be used by users)
// Deprecated interfaces not included
// }}} 7.5.4
// }}} 7.5
// }}} 7
