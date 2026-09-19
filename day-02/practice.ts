// Day 2 — Scope, Closures, `this` and JavaScript Execution
// Complete each function below. Uncomment the console.log to test.
// Work through phases in order — each builds on the previous.

// ============================================================
// PHASE 1: VALUES & MEMORY (Foundation)
// ============================================================
// Start here. Understand how JavaScript stores and compares data
// before moving to scope and closures.

// ------------------------------------------------------------
// 1. PRIMITIVE vs NON-PRIMITIVE — Identification
// ------------------------------------------------------------
// TODO: Identify which values are primitive and which are non-primitive.
// Log the type of each value using typeof.

// const stringValue = 'hello';
// const numberValue = 42;
// const booleanValue = true;
// const nullValue = null;
// const undefinedValue = undefined;
// const symbolValue = Symbol('id');
// const bigintValue = 100n;
// const objectValue = { name: 'Nahid' };
// const arrayValue = [1, 2, 3];
// const functionValue = () => {};

// TODO: Log typeof for each value above
// Expected output:
// string
// number
// boolean
// object (null is特殊 — typeof null returns "object")
// undefined
// symbol
// bigint
// object
// object (arrays are objects)
// function

// ------------------------------------------------------------
// 2. VALUE COMPARISON — Primitives Compare by Value
// ------------------------------------------------------------
// TODO: Compare primitive values using === and ==.
// Primitive values are compared by their actual value.

// const a = 5;
// const b = 5;
// const c = "5";
// const d = true;

// TODO: Compare and log results
// console.log(a === b);    // Expected: true (same value)
// console.log(a === c);    // Expected: false (different types)
// console.log(a == c);     // Expected: true (type coercion)
// console.log(a === d);    // Expected: false (different types)
// console.log(a == d);     // Expected: false (no coercion for these)

// ------------------------------------------------------------
// 3. REFERENCE COMPARISON — Objects Compare by Reference
// ------------------------------------------------------------
// TODO: Compare object values. Objects are compared by reference, not value.
// Two objects with identical content are NOT equal.

// const obj1 = { name: "Nahid" };
// const obj2 = { name: "Nahid" };
// const obj3 = obj1;

// TODO: Compare and log results
// console.log(obj1 === obj2);  // Expected: false (different references)
// console.log(obj1 === obj3);  // Expected: true (same reference)
// console.log(obj1 == obj2);   // Expected: false

// TODO: Why does this matter?
// If you modify obj3.name, what happens to obj1.name?

// ------------------------------------------------------------
// 4. MEMORY STORAGE — Stack vs Heap
// ------------------------------------------------------------
// TODO: Understand where different types are stored.
// Primitives: stored in stack (simple, fixed size)
// Objects: stored in heap (complex, dynamic size)

// // Primitive example — stored in stack
// let primitive1 = 10;
// let primitive2 = primitive1; // Copy the value
// primitive2 = 20;
// console.log(primitive1); // Expected: 10 (unchanged)
// console.log(primitive2); // Expected: 20

// // Object example — stored in heap
// let object1 = { value: 10 };
// let object2 = object1; // Copy the reference
// object2.value = 20;
// console.log(object1.value); // Expected: 20 (changed!)
// console.log(object2.value); // Expected: 20

// TODO: Draw a memory diagram for both examples above.

// ------------------------------------------------------------
// 5. EQUALITY OPERATORS — === vs == vs Object.is
// ------------------------------------------------------------
// TODO: Understand different equality checks.

// console.log(0 === false);        // Expected: false
// console.log(0 == false);         // Expected: true
// console.log("" === false);       // Expected: false
// console.log("" == false);        // Expected: true
// console.log(null === undefined); // Expected: false
// console.log(null == undefined);  // Expected: true
// console.log(NaN === NaN);       // Expected: false
// console.log(Object.is(NaN, NaN)); // Expected: true

// TODO: When would you use Object.is() instead of ===?

// ============================================================
// PHASE 2: SCOPE & HOISTING
// ============================================================
// Now that you understand values, learn how variables are accessed.

// ------------------------------------------------------------
// 6. GLOBAL SCOPE — Accessible Everywhere
// ------------------------------------------------------------
// const globalVar = "I am global";

// function accessGlobal() {
//   console.log(globalVar); // Expected: "I am global"
// }

// accessGlobal();

// TODO: What happens if you declare a variable without let/const/var?

// ------------------------------------------------------------
// 7. FUNCTION SCOPE — Variables Inside Functions
// ------------------------------------------------------------
// function functionScope() {
//   const functionVar = "I am function-scoped";
//   console.log(functionVar); // Expected: "I am function-scoped"
// }

// functionScope();
// // console.log(functionVar); // Expected: ReferenceError

// TODO: Why can't you access functionVar outside the function?

// ------------------------------------------------------------
// 8. BLOCK SCOPE — Variables Inside Blocks
// ------------------------------------------------------------
// function blockScope() {
//   if (true) {
//     const blockVar = "I am block-scoped";
//     let blockLet = "I am also block-scoped";
//     var blockVar = "I am function-scoped";
//     console.log(blockVar); // Expected: "I am function-scoped"
//   }
//   // console.log(blockVar); // Expected: ReferenceError (const/let)
//   console.log(varVar); // Expected: "I am function-scoped" (var)
// }

// blockScope();

// TODO: What's the difference between const/let and var in blocks?

// ------------------------------------------------------------
// 9. LEXICAL SCOPE — Nested Functions Access Outer Variables
// ------------------------------------------------------------
// function outer() {
//   const outerVar = "I am from outer";

//   function inner() {
//     const innerVar = "I am from inner";
//     console.log(outerVar); // Expected: "I am from outer"
//     console.log(innerVar); // Expected: "I am from inner"
//   }

//   inner();
//   // console.log(innerVar); // Expected: ReferenceError
// }

// outer();

// TODO: Why can inner() access outerVar but outer() can't access innerVar?

// ------------------------------------------------------------
// 10. HOISTING — var, let, const, Function Declarations
// ------------------------------------------------------------
// TODO: Predict what happens before running.

// // var is hoisted and initialized as undefined
// console.log(hoistedVar); // Expected: undefined
// var hoistedVar = "I am hoisted";
// console.log(hoistedVar); // Expected: "I am hoisted"

// // let/const are hoisted but NOT initialized (Temporal Dead Zone)
// // console.log(hoistedLet); // Expected: ReferenceError (TDZ)
// let hoistedLet = "I am also hoisted";

// // Function declarations are fully hoisted
// console.log(hoistedFunction()); // Expected: "I am fully hoisted"
// function hoistedFunction() {
//   return "I am fully hoisted";
// }

// TODO: Why does this error happen? What is the Temporal Dead Zone?

// ============================================================
// PHASE 3: CLOSURES & `this`
// ============================================================
// Now combine your knowledge of values, scope, and functions.

// ------------------------------------------------------------
// 11. CLOSURE — Counter
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 12. CLOSURE — Private Bank Account
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 13. FUNCTION FACTORY — Multiplier
// ------------------------------------------------------------
// TODO: Create a function `createMultiplier` that takes a number
// and returns a new function that multiplies any input by that number.

// function createMultiplier(multiplier: number) {
//   // your code here
// }

// const double = createMultiplier(2);
// const triple = createMultiplier(3);
// console.log("Double 5:", double(5));   // Expected: 10
// console.log("Triple 5:", triple(5));   // Expected: 15

// ------------------------------------------------------------
// 14. `this` CONTEXT — Person Object
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 15. `this` BINDING — call, apply, bind
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 16. REFERENCES — Shallow Copy Problem
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 17. REFERENCES — Deep Copy Solution
// ------------------------------------------------------------
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
