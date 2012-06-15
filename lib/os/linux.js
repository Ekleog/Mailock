const mktemp      = require("mktemp").mktemp;
const os          = require("os");
const parse       = require("os/linux/parse");
const pgp_utils   = require("pgp-utils");
const prefs       = require("prefs");
const subprocess  = require("subprocess");
const ui          = require("ui");
const utils       = require("utils");

function fingerprint(ident) {
   var ret = { val: "" };
   subprocess.call({
      command     : os.inPath("gpg2"),
      arguments   : ["--fingerprint", ident],
      environment : ["LANG=C"],
      stdout      : parse.fingerprint(ret),
   }).wait();
   return ret.val;
}

function writer(msg) {
   return subprocess.WritablePipe(function() {
      this.write(msg);
   });
}

function reader(ret) {
   return subprocess.ReadablePipe(function(data) {
      ret.val = data;
   });
}

function check_reader(ret, from) {
   return subprocess.ReadablePipe(function(data) {
      ret.val = parse.check_signature(data, from);
   });
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
      stdin     : writer(parse.gen_key),
   }).wait();
   prefs.set("email", email);

   // TODO: Generate revocation certificate (and store it somewhere ?)

   // Send key to the keyserver
   var kid = pgp_utils.keyid(exports.identity());
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
      arguments : ["--recv-key", pgp_utils.keyid(other)],
   }).wait();

   // Check fingerprint
   if (fingerprint(other) != other) {
      ui.fingerprint_fail();
      return;
   }

   // Retrieve e-mail addresses
   var emails = { val: [] };
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--list-sigs", pgp_utils.keyid(other)],
      stdout    : parse.find_emails(emails),
   }).wait();

   // Check e-mail addresses
   if (!ui.check_email_addresses(emails.val)) {
      ui.check_email_addresses_fail();
      return;
   }

   // Build command
   var trust = ui.get_trust_level();
   var cmd = "";
   if (trust > 0) {
      var depth = ui.get_depth_level();
      cmd = "tsign\ny\n" + trust + "\n" + depth + "\n\ny\nquit\ny\n";
   } else {
      cmd = "sign\ny\ny\nquit\ny\n";
   }

   // Run command
   ui.require_password_for_new_key();
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--edit-key", pgp_utils.keyid(other)],
      stdin     : writer(cmd),
   }).wait();
}

exports.sign = function(msg) {
   var ret = { val: "" };
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--batch", "--armor", "--detach-sign"],
      stdin     : writer(msg),
      stdout    : reader(ret),
   }).wait();
   return ret.val;
}

exports.check = function(msg, from, sign) {
   var temp = mktemp("signature");
   file.open(temp, "w")
       .write(sign)
       .close();
   var ret = { val: false };
   subprocess.call({
      command     : os.inPath("gpg2"),
      arguments   : ["--verify", temp, "-"],
      environment : ["LANG=C"],
      stdin       : writer(msg),
      stderr      : check_reader(ret, from),
   }).wait();
   file.remove(temp);
   return ret.val;
}

exports.encrypt = function(msg) {
   // Build arguments
   var args = ["--batch", "--armor",
               "--sign", "--encrypt",
               "--recipient", prefs.get("email")];
   for each (dest in msg.dests) {
      args = args.concat(["--recipient", dest])
   }
   // Call gpg2
   var ret = { val: "" };
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : args,
      stdin     : writer(msg.content),
      stdout    : reader(ret),
   }).wait();
   // And return
   return ret.val;
}

exports.decrypt = function(msg, from) {
   var ret = { val: "" };
   var signed = { val: false };
   subprocess.call({
      command   : os.inPath("gpg2"),
      arguments : ["--batch", "--decrypt"],
      stdin     : writer(msg),
      stdout    : reader(ret),
      stderr    : check_reader(signed, from),
   }).wait();
   if (!signed.val) return null;
   else             return ret;
}
