'use strict'

const assert = require('assert')
const wrap = require('./index')

// helper functions to be wrapped
function nop () { }
function thrower () { throw new Error() }
function gimme42 () { return 42 }
function gimmeThis () { return this }
function Box (value) { this.value = value }
class Person {
  constructor (name) {
    this.name = name
  }
}

describe('wrapPrePostHooks(func, preHook, postHook)', function () {
  it('should throw if preHook is not a function', function () {
    assert.throws(() => wrap(nop).withPreHook('hey'), TypeError)
  })

  it('should throw if preHook throws', function () {
    assert.throws(wrap(nop).withPreHook(thrower), Error)
  })

  it('should invoke preHook exactly once', function () {
    let counter = 0
    function increment () { ++counter }
    const wrapped = wrap(nop).withPreHook(increment)
    wrapped()
    assert.strictEqual(counter, 1)
  })

  it('should throw if postHook is not a function', function () {
    assert.throws(() => wrap(nop).withPostHook('ho'), TypeError)
  })

  it('should throw if postHook throws', function () {
    assert.throws(wrap(nop).withPostHook(thrower), Error)
  })

  it('should throw postHook error even if func throws', function () {
    function MyError () { }
    function throwMyError () { throw new MyError() }
    assert.throws(wrap(thrower).withPostHook(throwMyError), MyError)
  })

  it('should call postHook exactly once if func throws', function () {
    let counter = 0
    function increment () { ++counter }
    const wrapped = wrap(thrower).withPostHook(increment)
    try {
      wrapped()
    } catch (e) { }
    assert.strictEqual(counter, 1)
  })

  it('should call postHook exactly once if it throws', function () {
    let counter = 0
    function incrementAndThrow () {
      ++counter
      throw new Error()
    }
    const wrapped = wrap(nop).withPostHook(incrementAndThrow)
    try {
      wrapped()
    } catch (e) { }
    assert.strictEqual(counter, 1)
  })

  it('should invoke postHook exactly once', function () {
    let counter = 0
    function increment () { ++counter }
    const wrapped = wrap(nop).withPostHook(increment)
    wrapped()
    assert.strictEqual(counter, 1)
  })

  it('should invoke postHook even when func throws', function () {
    let invoked = false
    function postHook () { invoked = true }
    const wrapped = wrap(thrower).withPostHook(postHook)
    try {
      wrapped()
    } catch (e) {
      assert(invoked)
    }
  })

  it('should invoke hooks and func in the right order', function () {
    let result = ''
    function foo () { result += 'b' }
    const preHook = () => { result += 'a' }
    const postHook = () => { result += 'c' }
    const wrapped = wrap(foo).withPrePostHooks(preHook, postHook)
    wrapped()
    assert.strictEqual(result, 'abc')
  })

  it('should return a function', function () {
    assert.equal(typeof wrap(nop).justBecause(), 'function')
  })

  it('should return a different function', function () {
    assert.notEqual(wrap(nop).justBecause(), gimme42)
  })

  it('should invoke func exactly once', function () {
    let counter = 0
    function increment () { ++counter }
    const wrapped = wrap(increment).justBecause()
    wrapped()
    assert.strictEqual(counter, 1)
  })

  it('should forward arguments', function () {
    const args = [1, 2, 3]
    // don't use 'arguments' object, it would not be equal to 'args'
    function toWrap (...a) { assert.deepStrictEqual(a, args) }
    const wrapped = wrap(toWrap).justBecause()
    wrapped(...args)
  })

  it('should forward return value', function () {
    const wrapped = wrap(gimme42).justBecause()
    assert.strictEqual(wrapped(), gimme42())
  })

  it('should re-throw the same error', function () {
    const error = new Error()
    function thrower () { throw error }
    const wrapped = wrap(thrower).justBecause()
    try {
      wrapped()
    } catch (e) {
      assert.strictEqual(error, e)
    }
  })

  it('should preserve default this binding (undefined)', function () {
    const wrapped = wrap(gimmeThis).justBecause()
    assert.strictEqual(wrapped(), gimmeThis())
  })

  it('should preserve bind()', function () {
    // do not bind to 'this' here, it would be the Mocha context
    // it is cyclic so not printable in case of errors
    const obj = { }
    const bound = gimmeThis.bind(obj)
    const wrapped = wrap(bound).justBecause()
    assert.strictEqual(wrapped(), obj)
  })

  it('should not change constructed objects', function () {
    const Wrapped = wrap(Box).justBecause()
    assert.deepStrictEqual(new Wrapped(42), new Box(42))
  })

  it('should preserve prototype link in constructor calls', function () {
    const Wrapped = wrap(Box).justBecause()
    const box = new Wrapped(42)
    assert.strictEqual(Object.getPrototypeOf(box), Box.prototype)
  })

  it('should work if called with explicit binding', function () {
    const wrapped = wrap(gimmeThis).justBecause()
    const obj = { }
    // should return undefined and not obj
    assert.strictEqual(gimmeThis.call(obj, wrapped),
                       wrapped.call(obj, wrapped))
  })

  it('should not introduce prototype property', function () {
    const bound = nop.bind(null)  // bind 'this' to null, don't care
    const wrapped = wrap(bound).justBecause()
    // bound functions have no 'prototype' property
    assert(!Object.getOwnPropertyNames(bound).includes('prototype'))
    // thus it should not be in the wrapped bound function
    assert(!Object.getOwnPropertyNames(wrapped).includes('prototype'))
  })

  /* This is seriously evil...
   * Bound functions have no 'prototype' property by default. When they are
   * used in constructor calls, the 'prototype' property of the bound
   * functions is used. A bad man could add a 'prototype' function to the
   * bound function...
   * This means that checking existence of such property is not a reliable way
   * to detect bound functions.
   * Note: we're not talking about the internal [[Prototype]].
   */
  it('should preserve constructor behavior of bound functions', function () {
    function Foo () { }
    Foo.prototype.bar = 'baz'
    const Bound = Foo.bind(null)
    assert(!Object.getOwnPropertyNames(Bound).includes('prototype'))
    Bound.prototype = { }
    const Wrapped = wrap(Bound).justBecause()
    assert.strictEqual(new Bound().bar, 'baz')
    assert.strictEqual(new Wrapped().bar, 'baz')
  })

  it('should allow partial application with Function.bind', function () {
    function Pair (a, b) {
      this.a = a
      this.b = b
    }

    // don't care about 'this' here, just fix first argument
    // 'this' will be overridden by constructor call anyway
    const Pair42 = Pair.bind(null, 42)

    // wrap both
    const WrappedPair = wrap(Pair).justBecause()
    const WrappedPair42 = wrap(Pair42).justBecause()

    assert.deepStrictEqual(new Pair(42, 'foo'), new Pair42('foo'))
    assert.deepStrictEqual(new WrappedPair(42, 'foo'),
                           new WrappedPair42('foo'))
    assert.deepStrictEqual(new Pair42('foo'), new WrappedPair42('foo'))
    // the other combination does not involve explicit binding
  })

  it('should preserve function name', function () {
    const wrapped = wrap(gimme42).justBecause()
    assert.strictEqual(wrapped.name, gimme42.name)
  })

  it('should preserve number of expected arguments', function () {
    // wrap a function with a number of arguments > 0
    const wrapped = wrap(Box).justBecause()
    assert.strictEqual(wrapped.length, Box.length)
  })

  it('should preserve Function.prototype property', function () {
    // change default prototype property
    const myPrototype = {}
    function foo () { }
    foo.prototype = myPrototype

    const wrapped = wrap(foo).justBecause()
    assert.strictEqual(wrapped.prototype, foo.prototype)
  })

  it('should preserve the internal prototype', function () {
    // change prototype and check if it is preserved
    const myPrototype = {}
    function foo () { }
    Object.setPrototypeOf(foo, myPrototype)

    const wrapped = wrap(foo).justBecause()
    const originalProto = Object.getPrototypeOf(foo)
    const wrappedProto = Object.getPrototypeOf(wrapped)
    assert.strictEqual(originalProto, wrappedProto)
  })

  // this also checks for properties whose key is a Symbol
  it('should copy all own properties', function () {
    // wrap a function with a number of arguments > 0 to avoid default
    const wrapped = wrap(Box).justBecause()
    const originalDescriptors = Object.getOwnPropertyDescriptors(Box)
    const wrappedDescriptors = Object.getOwnPropertyDescriptors(wrapped)
    assert.deepStrictEqual(originalDescriptors, wrappedDescriptors)
  })

  it('should work with getters', function () {
    const idiot = { get name () { return 'luca' } }
    const descriptor = Object.getOwnPropertyDescriptor(idiot, 'name')
    descriptor.get = wrap(descriptor.get).justBecause()
    assert.strictEqual(idiot.name, 'luca')
  })

  it('should work with setters', function () {
    const idiot = {
      set name (name) { this._name = name },
      get name () { return this._name }
    }
    const descriptor = Object.getOwnPropertyDescriptor(idiot, 'name')
    descriptor.set = wrap(descriptor.set).justBecause()
    idiot.name = 'luca'
    assert.strictEqual(idiot._name, 'luca')
  })

  it('should work with arrow functions', function () {
    const double = n => n * 2
    const wrapped = wrap(double).justBecause()
    assert.strictEqual(wrapped(42), 84)
  })

  it('should throw when using arrows as constructors', function () {
    const Wrapped = wrap(() => { }).justBecause()
    assert.throws(() => new Wrapped(), TypeError)
  })

  it('should preserve default parameter values', function () {
    function argOr42 (arg = 42) { return arg }
    const wrapped = wrap(argOr42).justBecause()
    assert.strictEqual(wrapped(), 42)
    assert.strictEqual(wrapped(7), 7)
  })

  it('should preserve rest parameters', function () {
    const args = [1, 2, 3]
    function gimmeRestArgs (...a) { return a }
    const wrapped = wrap(gimmeRestArgs).justBecause()
    assert.deepStrictEqual(wrapped(...args), args)
  })

  it('should work when func is a class (constructor)', function () {
    const WrappedPerson = wrap(Person).justBecause()
    assert.deepStrictEqual(new Person('alonzo'), new WrappedPerson('alonzo'))
  })

  it('should throw when func is a class but new is not used', function () {
    const WrappedPerson = wrap(Person).justBecause()
    assert.throws(() => WrappedPerson('haskell'), TypeError)
  })

  it('should work with class inheritance', function () {
    class FullNamePerson extends Person {
      constructor (firstName, lastName) {
        super(firstName + ' ' + lastName)
      }
    }
    const WrappedFullNamePerson = wrap(FullNamePerson).justBecause()
    assert.strictEqual(new WrappedFullNamePerson('ada', 'lovelace').name,
                       new Person('ada lovelace').name)
  })

  it('should preserve class static methods', function () {
    class NiceGuy {
      static sayHi () { return 'hi' }
    }
    const WrappedNiceGuy = wrap(NiceGuy).justBecause()
    assert.strictEqual(WrappedNiceGuy.sayHi(), 'hi')
  })

  it('should preserve Symbol properties of func', function () {
    function foo () { }
    const symbol = Symbol('shh')
    foo[symbol] = 'top secret'
    const wrapped = wrap(foo).justBecause()
    assert.strictEqual(wrapped[symbol], foo[symbol])
  })

  it('should work with generator functions', function () {
    // start inclusive, end exclusive
    function * range (start, end) {
      while (start < end) yield start++
    }
    let sum = 0
    const wrappedRange = wrap(range).justBecause()
    for (const i of wrappedRange(1, 4)) sum += i
    assert.strictEqual(sum, 6)
  })

  it('should preserve non-constructibility', function () {
    // since ES7 generators are not constructible
    function * gen () { }
    const Wrapped = wrap(gen).justBecause()
    assert(() => new Wrapped(), TypeError)
  })

  it('should preserve new.target', function () {
    function someConstructor () { }
    const WrappedArray = wrap(Array).justBecause()
    // use the given constructor but inherit from (Wrapped)Array
    const object = Reflect.construct(WrappedArray, [], someConstructor)
    assert.strictEqual(Object.getPrototypeOf(object),
                       someConstructor.prototype)
    assert(Array.isArray(object))
  })
})
