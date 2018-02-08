const checkFunction = require('./checkFunction')

// wrap a given function with the given hook wrapper
module.exports = function wrapWithHook (func, hook) {
  checkFunction(func, 'The object to be wrapped must be a function')
  checkFunction(hook, 'The hook must be a function')

  // use proxy objects to wrap the function
  const handler = { }
  const proxy = new Proxy(func, handler)

  handler.apply = (target, thisArg, argumentsList) => {
    /* ideally we would use this:
     * target.bind(thisArg, argumentsList)
     * but bind could be redefined, similar to this:
     * https://github.com/LucaFranceschini/wrapper-roo/issues/26
     */
    return hook(Function.prototype.bind.call(target, thisArg, ...argumentsList))
  }

  handler.construct = (target, argumentsList, newTarget) => {
    // when doing new on the proxy, behave like it was done on the function
    // https://github.com/tc39/ecma262/issues/1052
    if (newTarget === proxy) {
      newTarget = target
    }

    return hook(() => Reflect.construct(target, argumentsList, newTarget))
  }

  return proxy
}
