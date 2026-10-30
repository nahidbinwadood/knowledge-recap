---
title: "Property Descriptors, Getters, and Setters in JavaScript"
excerpt: "Object properties are not just name-and-value pairs. They have descriptors that control writability, enumerability, and configurability, and they can be backed by getters and setters. This post explains own vs inherited properties, property descriptors, defineProperty, and the difference between hasOwnProperty and the in operator."
tags: ["javascript", "objects", "property-descriptors", "getters", "setters", "enumerability", "defineProperty"]
---

# Property Descriptors, Getters, and Setters

Most of the time, JavaScript properties feel simple.

```javascript
const user = {
  name: "Nahid",
  age: 30
};
```

You read them, write them, delete them, and iterate over them.

But under the surface, every property has a descriptor that controls how it behaves.

```text
property = name + descriptor
descriptor = value or accessors + flags
```

That descriptor is what lets JavaScript support:

- read-only properties
- properties that compute a value on access
- properties that run code on assignment
- properties that are hidden from enumeration
- properties that cannot be changed or deleted

This is the property descriptor system.

## Own properties and inherited properties

Every object has its own properties and possibly inherited ones.

```javascript
const parent = { greet() { return "hi"; } };
const child = Object.create(parent);
child.name = "Nahid";

console.log(child.name);   // "Nahid" — own property
console.log(child.greet()); // "hi" — inherited
```

`name` is on `child`. `greet` is on `parent`, and `child` reaches it through the prototype chain.

The distinction matters for several reasons:

- assignment normally creates or overwrites an own property
- reading follows the chain
- deletion only affects own properties
- enumeration can include inherited properties depending on the operator

## `in` versus `hasOwnProperty`

Two common ways to check for a property:

```javascript
const parent = { a: 1 };
const child = Object.create(parent);
child.b = 2;

console.log("a" in child);              // true — inherited
console.log("b" in child);              // true — own
console.log("c" in child);              // false

console.log(child.hasOwnProperty("a")); // false
console.log(child.hasOwnProperty("b")); // true
console.log(child.hasOwnProperty("c")); // false
```

`in` checks the whole chain.

`hasOwnProperty` checks only the object itself.

This is why `in` can be misleading for "does this object have this property?" questions.

```javascript
const obj = Object.create({ exists: true });
console.log("exists" in obj); // true

obj.exists = undefined;
console.log("exists" in obj); // still true
```

Assigning `undefined` still creates an own property. The property exists; its value is just `undefined`.

If you want to know whether the object itself owns a property, use `hasOwnProperty`.

If you want to know whether the property is reachable through the chain, use `in`.

## Property descriptors

Every own property has a descriptor.

You can read it with `Object.getOwnPropertyDescriptor`.

```javascript
const obj = { x: 1 };
console.log(Object.getOwnPropertyDescriptor(obj, "x"));
```

Something like:

```javascript
{
  value: 1,
  writable: true,
  enumerable: true,
  configurable: true
}
```

That is a data descriptor.

A descriptor can also be an accessor descriptor.

```javascript
const obj = {
  get x() {
    return this._x;
  },
  set x(val) {
    this._x = val;
  }
};

console.log(Object.getOwnPropertyDescriptor(obj, "x"));
```

Something like:

```javascript
{
  get: [Function],
  set: [Function],
  enumerable: true,
  configurable: true
}
```

A property is either:

- a data property with a `value`
- an accessor property with `get` and/or `set`

Not both.

## The descriptor flags

### `writable`

If `false`, the value cannot be changed through assignment.

```javascript
const obj = {};
Object.defineProperty(obj, "id", {
  value: 42,
  writable: false,
  enumerable: true,
  configurable: false
});

obj.id = 99;
console.log(obj.id); // 42 in strict mode, assignment fails silently or throws
```

In strict mode, attempting to assign to a non-writable property throws.

### `enumerable`

If `false`, the property is hidden from most enumeration.

```javascript
const obj = {};
Object.defineProperty(obj, "hidden", {
  value: "secret",
  enumerable: false
});

console.log(obj.hidden); // "secret"
console.log(Object.keys(obj)); // []
for (const key in obj) {
  console.log(key); // nothing
}
```

The property is still accessible directly. It is just not listed by `Object.keys`, `for...in`, or similar enumeration.

This is useful for metadata or internal properties you do not want to surface.

### `configurable`

If `false`, the property cannot be:

- deleted
- redefined with a different descriptor kind
- have its descriptor changed in some ways

```javascript
const obj = {};
Object.defineProperty(obj, "id", {
  value: 1,
  configurable: false
});

delete obj.id;
console.log(obj.id); // 1 — not deleted
```

Once `configurable` is `false`, you usually cannot make it `true` again.

There are some restrictions even for writable properties. For example, changing `writable` from `true` to `false` is allowed, but many other changes are not once `configurable` is `false`.

The exact rules are precise, but the practical idea is simple:

> `configurable: false` locks a property down more strongly than anything else.

## Object.defineProperty

`Object.defineProperty` lets you create or modify a property with an explicit descriptor.

```javascript
const obj = {};
Object.defineProperty(obj, "name", {
  value: "Nahid",
  writable: true,
  enumerable: true,
  configurable: true
});

console.log(obj.name); // "Nahid"
```

You can also use it to add getters and setters.

```javascript
const obj = {
  _count: 0
};

Object.defineProperty(obj, "count", {
  get() {
    return this._count;
  },
  set(val) {
    this._count = val;
  },
  enumerable: true,
  configurable: true
});

obj.count = 5;
console.log(obj.count); // 5
```

This is more explicit than the object literal getter/setter syntax, and it is the low-level API behind it.

## Object.defineProperties

If you want to define several properties at once:

```javascript
const obj = {};
Object.defineProperties(obj, {
  firstName: {
    value: "Nahid",
    writable: true,
    enumerable: true,
    configurable: true
  },
  lastName: {
    value: "Rahman",
    writable: true,
    enumerable: true,
    configurable: true
  },
  fullName: {
    get() {
      return `${this.firstName} ${this.lastName}`;
    },
    enumerable: true,
    configurable: true
  }
});

console.log(obj.fullName); // "Nahid Rahman"
```

This is helpful when you want to set up a batch of properties with different descriptor shapes.

## Object.getOwnPropertyDescriptors

If you want all descriptors for an object's own properties:

```javascript
const obj = { a: 1, b: 2 };
console.log(Object.getOwnPropertyDescriptors(obj));
```

This is useful when you want to copy properties including their descriptor behavior, not just values.

```javascript
const source = { a: 1 };
Object.defineProperty(source, "b", {
  value: 2,
  enumerable: false
});

const target = {};
Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));

console.log(target.a); // 1
console.log(target.b); // 2
console.log(Object.keys(target)); // ["a"]
```

A plain spread or `Object.assign` would not preserve the non-enumerable property.

## Getters and setters in object literals

You can define accessors directly in an object literal.

```javascript
const user = {
  firstName: "Nahid",
  lastName: "Rahman",

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },

  set fullName(value) {
    const parts = value.split(" ");
    this.firstName = parts[0];
    this.lastName = parts[1];
  }
};

console.log(user.fullName); // "Nahid Rahman"
user.fullName = "Amir Hossain";
console.log(user.firstName); // "Amir"
```

Getters and setters let you present a property-like interface backed by computation.

This is useful for:

- derived values
- validation on assignment
- backward-compatible API changes
- hiding internal representation

### Getters are not cached by default

A getter runs every time the property is accessed.

```javascript
const obj = {
  get now() {
    return Date.now();
  }
};

console.log(obj.now);
console.log(obj.now); // different value if enough time passed
```

If you want caching, you have to build it yourself.

```javascript
const obj = {
  _cached: undefined,
  get cachedNow() {
    if (this._cached === undefined) {
      this._cached = Date.now();
    }
    return this._cached;
  }
};
```

### Setters can validate or transform

```javascript
const user = {
  _age: 0,
  get age() {
    return this._age;
  },
  set age(value) {
    if (typeof value !== "number" || value < 0) {
      throw new RangeError("Invalid age");
    }
    this._age = value;
  }
};

user.age = 30;
console.log(user.age); // 30
```

This is a common pattern for controlled mutation.

## Enumerability in practice

Enumerability controls whether a property appears in:

- `for...in`
- `Object.keys`
- `Object.values`
- `Object.entries`
- object literal copying via spread in some cases

It does not control direct access.

```javascript
const obj = {};
Object.defineProperty(obj, "secret", {
  value: 42,
  enumerable: false
});

console.log(obj.secret); // 42
console.log("secret" in obj); // true
console.log(obj.hasOwnProperty("secret")); // true
console.log(Object.keys(obj)); // []
```

This is why built-in methods and library internals often use non-enumerable properties. They exist, but they do not clutter enumeration.

### Why enumerability exists

It gives you a way to separate "public iteration surface" from "internal detail".

```javascript
const widget = {
  type: "button",
  label: "Submit"
};

Object.defineProperty(widget, "__createdAt", {
  value: Date.now(),
  enumerable: false
});
```

Now `Object.keys(widget)` only shows `type` and `label`.

This is not a security mechanism. It is an interface mechanism.

## Configurable and the cost of locking down

`configurable: false` is a one-way door in many cases.

Once set:

- you generally cannot change the descriptor type
- you generally cannot make it configurable again
- you generally cannot delete the property

That can be useful for APIs you want to protect from accidental change.

```javascript
const constants = {};
Object.defineProperty(constants, "PI", {
  value: 3.14159,
  writable: false,
  configurable: false,
  enumerable: true
});
```

But it can also make debugging harder if applied too aggressively.

A common rule:

> Use non-configurable properties only when you have a reason to freeze the shape, not as a default.

## Deleting properties

`delete` removes an own property if it is configurable.

```javascript
const obj = { a: 1, b: 2 };
delete obj.a;
console.log(obj.a); // undefined
console.log(obj.b); // 2
```

`delete` does not affect inherited properties.

```javascript
const parent = { a: 1 };
const child = Object.create(parent);
delete child.a;
console.log(child.a); // 1 — still inherited
```

`delete` also does not work on non-configurable properties.

```javascript
const obj = {};
Object.defineProperty(obj, "id", {
  value: 1,
  configurable: false
});

delete obj.id;
console.log(obj.id); // 1
```

In strict mode, attempting to delete a non-configurable property throws.

## Sealing and freezing

JavaScript provides a few higher-level utilities built on descriptors.

### Object.preventExtensions

You cannot add new properties.

```javascript
const obj = {};
Object.preventExtensions(obj);
obj.newProp = 1;
console.log(obj.newProp); // undefined
```

Existing properties can still be changed or deleted unless further locked.

### Object.seal

Prevents extensions and makes existing properties non-configurable.

```javascript
const obj = { a: 1 };
Object.seal(obj);

obj.a = 2;      // allowed if writable
delete obj.a;   // not allowed
obj.b = 3;      // not allowed
```

The shape is locked, but values can still change if writable.

### Object.freeze

Seals the object and makes existing data properties read-only.

```javascript
const obj = { a: 1 };
Object.freeze(obj);

obj.a = 2; // fails in strict mode
```

This is a shallow freeze. Nested objects are not frozen unless you freeze them separately.

```javascript
const obj = { nested: { x: 1 } };
Object.freeze(obj);

obj.nested.x = 99;
console.log(obj.nested.x); // 99
```

For deep immutability, you need a deeper strategy.

These utilities are built on the descriptor system. They are not a separate mechanism.

## Copying behavior and descriptors

A normal shallow copy does not preserve descriptor behavior.

```javascript
const source = {};
Object.defineProperty(source, "hidden", {
  value: 42,
  enumerable: false
});

const copy = { ...source };
console.log(copy.hidden); // 42
console.log(Object.keys(copy)); // ["hidden"]
```

The spread operator copies enumerable own properties as normal data properties.

If you want the descriptors too:

```javascript
const copy = Object.create(
  Object.getPrototypeOf(source),
  Object.getOwnPropertyDescriptors(source)
);
```

That preserves both enumerable and non-enumerable own properties, along with their accessor or data nature.

## Why this matters

Descriptors are the reason JavaScript can support:

- read-only constants
- computed properties
- private-feeling internal state
- non-enumerable library internals
- sealed and frozen APIs
- predictable copying semantics

They are the fine-grained control layer under the simpler property syntax.

Most application code does not need to reach for them daily. But when you do, it helps to know that a property is not just a slot with a name. It is a slot with rules.

## Common mistakes

### Mistake 1: using `in` when you mean `hasOwnProperty`

```javascript
const child = Object.create({ a: 1 });
console.log("a" in child); // true
console.log(child.hasOwnProperty("a")); // false
```

### Mistake 2: assuming a non-enumerable property does not exist

It exists. It is just hidden from enumeration.

### Mistake 3: assuming frozen objects are deeply immutable

Freeze is shallow.

### Mistake 4: treating getters as cached values

They run on every access unless you implement caching yourself.

### Mistake 5: confusing `const` with frozen objects

```javascript
const obj = { a: 1 };
obj.a = 2; // allowed
```

`const` prevents reassignment of the binding, not mutation of the object.

### Mistake 6: using `delete` on inherited or non-configurable properties

It does not do what people expect.

### Mistake 7: making everything non-configurable by default

That removes flexibility and can make later changes painful.

## Interview questions you should be able to answer

### 1. What is the difference between `in` and `hasOwnProperty`?

`in` checks the whole prototype chain. `hasOwnProperty` checks only the object's own properties.

### 2. What is a property descriptor?

It is the object that describes a property's value or accessor behavior and its `writable`, `enumerable`, and `configurable` flags.

### 3. What is the difference between a data descriptor and an accessor descriptor?

A data descriptor has a `value`. An accessor descriptor has `get` and/or `set`.

### 4. What does `Object.defineProperty` do?

It defines or modifies a property with an explicit descriptor.

### 5. What does `configurable: false` prevent?

It prevents deleting the property and limits descriptor changes.

### 6. What does `Object.freeze` do?

It seals the object and makes existing data properties read-only, shallowly.

### 7. How do you copy an object while preserving property descriptors?

Use `Object.getOwnPropertyDescriptors` with `Object.defineProperties` or `Object.create`.

## Final mental model

```text
property = name + descriptor

descriptor = {
  value | get | set,
  writable,
  enumerable,
  configurable
}

own vs inherited:
  assignment → own property
  reading    → own, then chain
  in         → chain
  hasOwnProperty → own only

enumerability → visible to for...in, Object.keys, etc.
configurability → can be changed or deleted
writability    → can be assigned over

get/set → property-like interface backed by functions
freeze/seal/preventExtensions → higher-level locking built on descriptors
```

Or in one sentence:

> **Property descriptors are the control panel for JavaScript properties, and once you know them, getters, setters, enumerability, sealing, and copying all make sense instead of feeling like special cases.**

This finishes the object model piece of the language. After this, the remaining language machinery is modules, errors, regular expressions, structured data, and the last reflection layer: Proxy and Reflect.
