# MadonnaFp
A functional approach to javascript object validation
 - MadonnaFp knows *exactly* what she wants
 - She'll accept nothing less
 - If you mess up, she'll tell you exactly what you did wrong

**Tested against**
 - node 0.10.0 for the (default) es5 version
 - node 6.0.0 for es6 @ `require('madonna-fp/es6')`

## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
 - [About](#about)
 - [Features](#features)
 - [Schema Limitations](#schema-limitations)
 - [Terminology](#terminology)
 - [Examples](#examples)
 - [API](#api)
 - [Catching Errors](#catching-errors)
 - [Reference](#reference)
 - [To Test](#test)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## About
`madonna-fp` is a full-featured javascript object validator.  The errors
returned are detailed yet friendly, and make the programmer error obvious.  I
built this library because I wasn't satisfied with existing object validators.
It was built with lodash/fp and exposes a lot of lodash's
boolean-returning functions.

## Features
 - Validators are just key-function pairs, where the key gives meaning when
   an error occurs.  It's easy to create custom validators with this approach.
 - There are many built-in common validators.
 - Unary validators (e.g. isString) are just flags passed as strings, which in
   turn are validated by this library to make sure you don't make a typo.  If
   one of [our many unary operators](#valid-flags) doesn't suit your needs, you
   can create your own.
 - There exists a shorthand syntax when your validations are simple, and a
   verbose syntax when you need customization.  This keeps code size to a
   minimum, helping with readability.
 - Nested validations are kept sane via two constructs 'passTo' and
   'passEachTo'.  These allow complex schema compositions while maintaining
   friendly and detailed error messages.
 - When the MadonnaFp schema can't support your needs [(see Limitations
   below)](#schema-limitations), there is a callback allowing you to
   further validate.
 - [There are many types of errors](#error-info), each with their own id and
   informational data. This allows you to write a custom detailed error message
   when you need it.

## Schema limitations
 - I have no plans on implementing a schema API for asynchronous validations or
   inter-dependent validations (i.e. properties validating dependent on other
   properties).  Rather, MadonnaFp supports these in its optional callback.

## Terminology
 - **flag**: Used in this library to mean 'unary function returning a boolean'.
 - **laden**: Used as a positive form of 'nonEmpty'.  If you're aware of a better
   term, please let me know.

## Examples
 - All examples assume `const madonna = require('madonna-fp');` and `let res;`
 - Error messages are written in comments following invalid calls.  Keep in mind
   MadonnaFp returns the error object in the result.  [See the API](#api)
   for clarifications

##### Require a property 'name' that passes 'isString'
```js
const nameValidator = madonna.createValidator({
  name: {
    flags: ['require', 'isString']
  }
});

res = nameValidator();
// res.error
// Invalid Input: Not all required keys were passed
// missing keys: name

res = nameValidator({ name: 1 });
// res.error
// Invalid Input: The following arguments didn't pass their criterion
// invalid arguments: {
//   "name": 1
// }
// failed criterion per argument: {
//   "name": {
//     "flags": [
//       "isString"
//     ]
//   }
// }

res = nameValidator({ name: 'phil' });
// res.isValid === true
```

##### More complex - validate a car object
 - requires argument 'year'
   - isInteger
   - between the years 1950 and 2016 inclusive
 - requires argument 'make'
   - isString
   - containedIn([Ford, Toyota, Chevy, Honda])
 - optionally allows 'name'
   - isString
   - custom:
     - has size between 6 and 10 inclusive

```js
const fp = require('lodash/fp')
  , betweenI = madonna.CRITERION_FNS.betweenI;

const validateCar = madonna.createValidator({
  year: {
    flags: ['require', 'isInteger']
    , betweenI: [1950, 2016]
  }
  , make: {
    flags: ['require', 'isString']
    , containedIn: ['Ford', 'Toyota', 'Chevy', 'Honda']
  }
  , name: {
    flags: ['isString']
    , custom: {
      sizeBetween6and10: fp.flow(fp.size, betweenI([6, 10]))
    }
  }
});

res = validateCar({
  year: 1950
  , make: 'Ford'
});
// res.isValid === true

res = validateCar({
  year: 1949
  , make: 'Ford'
});
// res.error
// Invalid Input: The following arguments didn't pass their criterion
// invalid arguments and values: {
//   "year": 1949
// }
// failed criterion per argument: {
//   "year": {
//     "betweenI": [
//       1950,
//       2016
//     ]
//   }
// }

res = validateCar({
  year: 1950
  , make: 'Volvo'
});
// res.error
// Invalid Input: The following arguments didn't pass their criterion
// invalid arguments and values: {
//   "make": "Volvo"
// }
// failed criterion per argument: {
//   "make": {
//     "containedIn": [
//       "Ford",
//       "Toyota",
//       "Chevy",
//       "Honda"
//     ]
//   }
// }

res = validateCar({
  year: 1950
  , make: 'Ford'
  , name: 'short'
});
// res.error
// Invalid Input: The following arguments didn't pass their criterion
// invalid arguments and values: {
//   "name": "short"
// }
// failed criterion per argument: {
//   "name": {
//     "custom": [
//       "sizeBetween6and10"
//     ]
//   }
// }

res = validateCar({
  year: 1950
  , make: 'Ford'
  , name: 'shorty'
});
// res.isValid === true
```

##### A complex case using the passTo and passEachTo criterion
 - Note passTo and passEachTo require named validators, which are configured via
   [opts.name](#opts).  Either createValidator or createSternValidator can
   be used.
 - We declare three validators: 'validateGame', 'vModifiedDeck', and 'vCard'
 - 'validateGame' is made up of two properties: 'numberOfDice' and 'modifiedDeck'
   - The 'modifiedDeck' property passes its value to 'vModifiedDeck'
 - 'vModifiedDeck' is made up of two properties: 'name' and 'cards'
   - The 'cards' property passes each of its values to 'vCard'
 - 'vCard' is made up of two properties: 'suit' and 'rank'

```js
const vCard = madonna.createValidator({
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
const vModifiedDeck = madonna.createValidator({
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
const validateGame = madonna.createValidator({
  numberOfDice: {
    flags: ['isInteger']
  }
  , modifiedDeck: {
    flags: ['require']
    , passTo: vModifiedDeck
  }
});

let dirtyGameArgs = {
  modifiedDeck: {
    name: 'a quick game of war'
    , cards: [
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

res = validateGame(dirtyGameArgs);
// res.isValid === true


// what about an error case?  Let's add a card with suit 'hearts'
dirtyGameArgs.modifiedDeck.cards.push({ suit: 'hearts', rank: '4' });
res = validateGame(dirtyGameArgs);
// res.error
// Invalid Input: While validating: modifiedDeck (vModifiedDeck) -> cards (vCard)
// The following arguments didn't pass their criterion
// invalid arguments and values: {
//   "suit": "hearts"
// }
// failed criterion per argument: {
//   "suit": {
//     "containedIn": [
//       "spade",
//       "heart",
//       "diamond",
//       "club"
//     ]
//   }
// }

```

*Ideally there would be many more examples.  However I'm going to wait on ironing*
*out the documentation until I've spent more time consuming this library.*

## API

```js
const madonna = require('madonna-fp');
```

### madonna-fp
Exposes three functions:
 - [validate](#validate)
 - [createValidator](#createvalidator)
 - [createSternValidator](#createsternvalidator)

And the following enumerable, frozen constants
 - **ERROR_IDS** an object containing the ids per [error thrown by this
   library](#error-info).  For more information, read [Catching Errors](#catching-errors)
 - **CRITERION_FNS** an object containing a subset of [valid criterion](#valid-criterion)
   intended to be consumed when defining custom criterion.  The list of functions
   [can be found here](#criterion-functions).  Example usage
   [can be found here](#more-complex-validate-a-car-object).

### validate
 - Takes one or two arguments, described below
 - Returns a [result](#result)
 - This function validates the passed object per the schema and returns the result.

The first argument is required and often referred to as `marg`, which just
stands for 'madonna argument'.  It can either represent the object schema or a
more verbose object encompassing both the schema and options passed.

 - Succinct: [schema](#schema)
 - Verbose: [`isPlainObject`](#valid-criterion) with the following properties
   - schema *required*: [schema](#schema)
   - opts: [opts](#opts)


The second argument is optional and when passed, represents the object to be
validated (must pass `fp.isPlainObject`).


\*\*Note: Whether you pass a verbose or succinct `marg` is determined by the
presence of the `schema` property.  If it exists, then verbose is assumed.  If
you need to use a property named `schema`, then this restricts you to the
verbose version.


#### opts

 - `fp.isPlainObject` with the following optional properties
   - name: [`isLadenString`](#valid-flags).  Used for creating named validators
     which are required by passTo and passEachTo.
   - cb: `fp.isFunction`.  This will be called post validation with the
     validated arguments object as its one and only argument.  The intent of
     this option is to further validate the arguments.  Things like asynchronous
     and inter-dependent validations should use this callback.


#### schema

 - [`isLadenPlainObject`](#valid-flags)
 - **key**: represents the name of the argument
 - **value**: Must be a valid [criterion](#criterion).


#### criterion

Takes one of two forms
 - succinct
   - [`isLadenArray`](#valid-flags) [`allStrings`](#internal-boolean-functions)
   - Must be contained in the set of [valid flags](#valid-flags)
 - verbose
   - [`isLadenPlainObject`](#valid-flags)
   - Must be contained in the set of [valid criterion](#valid-criterion)


#### result

Just an `fp.isPlainObject` with the following properties
 - isValid `fp.isBoolean`
   - Same as `!err`
 - [err (defined below)](#err)


#### err

`fp.isError` with the following properties attached
 - id [`isLadenString`](#valid-flags)
   - [List of possible error ids](#error-info)
 - data [`isLadenPlainObject`](#valid-flags)
   - [List of data properties per id](#error-info)


### validateSternly
alias `identityValidate`

 - The api is almost the same as [`validate`](#validate).  The only difference
   is that instead of returning [`result`](#result), this function throws
   validation errors and returns the validated object.


### createValidator

This is just a convenience function taking the first argument required by
[`validate`](#validate) and returns a function expecting
[`validate's`](#validate) optional second argument.


### createSternValidator
alias `createIdentityValidator`

Similar to [`createValidator`](#createValidator), these are just convenience
methods taking the first argument required by
[`validateSternly`](#validatesternly) and returning a function expecting its
optional second argument.


## Catching Errors
 - MadonnaFp will return very specific errors during object validation, some of
   which you may want to handle specific to your needs.  This library allows
   that by attaching a property `id` to the error.  The list of ids [can be
   found here](#error-info).  Errors caused during validator creation for
   example, can be handled:

```js
const invalidSchemaCriterion = madonna.ERROR_IDS.invalidCriterion
  , nameValidator;

// let's try to create a validator with an invalid criterion
try {
  nameValidator = madonna.createValidator({
    name: {
      flags: { require: true }
    }
  })
} catch(err) {
  if (err.id === invalidSchemaCriterion) {

    // do something
  }
}
```

## Reference

### Valid Criterion
 - allContainedIn [`isLadenArray`](#valid-flags)
   - Takes an array as input, and tests to make sure all its elements are
     contained in the original array.
 - betweenE `fp.isArray` [`hasSize(2)`](#internal-boolean-functions)
   [`allStringOrNumber`](#internal-boolean-functions)
   - Input type must match the criterion type (`fp.isString` or `fp.isNumber`)
   - Has complementary `outsideI`
 - betweenI `fp.isArray` [`hasSize(2)`](#internal-boolean-functions)
   [`allStringOrNumber`](#internal-boolean-functions)
   - Input type must match the criterion type (`fp.isString` or `fp.isNumber`)
   - Has complementary `outsideE`
 - containedIn [`isLadenArray`](#valid-flags)
 - custom [`isLadenPlainObject`](#valid-flags) [`allFunctions`](#internal-boolean-functions)
 - flags [`isLadenArray`](#valid-flags) [`allStrings`](#internal-boolean-functions)
   [`allContainedIn(<validFlags>)`](#internal-boolean-functions)
   - [Valid flags reference](#valid-flags)
 - gt [`isStringOrNumber`](#internal-boolean-functions)
   - Input type must match the criterion type (`fp.isString` or `fp.isNumber`)
   - Has complementary `lte`
 - gte [`isStringOrNumber`](#internal-boolean-functions)
   - Input type must match the criterion type (`fp.isString` or `fp.isNumber`)
   - Has complementary `lt`
 - hasSize [`isZeroOrPositiveInteger`](#internal-boolean-functions)
 - instance_of `fp.isFunction`
   - Has complementary `not_instance_of`
 - matchesRegex `fp.isRegex`
   - Takes a string as input and returns whether it matches the regex
 - passTo [`isNamedValidator`](#internal-boolean-functions)
   - Input must be `fp.isPlainObject` and will be passed to the named validator.
   - Only the [`require`](#valid-flags) flag is allowed alongside passTo.
   - Example usage [can be found here.](#a-complex-case-using-the-passto-and-passeachto-criterion)
 - passEachTo [`isNamedValidator`](#internal-boolean-functions)
   - Input must be `fp.isArray` and `fp.all(fp.isPlainObject)` where each item
     will be passed to the named validator.
   - Only the [`require`, `isLaden` flags](#valid-flags), and the
     [`hasSize` criterion](#valid-criterion) are allowed alongside passEachTo.
   - Example usage [can be found here.](#a-complex-case-using-the-passto-and-passeachto-criterion)
 - type_of [`isLadenString`](#valid-flags)
   - Has complementary `not_type_of`

#### Criterion Notes
 - The 'E' and 'I' in `between` and `outside` stand for 'exclusive' and 'inclusive'
 - gt, gte, lt, and lte are taken from lodash and use the original argument
   ordering as opposed to fp's.  This is to make the criterion read more naturally.
 - between and outside use lodash's gt/lt functions to calculate the result.
 - `passTo` and `passEachTo` are necessary because developers are lazy and don't
   like constructors.  I believe the clean solution is to create constructors and
   validate via instanceof, but we live in a world of json.  People don't want
   to create new card objects prior to inserting them in a deck!  That would be
   crazy!  They just want to write the json and pass that into whatever function
   requires it, darn it!


### Valid Flags
#### Custom to this library
 - require
 - isCharacter
   - `fp.allPass([fp.isString, hasSize(1)])`
 - isDefined
   - `fp.negate(fp.isUndefined)`
 - isLaden
   - `fp.size`
 - isLadenArray:
   - `fp.allPass([fp.size, fp.isArray])`
 - isLadenPlainObject
   - `fp.allPass([fp.size, fp.isPlainObject])`
 - isLadenString
   - `fp.allPass([fp.size, fp.isString])`
 - isPositiveNumber
```js
fp.anyPass([
 fp.allPass([fp.isNumber, fp.inRange(1, Infinity)])
 , fp.eq(Infinity)
])
```

 - isNegativeNumber
   - `fp.allPass([fp.isNumber, fp.inRange(-Infinity, 0)])`
 - isStringOrNumber
   - `fp.anyPass([fp.isString, fp.isNumber])`

#### Unary lodash functions exposed
All the below strings also have complementary 'isNot' flags
 - isArguments
 - isArray
 - isArrayBuffer
 - isArrayLike
 - isArrayLikeObject
 - isBoolean
 - isBuffer
 - isDate
 - isElement
 - isEmpty
 - isEqual
 - isEqualWith
 - isError
 - isFinite
 - isFunction
 - isInteger
 - isLength
 - isMap
 - isNaN
 - isNative
 - isNil
 - isNull
 - isNumber
 - isObject
 - isObjectLike
 - isPlainObject
 - isRegExp
 - isSafeInteger
 - isSet
 - isString
 - isSymbol
 - isTypedArray
 - isUndefined
 - isWeakMap
 - isWeakSet

## Internal boolean functions
 - allContainedIn
   - A curried function taking two arrays, testing whether the second array has only
     values contained in the first.

```js
const allContainedIn = fp.curry((srcArr, arrToTest) => {
  return !fp.without(arrToTest, srcArr).length;
});
```

 - allFunctions
   - `fp.all(fp.isFunction)`
 - allStringOrNumber
   - `fp.anyPass([ fp.all(fp.isString), fp.all(fp.isNumber) ])`
 - allStrings
   - `fp.all(fp.isString)`
 - isZeroOrPositiveInteger
   - `fp.allPass([ fp.isInteger, betweenI([0, Infinity]) ])`
 - isLadenArray
   - `fp.allPass([ fp.isArray, fp.size ])`
 - isLadenPlainObject
   - `fp.allPass([ fp.isPlainObject, fp.size ])`
 - isLadenString
   - `fp.allPass([ fp.isString, fp.size ])`
 - isNamedValidatorFn
   - A function taking one parameter that must pass
     - isFunction
     - has property `_id` === 'madonnafp'
     - has property `_name` passing isLadenString

```js
fp.allPass([
  fp.isFunction
  , fp.flow(
    fp.get('_id')
    , fp.eq('madonnafp')
  ), fp.flow(
    fp.get('name')
    , fp.isString
  )
])
```

 - isStringOrNumber
   - `fp.anyPass([ fp.isString, fp.isNumber ])`


## Error Info

The following are error ids with their corresponding data properties.  When
calling stern validations, these errors are thrown, otherwise they are returned
via the [`result object`](#result).

Errors during object validation, accessible via `madonna.ERROR_IDS`
 - atMostOneArgument: argsLength, args
 - argNotIsPlainObject: type_of, arg
 - invalidArgKeys: invalidKeys, keysAllowed
 - missingRequiredKeys: keysMissing, passedArgs
 - criterionFailed: invalidArgs, failedCriterion

Errors thrown during [**cb**](#createvalidator) that want to pass the error info
down to consumers should define their own id and data object.  If you just want
people to know an error happened in cb as opposed to when validating against the
schema, then setting 'id' to the string 'cb' seems like a reasonable convention.


## Criterion Functions

These are the curried functions exposed by `madonna.CRITERION_FNS`.  Keep in
mind criterion input is not validated when used inside the 'custom' criterion.
 - allContainedIn
 - betweenE
 - betweenI
 - containedIn
 - gt
 - gte
 - hasSize
 - instance_of
 - lt
 - lte
 - not_instance_of
 - not_type_of
 - outsideE
 - outsideI
 - type_of

# Test
`npm test`
