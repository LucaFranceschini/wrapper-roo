'use strict'

const assert = require('assert')

// fluent API, consider wrap = require('wrapper-roo')
// don't put much logic here, except fail-fast
module.exports = func => {
  if (typeof func !== 'function')
    throw new TypeError('The object to be wrapped must be a function')

  // allow chaining
  return {
    withPreHook: preHook => wrapPrePostHooks(func, preHook, nop),
    withPostHook: postHook => wrapPrePostHooks(func, nop, postHook),
    withPrePostHooks:
      (preHook, postHook) => wrapPrePostHooks(func, preHook, postHook),
    // mostly useful for testing purposes, both hooks do nothing
    justBecause: () => wrapPrePostHooks(func, nop, nop)
  }
}

// default hook, do nothing
function nop() { }

// wrap a given function in a new one always invoking pre- and post-hooks
function wrapPrePostHooks(func, preHook, postHook) {
  // func parameter not exposed to the wild
  assert.equal(typeof func, 'function')

  if (typeof preHook !== 'function')
    throw new TypeError('Prehook must be a function')

  if (typeof postHook !== 'function')
    throw new TypeError('Posthook must be a function')

  // use proxy objects to wrap the function
  const handler = { }
      , proxy = new Proxy(func, handler)

  // both in application and construction we use try-finally to be sure to call
  // the postHook, even if the function throws

  handler.apply = (target, thisArg, argumentsList) => {
    preHook()
    try {
      return target.apply(thisArg, argumentsList)
    } finally {
      postHook()
    }
  }

  handler.construct = (target, argumentsList, newTarget) => {
    preHook()
    try {
      // when doing new on the proxy, behave like it was done on the function
      // https://github.com/tc39/ecma262/issues/1052
      if (newTarget === proxy)
        newTarget = target

      return Reflect.construct(target, argumentsList, newTarget)
    } finally {
      postHook()
    }
  }

  return proxy
}
