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

   // TODO: Generate revocation certificate (and store it somewhere ?)
}

exports.fingerprint = function() {
   // TODO
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
