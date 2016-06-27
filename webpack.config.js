'use strict';


//---------//
// Imports //
//---------//

var nodeExternals = require('webpack-node-externals')
  , path = require('path')
  ;


//------//
// Init //
//------//

var exclude = /node_modules/
  , test = /\.js$/
  , wmodule = {
    loaders: [
      {
        test: test
        , exclude: exclude
        , loader: 'babel'
        , query: { presets: ['babel-preset-es2015'] }
      }, {
        test: /package\.json$/
        , exclude: exclude
        , loader: 'json'
      }
    ]
  }
  ;


//------//
// Main //
//------//

var res = [
  {
    entry: './lib/index.js'
    , target: 'node'
    , externals: [nodeExternals()]
    , output: {
      path: __dirname
      , filename: 'es5.js'
      , pathinfo: true
      , libraryTarget: 'commonjs2'
    }
    , module: wmodule
  }, {
    entry: './tests/es6.js'
    , target: 'node'
    , externals: [nodeExternals(), '../es5', '../es6']
    , output: {
      path: path.join(__dirname, 'tests')
      , filename: 'es5.js'
      , pathinfo: true
      , libraryTarget: 'commonjs2'
    }
    , module: wmodule
  }
];



//---------//
// Exports //
//---------//

module.exports = res;
