// Day 2 — Scope, Closures, `this` and JavaScript Execution
// Complete each function below. Uncomment the console.log to test.

// ============================================================
// 1. CLOSURE — Counter
// ============================================================
// TODO: Create a function `createCounter` that returns an object with:
//   - increment() — increases count by 1
//   - decrement() — decreases count by 1
//   - getCount() — returns current count
// The count should NOT be accessible from outside.

// function createCounter(initial: number) {
//   // your code here
// }

// const counter = createCounter(0);
// counter.increment();
// counter.increment();
// counter.increment();
// counter.decrement();
// console.log("Counter:", counter.getCount()); // Expected: 2

// ============================================================
// 2. CLOSURE — Private Bank Account
// ============================================================
// TODO: Create a function `createBankAccount` that returns an object with:
//   - deposit(amount) — adds to balance (cannot be negative)
//   - withdraw(amount) — subtracts from balance (cannot exceed balance)
//   - getBalance() — returns current balance
//   - getHistory() — returns array of all transactions {type, amount, balance}
// Balance and history should NOT be accessible from outside.

// function createBankAccount(owner: string, initialBalance: number) {
//   // your code here
// }

// const account = createBankAccount("Nahid", 1000);
// account.deposit(500);
// account.withdraw(200);
// account.deposit(300);
// console.log("Balance:", account.getBalance()); // Expected: 1600
// console.log("History:", account.getHistory());

// ============================================================
// 3. FUNCTION FACTORY — Multiplier
// ============================================================
// TODO: Create a function `createMultiplier` that takes a number
// and returns a new function that multiplies any input by that number.

// function createMultiplier(multiplier: number) {
//   // your code here
// }

// const double = createMultiplier(2);
// const triple = createMultiplier(3);
// console.log("Double 5:", double(5));   // Expected: 10
// console.log("Triple 5:", triple(5));   // Expected: 15

// ============================================================
// 4. `this` CONTEXT — Person Object
// ============================================================
// TODO: Create a `person` object with:
//   - name: string
//   - age: number
//   - greet() — returns "Hello, I'm {name}"
//   - haveBirthday() — increases age by 1, returns "Happy Birthday {name}! Now {age}"
//   - introduce() — use an arrow function version too, explain the difference
//
// Then create a `greetLater` function using setTimeout to show
// how `this` behaves differently in regular vs arrow functions.

// const person = {
//   name: "Nahid",
//   age: 25,
//   greet() {
//     // your code here
//   },
//   haveBirthday() {
//     // your code here
//   },
//   introduce() {
//     // your code here — return a string with name and age
//   },
// };

// console.log(person.greet());         // Expected: "Hello, I'm Nahid"
// console.log(person.haveBirthday());  // Expected: "Happy Birthday Nahid! Now 26"
// console.log(person.introduce());     // Expected: "I'm Nahid, 26 years old"

// ============================================================
// 5. `this` BINDING — call, apply, bind
// ============================================================
// TODO: Create a ` introduce` function that uses `this.name` and `this.age`.
// Then demonstrate:
//   - calling it with `call` on different objects
//   - calling it with `apply` on different objects
//   - creating a bound version with `bind`

// function introduce() {
//   // your code here — return a string using this.name and this.age
// }

// const nahid = { name: "Nahid", age: 25 };
// const rahim = { name: "Rahim", age: 30 };

// console.log(introduce.call(nahid));      // Expected: "I'm Nahid, 25 years old"
// console.log(introduce.apply(rahim));     // Expected: "I'm Rahim, 30 years old"

// const boundToIntroduce = introduce.bind(nahid);
// console.log(boundToIntroduce());         // Expected: "I'm Nahid, 25 years old"

// ============================================================
// 6. REFERENCES — Shallow Copy Problem
// ============================================================
// TODO: Show how spreading creates a shallow copy.
// Create a nested object, spread it, modify the nested property,
// and show that the original is also changed.

// function shallowCopyProblem() {
//   const original = {
//     name: "Project A",
//     tags: ["typescript", "react"],
//     meta: { author: "Nahid", version: 1 },
//   };
//
//   // TODO: create a shallow copy using spread
//   // TODO: modify copy.tags and copy.meta
//   // TODO: return { original, copy } to show the problem
// }

// console.log(shallowCopyProblem());

// ============================================================
// 7. REFERENCES — Deep Copy Solution
// ============================================================
// TODO: Fix the shallow copy problem using JSON.parse(JSON.stringify())
// or structuredClone(). Show that the original is NOT affected.

// function deepCopySolution() {
//   const original = {
//     name: "Project A",
//     tags: ["typescript", "react"],
//     meta: { author: "Nahid", version: 1 },
//   };
//
//   // TODO: create a deep copy
//   // TODO: modify the copy's nested properties
//   // TODO: return { original, copy } to show they are independent
// }

// console.log(deepCopySolution());

// ============================================================
// 8. LEXICAL SCOPE — Nested Function Access
// ============================================================
// TODO: Create a function `outer` that declares a variable,
// then create `inner` that accesses it.
// Demonstrate that `inner` can read `outer`'s variables
// because of lexical scope.

// function outer() {
//   const secret = "I am from outer";
//
//   function inner() {
//     // your code here — access `secret`
//   }
//
//   return inner;
// }

// const innerFn = outer();
// console.log(innerFn()); // Expected: "I am from outer"
