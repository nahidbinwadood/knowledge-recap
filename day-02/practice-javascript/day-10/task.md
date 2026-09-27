# Tasks

## 1. What will be the output of the following code and why?

```js
let user = 'Alice';

function outer() {
  function inner() {
    console.log(user);
  }
  let user = 'Bob';
  inner();
}

outer();
```

the output will be "Bob". We know that , when javascript executes the functions,then for any variable reference it searches to the nearest scope first,if it finds then it uses that value, if it don't get the value then it try to got one step upper scope and try to find the reference of the variable and this process continues until it reaches to the global scope and if the variable reference is missing then it will throw the referenceError. In the example ,even both variable has same name, so while executing the inner function, it searches the value of user inside its scope.As there is no variable has declared for "user" variable then it goes one step upper scope which is its parents scope and there it finds the reference of the user and it stops scope switching and prints that value.

## 2. What is the mistake in the code below?

```js
let total = 0; // Global, bad practice

function add(num) {
  total += num;
}

add(5);
add(10);
console.log(total);
```

here, we have declared the total in the total in globally so from anywhere it can be modified so this is not a good practice, rather we should declare in a scope.

## 3. Create a function with a nested function and log a variable from the parent function.

```js
function parent() {
  let name = 'Nahid Bin Wadood';

  function children() {
    console.log(`${name} is learning javascript.`);
  }

  children();
}

parent();
```

## 4. Use a loop inside a function and declare a variable inside the loop. Can you access it outside?

```js
function loop() {
  for (let i = 0; i < 10; i++) {
    console.log(i);
  }
  console.log(i);
}
console.log(i);
```

here we will get an reference error for the log function on inner loop function as the variable i has been declared in the children scope and in javascript, parent cannot access the variables from the children scope and in the global log function,there we will get the same referenceError for this reason.

## 5. Write a function that tries to access a variable declared inside another function.

```js
function outer1() {
  function inner() {
    let language = 'Javascript';
    console.log(day);
    function deep() {
      let day = 2;
    }
    deep();
  }
  inner();
}
function outer2() {
  function inner() {
    let language = 'Javascript';

    function deep() {
      let day = 2;
      console.log(`Today is day ${day} of learning ${language}`);
    }
    deep();
  }
  inner();
}
```

here we will get the reference error for the outer1 function as in the FEC there will be no reference for that variable ,in other way the variable is declared in the children so the parent cannot access it. the opposite thing for the outer2 function. it can get the reference value from its parent scope and it wont throw any error or in other way, children have access to use the parent variables.

## 6. What will be the output and why?

```js
console.log(a);
let a = 10;
```

here we will get an referenceError, as in the creation phase, the variable a is created in memory and bind also create for this variable with uninitialized so in execution phase it has no reference of the "a" variable until the value is declared on the line. so this is also call the temporal dead zone until the js reached executing the line of that variable has declared.

## 7. Where is the `age` variable accessible?

```js
function showAge() {
  let age = 25;
  console.log(age);
}

console.log(age);
```

Options:

- A: In Global
- B: Only inside showAge
- C: It will cause an error
- D: None of the above

this will throw an referenceError. the variable will be only accessible only inside the function scope.

## 8. What will be the output and explain the output?

```js
let message = 'Hello';

function outer() {
  let message = 'Hi';

  function inner() {
    console.log(message);
  }

  inner();
}

outer();
```

here the output will be "Hi" only. as in the global scope the message variable is declared but in the inner function scope the same name variable is again declared so when the inner function starts executing, then it checks the inner context for the "message" variable, as it did not find any name then it moves to the its parent scope and search for the reference of the "message" variable and it gets the reference from there and complete the execution of that function. if we comment out that line then it will again starts to move the upper scope which is the global scope and there finds the reference and it will print "Hello" and if we comment this line too then it will throw a reference error.

## 9. What will be the output and why?

```js
let x = 'Global';

function outer() {
  let x = 'Outer';

  function inner() {
    let x = 'Inner';
    console.log(x);
  }

  inner();
}

outer();
```

the output will be "Inner".here the global variable x will be bind with the "Global" value then in the outer FEC, the variable x will be bind with "Outer" value. again, in the inner functions FEC, the variable x will be bind with "Inner" value. so when js will reach the line of executing the outer func, it will see there is another func has invoked and before that the variable assignment will be complete. so in the inner function execution phase, it try to print the x variables value.so it will start lexical lookup for the reference of the value of x in to the first context which is the inner function context, then it finds the reference of that variable and it stops the lexical lookup and prints the value.if it did not find the value then the lexical lookup will be on the upper scope of this function which is the immediate parent function context.if it do not find the value then the lexical lookup will continues till the global scope with scope chaining method and finally it will throw an reference error if it fails to get the reference of the variable.

## 10. What will be the output and why?

```js
function counter() {
  let count = 0;
  return function () {
    count--;
    console.log(count);
  };
}

const reduce = counter();
reduce();
reduce();
```

the value will be -1,-2. this is a classic closure example. A closure is a function inside another function which can hold the current state of the parent scopes variable after even the the parent functions execution. So, when we call the counter function and it returns a function and in that function we are using the variable which is declared in the parent scope. so the inner function will always have the reference of that variable. so,after calling reduce function once it simple updates that variable count to -1. and if we again the counter decreases one value again and it becomes -2. why this is not -1 both times just because the parent functions are not reinitializing again , if we call again the counter function to another variable then we can see the counter value will be start from -1 again. basically it creates a factory function.
