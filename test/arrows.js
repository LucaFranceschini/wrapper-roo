

import { assert, describe, it, wrap } from "./setup.js";

describe("ES6 arrow functions", () => {
	it("should work with arrow functions", () => {
		const wrapped = wrap.the((n) => n * 2);
		assert.strictEqual(wrapped(42), 84);
	});

	it("should throw when using arrows as constructors", () => {
		const Wrapped = wrap.the(() => {});
		assert.throws(() => new Wrapped(), TypeError);
	});
});
