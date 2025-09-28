'use strict'

// require this file in every test suite

import * as chai from 'chai'
import { should, expect } from 'chai'
import 'chai/register-should.js' // using Should style

import dirtyChai from 'dirty-chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai' // load after dirty-chai
import wrap from '../index.js'

chai.use(dirtyChai) // lint-friendly assertions
chai.use(sinonChai) // Sinon mocking framework

const spy = sinon.spy()
beforeEach('make the spy reusable', function () { spy.resetHistory() })

// ad-hoc assertion to check prototypes
chai.use(function (_chai) {
  _chai.Assertion.addMethod('prototype', function (expected) {
    const found = Object.getPrototypeOf(this._obj)

    this.assert(
      found === expected,
      // normal and negated assertion message, respectively
      'expected #{this} to have prototype #{exp} but got #{act}',
      'expected #{this} to not have prototype #{act}',
      expected,
      found
    )
  })
})

// ad-hoc assertion to check non-writable non-configurable class fields
chai.use(function (_chai) {
  _chai.Assertion.addMethod('immutableField', function (key) {
    const descriptor = Object.getOwnPropertyDescriptor(this._obj, key)

    this.assert(
      !(descriptor.configurable || descriptor.writable),
      // normal and negated assertion message, respectively
      'expected #{this} to have non-configurable non-writable property #{exp}',
      'expected #{this} to not have prototype configurable or writable property #{exp}',
      key // expected
    )
  })
})

function nop () { }

export {
  expect,
  nop,
  should,
  sinon,
  spy,
  wrap
}
