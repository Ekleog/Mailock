const ui    = require("ui");
const utils = require("utils");

exports.fingerprint = function(data) {
   let fpr = data.match(/fingerprint = ([A-Z0-9 ]+)/);
   if (!fpr || fpr.length != 2) ui.unexpected();
   let ret = fpr[1].replace(/ /g, "");
   if (ret.length != 40) ui.unexpected();
   return ret;
}

exports.check_signature = function(data, from) {
   function match(f) {
      if (res.find(f) == -1)
         return false;
      for each (m in data.match(/<([^>]*)>/g))
         if (m.substr(1, m.length - 2) == from)
            return true;
      return false;
   }
   if (TODO)
      return "none";
   if (match("Good signature"))
      return "valid";
   if (match("No public key"))
      return "unknown";
   if (match("BAD signature"))
      return "invalid";
   ui.unexpected();
}

exports.gen_key = function(data) {
   if (data.name)    data.name    = "Name-Real: "    + data.name    + "\n";
   if (data.comment) data.comment = "Name-Comment: " + data.comment + "\n";
   if (data.email)   data.email   = "Name-Email: "   + data.email   + "\n";
   return "" +
      "Key-Type: default\n" +
      "Subkey-Type: default\n" +
      data.name +
      data.comment +
      data.email +
      "Expire-Date: 0\n" +
      "%ask-passphrase\n" +
      "%commit\n";
}

exports.find_emails = function(data) {
   let ret = []
   let match = data.match(/<([^>]*)>/g);
   if (match)
      for each (mail in utils.unique(match))
         ret.push(mail.substr(1, mail.length - 2))
   return ret;
}
