/* Interface :
 *
 * Functions :
 *  * function install()         -> Installs GPG if required
 *  * function handshake(other)  -> Validate the key of other (checked IRL)
 *  * function fingerprint()     -> Returns a fingerprint of our key
 *  * function sign(msg)         -> Sign the message msg
 *  * function check(msg, sign)  -> Checks the signature sign on msg
 *  * function encrypt(msg)      -> Encrypts the message msg
 *  * function decrypt(msg)      -> Decrypts the message msg
 *
 * Structures :
 *  * Person    (other) : String (as returned by fingerprint)
 *  * Signature (sign)  : String (as returned by sign)
 *  * Message   (msg)   : {
 *       dests       : [String (e-mail addresses)],
 *       content     : String,
 *       attachments : [TODO], // TODO: ATM no support
 *    }
 */

const os       = require("os");
const scripts  = os.loadScripts();

exports.install     = function()          { return scripts.install();         }
exports.handshake   = function(other)     { return scripts.handshake(other);  }
exports.fingerprint = function()          { return scripts.fingerprint();     }
exports.sign        = function(msg)       { return scripts.sign(msg);         }
exports.check       = function(msg, sign) { return scripts.check(msg, sign);  }
exports.encrypt     = function(msg)       { return scripts.encrypt(msg);      }
exports.decrypt     = function(msg)       { return scripts.decrypt(msg);      }
