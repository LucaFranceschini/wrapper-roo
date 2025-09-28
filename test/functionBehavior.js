'use strict'

import { spy, wrap } from './setup.js'

describe('Wrapped function behavior', function () {
  it('should forward arguments', function () {
    const args = [1, 2, 3]
    const wrapped = wrap.the(spy)
    wrapped(...args)
    spy.should.always.have.been.calledWithExactly(...args)
  })

  it('should forward return value', function () {
    const wrapped = wrap.the(() => 42)
    wrapped().should.equal(42)
  })

  it('should work with default parameter values', function () {
    function argOr42 (arg = 42) { return arg }
    const wrapped = wrap.the(argOr42)
    wrapped().should.equal(42)
    wrapped(7).should.equal(7)
  })
})
