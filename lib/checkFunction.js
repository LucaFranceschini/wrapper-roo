// ensure it is a function
module.exports = function checkFunction (func, errorMessage) {
  if (typeof func !== 'function') {
    throw new TypeError(errorMessage)
  }
}
