'use strict';

var webpacker = require('./genWebpackConfig');
let ldr = { 
            test: /\.jsx?$/, 
            exclude: /node_modules/, 
            loader: 'babel', 
            query: { cacheDirectory: true, plugins: ['transform-runtime'], presets: ['es2015-node5', 'react', 'stage-0']} 
        };


var config = webpacker("./index.js", "./pseudoq_bndl.js", ldr, true);

module.exports = config;