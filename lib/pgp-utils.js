exports.keyid = function(fingerprint) {
   return fingerprint.substr(32, 8);
}
