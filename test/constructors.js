import { assert, describe, it, wrap } from "./setup.js";

describe("Constructor calls", () => {
	function Box(value) {
		this.value = value;
	}

	it("should not change constructed objects", () => {
		const Wrapped = wrap.the(Box);
		assert.deepStrictEqual(new Wrapped(42), new Box(42));
	});

	it("should preserve prototype link in constructor calls", () => {
		const Wrapped = wrap.the(Box);
		const box = new Wrapped(42);
		assert.deepStrictEqual(Object.getPrototypeOf(box), Box.prototype);
	});

	it("should preserve new.target", () => {
		function GimmeNewTarget() {
			return new.target;
		}
		function MyConstructor() {}
		const Wrapped = wrap.the(GimmeNewTarget);
		assert.deepStrictEqual(
			Reflect.construct(Wrapped, [], MyConstructor),
			MyConstructor,
		);
	});
});
