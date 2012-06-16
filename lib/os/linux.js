const command     = require("command");
const mktemp      = require("mktemp").mktemp;
const os          = require("os");
const parse       = require("os/linux/parse");
const pgp_utils   = require("pgp-utils");
const prefs       = require("prefs");
const ui          = require("ui");
const utils       = require("utils");

function escape_quote(str) {
   str.replace(/\\/g, "\\\\");
   str.replace(/'/g, "\\'");
   return str;
}

function run(args, stdin) {
   if (!stdin) stdin = "";
   // Sanitize input
   stdin = escape_quote(stdin);
   for (i in args)
      args[i] = escape_quote(args[i]);
   // Build shell command
   var stdout = mktemp(), stderr = mktemp();
   var cmd = "echo -n '" + stdin + "' | " +
             "LANG=C gpg2 '" + args.join("' '") + "' " +
             "> " + stdout + " 2> " + stderr;
   // Run command, retrieve output
   command.run(os.inPath("bash"), ["-c", cmd]);
   var ret = { out: file.read(stdout), err: file.read(stderr) };
   // Cleanup & return
   file.remove(stdout); file.remove(stderr);
   return ret;
}

function fingerprint(ident) {
   return parse.fingerprint(run(["--fingerprint", ident]).out);
}

// TODO: Include keyserver management

exports.install = function(name, comment, email) {
   // Install GPG
   if (!os.isInPath("gpg2")) {
      require("os/linux/install").install();
   }
   // Just assume bash & echo are installed

   // Generate key
   // TODO: Do not generate a key if already present
   run(["--batch", "--gen-key"], parse.gen_key(name, comment, email));
   prefs.set("email", email);

   // TODO: Generate revocation certificate (and store it somewhere ?)
   // TODO: Prepare for synchronization

   // Send key to the keyserver
   var kid = pgp_utils.keyid(exports.identity());
   run(["--send-key", kid]);
}

exports.identity = function() {
   return fingerprint(prefs.get("email"));
}

exports.handshake = function(other) {
   // Load other's key
   run(["--recv-key", pgp_utils.keyid(other)]);

   // Check fingerprint
   if (fingerprint(other) != other) {
      ui.fingerprint_fail();
      return;
   }

   // Retrieve e-mail addresses
   var emails = parse.find_emails(
         run(["--list-sigs", pgp_utils.keyid(other)])
            .out);

   // Check e-mail addresses
   if (!ui.check_email_addresses(emails)) {
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
   run(["--edit-key", pgp_utils.keyid(other)], cmd);

   // TODO: Upload signed key to keyserver
}

exports.knows = function(other) {
   var emails = parse.find_emails(run(["--list-keys", other]).out);
   return emails.indexOf(other) != -1;
}

exports.sign = function(msg) {
   return run(["--batch", "--armor", "--clearsign"], msg).out;
}

exports.encrypt = function(msg) {
   // Build arguments
   var args = ["--batch", "--armor",
               "--sign", "--encrypt",
               "--recipient", prefs.get("email")];
   for each (dest in msg.dests) {
      args = args.concat(["--recipient", dest])
   }
   // Run
   return run(args, msg.content).out;
}

exports.decrypt = function(msg, from) {
   var ret = run(["--batch", "--decrypt"], msg.content);
   if (parse.check_signature(ret.err)) return ret.out;
   else                                return null;
}
