# Day 1: JavaScript Array Methods — Quick Reference

**Date:** 15/09/26

---

Arrays are the backbone of data manipulation in JavaScript. Here's every essential array method with real-world examples.

---

## Mutating vs Non-Mutating

- **Mutating** — modifies original array: `push()`, `pop()`, `splice()`, `sort()`
- **Non-mutating** — returns new array: `map()`, `filter()`, `slice()`, `concat()`

> Always favor non-mutating methods in React/Redux to avoid side effects.

---

## The Big Three

### `filter()` — Keep items that match a condition

```javascript
const users = [
  { name: "Alice", role: "editor", status: "active" },
  { name: "Bob", role: "admin", status: "inactive" },
  { name: "Charlie", role: "editor", status: "active" }
];

const activeEditors = users.filter(
  (user) => user.role === "editor" && user.status === "active"
);
// Returns: Alice, Charlie
```

**Returns:** New array. Original untouched.

---

### `map()` — Transform every element

```javascript
const products = [
  { name: "Keyboard", price: 120 },
  { name: "Mouse", price: 60 }
];

const discounted = products.map((item) => ({
  ...item,
  discountedPrice: item.price * 0.9
}));
// Adds discountedPrice to each item
```

**Returns:** New array of same length.

---

### `reduce()` — Condense into single value

```javascript
const cart = [
  { item: "Monitor", price: 250, qty: 2 },
  { item: "Cable", price: 15, qty: 3 }
];

const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
console.log(total); // 545
```

**Use for:** sum, group by, count, min/max, building objects.

---

## Finding & Searching

### `find()` — Get first match

```javascript
const users = [
  { id: 1, name: "Alex" },
  { id: 2, name: "Sam" }
];

const user = users.find((u) => u.id === 2);
// Returns: { id: 2, name: "Sam" }
```

**Returns:** One item or `undefined`. Use `filter()` for all matches.

---

### `findIndex()` — Get position of first match

```javascript
const idx = users.findIndex((u) => u.id === 2);
console.log(idx); // 1
// Returns -1 if not found
```

---

### `some()` / `every()` — Boolean checks

```javascript
const scores = [85, 92, 78];

scores.some((s) => s < 50);  // false (any failing?)
scores.every((s) => s >= 60); // true (all passed?)
```

**`some()`** = at least one matches. **`every()`** = all match.

---

### `includes()` — Quick primitive lookup

```javascript
const tags = ["js", "react", "ts"];
tags.includes("react"); // true
```

---

## Sorting (Mutates!)

```javascript
const nums = [5, 1, 4, 2, 8];

// Always spread to protect original
const sorted = [...nums].sort((a, b) => a - b);
// [1, 2, 4, 5, 8]

const desc = [...nums].sort((a, b) => b - a);
// [8, 5, 4, 2, 1]
```

**Modern alternative:** `arr.toSorted()` (ES2023) — returns sorted copy without mutating.

---

## Removing Duplicates

```javascript
// Method 1: Set
const unique = [...new Set(["a", "b", "a", "c"])]; // ["a", "b", "c"]

// Method 2: filter + indexOf
function removeDuplicates(arr) {
  return arr.filter((item, idx) => arr.indexOf(item) === idx);
}
```

---

## Cheat Sheet

| Method | Purpose | Returns | Mutates? |
| :--- | :--- | :--- | :--- |
| `.filter()` | Filter by condition | New array | No |
| `.map()` | Transform elements | New array | No |
| `.reduce()` | Aggregate value | Any value | No |
| `.find()` | First match | Item/undefined | No |
| `.findIndex()` | Index of match | Number | No |
| `.some()` | Any match? | Boolean | No |
| `.every()` | All match? | Boolean | No |
| `.sort()` | Sort order | Sorted array | **Yes** |
| `.toSorted()` | Sort order (safe) | New array | No |

---

## Mistakes I Made

1. **Logic inversion:** Wrote `email.includes(user.name)` instead of `user.email === email`. Test data made it work by coincidence.

2. **Constructing instead of extracting:** Built emails from `name + '@gmail.com'` instead of using `user.email`. Output looked correct because all test users had @gmail.com.

**Lesson:** Always verify logic against actual data with edge cases.

---

**Key takeaway:** Each method has one job — `filter` filters, `map` transforms, `reduce` condenses. Always favor non-mutating operations.
