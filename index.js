'use strict';

// default hook, do nothing
function emptyHook() { }

/*
 * Wrap a given function in a new one always invoking pre- and post-hook.
 * This is a nice alias when doing wrap = require('wrapper-roo').
 * Both arrows and functions are fine here, no 'this' used.
 */
exports.aFunction = (func, preHook = emptyHook, postHook = emptyHook) => {
  // arguments checking
  if (typeof func !== 'function')
    throw new TypeError('The function to be wrapped must be a function')

  if (typeof preHook !== 'function')
    throw new TypeError('Prehook must be a function')

  if (typeof postHook !== 'function')
    throw new TypeError('Posthook must be a function')

  // return the wrapped function
  // do not use an arrow here, traditional 'this' binding needed (see below)
  return function (...args) {
    preHook()

    // try-catch needed to invoke postHook if func throws
    try {
      // check if this is a constructor call or not, and do the same
      // new.target undefined only in constructor call (ES5)
      const result = new.target
        ? new func(...args)
        // forward 'this' binding
        : func.apply(this, args)

      postHook()
      return result
    } catch (err) {
      postHook()
      // rethrow not to lose error and trace
      throw err
    }
  }
}
