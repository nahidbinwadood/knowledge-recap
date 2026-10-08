# Tasks

## 1. What will be the output of the following code and why?

```js
function outer() {
  let count = 0;
  return function inner() {
    count++;
    console.log(count);
  };
}
const counter = outer();
counter();
counter();
```

the first output will be one and 2nd one will be two. This happens because of when the function is executing then it holds its lexical scopes variables reference even if after the outer function execution is complete.This is a classic closure. So, for the FEC, the count variable is used from the parents scope so for each execution of this function it always get the reference of this variable from the parents scope so if we call the counter function two times then it holds the current value of the variable. The reason after calling the counter function 2nd time, the count variable is not getting 0 again because this is from the outer function and its already executed once that is why the value is not reinitializing again so for first counter function's execution, it updates the value +1 and for the 2nd outer functions execution it gets the count variable value is 1 instead of 0.

## 2. What will be the output and why?

```js
function testClosure() {
  let x = 10;
  return function () {
    return x * x;
  };
}
console.log(testClosure()());
```

answer: the output will be 100 as the testClosure function is returning another function which is multiplying the value of the x and the x value is from the parents scope .

## 3. Create a button dynamically and attach a click event handler using a closure. The handler should count and log how many times the button was clicked.

## 4. Write a function `createMultiplier(multiplier)` that returns another function to multiply numbers.

```js
function createMultiplier(multiplier) {
  return function multi(number) {
    return number * multiplier;
  };
}
```

## 5. What happens if a closure references an object?

- 2. The object remains in memory as long as the closure exists

## 6. Write a function factory of counter to increment, decrement, and reset a counter. Use closure to refer the count value across the functions.

```js

const counterFactory(){

  let count=0

  function increment(){
    count++
  }
  function decrement(){
    if(count<=0){
      console.log(`Cannot decrement more`)
      return
    }
    count--
  }
  function reset(){
    count=0
  }

  return {increment,decrement,reset}
}


const firstCounter

```
## What is a constructor function in javascript ? What is a factory function is javascript ??
## What is a difference between constructor function and class ?
## why function is called first class object ?