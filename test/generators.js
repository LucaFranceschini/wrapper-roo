import { assert, describe, it, wrap } from "./setup.js";

describe("ES6 generator functions", () => {
	it("should work with generator functions", () => {
		// start inclusive, end exclusive
		function* range(start, end) {
			while (start < end) yield start++;
		}
		const wrappedRange = wrap.the(range);
		let sum = 0;
		for (const i of wrappedRange(1, 4)) sum += i;
		assert.strictEqual(sum, 6);
	});

	it("should preserve non-constructibility of generators (ES7)", () => {
		function* gen() {}
		const WrappedGenerator = wrap.the(gen);
		assert.throws(() => new WrappedGenerator(), TypeError);
	});
});
