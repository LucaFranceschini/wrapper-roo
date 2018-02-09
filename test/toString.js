'use strict'

const { nop, spy, wrap } = require('./setup')

describe('toString method', function () {
  it('should preserve toString() result', function () {
    wrap.the(nop).toString().should.equal(nop.toString())
  })

  it('should called overridden toString() if any', function () {
    function foo () { }
    foo.toString = spy
    wrap.the(foo).toString()
    spy.should.have.been.calledOnce()
  })

  it('should return original toString() if accessed indirectly', function () {
    function foo () { }
    foo.alias = foo.toString
    wrap.the(foo).alias.should.equal(Function.prototype.toString)
  })

  it('should always return the same toString()', function () {
    wrap.the(nop).toString.should.equal(wrap.the(nop).toString)
  })
})
