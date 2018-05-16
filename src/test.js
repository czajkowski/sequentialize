const createCallSequence = require("./index.js");

it("should create a sequence function", () => {
    expect(createCallSequence()).toBeInstanceOf(Function);
});

describe("sequence function", () => {
    let functionCallSequence;

    beforeEach(() => {
        functionCallSequence = createCallSequence();
    });

    it("should return a promise when invoked", () => {
        expect(functionCallSequence()).toBeInstanceOf(Promise);
    });

    it("should accept a function as first parameter and resolve returned promise with this function outcome", () => {
        const testValue = {};

        return functionCallSequence(() => testValue).then((result) => {
            expect(result).toBe(testValue);
        });
    });

    it("should accept a non-function value as a first parameter and resolve returned promise with this value", () => {
        const testValue = {};

        return functionCallSequence(testValue).then((result) => {
            expect(result).toBe(testValue);
        });
    });

    it("should ignore all other parameters if first one is a non-function", () => {
        const testValue = {};

        return functionCallSequence(testValue, 1, 2, 3, 4).then((...results) => {
            expect(results.length).toEqual(1);
            expect(results[0]).toBe(testValue);
        });
    });

    it("should invoke a function passing it all other parameters as arguments", () => {
        return functionCallSequence(Math.max, 1, 2, 3, 4, 5).then((result) => {
            expect(result).toEqual(5);
        });
    });
});