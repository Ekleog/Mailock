const ctypes = require("chrome").Cu
               .import("resource://gre/modules/ctypes.jsm").ctypes;

const gpgme = ctypes.open(require("os").getDynLib());

const string = ctypes.char.ptr;

let ns = {};

function decl() {
   let args = [v for each (v in arguments)];
   let name = args.shift();
   let call = ["gpgme_" + name, ctypes.default_abi].concat(args);
   ns[name] = gpgme.declare.apply(gpgme, call);
}

// {{{ fromJs, toJs
function fromJs(str) {
   if (!str && str !== "") return string(0);
   else                    return str;
}

function toJs(str) {
   if (str.isNull()) return null;
   else              return str.readString();
}
// }}}

const error_t = ctypes.uint32_t;
const enum_t = ctypes.uint32_t;

// {{{ 2
// {{{ 2.6
decl("check_version", string, string);
exports.check_version = function(str) {
   return toJs(ns.check_version(fromJs(str)));
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
decl("engine_check_version", error_t, protocol_t);
exports.engine_check_version = function(proto) {
   return ns.engine_check_version(proto);
}
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
decl("set_engine_info", error_t, protocol_t, string, string);
exports.set_engine_info = function(proto, file_name, home_dir) {
   return ns.set_engine_info(proto, fromJs(file_name), fromJs(home_dir));
}
// }}} 3.3
// }}} 3
// {{{ 4
// {{{ 4.1
const pubkey_algo_t = enum_t;
exports.PK_RSA    = 1;
exports.PK_RSA_E  = 2;
exports.PK_RSA_S  = 3;
exports.PK_ELG_E  = 16;
exports.PK_DSA    = 17;
exports.PK_ELG    = 20;
exports.PK_ECDSA  = 301;
exports.PK_ECDH   = 302;

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
// {{{ 5.4
decl("strerror", string, error_t);
exports.strerror = function(err) {
   return toJs(ns.strerror(error_t(err)));
}
// }}} 5.4
// }}} 5

console.log(exports.check_version());
console.log(exports.get_protocol_name(exports.PROTOCOL_OpenPGP));
console.log(exports.strerror(exports.engine_check_version(exports.PROTOCOL_OpenPGP)));

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
print_engine_info();
console.log(exports.strerror(exports.set_engine_info(exports.PROTOCOL_OpenPGP, "my_gpg2", "my_home")));
print_engine_info();

console.log(exports.pubkey_algo_name(exports.PK_RSA));
console.log(exports.hash_algo_name(exports.MD_SHA1));
