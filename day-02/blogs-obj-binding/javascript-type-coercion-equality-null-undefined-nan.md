---
title: "Type Coercion and Equality in JavaScript"
excerpt: "JavaScript does not always compare values the way people expect. This post explains ToPrimitive, == vs ===, truthy and falsy, null and undefined, NaN, and why coercion is not random—it is a system with rules you can learn."
tags: ["javascript", "coercion", "equality", "types", "truthy-falsy", "null", "undefined", "nan"]
---

# Type Coercion and Equality in JavaScript

JavaScript has two equality operators.

```javascript
==   loose equality
===  strict equality
```

Most advice is reduced to this:

> Always use `===`.

That advice is useful, but it is not the whole story. If you do not understand what `===` is protecting you from, you will still be surprised when coercion shows up somewhere else.

JavaScript coerces values in more places than equality.

```javascript
if (value) { /* ... */ }
!!value
value || fallback
 Number("123")
"${value}"
```

Coercion is part of the language. Once you know the rules, it becomes predictable instead of magical.

## The two equality operators

Strict equality compares values without coercion.

```javascript
42 === 42        // true
42 === "42"      // false
null === undefined // false
```

Loose equality allows coercion before comparing.

```javascript
42 == 42         // true
42 == "42"       // true
null == undefined // true
```

The difference is not that `==` is random and `===` is correct. The difference is that `==` applies a set of coercion rules before comparing.

That is why `==` can feel surprising.

```javascript
"0" == 0        // true
0 == false      // true
"0" == false    // true
```

The values are not all directly equal. They become equal after coercion.

If you do not want coercion, use `===`.

If you do want coercion, be deliberate about it.

## The ToPrimitive path

Before many operations can work on a value, JavaScript may try to convert it to a primitive.

This is often summarized as ToPrimitive.

```javascript
const obj = {
  toString() {
    return "obj";
  }
};

console.log(obj + ""); // "obj"
```

In that case, JavaScript asks the object to become a primitive, and the object chooses a string representation.

Objects can control this with `toString` and `valueOf`.

```javascript
const obj = {
  valueOf() {
    return 42;
  }
};

console.log(obj + 1); // 43
```

If both are available, JavaScript prefers number-like behavior in numeric contexts and string-like behavior in string contexts.

This is one reason objects sometimes behave like numbers or strings in expressions.

```javascript
const obj = {
  toString() {
    return "hello";
  },
  valueOf() {
    return 99;
  }
};

console.log(obj + 1);        // 100
console.log(obj + "");       // "99"
```

The context matters.

## == and the common coercion cases

Loose equality is easiest to understand case by case.

### String and number

```javascript
"42" == 42   // true
```

The string is converted to a number before comparison.

### Boolean and non-boolean

```javascript
true == 1     // true
false == 0    // true
true == "1"   // true
false == ""   // true
```

Booleans become numbers first: `true` becomes 1, `false` becomes 0.

### null and undefined

```javascript
null == undefined    // true
null == null         // true
undefined == undefined // true
null == 0            // false
undefined == 0       // false
```

`null` and `undefined` are loosely equal to each other, but not to other values.

This is a deliberate special case in the language.

### Objects and primitives

```javascript
[42] == 42          // true
"" == 0             // true
" " == 0            // true
```

Arrays and objects are coerced to primitives before comparison when needed.

```javascript
[1, 2] == "1,2"     // true
```

That can be useful to know, but it is also a strong reason to prefer `===` unless the coercion is intentional and obvious.

### Never equal

These are always false, even with `==`:

```javascript
NaN == NaN          // false
NaN === NaN         // false
```

`NaN` is the only value in JavaScript that is not equal to itself.

## === is not "magic safety"

`===` removes a whole category of coercion surprises, but it does not make every comparison easy.

```javascript
NaN === NaN         // false
0 === -0            // true
```

`NaN` is still not equal to itself under strict equality.

And `0` and `-0` are strict-equal, even though they are technically distinct values.

```javascript
Object.is(0, -0)   // false
Object.is(NaN, NaN) // true
```

`Object.is` is a stricter comparison in a few edge cases. It is useful when you care about the difference between `0` and `-0`, or when you want `NaN` to equal `NaN`.

Most of the time, `===` is enough. `Object.is` is for the cases where the ordinary rules are not enough.

## Truthy and falsy

JavaScript does not only coerce in equality. It also coerces in boolean contexts.

```javascript
if (value) { /* ... */ }
value || fallback
!!value
```

In these places, values are treated as either truthy or falsy.

Falsy values are few and specific:

```text
false
0
-0
0n
""
null
undefined
NaN
```

Everything else is truthy.

That includes:

```text
"0"
"false"
[]
{}
function() {}
```

This is one of the most common sources of bugs.

```javascript
const name = "";

if (name) {
  // this does not run
}

const items = [];

if (items) {
  // this runs, because [] is truthy
}
```

An empty string is falsy. An empty array is truthy.

That is why checking for emptiness on collections usually requires explicit logic.

```javascript
if (items.length === 0) { /* empty */ }
if (name === "") { /* empty */ }
```

Do not rely on truthiness for everything. Use it when the boolean meaning is clear, and use explicit checks when the collection or string may be empty.

## null and undefined

`null` and `undefined` are related but not identical.

`undefined` usually means a value is missing because it was never set.

```javascript
let x;
console.log(x); // undefined

const obj = {};
console.log(obj.missing); // undefined

function fn(a) {
  console.log(a);
}
fn(); // undefined
```

`null` usually means a value is missing because it was intentionally set to nothing.

```javascript
const user = {
  name: "Nahid",
  bio: null
};
```

This difference is mostly semantic, but it matters in practice. Many APIs and patterns use `null` to mean "explicitly empty", and `undefined` to mean "not yet provided" or "does not exist".

Loosely, they are equal to each other.

```javascript
null == undefined   // true
```

Strictly, they are not.

```javascript
null === undefined  // false
```

In modern code, it is common to treat them as two separate signals rather than interchangeable "nothing" values.

### Common trouble spots

Missing function arguments:

```javascript
function greet(name) {
  console.log(name);
}

greet(); // undefined
```

Missing object properties:

```javascript
const obj = {};
console.log(obj.key); // undefined
```

Array holes:

```javascript
const arr = [ , , ];
console.log(arr[0]); // undefined
```

Destructuring defaults:

```javascript
const { name = "Guest" } = {};
console.log(name); // "Guest"
```

These are all places where `undefined` shows up naturally.

## NaN

`NaN` means "not a number", but that name is more confusing than helpful. It is really a placeholder for an invalid numeric result.

```javascript
console.log(0 / 0);        // NaN
console.log(Math.sqrt(-1)); // NaN
console.log(Number("abc")); // NaN
```

Important facts:

```javascript
NaN === NaN             // false
NaN == NaN              // false
Number.isNaN(NaN)       // true
isNaN("abc")            // true
isNaN(undefined)        // true
```

`Number.isNaN` is stricter than the global `isNaN`.

```javascript
isNaN("abc")           // true — because "abc" becomes NaN
Number.isNaN("abc")    // false — because "abc" is not NaN yet
```

The global `isNaN` coerces its argument to a number first. `Number.isNaN` does not.

The one equality fact worth memorizing is this:

> `NaN` is the only value not equal to itself.

That is why you usually check it with `Number.isNaN` instead of `==` or `===`.

## Coercion in practice, not theory

Coercion is not just a quiz topic. It shows up in real behavior.

### String concatenation

```javascript
"total: " + 42       // "total: 42"
1 + 2                 // 3
"1" + 2               // "12"
1 + "2"               // "12"
```

The `+` operator does string concatenation if either side is a string.

This is why these are different:

```javascript
1 + 2 + "3"   // "33"
"1" + 2 + 3   // "123"
```

JavaScript evaluates left to right, and the first `+` decides the path.

### Boolean operators

```javascript
value || fallback
value && other
```

`||` returns the first truthy value, or the last value if none are truthy.

```javascript
false || "default"   // "default"
"" || "default"      // "default"
"hello" || "default" // "hello"
```

`&&` returns the first falsy value, or the last value if all are truthy.

```javascript
true && "yes"    // "yes"
0 && "yes"       // 0
"hi" && "yes"    // "yes"
```

These are not just boolean operators. They are selection operators.

That is why this pattern is common:

```javascript
const name = inputName || "Guest";
```

But it is also why this pattern can be wrong if you care about empty strings:

```javascript
const name = "" || "Guest"; // "Guest"
```

The empty string is falsy, so the fallback wins. If an empty string is a valid value, do not use `||` for that.

## Strict mode is not the same as strict equality

People sometimes confuse "strict mode" with "strict equality".

They are different.

Strict mode changes more than comparison. It affects assignments to undeclared variables, `this` in plain function calls, duplicate parameter names, and a few other things.

Strict equality affects only comparison.

You can use `===` without `"use strict"`.

You can use `"use strict"` without `===`.

They solve different problems.

## A practical comparison rule

If you want a simple default, this works well:

```text
Use === unless you specifically want coercion.
Use Object.is when 0 and -0, or NaN, matter.
Use explicit checks for empty strings and empty collections.
Use Number.isNaN for NaN.
```

If you reach for `==`, do it on purpose, not by habit.

## Common mistakes

### Mistake 1: treating == as "almost the same" as ===

It is not. `==` can coerce strings to numbers, booleans to numbers, and objects to primitives.

```javascript
"0" == 0      // true
"0" === 0     // false
```

### Mistake 2: assuming truthiness means "non-empty"

```javascript
if (items) { ... }
```

This is true for `[]`. Empty arrays are truthy.

### Mistake 3: using isNaN when you mean Number.isNaN

```javascript
isNaN("abc")        // true
Number.isNaN("abc") // false
```

### Mistake 4: forgetting NaN !== NaN

No equality check will find two `NaN` values as equal. Use `Number.isNaN` instead.

### Mistake 5: using || for values that can be 0 or ""

```javascript
count || 0    // breaks if count is 0
name || "Guest" // breaks if name is ""
```

### Mistake 6: assuming null and undefined are interchangeable everywhere

They are loosely equal, but they often carry different meaning in code.

### Mistake 7: assuming objects compare by content

```javascript
{ a: 1 } === { a: 1 }  // false
[1, 2] === [1, 2]      // false
```

Objects are compared by reference, not by shape or content.

## Interview questions you should be able to answer

### 1. What is the difference between == and ===?

`==` coerces before comparing. `===` does not.

### 2. What values are falsy in JavaScript?

`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`.

### 3. Why is NaN not equal to itself?

Because the language defines `NaN` as not equal to any value, including itself.

### 4. When should you use Number.isNaN instead of isNaN?

When you want to check whether a value is already `NaN`, without first coercing it to a number.

### 5. Why does "1" + 2 + 3 give "123"?

Because `+` with a string coerces the other operand to a string and concatenates.

### 6. What is the difference between null and undefined?

`undefined` usually means a value was never assigned or does not exist. `null` usually means an empty or intentionally absent value.

### 7. When is Object.is preferable to ===?

When you care about the distinction between `0` and `-0`, or when you want `NaN` to compare equal to `NaN`.

## Final mental model

```text
=== compares without coercion.
== compares after coercion.
Objects can become primitives through toString and valueOf.
Booleans coerce to numbers in equality.
null and undefined are loosely equal to each other only.
NaN is the one value that never equals itself.
Falsy values are a short, fixed list.
Everything else is truthy, including "0", [], and {}.
```

Or in one sentence:

> **Coercion is not chaos; it is a small set of rules that shows up in equality, boolean contexts, arithmetic, and string building, and once you know the list, the surprises shrink dramatically.**

The next step is understanding how numbers, strings, and symbols fit into this value model, and why some values behave the way they do.
