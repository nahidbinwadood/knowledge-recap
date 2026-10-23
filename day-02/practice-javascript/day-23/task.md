# Tasks

## 1. Create Your First Promise

- Create a Promise that resolves with theI string "Hello, Promises!" after 1 second.
- Log the result using .then().

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Hello, Promises!');
  }, 1000);
});

promise.then((value) => console.log(value));
```

## 2. Reject a Promise

- Create a Promise that immediately rejects with the message "Something went wrong!".
- Handle the error using .catch().

```js
const rejectedPromise = new Promise((resolve, reject) => {
  reject(new Error('Something went wrong!'));
});

rejectedPromise.catch((err) => console.log(err));
```

## 3. Simulate Coin Toss

Return a Promise that randomly resolves to "Heads" or "Tails" after 1 second.

```js
const toss = new Promise((resolve) => {
  const tossItems = ['Heads', 'Tails'];
  const index = Math.floor(Math.random() * tossItems.length);

  setTimeout(() => {
    resolve(tossItems[index]);
  }, 1000);
});

toss.then((value) => console.log(value));
```

## 4. Promise with Condition

- Create a function checkAge(age) that returns a Promise.
- Resolve if age >= 18, reject otherwise.

```js
function checkAge(age) {
  return new Promise((resolve, reject) => {
    if (age >= 18) {
      return resolve(`You are an adult`);
    }
    reject(new Error('You are not an adult'));
  });
}

checkAge(18).then((resolvedValue) => console.log(resolvedValue));

checkAge(17)
  .then((resolvedValue) => console.log(resolvedValue))
  .catch((error) => console.error(error));
```

## 5. Chain Promises Sequentially

- Create three Promises that log:
  - "Step 1 done"
  - "Step 2 done"
  - "Step 3 done"
- Chain them using .then().

```js
const chainPromise = new Promise((resolve, reject) => {
  resolve(`Step 1 done`);
});

chainPromise
  .then((resValue) => {
    console.log(resValue);
    return new Promise((res) => {
      res('Step 2 done');
    });
  })
  .then((resValue) => {
    console.log(resValue);
    return new Promise((res) => {
      res('Step 3 done');
    });
  })
  .then((resValue) => {
    console.log(resValue);
  });
```

## 6. Value Transformation in Chain

- Create a Promise that resolves with 5.
- Chain .then() handlers to double it, then square it.
- Final output should be 100.

```js
const resolvesFivePromise = new Promise((resolve, reject) => {
  resolve(5);
});

resolvesFivePromise
  .then((resolvedValue) => {
    return new Promise((resolve) => {
      resolve(resolvedValue * 2);
    });
  })
  .then((resolvedValue) => {
    return new Promise((resolve) => {
      resolve(resolvedValue * resolvedValue);
    });
  })
  .then((resolvedValue) => console.log(resolvedValue));
```

## 7. Chain with Random Rejection

- First .then() resolves to "Start".
- Second .then() randomly throws an error or returns "Continue".
- Handle rejection gracefully.

```js
const firstPromise = new Promise((resolve, reject) => {
  resolve('Start');
});

firstPromise
  .then((resolvedValue) => {
    const possibleResponse = ['Continue', 'Error'];
    const index = Math.floor(Math.random() * possibleResponse.length);

    return new Promise((resolve, reject) => {
      if (index === 0) {
        return resolve('Continue');
      }
      reject(new Error('Something Went Wrong'));
    });
  })
  .then((resolvedValue) => {
    console.log(resolvedValue);
  })
  .catch((error) => console.error(error));
```

## 8. Multiple then() calls on same Promise

- Create a single resolved Promise.
- Attach two different .then() handlers to it.
- Explain that both run independently.

```js
const promise = new Promise((resolve, reject) => {
  resolve(5);
});

// promise
//   .then((resolvedValue) => resolvedValue * 2)
//   .then((value) => value *value ).then((value)=>console.log(value));

promise.then((resolvedValue) => console.log(resolvedValue * 2));
promise.then((resolvedValue) => console.log(resolvedValue * 20));
```

here are two different then has been called to fullfil the promise and both are doing separate logic with the same promise. first one is returning 10 and 2nd one is returning 100.

## 9. Return New Promises in .then()

- Chain multiple .then() where each returns a new Promise with a delay and logs a step like:
  - “First”
  - “Second”
  - “Third”

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('First');
  }, 1000);
});

promise
  .then((value) => {
    console.log(value);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('Second');
      }, 1000);
    });
  })
  .then((value) => {
    console.log(value);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('Third');
      }, 1000);
    });
  })
  .then((value) => console.log(value));
```

## 10. Implement fakeDBQuery()

- Create a function that simulates a DB query with a random delay and returns data (like a user object).
- Chain multiple fake queries.

```js
function fakeDBQuery() {
  return new Promise((resolve) => {
    const delay = Math.ceil(Math.random() * 10) * 1000;
    setTimeout(() => {
      resolve({
        message: `Database Connected after ${delay / 1000}s`,
        data: {
          name: 'Nahid Bin Wadood',
          age: 27,
          office: 'Mohammadpur',
        },
      });
    }, delay);
  });
}

fakeDBQuery()
  .then((value) => {
    value.data.address = 'Mirpur';
    return value;
  })
  .then((value) => {
    value.data.weekend = '2 Days';
    return value;
  })
  .then((value) => console.log(value));
```
