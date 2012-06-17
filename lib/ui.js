const self     = require("self");
const utils    = require("window-utils");
const widget   = require("widget");

let icon = widget.Widget({
   id: "mailock-widget",
   label: "Mailock",
   contentURL: self.data.url("icon.png"),
});

function modal(url) {
   utils.activeBrowserWindow.showModalDialog(url);
}

exports.unexpected = function() {
   modal("data:text/html,Hello Window !"); // TODO: Customize, trace, etc.
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
