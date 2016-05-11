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

const fp = require('lodash/fp')
  , utils = require('./utils')
  , validFlags = require('./valid-flags')
  , passToStack = require('./pass-to-stack');


//------//
// Init //
//------//

const allContainedIn = utils.allContainedIn
  , allStringOrNumber = utils.allStringOrNumber
  , betweenE = utils.betweenE
  , betweenI = utils.betweenI
  , containedIn = utils.containedIn
  , fv = validFlags.flagToValidationFn
  , get = utils.get
  , gt = utils.gt
  , gte = utils.gte
  , hasSize = utils.hasSize
  , instance_of = utils.instance_of
  , isLadenArray = fv.isLadenArray
  , isLadenString = fv.isLadenString
  , isNamedValidatorFn = fp.allPass([
      fp.isFunction
      , fp.flow(
        fp.get('_id')
        , fp.eq('madonnafp')
      ), fp.flow(
        fp.get('_name')
        , isLadenString
      )
    ])
  , matchesRegex = utils.matchesRegex
  , not_instance_of = utils.not_instance_of
  , not_type_of = utils.not_type_of
  , lt = utils.lt
  , lte = utils.lte
  , outsideE = utils.outsideE
  , outsideI = utils.outsideI
  , type_of = utils.type_of
  , zipToManyObjectsWithKey = utils.zipToManyObjectsWithKey;


//------//
// Main //
//------//

const criterion = getCriterion()
  , keys = fp.keys(criterion)
  , keyToSchemaValidation = fp.mapValues('validateSchema', criterion)
  , keyToInputValidation = fp.mapValues('validateInput', criterion);


//-------------//
// Helper Fxns //
//-------------//

function getCriterion() {
  const allContainedIn_schemaValidation = {
    isLadenArray: isLadenArray
  };
  const between_schemaValidation = {
    isArray: fp.isArray
    , hasSize2: hasSize(2)
    , allStringOrNumber: allStringOrNumber
  };
  const custom_schemaValidation = {
    isLadenPlainObject: fv.isLadenPlainObject
    , allFunctions: fp.all(fp.isFunction)
  };
  const custom_inputValidation = fp.curry(
    (customSchemaArgs, dirtyIn) => fp.allPass(fp.values(customSchemaArgs))(dirtyIn)
  );
  const flags_schemaValidation = {
    isLadenArray: fv.isLadenArray
    , allStrings: fp.all(fp.isString)
    , allValidFlags: allContainedIn(validFlags.flags)
  };
  const flags_inputValidation = fp.curry(
    (schemaIn, dirtyIn) => fp.allPass(
      fp.map(get(fv), fp.difference(schemaIn, ['require']))
    )(dirtyIn)
  );
  const gtlt_schemaValidation = { isStringOrNumber: fv.isStringOrNumber };
  const gtlt_inputValidation = fp.curry(
    (fn, a, b) => fp.allPass([
      allStringOrNumber
      , fp.spread(fn)
    ])([a, b])
  );

  const hasSize_schemaValidation = {
    isZeroOrPositiveInteger: fp.allPass([
      betweenI([0, Infinity])
      , fp.isInteger
    ])
  };

  const matches_schemaValidation = { isRegExp: fp.isRegExp };

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
  const passTo = fp.curry(
    (namedValidatorFn, argKey, obj) => {
      let res = fv.isPlainObject(obj);
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
          const passToPath = passToStack.get().join(' -> ');
          err.message = 'While validating: ' + passToPath + '\n' + err.message;
        }
        throw err;
      } finally {
        passToStack.pop();
      }
      return true;
    }
  );

  const passEachTo = fp.curry(
    (namedValidatorFn, argKey, arr) => {
      let res = fp.allPass([
        fp.isArray
        , fp.all(fp.isPlainObject)
      ])(arr);
      if (!res) return false;

      try {
        passToStack.push(argKey + ' (' + namedValidatorFn._name + ')');
        fp.each(dirtyInput => { namedValidatorFn(dirtyInput); }, arr);
      } catch(err) {
        // if we haven't already caught an error during a passTo chain, then
        //   set _caughtPassTo to true and prepend the current passToStack to this
        //   error's message.
        if (!err._caughtPassTo) {
          err._caughtPassTo = true;
          const passToPath = passToStack.get().join(' -> ');
          err.message = 'While validating: ' + passToPath + '\n' + err.message;
        }
        throw err;
      } finally {
        passToStack.pop();
      }
      return true;
    }
  );

  return zipToManyObjectsWithKey([
    ['key', 'validateSchema', 'validateInput']
    , ['allContainedIn', allContainedIn_schemaValidation, allContainedIn]
    , ['betweenE', between_schemaValidation, betweenE]
    , ['betweenI', between_schemaValidation, betweenI]
    , ['containedIn', { isLadenArray: fv.isLadenArray }, containedIn]
    , ['custom', custom_schemaValidation, custom_inputValidation]
    , ['flags', flags_schemaValidation, flags_inputValidation]
    , ['gt', gtlt_schemaValidation, gtlt_inputValidation(gt)]
    , ['gte', gtlt_schemaValidation, gtlt_inputValidation(gte)]
    , ['hasSize', hasSize_schemaValidation, hasSize]
    , ['instance_of', { isFunction: fp.isFunction }, instance_of]
    , ['lt', gtlt_schemaValidation, gtlt_inputValidation(lt)]
    , ['lte', gtlt_schemaValidation, gtlt_inputValidation(lte)]
    , ['matchesRegex', matches_schemaValidation, matchesRegex]
    , ['not_instance_of', { isFunction: fp.isFunction }, not_instance_of]
    , ['not_type_of', { isLadenString: isLadenString }, not_type_of]
    , ['outsideE', between_schemaValidation, outsideE]
    , ['outsideI', between_schemaValidation, outsideI]
    , ['passTo', { isNamedValidatorFn: isNamedValidatorFn }, passTo]
    , ['passEachTo', { isNamedValidatorFn: isNamedValidatorFn }, passEachTo]
    , ['type_of', { isLadenString: isLadenString }, type_of]
  ]);
}


//---------//
// Exports //
//---------//

module.exports = {
  keys: keys
  , keyToSchemaValidation: keyToSchemaValidation
  , keyToInputValidation: keyToInputValidation
};
