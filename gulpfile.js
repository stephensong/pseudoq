"use strict";

const gulp = require("gulp");
const webpack = require('webpack');
const gulpwebpack = require('gulp-webpack');
const gencfg = require('./genWebpackConfig');
const manifest = require('gulp-manifest');
const babel = require("gulp-babel");

const ldr = { 
            test: /\.jsx?$/, 
            exclude: /node_modules/, 
            loader: 'babel', 
            query: { cacheDirectory: true, presets: ['es2015', 'react', 'stage-0']} 
        };


gulp.task("buildServer", function() {

    let cfg = gencfg("./coldserver.js", "./server.js", ldr, false);
    gulp.src('./coldserver.js')
        .pipe(gulpwebpack(cfg), webpack)
        .pipe(gulp.dest('./'));
});

gulp.task("release", function() {
    var plugins = [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV" : JSON.stringify("production")
            }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ];

    var cfgbe = gencfg("./coldserver.js", "./server.js", ldr, false);
    cfgbe.plugins = plugins;
    cfgbe.debug = false;

    gulp.src('./coldserver.js')
        .pipe(gulpwebpack(cfgbe), webpack)
        .pipe(gulp.dest('/media/sf_psq-site/'));
    

    //gulp.src(['server.js','oxidate.js','timespan.js','pgsql.js', 'auth.js', 'jwt.js','utils.js','uuid.js'])
    //    .pipe(babel({presets: ['es2015-node5', 'stage-0']}))
    //    .pipe(gulp.dest('/media/sf_psq-site'));

    var cfg = gencfg("./index.js", "./pseudoq_bndl.js", ldr, true);
    cfg.plugins = plugins;

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