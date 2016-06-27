#!/usr/bin/env sh

. "$(locate nvm.sh)"

./build.sh \
  && nvm run 6.0.0 ./node_modules/mocha/bin/mocha --color=always tests/es6.js \
  && nvm run 0.10.0 ./node_modules/mocha/bin/mocha --color=always tests/es5.js --es5

nvm use node
