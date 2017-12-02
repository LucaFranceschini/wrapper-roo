'use strict';

exports.wrapFunction = wrapFunction

// nice alias when doing wrap = require('wrapper-roo')
exports.aFunction = wrapFunction

// wrap a given function in a new one always invoking pre and postHook
function wrapFunction(func, preHook, postHook) {
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
