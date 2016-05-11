'use strict';


//---------//
// Imports //
//---------//

const fp = require('lodash/fp');


//------//
// Init //
//------//

const stack = [];


//------//
// Main //
//------//

const passToStack = {
  pop: () => stack.pop()
  , push: val => stack.push(val) && stack
  , get: fp.always(stack)
  , getSize: () => stack.length
};


//---------//
// Exports //
//---------//

module.exports = passToStack;
