"use strict";

/**
 * Module dependencies.
 */

var resolve = require('path').resolve;
var assert = require('assert');
var debug = require('debug')('koa-static');
import send from './koa-send.js';

/**
 * Serve static files from `root`.
 *
 * @param {String} root
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */

export default function serve(root, opts = {}) {

  assert(root, 'root directory is required to serve files');

  // options
  debug('static "%s" %j', root, opts);
  opts.root = resolve(root);
  opts.index = opts.index || 'index.html';

  if (!opts.defer) {
    return function *serve(next){
      if (this.method == 'HEAD' || this.method == 'GET') {
        console.log('static serving : '+this.path);
        if (yield send(this, this.path, opts)) return;
      }
      yield* next;
    };
  }

  return function *serve(next){
    yield* next;
    if (this.method != 'HEAD' && this.method != 'GET') return;
    // response is already handled
    if (this.body != null || this.status != 404) return;
    //console.log('static serving : '+this.path);
    yield send(this, this.path, opts);
  };
}
