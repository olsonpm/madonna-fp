'use strict';


//---------//
// Imports //
//---------//

const fp = require('lodash/fp')
  , utils = require('./utils');


//------//
// Init //
//------//

const createLaden = fn => fp.allPass([fn, fp.size])
  , hasSize = utils.hasSize;


//------//
// Main //
//------//

const flags = getCustomFlags().concat(getLodashFlags())
  , flagToValidationFn = getFlagToValidationFn();


//-------------//
// Helper Fxns //
//-------------//

function getFlagToValidationFn() {
  return fp.assign(
    getCustomFlagToValidationFn()
    , getLodashFlagToValidationFn()
  );
}

function getCustomFlags() {
  return fp.keys(getCustomFlagToValidationFn());
}

function getCustomFlagToValidationFn() {
  return {
    require: fp.constant(true)
    , isCharacter: fp.allPass([
      fp.isString
      , hasSize(1)
    ])
    , isDefined: fp.negate(fp.isUndefined)
    , isLaden: fp.size
    , isLadenArray: createLaden(fp.isArray)
    , isLadenPlainObject: createLaden(fp.isPlainObject)
    , isLadenString: createLaden(fp.isString)
    , isPositiveNumber: fp.anyPass([
      fp.allPass([fp.isNumber, fp.inRange(1, Infinity)])
      , fp.eq(Infinity)
    ])
    , isNegativeNumber: fp.allPass([fp.isNumber, fp.inRange(-Infinity, 0)])
    , isStringOrNumber: fp.anyPass([
      fp.isString
      , fp.isNumber
    ])
  };
}

function getLodashFlags() {
  return fp.keys(getLodashFlagToValidationFn());
}

function getLodashFlagToValidationFn() {
  return fp.reduce(
    (res, cur) => {
      var negated = fp.replace(/^is/, 'isNot', cur);
      res[cur] = fp[cur];
      res[negated] = fp.negate(fp[cur]);
      return res;
    }
    , {}
    , [
      'isArguments'
      , 'isArray'
      , 'isArrayBuffer'
      , 'isArrayLike'
      , 'isArrayLikeObject'
      , 'isBoolean'
      , 'isBuffer'
      , 'isDate'
      , 'isElement'
      , 'isEmpty'
      , 'isEqual'
      , 'isEqualWith'
      , 'isError'
      , 'isFinite'
      , 'isFunction'
      , 'isInteger'
      , 'isLength'
      , 'isMap'
      , 'isNaN'
      , 'isNative'
      , 'isNil'
      , 'isNull'
      , 'isNumber'
      , 'isObject'
      , 'isObjectLike'
      , 'isPlainObject'
      , 'isRegExp'
      , 'isSafeInteger'
      , 'isSet'
      , 'isString'
      , 'isSymbol'
      , 'isTypedArray'
      , 'isUndefined'
      , 'isWeakMap'
      , 'isWeakSet'
    ]
  );
}


//---------//
// Exports //
//---------//

module.exports = {
  flags: flags
  , flagToValidationFn: flagToValidationFn
};
