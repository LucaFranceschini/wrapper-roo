'use strict'

// fluent API, consider wrap = require('wrapper-roo')
// don't put logic here

module.exports = wrap

function wrap (func) {
  return {
    withPreHook: pre => wrapPrePostHooks(func, pre, nop),
    withPostHook: post => wrapPrePostHooks(func, nop, post),
    withPrePostHooks: (pre, post) => wrapPrePostHooks(func, pre, post)
  }
}

// both hooks do nothing, mostly useful for testing purposes
wrap.it = func => wrapPrePostHooks(func, nop, nop)

// default hook, do nothing
function nop () { }

// wrap a given function in a new one always invoking pre- and post-hooks
function wrapPrePostHooks (func, preHook, postHook) {
  checkFunction(func, 'The object to be wrapped must be a function')
  checkFunction(preHook, 'Prehook must be a function')
  checkFunction(postHook, 'Posthook must be a function')

  // use proxy objects to wrap the function
  const handler = { }
  const proxy = new Proxy(func, handler)

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
      if (newTarget === proxy) {
        newTarget = target
      }

      return Reflect.construct(target, argumentsList, newTarget)
    } finally {
      postHook()
    }
  }

  return proxy
}

// ensure it is a function
function checkFunction (func, errorMessage) {
  if (typeof func !== 'function') {
    throw new TypeError(errorMessage)
  }

  return func
}
