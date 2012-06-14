const mktemp      = require("mktemp").mktemp;
const os          = require("os");
const prefs       = require("prefs");
const subprocess  = require("subprocess");
const ui          = require("ui");
const utils       = require("pgp-utils");

function fingerprint(ident) {
   var ret = ""
   subprocess.call({
      command     : os.inPath("gpg2"),
      arguments   : ["--fingerprint", ident],
      environment : ["LANG=C"],
      stdout      : subprocess.ReadablePipe(function(data) {
         var fpr = data.match(/fingerprint = ([A-Z0-9 ])/);
         if (fpr.length != 2) ui.unexpected();
         ret = fpr[1].replace(/ /g, "");
         if (ret.length != 40) ui.unexpected();
      })
   }).wait();
   return ret;
}

function check_signature(data, from) {
   match = data.match(/Good signature from ".*<(.*)>"/);
   if (match && match.length != 2) return false;
   email = match[1];
   if (email != from) return false;
   else               return true;
}

// TODO: Include keyserver management

exports.install = function(name, comment, email) {
   // Manage default parameters
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

   // Send key to the keyserver
   var kid = utils.keyid(exports.identity());
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--send-key", kid],
   }).wait();
}

exports.identity = function() {
   return fingerprint(prefs.get("email"));
}

exports.handshake = function(other) {
   // Load other's key
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--recv-key", utils.keyid(other)],
   }).wait();

   // Check fingerprint
   if (fingerprint(other) != other) {
      ui.fingerprint_fail();
      return;
   }

   // Build command
   var trust = ui.get_trust_level();
   var cmd = "";
   if (trust > 0) {
      var depth = ui.get_depth_level();
      cmd =
         "tsign\n" +
            "y\n" +
            trust + "\n" +
            depth + "\n" +
            "\n" +
            "y\n" +
         "quit\n" +
            "y\n";
   } else {
      cmd =
         "sign\n" +
            "y\n" +
            "y\n" +
         "quit\n" +
            "y\n";
   }

   // Run command
   ui.require_password_for_new_key();
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--edit-key", utils.keyid(other)],
      stdin     : subprocess.WritablePipe(function(data) {
         this.write(cmd);
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
      command     : os.inPath("gpg2"),
      arguments   : ["--verify", temp, "-"],
      environment : ["LANG=C"],
      stdin       : subprocess.WritablePipe(function() {
         this.write(msg);
      }),
      stderr      : subprocess.ReadablePipe(function(data) {
         ret = check_signature(data, from);
      }),
   }).wait();
   file.remove(temp);
   return ret;
}

exports.encrypt = function(msg) {
   // Build arguments
   args = ["--batch", "--armor",
           "--sign", "--encrypt",
           "--recipient", prefs.get("email")];
   for each (dest in msg.dests) {
      args = args.concat(["--recipient", dest])
   }
   // Call gpg2
   var ret = "";
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : args,
      stdin     : subprocess.WritablePipe(function() {
         this.write(msg.content);
      }),
      stdout    : subprocess.ReadablePipe(function(data) {
         ret = data;
      }),
   }).wait();
   // And return
   return ret;
}

exports.decrypt = function(msg, from) {
   var ret = "";
   var signed = false;
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--batch", "--decrypt"],
      stdin     : subprocess.WritablePipe(function() {
         this.write(msg);
      }),
      stdout    : subprocess.ReadablePipe(function(data) {
         ret = data;
      }),
      stderr    : subprocess.ReadablePipe(function(data) {
         signed = check_signature(data, from);
      }),
   }).wait();
   if (!signed) return null;
   else         return ret;
}
