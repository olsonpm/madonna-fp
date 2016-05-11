### An unordered list of items I may tend to in the future

- Ability to configure a 'development' mode such that validations only run
  during development.  I would first run some tests to get an idea of how much
  time these validations take.
- Add an es5 friendly version (e.g. generated via babel).
- Add test for each criterion and flag
- Find ways to make the returned errors more friendly
- Document the order of validations both when creating a validator and validating.
- Test strings in error message (i.e. make sure we're returning well
  formed strings)
- Criterion that have unintuitive type checks should have a mechanism to report
  the cause of error.  Note: the type checks are necessary because foregoing
  them would mean unintuitive results when types don't match.
- Implement `madonna.createInstance` which takes a set of default options to
  be used in further createValidator calls.
- Optionally configure validator to stop on first invalid criterion.
- Figure out a consistent model for error id naming
- Truncate containedIn error
- Figure out a clean api for unvalidated properties.  Maybe an array of strings
  in opts?
- Lint for broken links in readme, assuming I do that prior to making a
  docs website.
- Instead of treating passTo and passEachTo as just another boolean-returning
  criterion, we could save from a lot of nested try/catch's by validating all
  other criterion first then calling passTo/passEachTo.  This would not only
  better match the 'return result by default, throw if told to do so' pattern,
  but also should be more performant.  Granted performance is a give and take
  when it comes to validation.
- Implement `madonna.FLAG_FNS`, which exposes the custom flag functions for
  use externally.
- Think through passing `validatedArgs` on the result object post-validation.
  Whether it would be useful is the  question.
- Decide on API for madonna-fp to expose how it decides whether marg is
  succinct or verbose, also expose a function to sanitize marg to its
  longhand equivalent.
- Figure out how all madonna modules should expose their errors in a sane way.
  Basically you should be able to get all the possible errors when using any
  version of each module.  Since many modules consume each other, this means
  a common api should be created so the top-level module can expose all
  dependent modules' errors.
- Should I duplicate the validation functions to simplify the docs?  i.e. create
  a convention explicitly stating verbose and succinct arguments?
- Clean up the validate(Sternly)? && create(Stern)?Validator logic.  The current
  state of things is messy due to adding `validate` after the fact.
- Non-stern schema validation should return result just like validating the
  object does.
- Errors need to be restructured to represent the new variation in functions
- Rename arg -> marg as it's now clearly stated in the documentation
- Better alias naming for stern/identity?  Really don't know what to do here.
- Is there such thing as a generic friendly error message?  Maybe this library
  should provide one but also allow for customization on a per error (or
  argument) basis?
