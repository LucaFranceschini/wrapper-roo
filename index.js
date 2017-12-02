'use strict';

// default hook parameter
function emptyHook() { }

// wrap a given function in a new one always invoking pre and postHook
// this is a nice alias when doing wrap = require('wrapper-roo')
exports.aFunction = (func, preHook = emptyHook, postHook = emptyHook) => {
  // arguments checking
  if (typeof func !== 'function')
    throw new TypeError('The function to be wrapped must be a Function')

  if (typeof preHook !== 'function')
    throw new TypeError('Prehook must be a Function')

  if (typeof postHook !== 'function')
    throw new TypeError('PostHook must be a Function')

  // return the wrapped function
  return (...args) => {
    // try-catch needed to invoke postHook if func throws
    try {
      preHook()
      const result = func.apply(this, args)
      postHook()
      return result
    } catch (err) {
      postHook()
      // rethrow not to lose error and trace
      throw err
    }
  }
}
