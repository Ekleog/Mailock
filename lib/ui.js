exports.unexpected = function() {
   // TODO: Unexpected failure
}

exports.install_as_root = function() {
   // TODO: Ask if users prefers install-as-root or manual install
}

exports.install_as_root_failed = function() {
   // TODO: Advise the user install-as-root failed, will redirect to himself
}

exports.install_by_yourself = function() {
   // TODO: Indicate user to install by himself
}

exports.fingerprint_fail = function() {
   // TODO: Fingerprint check failed (handshake)
}

exports.get_trust_level = function() {
   // TODO: Ask for wanted trust level
   // Returns 0 for no trust, 1 for marginally, 2 for fully
}

exports.get_depth_level = function() {
   // TODO: Ask for wanted depth level
}

exports.require_password_for_new_key = function() {
   // TODO: Advise the user the password is required
}
