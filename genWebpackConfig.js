

var webpack = require('webpack');
var path = require('path');

var configurator = function (entry,output) {
    console.log("entry " + entry);
    console.log("output " + output);
    var config = {
        entry: entry,
        cache: true,
        output: {filename: output
                ,path: __dirname 
                },
        module: {
            loaders: [   {test: /\.css$/, loader: "style!css-loader" }
                        ,{ test: /\.woff$/, loader: "url-loader" }
                        ,{ test: /\.ttf$/, loader: "url-loader" }
                        ,{ test: /\.svg$/, loader: "url-loader" }
                        ,{ test: /\.eot$/, loader: "url-loader" }
                        ,{ test: /\.png$/, loader: "url-loader" }
                        ,{ test: /\.json$/, loader: 'json-loader' }
                        ,{ test: require.resolve("react"), loader: "expose?React" }     
                        ,{ test: /\.js$/, exclude: /node_modules/, loader: 'babel', query: {stage: 0} }  
                        ,{ test: /\.jsx$/, loader: 'babel', query: {stage: 0} }  
                        //,{ test: /\.jsx$/, loader: 'babel-loader?optional=runtime' }   // jsx must be last!!!
            ]
        },
        resolve: {
            root: path.resolve(__dirname, '.')
            ,extensions: ['', '.js', '.jsx']
        },
        plugins: [
            new webpack.optimize.OccurenceOrderPlugin()
        ],
    };

    if(process.env.NODE_ENV === 'production') {
        console.log("production mode build");
        config.plugins = [
            new webpack.DefinePlugin({
              "process.env": {
                NODE_ENV: JSON.stringify("production")
              }
            }),
            //new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin(),
        ];
    }
    else {

        config.devtool = 'sourcemap';
        config.debug = true;
    }
    return config;
};

module.exports = configurator;