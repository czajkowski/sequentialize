const createCallSequence = (boundFn) => {
    let previousCall = Promise.resolve();

    const isFunction = fn => typeof fn === "function";

    const sequenceFunction = (fn, ...params) => {
        const currentCall = previousCall.then(() => {
            let result;

            if (isFunction(fn)) {
                result = fn(...params);
            } else {
                result = fn;
            }

            return Promise.resolve(result);
        });

        previousCall = currentCall.catch(() => {});

        return currentCall;
    };

    return isFunction(boundFn) ? sequenceFunction.bind(null, boundFn) : sequenceFunction;
};

module.exports = createCallSequence;