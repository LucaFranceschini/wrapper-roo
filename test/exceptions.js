

import { assert, describe, it, nop, sinon, wrap } from "./setup.js";

describe("Exception handling", () => {
	function throw42() {
		throw new Error(42);
	}

	it("should propagate the error if pre-hook throws", () => {
		const wrapped = wrap(nop).withPreHook(throw42);
		assert.throws(wrapped, /42/);
	});

	it("should propagate the error if post-hook throws", () => {
		const wrapped = wrap(nop).withPostHook(throw42);
		assert.throws(wrapped, /42/);
	});

	it("should throw post-hook error even if wrapped function throws", () => {
		function throwError() {
			throw new Error();
		}
		const wrapped = wrap(throwError).withPostHook(throw42);
		assert.throws(wrapped, /42/);
	});

	it("should call post-hook exactly once even if wrapped function throws", () => {
		const spy = sinon.spy();
		const wrapped = wrap(throw42).withPostHook(spy);
		assert.throws(wrapped, /42/);
		sinon.assert.calledOnce(spy);
	});

	it("should call post-hook exactly once even if it throws", () => {
		const spy = sinon.spy(throw42);
		const wrapped = wrap(nop).withPostHook(spy);
		assert.throws(wrapped, /42/);
		sinon.assert.calledOnce(spy);
	});

	it("should invoke post-hook even when wrapped function throws", () => {
		const spy = sinon.spy();
		const wrapped = wrap(throw42).withPostHook(spy);
		assert.throws(wrapped, /42/);
		sinon.assert.calledOnce(spy);
	});

	it("should re-throw the same error", () => {
		const wrapped = wrap.the(throw42);
		assert.throws(wrapped, /42/);
	});
});
