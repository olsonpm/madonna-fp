'use strict';


//---------//
// Imports //
//---------//

const common = require('./common')
  , deepFreezeStrict = require('deep-freeze-strict')
  , errorInfo = require('./error-info')
  , fp = require('lodash/fp')
  , validatorFn = require('./validator-fn')
  , utils = require('./utils')
  , validCriterion = require('./valid-criterion')
  , validFlags = require('./valid-flags')
  , vh = require('./validation-helpers');


//------//
// Init //
//------//

const vf = validFlags.flagToValidationFn;

const allContainedIn = utils.allContainedIn
  , createError = common.createError
  , errorPropIdToStringId = errorInfo.propIdToStringId
  , isDefined = vf.isDefined
  , isLadenPlainObject = vf.isLadenPlainObject
  , isLadenString = vf.isLadenString
  , jstring = common.jstring
  , selectCriterionKeysToInputValidation = getSelectCriterionKeysToInputValidation();

const VALID_OPT_KEYS = ['name', 'cb'];

let res;


//------//
// Main //
//------//

function getMadonnaFp() {
  return attachProperties({});
}

function validate(marg, dirtyObj) {
  preliminaryArgsCheckForValidate.apply(null, arguments);
  const validator = createValidatorInternal(marg);
  return (arguments.length === 1)
    ? validator()
    : validator(dirtyObj);
}

function validateSternly(marg, dirtyObj) {
  preliminaryArgsCheckForValidate.apply(null, arguments);
  const validator = createValidatorInternal(marg, true);
  return (arguments.length === 1)
    ? validator()
    : validator(dirtyObj);
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
    throw createError(
      'Invalid Input'
      , errorPropIdToStringId.create.requiresSingleArg
      , "This method requires a single argument\n"
        + "arguments: " + jstring(arguments)
    );
  }
}

function preliminaryArgsCheckForValidate() {
  // The below logic should be shared with valdiate and validateSternly, however
  //   the error messages should be different.  That's why this logic is in two
  //   different spots for now.
  if (!fp.includes(arguments.length, [1, 2])) {
    throw createError(
      'Invalid Input'
      , errorPropIdToStringId.create.oneOrTwoArgs
      , "This method requires one or two arguments\n"
        + "arguments: " + jstring(arguments)
    );
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
  if (isShorthand(marg))
    marg = convertSchemaToLonghand(marg);

  marg.schema = convertCriterionToLonghand(marg.schema);

  // no errors, good to go
  const aValidatorFn = validatorFn(marg, shouldThrow);

  Object.defineProperty(aValidatorFn, '_id', { value: 'madonnafp', enumerable: true });

  // opts.name will either be undefined or isLadenString at this point
  Object.defineProperty(aValidatorFn, '_name', { value: fp.get('opts.name', marg), enumerable: true });

  return aValidatorFn;
}


//-------------//
// Helper Fxns //
//-------------//

function attachProperties(madonnaFp) {
  const createReadOnlyEnumerableProperty = (name, val) => {
    Object.defineProperty(
      madonnaFp
      , name
      , {
        value: val
        , enumerable: true
      }
    );
  };

  fp.flow(
    fp.toPairs
    , fp.each(fp.spread(createReadOnlyEnumerableProperty))
  )({
    ERROR_IDS: deepFreezeStrict(errorPropIdToStringId.validate)
    , CRITERION_FNS: selectCriterionKeysToInputValidation
    , FLAG_FNS: validFlags.flagToValidationFn
    , validate: validate
    , validateSternly: validateSternly
    , identityValidate: validateSternly
    , createValidator: createValidator
    , createSternValidator: createSternValidator
    , createIdentityValidator: createSternValidator
  });

  return madonnaFp;
}

function validateMarg(marg) {
  if (!isLadenPlainObject(marg)) {
    throw createError(
      'Invalid Input'
      , errorPropIdToStringId.create.margNotIsLadenPlainObj
      , "'marg' must pass 'isLadenPlainObject'\n"
        + "marg: " + jstring(marg)
    );
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
      throw createError(
        'Invalid Input'
        , errorPropIdToStringId.create.optsNotIsPlainObject
        , "'opts' must pass 'fp.isPlainObject'\n"
          + "type of opts: " + typeof marg.opts + "\n"
          + "opts: " + jstring(marg.opts)
      );
    }

    const invalidOptKeys = vh.create.getInvalidOptKeys(VALID_OPT_KEYS, marg.opts);
    if (invalidOptKeys.length) {
      throw createError(
        'Invalid Input'
        , errorPropIdToStringId.create.hasInvalidOptKeys
        , "'opts' has invalid keys'\n"
          + "invalid keys: " + invalidOptKeys.join(', ') + "\n"
          + "keys allowed: " + VALID_OPT_KEYS.join(', ')
      );
    }

    // When defined, name must pass isLadenString
    if (isDefined(marg.opts.name) && !isLadenString(marg.opts.name)) {
      throw createError(
        'Invalid Input'
        , errorPropIdToStringId.create.nameNotIsLadenString
        , "'opts.name' must pass 'isLadenString'\n"
          + "type of name: " + typeof marg.opts.name + "\n"
          + "name: " + jstring(marg.opts.name)
      );
    }

    // When defined, cb must pass isFunction
    if (isDefined(marg.opts.cb) && !fp.isFunction(marg.opts.cb)) {
      throw createError(
        'Invalid Input'
        , errorPropIdToStringId.create.cbNotIsFunction
        , "'opts.cb' must pass 'fp.isFunction'\n"
          + "type of cb: " + typeof marg.opts.cb + "\n"
          + "cb: " + jstring(marg.opts.cb)
      );
    }

    // Schema must pass isLadenPlainObject
    if (!isLadenPlainObject(marg.schema)) {
      throw createError(
        'Invalid Input'
        , errorPropIdToStringId.create.schemaNotIsLadenPlainObject
        , "Invalid Input", "'marg.schema' must pass 'isLadenPlainObject'\n"
          + "marg: " + jstring(marg)
      );
    }
  }

  let schema = marg.schema;

  if (!fp.size(schema)) {
    throw createError(
      'Invalid Input'
      , errorPropIdToStringId.create.schemaIsEmpty
      , "'schema' must contain at least one property\n"
        + "marg: " + jstring(marg)
    );
  }

  // This library allows criterion to be either a succinct 'common use-case' array
  //   filled with flags, or a more verbose and customizable object
  let invalidArgs = fp.omitBy(fp.anyPass([fp.isPlainObject, fp.isArray]), schema);
  if (fp.size(invalidArgs)) {
    throw createError(
      'Invalid Input'
      , errorPropIdToStringId.create.criterionMustBeIsPlainObjectOrIsArray
      , "'schema' values must all pass either "
        + "'fp.isPlainObject' or 'fp.isArray'\n"
        + "invalid args: " + jstring(invalidArgs)
    );
  }


  // In the case the array form is used, let's sanitize it to the verbose form.
  //   This simplifies parsing logic
  schema = convertCriterionToLonghand(schema);


  invalidArgs = vh.create.getInvalidCriterionByKeys(schema);
  if (fp.size(invalidArgs)) {
    throw createError(
      'Invalid Input'
      , errorPropIdToStringId.create.invalidCriterionKeys
      , "Invalid Input", "criterion must all have keys contained in valid-criterion\n"
        + "invalid criterion per schema marg: " + jstring(invalidArgs)
    );
  }


  invalidArgs = vh.create.getArgsWithDuplicateFlags(schema);
  if (fp.size(invalidArgs)) {
    throw createError(
      'Invalid Input'
      , errorPropIdToStringId.create.noDuplicateFlags
      , "There cannot be duplicate flags\n"
        + "args with duplicate flags: " + jstring(invalidArgs)
    );
  }


  //
  // logic to take care of invalid sibling arguments
  //
  const invalidPassToArgs = vh.create.getInvalidPassToArgs(schema);
  if (fp.size(invalidPassToArgs)) {
    throw createError(
      'Invalid Input'
      , errorPropIdToStringId.create.strictPassTo
      , "All criterion beyond the 'require' and 'isLaden' flags must be done "
        + "in the passTo validator function\n"
        + "invalid args: " + jstring(invalidPassToArgs)
    );
  }

  res = vh.create.getInvalidPassEachToArgs(schema);
  if (fp.size(res.invalidArgs)) {
    throw createError(
      'Invalid Input'
      , errorPropIdToStringId.create.strictPassEachTo
      , "Invalid Input", "Only certain criterion are allowed alongside passEachTo\n"
        + "invalid args: " + jstring(res.invalidArgs) + "\n"
        + "allowed keys: " + jstring(res.validKeys) + "\n"
        + "allowed flags: " + jstring(res.validFlags)
    );
  }
  //
  // end of invalid sibling marg logic
  //


  res = vh.create.getInvalidCriterionAndFailedValidationFns(schema);
  if (fp.size(res.invalidCriterion)) {
    throw createError(
      'Invalid Input'
      , errorPropIdToStringId.create.invalidCriterion
      , "criterion must all have values which pass "
        + "their respective validation functions\n"
        + "invalid criterion: " + jstring(res.invalidCriterion) + "\n"
        + "failed validation functions: " + jstring(res.failedValidationFns)
    );
  }
}

function getSelectCriterionKeysToInputValidation() {
  return fp.omit([
      'custom'
      , 'flags'
      , 'passTo'
      , 'passEachTo'
    ]
    , validCriterion.keyToInputValidation
  );
}

function isShorthand(marg) {
  return !(
    fp.has('schema', marg)
    && allContainedIn(['schema', 'opts'], fp.keys(marg))
  );
}

function convertSchemaToLonghand(schema) {
  return { schema: schema, opts: {} };
}

function convertCriterionToLonghand(schema) {
  const sanitizer = val => (fp.isArray(val))
    ? { flags: val }
    : val;

  return fp.mapValues(sanitizer, schema);
}

//---------//
// Exports //
//---------//

module.exports = getMadonnaFp();
