const createCallSequence = () => {
    return (fn, ...params) => {
        let result;

        if (typeof fn === "function") {
            result = fn(...params);
        } else {
            result = fn;
        }

        return Promise.resolve(result);
    };
};

module.exports = createCallSequence;