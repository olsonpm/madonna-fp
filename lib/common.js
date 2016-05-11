'use strict';

//
// README
// - This file differs from utils in that these functions are domain-specific
//   yet still don't have a defined scope.
//


//---------//
// Imports //
//---------//

const fp = require('lodash/fp')
  , utils = require('./utils');


//------//
// Init //
//------//

const isLadenString = fp.allPass([fp.size, fp.isString])
  , defineProp = utils.defineProp
  , mutableSet = utils.mutableSet;


//------//
// Main //
//------//

const createError = (name, id, msg, data) => {
  return fp.flow(
    mutableSet('name', name)
    , defineProp('id', { enumerable: true, value: id })
    , (data)
      ? defineProp('data', { enumerable: true, value: data })
      : fp.identity
  )(new Error(msg));
};

function jstring(obj) {
  obj = translateAll(obj, fp.isRegExp, regex => regex.toString());
  obj = translateAll(obj, fp.isFunction, fn => {
    if (isLadenString(fn.name)) return fn.name;
    if (isLadenString(fn._name)) return fn._name;
    return '<Function>';
  });

  return JSON.stringify(obj, null, 2);
}


//-------------//
// Helper Fxns //
//-------------//

// mutates obj
function translateAll(obj, test, translate) {
  return fp.mapValues(recurse, obj);

  function recurse(val) {
    let res = val;
    if (fp.isArray(val)) {
      res = fp.map(recurse, val);
    } else if (fp.isPlainObject(val)) {
      res = fp.mapValues(recurse, val);
    } else if (test(val)) {
      res = translate(val);
    }
    return res;
  }
}


//---------//
// Exports //
//---------//

module.exports = {
  createError: createError
  , jstring: jstring
};
