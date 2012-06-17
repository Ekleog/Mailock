const self      = require("self");
const traceback = require("traceback");
const utils     = require("utils");
const widget    = require("widget");
const winutils  = require("window-utils");

let icon = widget.Widget({
   id: "mailock-widget",
   label: "Mailock",
   contentURL: self.data.url("icon.png"),
});

function window() {
   return winutils.activeBrowserWindow;
}

function modal(html) {
   window().showModalDialog("data:text/html," + encodeURIComponent(html));
}

exports.unexpected = function() {
   let tb = traceback.get();
   tb.shift();
   let trace = traceback.format(tb);
   let rc = utils.rowcols(trace);
   let html = utils.format(self.data.load("unexpected.html"),
                           trace, rc.rows, rc.cols);
   modal(html);
   throw "Mailock : Unexpected failure";
}

exports.should_install_as_root = function() {
   return window().confirm("Should we install as root ?"); // TODO: Localize
}

exports.install_as_root_failed = function() {
   window().alert("Install as root failed !"); // TODO: Localize
}

exports.install_by_yourself = function() {
   window().alert("Please install GnuPG 2 by yourself, then click OK !"); // TODO: Localize
}
