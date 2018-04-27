'use strict'

const checkFunction = require('./checkFunction')

module.exports = function buildPrePostHook (preHook, postHook) {
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
