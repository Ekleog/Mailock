const file        = require("file");
const os          = require("os");
const subprocess  = require("subprocess");

function find_sudo() {
   table = ["gksudo", "kdesudo"];
   for each (sudo in table)
      if (os.isInPath(sudo))
         return sudo;
   return null; // No one found
}

function find_command() {
   /* Package names are available on package lists :
    *  * Archlinux : gnupg with pacman                => TODO: Test
    *  * Debian : gnupg2 with apt-get or aptitude     => TODO: Test
    *     `-> Knoppix, LMDE, *buntu, Backtrack,...
    *  * Fedora : gnupg2 with yum                     => TODO: Test
    *     `-> RHEL, CentOS, OEL, Mandriva, PCLinuxOS,...
    *  * Gentoo : gnupg with emerge                   => TODO: Test
    *  * OpenSUSE : gpg2 with yast                    => TODO: Test
    *     `-> SUSE Linux Enterprise
    */

   table = {
      "pacman"    : ["pacman",      "-S",       "gnupg"],
      "apt-get"   : ["apt-get",     "install",  "gnupg2"],
      "aptitude"  : ["aptitude",    "install",  "gnupg2"],
      "yum"       : ["yum",         "install",  "gnupg2"],
      "emerge"    : ["emerge",                  "gnupg"],
      "yast"      : ["yast",        "-i",       "gpg2"],
   };
   for (pkgmgr in table) // pkgmgr = package manager
      if (os.isInPath(pkgmgr))
         return ["--"].concat(table[pkgmgr]);
   return null; // No one found
}

function install_by_himself() {
   // TODO: UI asking to choose by himself
}

function install_as_root(fail) {
   var sudo = find_sudo();
   var cmd  = find_command();
   if (sudo == null || cmd == null) {
      fail();
      return;
   }
   subprocess.call({
      command   : sudo,
      arguments : cmd,
   }).wait();
}

exports.install = function() {
   // TODO: UI choice install_as_root / install_by_himself
}
