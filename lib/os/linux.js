const mktemp      = require("mktemp").mktemp;
const os          = require("os");
const prefs       = require("prefs");
const subprocess  = require("subprocess");

// TODO: Include keyserver management

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
      arguments : ["--batch", "--gen-key"],
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
   var kid = exports.keyid();

   // Send it to the keyserver
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--send-key", kid],
   }).wait();
}

exports.keyid = function() {
   var kid = "";
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--list-keys", prefs.get("email")],
      stdout    : subprocess.ReadablePipe(function(data) {
         var kids = data.match(/\/([A-Z0-9]{8})/);
         if (kids.length != 2)
            {} // TODO: Fail
         kid = kids[1];
      })
   }).wait();
   return kid;
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
   // Load other's key
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--recv-key", other.keyid],
   }).wait();

   // Load fingerprint
   fpr = ""
   subprocess.call({
      command     : os.inPath("gpg2"),
      arguments   : ["--fingerprint", other.keyid],
      environment : ["LANG=C"],
      stdout      : subprocess.ReadablePipe(function(data) {
         var match = data.match(/fingerprint = ([A-Z0-9 ])/);
         if (match.length != 2)
            {}// TODO: Fail
         fpr = match[1].replace(/ /g, "");
         if (fpr.length != 40)
            {}// TODO: Fail
      })
   }).wait();

   // Check fingerprint
   if (fpr != other.fingerprint) {
      // TODO: Fail
   }

   // Sign key
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--edit-key", other.keyid],
      stdin     : subprocess.WritablePipe(function(data) {
         this.write(
            "tsign\n" +
            "y\n" +
            "1\n" + // Marginally - TODO: Ask for trust level (if none then sign/y/y instead of tsign/y/1/1//y
            "1\n" + // Depth of signing - TODO: Ask user
            "\n" +
            "y\n" + // TODO: pinentry will pop. Indicate to the user
            "quit\n" +
            "y\n"
         );
      })
   }).wait();
}

exports.sign = function(msg) {
   var ret = "";
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--batch", "--armor", "--detach-sign"],
      stdin     : subprocess.WritablePipe(function() {
         this.write(msg);
      }),
      stdout    : subprocess.ReadablePipe(function(data) {
         ret = data;
      }),
   }).wait();
   return ret;
}

exports.check = function(msg, from, sign) {
   temp = mktemp("signature");
   file.open(temp, "w")
       .write(sign)
       .close();
   ret = false;
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--verify", temp, "-"],
      stdin     : subprocess.WritablePipe(function() {
         this.write(msg);
      }),
      stdout    : subprocess.ReadablePipe(function(data) {
         match = data.match(/Good signature from ".*<(.*)>"/);
         if (match && match.length != 2) return;
         email = match[1];
         if (email != from) return;
         ret = true;
      }),
   }).wait();
   file.remove(temp);
   return ret;
}

exports.encrypt = function(other) {
   // TODO
}

exports.decrypt = function(other) {
   // TODO
}
