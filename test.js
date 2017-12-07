'use strict'

const assert = require('assert')
    , wrap = require('./index')

// helper function to be wrapped
function nop() { }
function thrower() { throw new Error() }

describe('wrap(func)', function () {
  it('should fail fast if func is not a function', function () {
    assert.throws(() => wrap(42), TypeError)
  })

  describe('.withPreHook(preHook)', function () {
    it('should throw if preHook is not a function', function () {
      assert.throws(() => wrap(nop).withPreHook('hey'), TypeError)
    })

    it('should throw if preHook throws', function () {
      assert.throws(wrap(nop).withPreHook(thrower), Error)
    })

    it('should invoke preHook exactly once', function () {
      let counter = 0
      function increment() { ++counter }
      const wrapped = wrap(nop).withPreHook(increment)
      wrapped()
      assert.strictEqual(counter, 1)
    })
  })

  describe('.withPostHook(postHook)', function () {
    it('should throw if postHook is not a function', function () {
      assert.throws(() => wrap(nop).withPostHook('ho'), TypeError)
    })

    it('should throw if postHook throws', function () {
      assert.throws(wrap(nop).withPostHook(thrower), Error)
    })

    it('should throw postHook error even if func throws', function () {
      function throw42() { throw 42 }
      assert.throws(wrap(thrower).withPostHook(throw42), /42/)
    })

    it('should call postHook exactly once if func throws', function () {
      let counter = 0
      function increment() { ++counter }
      const wrapped = wrap(thrower).withPostHook(increment)
      try {
        wrapped()
      } catch (e) { }
      assert.strictEqual(counter, 1)
    })

    it('should call postHook exactly once if it throws', function () {
      let counter = 0
      function incrementAndThrow() {
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
      function increment() { ++counter }
      const wrapped = wrap(nop).withPostHook(increment)
      wrapped()
      assert.strictEqual(counter, 1)
    })

    it('should invoke postHook even when func throws', function () {
      let invoked = false
      function postHook() { invoked = true }
      const wrapped = wrap(thrower).withPostHook(postHook)
      try {
        wrapped()
      } catch (e) {
        assert(invoked)
      }
    })
  })

  describe('.withPrePostHooks(preHook, postHook)', function () {
    it('should invoke hooks and func in the right order', function () {
      let result = ''
      function foo() { result += 'b' }
      const preHook = () => result += 'a'
          , postHook = () => result += 'c'
          , wrapped = wrap(foo).withPrePostHooks(preHook, postHook)
      wrapped()
      assert.strictEqual(result, 'abc')
    })
  })

  describe('all functions above', function () {
    // helper functions to be wrapped
    function gimme42() { return 42 }
    function gimmeThis() { return this }
    function Box(value) { this.value = value }

    it('should return a function', function () {
      assert.equal(typeof wrap(nop).justBecause(), 'function')
    })

    it('should return a different function', function () {
      assert.notEqual(wrap(nop).justBecause(), gimme42)
    })

    it('should invoke func exactly once', function () {
      let counter = 0
      function increment() { ++counter }
      const wrapped = wrap(increment).justBecause()
      wrapped()
      assert.strictEqual(counter, 1)
    })

    it('should forward arguments', function () {
      const args = [1, 2, 3]
      // don't use 'arguments' object, it would not be equal to 'args'
      function toWrap(...a) { assert.deepStrictEqual(a, args) }
      const wrapped = wrap(toWrap).justBecause()
      wrapped(...args)
    })

    it('should forward return value', function () {
      const wrapped = wrap(gimme42).justBecause()
      assert.strictEqual(wrapped(), gimme42())
    })

    it('should re-throw the same error', function () {
      const error = new Error()
      function thrower() { throw error }
      const wrapped = wrap(thrower).justBecause()
      try {
        wrapped()
      } catch (e) {
        assert.strictEqual(error, e)
      }
    })

    // we assume strict mode, so default binding for 'this' is undefined
    it('should preserve default this binding (undefined)', function () {
      const wrapped = wrap(gimmeThis).justBecause()
      assert.strictEqual(wrapped(), undefined)
    })

    it('should preserve bind()', function () {
      // do not bind to 'this' here, it would be the Mocha context
      // it is cyclic so not printable in case of errors
      const obj = { }
          , bound = gimmeThis.bind(obj)
          , wrapped = wrap(bound).justBecause()
      assert.strictEqual(wrapped(), obj)
    })

    it('should preserve constructor calls', function () {
      const Wrapped = wrap(Box).justBecause()
      assert.strictEqual(new Wrapped(42).value, 42)
    })

    it('should preserve prototypes link in constructor calls', function () {
      const Wrapped = wrap(Box).justBecause()
          , box = new Wrapped(42)
      assert.strictEqual(Object.getPrototypeOf(box), Box.prototype)
    })

    it('should work if called with explicit binding', function () {
      const wrapped = wrap(gimmeThis).justBecause()
          , obj = { }
      // should return undefined and not obj
      assert.strictEqual(gimmeThis.call(obj, wrapped),
                         wrapped.call(obj, wrapped))
    })

    it("should allow 'new' to override bind() (partial application)",
      function () {
        function Pair(a, b) {
          this.a = a
          this.b = b
        }

        // don't care about 'this' here, just fix first argument
        // 'this' will be overridden by constructor call anyway
        const Pair42 = Pair.bind(null, 42)

        // wrap both
        const WrappedPair = wrap(Pair).justBecause()
            , WrappedPair42 = wrap(Pair42).justBecause()

        assert.deepStrictEqual(new Pair(42, 'foo'), new Pair42('foo'))
        assert.deepStrictEqual(new WrappedPair(42, 'foo'),
                               new WrappedPair42('foo'))
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
      function foo() { }
      foo.prototype = myPrototype

      const wrapped = wrap(foo).justBecause()
      assert.strictEqual(wrapped.prototype, foo.prototype)
    })

    it('should preserve the internal prototype', function () {
      // change prototype and check if it is preserved
      const myPrototype = {}
      function foo() { }
      Object.setPrototypeOf(foo, myPrototype)

      const wrapped = wrap(foo).justBecause()
          , originalProto = Object.getPrototypeOf(foo)
          , wrappedProto = Object.getPrototypeOf(wrapped)
      assert.strictEqual(originalProto, wrappedProto)
    })

    // this also checks for properties whose key is a Symbol
    it('should copy all own properties', function () {
      // wrap a function with a number of arguments > 0 to avoid default
      const wrapped = wrap(Box).justBecause()
          , originalDescriptors = Object.getOwnPropertyDescriptors(Box)
          , wrappedDescriptors = Object.getOwnPropertyDescriptors(wrapped)
      assert.deepStrictEqual(originalDescriptors, wrappedDescriptors)
    })

    it('should work with getters', function () {
      const idiot = { get name() { return 'luca' } }
          , descriptor = Object.getOwnPropertyDescriptor(idiot, 'name')
      descriptor.get = wrap(descriptor.get).justBecause()
      assert.strictEqual(idiot.name, 'luca')
    })

    it('should work with setters', function () {
      const idiot = { set name(name) { this._name = name } }
          , descriptor = Object.getOwnPropertyDescriptor(idiot, 'name')
      descriptor.set = wrap(descriptor.set).justBecause()
      idiot.name = 'luca'
      assert.strictEqual(idiot._name, 'luca')
    })
  })
})
