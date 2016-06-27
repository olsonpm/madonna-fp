module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**********************!*\
  !*** ./tests/es6.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var chai = __webpack_require__(/*! chai */ 1),
	    fp = __webpack_require__(/*! lodash/fp */ 2),
	    errorInfo = __webpack_require__(/*! ../lib/error-info */ 3),
	    utils = __webpack_require__(/*! ../lib/utils */ 4),
	    validFlags = __webpack_require__(/*! ../lib/valid-flags */ 5);

	//------//
	// Init //
	//------//

	var madonna = __webpack_require__(/*! ../es6 */ 6);

	chai.should();

	var vf = validFlags.flagToValidationFn;

	var cv = madonna.createValidator,
	    errorPropIdToStringId = errorInfo.propIdToStringId,
	    errorPropIdToDataKeys = errorInfo.propIdToDataKeys,
	    isDefined = vf.isDefined,
	    mutableAssign = utils.mutableAssign;

	//------//
	// Main //
	//------//

	describe('createValidator', function () {
	  it('should require a single argument', createTestCvError('requiresSingleArg'));
	  it("should require 'arg' to pass 'isLadenPlainObj'", createTestCvError('margNotIsLadenPlainObj', 'notAPlainObject'));
	  it("should require opts to pass 'fp.isPlainObject'", createTestCvError('optsNotIsPlainObject', { schema: {}, opts: 'fail' }));
	  it("should only allow the opts keys 'name', 'cb'", createTestCvError('hasInvalidOptKeys', {
	    schema: {},
	    opts: {
	      name: 'test',
	      cb: fp.noop,
	      incorrect: 'fail'
	    }
	  }));
	  it("should require 'opts.name' to pass 'isLadenString'", createTestCvError('nameNotIsLadenString', {
	    schema: {},
	    opts: {
	      name: ''
	    }
	  }));

	  it("should require 'opts.cb' to pass 'fp.isFunction'", createTestCvError('cbNotIsFunction', {
	    schema: {},
	    opts: {
	      cb: 'fail'
	    }
	  }));

	  it("should require 'arg.schema' to pass 'isLadenPlainObject'", createTestCvError('schemaNotIsLadenPlainObject', { schema: 'fail' }));

	  it("should require all criterion to pass either 'fp.isPlainObject' or 'fp.isArray'", createTestCvError('criterionMustBeIsPlainObjectOrIsArray', { arg1: '' }));

	  it("should require criterion to contain valid keys", createTestCvError('invalidCriterionKeys', {
	    arg1: {
	      invalidKey: ''
	    }
	  }));

	  it("should not allow duplicate flags", createTestCvError('noDuplicateFlags', {
	    arg1: {
	      flags: ['require', 'isBoolean', 'require']
	    }
	  }));

	  it("passTo should disallow the any keys besides 'flags', and any flags besides 'require'", function () {
	    var validateId = cv({
	      schema: {
	        id: ['require', 'isFinite']
	      },
	      opts: { name: 'validateId' }
	    });
	    var schema = {
	      objWithId: {
	        flags: ['require'],
	        passTo: validateId
	      }
	    };
	    cv.bind(null, schema).should.not.throw(Error);

	    schema.objWithId.flags.push('isLadenPlainObject');

	    testCvError('strictPassTo', schema);

	    mutableAssign(schema.objWithId, {
	      flags: ['require'],
	      hasSize: 2
	    });

	    testCvError('strictPassTo', schema);
	  });

	  it("passEachTo should only allow certain arguments", function () {
	    // Below are success and error cases for both flags non-flag criterion

	    var validateId = cv({
	      schema: {
	        id: ['require', 'isFinite']
	      },
	      opts: {
	        name: 'validateId'
	      }
	    });
	    var schema = {
	      objWithId: {
	        flags: ['require', 'isLaden'],
	        passEachTo: validateId
	      }
	    };
	    cv.bind(null, schema).should.not.throw(Error);

	    mutableAssign(schema.objWithId, {
	      flags: ['require'],
	      hasSize: 2
	    });

	    cv.bind(null, schema).should.not.throw(Error);

	    schema.objWithId.flags.push('isLadenObject');

	    testCvError('strictPassEachTo', schema);

	    mutableAssign(schema.objWithId, {
	      flags: ['require'],
	      type_of: 'object'
	    });

	    testCvError('strictPassEachTo', schema);
	  });

	  it("should require criterion values to pass their respective validation functions", createTestCvError('invalidCriterion', {
	    name: {
	      flags: ['incorrect']
	    }
	  }));
	});

	describe('createSternValidator', function () {
	  var nameValidator = madonna.createSternValidator({ name: ['require', 'isLadenString'] });
	  it('should throw an error upon invalid arguments', function () {
	    nameValidator.bind().should.throw(Error);
	  });
	  it('should return the validated arguments', function () {
	    nameValidator({ name: 'phil' }).should.deep.equal({ name: 'phil' });
	  });
	  it("should have alias 'createIdentityValidator'", function () {
	    madonna.createSternValidator.should.equal(madonna.createIdentityValidator);
	  });
	});

	describe('validate', function () {
	  it('should return the correct validation error', function () {
	    madonna.validate({ name: ['require', 'isLadenString'] }).err.id.should.equal(errorPropIdToStringId.validate.missingRequiredKeys);
	  });
	  it('should return the correct result object', function () {
	    madonna.validate({ name: ['require', 'isLadenString'] }, { name: 'phil' }).should.deep.equal({ isValid: true });
	  });
	});

	describe('validateSternly', function () {
	  it('should throw the correct validation error', function () {
	    var err = void 0;
	    try {
	      madonna.validateSternly({ name: ['require', 'isLadenString'] });
	    } catch (e) {
	      err = e;
	    }
	    err.id.should.equal(errorPropIdToStringId.validate.missingRequiredKeys);
	  });
	  it('should return the validated object', function () {
	    madonna.validateSternly({ name: ['require', 'isLadenString'] }, { name: 'phil' }).should.deep.equal({ name: 'phil' });
	  });
	  it("should have alias 'identityValidate'", function () {
	    madonna.validateSternly.should.equal(madonna.identityValidate);
	  });
	});

	describe('apply validator', function () {
	  it("should require at most one argument", function () {
	    testAvError('atMostOneArgument', { name: ['require'] }, '', '');
	  });

	  it("should require the argument to pass 'fp.isPlainObject'", createTestAvError('argNotIsPlainObject', { name: ['require'] }, ''));

	  it("should require valid argument keys", createTestAvError('invalidArgKeys', { name: ['require'] }, { invalid: '' }));

	  it("should require 'require' argument keys", createTestAvError('missingRequiredKeys', { name: ['require'] }));

	  it("should require argument values to pass criterion", createTestAvError('criterionFailed', {
	    name: {
	      type_of: 'string'
	    }
	  }, { name: 1 }));

	  it("should validate negated criterion", function () {
	    var schema = {
	      name: {
	        not_type_of: 'boolean'
	      }
	    };

	    cv(schema).bind(null, { name: 'phil' }).should.not.throw(Error);

	    testAvError('criterionFailed', schema, { name: true });
	  });

	  it("should validate nested passTo's", function () {
	    var vCard = cv({
	      schema: {
	        suit: {
	          flags: ['require'],
	          containedIn: ['spade', 'heart', 'diamond', 'club']
	        },
	        rank: {
	          flags: ['require'],
	          containedIn: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
	        }
	      },
	      opts: {
	        name: 'vCard'
	      }
	    });
	    var vModifiedDeck = cv({
	      schema: {
	        name: ['isLadenString'],
	        cards: {
	          flags: ['require', 'isLaden'],
	          passEachTo: vCard
	        }
	      },
	      opts: {
	        name: 'vModifiedDeck'
	      }
	    });

	    var vGameSchema = {
	      numberOfDice: {
	        flags: ['isFinite']
	      },
	      modifiedDeck: {
	        flags: ['require'],
	        passTo: vModifiedDeck
	      }
	    };
	    var validateGame = cv(vGameSchema);

	    var dirtyArgs = {
	      modifiedDeck: {
	        cards: [{
	          suit: 'heart',
	          rank: '2'
	        }, {
	          suit: 'heart',
	          rank: '3'
	        }]
	      }
	    };
	    validateGame.bind(null, dirtyArgs).should.not.throw(Error);

	    dirtyArgs.modifiedDeck.cards.push([{ suit: 'hearts', rank: '4' }]);

	    testAvError('criterionFailed', vGameSchema, dirtyArgs);
	  });
	});

	describe('options', function () {
	  it("'cb' should behave appropriately", function () {
	    // if name or age exists, then they both must exist
	    var validatePerson = cv({
	      schema: {
	        name: ['isLadenString'],
	        age: { betweenI: [0, 120] }
	      },
	      opts: {
	        cb: function cb(person) {
	          if (isDefined(person.name) !== isDefined(person.age)) {
	            return {
	              isValid: false,
	              err: new Error("If name or age is passed, then they both must" + " be passed")
	            };
	          }
	          return { isValid: true };
	        }
	      }
	    });

	    validatePerson({ name: 'phil' }).isValid.should.be.false;
	  });
	});

	//-------------//
	// Helper Fxns //
	//-------------//

	function createTestCvError(errPropId, arg) {
	  return testCvError.bind(null, errPropId, arg);
	}
	function createTestAvError(errPropId, schema, unsafeArg) {
	  return fp.ary(3, testAvError.bind(null, errPropId, schema, unsafeArg));
	}

	function testCvError(errPropId, arg) {
	  var err = void 0,
	      errId = errorPropIdToStringId.create[errPropId];

	  try {
	    if (fp.isUndefined(arg)) cv.call(null);else cv(arg);
	  } catch (e) {
	    err = e;
	  }
	  // if error exists but not id, then the library caused an uncaught exception
	  //   and we should throw it
	  if (err && !err.id) throw err;

	  err.id.should.equal(errId);
	}

	function testAvError(errPropId, cvArg, unsafeArg, testSecondArg) {
	  var res = void 0,
	      errId = errorPropIdToStringId.validate[errPropId],
	      errDataKeys = errorPropIdToDataKeys.validate[errPropId];

	  if (fp.isUndefined(unsafeArg)) res = cv(cvArg).call(null);else if (isDefined(testSecondArg)) res = cv(cvArg)(unsafeArg, testSecondArg);else res = cv(cvArg)(unsafeArg);

	  res.err.id.should.equal(errId);
	  fp.keys(res.err.data).should.deep.equal(errDataKeys);
	}

/***/ },
/* 1 */
/*!***********************!*\
  !*** external "chai" ***!
  \***********************/
/***/ function(module, exports) {

	module.exports = require("chai");

/***/ },
/* 2 */
/*!****************************!*\
  !*** external "lodash/fp" ***!
  \****************************/
/***/ function(module, exports) {

	module.exports = require("lodash/fp");

/***/ },
/* 3 */
/*!***************************!*\
  !*** ./lib/error-info.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//
	// README
	// - I can't think of a good word to encompass 'id' and 'data'.  I ended up
	//   using the word 'info', so please keep that definition in mind.
	//
	// - The term 'propId' refers to the identifier accessed via properties.  So to
	//   access the string identifier of 'create_requires-single-arg', you would type
	//   `create.requiresSingleArg`.
	//
	// - 'dataKeys' isn't actually consumed in the application itself, but is used
	//   in tests to ensure our errors are passing back the correct properties.  It
	//   will also be used in the future to generate the documentation website,
	//   assuming I put forth the time to make it.
	//

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 2),
	    utils = __webpack_require__(/*! ./utils */ 4);

	//------//
	// Init //
	//------//

	var ERROR_PREFIX = 'fp',
	    mapValuesWithKey = utils.mapValuesWithKey,
	    zipToManyObjectsWithKey = utils.zipToManyObjectsWithKey;

	//------//
	// Main //
	//------//

	var errorInfo = {
	  create: getCreateInfo(),
	  validate: getValidateInfo()
	};

	var propIdToStringId = mapPropIdToStringId(errorInfo),
	    propIdToDataKeys = mapPropIdToDataKeys(errorInfo);

	//-------------//
	// Helper Fxns //
	//-------------//

	function getCreateInfo() {
	  return zipToManyObjectsWithKey([['key', 'stringId'], ['requiresSingleArg', 'requires-single-arg'], ['oneOrTwoArgs', 'one-or-two-args'], ['margNotIsLadenPlainObj', 'marg-not-isLadenPlainObject'], ['optsNotIsPlainObject', 'opts-not-isPlainObject'], ['hasInvalidOptKeys', 'has-invalid-opts'], ['nameNotIsLadenString', 'name-not-isLadenString'], ['cbNotIsFunction', 'cb-not-is-function'], ['schemaNotIsLadenPlainObject', 'schema-not-isLadenPlainObject'], ['criterionMustBeIsPlainObjectOrIsArray', 'criterion-must-be-isPlainObject-or-isArray'], ['invalidCriterionKeys', 'invalid-criterion-keys'], ['noDuplicateFlags', 'no-duplicate-flags'], ['strictPassTo', 'strict-pass-to'], ['strictPassEachTo', 'strict-pass-each-to'], ['invalidCriterion', 'invalid-criterion']]);
	}

	function getValidateInfo() {
	  return zipToManyObjectsWithKey([['key', 'stringId', 'dataKeys'], ['atMostOneArgument', 'at-most-one-argument', ['argsLength', 'args']], ['argNotIsPlainObject', 'arg-not-isPlainObject', ['type_of', 'arg']], ['invalidArgKeys', 'invalid-arg-keys', ['invalidKeys', 'keysAllowed']], ['missingRequiredKeys', 'missing-required-keys', ['keysMissing', 'passedArgs']], ['criterionFailed', 'criterion-failed', ['invalidArgs', 'failedCriterion']]]);
	}

	function mapPropIdToStringId(errorInfo) {
	  return mapValuesWithKey(function (val, key) {
	    return fp.mapValues(function (innerVal) {
	      return ERROR_PREFIX + '_' + key + '_' + innerVal.stringId;
	    }, val);
	  }, errorInfo);
	}

	function mapPropIdToDataKeys(errorInfo) {
	  return {
	    validate: fp.mapValues('dataKeys', errorInfo.validate)
	  };
	}

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  propIdToStringId: propIdToStringId,
	  propIdToDataKeys: propIdToDataKeys,
	  ERROR_PREFIX: ERROR_PREFIX
	};

/***/ },
/* 4 */
/*!**********************!*\
  !*** ./lib/utils.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var fp = __webpack_require__(/*! lodash/fp */ 2);

	//------//
	// Init //
	//------//

	// other utils methods depend on this one
	var mutableSet = getMutableSet();

	//------//
	// Main //
	//------//

	//
	// Flipped fp fxns
	//
	var defaults = fp.curry(function (b, a) {
	  return fp.defaults(a, b);
	}),
	    get = fp.curry(function (b, a) {
	  return fp.get(a, b);
	}),
	    gt = fp.curry(function (b, a) {
	  return fp.gt(a, b);
	}),
	    lt = fp.curry(function (b, a) {
	  return fp.lt(a, b);
	}),
	    pick = fp.curry(function (b, a) {
	  return fp.pick(a, b);
	});

	//
	// Other common functions
	//

	// read as "all of b is contained in a"
	var allContainedIn = fp.curry(function (a, b) {
	  return fp.isArray(a) && fp.isArray(b) && !fp.without(a, b).length;
	});

	var allStringOrNumber = fp.anyPass([fp.all(fp.isString), fp.all(fp.isNumber)]);

	// between exclusive
	var betweenE = function betweenE(pair, c) {
	  var a = pair[0],
	      b = pair[1];

	  if (!allStringOrNumber([a, b, c])) return false;

	  return fp.gt(a, b) ? fp.gt(c, b) && fp.lt(c, a) : fp.gt(c, a) && fp.lt(c, b);
	};
	// between inclusive
	var betweenI = function betweenI(pair, c) {
	  var a = pair[0],
	      b = pair[1];

	  if (!allStringOrNumber([a, b, c])) return false;

	  return fp.gte(a, b) ? fp.gte(c, b) && fp.lte(c, a) : fp.gte(c, a) && fp.lte(c, b);
	};

	var containedIn = fp.curry(function (srcArr, val) {
	  return fp.contains(val, srcArr);
	});

	var defineProp = fp.curry(function (name, desc, obj) {
	  return Object.defineProperty(obj, name, desc);
	});

	var doesNotHave = function doesNotHave(val) {
	  return fp.negate(fp.has(val));
	};

	var doesNotHaveSize = function doesNotHaveSize(val) {
	  return fp.negate(hasSize(val));
	};

	var filteredMap = fp.curry(function (iteratee, col) {
	  return fp.flow(fp.filter(iteratee), fp.map(iteratee))(col);
	});

	var hasSize = function hasSize(val) {
	  return fp.flow(fp.size, fp.eq(val));
	};

	var instance_of = function instance_of(schemaIn, dirtyIn) {
	  return dirtyIn instanceof schemaIn;
	};

	var mapValuesWithKey = fp.ary(2, fp.mapValues.convert({ cap: false }));

	var matchesRegex = fp.curry(function (regex, str) {
	  return fp.allPass([fp.isString, regex.test.bind(regex)])(str);
	});

	var mutableAssign = fp.assign.convert({ immutable: false });

	function getMutableSet() {
	  return fp.set.convert({ immutable: false });
	}

	function tee(val) {
	  console.dir(val);
	  return val;
	}

	var type_of = function type_of(schemaIn, dirtyIn) {
	  return (typeof dirtyIn === 'undefined' ? 'undefined' : _typeof(dirtyIn)) === schemaIn;
	};

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

	var zipToManyObjects = function zipToManyObjects() {
	  var props = arguments[0];
	  return fp.map(fp.flow(fp.zipObject(props), fp.omitBy(fp.isUndefined)))(fp.tail(arguments));
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
	var zipToManyObjectsWithKey = fp.flow(fp.spread(zipToManyObjects), fp.keyBy('key'), fp.mapValues(fp.omit('key')));

	var returnArgumentsObj = function returnArgumentsObj() {
	  return arguments;
	};

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  allContainedIn: allContainedIn,
	  allStringOrNumber: allStringOrNumber,
	  betweenE: fp.curry(betweenE),
	  betweenI: fp.curry(betweenI),
	  containedIn: containedIn,
	  count: fp.countBy(fp.identity),
	  defaults: defaults,
	  defineProp: defineProp,
	  doesNotHave: doesNotHave,
	  doesNotHaveSize: doesNotHaveSize,
	  filteredMap: filteredMap,
	  get: get,
	  gt: gt,
	  hasSize: hasSize,
	  instance_of: fp.curry(instance_of),
	  lt: lt,
	  mapValuesWithKey: mapValuesWithKey,
	  matchesRegex: matchesRegex,
	  mutableAssign: mutableAssign,
	  mutableSet: mutableSet,
	  not_instance_of: fp.curryN(2, fp.negate(instance_of)),
	  not_type_of: fp.curryN(2, fp.negate(type_of)),
	  outsideE: fp.curryN(2, fp.negate(betweenI)),
	  outsideI: fp.curryN(2, fp.negate(betweenE)),
	  pick: pick,
	  returnArgumentsObj: returnArgumentsObj,
	  tee: tee,
	  type_of: fp.curry(type_of),
	  zipToManyObjects: zipToManyObjects,
	  zipToManyObjectsWithKey: zipToManyObjectsWithKey
	};

/***/ },
/* 5 */
/*!****************************!*\
  !*** ./lib/valid-flags.js ***!
  \****************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 2),
	    utils = __webpack_require__(/*! ./utils */ 4);

	//------//
	// Init //
	//------//

	var createLaden = function createLaden(fn) {
	  return fp.allPass([fn, fp.size]);
	},
	    hasSize = utils.hasSize;

	//------//
	// Main //
	//------//

	var flags = getCustomFlags().concat(getLodashFlags()),
	    flagToValidationFn = getFlagToValidationFn();

	//-------------//
	// Helper Fxns //
	//-------------//

	function getFlagToValidationFn() {
	  return fp.assign(getCustomFlagToValidationFn(), getLodashFlagToValidationFn());
	}

	function getCustomFlags() {
	  return fp.keys(getCustomFlagToValidationFn());
	}

	function getCustomFlagToValidationFn() {
	  return {
	    require: fp.constant(true),
	    isCharacter: fp.allPass([fp.isString, hasSize(1)]),
	    isDefined: fp.negate(fp.isUndefined),
	    isLaden: fp.size,
	    isLadenArray: createLaden(fp.isArray),
	    isLadenPlainObject: createLaden(fp.isPlainObject),
	    isLadenString: createLaden(fp.isString),
	    isPositiveNumber: fp.anyPass([fp.allPass([fp.isNumber, fp.inRange(1, Infinity)]), fp.eq(Infinity)]),
	    isNegativeNumber: fp.allPass([fp.isNumber, fp.inRange(-Infinity, 0)]),
	    isStringOrNumber: fp.anyPass([fp.isString, fp.isNumber])
	  };
	}

	function getLodashFlags() {
	  return fp.keys(getLodashFlagToValidationFn());
	}

	function getLodashFlagToValidationFn() {
	  return fp.reduce(function (res, cur) {
	    var negated = fp.replace(/^is/, 'isNot', cur);
	    res[cur] = fp[cur];
	    res[negated] = fp.negate(fp[cur]);
	    return res;
	  }, {}, ['isArguments', 'isArray', 'isArrayBuffer', 'isArrayLike', 'isArrayLikeObject', 'isBoolean', 'isBuffer', 'isDate', 'isElement', 'isEmpty', 'isEqual', 'isEqualWith', 'isError', 'isFinite', 'isFunction', 'isInteger', 'isLength', 'isMap', 'isNaN', 'isNative', 'isNil', 'isNull', 'isNumber', 'isObject', 'isObjectLike', 'isPlainObject', 'isRegExp', 'isSafeInteger', 'isSet', 'isString', 'isSymbol', 'isTypedArray', 'isUndefined', 'isWeakMap', 'isWeakSet']);
	}

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  flags: flags,
	  flagToValidationFn: flagToValidationFn
	};

/***/ },
/* 6 */
/*!*************************!*\
  !*** external "../es5" ***!
  \*************************/
/***/ function(module, exports) {

	module.exports = require("../es5");

/***/ }
/******/ ]);