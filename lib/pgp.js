/* Interface :
 *
 * Functions :
 *  * function install(name, comment, email) -> Installs GPG if required.
 *  *
 *  * function identity()                    -> Returns a fingerprint of my key.
 *  * function handshake(other)              -> Validate the key of other.
 *  * function knows(email)                  -> Do I know the key of email ?
 *  *
 *  * function outgoing(msg)                 -> Signs (encrypts if possible) the
 *  *                                           outgoing message msg. Returns
 *  *                                           new plaintext message.
 *  * function incoming(msg, from)           -> Checks the signature (decrypts
 *  *                                           if possible) the incoming
 *  *                                           message msg, coming from mail
 *  *                                           address from.
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

exports.identity  = function()         { return scripts.identity();        }
exports.handshake = function(other)    { return scripts.handshake(other);  }
exports.knows     = function(email)    { return scripts.knows(email);      }

exports.outgoing  = function(msg) {
   for each (dest in msg.dests)
      if (!exports.knows(dest))
         return scripts.sign(msg);
   return scripts.encrypt(msg);
}
exports.incoming  = function(msg, from) {
   return scripts.decrypt(msg, from);
}
