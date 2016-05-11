'use strict';


//---------//
// Imports //
//---------//

const chai = require('chai')
  , madonna = require('../lib')
  , fp = require('lodash/fp')
  , errorInfo = require('../lib/error-info')
  , utils = require('../lib/utils')
  , validFlags = require('../lib/valid-flags');


//------//
// Init //
//------//

chai.should();

const vf = validFlags.flagToValidationFn;

const cv = madonna.createValidator
  , errorPropIdToStringId = errorInfo.propIdToStringId
  , errorPropIdToDataKeys = errorInfo.propIdToDataKeys
  , isDefined = vf.isDefined
  , mutableAssign = utils.mutableAssign;


//------//
// Main //
//------//

describe('createValidator', () => {
  it('should require a single argument'
    , createTestCvError('requiresSingleArg')
  );
  it("should require 'arg' to pass 'isLadenPlainObj'"
    , createTestCvError(
      'margNotIsLadenPlainObj'
      , 'notAPlainObject'
    )
  );
  it("should require opts to pass 'fp.isPlainObject'"
    , createTestCvError(
      'optsNotIsPlainObject'
      , { schema: {}, opts: 'fail' }
    )
  );
  it("should only allow the opts keys 'name', 'cb'"
    , createTestCvError(
      'hasInvalidOptKeys'
      , {
        schema: {}
        , opts: {
          name: 'test'
          , cb: fp.noop
          , incorrect: 'fail'
        }
      }
    )
  );
  it("should require 'opts.name' to pass 'isLadenString'"
    , createTestCvError(
      'nameNotIsLadenString'
      , {
        schema: {}
        , opts: {
          name: ''
        }
      }
    )
  );

  it("should require 'opts.cb' to pass 'fp.isFunction'"
    , createTestCvError(
      'cbNotIsFunction'
      , {
        schema: {}
        , opts: {
          cb: 'fail'
        }
      }
    )
  );

  it("should require 'arg.schema' to pass 'isLadenPlainObject'"
    , createTestCvError(
      'schemaNotIsLadenPlainObject'
      , { schema: 'fail' }
    )
  );

  it("should require all criterion to pass either 'fp.isPlainObject' or 'fp.isArray'"
    , createTestCvError(
      'criterionMustBeIsPlainObjectOrIsArray'
      , { arg1: '' }
    )
  );

  it("should require criterion to contain valid keys"
    , createTestCvError(
      'invalidCriterionKeys'
      , {
        arg1: {
          invalidKey: ''
        }
      }
    )
  );

  it("should not allow duplicate flags"
    , createTestCvError(
      'noDuplicateFlags'
      , {
        arg1: {
          flags: ['require', 'isBoolean', 'require']
        }
      }
    )
  );

  it("passTo should disallow the any keys besides 'flags', and any flags besides 'require'", () => {
    const validateId = cv({
      schema: {
        id: ['require', 'isFinite']
      }
      , opts: { name: 'validateId' }
    });
    let schema = {
      objWithId: {
        flags: ['require']
        , passTo: validateId
      }
    };
    cv.bind(null, schema).should.not.throw(Error);

    schema.objWithId.flags.push('isLadenPlainObject');

    testCvError('strictPassTo', schema);

    mutableAssign(schema.objWithId, {
      flags: ['require']
      , hasSize: 2
    });

    testCvError('strictPassTo', schema);
  });

  it("passEachTo should only allow certain arguments", () => {
    // Below are success and error cases for both flags non-flag criterion

    const validateId = cv({
      schema: {
        id: ['require', 'isFinite']
      }
      , opts: {
        name: 'validateId'
      }
    });
    let schema = {
      objWithId: {
        flags: ['require', 'isLaden']
        , passEachTo: validateId
      }
    };
    cv.bind(null, schema).should.not.throw(Error);

    mutableAssign(schema.objWithId, {
      flags: ['require']
      , hasSize: 2
    });

    cv.bind(null, schema).should.not.throw(Error);

    schema.objWithId.flags.push('isLadenObject');

    testCvError('strictPassEachTo', schema);

    mutableAssign(schema.objWithId, {
      flags: ['require']
      , type_of: 'object'
    });

    testCvError('strictPassEachTo', schema);
  });

  it("should require criterion values to pass their respective validation functions"
    , createTestCvError(
      'invalidCriterion'
      , {
        name: {
          flags: ['incorrect']
        }
      }
    )
  );
});

describe('createSternValidator', () => {
  let nameValidator = madonna.createSternValidator({ name: ['require', 'isLadenString'] });
  it('should throw an error upon invalid arguments', () => {
    nameValidator.bind().should.throw(Error);
  });
  it('should return the validated arguments', () => {
    nameValidator({ name: 'phil' }).should.deep.equal({ name: 'phil' });
  });
  it("should have alias 'createIdentityValidator'", () => {
    madonna.createSternValidator.should.equal(madonna.createIdentityValidator);
  });
});

describe('validate', () => {
  it('should return the correct validation error', () => {
    madonna.validate({ name: ['require', 'isLadenString'] })
      .err.id.should.equal(errorPropIdToStringId.validate.missingRequiredKeys);
  });
  it('should return the correct result object', () => {
    madonna.validate({ name: ['require', 'isLadenString'] }, { name: 'phil' })
      .should.deep.equal({ isValid: true });
  });
});

describe('validateSternly', () => {
  it('should throw the correct validation error', () => {
    let err;
    try { madonna.validateSternly({ name: ['require', 'isLadenString'] }); }
    catch (e) { err = e; }
    err.id.should.equal(errorPropIdToStringId.validate.missingRequiredKeys);
  });
  it('should return the validated object', () => {
    madonna.validateSternly({ name: ['require', 'isLadenString'] }, { name: 'phil' })
      .should.deep.equal({ name: 'phil' });
  });
  it("should have alias 'identityValidate'", () => {
    madonna.validateSternly.should.equal(madonna.identityValidate);
  });
});

describe('apply validator', () => {
  it("should require at most one argument", () => {
    testAvError(
      'atMostOneArgument'
      , { name: ['require'] }
      , ''
      , ''
    );
  });

  it("should require the argument to pass 'fp.isPlainObject'"
    , createTestAvError(
      'argNotIsPlainObject'
      , { name: ['require'] }
      , ''
    )
  );

  it("should require valid argument keys"
    , createTestAvError(
      'invalidArgKeys'
      , { name: ['require'] }
      , { invalid: '' }
    )
  );

  it("should require 'require' argument keys"
    , createTestAvError(
      'missingRequiredKeys'
      , { name: ['require'] }
    )
  );

  it("should require argument values to pass criterion"
    , createTestAvError(
      'criterionFailed'
      , {
        name: {
          type_of: 'string'
        }
      }
      , { name: 1 }
    )
  );

  it("should validate negated criterion", () => {
    const schema = {
      name: {
        not_type_of: 'boolean'
      }
    };

    cv(schema).bind(null, { name: 'phil' }).should.not.throw(Error);

    testAvError(
      'criterionFailed'
      , schema
      , { name: true }
    );
  });

  it("should validate nested passTo's", () => {
    const vCard = cv({
      schema: {
        suit: {
          flags: ['require']
          , containedIn: ['spade', 'heart', 'diamond', 'club']
        }
        , rank: {
          flags: ['require']
          , containedIn: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        }
      }
      , opts: {
        name: 'vCard'
      }
    });
    const vModifiedDeck = cv({
      schema: {
        name: ['isLadenString']
        , cards: {
          flags: ['require', 'isLaden']
          , passEachTo: vCard
        }
      }
      , opts: {
        name: 'vModifiedDeck'
      }
    });

    const vGameSchema = {
      numberOfDice: {
        flags: ['isFinite']
      }
      , modifiedDeck: {
        flags: ['require']
        , passTo: vModifiedDeck
      }
    };
    const validateGame = cv(vGameSchema);

    let dirtyArgs = {
      modifiedDeck: {
        cards: [
          {
            suit: 'heart'
            , rank: '2'
          }, {
            suit: 'heart'
            , rank: '3'
          }
        ]
      }
    };
    validateGame.bind(null, dirtyArgs).should.not.throw(Error);

    dirtyArgs.modifiedDeck.cards.push([{ suit: 'hearts', rank: '4' }]);

    testAvError(
      'criterionFailed'
      , vGameSchema
      , dirtyArgs
    );
  });
});

describe('options', () => {
  it("'cb' should behave appropriately", () => {
    // if name or age exists, then they both must exist
    const validatePerson = cv({
      schema: {
        name: ['isLadenString']
        , age: { betweenI: [0, 120] }
      },
      opts: {
        cb: person => {
          if (isDefined(person.name) !== isDefined(person.age)) {
            return {
              isValid: false
              , err: new Error("If name or age is passed, then they both must"
                + " be passed")
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
  let err
    , errId = errorPropIdToStringId.create[errPropId];

  try {
    if (fp.isUndefined(arg))
      cv.call(null);
    else
      cv(arg);
  }
  catch(e) { err = e; }
  // if error exists but not id, then the library caused an uncaught exception
  //   and we should throw it
  if (err && !err.id) throw err;

  err.id.should.equal(errId);
}

function testAvError(errPropId, cvArg, unsafeArg, testSecondArg) {
  let res
    , errId = errorPropIdToStringId.validate[errPropId]
    , errDataKeys = errorPropIdToDataKeys.validate[errPropId];

  if (fp.isUndefined(unsafeArg))
    res = cv(cvArg).call(null);
  else if (isDefined(testSecondArg))
    res = cv(cvArg)(unsafeArg, testSecondArg);
  else
    res = cv(cvArg)(unsafeArg);

  res.err.id.should.equal(errId);
  fp.keys(res.err.data).should.deep.equal(errDataKeys);
}
