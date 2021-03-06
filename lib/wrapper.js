'use strict'

const checkFunction = require('./checkFunction')
const InvocationData = require('./metadata')

module.exports = wrapWithHook

// cache the "hacked" toString so we always return the same one
// https://github.com/LucaFranceschini/wrapper-roo/issues/22
// map function to its hooked toString (the method, not the result!)
const toStringCache = new WeakMap()

// wrap a given function with the given hook wrapper
// if dis is given, use that as `this` in calls
// third parameter is optional and mainly used for dirty hacks (i.e. toString)
function wrapWithHook (func, hook, dis) {
  checkFunction(func, 'The object to be wrapped must be a function')
  checkFunction(hook, 'The hook must be a function')

  cacheHookedToString(func)

  // use proxy objects to wrap the function
  const handler = { }
  const proxy = new Proxy(func, handler)

  // our customized traps take additional arguments (before standard ones)
  handler.apply = applicationTrap.bind(null, hook, dis)
  handler.construct = constructorTrap.bind(null, proxy, hook)
  handler.get = propertyAccessTrap.bind(null, func)

  return proxy
}

function cacheHookedToString (func) {
  // cached a hacked version of toString only if needed
  if (toStringCache.has(func)) return

  // add a fake entry to the cache to avoid further recursion
  toStringCache.set(func, null)

  const toString = wrapWithHook(Function.prototype.toString, (data, f) => f(), func)

  // put the real one
  toStringCache.set(func, toString)
}

// proxy handler traps

// see proxy handler application trap doc for details about the arguments
function applicationTrap (hook, dis,
  // standard trap arguments follow
  target, thisArg, argumentsList) {
  // use the given `this` value, if any
  if (dis !== undefined) {
    thisArg = dis
  }

  // ideally we would use this:
  // target.bind(thisArg, argumentsList)
  // but bind could be redefined, similar to this:
  // https://github.com/LucaFranceschini/wrapper-roo/issues/26
  // if Function.prototype.bind is redefined, assume they know what they're doing...
  const boundedFunction = Function.prototype.bind.call(target, thisArg, ...argumentsList)

  const metadata = new InvocationData(
    target, argumentsList, undefined /* constructor */, thisArg, boundedFunction)

  // finally call the hook, which in turn will call the original function
  return hook(metadata, boundedFunction)
}

// see proxy handler constructor trap doc for details about the arguments
function constructorTrap (proxy, hook,
  // standard trap arguments follow
  target, argumentsList, newTarget) {
  // when doing `new` on the proxy, behave like it was done on the wrapped function
  // https://github.com/tc39/ecma262/issues/1052
  if (newTarget === proxy) {
    newTarget = target
  }

  const boundedConstructor = Reflect.construct.bind(null, target, argumentsList, newTarget)

  // metadata should contain the original function (target)
  const metadata = new InvocationData(
    target, argumentsList, newTarget, undefined /* this */, boundedConstructor)

  // finally call the hook, which in turn will call the constructor
  return hook(metadata, boundedConstructor)
}

// see proxy handler property access trap doc for details about the arguments
function propertyAccessTrap (wrappedFunction,
  // standard trap args follows
  target, propertyKey, receiver) {
  // standard property value resolution
  const result = Reflect.get(target, propertyKey, receiver)

  const originalToString = Function.prototype.toString

  // only do the trick if getting the original toString directly
  // https://github.com/LucaFranceschini/wrapper-roo/issues/22
  return result === originalToString && propertyKey === 'toString'
    ? toStringCache.get(wrappedFunction)
    : result
}
