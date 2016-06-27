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
  !*** ./lib/index.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var common = __webpack_require__(/*! ./common */ 1),
	    deepFreezeStrict = __webpack_require__(/*! deep-freeze-strict */ 4),
	    errorInfo = __webpack_require__(/*! ./error-info */ 5),
	    fp = __webpack_require__(/*! lodash/fp */ 2),
	    validatorFn = __webpack_require__(/*! ./validator-fn */ 6),
	    utils = __webpack_require__(/*! ./utils */ 3),
	    validCriterion = __webpack_require__(/*! ./valid-criterion */ 9),
	    validFlags = __webpack_require__(/*! ./valid-flags */ 10),
	    vh = __webpack_require__(/*! ./validation-helpers */ 8);

	//------//
	// Init //
	//------//

	var vf = validFlags.flagToValidationFn;

	var allContainedIn = utils.allContainedIn,
	    createError = common.createError,
	    errorPropIdToStringId = errorInfo.propIdToStringId,
	    isDefined = vf.isDefined,
	    isLadenPlainObject = vf.isLadenPlainObject,
	    isLadenString = vf.isLadenString,
	    jstring = common.jstring,
	    selectCriterionKeysToInputValidation = getSelectCriterionKeysToInputValidation();

	var VALID_OPT_KEYS = ['name', 'cb'];

	var res = void 0;

	//------//
	// Main //
	//------//

	function getMadonnaFp() {
	  return attachProperties({});
	}

	function validate(marg, dirtyObj) {
	  preliminaryArgsCheckForValidate.apply(null, arguments);
	  var validator = createValidatorInternal(marg);
	  return arguments.length === 1 ? validator() : validator(dirtyObj);
	}

	function validateSternly(marg, dirtyObj) {
	  preliminaryArgsCheckForValidate.apply(null, arguments);
	  var validator = createValidatorInternal(marg, true);
	  return arguments.length === 1 ? validator() : validator(dirtyObj);
	}

	function createValidator(marg) {
	  preliminaryArgsCheckForCreator.apply(null, arguments);
	  return createValidatorInternal(marg);
	}

	function createSternValidator(marg) {
	  preliminaryArgsCheckForCreator.apply(null, arguments);
	  return createValidatorInternal(marg, true);
	}

	function preliminaryArgsCheckForCreator() {
	  // The below logic should be shared with valdiate and validateSternly, however
	  //   the error messages should be different.  That's why this logic is in two
	  //   different spots for now.
	  if (arguments.length !== 1) {
	    throw createError('Invalid Input', errorPropIdToStringId.create.requiresSingleArg, "This method requires a single argument\n" + "arguments: " + jstring(arguments));
	  }
	}

	function preliminaryArgsCheckForValidate() {
	  // The below logic should be shared with valdiate and validateSternly, however
	  //   the error messages should be different.  That's why this logic is in two
	  //   different spots for now.
	  if (!fp.includes(arguments.length, [1, 2])) {
	    throw createError('Invalid Input', errorPropIdToStringId.create.oneOrTwoArgs, "This method requires one or two arguments\n" + "arguments: " + jstring(arguments));
	  }
	}

	function createValidatorInternal(marg, shouldThrow) {
	  // First get rid of 'shouldThrow' if it was passed from createSternValidator
	  //   This feels hacky, but keeping the state global would cause bigger issues
	  //   and I don't want to make any assumptions about the arguments being
	  //   passed in prior to being validated.  This hacky method avoids all the
	  //   above problems.

	  validateMarg(marg);

	  // convert schema to longhand
	  if (isShorthand(marg)) marg = convertSchemaToLonghand(marg);

	  marg.schema = convertCriterionToLonghand(marg.schema);

	  // no errors, good to go
	  var aValidatorFn = validatorFn(marg, shouldThrow);

	  Object.defineProperty(aValidatorFn, '_id', { value: 'madonnafp', enumerable: true });

	  // opts.name will either be undefined or isLadenString at this point
	  Object.defineProperty(aValidatorFn, '_name', { value: fp.get('opts.name', marg), enumerable: true });

	  return aValidatorFn;
	}

	//-------------//
	// Helper Fxns //
	//-------------//

	function attachProperties(madonnaFp) {
	  var createReadOnlyEnumerableProperty = function createReadOnlyEnumerableProperty(name, val) {
	    Object.defineProperty(madonnaFp, name, {
	      value: val,
	      enumerable: true
	    });
	  };

	  fp.flow(fp.toPairs, fp.each(fp.spread(createReadOnlyEnumerableProperty)))({
	    ERROR_IDS: deepFreezeStrict(errorPropIdToStringId.validate),
	    CRITERION_FNS: selectCriterionKeysToInputValidation,
	    FLAG_FNS: validFlags.flagToValidationFn,
	    validate: validate,
	    validateSternly: validateSternly,
	    identityValidate: validateSternly,
	    createValidator: createValidator,
	    createSternValidator: createSternValidator,
	    createIdentityValidator: createSternValidator
	  });

	  return madonnaFp;
	}

	function validateMarg(marg) {
	  if (!isLadenPlainObject(marg)) {
	    throw createError('Invalid Input', errorPropIdToStringId.create.margNotIsLadenPlainObj, "'marg' must pass 'isLadenPlainObject'\n" + "marg: " + jstring(marg));
	  }
	  // If marg doesn't have only a property 'schema' and optionally 'opts', then
	  //   it's the shorthand version.
	  //
	  // If it's shorthand, let's modify it to the long-hand version for
	  //   easier parsing
	  // If it's the longhand version, then we need to validate opts.

	  if (isShorthand(marg)) {
	    // shorthand was used, let's convert to the longhand
	    marg = convertSchemaToLonghand(marg);
	  } else {
	    // longhand syntax was used, validate opts and make sure schema
	    //   passes isLadenPlainObject
	    marg = fp.defaults({ opts: {} }, marg);
	    if (!fp.isPlainObject(marg.opts)) {
	      throw createError('Invalid Input', errorPropIdToStringId.create.optsNotIsPlainObject, "'opts' must pass 'fp.isPlainObject'\n" + "type of opts: " + _typeof(marg.opts) + "\n" + "opts: " + jstring(marg.opts));
	    }

	    var invalidOptKeys = vh.create.getInvalidOptKeys(VALID_OPT_KEYS, marg.opts);
	    if (invalidOptKeys.length) {
	      throw createError('Invalid Input', errorPropIdToStringId.create.hasInvalidOptKeys, "'opts' has invalid keys'\n" + "invalid keys: " + invalidOptKeys.join(', ') + "\n" + "keys allowed: " + VALID_OPT_KEYS.join(', '));
	    }

	    // When defined, name must pass isLadenString
	    if (isDefined(marg.opts.name) && !isLadenString(marg.opts.name)) {
	      throw createError('Invalid Input', errorPropIdToStringId.create.nameNotIsLadenString, "'opts.name' must pass 'isLadenString'\n" + "type of name: " + _typeof(marg.opts.name) + "\n" + "name: " + jstring(marg.opts.name));
	    }

	    // When defined, cb must pass isFunction
	    if (isDefined(marg.opts.cb) && !fp.isFunction(marg.opts.cb)) {
	      throw createError('Invalid Input', errorPropIdToStringId.create.cbNotIsFunction, "'opts.cb' must pass 'fp.isFunction'\n" + "type of cb: " + _typeof(marg.opts.cb) + "\n" + "cb: " + jstring(marg.opts.cb));
	    }

	    // Schema must pass isLadenPlainObject
	    if (!isLadenPlainObject(marg.schema)) {
	      throw createError('Invalid Input', errorPropIdToStringId.create.schemaNotIsLadenPlainObject, "Invalid Input", "'marg.schema' must pass 'isLadenPlainObject'\n" + "marg: " + jstring(marg));
	    }
	  }

	  var schema = marg.schema;

	  if (!fp.size(schema)) {
	    throw createError('Invalid Input', errorPropIdToStringId.create.schemaIsEmpty, "'schema' must contain at least one property\n" + "marg: " + jstring(marg));
	  }

	  // This library allows criterion to be either a succinct 'common use-case' array
	  //   filled with flags, or a more verbose and customizable object
	  var invalidArgs = fp.omitBy(fp.anyPass([fp.isPlainObject, fp.isArray]), schema);
	  if (fp.size(invalidArgs)) {
	    throw createError('Invalid Input', errorPropIdToStringId.create.criterionMustBeIsPlainObjectOrIsArray, "'schema' values must all pass either " + "'fp.isPlainObject' or 'fp.isArray'\n" + "invalid args: " + jstring(invalidArgs));
	  }

	  // In the case the array form is used, let's sanitize it to the verbose form.
	  //   This simplifies parsing logic
	  schema = convertCriterionToLonghand(schema);

	  invalidArgs = vh.create.getInvalidCriterionByKeys(schema);
	  if (fp.size(invalidArgs)) {
	    throw createError('Invalid Input', errorPropIdToStringId.create.invalidCriterionKeys, "Invalid Input", "criterion must all have keys contained in valid-criterion\n" + "invalid criterion per schema marg: " + jstring(invalidArgs));
	  }

	  invalidArgs = vh.create.getArgsWithDuplicateFlags(schema);
	  if (fp.size(invalidArgs)) {
	    throw createError('Invalid Input', errorPropIdToStringId.create.noDuplicateFlags, "There cannot be duplicate flags\n" + "args with duplicate flags: " + jstring(invalidArgs));
	  }

	  //
	  // logic to take care of invalid sibling arguments
	  //
	  var invalidPassToArgs = vh.create.getInvalidPassToArgs(schema);
	  if (fp.size(invalidPassToArgs)) {
	    throw createError('Invalid Input', errorPropIdToStringId.create.strictPassTo, "All criterion beyond the 'require' and 'isLaden' flags must be done " + "in the passTo validator function\n" + "invalid args: " + jstring(invalidPassToArgs));
	  }

	  res = vh.create.getInvalidPassEachToArgs(schema);
	  if (fp.size(res.invalidArgs)) {
	    throw createError('Invalid Input', errorPropIdToStringId.create.strictPassEachTo, "Invalid Input", "Only certain criterion are allowed alongside passEachTo\n" + "invalid args: " + jstring(res.invalidArgs) + "\n" + "allowed keys: " + jstring(res.validKeys) + "\n" + "allowed flags: " + jstring(res.validFlags));
	  }
	  //
	  // end of invalid sibling marg logic
	  //

	  res = vh.create.getInvalidCriterionAndFailedValidationFns(schema);
	  if (fp.size(res.invalidCriterion)) {
	    throw createError('Invalid Input', errorPropIdToStringId.create.invalidCriterion, "criterion must all have values which pass " + "their respective validation functions\n" + "invalid criterion: " + jstring(res.invalidCriterion) + "\n" + "failed validation functions: " + jstring(res.failedValidationFns));
	  }
	}

	function getSelectCriterionKeysToInputValidation() {
	  return fp.omit(['custom', 'flags', 'passTo', 'passEachTo'], validCriterion.keyToInputValidation);
	}

	function isShorthand(marg) {
	  return !(fp.has('schema', marg) && allContainedIn(['schema', 'opts'], fp.keys(marg)));
	}

	function convertSchemaToLonghand(schema) {
	  return { schema: schema, opts: {} };
	}

	function convertCriterionToLonghand(schema) {
	  var sanitizer = function sanitizer(val) {
	    return fp.isArray(val) ? { flags: val } : val;
	  };

	  return fp.mapValues(sanitizer, schema);
	}

	//---------//
	// Exports //
	//---------//

	module.exports = getMadonnaFp();

/***/ },
/* 1 */
/*!***********************!*\
  !*** ./lib/common.js ***!
  \***********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//
	// README
	// - This file differs from utils in that these functions are domain-specific
	//   yet still don't have a defined scope.
	//

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 2),
	    utils = __webpack_require__(/*! ./utils */ 3);

	//------//
	// Init //
	//------//

	var isLadenString = fp.allPass([fp.size, fp.isString]),
	    defineProp = utils.defineProp,
	    mutableSet = utils.mutableSet;

	//------//
	// Main //
	//------//

	var createError = function createError(name, id, msg, data) {
	  return fp.flow(mutableSet('name', name), defineProp('id', { enumerable: true, value: id }), data ? defineProp('data', { enumerable: true, value: data }) : fp.identity)(new Error(msg));
	};

	function jstring(obj) {
	  obj = translateAll(obj, fp.isRegExp, function (regex) {
	    return regex.toString();
	  });
	  obj = translateAll(obj, fp.isFunction, function (fn) {
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
	    var res = val;
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
	  createError: createError,
	  jstring: jstring
	};

/***/ },
/* 2 */
/*!****************************!*\
  !*** external "lodash/fp" ***!
  \****************************/
/***/ function(module, exports) {

	module.exports = require("lodash/fp");

/***/ },
/* 3 */
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
/* 4 */
/*!*************************************!*\
  !*** external "deep-freeze-strict" ***!
  \*************************************/
/***/ function(module, exports) {

	module.exports = require("deep-freeze-strict");

/***/ },
/* 5 */
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
	    utils = __webpack_require__(/*! ./utils */ 3);

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
/* 6 */
/*!*****************************!*\
  !*** ./lib/validator-fn.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var common = __webpack_require__(/*! ./common */ 1),
	    fp = __webpack_require__(/*! lodash/fp */ 2),
	    errorInfo = __webpack_require__(/*! ./error-info */ 5),
	    passToStack = __webpack_require__(/*! ./pass-to-stack */ 7),
	    utils = __webpack_require__(/*! ./utils */ 3),
	    vh = __webpack_require__(/*! ./validation-helpers */ 8);

	//------//
	// Init //
	//------//

	var containedIn = utils.containedIn,
	    createError = common.createError,
	    jstring = common.jstring,
	    errorPropIdToStringId = errorInfo.propIdToStringId;

	//------//
	// Main //
	//------//

	var validatorFn = getValidatorFn();

	//-------------//
	// Helper Fxns //
	//-------------//

	//
	// Explanation of the below function returning a function returning a function
	//  - getValidatorFn allows me to keep the 'Main' section small and semantic
	//  - we need the two inner functions since currying a function with two arguments
	//    won't work - curried functions require a set number of arguments and
	//    the schema may declare optional arguments exclusively
	//
	function getValidatorFn() {
	  return function (_ref, shouldThrow) {
	    var schema = _ref.schema;
	    var _ref$opts = _ref.opts;
	    var opts = _ref$opts === undefined ? {} : _ref$opts;
	    return function (unsafeArgsObj) {
	      var res = {
	        isValid: false
	      };

	      // Step 1
	      //  - ensure either zero or one arguments were passed
	      if (!containedIn([0, 1], arguments.length)) {
	        return orThrow(createError('Invalid Input', errorPropIdToStringId.validate.atMostOneArgument, "This method requires at most one argument\n" + ('arguments.length: ' + arguments.length + '\n') + 'arguments: ' + jstring(arguments), {
	          argsLength: arguments.length,
	          args: fp.clone(arguments)
	        }));
	      }

	      // Step 2
	      //  - if unsafeArgsObj was given, ensure it passes fp.isPlainObject
	      if (arguments.length && !fp.isPlainObject(unsafeArgsObj)) {
	        return orThrow(createError('Invalid Input', errorPropIdToStringId.validate.argNotIsPlainObject, "This method requires the argument to pass 'fp.isPlainObject'\n" + "typeof resolves to: " + (typeof unsafeArgsObj === 'undefined' ? 'undefined' : _typeof(unsafeArgsObj)) + "\n" + "argument: " + jstring(unsafeArgsObj), {
	          type_of: typeof unsafeArgsObj === 'undefined' ? 'undefined' : _typeof(unsafeArgsObj),
	          arg: unsafeArgsObj
	        }));
	      }

	      // Step 3
	      //  - ensure unsafeArgsObj passes valid arguments
	      var invalidKeys = vh.validate.getInvalidKeys(unsafeArgsObj, schema);
	      if (invalidKeys.length) {
	        var validKeys = fp.keys(schema);
	        return orThrow(createError('Invalid Input', errorPropIdToStringId.validate.invalidArgKeys, "Invalid argument keys were passed\n" + "invalid keys: " + invalidKeys.join(', ') + "\n" + "allowed keys: " + validKeys.join(', '), {
	          invalidKeys: invalidKeys,
	          keysAllowed: validKeys
	        }));
	      }

	      // Step 4
	      //  - ensure unsafeArgsObj passes all required arguments
	      var keysMissing = vh.validate.getMissingKeys(unsafeArgsObj, schema);
	      if (keysMissing.length) {
	        return orThrow(createError('Invalid Input', errorPropIdToStringId.validate.missingRequiredKeys, "Not all required keys were passed\n" + "missing keys: " + keysMissing.join(', ') + "\n" + "args passed: " + jstring(unsafeArgsObj), {
	          keysMissing: keysMissing,
	          passedArgs: unsafeArgsObj
	        }));
	      }

	      // 'passTo' is validated here, which is why we need to wrap this function in
	      //   a try/catch.  In the future this structure may change, but I made a
	      //   late decision to throw only when configured as opposed to by default
	      //   and thus had all these try/catches already in place.
	      try {
	        // Step 5
	        //  - ensure unsafeArgsObj values pass all criterion
	        res = vh.validate.getInvalidCriterionPerArgs(unsafeArgsObj, schema);
	        if (res.hasInvalidArgs) {
	          return orThrow(createError('Invalid Input', errorPropIdToStringId.validate.criterionFailed, "The following arguments didn't pass their criterion\n" + "invalid arguments and values: " + jstring(res.invalidArgs) + "\n" + "failed criterion per argument: " + jstring(res.invalidCriterionPerArgs), {
	            invalidArgs: res.invalidArgs,
	            failedCriterion: res.invalidCriterionPerArgs
	          }));
	        }
	      } catch (_err) {
	        // if we're in a passTo chain, then rethrow
	        if (passToStack.getSize()) throw _err;

	        // if we didn't catch an error resulting from a passTo chain, return or
	        //   throw _err
	        if (!_err._caughtPassTo) return orThrow(_err);

	        // otherwise create a new error so the consumer is presented with a
	        //   useful stacktrace.
	        return orThrow(createError(_err.name, _err.id, _err.message, _err.data));
	      }

	      // SUCCESS

	      if (opts.cb) {
	        var cbRes = opts.cb(unsafeArgsObj);
	        res = shouldThrow ? unsafeArgsObj : cbRes;
	      } else {
	        // if shouldThrow is true, then a result is pointless because it is implied
	        //   via the error not being thrown.  By returning the arguments object,
	        //   we allow the library to be used in a more functional manner.
	        res = shouldThrow ? unsafeArgsObj // unsafeArgsObj is actually safe at this point!
	        : { isValid: true };
	      }

	      return res;

	      // helper fxns
	      function orThrow(err) {
	        // we need to throw if we're in a passTo chain since it's the only way
	        //   the error data will propagate down
	        if (shouldThrow || passToStack.getSize()) throw err;

	        return {
	          isValid: false,
	          err: err
	        };
	      }
	    };
	  };
	}

	//---------//
	// Exports //
	//---------//

	module.exports = validatorFn;

/***/ },
/* 7 */
/*!******************************!*\
  !*** ./lib/pass-to-stack.js ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 2);

	//------//
	// Init //
	//------//

	var stack = [];

	//------//
	// Main //
	//------//

	var passToStack = {
	  pop: function pop() {
	    return stack.pop();
	  },
	  push: function push(val) {
	    return stack.push(val) && stack;
	  },
	  get: fp.always(stack),
	  getSize: function getSize() {
	    return stack.length;
	  }
	};

	//---------//
	// Exports //
	//---------//

	module.exports = passToStack;

/***/ },
/* 8 */
/*!***********************************!*\
  !*** ./lib/validation-helpers.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//
	// README
	//  - This file contains common domain-specific functionality that should not be
	//    exposed to the public api.  It should not be confused with 'utils' which
	//    contains common functionality that may some day be extracted to an external
	//    library.  Both files lack defined scope.
	//

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 2),
	    validCriterion = __webpack_require__(/*! ./valid-criterion */ 9),
	    validFlags = __webpack_require__(/*! ./valid-flags */ 10),
	    utils = __webpack_require__(/*! ./utils */ 3);

	//------//
	// Init //
	//------//

	var vcKeys = validCriterion.keys,
	    count = utils.count,
	    flagToValidationFn = validFlags.flagToValidationFn,
	    gt = utils.gt,
	    vcKeyToSchemaValidation = validCriterion.keyToSchemaValidation,
	    vcKeyToInputValidation = validCriterion.keyToInputValidation;

	//------//
	// Main //
	//------//

	var res = {
	  create: getCreateMethods(),
	  validate: getValidateMethods()
	};

	//-------------//
	// Helper Fxns //
	//-------------//

	function getCreateMethods() {
	  return {
	    getInvalidOptKeys: getInvalidOptKeys,
	    getInvalidCriterionByKeys: getInvalidCriterionByKeys,
	    getArgsWithDuplicateFlags: getArgsWithDuplicateFlags,
	    getInvalidPassToArgs: getInvalidPassToArgs,
	    getInvalidPassEachToArgs: getInvalidPassEachToArgs,
	    getInvalidCriterionAndFailedValidationFns: getInvalidCriterionAndFailedValidationFns
	  };

	  // helper fxns
	  function getInvalidOptKeys(VALID_OPT_KEYS, opts) {
	    return fp.flow(fp.keys, fp.without(VALID_OPT_KEYS))(opts);
	  }

	  function getInvalidCriterionByKeys(args) {
	    return fp.flow(fp.mapValues(fp.omit(vcKeys)), fp.pickBy(fp.size))(args);
	  }

	  function getArgsWithDuplicateFlags(args) {
	    var filterDuplicate = fp.flow(count, fp.pickBy(gt(1)), fp.keys);
	    var pickDuplicateFlags = fp.flow(fp.pick('flags'), fp.mapValues(filterDuplicate), fp.pickBy(fp.size));

	    return fp.flow(fp.mapValues(pickDuplicateFlags), fp.pickBy(fp.size))(args);
	  }

	  function getInvalidPassToArgs(args) {
	    var invalidFlags = fp.flow(fp.get('flags'), fp.without(['require', 'isLaden']));
	    var invalidKeys = fp.flow(fp.keys, fp.without(['passTo', 'flags']));
	    var argsToInvalidFlagsAndKeys = function argsToInvalidFlagsAndKeys(val) {
	      if (!fp.has('passTo', val)) return {};

	      return fp.pickBy(fp.size, {
	        invalidFlags: invalidFlags(val),
	        invalidKeys: invalidKeys(val)
	      });
	    };
	    return fp.flow(fp.mapValues(argsToInvalidFlagsAndKeys), fp.pickBy(fp.size))(args);
	  }

	  function getInvalidPassEachToArgs(args) {
	    var validFlags = ['require', 'isLaden'],
	        validKeys = ['flags', 'hasSize'];

	    var invalidFlags = fp.flow(fp.get('flags'), fp.without(validFlags));
	    var invalidKeys = fp.flow(fp.keys, fp.without(fp.concat(['passEachTo'], validKeys)));
	    var argsToInvalidFlagsAndKeys = function argsToInvalidFlagsAndKeys(val) {
	      if (!fp.has('passEachTo', val)) return {};

	      return fp.pickBy(fp.size, {
	        invalidFlags: invalidFlags(val),
	        invalidKeys: invalidKeys(val)
	      });
	    };
	    var invalidArgs = fp.flow(fp.mapValues(argsToInvalidFlagsAndKeys), fp.pickBy(fp.size))(args);

	    return {
	      invalidArgs: invalidArgs,
	      validKeys: validKeys,
	      validFlags: validFlags
	    };
	  }

	  function getInvalidCriterionAndFailedValidationFns(args) {
	    var res = {};
	    var getCriterionValidationAllPass = function getCriterionValidationAllPass(key) {
	      return fp.flow(fp.values, fp.allPass)(vcKeyToSchemaValidation[key]);
	    };
	    var isValidCriterion = function isValidCriterion(val, key) {
	      return getCriterionValidationAllPass(key)(val);
	    };
	    var invalidCriterionToInvalidValidationFns = function invalidCriterionToInvalidValidationFns(aPair) {
	      var key = aPair[0],
	          val = aPair[1];
	      var res = fp.flow(fp.omitBy(function (validationFn) {
	        return validationFn(val);
	      }), fp.keys)(vcKeyToSchemaValidation[key]);
	      return [key, res];
	    };
	    var getFailedValidationFns = function getFailedValidationFns(obj) {
	      return fp.flow(fp.toPairs, fp.map(invalidCriterionToInvalidValidationFns), fp.fromPairs)(obj);
	    };

	    res.invalidCriterion = fp.flow(fp.mapValues(fp.omitBy(isValidCriterion)), fp.pickBy(fp.size))(args);

	    res.failedValidationFns = fp.mapValues(getFailedValidationFns, res.invalidCriterion);

	    return res;
	  }
	}

	function getValidateMethods() {
	  return {
	    getInvalidKeys: getInvalidKeys,
	    getMissingKeys: getMissingKeys,
	    getInvalidCriterionPerArgs: getInvalidCriterionPerArgs
	  };

	  // helper fxns
	  function getMissingKeys(unsafeArgsObj, schema) {
	    var isRequired = fp.flow(fp.get('flags'), fp.contains('require'));
	    var requiredKeys = fp.flow(fp.pickBy(isRequired), fp.keys)(schema);

	    return fp.flow(fp.keys, fp.difference(requiredKeys))(unsafeArgsObj);
	  }

	  function getInvalidCriterionPerArgs(unsafeArgsObj, schemaArgs) {
	    var invalidArgs = fp.omitBy(passesCriterion(schemaArgs), unsafeArgsObj);
	    var invalidCriterionPerArgs = fp.flow(fp.toPairs, fp.reduce(invalidArgsToCriterion(schemaArgs), {}))(invalidArgs);

	    return {
	      hasInvalidArgs: !!fp.size(invalidArgs),
	      invalidArgs: invalidArgs,
	      invalidCriterionPerArgs: invalidCriterionPerArgs
	    };
	  }

	  function getInvalidKeys(unsafeArgsObj, schema) {
	    return fp.flow(fp.keys, fp.without(fp.keys(schema)))(unsafeArgsObj);
	  }
	}

	var getValidationFn = function getValidationFn(argKey, criterionKey, criterionVal) {
	  // passTo and passEachTo need to know the argument key in order to throw a friendly error
	  return fp.includes(criterionKey, ['passTo', 'passEachTo']) ? vcKeyToInputValidation[criterionKey](criterionVal, argKey) : vcKeyToInputValidation[criterionKey](criterionVal);
	};

	var criterionToInputValidationFns = function criterionToInputValidationFns(criterion, argKey) {
	  return fp.flow(fp.toPairs, fp.map(function (pair) {
	    return getValidationFn(argKey, pair[0], pair[1]);
	  }))(criterion);
	};

	var passesCriterion = fp.curry(function (schemaArgs, val, key) {
	  var criterion = schemaArgs[key];
	  var validationFns = criterionToInputValidationFns(criterion, key);
	  return fp.allPass(validationFns)(val);
	});

	var isValidCriterion = fp.curry(function (inputVal, criterionVal, criterionKey) {
	  var validationFn = getValidationFn(null, criterionKey, criterionVal);
	  return validationFn(inputVal);
	});

	var getInvalidCustomCriterion = function getInvalidCustomCriterion(customCriterion, val) {
	  return fp.flow(fp.omitBy(function (criterionFn) {
	    return criterionFn(val);
	  }), fp.keys)(customCriterion);
	};

	var getInvalidFlags = function getInvalidFlags(flags, val) {
	  return fp.reject(function (aFlag) {
	    return flagToValidationFn[aFlag](val);
	  }, flags);
	};

	var getInvalidCriterion = function getInvalidCriterion(schemaArgs, key, val) {
	  var criterion = schemaArgs[key];
	  var res = fp.omitBy(isValidCriterion(val), criterion);

	  // Both custom and flags are basically a nested criterion object which is why
	  //   they need to be handled separately.
	  if (res.custom) {
	    res = fp.set('custom', getInvalidCustomCriterion(res.custom, val), res);
	  }
	  if (res.flags) {
	    res = fp.set('flags', getInvalidFlags(res.flags, val), res);
	  }

	  return res;
	};

	var invalidArgsToCriterion = fp.curry(function (schemaArgs, res, curPair) {
	  return fp.set(curPair[0], getInvalidCriterion(schemaArgs, curPair[0], curPair[1]), res);
	});

	//---------//
	// Exports //
	//---------//

	module.exports = res;

/***/ },
/* 9 */
/*!********************************!*\
  !*** ./lib/valid-criterion.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//
	// README
	// - The initial criterion selection fits no definition, and have been arbitrarily
	//   chosen by me.  Ideally they would be chosen via a data-driven approach
	//   (e.g. votes and/or usage?)
	//

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 2),
	    utils = __webpack_require__(/*! ./utils */ 3),
	    validFlags = __webpack_require__(/*! ./valid-flags */ 10),
	    passToStack = __webpack_require__(/*! ./pass-to-stack */ 7);

	//------//
	// Init //
	//------//

	var allContainedIn = utils.allContainedIn,
	    allStringOrNumber = utils.allStringOrNumber,
	    betweenE = utils.betweenE,
	    betweenI = utils.betweenI,
	    containedIn = utils.containedIn,
	    fv = validFlags.flagToValidationFn,
	    get = utils.get,
	    gt = utils.gt,
	    gte = utils.gte,
	    hasSize = utils.hasSize,
	    instance_of = utils.instance_of,
	    isLadenArray = fv.isLadenArray,
	    isLadenString = fv.isLadenString,
	    isNamedValidatorFn = fp.allPass([fp.isFunction, fp.flow(fp.get('_id'), fp.eq('madonnafp')), fp.flow(fp.get('_name'), isLadenString)]),
	    matchesRegex = utils.matchesRegex,
	    not_instance_of = utils.not_instance_of,
	    not_type_of = utils.not_type_of,
	    lt = utils.lt,
	    lte = utils.lte,
	    outsideE = utils.outsideE,
	    outsideI = utils.outsideI,
	    type_of = utils.type_of,
	    zipToManyObjectsWithKey = utils.zipToManyObjectsWithKey;

	//------//
	// Main //
	//------//

	var criterion = getCriterion(),
	    keys = fp.keys(criterion),
	    keyToSchemaValidation = fp.mapValues('validateSchema', criterion),
	    keyToInputValidation = fp.mapValues('validateInput', criterion);

	//-------------//
	// Helper Fxns //
	//-------------//

	function getCriterion() {
	  var allContainedIn_schemaValidation = {
	    isLadenArray: isLadenArray
	  };
	  var between_schemaValidation = {
	    isArray: fp.isArray,
	    hasSize2: hasSize(2),
	    allStringOrNumber: allStringOrNumber
	  };
	  var custom_schemaValidation = {
	    isLadenPlainObject: fv.isLadenPlainObject,
	    allFunctions: fp.all(fp.isFunction)
	  };
	  var custom_inputValidation = fp.curry(function (customSchemaArgs, dirtyIn) {
	    return fp.allPass(fp.values(customSchemaArgs))(dirtyIn);
	  });
	  var flags_schemaValidation = {
	    isLadenArray: fv.isLadenArray,
	    allStrings: fp.all(fp.isString),
	    allValidFlags: allContainedIn(validFlags.flags)
	  };
	  var flags_inputValidation = fp.curry(function (schemaIn, dirtyIn) {
	    return fp.allPass(fp.map(get(fv), fp.difference(schemaIn, ['require'])))(dirtyIn);
	  });
	  var gtlt_schemaValidation = { isStringOrNumber: fv.isStringOrNumber };
	  var gtlt_inputValidation = fp.curry(function (fn, a, b) {
	    return fp.allPass([allStringOrNumber, fp.spread(fn)])([a, b]);
	  });

	  var hasSize_schemaValidation = {
	    isZeroOrPositiveInteger: fp.allPass([betweenI([0, Infinity]), fp.isInteger])
	  };

	  var matches_schemaValidation = { isRegExp: fp.isRegExp };

	  //
	  // 'passTo' and 'passEachTo' allow for MadonnaFp validators to pass arguments
	  //   into other validators.  Without them, validations and error messages
	  //   would quickly get messy.
	  //
	  // These are also the only input validation functions taking more than two arguments.
	  //   The convention is for the first argument to be the schema value and the
	  //   second the input to be validated.  passTo and passEachTo however need
	  //   the argument key being validated in order to throw friendly errors.  This
	  //   is properly handled in validation-helpers.
	  //
	  var passTo = fp.curry(function (namedValidatorFn, argKey, obj) {
	    var res = fv.isPlainObject(obj);
	    if (!res) return false;

	    try {
	      passToStack.push(argKey + ' (' + namedValidatorFn._name + ')');
	      namedValidatorFn(obj);
	    } catch (err) {
	      // if we haven't already caught an error during a passTo chain, then
	      //   set _caughtPassTo to true and prepend the current passToStack to this
	      //   error's message.
	      if (!err._caughtPassTo) {
	        err._caughtPassTo = true;
	        var passToPath = passToStack.get().join(' -> ');
	        err.message = 'While validating: ' + passToPath + '\n' + err.message;
	      }
	      throw err;
	    } finally {
	      passToStack.pop();
	    }
	    return true;
	  });

	  var passEachTo = fp.curry(function (namedValidatorFn, argKey, arr) {
	    var res = fp.allPass([fp.isArray, fp.all(fp.isPlainObject)])(arr);
	    if (!res) return false;

	    try {
	      passToStack.push(argKey + ' (' + namedValidatorFn._name + ')');
	      fp.each(function (dirtyInput) {
	        namedValidatorFn(dirtyInput);
	      }, arr);
	    } catch (err) {
	      // if we haven't already caught an error during a passTo chain, then
	      //   set _caughtPassTo to true and prepend the current passToStack to this
	      //   error's message.
	      if (!err._caughtPassTo) {
	        err._caughtPassTo = true;
	        var passToPath = passToStack.get().join(' -> ');
	        err.message = 'While validating: ' + passToPath + '\n' + err.message;
	      }
	      throw err;
	    } finally {
	      passToStack.pop();
	    }
	    return true;
	  });

	  return zipToManyObjectsWithKey([['key', 'validateSchema', 'validateInput'], ['allContainedIn', allContainedIn_schemaValidation, allContainedIn], ['betweenE', between_schemaValidation, betweenE], ['betweenI', between_schemaValidation, betweenI], ['containedIn', { isLadenArray: fv.isLadenArray }, containedIn], ['custom', custom_schemaValidation, custom_inputValidation], ['flags', flags_schemaValidation, flags_inputValidation], ['gt', gtlt_schemaValidation, gtlt_inputValidation(gt)], ['gte', gtlt_schemaValidation, gtlt_inputValidation(gte)], ['hasSize', hasSize_schemaValidation, hasSize], ['instance_of', { isFunction: fp.isFunction }, instance_of], ['lt', gtlt_schemaValidation, gtlt_inputValidation(lt)], ['lte', gtlt_schemaValidation, gtlt_inputValidation(lte)], ['matchesRegex', matches_schemaValidation, matchesRegex], ['not_instance_of', { isFunction: fp.isFunction }, not_instance_of], ['not_type_of', { isLadenString: isLadenString }, not_type_of], ['outsideE', between_schemaValidation, outsideE], ['outsideI', between_schemaValidation, outsideI], ['passTo', { isNamedValidatorFn: isNamedValidatorFn }, passTo], ['passEachTo', { isNamedValidatorFn: isNamedValidatorFn }, passEachTo], ['type_of', { isLadenString: isLadenString }, type_of]]);
	}

	//---------//
	// Exports //
	//---------//

	module.exports = {
	  keys: keys,
	  keyToSchemaValidation: keyToSchemaValidation,
	  keyToInputValidation: keyToInputValidation
	};

/***/ },
/* 10 */
/*!****************************!*\
  !*** ./lib/valid-flags.js ***!
  \****************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//---------//
	// Imports //
	//---------//

	var fp = __webpack_require__(/*! lodash/fp */ 2),
	    utils = __webpack_require__(/*! ./utils */ 3);

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

/***/ }
/******/ ]);