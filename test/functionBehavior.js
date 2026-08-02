

import { assert, describe, it, sinon, wrap } from "./setup.js";

describe("Wrapped function behavior", () => {
	it("should forward arguments", () => {
		const args = [1, 2, 3];
		const spy = sinon.spy();
		const wrapped = wrap.the(spy);
		wrapped(...args);
		sinon.assert.calledWithExactly(spy, ...args);
	});

	it("should forward return value", () => {
		const wrapped = wrap.the(() => 42);
		assert.strictEqual(wrapped(), 42);
	});

	it("should work with default parameter values", () => {
		function argOr42(arg = 42) {
			return arg;
		}
		const wrapped = wrap.the(argOr42);
		assert.strictEqual(wrapped(), 42);
		assert.strictEqual(wrapped(7), 7);
	});
});
