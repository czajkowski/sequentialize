const createCallSequence = require("./index.js");

const testValue = {};

describe("sequence", () => {
    let callSequence;

    beforeEach(() => {
        callSequence = createCallSequence();
    });

    it("should create a sequence function", () => {
        expect(callSequence).toBeInstanceOf(Function);
    });

    it("should return a promise when invoked", () => {
        expect(callSequence()).toBeInstanceOf(Promise);
    });

    describe("handling non-functions", () => {
        it("should resolve returned promise with first parameter value", () => {
            return callSequence(testValue).then((result) => {
                expect(result).toBe(testValue);
            });
        });

        it("should ignore all other parameters", () => {
            return callSequence(testValue, 1, 2, 3, 4).then((...results) => {
                expect(results.length).toEqual(1);
                expect(results[0]).toBe(testValue);
            });
        });
    });

    describe("handling functions", () => {
        it("should resolve returned promise with output of passed function", () => {
            return callSequence(() => testValue).then((result) => {
                expect(result).toBe(testValue);
            });
        });

        it("should invoke passed function with all other parameters as arguments", () => {
            return callSequence(Math.max, 1, 2, 3, 4, 5).then((result) => {
                expect(result).toEqual(5);
            });
        });

        it("should corelate returned promise result with promise returned from passed function", () => {
            const op1 = callSequence(() => Promise.resolve(testValue)).then((result) => {
                expect(result).toEqual(testValue);
            });

            const op2 = callSequence(() => Promise.reject(testValue)).catch((result) => {
                expect(result).toEqual(testValue);
            });

            return Promise.all([op1, op2]);
        });
    });

    describe("handling subsequent calls", () => {
        it("should not invoke a function before the previous one finish", () => {
            let storage = null;

            callSequence(() => new Promise(resolve => setTimeout(() => {
                storage = testValue;
                resolve();
            }, 10)));

            return callSequence(() => {
                expect(storage).toBe(testValue);
            });
        });

        it("should invoke multiple functions in called order", () => {
            const storage = [];
            const testFunction = val => new Promise(resolve => setTimeout(() => {
                storage.push(val);
                resolve();
            }, 10));

            callSequence(testFunction, 1);
            callSequence(testFunction, 2);
            callSequence(testFunction, 3);
            callSequence(testFunction, 4);
            callSequence(testFunction, 5);

            return callSequence(() => {
                expect(storage).toEqual([1, 2, 3, 4, 5]);
            });
        });

        it("should handle different calls and values", () => {
            const storage = [];

            // Add 1 to the list
            const op1 = callSequence(val => new Promise(resolve => setTimeout(() => {
                storage.push(val);
                resolve(val);
            }, 10)), 1).then(val => {
                expect(val).toEqual(1);
            });

            // Does nothing to list
            const op2 = callSequence(1, 2, 3).then(val => {
                expect(val).toEqual(1);
            });

            // Does nothing to list
            const op3 = callSequence(() => Promise.resolve(1)).then(val => {
                expect(val).toEqual(1);
            });

            // Does nothing to list
            const op4 = callSequence(() => Promise.reject(1)).catch(val => {
                expect(val).toEqual(1);
            });

            // Add 2 at the end and 3 at the begining of the list
            const op5 = callSequence((valA, valB) => new Promise((resolve, reject) => setTimeout(() => {
                storage.push(valA);
                storage.unshift(valB);
                reject([valA, valB]);
            }, 10)), 2, 3).catch(val => {
                expect(val).toEqual([2, 3]);
            });

            const op6 = callSequence(() => {
                expect(storage).toEqual([3, 1, 2]);
            });

            return Promise.all([op1, op2, op3, op4, op5, op6]);
        });
    });
});

describe("bound sequence", () => {
    let testFunction;
    let boundCallSequence;

    beforeEach(() => {
        testFunction = jest.fn((val, interval = 10, callback) =>
            new Promise(resolve => setTimeout(() => {
                callback && callback(val);
                resolve(val);
            }, interval)));

        boundCallSequence = createCallSequence(testFunction);
    });

    it("should create a sequence function", () => {
        expect(boundCallSequence).toBeInstanceOf(Function);
    });

    it("should return a promise when invoked", () => {
        expect(boundCallSequence()).toBeInstanceOf(Promise);
    });

    it("should invoke bound function and pass given parameter", () => {
        const callback = jest.fn();

        return boundCallSequence(testValue, 10, callback).then((result) => {
            expect(testFunction).toHaveBeenCalledWith(testValue, 10, callback);
            expect(callback).toHaveBeenCalledWith(testValue);
            expect(result).toEqual(testValue);
        });
    });

    it("should invoke bound functions in order", () => {
        const storage = [];
        const callback = val => storage.push(val);

        boundCallSequence(1, 10, callback);
        boundCallSequence(2, 5, callback);
        boundCallSequence(3, 1, callback);

        return boundCallSequence().then(() => {
            expect(storage).toEqual([1, 2, 3]);
        });
    });

});