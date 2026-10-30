---
title: "JavaScript this Binding: Default, Implicit, Explicit, new, and Arrows"
excerpt: "this is not a fixed reference to an object. It is a binding established at call time. This post covers the five binding rules—default, implicit, explicit with call/apply/bind, new, and arrows—and the mistakes that make this undefined or surprising."
tags: ["javascript", "this", "binding", "functions", "objects"]
---

# JavaScript this Binding

`this` is one of the most misunderstood parts of JavaScript. The confusion usually comes from expecting it to do something it does not do.

`this` is not a fixed reference to the object where a function was written.

```javascript
const user = {
  name: "Nahid",
  greet() {
    console.log(this.name);
  }
};

const fn = user.greet;
fn(); // undefined in strict mode
```

Same function. Different call. Different `this`.

That is the whole secret:

> **`this` is decided by how a function is called, not where it is written.**

Once you can classify the call shape, you can predict `this`.

## Five binding rules

Most JavaScript code falls into one of these five patterns.

1. Default binding
2. Implicit binding
3. Explicit binding (call / apply / bind)
4. new binding
5. Arrow functions

If you know which rule applies, you know the value of `this`.

## 1. Default binding

When a function is called as a plain function, `this` is decided by strict mode.

Non-strict mode:

```javascript
function showThis() {
  console.log(this);
}

showThis(); // global object (window in browser)
```

Strict mode:

```javascript
"use strict";

function showThis() {
  console.log(this);
}

showThis(); // undefined
```

This is the fallback binding. If no other rule applies, this is what you get.

It applies to standalone calls, even if the function was borrowed from an object.

```javascript
const user = {
  name: "Nahid",
  greet() {
    console.log(this.name);
  }
};

const fn = user.greet;
fn(); // default binding
```

The function did not carry the object with it. Only the call shape matters.

## 2. Implicit binding

When a function is called as a property of an object, `this` is the object before the dot.

```javascript
const user = {
  name: "Nahid",
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

user.greet(); // "Hello, Nahid"
```

The call is `user.greet()`, so `this` inside `greet` is `user`.

```text
user.greet()
        ↑
     this === user
```

This rule works even if the function was defined elsewhere.

```javascript
function greet() {
  console.log(`Hello, ${this.name}`);
}

const user = {
  name: "Nahid",
  fn: greet
};

user.fn(); // "Hello, Nahid"
```

What matters is the call site, not the definition site.

### Nested objects

The object immediately before the call is the binding target.

```javascript
const outer = {
  name: "Outer",
  inner: {
    name: "Inner",
    greet() {
      console.log(`Hello, ${this.name}`);
    }
  }
};

outer.inner.greet(); // "Hello, Inner"
```

`this` is `outer.inner`, not `outer`.

### The lost-context problem

Implicit binding disappears the moment you separate the method from the object.

```javascript
const user = {
  name: "Nahid",
  greet() {
    console.log(this.name);
  }
};

const fn = user.greet;
fn(); // default binding, not implicit
```

The same thing happens when you pass a method as a callback.

```javascript
function invoke(fn) {
  fn();
}

invoke(user.greet); // default binding
```

The call inside `invoke` is a plain function call. The dot is gone, so the implicit rule no longer applies.

This is why losing context is one of the most common source of `this` bugs.

## 3. Explicit binding

JavaScript gives you three tools to force `this` to a specific value.

```text
call
apply
bind
```

### `call`

```javascript
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const user = { name: "Nahid" };

greet.call(user, "Hi"); // "Hi, Nahid"
```

`call` invokes the function immediately, with `this` set to the first argument and the rest passed as ordinary arguments.

### `apply`

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const user = { name: "Nahid" };

greet.apply(user, ["Hi", "!"]); // "Hi, Nahid!"
```

`apply` is the same as `call`, except arguments are passed as an array.

Today, `call` plus spread is often enough:

```javascript
greet.call(user, ...["Hi", "!"]);
```

But `apply` still matters when an API gives you an arguments array or you want to borrow array methods.

### `bind`

```javascript
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const user = { name: "Nahid" };

const greetUser = greet.bind(user);

greetUser("Hello"); // "Hello, Nahid"
greetUser("Hi");    // "Hi, Nahid"
```

`bind` does not call the function. It returns a new one with `this` locked to the value you gave it.

You can also preset arguments.

```javascript
function add(a, b) {
  return a + b;
}

const addTen = add.bind(null, 10);
addTen(5); // 15
```

Here the `this` value is irrelevant, but `bind` still needs a first argument for `this`. `null` is a common placeholder for that.

### Explicit binding wins over implicit binding

If you use `call`, `apply`, or `bind`, the object before the dot is ignored.

```javascript
const user = {
  name: "Nahid",
  greet() {
    console.log(this.name);
  }
};

const other = { name: "Other" };

user.greet.call(other); // "Other"
```

Even though `greet` was written as a method of `user`, explicit binding overrides the call-site object.

### Binding a method for later

This is the common fix for the lost-context problem.

```javascript
const user = {
  name: "Nahid",
  greet() {
    console.log(this.name);
  }
};

setTimeout(user.greet, 1000);        // broken
setTimeout(user.greet.bind(user), 1000); // fixed
```

Or use an arrow wrapper:

```javascript
setTimeout(() => user.greet(), 1000);
```

## 4. new binding

When a function is called with `new`, JavaScript does several things before the body runs:

```text
1. create a new object
2. link that object to the function's prototype
3. bind this to the new object
4. if the function does not return an object, return the new object
```

```javascript
function Person(name) {
  this.name = name;
}

const p = new Person("Nahid");
console.log(p.name); // "Nahid"
```

Inside the constructor call, `this` is the newly created instance.

The `new` binding rule is powerful because `this` is not the function, the call site, or the global object. It is the instance being built.

### `new` with any function

Any function can be used with `new`.

```javascript
function fn() {
  console.log(this);
}

new fn(); // a new object
```

If the function returns an object, that object is used instead.

```javascript
function Factory() {
  this.name = "ignored";
  return { name: "returned" };
}

const obj = new Factory();
console.log(obj.name); // "returned"
```

If it returns a primitive, the `new` object is used.

```javascript
function Fn() {
  this.name = "instance";
  return 42;
}

const obj = new Fn();
console.log(obj.name); // "instance"
```

### `new` and methods

Methods are usually not intended to be called with `new`.

```javascript
const user = {
  name: "Nahid",
  greet() {
    console.log(this.name);
  }
};

new user.greet(); // this is a new instance, not user
```

Inside that call, `this` is the new object, not `user`. This is one more reason passing methods around can be surprising.

## 5. Arrow functions

Arrow functions do not have their own `this`.

```javascript
const user = {
  name: "Nahid",
  greet: () => {
    console.log(this.name);
  }
};

user.greet(); // not "Nahid" in the usual method sense
```

The arrow function ignores the call shape entirely. Its `this` is inherited from the surrounding scope where the arrow function was created.

```javascript
function outer() {
  console.log(this); // regular binding for outer

  const inner = () => {
    console.log(this); // same this as outer
  };

  inner();
}

outer.call({ value: 1 });
```

Both logs use the same `this` because the arrow inherits it from `outer`.

### Arrow functions and callbacks

This is why arrows are useful in callbacks.

```javascript
const user = {
  name: "Nahid",
  friends: ["Amir", "Sana"],

  printFriends() {
    this.friends.forEach((friend) => {
      console.log(`${this.name} knows ${friend}`);
    });
  }
};

user.printFriends();
```

If the callback were a regular function, `this` inside `forEach` would not be `user`. The arrow closes over `this` from `printFriends`.

```javascript
printFriends() {
  this.friends.forEach(function (friend) {
    console.log(`${this.name} knows ${friend}`); // broken this
  });
}
```

That version loses the connection.

### Arrow functions cannot be rebound

```javascript
const fn = () => console.log(this);
const bound = fn.bind({ value: 1 });
bound(); // still the original this
```

`bind` returns a function, but the arrow body still uses the lexical `this`. The binding is ignored.

The same is true for `call` and `apply`.

```javascript
const fn = () => console.log(this);
fn.call({ value: 1 }); // still the original this
```

Arrow functions are great when you want `this` to behave lexically. They are a poor fit when you need a method or a constructor.

## A practical model

When you see `this`, ask these questions in order:

```text
1. Was the function called with new?
   → this is the new instance.

2. Was the call .call, .apply, or .bind?
   → this is the explicitly supplied value.

3. Was the call a property access like obj.method()?
   → this is obj.

4. Is the function an arrow function?
   → this is the surrounding lexical this.

5. Otherwise:
   → default binding: undefined in strict mode, global object otherwise.
```

The order matters. Explicit beats implicit. `new` beats implicit. Arrows are outside the whole call-based system.

## Common mistakes

### Mistake 1: assuming this is the object where the function was defined

```javascript
const user = {
  name: "Nahid",
  greet() {
    console.log(this.name);
  }
};

const fn = user.greet;
fn(); // undefined in strict mode
```

The function is not permanently attached to `user`.

### Mistake 2: using arrow functions as methods

```javascript
const user = {
  name: "Nahid",
  greet: () => console.log(this.name)
};
```

Arrow methods do not receive the object as `this`.

### Mistake 3: passing a method without binding it

```javascript
setTimeout(user.greet, 1000); // lost context
setTimeout(user.greet.bind(user), 1000); // fixed
```

### Mistake 4: confusing `call` and `bind`

```javascript
greet.bind(user); // returns a function, does not call it
greet.call(user);  // calls it immediately
```

### Mistake 5: thinking bind locks the original

`bind` creates a new function. The original is still callable and still follows its own binding rules.

```javascript
const greet = user.greet.bind(user);
greet();       // "Nahid"
user.greet();  // "Nahid" as well
```

### Mistake 6: treating arrow functions as universal replacements

Arrow functions are excellent for lexical `this`, but they cannot represent method or constructor call shapes.

## A compact reference

```text
Call shape                      this
─────────────────────────────   ──────────────────────────────
fn()                            default (undefined in strict)
obj.fn()                        obj (implicit)
fn.call(value, ...)             value (explicit)
fn.apply(value, [args])         value (explicit)
bound = fn.bind(value)          value, locked for later calls
new Fn()                        new instance
() => {}                        lexical this from surrounding scope
```

## Interview questions you should be able to answer

### 1. What decides the value of `this`?

The call shape, not the definition site.

### 2. What is `this` in a plain function call in strict mode?

`undefined`.

### 3. What is the difference between `call`, `apply`, and `bind`?

`call` invokes immediately with `this` and individual arguments. `apply` invokes immediately with `this` and an array of arguments. `bind` returns a new function with `this` preset.

### 4. Why does `setTimeout(user.greet, 1000)` lose context?

The timer calls it as a plain function, so default binding applies.

### 5. Can you change the `this` of an arrow function with `bind`?

No. Arrow functions use lexical `this` and ignore explicit binding.

### 6. What does `new` do to `this`?

It creates a new object and binds `this` to it inside the constructor call.

## Final mental model

```text
A function is a value.
A call is an action.
this is part of the call contract.

Default   → plain call
Implicit  → property call
Explicit  → call / apply / bind
new       → constructor call
Arrow     → inherited, not decided at call time
```

Or in one sentence:

> **`this` is the object a function is talking to when it is called, and that object is decided by the call, not by where the function lives.**

Once you can classify every call you see, `this` stops being a mystery and becomes a predictable part of the function contract.

The next step is understanding how objects and functions are linked behind the scenes, which is the prototype chain.
