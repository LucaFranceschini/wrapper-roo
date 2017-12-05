'use strict';

// default hook, do nothing
function emptyHook() { }

/*
 * Wrap a given function in a new one always invoking pre- and post-hook.
 * This is a nice alias when doing wrap = require('wrapper-roo').
 * Both arrows and functions are fine here, the arrow 'this' is not used.
 */
exports.aFunction = (func, preHook = emptyHook, postHook = emptyHook) => {
  // arguments checking
  if (typeof func !== 'function')
    throw new TypeError('The function to be wrapped must be a function')

  if (typeof preHook !== 'function')
    throw new TypeError('Prehook must be a function')

  if (typeof postHook !== 'function')
    throw new TypeError('Posthook must be a function')

  // do not use an arrow here, traditional 'this' binding needed (see below)
  // note: the 'this' inside here does not come from the enclosing arrow
  function wrapper() {
    preHook()

    // try-catch needed to invoke postHook if func throws
    try {
      // check if this is a constructor call or not, and do the same
      // new.target undefined only in constructor call (ES5)
      const result = new.target
        ? new func(...arguments)
        // forward 'this' binding
        : func.apply(this, arguments)

      postHook()
      return result
    } catch (err) {
      postHook()
      // rethrow not to lose error and trace
      throw err
    }
  }

  // copy own properties
  const properties = Object.getOwnPropertyDescriptors(func)
  Object.defineProperties(wrapper, properties)

  return wrapper
}
