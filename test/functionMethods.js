'use strict'

const { nop, wrap } = require('./setup')

describe('Function methods', function () {
  // foo.apply could be redefined to do something different from function call
  // https://github.com/LucaFranceschini/wrapper-roo/issues/26
  it('should not invoke an overridden apply()', function () {
    function foo () { }
    foo.apply = () => { throw new Error() }
    foo.should.not.throw(Error)
    foo.apply.should.throw(Error)
    wrap.the(foo).should.not.throw(Error)
  })

  // foo.call could be redefined to do something different from function call
  it('should not invoke an overridden call()', function () {
    function foo () { }
    foo.call = () => { throw new Error() }
    foo.should.not.throw(Error)
    foo.call.should.throw(Error)
    wrap.the(foo).should.not.throw(Error)
  })

  // foo.bind could be redefined to do something different from function call
  // old implementation used bind
  it('should not invoke an overridden bind()', function () {
    function foo () { }
    foo.bind = () => { throw new Error() }
    foo.should.not.throw(Error)
    foo.bind.should.throw(Error)
    wrap.the(foo).should.not.throw(Error)
  })

  // Reflect.apply could be redefined to do something different from function call
  it('should not invoke an overridden Reflect.apply()', function () {
    // restore it after the test!
    const originalApply = Reflect.apply

    Reflect.apply = () => { throw new Error() }
    // every use of Reflect.apply will now throw
    ;(() => Reflect.apply(nop)).should.throw(Error)
    wrap.the(nop).should.not.throw(Error)

    Reflect.apply = originalApply
  })
})
