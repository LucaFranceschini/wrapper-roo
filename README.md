# wrapper-roo
A general JavaScript **function wrapper** that allows to execute code before and after the function, while still being as **transparent** as possible to the rest of the code. This last bit is what makes this wrapper different from existing ones.
Available as npm module.

![Ripper Roo](./ripper-roo.png)

[![npm version](https://badge.fury.io/js/wrapper-roo.svg)](https://badge.fury.io/js/wrapper-roo)
[![Travis build status](https://api.travis-ci.org/LucaFranceschini/wrapper-roo.svg?branch=master)](https://travis-ci.org/LucaFranceschini/wrapper-roo)
[![Coverage Status](https://coveralls.io/repos/github/LucaFranceschini/wrapper-roo/badge.svg?branch=master)](https://coveralls.io/github/LucaFranceschini/wrapper-roo?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/LucaFranceschini/wrapper-roo.svg)](https://greenkeeper.io/)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Installation
The package can be locally installed from npm:

    $ npm i wrapper-roo

## Usage
### Example
The following code add two console prints to be executed before and after a wrapped function:
```js
const wrap = require('wrapper-roo')

function hello(name) { console.log('hello ' + name) }

const wrapped = wrap(hello).withPrePostHooks(
  () => console.log('before'),  // pre-hook
  () => console.log('after'))   // post-hook

wrapped('Crash')
```
```
before
hello Crash
after
```
Arguments and return value are forwarded, thus the wrapper can be used just like the original function.

### (Fluent) API
The following functions are exposed:
```js
const wrap = require('wrapper-roo')

wrap(func).withPreHook(preHook)
wrap(func).withPostHook(postHook)
wrap(func).withPrePostHooks(preHook, postHook)
wrap(func).withCustomHook(hook)
wrap.the(func)  // just wrap it
```

### Caveats
*Of course*, identity is not preserved: `wrap.the(func) !== func`.

Other caveats of the current implementation are reported as issues on this repository.

### More
Take a look at the [wiki](https://github.com/LucaFranceschini/wrapper-roo/wiki).

## Contributing
Install Node.js and npm, clone the repo and `cd` into it.

To install dependencies:
```sh
$ npm i
```

To run linter, tests and get coverage report:
```sh
$ npm test
```

See the [wiki page](https://github.com/LucaFranceschini/wrapper-roo/wiki/Contributing) for more information.
