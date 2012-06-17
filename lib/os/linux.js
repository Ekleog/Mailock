const command     = require("command");
const file        = require("file");
const mktemp      = require("mktemp").mktemp;
const os          = require("os");
const parse       = require("os/linux/parse");
const pgp_utils   = require("pgp-utils");
const prefs       = require("prefs");
const ui          = require("ui");
const utils       = require("utils");

function escape_quote(str) {
   return str.replace(/\\/g, "\\\\")
             .replace(/"/g, "\\\"");
}

function run(args, stdin) {
   if (!stdin) stdin = "";
   // Sanitize input
   stdin = escape_quote(stdin);
   for (i in args)
      args[i] = escape_quote(args[i]);
   // Build shell command
   let stdout = mktemp(), stderr = mktemp();
   let cmd = "echo -n \"" + stdin + " \" | " +
             "LANG=C gpg2 \"" + args.join("\" \"") + "\" " +
             "--keyserver " + pgp_utils.random_keyserver() + " " +
             "> " + stdout + " 2> " + stderr;
   // Run command, retrieve output
   command.run(os.inPath("bash"), ["-c", cmd]);
   let ret = { out: file.read(stdout), err: file.read(stderr) };
   // Cleanup & return
   file.remove(stdout); file.remove(stderr);
   return ret;
}

function fingerprint(ident) {
   return parse.fingerprint(run(["--fingerprint", ident]).out);
}

exports.install = function(data) {
   // Install GPG
   if (!os.isInPath("gpg2")) {
      require("os/linux/install").install();
   }
   // Just assume bash & echo are installed

   // Generate key
   // TODO: Do not generate a key if already present
   prefs.set("email", data.email);
   run(["--batch", "--gen-key"], parse.gen_key(data));

   // TODO: Generate revocation certificate (and store it somewhere ?)
   // TODO: Prepare for synchronization

   // Send key to the keyserver
   run(["--send-key", pgp_utils.keyid(exports.identity())]);
}

exports.identity = function() {
   return fingerprint(prefs.get("email"));
}

exports.handshake = function(other, check_emails, info) {
   // Load other's key
   run(["--recv-key", pgp_utils.keyid(other)]);

   // Check fingerprint
   if (fingerprint(other) != other)
      return "fingerprint_fail";

   // Retrieve e-mail addresses
   let emails = parse.find_emails(
         run(["--list-sigs", pgp_utils.keyid(other)])
            .out);

   // Check e-mail addresses
   if (!check_emails(emails))
      return "check_email_addresses_fail";

   // Build command
   let cmd = "";
   if (info.trust > 0) {
      cmd = "tsign\ny\n" + info.trust + "\n" + info.depth + "\n\ny\nquit\ny\n";
   } else {
      cmd = "sign\ny\ny\nquit\ny\n";
   }

   // Run command
   run(["--command-fd=0", "--edit-key", pgp_utils.keyid(other)], cmd);

   // Upload signed key to keyserver
   run(["--send-key", pgp_utils.keyid(other)]);
}

exports.knows = function(other) {
   let emails = parse.find_emails(run(["--list-keys", other]).out);
   return emails.indexOf(other) != -1;
}

exports.sign = function(msg) {
   return run(["--batch", "--armor", "--clearsign"], msg.content).out;
}

exports.encrypt = function(msg) {
   // Build arguments
   let args = ["--batch", "--armor",
               "--sign", "--encrypt",
               "--recipient", prefs.get("email")];
   for each (dest in msg.dests) {
      args = args.concat(["--recipient", dest])
   }
   // Run
   return run(args, msg.content).out;
}

exports.decrypt = function(msg, from) {
   let ret = run(["--batch", "--decrypt"], msg.content);
   if (parse.check_signature(ret.err)) return ret.out;
   else                                return null;
}
