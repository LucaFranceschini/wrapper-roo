'use strict';

// wrap a given function in a new one always invoking pre and postHook
exports aFunction = (func, preHook, postHook) =>
  (...arguments) => {
    // try-catch needed to invoke postHook if func throws
    try {
      preHook()
      const result = func.apply(this, arguments)
      postHook()
      return result
    } catch (err) {
      postHook()
      // rethrow not to lose error and trace
      throw err
    }
  }
