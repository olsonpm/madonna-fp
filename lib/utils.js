'use strict';


//---------//
// Imports //
//---------//

const fp = require('lodash/fp');


//------//
// Init //
//------//

// other utils methods depend on this one
const mutableSet = getMutableSet();


//------//
// Main //
//------//

//
// Flipped fp fxns
//
const defaults = fp.curry((b, a) => fp.defaults(a, b))
  , get = fp.curry((b, a) => fp.get(a, b))
  , gt = fp.curry((b, a) => fp.gt(a, b))
  , lt = fp.curry((b, a) => fp.lt(a, b))
  , pick = fp.curry((b, a) => fp.pick(a, b));


//
// Other common functions
//

// read as "all of b is contained in a"
const allContainedIn = fp.curry((a, b) => {
  return fp.isArray(a)
    && fp.isArray(b)
    && !fp.without(a, b).length;
});

const allStringOrNumber = fp.anyPass([
  fp.all(fp.isString)
  , fp.all(fp.isNumber)
]);

// between exclusive
const betweenE = (pair, c) => {
  const a = pair[0]
    , b = pair[1];

  if (!allStringOrNumber([a, b, c])) return false;

  return (fp.gt(a, b))
    ? fp.gt(c, b) && fp.lt(c, a)
    : fp.gt(c, a) && fp.lt(c, b);
};
// between inclusive
const betweenI = (pair, c) => {
  const a = pair[0]
    , b = pair[1];

  if (!allStringOrNumber([a, b, c])) return false;

  return (fp.gte(a, b))
    ? fp.gte(c, b) && fp.lte(c, a)
    : fp.gte(c, a) && fp.lte(c, b);
};

const containedIn = fp.curry((srcArr, val) => {
  return fp.contains(val, srcArr);
});

const defineProp = fp.curry(
  (name, desc, obj) => Object.defineProperty(obj, name, desc)
);

const doesNotHave = val => fp.negate(fp.has(val));

const doesNotHaveSize = val => fp.negate(hasSize(val));

const filteredMap = fp.curry(
  (iteratee, col) => fp.flow(
    fp.filter(iteratee)
    , fp.map(iteratee)
  )(col)
);

const hasSize = val => fp.flow(fp.size, fp.eq(val));

const instance_of = (schemaIn, dirtyIn) => dirtyIn instanceof schemaIn;

const mapValuesWithKey = fp.ary(2, fp.mapValues.convert({ cap: false }));

const matchesRegex = fp.curry(
  (regex, str) => fp.allPass([fp.isString, regex.test.bind(regex)])(str)
);

const mutableAssign = fp.assign.convert({ immutable: false });

function getMutableSet() { return fp.set.convert({ immutable: false }); }

function tee(val) {
  console.dir(val);
  return val;
}

const type_of = (schemaIn, dirtyIn) => typeof dirtyIn === schemaIn;

// This function takes tabular-like data and creates an array of objects where
//   the keys per object are the first row, and the values the subsequent rows.
//   Words mean nothing without an example!
//
// zipToManyObjects([
//  ['name', 'age', 'hairColor']
//  , ['phil', 28, 'dark brown']
//  , ['matt', 27, 'regular ole brown']
// ])
//
// produces
//
// [
//   {
//     name: 'phil'
//     , age: 28
//     , hairColor: 'dark brown'
//   }
//   , {
//     name: 'matt'
//     , age: 27
//     , hairColor: 'regular ole brown'
//   }
// ]

const zipToManyObjects = function zipToManyObjects() {
  const props = arguments[0];
  return fp.map(
    fp.flow(
      fp.zipObject(props)
      , fp.omitBy(fp.isUndefined)
    )
  )(fp.tail(arguments));
};

// This function could be more efficient by avoiding zipObject (in zipToManyObjects),
//   but I want to rely on its functionality for stability.
//
// Also to give a brief description of what this function does (the code doesn't
//   spell it out very nicely), this takes an array of tabular-like data and
//   creates an object from it.  This function assumes one of the columns has
//   the name 'key'.  The following example makes this obvious:
//
// zipToManyObjectsWithKey([
//  ['key', 'age', 'hairColor']
//  , ['phil', 28, 'dark brown']
//  , ['matt', 27, 'regular ole brown']
// ])
//
// produces
//
// {
//   phil: {
//     age: 28
//     , hairColor: 'dark brown'
//   }
//   , matt: {
//     age: 27
//     , hairColor: 'regular ole brown'
//   }
// }
const zipToManyObjectsWithKey = fp.flow(
  fp.spread(zipToManyObjects)
  , fp.keyBy('key')
  , fp.mapValues(fp.omit('key'))
);

const returnArgumentsObj = function() {
  return arguments;
};


//---------//
// Exports //
//---------//

module.exports = {
  allContainedIn: allContainedIn
  , allStringOrNumber: allStringOrNumber
  , betweenE: fp.curry(betweenE)
  , betweenI: fp.curry(betweenI)
  , containedIn: containedIn
  , count: fp.countBy(fp.identity)
  , defaults: defaults
  , defineProp: defineProp
  , doesNotHave: doesNotHave
  , doesNotHaveSize: doesNotHaveSize
  , filteredMap: filteredMap
  , get: get
  , gt: gt
  , hasSize: hasSize
  , instance_of: fp.curry(instance_of)
  , lt: lt
  , mapValuesWithKey: mapValuesWithKey
  , matchesRegex: matchesRegex
  , mutableAssign: mutableAssign
  , mutableSet: mutableSet
  , not_instance_of: fp.curryN(2, fp.negate(instance_of))
  , not_type_of: fp.curryN(2, fp.negate(type_of))
  , outsideE: fp.curryN(2, fp.negate(betweenI))
  , outsideI: fp.curryN(2, fp.negate(betweenE))
  , pick: pick
  , returnArgumentsObj: returnArgumentsObj
  , tee: tee
  , type_of: fp.curry(type_of)
  , zipToManyObjects: zipToManyObjects
  , zipToManyObjectsWithKey: zipToManyObjectsWithKey
};
