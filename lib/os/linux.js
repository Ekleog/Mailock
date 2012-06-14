const os          = require("os");
const prefs       = require("prefs");
const subprocess  = require("subprocess");

exports.install = function(name, comment, email) {
   if (!name)     name = "";
   if (!comment)  comment = "";
   if (!email)    email = "";

   // Install GPG
   if (!os.isInPath("gpg2")) {
      require("os/linux/install").install();
   }

   // Generate key
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--batch", "--no-tty", "--gen-key"],
      stdin     : subprocess.WritablePipe(function() {
         this.write(
            "Key-Type: default\n" +
            "Subkey-Type: default\n" +
            "Name-Real: " + name + "\n" +
            "Name-Comment: " + comment + "\n" +
            "Name-Email: " + email + "\n" +
            "Expire-Date: 0\n" +
            "%ask-passphrase\n" +
            "%commit\n"
         );
      })
   }).wait();
   prefs.set("email", email);

   // TODO: Generate revocation certificate (and store it somewhere ?)

   // Grep key ID
   var kid = "";
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--list-keys"],
      stdout    : subprocess.ReadablePipe(function(data) {
         var kids = data.match(/\/([A-Z0-9]{8})/);
         if (kids.length != 2)
            {} // TODO: Fail
         kid = kids[1];
      })
   }).wait();

   // Send it to the keyserver
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--send-key", kid],
   }).wait();
}

exports.fingerprint = function() {
   var ret = ""
   subprocess.call({
      command     : os.inPath("gpg2"),
      arguments   : ["--fingerprint", prefs.get("email")],
      environment : ["LANG=C"],
      stdout      : subprocess.ReadablePipe(function(data) {
         var fpr = data.match(/fingerprint = ([A-Z0-9 ])/);
         if (fpr.length != 2)
            {}// TODO: Fail
         ret = fpr[1].replace(/ /g, "");
         if (ret.length != 40)
            {}// TODO: Fail
      })
   }).wait();
   return ret;
}

exports.handshake = function(other) {
   // TODO
}

exports.sign = function(other) {
   // TODO
}

exports.check = function(other) {
   // TODO
}

exports.encrypt = function(other) {
   // TODO
}

exports.decrypt = function(other) {
   // TODO
}
