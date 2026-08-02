'use strict'

// require this file in every test suite

import assert from 'node:assert/strict'
import sinon from 'sinon'

import wrap from '../index.js'

const spy = sinon.spy()
beforeEach('make the spy reusable', function () { spy.resetHistory() })

function nop () { }

export {
  assert,
  nop,
  sinon,
  spy,
  wrap
}
