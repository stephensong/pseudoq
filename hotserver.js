var path = require('path');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var gencfg = require('./genWebpackConfig');

var entry = {app: ['webpack-dev-server/client?http://localhost:3000' 
                  ,'webpack/hot/only-dev-server'
                  ,'./index.js'
                  ]};

var config = gencfg( entry, "./pseudoq_bndl.js");

var ldrs = config.module.loaders;  // should check it tests for jsx!!
ldrs[ldrs.length -1] = { test: /\.jsx$/
                       , loaders: ['react-hot', 'babel-loader?experimental'] 
                       };

[
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
].forEach(function (p) { config.plugins.push(p); });

config.devtool = 'eval';

console.log(JSON.stringify(config));

new WebpackDevServer(webpack(config), {
  publicPath: '/',
  hot: true,
  historyApiFallback: false,
  proxy: {
    "*": 'http://localhost:8080'
  }
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log('Hot Loader listening at localhost:3000');
});

