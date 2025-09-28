'use strict'

// ensure it is a function
export default function checkFunction (func, errorMessage) {
  if (typeof func !== 'function') {
    throw new TypeError(errorMessage)
  }
};
