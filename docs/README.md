# wrapper-roo
![Travis build status](https://travis-ci.org/LucaFranceschini/wrapper-roo.svg?branch=master)

![Ripper Roo](./ripper-roo-small.png)

A general JavaScript function wrapper that allows to set pre- and post-hooks, while still being as transparent as possible to the rest of the code.
Available as a npm module.

The code is currently tested up to ES5 features.

**Still work in progress**

## Simplest Example
```js
const wrap = require('wrapper-roo')
function hello(name) { console.log('hello ' + name) }
let wrapped = wrap.aFunction(hello,
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
wrapped = wrap.aFunction(() => {throw 42},
  () => {},
  () => console.log('yep'))
wrapped()
```
```
yep
Thrown: 42
```
... however, hooks should *not* throw.

### `this` Works
```js
const box = { value: 'yo' }
box.getValue = function () { return this.value }
console.log(box.getValue())
// wrap it
box.getValue = wrap.aFunction(box.getValue, () => console.log('hey'))  // default empty post-hook
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
const WrappedIdiot = wrap.aFunction(Idiot)  // default empty hooks
console.log(new WrappedIdiot('luca'))
```
```
Idiot { name: 'luca' }
```
In case you're object-oriented, the wrapper correctly handles prototypes so inheritance will work as before.

### Function Properties Are Preserved
```js
function foo() { }
wrapped = wrap.aFunction(foo)
console.log(foo.name === wrapped.name)  // 'foo'
```
```
true
```
The same holds for other *standard* function properties, like arity (`length`) or methods inherited from `Function`.
If some properties were added to the function object (*eeeew...*), they are copied as well.
Also, property descriptors are preserved.

## Development
*Testing framework*: Mocha!

*CI*: Travis!

### Instructions
Install Node.js and npm, clone the repo and `cd` into it.

To install dependencies:
```
$ npm i
```

To run tests:
```
$ npm test
```

**Disclaimer**: I still suck at git(hub).
