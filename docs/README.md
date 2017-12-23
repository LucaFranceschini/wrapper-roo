# wrapper-roo
![Ripper Roo](./ripper-roo-small.png)

[![Travis build status](https://img.shields.io/travis/LucaFranceschini/wrapper-roo.svg?branch=master)](https://travis-ci.org/LucaFranceschini/wrapper-roo.svg?branch=master)
[![Coverage Status](https://img.shields.io/coveralls/LucaFranceschini/wrapper-roo.svg)](https://coveralls.io/github/LucaFranceschini/wrapper-roo?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/LucaFranceschini/wrapper-roo.svg)](https://greenkeeper.io/)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A general JavaScript function wrapper that allows to set pre- and post-hooks, while still being as transparent as possible to the rest of the code.
Available as a npm module.

**Still work in progress**

## Simplest Example
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

## Features
### Always Invoke Hooks, No Matter What
Both hooks are always invoked, even if the wrapped function throws.
If that is the case, the error is then re-thrown:
```js
const wrapped = wrap(() => {throw 42}).withPostHook(() => console.log('yep'))
wrapped()
```
```
yep
Thrown: 42
```
However, if a hook itself throws its error will be thrown, possibly losing the one thrown by the wrapped function, if any.
If a prehook throws the wrapped function is not invoked at all.

### `this` Works
```js
const box = { value: 'yo' }
box.getValue = function () { return this.value }
console.log(box.getValue())
// wrap it
box.getValue = wrap(box.getValue).withPreHook(() => console.log('hey'))  // default empty post-hook
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
const WrappedIdiot = wrap(Idiot).justBecause()  // default empty hooks
console.log(new WrappedIdiot('luca'))
```
```
Idiot { name: 'luca' }
```
In case you're object-oriented, the wrapper correctly handles prototypes so inheritance will work as before.

### Function Properties Are Preserved
```js
function foo() { }
const wrapped = wrap(foo).justBecause()
console.log(foo.name === wrapped.name)  // 'foo'
```
```
true
```
The same holds for other *standard* function properties, like arity (`length`) or methods inherited from `Function`.
If some properties were added to the function object (*eeeew...*), they are copied as well.
Also, property descriptors are preserved.

### ESMAScript 6+ supported
The wrapper also works with arrows, classes, generators, and `async`/`await`.
Basically, if it is a function then it will be correctly wrapped.

## Development
### Tools
*Continuous integration*: [Travis](https://travis-ci.org/)

*Testing*: [Mocha](https://mochajs.org/)

*Coverage*: [Istanbul](https://istanbul.js.org/) + [Coveralls](https://coveralls.io/)

*Linter*: [JavaScript Standard Style](https://standardjs.com/)

*Dependencies*: [Greenkeeper](https://greenkeeper.io/)

### Instructions
Install Node.js and npm, clone the repo and `cd` into it.

To install dependencies:
```sh
$ npm i
```

To run tests and get coverage report:
```sh
$ npm test
```
