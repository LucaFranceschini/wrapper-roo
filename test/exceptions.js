'use strict'

const { nop, sinon, spy, wrap } = require('./setup')

describe('exceptions handling', function () {
  function throw42 () { throw new Error(42) }

  it('should propagate the error if preHook throws', function () {
    wrap(nop).withPreHook(throw42).should.throw(/42/)
  })

  it('should propagate the error if postHook throws', function () {
    wrap(nop).withPostHook(throw42).should.throw(/42/)
  })

  it('should throw postHook error even if func throws', function () {
    function throwError () { throw new Error() }
    wrap(throwError).withPostHook(throw42).should.throw(/42/)
  })

  it('should call postHook exactly once even if func throws', function () {
    const wrapped = wrap(throw42).withPostHook(spy)
    wrapped.should.throw(/42/)
    spy.should.have.been.calledOnce()
  })

  it('should call postHook exactly once even if it throws', function () {
    const spy = sinon.spy(throw42)
    const wrapped = wrap(nop).withPostHook(spy)
    wrapped.should.throw(/42/)
    spy.should.have.been.calledOnce()
  })

  it('should invoke postHook even when func throws', function () {
    const wrapped = wrap(throw42).withPostHook(spy)
    wrapped.should.throw(/42/)
    spy.should.have.been.calledOnce()
  })

  it('should re-throw the same error', function () {
    wrap.the(throw42).should.throw(/42/)
  })
})
