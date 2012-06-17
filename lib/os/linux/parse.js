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
   let match = data.match(/<([^>]*)>/g);
   let unmatch = data.match(/WARNING|BAD/);
   if (!match || (unmatch && unmatch.length > 0))
      return false;
   for each (m in match)
      if (m.substr(1, m.length - 2) == from)
         return true;
   return false;
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
