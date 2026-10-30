---
title: "Prototypes and the Prototype Chain in JavaScript"
excerpt: "JavaScript objects do not copy behavior from a blueprint. They link to other objects through a hidden chain. This post explains [[Prototype]], Object.create, property lookup, delegation, and why instanceof and class behavior are really chain questions."
tags: ["javascript", "prototypes", "objects", "inheritance", "prototype-chain"]
---

# Prototypes and the Prototype Chain

Most people learn JavaScript objects as collections of properties.

That is true at the surface.

Underneath, every ordinary object has a hidden link to another object. When you read a property that the object does not own, JavaScript follows that link and keeps going until it finds the property or runs out of chain.

That is the prototype chain.

```text
myObject
    │
    ▼
[[Prototype]] → otherObject
                     │
                     ▼
              [[Prototype]] → ...
```

The chain is not a special inheritance class system. It is a lookup rule.

## Own properties and inherited properties

Every object has its own properties and possibly inherited ones.

```javascript
const parent = {
  greeting: "Hello"
};

const child = Object.create(parent);
child.name = "Nahid";

console.log(child.name);    // "Nahid" — own property
console.log(child.greeting); // "Hello" — inherited from parent
```

`child` does not have `greeting`. It has a link to `parent`, and the lookup finds `greeting` there.

```javascript
console.log(child.hasOwnProperty("name"));    // true
console.log(child.hasOwnProperty("greeting")); // false
```

The property is accessible on `child`, but it is not owned by `child`.

This distinction matters more than it first appears. Mutating an inherited property through the child is not the same as having the property on the child.

```javascript
child.greeting = "Hi";

console.log(child.greeting);          // "Hi" — now an own property
console.log(parent.greeting);         // "Hello" — unchanged
console.log(child.hasOwnProperty("greeting")); // true
```

Assignment created a new own property on `child`. It did not modify `parent.greeting`.

## The hidden link: [[Prototype]]

Every ordinary object has an internal slot called `[[Prototype]]`.

You usually cannot see it directly, but you can inspect it.

```javascript
const parent = { blog: "prototypes" };
const child = Object.create(parent);

console.log(Object.getPrototypeOf(child) === parent); // true
```

`Object.getPrototypeOf` is the standard way to read the link.

Older code often uses:

```javascript
console.log(child.__proto__ === parent); // true
```

`__proto__` is a legacy accessor. The modern API is `Object.getPrototypeOf`, and `Object.setPrototypeOf` if you really need to mutate the link after creation. Mutating it later is uncommon and usually a sign that a simpler design is possible.

The important part is that the link exists for almost every object.

The main exceptions are:

- objects created with `Object.create(null)` have no prototype
- some host objects follow their own rules

For ordinary objects, the link is always there unless you explicitly remove it.

## Property lookup

When you read `obj.prop`, JavaScript does this:

```text
1. If obj has own property "prop", return it.
2. Otherwise, follow obj.[[Prototype]] and try there.
3. If that object has it, return it.
4. Otherwise, follow its [[Prototype]].
5. Repeat until the chain ends.
6. If nothing has it, the result is undefined.
```

```javascript
const root = { a: 1 };
const middle = Object.create(root);
const leaf = Object.create(middle);

leaf.b = 2;

console.log(leaf.a); // 1 — from root
console.log(leaf.b); // 2 — own
console.log(leaf.c); // undefined — not anywhere in the chain
```

The lookup does not copy properties onto `leaf`. It reaches through the chain.

If the chain ends without finding the property, the result is `undefined`, not an error.

```javascript
const empty = Object.create(null);
console.log(empty.anything); // undefined
```

## Object.create

`Object.create` is the clearest way to build prototype links by hand.

```javascript
const proto = {
  greet() {
    return `Hello, ${this.name}`;
  }
};

const user = Object.create(proto);
user.name = "Nahid";

console.log(user.greet()); // "Hello, Nahid"
```

`user` does not have `greet`. It delegates to `proto`.

This is prototype-based delegation:

```text
user does not contain greet
        │
        ▼
lookup fails on user
        │
        ▼
lookup continues on proto
        │
        ▼
greet found there, called with this = user
```

Notice that `this` inside `greet` is still `user`, because the call shape is `user.greet()`.

This is one of the most important points in the language:

> **Delegation and this are separate mechanisms. The chain decides where the method is found. The call decides what this is.**

## The chain as fallback behavior

Prototype delegation is a fallback, not a merge.

```javascript
const defaults = {
  theme: "light",
  fontSize: 14
};

const userPrefs = Object.create(defaults);
userPrefs.fontSize = 16;

console.log(userPrefs.theme);    // "light" — inherited
console.log(userPrefs.fontSize); // 16 — own override
```

The child's own property shadows the inherited one.

Shadowing is the word for this:

```text
own property wins over inherited property
```

If you delete the own property, the inherited one becomes visible again.

```javascript
delete userPrefs.fontSize;
console.log(userPrefs.fontSize); // 14 — back to inherited
```

This is why prototype chains are useful for defaults. You can share behavior and data upward, then override only what changes.

## Shared prototype objects

When multiple objects share the same prototype, changes to that prototype are visible through all of them.

```javascript
const proto = {
  greet() {
    return `Hi, ${this.name}`;
  }
};

const a = Object.create(proto);
a.name = "A";

const b = Object.create(proto);
b.name = "B";

console.log(a.greet()); // "Hi, A"
console.log(b.greet()); // "Hi, B"
```

The method is stored once, on `proto`.

This is not copying. It is shared access through the chain.

That is why modifying a prototype can affect many objects at once.

```javascript
proto.greet = function () {
  return `Hello, ${this.name}`;
};

console.log(a.greet()); // "Hello, A"
console.log(b.greet()); // "Hello, B"
```

Be careful with mutable shared prototypes. Shared state on the prototype is shared in the wrong way more often than people expect.

```javascript
const proto = {
  tags: []
};

const x = Object.create(proto);
const y = Object.create(proto);

x.tags.push("js");

console.log(y.tags); // ["js"] — shared, not copied
```

If `tags` should be per-object, it does not belong on the shared prototype.

## `instanceof` is a chain question

`instanceof` does not ask whether an object was created by a particular constructor in a mystical sense.

It asks whether the constructor's `prototype` property is in the object's prototype chain.

```javascript
function Person(name) {
  this.name = name;
}

const p = new Person("Nahid");

console.log(p instanceof Person); // true
```

Here is why:

```text
p.[[Prototype]] === Person.prototype
```

So `Person.prototype` is in the chain of `p`.

```javascript
const proto = Object.getPrototypeOf(p);
console.log(proto === Person.prototype); // true
```

If the chain does not contain that prototype, `instanceof` is false.

```javascript
function Thing() {}
const t = new Thing();

console.log(t instanceof Person); // false
```

Because `Person.prototype` is not in `t`'s chain.

`instanceof` can also return true for multiple constructors, if their prototypes appear in the same chain.

```javascript
function A() {}
function B() {}
B.prototype = Object.create(A.prototype);

const b = new B();
console.log(b instanceof B); // true
console.log(b instanceof A); // true
```

This is because `b`'s chain goes through `B.prototype` and then through `A.prototype`.

## Prototypes and the `new` operator

When you call a function with `new`, JavaScript creates a new object and sets its prototype to the function's `prototype` property.

```javascript
function Person(name) {
  this.name = name;
}

const p = new Person("Nahid");

console.log(Object.getPrototypeOf(p) === Person.prototype); // true
```

So the `new` operator is really doing this behind the scenes:

```text
1. Create a new object.
2. Set its [[Prototype]] to Person.prototype.
3. Call Person with this bound to the new object.
4. Return the new object unless the constructor returns another object.
```

The function body is not special. The magic is the hidden link.

That is why methods are usually added to the prototype, not to each instance.

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return `Hello, ${this.name}`;
};

const a = new Person("A");
const b = new Person("B");

console.log(a.greet()); // "Hello, A"
console.log(b.greet()); // "Hello, B"
```

Both instances share the same `greet` through the prototype chain.

If `greet` were assigned inside the constructor, every instance would get its own copy.

```javascript
function Person(name) {
  this.name = name;
  this.greet = function () {
    return `Hello, ${this.name}`;
  };
}
```

That works, but it uses more memory and defeats the sharing purpose of the prototype.

## Functions have prototypes too

Every function has a `prototype` property by default.

```javascript
function fn() {}

console.log(typeof fn.prototype); // "object"
```

That `prototype` property is used when the function is called with `new`. It is not the function's own prototype.

```javascript
function fn() {}

console.log(Object.getPrototypeOf(fn) === Function.prototype); // true
console.log(fn.prototype); // a plain object with a constructor property
```

These two things are different:

```text
fn.[[Prototype]]          → Function.prototype
fn.prototype              → the object used for new instances
```

This distinction is one of the most confusing parts of JavaScript, because the word "prototype" is used for two related but different things.

## The chain is not a class system

JavaScript's prototype chain is object-to-object delegation.

A class-like pattern is built on top of that, using:

- constructor functions
- the `prototype` property
- `new`
- shared methods on the prototype

But the underlying mechanism is still just linked objects.

```javascript
const animal = {
  init(name) {
    this.name = name;
    return this;
  },
  speak() {
    return `${this.name} makes a sound`;
  }
};

const dog = Object.create(animal);
dog.bark = function () {
  return `${this.name} barks`;
};

const rex = Object.create(dog);
rex.init("Rex");

console.log(rex.speak()); // "Rex makes a sound"
console.log(rex.bark());  // "Rex barks"
```

No constructor, no `class`, no `extends`. Just objects linked together.

This is the original JavaScript inheritance model.

## Why prototypes matter for classes

Later, when you read class syntax, it helps to know that:

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}
```

is mostly sugar over:

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return `Hello, ${this.name}`;
};
```

The behavior is still prototype-based. The chain is still there. The method is still shared on the prototype.

If you only learn classes, the language looks cleaner. If you also learn prototypes, classes become legible instead of mysterious.

## Common mistakes

### Mistake 1: treating prototype inheritance like class inheritance

Prototypes are links between objects, not blueprints copied onto instances.

### Mistake 2: mutating the wrong prototype

```javascript
function Person() {}
const p = new Person();

Person.prototype.greet = () => "Hi";
```

This affects all instances, present and future.

If that was not your intent, do not modify the prototype after creation.

### Mistake 3: storing mutable shared data on the prototype

```javascript
const proto = {
  items: []
};
```

That array is shared by every object delegating to `proto`. This is a frequent source of surprising bugs.

### Mistake 4: confusing `obj.prototype` with `Object.getPrototypeOf(obj)`

They are different.

```javascript
function F() {}
const obj = new F();

Object.getPrototypeOf(obj) === F.prototype; // true
obj.prototype; // undefined for instances
```

Only functions have a `prototype` property by default.

### Mistake 5: assuming `hasOwnProperty` is the only way to check properties

`hasOwnProperty` ignores inherited properties.

```javascript
const parent = { a: 1 };
const child = Object.create(parent);
child.b = 2;

console.log(child.hasOwnProperty("a")); // false
console.log("a" in child);              // true
```

The `in` operator checks the whole chain.

### Mistake 6: using `__proto__` as if it were the primary API

It works, but the standard APIs are `Object.getPrototypeOf` and `Object.create`.

### Mistake 7: forgetting that the chain ends

If a property is not found anywhere in the chain, the result is `undefined`.

```javascript
const empty = {};
console.log(empty.missing); // undefined
```

That can hide typos.

## A compact lookup model

```text
obj.prop
  │
  ├─ if obj has own prop → return it
  │
  ├─ else if obj.[[Prototype]] has prop → return it
  │
  ├─ else continue up the chain
  │
  └─ if chain ends → undefined
```

Assigned properties normally go onto the object itself, not up the chain.

```javascript
child.greeting = "Hi"; // own property, shadows inherited one
```

## Interview questions you should be able to answer

### 1. What happens when you read a property that the object does not own?

JavaScript follows the prototype chain until it finds the property or reaches the end, returning `undefined` if nothing has it.

### 2. What is the difference between an own property and an inherited property?

An own property lives directly on the object. An inherited property is found through the object's prototype chain.

### 3. How do you create an object with a specific prototype?

`Object.create(proto)` is the clearest way.

### 4. What does `instanceof` actually check?

It checks whether the constructor's `prototype` is in the object's prototype chain.

### 5. Why should shared methods usually live on the prototype?

So all instances can share one copy instead of each instance owning its own.

### 6. What is the difference between `fn.prototype` and `Object.getPrototypeOf(fn)`?

`fn.prototype` is the object used for instances created with `new fn()`. `Object.getPrototypeOf(fn)` is the function's own prototype, usually `Function.prototype`.

## Final mental model

```text
Objects are not copies of a class.

They are linked to other objects.

Read a property:
  own → prototype → prototype → ... → undefined

Call a method:
  found via chain, this decided by the call

Share behavior:
  put it on the shared prototype, not on each instance

Subclass-like behavior:
  just another object in the chain
```

Or in one sentence:

> **The prototype chain is a fallback lookup path from one object to another, and almost everything that looks like inheritance in JavaScript is built on top of that path.**

Once you can see the chain, constructors, classes, and `instanceof` all become much easier to understand.
