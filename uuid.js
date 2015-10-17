'use strict';

var crypto = require('crypto');

var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/ ;

exports = module.exports = genUUID;
exports.valid = isUUID;

var _proc = function (rnd) {
    rnd[6] = (rnd[6] & 0x0f) | 0x40;
    rnd[8] = (rnd[8] & 0x3f) | 0x80;
    rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
    rnd.shift();
    return rnd.join('-');
}

function genUUID(callback) {
  if (typeof(callback) !== 'function') {
    return _proc(crypto.randomBytes(16));
  }
  crypto.randomBytes(16, function(err, rnd) {
    return _proc(rnd);
  });
}


function isUUID(uuid) {
  return uuidPattern.test(uuid);
}