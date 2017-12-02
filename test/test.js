const assert = require('assert')
    , wrap = require('../index')

function emptyHook() { }

describe('wrapFunction()', function() {
  it('should not change return value', function() {
    function gimme42() { return 42 }
    const wrapped = wrap.aFunction(gimme42, emptyHook, emptyHook)
    assert.equal(wrapped(), gimme42())
  })
  
  it('should re-throw the same error', function() {
    const error = new Error()
    function thrower() { throw error }
    const wrapped = wrap.aFunction(thrower, emptyHook, emptyHook)
    try {
      wrapped()
    } catch (e) {
      assert.equal(error, e)
    }
  })
})
