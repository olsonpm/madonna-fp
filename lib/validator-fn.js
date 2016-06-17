'use strict';


//---------//
// Imports //
//---------//

const common = require ('./common')
  , fp = require('lodash/fp')
  , errorInfo = require('./error-info')
  , passToStack = require('./pass-to-stack')
  , utils = require('./utils')
  , vh = require('./validation-helpers');


//------//
// Init //
//------//

const containedIn = utils.containedIn
  , createError = common.createError
  , jstring = common.jstring
  , errorPropIdToStringId = errorInfo.propIdToStringId;


//------//
// Main //
//------//

const validatorFn = getValidatorFn();


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
  return ({ schema, opts = {} }, shouldThrow) => function(unsafeArgsObj) {
    let res = {
      isValid: false
    };

    // Step 1
    //  - ensure either zero or one arguments were passed
    if (!containedIn([0, 1], arguments.length)) {
      return orThrow(
        createError(
          'Invalid Input'
          , errorPropIdToStringId.validate.atMostOneArgument
          , "This method requires at most one argument\n"
            + `arguments.length: ${arguments.length}\n`
            + 'arguments: ' + jstring(arguments)
          , {
            argsLength: arguments.length
            , args: fp.clone(arguments)
          }
        )
      );
    }

    // Step 2
    //  - if unsafeArgsObj was given, ensure it passes fp.isPlainObject
    if (arguments.length && !fp.isPlainObject(unsafeArgsObj)) {
      return orThrow(
        createError(
          'Invalid Input'
          , errorPropIdToStringId.validate.argNotIsPlainObject
          , "This method requires the argument to pass 'fp.isPlainObject'\n"
            + "typeof resolves to: " + typeof unsafeArgsObj + "\n"
            + "argument: " + jstring(unsafeArgsObj)
          , {
            type_of: typeof unsafeArgsObj
            , arg: unsafeArgsObj
          }
        )
      );
    }


    // Step 3
    //  - ensure unsafeArgsObj passes valid arguments
    const invalidKeys = vh.validate.getInvalidKeys(unsafeArgsObj, schema);
    if (invalidKeys.length) {
      const validKeys = fp.keys(schema);
      return orThrow(
        createError(
          'Invalid Input'
          , errorPropIdToStringId.validate.invalidArgKeys
          , "Invalid argument keys were passed\n"
            + "invalid keys: " + invalidKeys.join(', ') + "\n"
            + "allowed keys: " + validKeys.join(', ')
          , {
            invalidKeys: invalidKeys
            , keysAllowed: validKeys
          }
        )
      );
    }

    // Step 4
    //  - ensure unsafeArgsObj passes all required arguments
    const keysMissing = vh.validate.getMissingKeys(unsafeArgsObj, schema);
    if (keysMissing.length) {
      return orThrow(
        createError(
          'Invalid Input'
          , errorPropIdToStringId.validate.missingRequiredKeys
          , "Not all required keys were passed\n"
            + "missing keys: " + keysMissing.join(', ') + "\n"
            + "args passed: " + jstring(unsafeArgsObj)
          , {
            keysMissing: keysMissing
            , passedArgs: unsafeArgsObj
          }
        )
      );
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
        return orThrow(
          createError(
            'Invalid Input'
            , errorPropIdToStringId.validate.criterionFailed
            , "The following arguments didn't pass their criterion\n"
              + "invalid arguments and values: " + jstring(res.invalidArgs) + "\n"
              + "failed criterion per argument: " + jstring(res.invalidCriterionPerArgs)
            , {
              invalidArgs: res.invalidArgs
              , failedCriterion: res.invalidCriterionPerArgs
            }
          )
        );
      }
    } catch (_err) {
      // if we're in a passTo chain, then rethrow
      if (passToStack.getSize()) throw _err;

      // if we didn't catch an error resulting from a passTo chain, return or
      //   throw _err
      if (!_err._caughtPassTo) return orThrow(_err);

      // otherwise create a new error so the consumer is presented with a
      //   useful stacktrace.
      return orThrow(
        createError(
          _err.name
          , _err.id
          , _err.message
          , _err.data
        )
      );
    }


    // SUCCESS

    if (opts.cb) {
      const cbRes = opts.cb(unsafeArgsObj);
      res = (shouldThrow)
        ? unsafeArgsObj
        : cbRes;
    } else {
      // if shouldThrow is true, then a result is pointless because it is implied
      //   via the error not being thrown.  By returning the arguments object,
      //   we allow the library to be used in a more functional manner.
      res = (shouldThrow)
        ? unsafeArgsObj // unsafeArgsObj is actually safe at this point!
        : { isValid: true };
    }

    return res;


    // helper fxns
    function orThrow(err) {
      // we need to throw if we're in a passTo chain since it's the only way
      //   the error data will propagate down
      if (shouldThrow || passToStack.getSize()) throw err;

      return {
        isValid: false
        , err: err
      };
    }
  };
}


//---------//
// Exports //
//---------//

module.exports = validatorFn;
