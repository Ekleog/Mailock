const ctypes = require("chrome").Cu
               .import("resource://gre/modules/ctypes.jsm").ctypes;

const gpgme = ctypes.open(require("os").getDynLib());

const string = ctypes.char.ptr;
const int_t  = ctypes.int;
const uint_t = ctypes.unsigned_int;
const off_t  = ctypes.long;

let ns = {};

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
exports.PROTOCOL_OpenPGP   = 0;
exports.PROTOCOL_CMS       = 1;
exports.PROTOCOL_GPGCONF   = 2;
exports.PROTOCOL_ASSUAN    = 3;
exports.PROTOCOL_G13       = 4;
exports.PROTOCOL_UISERVER  = 5;
exports.PROTOCOL_DEFAULT   = 254;
exports.PROTOCOL_UNKNOWN   = 255;

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

function engine_info_t(next_, protocol_, file_name_, home_dir_,
                       version_, req_version_) {
   var next__       = next_;
   this.protocol    = protocol_;
   this.file_name   = file_name_;
   this.home_dir    = home_dir_;
   this.version     = version_;
   this.req_version = req_version_;

   this.__defineGetter__("next", function() {
      return engine_info_t_from_ptr(next__);
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
decle("set_engine_info", error_t, protocol_t, string, string);
// }}} 3.3
// }}} 3
// {{{ 4
// {{{ 4.1
const pubkey_algo_t = enum_t;
exports.PK_RSA   = 1;
exports.PK_RSA_E = 2;
exports.PK_RSA_S = 3;
exports.PK_ELG_E = 16;
exports.PK_DSA   = 17;
exports.PK_ELG   = 20;
exports.PK_ECDSA = 301;
exports.PK_ECDH  = 302;

decl("pubkey_algo_name", string, pubkey_algo_t);
exports.pubkey_algo_name = function(algo) {
   return toJs(ns.pubkey_algo_name(algo));
}
// }}} 4.1
// {{{ 4.2
const hash_algo_t = enum_t;
exports.MD_NONE          = 0;
exports.MD_MD5           = 1;
exports.MD_SHA1          = 2;
exports.MD_RMD160        = 3;
exports.MD_MD2           = 5;
exports.MD_TIGER         = 6;
exports.MD_HAVAL         = 7;
exports.MD_SHA256        = 8;
exports.MD_SHA384        = 9;
exports.MD_SHA512        = 10;
exports.MD_MD4           = 301;
exports.MD_CRC32         = 302;
exports.MD_CRC32_RFC1510 = 303;
exports.MD_CRC24_RFC2440 = 304;

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
   let ret = ns.data_new_from_file(res.address(), file, 1);
   return { ret: ret, res: res };
}

decl("data_new_from_filepart",
      error_t,
      data_t.ptr, string, ctypes.voidptr_t, off_t, ctypes.size_t);
exports.data_new_from_file = function(file, off, len) {
   let res = data_t();
   let ret = ns.data_new_from_filepart(res.address(), file, 0, off, len);
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

decle("data_set_file_name", error_t, data_t, string);

const data_encoding_t = enum_t;
exports.DATA_ENCODING_NONE   = 0;
exports.DATA_ENCODING_BINARY = 1;
exports.DATA_ENCODING_BASE64 = 2;
exports.DATA_ENCODING_ARMOR  = 3;
exports.DATA_ENCODING_URL    = 4;
exports.DATA_ENCODING_URLESC = 5;
exports.DATA_ENCODING_URL0   = 6;

decle("data_get_encoding", data_encoding_t, data_t);
decle("data_set_encoding", error_t, data_t, data_encoding_t);
// }}} 6.3.2
// }}} 6.3
// }}} 6

console.log(exports.check_version()); // 2.6

console.log(exports.get_protocol_name(exports.PROTOCOL_OpenPGP)); // 3.0
console.log(exports.strerror(exports.engine_check_version(exports.PROTOCOL_OpenPGP))); // 3.1
function print_engine_info() {
   let ret = exports.get_engine_info();
   console.log(exports.strerror(ret.ret));
   let o = ret.res;
   while (o) {
      // p is a trick for not printing o.next (messes output)
      let p = o.next;
      delete o.next;
      console.log(JSON.stringify(o));
      o = p;
   }
}
print_engine_info(); // 3.2
console.log(exports.strerror(exports.set_engine_info(exports.PROTOCOL_OpenPGP, "my_gpg2", "my_home"))); // 3.3
print_engine_info();

console.log(exports.pubkey_algo_name(exports.PK_RSA)); // 4.1
console.log(exports.hash_algo_name(exports.MD_SHA1)); // 4.2

// 5
let tst = [];
tst[0] = exports.err_make(err.source.PINENTRY, err.code.KEYSERVER);
tst[1] = exports.error(err.code.INV_PASSPHRASE);
tst[2] = exports.err_make_from_errno(err.source.KEYBOX, 33); // EDOM
tst[3] = exports.error_from_errno(84); // EILSEQ
tst[4] = exports.err_code_from_errno(34); // ERANGE
console.log(exports.err_code_to_errno(tst[4]));
for each (e in tst)
   console.log(exports.strsource(e) + ": " + exports.strerror(e));

// 6
function ab2str(buf) {
   return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function str2ab(str) {
   let buf = new ArrayBuffer(str.length);
   let bufView = new Uint8Array(buf);
   for (let i = 0, strLen = str.length ; i < strLen ; ++i) {
      bufView[i] = str.charCodeAt(i);
   }
   return buf;
}
let buf = str2ab("Hello, World !");
console.log(ab2str(buf));
let ret = exports.data_new_from_mem(buf);
console.log(exports.strerror(ret.ret));
console.log(ab2str(exports.data_release_and_get_mem(ret.res)));

ret = exports.data_new();
buf = ret.res;
console.log(exports.strerror(ret.ret));
console.log(exports.data_write(buf, str2ab("42")) == 2);
console.log(exports.data_write(buf, str2ab(" 42... !")) == 8);
console.log(exports.data_seek(buf, 0, exports.SEEK_SET) == 0);
console.log(ab2str(exports.data_read(buf, 8)));
console.log(exports.data_seek(buf, -5, exports.SEEK_CUR) == 3);
console.log(ab2str(exports.data_read(buf, 7)));
console.log(exports.data_seek(buf, 3, exports.SEEK_SET) == 3);
console.log(ab2str(exports.data_read(buf, 7)));