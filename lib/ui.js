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

function modal(url) {
   winutils.activeBrowserWindow
           .showModalDialog(
               "data:text/html," +
               encodeURIComponent(url)
            );
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
   // TODO: Ask if users prefers install-as-root or manual install
}

exports.install_as_root_failed = function() {
   // TODO: Advise the user install-as-root failed, will redirect to himself
}

exports.install_by_yourself = function() {
   // TODO: Indicate user to install by himself
}
