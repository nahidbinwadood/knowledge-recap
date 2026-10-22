# Tasks

## 1. Pass a function to greet a user and then thank them

```js
function greet(fn) {
  fn();
}

function user() {
  console.log(`Hello Nahid, Thank you`);
}

greet(user);
```

## 2. Implement a calculator function that accepts two numbers and a callback to perform operations like add, subtract

```js
function calculator(a, b, operationCallback) {
  const result = operationCallback(a, b);
  console.log(result);
}

function add(x, y) {
  return x + y;
}
function subtract(x, y) {
  return x - y;
}
function multiply(x, y) {
  return x * y;
}
function divide(x, y) {
  return x / y;
}

calculator(5, 3, add);
calculator(5, 3, subtract);
calculator(5, 3, multiply);
calculator(5, 3, divide);
```

Also test it with subtract, multiply, divide functions.

## 3. Create a delayedMessage function that prints a message after a delay using setTimeout

```js
function delayedMessage(message, delay, callback) {
  setTimeout(callback(), delay);
  console.log(message);
}

delayedMessage('Task complete', 2000, () => console.log('Callback Fired!'));
```

## 4. Implement a function that filters numbers in an array based on a condition provided via callback

```js
function filterNumbers(arr, conditionCallback) {
  return arr.filter(conditionCallback);
}

filterNumbers([1, 2, 3, 4], (n) => n > 2); // should return [3, 4]
```

## 5. Execute a sequence of tasks one after another using callbacks

```js
function task1(callback) {
  console.log('Task 1 done');
  callback();
}

function task2(callback) {
  console.log('Task 2 done');
  callback();
}

function task3() {
  console.log('Task 3 done');
}

task1(() => {
  task2(() => {
    task3();
  });
});

// Call them in sequence using nested callbacks
```
