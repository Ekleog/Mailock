/* Interface :
 *
 * Functions :
 *  * function install(data)        -> Installs GPG if required.
 *  *
 *  * function identity()           -> Returns a fingerprint of my key.
 *  * function knows(email)         -> Do I know the key of email ?
 *  * function handshake(o, ce, i)  -> Validate the key of other, using
 *  *                                  ce(emails) to check the email list is the
 *  *                                  right one.
 *  *
 *  * function outgoing(msg)        -> Signs (encrypts if possible) the outgoing
 *  *                                  message msg. Returns new plaintext (or
 *  *                                  ciphered message).
 *  * function incoming(msg, from)  -> Checks the signature (decrypts if
 *  *                                  possible) the incoming message msg,
 *  *                                  coming from mail address from.
 *
 * Structures :
 *  * Data      (data)  : { name, comment, email : Strings }
 *  * Info      (i)     : { trust, depth : Ints }
 *  * Person    (o)     : String (as returned by fingerprint)
 *  * Signature (sign)  : String (as returned by sign)
 *  * Message   (msg)   : {
 *       dests       : [String (e-mail addresses)],
 *       content     : String, // (HTML tags stripped)
 *       attachments : [TODO], // TODO: ATM no support
 *    }
 */

const os       = require("os");
const scripts  = os.loadScripts();

exports.install   = function(data)     { return scripts.install(data);        }

exports.identity  = function()         { return scripts.identity();           }
exports.handshake = function(o, ce, i) { return scripts.handshake(o, ce, i);  }
exports.knows     = function(email)    { return scripts.knows(email);         }

exports.outgoing  = function(msg) {
   for each (dest in msg.dests)
      if (!exports.knows(dest))
         return scripts.sign(msg);
   return scripts.encrypt(msg);
}
exports.incoming  = function(msg, from) {
   // TODO: Return a struct, identifying whether signature is valid, better than null in case of error
   return scripts.decrypt(msg, from);
}
