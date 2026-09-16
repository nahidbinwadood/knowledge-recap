# Day 1 — What I Remembered About JavaScript Arrays and Objects

**Date:** 15/09/26
**Time spent:** 2h

## What I learned

- Array methods have clear purposes: `filter` selects, `map` transforms, `reduce` accumulates, `find` returns first match, `some` checks existence.
- `reduce` is the most versatile — can replace `filter` + `map` combos, and can build objects/arrays from arrays.
- Spread operator (`[...arr]`) is essential for immutability when sorting. Mutating the original array is a common bug source.
- TypeScript generics let me write reusable functions like `removeDuplicates<T>` that work with any type.
- Nullish coalescing (`?? 0`) is cleaner than `|| 0` when handling `null`/`undefined` specifically.
- Intersection types (`Product & { quantity: number }`) let me extend existing types without duplication.

## What I implemented

**Basic array operations:**
- `getActiveUsers` — filter by status
- `getAverageAge` — reduce with edge case for empty arrays
- `getOldestUser` — reduce with comparison
- `getUserNames` — map to extract property
- `groupUsersByRole` — reduce into Record object
- `countUsersByStatus` — reduce with nullish coalescing
- `removeDuplicates` — filter with indexOf (generic)
- `sortProductsByPrice` — spread + sort
- `getCartTotal` — reduce with multiplication

**Production-relevant tasks:**
- `searchUsers` — case-insensitive partial match
- `sortUsersByAge` — conditional sort (asc/desc)
- `getInactiveUsers` — filter subset
- `findUserByEmail` — find with exact match
- `hasAdmin` — some for boolean check
- `getUserEmails` — map to extract emails
- `getUniqueRoles` — reduce with includes check
- `getYoungestUser` — reduce with min comparison
- `isUserActive` — find + optional chaining
- `countAdmins` — filter + length
- `getActiveEditors` — multi-condition filter
- `getUserById` — find by ID
- `getProductsInPriceRange` — filter with range
- `getTotalCartQuantity` — reduce to sum
- `getCartSummary` — map to transform objects

## How I approached the problems

1. I broke down each problem into small parts, then combined them for the simplest solution.
2. For reduce-based problems, I sketched the accumulator shape first (number, array, or object).
3. For sorting, I always spread first to avoid mutating the original array.

## What confused me

- Initially I mixed up when to use `find` vs `filter`. `find` returns one item, `filter` returns array.
- I misunderstood the `findUserByEmail` logic — I checked if the email includes the user's name, instead of comparing emails directly. It worked by coincidence with the test data.

## How I understand it now

- `filter` needs a predicate (returns boolean). If it returns true, item stays.
- `map` transforms each element. The return value becomes the new array element.
- `reduce` needs an accumulator and current value. Initial value determines the type (0 for numbers, [] for arrays, {} for objects).
- `sort` mutates in place. Always spread first: `[...arr].sort(...)`.
- `find` returns the first match or `undefined`. Use it when you need one item.
- `some` returns boolean. Use it for existence checks.

## Important examples

```ts
// Reduce to group by property
function groupByRole(users: User[]): Record<Role, User[]> {
  return users.reduce<Record<Role, User[]>>(
    (group, user) => {
      group[user.role].push(user);
      return group;
    },
    { admin: [], editor: [], viewer: [] }
  );
}

// Reduce to count with nullish coalescing
function countByStatus(users: User[]): Record<string, number> {
  return users.reduce<Record<string, number>>((acc, user) => {
    acc[user.status] = (acc[user.status] ?? 0) + 1;
    return acc;
  }, {});
}

// Spread to avoid mutation when sorting
function sortByPrice(products: Product[]): Product[] {
  return [...products].sort((a, b) => a.price - b.price);
}

// Generic dedup with filter + indexOf
function removeDuplicates<T>(values: T[]): T[] {
  return values.filter((item, idx) => values.indexOf(item) === idx);
}
```

## Mistakes I made

1. **`findUserByEmail` logic inversion:** I wrote `email.includes(user.name)` instead of comparing `user.email === email`. It coincidentally worked because `'rafi@example.com'.includes('rafi')` was true. Bug masked by test data.

2. **`getUserEmails` constructing instead of extracting:** I built emails from `name + '@gmail.com'` instead of returning the actual `user.email` property. The output looked correct because all test users had @gmail.com addresses.

## What I want to remember

> `filter` → keep items, `map` → transform items, `reduce` → build anything from items. Always spread before sort. Always validate logic against the actual data, not what you assume the data is.

## Questions for later

- What's the performance difference between `indexOf` and `includes` for dedup?
- When should I use `findIndex` instead of `find`?
- How does `Array.from()` compare to spread for copying arrays?
- Can `reduce` be optimized for large datasets, or should I use other methods?

## Summary

Today I recovered familiarity with JavaScript array methods and their practical use cases. I implemented 24 functions covering filtering, transforming, sorting, grouping, and accumulating data. The key lesson was not just syntax but understanding when each method is the right tool. I also learned that bugs can hide when test data coincidentally matches — always trace the logic, not just the output.
