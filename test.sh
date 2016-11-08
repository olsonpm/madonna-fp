#!/usr/bin/env sh

# shellcheck disable=2086
if [ -z ${TRAVIS_NODE_VERSION+x} ]; then
  # shellcheck disable=1090
  . "$(locate nvm.sh | head -n1)"
  ./build.sh \
    && nvm run 6.0.0 ./node_modules/mocha/bin/mocha --color=always tests/es6.js \
    && nvm run 0.10.0 ./node_modules/mocha/bin/mocha --color=always tests/es5.js
elif [ "${TRAVIS_NODE_VERSION}" = "6.0.0" ]; then
  ./node_modules/mocha/bin/mocha --color=always tests/es6.js
else # TRAVIS_NODE_VERSION < 6
  ./build.sh \
    && ./node_modules/mocha/bin/mocha --color=always tests/es5.js
fi
