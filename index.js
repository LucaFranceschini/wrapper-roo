'use strict'

// fluent API, consider wrap = require('wrapper-roo')
// don't put logic here

module.exports = wrap

function wrap (func) {
  return {
    withHook: hook => wrapWithHook(func, hook),
    withPreHook: pre => wrapWithHook(func, buildPrePostHook(pre, nop)),
    withPostHook: post => wrapWithHook(func, buildPrePostHook(nop, post)),
    withPrePostHooks: (pre, post) => wrapWithHook(func, buildPrePostHook(pre, post))
  }
}

// just wrap the original function, mostly useful for testing purposes
wrap.the = func => wrapWithHook(func, f => f())

// do nothing
function nop () { }

// wrap a given function with the given hook wrapper
function wrapWithHook (func, hook) {
  checkFunction(func, 'The object to be wrapped must be a function')
  checkFunction(hook, 'The hook must be a function')

  // use proxy objects to wrap the function
  const handler = { }
  const proxy = new Proxy(func, handler)

  handler.apply = (target, thisArg, argumentsList) => {
    // ideally we would use this:
    // target.apply(thisArg, argumentsList)
    // but... https://github.com/LucaFranceschini/wrapper-roo/issues/26
    // better to invoke the original apply, it cannot be redefined
    // (don't use Reflect.apply, it can be redefined as well)
    return hook(Function.prototype.bind.call(target, thisArg, ...argumentsList))
  }

  handler.construct = (target, argumentsList, newTarget) => {
    // when doing new on the proxy, behave like it was done on the function
    // https://github.com/tc39/ecma262/issues/1052
    if (newTarget === proxy) {
      newTarget = target
    }

    return hook(() => Reflect.construct(target, argumentsList, newTarget))
  }

  return proxy
}

// ensure it is a function
function checkFunction (func, errorMessage) {
  if (typeof func !== 'function') {
    throw new TypeError(errorMessage)
  }
}

function buildPrePostHook (preHook, postHook) {
  checkFunction(preHook, 'Pre-hook must be a function')
  checkFunction(postHook, 'Post-hook must be a function')

  return function (func) {
    preHook()

    // use try-finally to call postHook even if the function throws
    try {
      return func()
    } finally {
      postHook()
    }
  }
}
