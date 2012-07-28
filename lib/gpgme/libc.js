const ctypes = require("chrome").Cu
               .import("resource://gre/modules/ctypes.jsm").ctypes;

console.log(require("os").getDynLib("libc"));
const libc = ctypes.open(require("os").getDynLib("libc"));

// {{{ toJs, fromJs
function fromJs(str) {
   if (!str && str !== "") return ctypes.char.ptr(0);
   else                    return str;
}

function toJs(str) {
   if (str.isNull()) return null;
   else              return str.readString();
}
// }}}

exports.lc = {};
exports.lc.ALL      = 6;
exports.lc.CTYPE    = 0;
exports.lc.MESSAGES = 5;

const def_setlocale = libc.declare(
      "setlocale", ctypes.default_abi,
      ctypes.char.ptr,
      ctypes.int, ctypes.char.ptr
);
exports.setlocale = function(type, locale) {
   return toJs(def_setlocale(type, fromJs(locale)));
}
