# wrapper-roo
**Wrap** any function with custom hooks, executing code before and after the function, controlling arguments, result and so on, while still being as **transparent** as possible to the rest of the code.

![Logo](https://raw.githubusercontent.com/LucaFranceschini/wrapper-roo/master/ripper-roo.png)

[![npm version](https://badge.fury.io/js/wrapper-roo.svg)](https://badge.fury.io/js/wrapper-roo)
[![Travis build status](https://api.travis-ci.org/LucaFranceschini/wrapper-roo.svg?branch=master)](https://travis-ci.org/LucaFranceschini/wrapper-roo)
[![Coverage Status](https://coveralls.io/repos/github/LucaFranceschini/wrapper-roo/badge.svg?branch=master)](https://coveralls.io/github/LucaFranceschini/wrapper-roo?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Installation
The package can be locally installed from npm:

    $ npm i wrapper-roo

## Usage

### Pre- and post-hooks
A *hook* is a function to be executed before or after a given one:
```js
const wrap = require('wrapper-roo')

function hello (name) { console.log('hello ' + name) }

const wrapped = wrap(hello).withPrePostHooks(
  () => console.log('before'), // pre-hook
  () => console.log('after')) // post-hook

wrapped('Crash')
```
```
before
hello Crash
after
```
Arguments and return value are forwarded, thus the wrapper can be used just like the original function. See the [wiki](https://github.com/LucaFranceschini/wrapper-roo/wiki/Basic-Features-&-Forwarding) for more information.

### Function Invocation Information
Hooks receive information about the function call as their first argument:
```js
const wrap = require('wrapper-roo')

function foo () { /* ... */ }

const wrapped = wrap(foo).withPreHook(data => {
  console.log('Calling function ' + data.function.name)
  console.log('Args: ' + data.arguments)
})

wrapped(1, 'hey')
```
```
Calling function foo
Args: [1,hey]
```
Function invocation metadata object received by hooks contains the following properties:
- `function`: original function object to be wrapped;
- `arguments`: array of arguments that were given to the function;
- `constructor`: value of `new.target` in the original call, namely, the function after the `new` keyword in constructor calls;
- `this`: object bound to `this` for the call;
- `boundFunction`: a version of the wrapped function that is already bound to arguments, `this` and `new.target`.

Additional fields are available to post-hooks:
- `result`: return value;
- `exception`: thrown exception;
- `success`: whether the execution of the function completed normally or an exception was thrown.

**Note**: invocation data is *read-only*: modifications to properties above are not allowed and will have no effect on the function execution.

### Custom Hooks
Greater control can be achieved with custom hooks, if needed:
```js
const wrap = require('wrapper-roo')

function foo () { /* ... */ }

wrap(foo).withCustomHook((data, f) => { /* ... f() ... */ })
```
Custom hooks conveniently receive as a second argument the wrapped function already bound to `this` and arguments, and already set up as a constructor call if needed.
Just call `f()`.

Note that no automatic handling of binding, arguments, exceptions etc is performed when directly invoking the original function as `data.function()`.

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

The current implementation is based on the Proxy API.
Caveats of this approach (corner cases) are listed [here](https://github.com/LucaFranceschini/wrapper-roo/issues?q=is%3Aopen+is%3Aissue+label%3Aproxies).

## Contributing
Install Node.js and npm, clone the repo and `cd` into it.

To install dependencies:
```
$ npm i
```

To run linter, tests and get coverage report:
```
$ npm test
```

See the [wiki page](https://github.com/LucaFranceschini/wrapper-roo/wiki/Contributing) for more information.
