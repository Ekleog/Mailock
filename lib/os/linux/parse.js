const utils = require("utils");

exports.fingerprint = function(data) {
   var fpr = data.match(/fingerprint = ([A-Z0-9 ])/);
   if (!fpr || fpr.length != 2) ui.unexpected();
   var ret = fpr[1].replace(/ /g, "");
   if (ret.length != 40) ui.unexpected();
   return ret;
}

exports.check_signature = function(data, from) {
   var match = data.match(/Good signature from ".*<(.*)>"/);
   if (!match || match.length != 2) return false;
   var email = match[1];
   if (email != from) return false;
   else               return true;
}

exports.gen_key = function(name, comment, email) {
   return
      "Key-Type: default\n" +
      "Subkey-Type: default\n" +
      "Name-Real: " + name + "\n" +
      "Name-Comment: " + comment + "\n" +
      "Name-Email: " + email + "\n" +
      "Expire-Date: 0\n" +
      "%ask-passphrase\n" +
      "%commit\n";
}

exports.find_emails = function(data) {
   var ret = []
   var match = data.match(/<([^>]*)>/g);
   for each (mail in utils.unique(match)) {
      ret.push(mail.substr(1, mail.length - 2))
   }
   return ret;
}
