---
title: "Map, Set, WeakMap, WeakSet, and the Iterable Protocol in JavaScript"
excerpt: "Objects are not always the right key-value or collection model. This post explains Map, Set, WeakMap, WeakSet, when each is appropriate, why Weak* exists, the iterable protocol, for...of, and generators as a way to model lazy sequences."
tags: ["javascript", "map", "set", "weakmap", "weakset", "iterable", "for-of", "generators"]
---

# Map, Set, WeakMap, WeakSet, and the Iterable Protocol

Object literals are the default collection in JavaScript. For many jobs, that is fine.

But objects carry baggage that is not always helpful:

- keys are strings or symbols, not arbitrary values
- the prototype chain can interfere with lookup
- property enumeration comes with its own rules
- some objects are not safe to use as maps because of inherited members

JavaScript added collection types to fill those gaps.

```javascript
const m = new Map();
const s = new Set();
const wm = new WeakMap();
const ws = new WeakSet();
```

These are not just alternate syntax. They are different models with different trade-offs.

## Map

A `Map` is a collection of key-value pairs where keys can be any value.

```javascript
const scores = new Map();

scores.set("Nahid", 92);
scores.set("Amir", 88);
scores.set(42, "the answer");

console.log(scores.get("Nahid")); // 92
console.log(scores.get(42));      // "the answer"
console.log(scores.has("Amir"));  // true
```

Unlike an object, a `Map` does not coerce keys to strings.

```javascript
const obj = {};
obj[42] = "number";
obj["42"] = "string";

console.log(obj[42]);    // "string"
console.log(obj["42"]);  // "string"
```

Both keys became `"42"`. That is often not what you want.

With a `Map`:

```javascript
const m = new Map();
m.set(42, "number");
m.set("42", "string");

console.log(m.get(42));    // "number"
console.log(m.get("42"));  // "string"
```

The keys stay distinct.

### When Map is better than an object

- keys are not strings or symbols
- you need to preserve insertion order
- you want to know the size directly
- you want to clear everything without losing the reference
- you do not want prototype chain interference

```javascript
const cache = new Map();

cache.set(fn, resultA);
cache.set(fn, resultB);

console.log(cache.size); // 1
console.log(cache.has(fn)); // true
```

Objects are still better when:

- keys are known, fixed, and string-like
- you want literal syntax and destructuring convenience
- the shape is part of the API and is static

A common rule:

> Use objects for records. Use Maps for dynamic key-value data.

### Map features

```javascript
const m = new Map([["a", 1], ["b", 2]]);

m.set("c", 3);
m.get("a");
m.has("b");
m.delete("b");
m.clear();
m.size;
```

`Map` also preserves insertion order, which is reliable and well-defined.

```javascript
const m = new Map();
m.set("first", 1);
m.set("second", 2);
m.set("third", 3);

for (const [key, value] of m) {
  console.log(key, value);
}
```

Output:

```text
first 1
second 2
third 3
```

### Object keys and Map keys

An object can only have string or symbol keys. A `Map` can have any value as a key.

```javascript
const domNode = document.body;
const cache = new Map();
cache.set(domNode, { visited: true });

console.log(cache.get(domNode)); // { visited: true }
```

This is one of the main use cases for `Map`: associating data with an object without putting the data on the object itself.

## Set

A `Set` is a collection of unique values.

```javascript
const tags = new Set();

tags.add("javascript");
tags.add("javascript");
tags.add("react");

console.log(tags.size); // 2
console.log(tags.has("javascript")); // true
console.log(tags.has("python")); // false
```

Duplicates are ignored.

### When Set is useful

- you need unique values
- you want to test membership quickly
- you want to remove duplicates from an array

```javascript
const unique = [...new Set([1, 2, 2, 3, 3, 3])];
console.log(unique); // [1, 2, 3]
```

- you want set-like operations

```javascript
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

const intersection = [...a].filter((x) => b.has(x));
const union = [...new Set([...a, ...b])];
const difference = [...a].filter((x) => !b.has(x));
```

These are not built-in set algebra methods, but they are easy to write on top of `Set`.

### Set iteration

```javascript
const s = new Set(["a", "b", "c"]);

s.forEach((value) => console.log(value));

for (const value of s) {
  console.log(value);
}
```

`Set` also has `keys`, `values`, and `entries`, mostly for API symmetry with `Map`.

```javascript
console.log([...s.values()]);    // ["a", "b", "c"]
console.log([...s.keys()]);      // ["a", "b", "c"]
console.log([...s.entries()]);   // [["a", "a"], ["b", "b"], ["c", "c"]]
```

In a `Set`, `keys` and `values` return the same thing.

## WeakMap

A `WeakMap` is like a `Map`, but the keys are held weakly.

```javascript
const cache = new WeakMap();

const key = {};
cache.set(key, "some data");

console.log(cache.get(key)); // "some data"
```

The important difference:

- you cannot iterate a `WeakMap`
- you cannot clear it
- you cannot see its size
- if the key object is otherwise unreachable, the entry can be garbage collected

You cannot pass a primitive as a key.

```javascript
const wm = new WeakMap();
wm.set("string", "value"); // error
```

Only objects are allowed as keys.

### Why WeakMap exists

A common pattern is to associate private or cached data with an object without preventing the object from being collected.

```javascript
const elementData = new WeakMap();

function setMetadata(element, data) {
  elementData.set(element, data);
}

function getMetadata(element) {
  return elementData.get(element);
}
```

If `element` is removed from the DOM and no other reference exists, the `WeakMap` entry does not keep it alive.

With a normal `Map`, the key would stay reachable as long as the `Map` itself exists, even if the element is gone everywhere else.

That is why `WeakMap` is useful for caches, metadata, and private associations tied to object lifetime.

### WeakMap limitations

Because entries can disappear when keys are collected, `WeakMap` is not suitable when you need to enumerate keys or guarantee presence.

```javascript
const wm = new WeakMap();

// Not possible:
wm.size;            // undefined
wm.clear();         // not available
for (const k of wm) {} // not iterable
```

It is a one-way association: you can get from key to value, but you cannot audit the whole map.

## WeakSet

A `WeakSet` is the weak version of a `Set`.

```javascript
const tracked = new WeakSet();

const obj = {};
tracked.add(obj);

console.log(tracked.has(obj)); // true
```

Like `WeakMap`:

- only objects are allowed
- no iteration
- no `size`
- no `clear`
- entries can be garbage collected when the object is no longer reachable

### When WeakSet is useful

- you want to mark objects without keeping them alive
- you need to remember "have I seen this object?" without storing a strong reference

```javascript
const processed = new WeakSet();

function process(obj) {
  if (processed.has(obj)) return;
  processed.add(obj);
  // ...
}
```

If the object is otherwise unreachable, the marker does not keep it around.

## Weak references and why Weak* exist

The "weak" in `WeakMap` and `WeakSet` refers to the key reference, not the value.

- Strong reference: keeps an object alive
- Weak reference: does not keep an object alive by itself

A `Map` holds strong references to its keys. A `WeakMap` holds weak references to its keys.

This is the core reason `WeakMap` and `WeakSet` exist:

> They let you associate data with objects without becoming the reason those objects stay in memory.

If you used a normal `Map` for element metadata, every element you tracked would stay in memory as long as the `Map` existed. With a `WeakMap`, the element can be collected when it is no longer used elsewhere.

This is subtle, and it matters mostly in long-running applications, caching layers, and libraries that attach data to external objects.

## The iterable protocol

JavaScript has a protocol for "things you can loop over with `for...of`".

An object is iterable if it has a `Symbol.iterator` method that returns an iterator.

```javascript
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        if (i < 3) {
          return { value: i++, done: false };
        }
        return { done: true };
      }
    };
  }
};

for (const value of iterable) {
  console.log(value);
}
```

Output:

```text
0
1
2
```

The `for...of` loop asks the object for `Symbol.iterator`, then repeatedly calls `next()` until `done` is true.

This is why arrays, strings, `Map`, `Set`, and `NodeList` all work with `for...of`.

```javascript
for (const item of [1, 2, 3]) console.log(item);
for (const char of "abc") console.log(char);
for (const [k, v] of new Map([["a", 1]])) console.log(k, v);
for (const v of new Set([1, 2])) console.log(v);
```

They all implement the iterable protocol.

### The iterator protocol

An iterator is an object with a `next()` method.

```javascript
iterator.next() //=> { value: ..., done: boolean }
```

- `value`: the current item
- `done`: whether iteration is finished

That is the whole interface.

```javascript
const arr = [10, 20, 30];
const iter = arr[Symbol.iterator]();

console.log(iter.next()); // { value: 10, done: false }
console.log(iter.next()); // { value: 20, done: false }
console.log(iter.next()); // { value: 30, done: false }
console.log(iter.next()); // { done: true }
```

Any object can become iterable by implementing `Symbol.iterator` in this style.

### Built-in iterables

These are iterable by default:

- arrays
- strings
- `Map`
- `Set`
- `NodeList` and some other DOM collections
- `arguments` in non-strict mode (legacy)
- `TypedArray`

Plain objects are not iterable by default.

```javascript
const obj = { a: 1, b: 2 };

for (const key of obj) {
  console.log(key); // error
}
```

If you want to iterate over own properties, you usually do:

```javascript
for (const key of Object.keys(obj)) {
  console.log(key, obj[key]);
}
```

Or:

```javascript
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value);
}
```

## for...of

`for...of` loops over values from an iterable.

```javascript
for (const value of iterable) {
  // ...
}
```

This is different from `for...in`, which loops over enumerable property keys.

```javascript
const arr = [10, 20, 30];
arr.extra = "oops";

for (const key in arr) {
  console.log(key); // 0, 1, 2, "extra"
}

for (const value of arr) {
  console.log(value); // 10, 20, 30
}
```

`for...in` includes inherited enumerable properties and is generally not the right tool for arrays. `for...of` is for iterating values from an iterable.

### Destructuring in for...of

Because `Map` entries are `[key, value]` pairs, destructuring works naturally.

```javascript
const map = new Map([["a", 1], ["b", 2]]);

for (const [key, value] of map) {
  console.log(key, value);
}
```

## Generators

Generators are functions that can pause and resume.

```javascript
function* countTo(n) {
  for (let i = 1; i <= n; i++) {
    yield i;
  }
}

const gen = countTo(3);

console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { done: true }
```

The `*` marks the function as a generator. `yield` pauses execution and returns a value.

Because generators are iterable, they work with `for...of`.

```javascript
for (const n of countTo(3)) {
  console.log(n);
}
```

Output:

```text
1
2
3
```

### Generators as lazy sequences

Generators are useful when you want a sequence without building the whole thing in memory.

```javascript
function* fibonacci() {
  let a = 0;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
console.log(fib.next().value); // 0
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2
```

The sequence is infinite, but it is computed lazily.

You can also limit it:

```javascript
function take(n, iterable) {
  const result = [];
  const iter = iterable[Symbol.iterator]();
  for (let i = 0; i < n; i++) {
    const { done, value } = iter.next();
    if (done) break;
    result.push(value);
  }
  return result;
}

console.log(take(5, fibonacci())); // [0, 1, 1, 2, 3]
```

### Generator return value

A generator can return a final value.

```javascript
function* gen() {
  yield 1;
  yield 2;
  return 3;
}

const g = gen();
console.log(g.next()); // { value: 1, done: false }
console.log(g.next()); // { value: 2, done: false }
console.log(g.next()); // { value: 3, done: true }
```

The returned value appears in the last `next()` result, with `done: true`.

### yield delegation

A generator can delegate to another iterable with `yield*`.

```javascript
function* a() {
  yield 1;
  yield 2;
}

function* b() {
  yield* a();
  yield 3;
}

console.log([...b()]); // [1, 2, 3]
```

This is a concise way to flatten or combine iterable sequences.

## Why these collection types matter

They exist because the object model is general-purpose but not optimized for every collection task.

- `Map` gives you arbitrary keys, ordered entries, and a clean API.
- `Set` gives you unique values and membership tests.
- `WeakMap` and `WeakSet` give you weak associations without preventing garbage collection.
- The iterable protocol and `for...of` give you a uniform way to work with sequences.
- Generators give you lazy, composable sequences without building the whole thing up front.

None of these replace objects. They complement them.

## Common mistakes

### Mistake 1: using an object when a Map is clearer

```javascript
const cache = {};
cache[key] = value;
```

If `key` can be non-string or you want size, order, or clean deletions, `Map` is usually better.

### Mistake 2: using Map when an object is simpler

If the keys are fixed and string-like, an object is often more readable.

```javascript
const config = {
  timeout: 3000,
  retries: 3
};
```

### Mistake 3: expecting WeakMap to be iterable

It is not.

### Mistake 4: using WeakMap to store data you need to enumerate later

WeakMaps are not for auditing or iterating. They are for key-to-value associations tied to object lifetime.

### Mistake 5: using for...in on arrays

```javascript
for (const i in arr) {
  // includes non-index properties and is string-keyed
}
```

Prefer `for...of`, `forEach`, or a normal loop.

### Mistake 6: assuming plain objects are iterable

They are not.

```javascript
for (const k of {}) {} // error
```

### Mistake 7: confusing generator laziness with async

A generator yields values synchronously. It does not make async code sequential. Async generators exist, but they are a separate layer on top of async iteration.

## Interview questions you should be able to answer

### 1. When would you choose Map over an object?

When keys are not strings, when you need reliable order, size, or clean removal, or when you want to avoid prototype chain interference.

### 2. What is the difference between Set and an array?

A `Set` enforces uniqueness and gives fast membership tests. An array preserves duplicates and has indexed access and methods for ordered mutation.

### 3. What is a WeakMap?

A `Map`-like structure whose keys are held weakly, does not prevent garbage collection of keys, and is not iterable.

### 4. Why can WeakMap only use objects as keys?

Because weak references only make sense for objects that can be garbage collected. Primitives are not garbage-collected in the same way.

### 5. What makes an object iterable?

Implementing `Symbol.iterator`, which returns an iterator with a `next()` method.

### 6. What is the difference between for...in and for...of?

`for...in` iterates enumerable property keys, including inherited ones. `for...of` iterates values from an iterable.

### 7. What does yield do in a generator?

It pauses the generator and returns a value to the caller, then resumes when `next()` is called again.

## Final mental model

```text
Map         → ordered key-value, any key type
Set         → unique values, membership test
WeakMap     → key-value with weak keys, no iteration
WeakSet     → set of objects with weak references, no iteration
Iterable    → object with Symbol.iterator
Iterator    → object with next() => { value, done }
for...of    → loops values from an iterable
generator   → function that yields values lazily
```

Or in one sentence:

> **Map, Set, WeakMap, WeakSet, iterators, and generators are all part of the same story: JavaScript's modern collection and iteration model, built on top of the object system but clearer for specific jobs.**

Once you know when to reach for each one, collections stop being a source of hacks and start being a set of deliberate choices.

The next piece is the last layer of object control: property descriptors, getters, setters, and enumerability.
