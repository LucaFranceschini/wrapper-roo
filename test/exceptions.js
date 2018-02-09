'use strict'

const { nop, sinon, spy, wrap } = require('./setup')

describe('Exception handling', function () {
  function throw42 () { throw new Error(42) }

  it('should propagate the error if pre-hook throws', function () {
    wrap(nop).withPreHook(throw42).should.throw(/42/)
  })

  it('should propagate the error if post-hook throws', function () {
    wrap(nop).withPostHook(throw42).should.throw(/42/)
  })

  it('should throw post-hook error even if wrapped function throws', function () {
    function throwError () { throw new Error() }
    wrap(throwError).withPostHook(throw42).should.throw(/42/)
  })

  it('should call post-hook exactly once even if wrapped function throws', function () {
    const wrapped = wrap(throw42).withPostHook(spy)
    wrapped.should.throw(/42/)
    spy.should.have.been.calledOnce()
  })

  it('should call post-hook exactly once even if it throws', function () {
    const spy = sinon.spy(throw42)
    const wrapped = wrap(nop).withPostHook(spy)
    wrapped.should.throw(/42/)
    spy.should.have.been.calledOnce()
  })

  it('should invoke post-hook even when wrapped function throws', function () {
    const wrapped = wrap(throw42).withPostHook(spy)
    wrapped.should.throw(/42/)
    spy.should.have.been.calledOnce()
  })

  it('should re-throw the same error', function () {
    wrap.the(throw42).should.throw(/42/)
  })
})
