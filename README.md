# wrapper-roo
![Ripper Roo](./ripper-roo.png)

[![npm version](https://badge.fury.io/js/wrapper-roo.svg)](https://badge.fury.io/js/wrapper-roo)
[![Travis build status](https://api.travis-ci.org/LucaFranceschini/wrapper-roo.svg?branch=master)](https://travis-ci.org/LucaFranceschini/wrapper-roo)
[![Greenkeeper badge](https://badges.greenkeeper.io/LucaFranceschini/wrapper-roo.svg)](https://greenkeeper.io/)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Coverage Status](https://coveralls.io/repos/github/LucaFranceschini/wrapper-roo/badge.svg?branch=master)](https://coveralls.io/github/LucaFranceschini/wrapper-roo?branch=master)

A general JavaScript function wrapper that allows to execute code before and after the function, while still being as transparent as possible to the rest of the code.
Available as npm module.

## Simple Example
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

## Installation
```
npm i wrapper-roo
```
Then in Node.js:
```js
const wrap = require('wrapper-roo')
```

## Features
### Exceptions Support
Pre- and post-hooks are always invoked, even if the wrapped function throws.
If that is the case, the error is then re-thrown:
```js
const wrapped = wrap(() => {throw 42})
  .withPostHook(() => console.log('yep'))

wrapped()
```
```
yep
Thrown: 42
```
However, if a hook itself throws its error will be thrown, thus losing the one thrown by the wrapped function, if any.
If a hook throws before calling the wrapped function, the latter will not be called.

Long story short: do not throw inside hooks.

### `this` Works
```js
const box = { value: 'yo' }

box.getValue = function () { return this.value }

console.log(box.getValue())

// wrap it (default empty post-hook)
box.getValue = wrap(box.getValue)
  .withPreHook(() => console.log('hey'))

console.log(box.getValue())
```
```
yo
hey
yo
```
This (pun intended) means it also works with getters and setters, as well as `Function.bind()` and explicit-binding friends.

### `new` Works
```js
function Idiot(name) { this.name = name }

// default empty hook
const WrappedIdiot = wrap.the(Idiot)

console.log(new WrappedIdiot('luca'))
```
```
Idiot { name: 'luca' }
```
In case you're object-oriented, the wrapper correctly handles prototypes so inheritance will work as before.

### Function Properties Are Preserved
```js
function foo() { }

const wrapped = wrap.the(foo)

console.log(foo.name === wrapped.name)  // 'foo'
```
```
true
```
The same holds for other *standard* function properties, like arity (`length`) or methods inherited from `Function`.
If some properties were added to the function object, they are copied as well.
Also, property descriptors are preserved.

### ECMAScript 6+ supported
The wrapper also works with arrows, classes, generators, and `async`/`await`.
Basically, if it is a function then it will be correctly wrapped.

### Custom Hooks
A *hook* is a higher-order function which takes a function `f` to be executed as an argument and does something before and after running `f`.

It is desirable for the hook to return the result of the wrapped function in order not to lose it. Also, exceptions should be taken into account.

```js
function gimme42 () { return 42 }

const wrapped = wrap(gimme42).withHook(f => {
  const result = f()
  console.log('Result was ' + result)
  return result
})

wrapped()
```
```
Result was 42
```

## (Fluent) API
The following functions are exposed:
```js
const wrap = require('wrapper-roo')

wrap(func).withPreHook(preHook)
wrap(func).withPostHook(postHook)
wrap(func).withPrePostHooks(preHook, postHook)
wrap(func).withHook(hook)
wrap.the(func)  // just wrap it
```

## Caveats
*Of course*, identity is not preserved: `wrap.the(func) !== func`.

Other caveats of the current implementation are reported as issues on this repository.

## Development
### Tools
*Continuous integration*: [Travis](https://travis-ci.org/)

*Testing*: [Mocha](https://mochajs.org/) + [Chai](http://chaijs.com/) + [Sinon.js](http://sinonjs.org/)

*Coverage*: [Istanbul](https://istanbul.js.org/) + [Coveralls](https://coveralls.io/)

*Linter*: [JavaScript Standard Style](https://standardjs.com/)

*Dependencies*: [Greenkeeper](https://greenkeeper.io/)

### Instructions
Install Node.js and npm, clone the repo and `cd` into it.

To install dependencies:
```sh
$ npm i
```

To run linter, tests and get coverage report:
```sh
$ npm test
```
