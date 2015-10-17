var webpacker = require('./genWebpackConfig');
var config = webpacker("./index.js", "./pseudoq_bndl.js");

module.exports = config;