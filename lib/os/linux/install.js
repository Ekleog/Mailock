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

function install_by_himself() {
   ui.install_by_yourself();
}

function install_as_root(fail) {
   var sudo = find_sudo();
   var cmd  = find_command();
   if (sudo == null || cmd == null) {
      fail();
      return;
   }
   command.run(sudo, cmd);
}

exports.install = function() {
   if (ui.should_install_as_root()) {
      install_as_root(function() {
         ui.install_as_root_failed();
         install_by_himself();
      });
   } else {
      install_by_himself();
   }
}
