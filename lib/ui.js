const self      = require("self");
const traceback = require("traceback");
const utils     = require("utils");
const widget    = require("widget");
const winutils  = require("window-utils");
const _         = require("l10n").get;

const locale = require("preferences-service").get("general.useragent.locale");

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

function loaddata(file) {
   return self.data.load(locale + "/" + file);
}

exports.unexpected = function() {
   let tb = traceback.get();
   tb.shift();
   let trace = traceback.format(tb);
   let rc = utils.rowcols(trace);
   let html = utils.format(loaddata("unexpected.html"),
                           trace, rc.rows, rc.cols);
   modal(html);
   throw "Mailock : Unexpected failure";
}

exports.should_install_as_root = function() {
   return window().confirm(_("should_install_as_root"));
}

exports.install_as_root_failed = function() {
   window().alert(_("install_as_root_failed"));
}

exports.install_by_yourself = function() {
   window().alert(_("install_gpg2_yourself"));
}
