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

const stringValue = 'hello';
const numberValue = 42;
const booleanValue = true;
const nullValue = null;
const undefinedValue = undefined;
const symbolValue = Symbol('id');
const bigintValue = 100n;
const objectValue = { name: 'Nahid' };
const arrayValue = [1, 2, 3];
const functionValue = () => {};

//here the objective,function and the arrays are the non primitive and rest of them is primitive.

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

// console.log(typeof(stringValue))
// console.log(typeof(numberValue))
// console.log(typeof(booleanValue))
// console.log(typeof(nullValue))
// console.log(typeof(undefinedValue))
// console.log(typeof(symbolValue))
// console.log(typeof(bigintValue))
// console.log(typeof(objectValue))
// console.log(typeof(arrayValue))
// console.log(typeof(functionValue))

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
// as both objects are referencing the same memory so if we change obj3.name then the main object will change and it will reflect for the obj1.

// ------------------------------------------------------------
// 4. MEMORY STORAGE — Stack vs Heap
// ------------------------------------------------------------

// TODO: Understand how JavaScript variables and objects are represented in memory.

// Important note:
// "Primitive = Stack" and "Object = Heap" is a simplified mental model.
// JavaScript itself does not specify that primitives must be stored on the
// stack or objects must be stored on the heap. JavaScript engines decide
// how values are actually represented internally.
//
// For learning, we can use this simplified model:
// - Primitive variables hold primitive values.
// - Object variables hold references to objects.
// - Objects are commonly represented as existing in heap memory.
// - Assigning a primitive copies its value.
// - Assigning an object copies its reference.

// ------------------------------------------------------------
// 1. GLOBAL EXECUTION CONTEXT
// ------------------------------------------------------------

// When JavaScript starts executing a script, it creates a
// Global Execution Context (GEC).
//
// In a browser environment, the global object is `window`.
// In that environment, `this` at the top level of a classic
// script refers to the global object.
//
// However, this does NOT mean that `this` always refers to `window`.
// The value of `this` depends on the execution context and environment.
//
// The GEC can be understood using two simplified phases:
//
// 1. Creation / setup phase
// 2. Execution phase
//
// During the creation/setup phase, JavaScript prepares the
// declarations and bindings.
//
// Important:
// `let` and `const` variables are NOT initialized with `undefined`
// during this phase.
//
// They are created but remain uninitialized until execution reaches
// their declaration. This period is called the Temporal Dead Zone (TDZ).
//
// Example:
//
// console.log(primitive1); // ReferenceError
// let primitive1 = 10;
//
// With `var`, the behavior is different:
//
// console.log(value); // undefined
// var value = 10;
//
// So we should NOT think:
//
// let primitive1 = undefined;
//
// during the creation phase.

// ------------------------------------------------------------
// 2. PRIMITIVE EXAMPLE
// ------------------------------------------------------------

let primitive1 = 10;

let primitive2 = primitive1; // Copy the primitive value

primitive2 = 20;

// console.log(primitive1); // 10
// console.log(primitive2); // 20

// ------------------------------------------------------------
// EXECUTION OF THE PRIMITIVE EXAMPLE
// ------------------------------------------------------------

// Step 1:
//
// let primitive1 = 10;
//
// During execution, the value `10` is assigned to primitive1.
//
// Simplified memory:
//
// Stack
// ----------------
// primitive1 → 10
//
//
// Step 2:
//
// let primitive2 = primitive1;
//
// JavaScript evaluates primitive1 and gets the value `10`.
//
// Because primitive1 contains a primitive value, primitive2 receives
// its own copy of that value.
//
// Simplified memory:
//
// Stack
// ----------------
// primitive1 → 10
// primitive2 → 10
//
//
// There is no shared object here.
//
// Both variables independently contain the primitive value 10.
//
//
// Step 3:
//
// primitive2 = 20;
//
// Now only primitive2 is changed.
//
// Simplified memory:
//
// Stack
// ----------------
// primitive1 → 10
// primitive2 → 20
//
//
// primitive1 remains 10 because primitive2 received a copy of the value.
//
//
// Step 4:
//
// console.log(primitive1);
// console.log(primitive2);
//
// Output:
//
// 10
// 20

// ------------------------------------------------------------
// 3. OBJECT EXAMPLE
// ------------------------------------------------------------

let object1 = { value: 10 };

let object2 = object1; // Copy the object reference

object2.value = 20;

// console.log(object1.value); // 20
// console.log(object2.value); // 20

// ------------------------------------------------------------
// EXECUTION OF THE OBJECT EXAMPLE
// ------------------------------------------------------------

// Step 1:
//
// let object1 = { value: 10 };
//
// The object literal { value: 10 } is evaluated during execution.
//
// A new object is created.
//
// Simplified heap:
//
// Heap
// ----------------------------
// Object A
// {
//     value: 10
// }
//
// object1 stores a reference to Object A.
//
// Simplified stack:
//
// Stack
// ----------------------------
// object1 → Reference A
//
//
// Important:
//
// object1 does NOT contain the entire object itself.
//
// It contains a reference that allows JavaScript to access
// the object created in memory.

// ------------------------------------------------------------
// Step 2:
//
// let object2 = object1;
//
// JavaScript evaluates object1.
//
// object1 contains a reference to Object A.
//
// That reference is copied into object2.
//
// No new object is created here.
//
// Simplified memory:
//
// Stack
// ----------------------------
// object1 → Reference A
// object2 → Reference A
//
// Heap
// ----------------------------
// Object A
// {
//     value: 10
// }
//
//
//
// This is the most important difference from the primitive example.
//
// Primitive:
//
// primitive2 = primitive1
//
// → copies the primitive value.
//
// Object:
//
// object2 = object1
//
// → copies the reference to the object.

// ------------------------------------------------------------
// Step 3:
//
// object2.value = 20;
//
// object2 contains Reference A.
//
// JavaScript follows that reference and finds Object A.
//
// Then it changes the `value` property of Object A.
//
// Before:
//
// Heap
// ----------------------------
// Object A
// {
//     value: 10
// }
//
// After:
//
// Heap
// ----------------------------
// Object A
// {
//     value: 20
// }
//
//
//
// Since object1 also points to Object A:
//
// object1 → Reference A
// object2 → Reference A
//
// both variables can see the updated value.
//
//
// Therefore:
//
// console.log(object1.value); // 20
// console.log(object2.value); // 20

// ------------------------------------------------------------
// 4. COMPLETE MEMORY DIAGRAM
// ------------------------------------------------------------

// PRIMITIVE EXAMPLE
//
// Stack
// ┌────────────────────────┐
// │ primitive1 → 10        │
// │ primitive2 → 20        │
// └────────────────────────┘
//
// There is no shared mutable object.
//
// primitive2 received a copy of primitive1's value.

// OBJECT EXAMPLE
//
// Stack                         Heap
// ┌───────────────────┐         ┌─────────────────────┐
// │ object1 → Ref A ──┼────────→│ Object A            │
// │ object2 → Ref A ──┼────────→│ { value: 20 }      │
// └───────────────────┘         └─────────────────────┘
//
//
// object1 and object2 are different variables.
//
// But both variables contain the same reference.
//
// Therefore, both variables point to the same object.

// ------------------------------------------------------------
// 5. VERY IMPORTANT: REASSIGNMENT VS MUTATION
// ------------------------------------------------------------

// Mutation:
//
// let object1 = { value: 10 };
// let object2 = object1;
//
// object2.value = 20;
//
// Here we changed a property of the existing object.
//
// Both variables still point to the same object.
//
//
// Reassignment:
//
// let object1 = { value: 10 };
// let object2 = object1;
//
// object2 = { value: 20 };
//
// Here we did NOT change the original object.
//
// Instead, object2 was given a reference to a NEW object.
//
// Simplified:
//
// Before:
//
// object1 ───────→ Object A { value: 10 }
// object2 ───────→ Object A { value: 10 }
//
//
// After:
//
// object1 ───────→ Object A { value: 10 }
//
// object2 ───────→ Object B { value: 20 }

// ------------------------------------------------------------
// 6. FINAL MENTAL MODEL
// ------------------------------------------------------------

// Primitive:
//
// let a = 10;
// let b = a;
//
// a → 10
// b → 10
//
// The value is copied.
//
//
//
// Object:
//
// let a = { value: 10 };
// let b = a;
//
// a ──→ Object A
// b ──→ Object A
//
// The reference is copied.
//
//
//
// So the most useful rule to remember is:
//
// Primitive assignment → copy the value.
//
// Object assignment → copy the reference.
//
//
//
// And remember:
//
// `object1` and `object2` are NOT the same variable.
//
// They are two separate variables that happen to reference
// the same object.

// ------------------------------------------------------------
// TODO
// ------------------------------------------------------------

// 1. Draw the primitive memory diagram yourself.
//
// 2. Draw the object memory diagram yourself.
//
// 3. Explain in your own words:
//
//    Why does this:
//
//    object2.value = 20;
//
//    change object1.value?
//
// 4. Explain the difference between:
//
//    object2.value = 20;
//
//    and
//
//    object2 = { value: 20 };
//
// 5. Next, explore:
//
//    - Pass by value
//    - Object references
//    - Shallow copy
//    - Deep copy
//    - Object.assign()
//    - Spread operator (...)
//    - structuredClone()
//    - Equality: == vs ===

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

// it becomes a global variable.

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

// the variable is declared in the function scope that is why we can access from the function body only.if we want to access from outside of the function scope({}) then we will got an reference error.

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

// let and const are block scopes. and var are function scopes. var can be accessed any where in any function and const/let can be access inside blocks only ({})

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

//in simples way, the children can access the parents variable but parent cannot access the children value. we know that js compiler will compile the code from top to bottom. so when we try to access a variable which is not in the upper scope then js return a reference error. lexical scope is a term, where the compiler try to access the value from the closest scope first then if the value is not find there then it try to find it from the upper scope like this goes like a chain and it stops after going to the global scope. so when the inner func, wants to access the outerValue then first it will search inside the close scope which is the function scope, when it not found in the function scope, then it goes to the one layer upper scope which is outer function scope, then it got the variable and print it. if the value was not there then it will go to one more upper scope till it reaches the global scope if the value not found. that is why the inner can assess the parents scope. when the outer func call then after the inner func declaration, it tries to access the value which is inside inner function and its a separate scope so the value innerVar is only accessible inside inner function. so this is why it gets error .

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

//in javascript runtime, there are two phases, one is creation phase and other one is execution phase. in the creation phase, the functions and variables are assigned and initialized and in the execution phase ,those variables and functions are replaced by the values and execution the function. so for the var, when a variable has been declared with var,so in the creation phase, the variable var is bind the with the variable name and initialized that with undefined and in the execution phase, the actual value is assigned. so we can access the value of var before the line its been declared but we can get undefined. whereas, the let /const do the same ,i mean they both hoisted in the creation phase and also do bind with the variable name but they are not initialized with anything, that is why , nothing is been assigned to that reference, if we try to access that value before the declaration file ,then js will throw the reference error as it dont find any reference to print the value. so the temporal dead zone is the place, just an imaginary place its actually. its starts when the value is bind to the variable to the line where let/const value is initialized. in between that place is called temporal dead zone

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
//   let initialValue = initial;
//   function increment() {
//     return initialValue += 1;
//   }
//   function decrement() {
//     return initialValue-= 1;
//   }
//   function getCount() {
//     return initialValue;
//   }

//   return { increment, decrement, getCount };
// }

// const counter = createCounter(0);
// counter.increment();
// counter.increment();
// counter.increment();
// counter.decrement();
// console.log('Counter:', counter.getCount()); // Expected: 2

// ------------------------------------------------------------
// 12. CLOSURE — Private Bank Account
// ------------------------------------------------------------
// TODO: Create a function `createBankAccount` that returns an object with:
//   - deposit(amount) — adds to balance (cannot be negative)
//   - withdraw(amount) — subtracts from balance (cannot exceed balance)
//   - getBalance() — returns current balance
//   - getHistory() — returns array of all transactions {type, amount, balance}
// Balance and history should NOT be accessible from outside.

function createBankAccount(owner: string, initialBalance: number) {
  // your code here
  const history: {
    type: 'withdraw' | 'deposit' | 'initial';
    amount: number;
    balance: number;
  }[] = [];

  if (initialBalance) {
    history.push({
      type: 'initial',
      amount: initialBalance,
      balance: initialBalance,
    });
  }

  let balance = initialBalance;

  function deposit(amount: number) {
    balance += amount;
    history.push({
      type: 'deposit',
      amount,
      balance,
    });
  }
  function withdraw(amount: number) {
    balance -= amount;
    history.push({
      type: 'withdraw',
      amount,
      balance,
    });
  }
  function getBalance() {
    return balance;
  }
  function getHistory() {
    return history;
  }

  return { deposit, withdraw, getBalance, getHistory };
}

// const account = createBankAccount('Nahid', 1000);
// account.deposit(500);
// account.withdraw(200);
// account.deposit(300);
// console.log('Balance:', account.getBalance()); // Expected: 1600
// console.log('History:', account.getHistory());

// ------------------------------------------------------------
// 13. FUNCTION FACTORY — Multiplier
// ------------------------------------------------------------
// TODO: Create a function `createMultiplier` that takes a number
// and returns a new function that multiplies any input by that number.

function createMultiplier(multiplier: number) {
  return function (multiplyValue: number) {
    return multiplier * multiplyValue;
  };
}

// const double = createMultiplier(2);
// const triple = createMultiplier(3);
// console.log('Double 5:', double(5)); // Expected: 10
// console.log('Triple 5:', triple(5)); // Expected: 15

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
