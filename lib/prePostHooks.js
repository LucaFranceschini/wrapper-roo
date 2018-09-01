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

    try {
      metadata.result = func()
      return metadata.result // return result to preserve flow
    } catch (e) {
      metadata.exception = e
      throw e // rethrow exception to preserve original flow
    } finally { // call postHook even if the function throws
      postHook(metadata)
    }
  }
}
