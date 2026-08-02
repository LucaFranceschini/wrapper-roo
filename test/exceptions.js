'use strict'

import { assert, nop, sinon, spy, wrap } from './setup.js'

describe('Exception handling', function () {
  function throw42 () { throw new Error(42) }

  it('should propagate the error if pre-hook throws', function () {
	  const wrapped = wrap(nop).withPreHook(throw42)
	  assert.throws(wrapped, /42/)
  })

  it('should propagate the error if post-hook throws', function () {
	  const wrapped = wrap(nop).withPostHook(throw42)
	  assert.throws(wrapped, /42/)
  })

  it('should throw post-hook error even if wrapped function throws', function () {
    function throwError () { throw new Error() }
	const wrapped = wrap(throwError).withPostHook(throw42)
	assert.throws(wrapped, /42/)
  })

  it('should call post-hook exactly once even if wrapped function throws', function () {
    const wrapped = wrap(throw42).withPostHook(spy)
    assert.throws(wrapped ,/42/)
	sinon.assert.calledOnce(spy)
  })

  it('should call post-hook exactly once even if it throws', function () {
    const spy = sinon.spy(throw42)
    const wrapped = wrap(nop).withPostHook(spy)
	assert.throws(wrapped, /42/)
	sinon.assert.calledOnce(spy)
  })

  it('should invoke post-hook even when wrapped function throws', function () {
    const wrapped = wrap(throw42).withPostHook(spy)
    assert.throws(wrapped, /42/)
	sinon.assert.calledOnce(spy)
  })

  it('should re-throw the same error', function () {
	  const wrapped = wrap.the(throw42)
	  assert.throws(wrapped, /42/)
  })
})
