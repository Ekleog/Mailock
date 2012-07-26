// TODO: Use GPGME
/* Interface :
 *
 * Functions : (TODO: Add key size to identity & handshake)
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
 *  *                                  ciphered) message.
 *  * function incoming(msg, from)  -> Checks the signature (decrypts if
 *  *                                  required) the incoming message msg,
 *  *                                  coming from mail address from. Returns
 *  *                                  a { msg: String, ok: String }
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
 *  * Out of incoming   : {
 *       msg: String (the message, optionally deciphered, without PGP stuff),
 *       ok: String (the signature checking answer)
 *          |-> "valid": Valid signature from valid key
 *          |-> "unknown": Valid signature from unknown user/key
 *          |-> "invalid": Invalid signature from known user
 *          `-> "none": No signature at all
 *    }
 */

const os       = require("os");
const scripts  = os.loadScripts();

exports.identity  = function()         { return identity();          }
exports.handshake = function(o, ce, i) { return handshake(o, ce, i); }
exports.knows     = function(email)    { return knows(email);        }

exports.outgoing  = function(msg) {
   for each (dest in msg.dests)
      if (!exports.knows(dest))
         return sign(msg);
   return encrypt(msg);
}
exports.incoming  = function(msg, from) {
   return decrypt(msg, from);
}
