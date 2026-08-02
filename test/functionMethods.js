import { assert, describe, it, nop, wrap } from "./setup.js";

describe("Function methods", () => {
	// foo.apply could be redefined to do something different from function call
	// https://github.com/LucaFranceschini/wrapper-roo/issues/26
	it("should not invoke an overridden apply()", () => {
		function foo() {}
		foo.apply = () => {
			throw new Error();
		};

		assert.doesNotThrow(foo);
		assert.throws(foo.apply, Error);
		assert.doesNotThrow(wrap.the(foo));
	});

	// foo.call could be redefined to do something different from function call
	it("should not invoke an overridden call()", () => {
		function foo() {}
		foo.call = () => {
			throw new Error();
		};

		assert.doesNotThrow(foo);
		assert.throws(foo.call, Error);
		assert.doesNotThrow(wrap.the(foo));
	});

	// foo.bind could be redefined to do something different from function call
	// old implementation used bind
	it("should not invoke an overridden bind()", () => {
		function foo() {}
		foo.bind = () => {
			throw new Error();
		};

		assert.doesNotThrow(foo);
		assert.throws(foo.bind, Error);
		assert.doesNotThrow(wrap.the(foo));
	});

	// Reflect.apply could be redefined to do something different from function call
	it("should not invoke an overridden Reflect.apply()", () => {
		// restore it after the test!
		const originalApply = Reflect.apply;

		try {
			Reflect.apply = () => {
				throw new Error();
			};

			// every use of Reflect.apply will now throw
			assert.throws(() => Reflect.apply(nop), Error);
			assert.doesNotThrow(wrap.the(nop));
		} finally {
			Reflect.apply = originalApply;
		}
	});
});
