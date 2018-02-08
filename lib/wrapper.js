const checkFunction = require('./checkFunction')

// cache the "hacked" toString so we always return the same one
// https://github.com/LucaFranceschini/wrapper-roo/issues/22
// map function to its hooked toString
const toStringCache = new WeakMap()

// wrap a given function with the given hook wrapper
// if dis is given, use that as `this` in calls
// third parameter is optional and mainly used for dirty hacks (i.e. toString)
module.exports = function wrapWithHook (func, hook, dis) {
  checkFunction(func, 'The object to be wrapped must be a function')
  checkFunction(hook, 'The hook must be a function')

  // use proxy objects to wrap the function
  const handler = { }
  const proxy = new Proxy(func, handler)

  // cached a hacked version of toString if needed
  if (!toStringCache.has(func)) {
    // add a fake entry to the cache to avoid further recursion
    toStringCache.set(func, null)

    const toString = wrapWithHook(Function.prototype.toString, f => f(), func)

    // put the real one
    toStringCache.set(func, toString)
  }

  handler.apply = (target, thisArg, argumentsList) => {
    if (dis !== undefined) {
      thisArg = dis
    }

    // Ideally we would use this:
    // target.bind(thisArg, argumentsList)
    // But bind could be redefined, similar to this:
    // https://github.com/LucaFranceschini/wrapper-roo/issues/26
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
    const originalToString = Function.prototype.toString

    // only do the trick if getting the original toString directly
    return result === originalToString && propertyKey === 'toString'
      ? toStringCache.get(func)
      : result
  }

  return proxy
}
