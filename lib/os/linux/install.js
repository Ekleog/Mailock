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

function download_command(pkg) {
   // TODO: Download gnupg package to file pkg
}

function install_command(pkg, dir) {
   // TODO: install gnupg package (file pkg) to directory dir
}

function install_by_himself() {
   // TODO
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

function install_as_user(fail) {
   // e.g. dpkg --root=some_user_dir
   var pkg   = /* TODO: Choose a file path for installing a package */;
   var dir   = /* TODO: Choose an installation directory */;
   var dl    = download_command(pkg);
   var inst  = install_command(pkg, dir);
   subprocess.call({
      command   : dl.cmd,
      arguments : dl.args,
   }).wait();
   subprocess.call({
      command   : inst.cmd,
      arguments : inst.args,
   }).wait();
}

exports.install = function() {
   // TODO
}
