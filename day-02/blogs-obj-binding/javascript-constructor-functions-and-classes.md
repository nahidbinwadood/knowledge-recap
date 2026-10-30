---
title: "Constructor Functions and Classes in JavaScript"
excerpt: "JavaScript does not have classes in the classical sense. It has constructor functions, prototype links, and later class syntax layered on top. This post explains new, constructor bodies, extends and super, static members, private fields, and which parts are sugar."
tags: ["javascript", "classes", "constructors", "new", "prototypes", "extends", "super"]
---

# Constructor Functions and Classes

JavaScript has a class keyword now.

That makes people think JavaScript has classes in the same way other languages do.

It does not.

What it has is:

- constructor functions
- prototype links
- a `new` operator that wires instances to a prototype
- class syntax that standardizes a pattern already in common use

If you understand the underlying mechanism, class syntax becomes readable. If you only learn the syntax, it becomes a list of rules that feel arbitrary.

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}

const p = new Person("Nahid");
console.log(p.greet()); // "Hello, Nahid"
```

This looks like a class definition in many languages.

Underneath, it is still a constructor function with a prototype.

## Constructor functions

A constructor function is a function intended to be called with `new`.

```javascript
function Person(name) {
  this.name = name;
}

const p = new Person("Nahid");
console.log(p.name); // "Nahid"
```

When you call it with `new`, JavaScript:

```text
1. creates a new object
2. links that object to Person.prototype
3. calls the function with this bound to the new object
4. returns the new object unless the function returns another object
```

The word "constructor" here is a role, not a special language form. Any function can be used this way.

```javascript
function Thing() {
  this.ok = true;
}

const t = new Thing();
console.log(t.ok); // true
```

That said, constructors are conventionally capitalized to signal their intent.

### The instance's prototype

The important connection is the hidden link.

```javascript
function Person(name) {
  this.name = name;
}

const p = new Person("Nahid");

console.log(Object.getPrototypeOf(p) === Person.prototype); // true
```

So when you add a method to `Person.prototype`, every instance sees it through delegation.

```javascript
Person.prototype.greet = function () {
  return `Hello, ${this.name}`;
};

console.log(p.greet()); // "Hello, Nahid"
```

This was the standard pattern before classes existed.

### Methods inside the constructor versus on the prototype

If you add a method inside the constructor, each instance gets its own copy.

```javascript
function Person(name) {
  this.name = name;
  this.greet = function () {
    return `Hello, ${this.name}`;
  };
}
```

If you add it to the prototype, all instances share one copy.

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return `Hello, ${this.name}`;
};
```

The second pattern uses less memory and expresses shared behavior more directly.

### The constructor property

Every function's default `prototype` object has a `constructor` property pointing back to the function.

```javascript
function Person() {}

console.log(Person.prototype.constructor === Person); // true
```

This is mostly a convention. It is not used by the language for core behavior, but it is expected by some code and some libraries.

If you replace the prototype entirely, remember to restore the constructor if code depends on it.

```javascript
function Person() {}

Person.prototype = {
  constructor: Person,
  greet() {
    return `Hello, ${this.name}`;
  }
};
```

Otherwise `p.constructor` may point somewhere unexpected.

## What `new` actually does

The `new` operator is what makes a constructor function produce an instance.

A simplified version of its job:

```text
new Person("Nahid")

1. Create a new object.
2. Set the new object's [[Prototype]] to Person.prototype.
3. Call Person with this = the new object and the given arguments.
4. If Person returns an object, return that object.
5. Otherwise, return the new object.
```

This explains why returning a non-object from a constructor does not override the instance.

```javascript
function Person(name) {
  this.name = name;
  return 42;
}

const p = new Person("Nahid");
console.log(p.name); // "Nahid"
```

And why returning an object does.

```javascript
function Person(name) {
  this.name = name;
  return { name: "override" };
}

const p = new Person("Nahid");
console.log(p.name); // "override"
```

The `new` operator is not just paperwork. It is what turns a function call into instance creation with a prototype link.

## Class syntax as sugar

Class syntax standardizes the constructor-plus-prototype pattern.

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

This is roughly equivalent to:

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return `Hello, ${this.name}`;
};
```

But the class form is more compact and less error-prone for the common case.

Some things are sugar. Some are not.

### What is mostly sugar

- The class body is not a new kind of object.
- Methods become properties on the class's prototype.
- `class` itself does not introduce a new inheritance mechanism. It uses the existing prototype chain.
- An instance of a class is still an ordinary object with a prototype.

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}

const p = new Person("Nahid");

console.log(typeof Person);        // "function"
console.log(Object.getPrototypeOf(p) === Person.prototype); // true
console.log(p.greet());            // "Hello, Nahid"
```

### What is more than sugar

- Class declarations are not hoisted like function declarations. They act like `let` and `const` in many respects.
- Class body code is always strict mode.
- Class syntax establishes a clearer foundation for inheritance, `super`, and `extends`.
- Private fields are not just naming conventions. They are enforced by the language.

So the class keyword is not pure stylistic sugar. It standardizes behavior that was already possible but scattered across conventions and patterns.

## `extends` and `super`

`extends` sets up the prototype chain between subclasses and superclasses.

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}

class Worker extends Person {
  constructor(name, role) {
    super(name);
    this.role = role;
  }

  report() {
    return `${this.name} works as ${this.role}`;
  }
}

const w = new Worker("Nahid", "Engineer");
console.log(w.greet());  // "Hello, Nahid"
console.log(w.report()); // "Nahid works as Engineer"
```

Here:

```text
Worker.prototype.[[Prototype]] === Person.prototype
```

So `w.greet()` is found through the chain, not on `Worker.prototype` directly.

### `super` in the constructor

If a subclass has a constructor, it must call `super()` before using `this`.

```javascript
class Worker extends Person {
  constructor(name, role) {
    this.role = role; // mistake if done before super
    super(name);
  }
}
```

The reason is that `this` does not exist yet in the subclass constructor until the superclass constructor has run. The base class is responsible for creating and initializing the instance object.

This is another sign that classes are not just syntactic sugar over an arbitrary pattern. The initialization order is part of the semantics.

### `super` for method calls

`super` also works for calling methods on the parent prototype.

```javascript
class Person {
  describe() {
    return `Person: ${this.name}`;
  }
}

class Worker extends Person {
  describe() {
    return `${super.describe()} (${this.role})`;
  }
}

const w = new Worker("Nahid", "Engineer");
console.log(w.describe()); // "Person: Nahid (Engineer)"
```

`super.describe()` looks up the method on the parent prototype and calls it with the current `this`.

### `super` is not just syntactic delegation

`super` is resolved dynamically based on the current method's home object, not purely lexically.

That means `super` inside a method is tied to where the method is defined, not where it is called.

```javascript
class A {
  speak() {
    return "A";
  }
}

class B extends A {
  speak() {
    return `B → ${super.speak()}`;
  }
}

const b = new B();
console.log(b.speak()); // "B → A"
```

The call uses the parent implementation, even though the method is being run through the subclass instance.

## Static members

Static members belong to the class itself, not to instances.

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  static fromObj(obj) {
    return new Person(obj.name);
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}

const p = Person.fromObj({ name: "Nahid" });
console.log(p.greet()); // "Hello, Nahid"
```

`fromObj` is not available on instances.

```javascript
console.log(typeof p.fromObj); // undefined
console.log(typeof Person.fromObj); // "function"
```

In prototype terms, static members live on the class function itself, not on the prototype shared by instances.

### Static inheritance

```javascript
class A {
  static identify() {
    return "A";
  }
}

class B extends A {
  static identify() {
    return `B ← ${super.identify()}`;
  }
}

console.log(B.identify()); // "B ← A"
```

Static methods are inherited through the class's own prototype chain, not the instance chain.

## Private fields

JavaScript now has private fields.

```javascript
class Person {
  #name;

  constructor(name) {
    this.#name = name;
  }

  greet() {
    return `Hello, ${this.#name}`;
  }
}

const p = new Person("Nahid");
console.log(p.greet()); // "Hello, Nahid"
console.log(p.#name);   // error
```

The `#` prefix makes the field private to the class. It is not accessible from outside, not even by subclasses or `obj["#name"]`.

This is more than convention.

```javascript
class Person {
  #ssn;
  constructor(ssn) {
    this.#ssn = ssn;
  }
}
```

Renaming or accessing the field from outside is not possible in the normal way. The privacy is enforced by the engine, not by agreement.

### Private fields and subclasses

Private fields are per-class. A subclass does not automatically see the parent's private fields.

```javascript
class A {
  #value = 1;
  get() {
    return this.#value;
  }
}

class B extends A {
  #value = 2;
  getB() {
    return this.#value;
  }
}
```

`B`'s `#value` is a different field from `A`'s `#value`, even though both use the same name.

This is one reason private fields are more precise than the old `_name` convention, which was only a signal to humans.

## What classes make easier

Classes make a few things clearer:

- constructor initialization
- shared methods on the prototype
- subclassing with `extends`
- calling the parent constructor or method with `super`
- static members on the class itself
- private fields with enforced visibility

They do not replace the prototype chain. They organize it.

## What classes do not change

Class instances are still:

- ordinary objects
- linked through a prototype chain
- created with `new`
- callable only through the class constructor's established rules

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}

const p = new Person("Nahid");

console.log(p instanceof Person);            // true
console.log(Object.getPrototypeOf(p) === Person.prototype); // true
```

The object model underneath is the same.

## Constructor functions without classes

You can still write the pattern by hand when you want to.

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return `Hello, ${this.name}`;
};

function Worker(name, role) {
  Person.call(this, name);
  this.role = role;
}

Worker.prototype = Object.create(Person.prototype);
Worker.prototype.constructor = Worker;

Worker.prototype.report = function () {
  return `${this.name} works as ${this.role}`;
};

const w = new Worker("Nahid", "Engineer");
console.log(w.greet());  // "Hello, Nahid"
console.log(w.report()); // "Nahid works as Engineer"
```

This is the pre-class inheritance pattern. It is verbose, but it exposes the pieces that classes later packaged.

The important parts are:

- call the parent constructor to initialize `this`
- link the prototype with `Object.create`
- restore the constructor if needed
- add subclass methods on the subclass prototype

## A quick comparison

```text
Pattern                        Prototype link               Shared methods
─────────────────────────────  ───────────────────────────  ──────────────
Constructor function           obj → Fn.prototype           on Fn.prototype
Class                          obj → Class.prototype        on Class.prototype
extends                        obj → Sub.prototype → Super.prototype  on each prototype
Object.create delegation       obj → chosen prototype       on chosen prototype
```

All of them use the same lookup mechanism.

## Common mistakes

### Mistake 1: forgetting `new` with a constructor

```javascript
function Person(name) {
  this.name = name;
}

const p = Person("Nahid"); // missing new
```

In non-strict mode, `this` may become the global object instead of a new instance. In strict mode, `this` is `undefined`. Either way, it is not what you intended.

### Mistake 2: using a class without `new`

```javascript
class Person {}

const p = Person(); // error
```

Class constructors must be called with `new`.

### Mistake 3: forgetting to call `super` in a subclass constructor

```javascript
class Worker extends Person {
  constructor(name, role) {
    this.role = role; // wrong before super
    super(name);
  }
}
```

Using `this` before calling `super` in a derived class constructor is an error.

### Mistake 4: treating `super` as a reference to the parent instance

`super` is not the parent object. It is a way to call parent methods or access the parent prototype chain from within a method or constructor.

### Mistake 5: putting instance-specific mutable state on the prototype

```javascript
class Person {
  constructor() {
    // do not do this:
  }
}

Person.prototype.shared = [];
```

That array is shared by every instance.

### Mistake 6: assuming private fields are just a naming convention

They are enforced by the language. `#field` is not accessible from outside the class, and `_field` is only a convention.

### Mistake 7: thinking classes are a completely different inheritance model

They are not. They are a structured interface over the existing prototype chain.

## Interview questions you should be able to answer

### 1. What happens when you call a constructor function with `new`?

A new object is created, its prototype is linked to the constructor's `prototype`, the constructor is called with `this` set to that object, and the object is returned unless the constructor returns another object.

### 2. What is the relationship between a class and a constructor function?

A class is a standardized way to write a constructor function with a prototype, plus rules for `super`, `static`, and private fields.

### 3. What does `extends` do?

It sets up the prototype chain so that instances of the subclass inherit from the superclass's prototype, and it lets the subclass call the superclass constructor and methods with `super`.

### 4. Why must `super()` be called before `this` in a subclass constructor?

Because in a derived class, `this` is not initialized until the superclass constructor runs.

### 5. Where do instance methods live in a class?

On the class's prototype, shared by all instances.

### 6. Where do static methods live?

On the class itself, not on the instance prototype.

### 7. What is the difference between `#field` and `_field`?

`#field` is a language-enforced private field. `_field` is only a convention.

## Final mental model

```text
Classes are organized prototype code.

new → creates object, sets prototype, calls constructor
extends → links two prototypes, enables super
super → calls parent side of the chain
static → belongs to the class function, not the instance
#field → private to the class, enforced by the language
methods → still on the prototype, still inherited through the chain
```

Or in one sentence:

> **Classes are a cleaner surface for the same prototype mechanism that has always existed in JavaScript, and knowing the mechanism is what makes the class syntax readable instead of magical.**

The next piece is how JavaScript turns one value into another, and how equality actually works.
