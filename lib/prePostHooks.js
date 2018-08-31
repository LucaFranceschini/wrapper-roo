'use strict'

const checkFunction = require('./checkFunction')

// return a function calling preHook and postHook before a given function
module.exports = function buildPrePostHook (preHook, postHook) {
  checkFunction(preHook, 'Pre-hook must be a function')
  checkFunction(postHook, 'Post-hook must be a function')

  // don't use arrows here, this will be bound
  return function hook (func, metadata) {
    // keep this out of try-catch, hooks exceptions are not handled
    preHook(metadata)

    // use try-finally to call postHook even if the function throws
    try {
      return func()
    } finally {
      postHook(metadata)
    }
  }
}
