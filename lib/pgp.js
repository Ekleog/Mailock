/* Interface :
 *
 * Functions :
 *  * function install(name, comment, email) -> Installs GPG if required
 *  * function handshake(other)              -> Validate the key of other
 *  * function identity()                    -> Returns a fingerprint of our key
 *  * function sign(msg)                     -> Sign the message msg
 *  * function check(msg, from, sign)        -> Checks sign on msg made by from
 *  * function encrypt(msg)                  -> Encrypts the message msg
 *  * function decrypt(msg, from)            -> Decrypts string msg made by from
 *
 * Structures :
 *  * Person    (other) : String (as returned by fingerprint)
 *  * Signature (sign)  : String (as returned by sign)
 *  * Message   (msg)   : {
 *       dests       : [String (e-mail addresses)],
 *       content     : String, // (HTML tags stripped)
 *       attachments : [TODO], // TODO: ATM no support
 *    }
 */

const os       = require("os");
const scripts  = os.loadScripts();

exports.install   = function(n, c, e)  { return scripts.install(n, c, e);  }
exports.identity  = function()         { return scripts.fingerprint();     }
exports.handshake = function(other)    { return scripts.handshake(other);  }
exports.sign      = function(msg)      { return scripts.sign(msg);         }
exports.check     = function(m, f, s)  { return scripts.check(m, f, s);    }
exports.encrypt   = function(msg)      { return scripts.encrypt(msg);      }
exports.decrypt   = function(m, f)     { return scripts.decrypt(m, f);     }
