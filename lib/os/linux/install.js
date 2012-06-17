const command  = require("command");
const file     = require("file");
const os       = require("os");
const ui       = require("ui");

function find_sudo() {
   table = ["gksudo", "kdesudo"];
   for each (sudo in table)
      if (os.isInPath(sudo))
         return sudo;
   return null; // No one found
}

function find_command() {
   /* Package names are available on package lists :        => TODO: Check
    *  * Archlinux : gnupg with pacman
    *  * Debian : gnupg2 with apt-get or aptitude
    *     `-> Knoppix, LMDE, *buntu, Backtrack,...
    *  * Fedora : gnupg2 with yum
    *     `-> RHEL, CentOS, OEL, Mandriva, PCLinuxOS,...
    *  * Gentoo : gnupg with emerge
    *  * OpenSUSE : gpg2 with yast
    *     `-> SUSE Linux Enterprise
    */

   table = {
      "pacman"    : ["pacman",   "-S",      "gnupg"   ],
      "apt-get"   : ["apt-get",  "install", "gnupg2"  ],
      "aptitude"  : ["aptitude", "install", "gnupg2"  ],
      "yum"       : ["yum",      "install", "gnupg2"  ],
      "emerge"    : ["emerge",              "gnupg"   ],
      "yast"      : ["yast",     "-i",      "gpg2"    ],
   };
   for (pkgmgr in table) // pkgmgr = package manager
      if (os.isInPath(pkgmgr))
         return ["--"].concat(table[pkgmgr]);
   return null; // No one found
}

function install_as_root() {
   let sudo = find_sudo();
   let cmd  = find_command();
   if (sudo == null || cmd == null) {
      return false;
   }
   return command.run(sudo, cmd) == 0;
}

exports.install = function() {
   if (ui.should_install_as_root()) {
      if (!install_as_root()) {
         ui.install_as_root_failed();
         ui.install_by_yourself();
      }
   } else {
      ui.install_by_yourself();
   }
}
