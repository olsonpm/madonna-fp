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

const fp = require('lodash/fp')
  , validCriterion = require('./valid-criterion')
  , validFlags = require('./valid-flags')
  , utils = require('./utils');


//------//
// Init //
//------//

const vcKeys = validCriterion.keys
  , count = utils.count
  , flagToValidationFn = validFlags.flagToValidationFn
  , gt = utils.gt
  , vcKeyToSchemaValidation = validCriterion.keyToSchemaValidation
  , vcKeyToInputValidation = validCriterion.keyToInputValidation;


//------//
// Main //
//------//

const res = {
  create: getCreateMethods()
  , validate: getValidateMethods()
};


//-------------//
// Helper Fxns //
//-------------//

function getCreateMethods() {
  return {
    getInvalidOptKeys: getInvalidOptKeys
    , getInvalidCriterionByKeys: getInvalidCriterionByKeys
    , getArgsWithDuplicateFlags: getArgsWithDuplicateFlags
    , getInvalidPassToArgs: getInvalidPassToArgs
    , getInvalidPassEachToArgs: getInvalidPassEachToArgs
    , getInvalidCriterionAndFailedValidationFns: getInvalidCriterionAndFailedValidationFns
  };

  // helper fxns
  function getInvalidOptKeys(VALID_OPT_KEYS, opts) {
    return fp.flow(
      fp.keys
      , fp.without(VALID_OPT_KEYS)
    )(opts);
  }

  function getInvalidCriterionByKeys(args) {
    return fp.flow(
      fp.mapValues(fp.omit(vcKeys))
      , fp.pickBy(fp.size)
    )(args);
  }

  function getArgsWithDuplicateFlags(args) {
    const filterDuplicate = fp.flow(
      count
      , fp.pickBy(gt(1))
      , fp.keys
    );
    const pickDuplicateFlags = fp.flow(
      fp.pick('flags')
      , fp.mapValues(filterDuplicate)
      , fp.pickBy(fp.size)
    );

    return fp.flow(
      fp.mapValues(pickDuplicateFlags)
      , fp.pickBy(fp.size)
    )(args);
  }

  function getInvalidPassToArgs(args) {
    const invalidFlags = fp.flow(
      fp.get('flags')
      , fp.without(['require', 'isLaden'])
    );
    const invalidKeys = fp.flow(
      fp.keys
      , fp.without(['passTo', 'flags'])
    );
    const argsToInvalidFlagsAndKeys = val => {
      if (!fp.has('passTo', val)) return {};

      return fp.pickBy(fp.size, {
        invalidFlags: invalidFlags(val)
        , invalidKeys: invalidKeys(val)
      });
    };
    return fp.flow(
      fp.mapValues(argsToInvalidFlagsAndKeys)
      , fp.pickBy(fp.size)
    )(args);
  }

  function getInvalidPassEachToArgs(args) {
    const validFlags = ['require', 'isLaden']
      , validKeys = ['flags', 'hasSize'];

    const invalidFlags = fp.flow(
      fp.get('flags')
      , fp.without(validFlags)
    );
    const invalidKeys = fp.flow(
      fp.keys
      , fp.without(fp.concat(['passEachTo'], validKeys))
    );
    const argsToInvalidFlagsAndKeys = val => {
      if (!fp.has('passEachTo', val)) return {};

      return fp.pickBy(fp.size, {
        invalidFlags: invalidFlags(val)
        , invalidKeys: invalidKeys(val)
      });
    };
    const invalidArgs = fp.flow(
      fp.mapValues(argsToInvalidFlagsAndKeys)
      , fp.pickBy(fp.size)
    )(args);

    return {
      invalidArgs: invalidArgs
      , validKeys: validKeys
      , validFlags: validFlags
    };
  }

  function getInvalidCriterionAndFailedValidationFns(args) {
    let res = {};
    const getCriterionValidationAllPass = key => {
      return fp.flow(
        fp.values
        , fp.allPass
      )(vcKeyToSchemaValidation[key]);
    };
    const isValidCriterion = (val, key) => getCriterionValidationAllPass(key)(val);
    const invalidCriterionToInvalidValidationFns = aPair => {
      const key = aPair[0]
        , val = aPair[1];
      const res = fp.flow(
        fp.omitBy(validationFn => validationFn(val))
        , fp.keys
      )(vcKeyToSchemaValidation[key]);
      return [key, res];
    };
    const getFailedValidationFns = obj => {
      return fp.flow(
        fp.toPairs
        , fp.map(invalidCriterionToInvalidValidationFns)
        , fp.fromPairs
      )(obj);
    };

    res.invalidCriterion = fp.flow(
      fp.mapValues(
        fp.omitBy(isValidCriterion)
      )
      , fp.pickBy(fp.size)
    )(args);

    res.failedValidationFns = fp.mapValues(getFailedValidationFns, res.invalidCriterion);

    return res;
  }
}

function getValidateMethods() {
  return {
    getInvalidKeys: getInvalidKeys
    , getMissingKeys: getMissingKeys
    , getInvalidCriterionPerArgs: getInvalidCriterionPerArgs
  };

  // helper fxns
  function getMissingKeys(unsafeArgsObj, schema) {
    const isRequired = fp.flow(
      fp.get('flags')
      , fp.contains('require')
    );
    const requiredKeys = fp.flow(
      fp.pickBy(isRequired)
      , fp.keys
    )(schema);

    return fp.flow(
      fp.keys
      , fp.difference(requiredKeys)
    )(unsafeArgsObj);
  }

  function getInvalidCriterionPerArgs(unsafeArgsObj, schemaArgs) {
    var invalidArgs = fp.omitBy(passesCriterion(schemaArgs), unsafeArgsObj);
    var invalidCriterionPerArgs = fp.flow(
      fp.toPairs
      , fp.reduce(
        invalidArgsToCriterion(schemaArgs)
        , {}
      )
    )(invalidArgs);

    return {
      hasInvalidArgs: !!fp.size(invalidArgs)
      , invalidArgs: invalidArgs
      , invalidCriterionPerArgs: invalidCriterionPerArgs
    };
  }

  function getInvalidKeys(unsafeArgsObj, schema) {
    return fp.flow(
      fp.keys
      , fp.without(fp.keys(schema))
    )(unsafeArgsObj);
  }
}

const getValidationFn = (argKey, criterionKey, criterionVal) => {
  // passTo and passEachTo need to know the argument key in order to throw a friendly error
  return (fp.includes(criterionKey, ['passTo', 'passEachTo']))
    ? vcKeyToInputValidation[criterionKey](criterionVal, argKey)
    : vcKeyToInputValidation[criterionKey](criterionVal);
};

const criterionToInputValidationFns = (criterion, argKey) => fp.flow(
  fp.toPairs
  , fp.map(pair => getValidationFn(argKey, pair[0], pair[1]))
)(criterion);

const passesCriterion = fp.curry((schemaArgs, val, key) => {
  const criterion = schemaArgs[key];
  const validationFns = criterionToInputValidationFns(criterion, key);
  return fp.allPass(
    validationFns
  )(val);
});

const isValidCriterion = fp.curry((inputVal, criterionVal, criterionKey) => {
  const validationFn = getValidationFn(null, criterionKey, criterionVal);
  return validationFn(inputVal);
});

const getInvalidCustomCriterion = (customCriterion, val) => {
  return fp.flow(
    fp.omitBy(criterionFn => criterionFn(val))
    , fp.keys
  )(customCriterion);
};

const getInvalidFlags = (flags, val) => {
  return fp.reject(
    aFlag => flagToValidationFn[aFlag](val)
    , flags
  );
};

const getInvalidCriterion = (schemaArgs, key, val) => {
  const criterion = schemaArgs[key];
  let res = fp.omitBy(isValidCriterion(val), criterion);

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

const invalidArgsToCriterion = fp.curry((schemaArgs, res, curPair) => {
  return fp.set(
    curPair[0]
    , getInvalidCriterion(schemaArgs, curPair[0], curPair[1])
    , res
  );
});


//---------//
// Exports //
//---------//

module.exports = res;
