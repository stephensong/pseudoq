'use strict';

const path = require('path');
const webpack = require('webpack');
const gencfg = require('./genWebpackConfig');

import createDevMiddleware from 'webpack-dev-middleware';
import createHotMiddleware from 'webpack-hot-middleware';

function wpdev(compiler, options) {
  const mw = createDevMiddleware(compiler, options)

  return function * devMiddleware (next) {
    const ctx = this

    const ended = yield done => {
      mw(ctx.req, {
        end: content => {
          ctx.body = content

          done(null, true)
        },
        setHeader: ::ctx.set
      }, () => {
        done(null, false)
      })
    }

    if (!ended) {
      yield next
    }
  }
}


function wphot(compiler) {
  const mw = createHotMiddleware(compiler, {log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000} )

  return function * hotMiddleware (next) {
    const {req, res} = this

    yield done => {
      mw(req, res, () => {
        done(null)
      })
    }

    yield next
  }
}

function hmr(app) {

    var entry = ['webpack-hot-middleware/client','./index.js'];
    const hmrPlugin = ["react-transform", {
          "transforms": [{
            "transform": "react-transform-hmr",
            "imports": ["react"],
            // this is important for Webpack HMR:
            "locals": ["module"]
          }]
          // note: you can put more transforms into array
          // this is just one of them!
        }];

    const ldr = { 
        test: /\.jsx?$/, 
        exclude: /node_modules/, 
        loader: 'babel', 
        query: { cacheDirectory: true, plugins: [hmrPlugin], presets: ['es2015', 'react', 'stage-0', 'react-hmre' ]} 
    };

    var config = gencfg( entry, "./pseudoq_bndl.js", ldr, true);

    config.plugins = [ new webpack.HotModuleReplacementPlugin()
                     //, new webpack.NoErrorsPlugin()
                     ]
    
    let compiler = webpack(config);

    app.use(wpdev(compiler, {noInfo: true, publicPath: '/' }));
    app.use(wphot(compiler));

    console.log('React Hot Loader installed');

}

function hmr_backend(app) {

    var entry  = [
        'webpack/hot/signal.js',
        './serverIndex.js'
      ];

    var ldr = { 
        test: /\.jsx?$/, 
        exclude: /node_modules/, 
        loader: 'babel', 
        query: { cacheDirectory: true, presets: ['es2015', 'stage-0' ]} } ;
    
    var config = gencfg( entry, "./server.js", ldr, false);

    config.recordsPath = path.join(__dirname, 'build/_records');

    config.plugins = [ new webpack.HotModuleReplacementPlugin()
                     , new webpack.IgnorePlugin(/\.(css|less)$/),
                     , new webpack.BannerPlugin('require("source-map-support").install();', { raw: true, entryOnly: false }),
                     ]
    
    config.devtool = 'source-map';

    let compiler = webpack(config);

    app.use(wpdev(compiler, {noInfo: true, publicPath: '/' }));
    app.use(wphot(compiler));

    console.log('Backend Hot Loader installed');

}

module.exports = {hmr, hmr_backend};

