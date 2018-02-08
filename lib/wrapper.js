const checkFunction = require('./checkFunction')

// wrap a given function with the given hook wrapper
// if dis is given, use that as `this` in calls
// third parameter is optional and mainly used for dirty hacks (i.e. toString)
module.exports = function wrapWithHook (functionObject, hook, dis) {
  checkFunction(functionObject, 'The object to be wrapped must be a function')
  checkFunction(hook, 'The hook must be a function')

  // use proxy objects to wrap the function
  const handler = { }
  const proxy = new Proxy(functionObject, handler)

  handler.apply = (target, thisArg, argumentsList) => {
    if (dis !== undefined) {
      thisArg = dis
    }

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

  handler.get = (target, propertyKey, receiver) => {
    const result = Reflect.get(target, propertyKey, receiver)
    const toString = Function.prototype.toString

    // don't do anything if toString is redefined or got through another property
    if (result !== toString || propertyKey !== 'toString') {
      return result
    }

    return wrapWithHook(result, f => f(), functionObject)
  }

  return proxy
}
