'use strict'

import { assert, nop, sinon, spy, wrap } from './setup.js'

describe('Number and order of invocations', function () {
  it('should invoke pre-hook exactly once', function () {
    const wrapped = wrap(nop).withPreHook(spy)
    wrapped()
	sinon.assert.calledOnce(spy)
  })

  it('should invoke post-hook exactly once', function () {
    const wrapped = wrap(nop).withPostHook(spy)
    wrapped()
	sinon.assert.calledOnce(spy)
  })

  it('should invoke hooks and wrapped function in the right order', function () {
    const preSpy = sinon.spy()
    const postSpy = sinon.spy()
    const wrapped = wrap(spy).withPrePostHooks(preSpy, postSpy)
    wrapped()
    assert.ok(preSpy.calledImmediatelyBefore(spy))
    assert.ok(postSpy.calledImmediatelyAfter(spy))
  })

  it('should invoke wrapped function exactly once', function () {
    const wrapped = wrap.the(spy)
    wrapped()
	sinon.assert.calledOnce(spy)
  })

  it('should invoke the custom hook', function () {
    wrap(nop).withCustomHook(spy)()
	sinon.assert.calledOnce(spy)
  })
})
