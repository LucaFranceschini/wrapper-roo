'use strict'

import { wrap } from './setup.js'

describe('ES6 arrow functions', function () {
  it('should work with arrow functions', function () {
    const wrapped = wrap.the(n => n * 2)
    wrapped(42).should.equal(84)
  })

  it('should throw when using arrows as constructors', function () {
    const Wrapped = wrap.the(() => { })
    ;(() => new Wrapped()).should.throw(TypeError)
  })
})
