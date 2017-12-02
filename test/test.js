'use strict';

const assert = require('assert')
    , wrap = require('../index')

function gimme42() { return 42 }
function emptyHook() { }

describe('wrap', function () {
  describe('#wrapFunction()', function () {
    it('should have default hooks', function () {
      wrap.aFunction(gimme42)
    })

    it('should throw if not wrapping a function', function () {
      assert.throws(() => wrap.aFunction(42), TypeError)
    })

    it('should throw if prehook is not a function', function () {
      assert.throws(() => wrap.aFunction(42), TypeError)
    })

    it('should throw if posthook is not a function', function () {
      assert.throws(() => wrap.aFunction(42), TypeError)
    })

    it('should return a function', function () {
      assert.equal(typeof wrap.aFunction(gimme42), 'function')
    })

    it('should invoke wrapped function exactly once', function () {
      let counter = 0
      function increment() { ++counter }
      const wrapped = wrap.aFunction(increment)
      wrapped()
      assert.equal(counter, 1)
    })

    it('should invoke prehook exactly once', function () {
      let counter = 0
      function increment() { ++counter }
      const wrapped = wrap.aFunction(gimme42, increment)
      wrapped()
      assert.equal(counter, 1)
    })

    it('should invoke posthook exactly once', function () {
      let counter = 0
      function increment() { ++counter }
      const wrapped = wrap.aFunction(gimme42, emptyHook, increment)
      wrapped()
      assert.equal(counter, 1)
    })

    it('should invoke posthook even when throwing', function () {
      let invoked = false
      function postHook() { invoked = true }
      function thrower() { throw new Error() }
      const wrapped = wrap.aFunction(thrower, emptyHook, postHook)
      try {
        wrapped()
      } catch (e) {
        assert(invoked)
      }
    })

    it('should forward arguments', function () {
      const args = [1, 2, 3]
      function toWrap(...a) { assert.deepEqual(a, args) }
      const wrapped = wrap.aFunction(toWrap)
      wrapped.apply(null, args)
    })

    it('should forward return value', function () {
      const wrapped = wrap.aFunction(gimme42)
      assert.equal(wrapped(), gimme42())
    })

    it('should re-throw the same error', function () {
      const error = new Error()
      function thrower() { throw error }
      const wrapped = wrap.aFunction(thrower)
      try {
        wrapped()
      } catch (e) {
        assert.equal(error, e)
      }
    })

    it('what about capturing this?')
  })
})
