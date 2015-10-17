var assert   = require('assert');
var thunkify = require('thunkify');
var _JWT      = require('jsonwebtoken');

// Make verify function play nice with co/koa
var JWT = {decode: _JWT.decode, sign: _JWT.sign, verify: thunkify(_JWT.verify)};

module.exports = function(opts) {
  opts = opts || {};
  opts.key = opts.key || 'user';

  assert(opts.secret, '"secret" option is required');

  return function *jwt(next) {
    var token, msg, user, parts, scheme, credentials, ignoreExp;

    if (opts.cookie) {
        token = this.cookies.get(opts.cookie);
        if (!token && !opts.passthrough) this.throw(401, "Missing cookie");
    } else if(this.header.authorization) {
      parts = this.header.authorization.split(' ');
      if (parts.length == 2) {
        scheme = parts[0];
        credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else this.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"\n');
        
    } else this.throw(401, 'No Authorization header found\n');
    
    try {
      user = yield JWT.verify(token, opts.secret, opts);
    } catch(e) {
      msg = 'Invalid token : ' + e.message;
    }

    if (user || opts.passthrough) {
      this[opts.key] = user;
      yield next;
    } else {
      this.throw(401, msg);
    }
  };
};

// Export JWT methods as a convenience
module.exports.sign   = JWT.sign;
module.exports.verify = JWT.verify;
module.exports.decode = JWT.decode;
