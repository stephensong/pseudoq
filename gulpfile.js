var gulp = require("gulp");
var webpack = require('webpack');
var gulpwebpack = require('gulp-webpack');
var gencfg = require('./genWebpackConfig');
var manifest = require('gulp-manifest');

gulp.task("release", function() {

    gulp.src(['server.js','oxidate.js','timespan.js','pgsql.js', 'auth.js', 'jwt.js','utils.js','uuid.js'])
        .pipe(gulp.dest('/media/sf_psq-site'));

    var cfg = gencfg("./index.js", "./pseudoq_bndl.js");
    cfg.plugins = cfg.plugins.concat(
        new webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    );
    gulp.src('./index.js')
        .pipe(gulpwebpack(cfg), webpack)
        .pipe(gulp.dest('/media/sf_psq-site/'));

    gulp.src(['./index.html','./favicon.ico','./pseudoq_bndl.js'])
        .pipe(manifest({
          preferOnline: false,
          timestamp: true,
          network: ['*'],
          filename: 'pseudoq.manifest'
        }))
        .pipe(gulp.dest('/media/sf_psq-site/'));
});