'use strict'

const { wrap } = require('./setup')

describe('ES6 generator functions', function () {
  it('should work with generator functions', function () {
    // start inclusive, end exclusive
    function * range (start, end) {
      while (start < end) yield start++
    }
    const wrappedRange = wrap.the(range)
    let sum = 0
    for (const i of wrappedRange(1, 4)) sum += i
    sum.should.equal(6)
  })

  it('should preserve non-constructibility of generators (ES7)', function () {
    function * gen () { }
    const WrappedGenerator = wrap.the(gen)
    ;(() => new WrappedGenerator()).should.throw(TypeError)
  })
})
