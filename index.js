'use strict';

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
    withPrePostHooks: (preHook, postHook) => wrapPrePostHooks(func, preHook, postHook),
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

  // do not use an arrow here, traditional 'this' binding needed (see below)
  // note: the 'this' inside here does not come from the enclosing arrow
  function wrapper() {
    preHook()

    // try-finally needed to always invoke postHook, even if func throws
    try {
      // check if this is a constructor call or not, and do the same
      // new.target only defined in constructor call (ES5)
      return new.target
        ? new func(...arguments)
        // forward 'this' binding
        : func.apply(this, arguments)
    } finally {
      // if posthook throws it overrides wrapped function exception, if any
      postHook()
    }
  }

  // copy own properties
  const properties = Object.getOwnPropertyDescriptors(func)
  Object.defineProperties(wrapper, properties)

  // copy prototype
  const prototype = Object.getPrototypeOf(func)
  Object.setPrototypeOf(wrapper, prototype)

  return wrapper
}
