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

const fp = require('lodash/fp')
  , utils = require('./utils');


//------//
// Init //
//------//

const mapValuesWithKey = utils.mapValuesWithKey
  , zipToManyObjectsWithKey = utils.zipToManyObjectsWithKey;


//------//
// Main //
//------//

const errorInfo = {
  create: getCreateInfo()
  , validate: getValidateInfo()
};

const propIdToStringId = mapPropIdToStringId(errorInfo);
const propIdToDataKeys = mapPropIdToDataKeys(errorInfo);


//-------------//
// Helper Fxns //
//-------------//

function getCreateInfo() {
  return zipToManyObjectsWithKey([
    ['key', 'stringId']
    , ['requiresSingleArg', 'requires-single-arg']
    , ['oneOrTwoArgs', 'one-or-two-args']
    , ['margNotIsLadenPlainObj', 'marg-not-isLadenPlainObject']
    , ['optsNotIsPlainObject', 'opts-not-isPlainObject']
    , ['hasInvalidOptKeys', 'has-invalid-opts']
    , ['nameNotIsLadenString', 'name-not-isLadenString']
    , ['cbNotIsFunction', 'cb-not-is-function']
    , ['schemaNotIsLadenPlainObject', 'schema-not-isLadenPlainObject']
    , ['criterionMustBeIsPlainObjectOrIsArray', 'criterion-must-be-isPlainObject-or-isArray']
    , ['invalidCriterionKeys', 'invalid-criterion-keys']
    , ['noDuplicateFlags', 'no-duplicate-flags']
    , ['strictPassTo', 'strict-pass-to']
    , ['strictPassEachTo', 'strict-pass-each-to']
    , ['invalidCriterion', 'invalid-criterion']
  ]);
}

function getValidateInfo() {
  return zipToManyObjectsWithKey([
    ['key', 'stringId', 'dataKeys']
    , ['atMostOneArgument', 'at-most-one-argument', ['argsLength', 'args']]
    , ['argNotIsPlainObject', 'arg-not-isPlainObject', ['type_of', 'arg']]
    , ['invalidArgKeys', 'invalid-arg-keys', ['invalidKeys', 'keysAllowed']]
    , ['missingRequiredKeys', 'missing-required-keys', ['keysMissing', 'passedArgs']]
    , ['criterionFailed', 'criterion-failed', ['invalidArgs', 'failedCriterion']]
  ]);
}

function mapPropIdToStringId(errorInfo) {
  return mapValuesWithKey(
    (val, key) => fp.mapValues(innerVal => key + '_' + innerVal.stringId, val)
    , errorInfo
  );
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
  propIdToStringId: propIdToStringId
  , propIdToDataKeys: propIdToDataKeys
};
