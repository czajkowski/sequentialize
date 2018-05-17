# Sequentialize

Make sure asynchronous functions are called one after another.

## Usage

### Call sequence

```javascript
const createCallSequence = require("@czajkowski/sequentialize");

const callSequence = createCallSequence();

const asyncFunction = (value, interval = 10) =>
    new Promise(resolve => setTimeout(() => resolve(value), interval));

callSequence(asyncFunction, 1, 20).then(console.log);
callSequence(asyncFunction, 2, 10).then(console.log);
```

### Bound call sequence

```javascript
const createCallSequence = require("@czajkowski/sequentialize");

const asyncFunction = (value, interval = 10) =>
    new Promise(resolve => setTimeout(() => resolve(value), interval));

const boundCallSequence = createCallSequence(asyncFunction);

boundCallSequence(1, 20).then(console.log);
boundCallSequence(2, 10).then(console.log);
```
