'use strict'

import { wrap } from './setup.js'

describe('Constructor calls', function () {
  function Box (value) { this.value = value }

  it('should not change constructed objects', function () {
    const Wrapped = wrap.the(Box)
    new Wrapped(42).should.deep.equal(new Box(42))
  })

  it('should preserve prototype link in constructor calls', function () {
    const Wrapped = wrap.the(Box)
    const box = new Wrapped(42)
    box.should.have.prototype(Box.prototype)
  })

  it('should preserve new.target', function () {
    function GimmeNewTarget () { return new.target }
    function MyConstructor () { }
    const Wrapped = wrap.the(GimmeNewTarget)
    Reflect.construct(Wrapped, [], MyConstructor).should.equal(MyConstructor)
  })
})
