# Day 2 — Scope, Closures, `this` and JavaScript Execution

Your goal today is to understand how JavaScript stores variables, how functions remember their birthplace, and how `this` behaves in different contexts.

## Start here

1. Make sure dependencies are installed: `pnpm install`
2. Open [practice.ts](./practice.ts).
3. Pick one `TODO`, write pseudocode as a comment, then implement it yourself.
4. Uncomment that function's `console.log` line and run `pnpm run day:02`.
5. When you are finished, write what happened in [notes.md](./notes.md).

## Topics

### Scope
- Global scope
- Function scope
- Block scope
- Lexical scope

### Hoisting
- `var` — function-scoped, hoisted and initialized as `undefined`
- `let` / `const` — block-scoped, hoisted but not initialized (Temporal Dead Zone)
- Function declarations — fully hoisted

### Closures
- A function that retains access to its lexical scope even after the outer function has returned
- Lexical environment
- Practical use cases: counters, private state, function factories

### `this`
- Method call — `this` is the object
- Regular function — `this` is `undefined` (strict mode) or `window`
- Arrow function — `this` is inherited from the enclosing scope
- `call`, `apply`, `bind` — explicit `this` binding

### References
- Primitive values (string, number, boolean) — copied by value
- Objects and arrays — copied by reference
- Shallow copy — spreads one level deep
- Deep copy — clones all nested levels

## Exercises

- [ ] `createCounter` — closure-based counter with `increment`, `decrement`, `getCount`
- [ ] `createBankAccount` — private balance, deposit, withdraw, getBalance
- [ ] `createMultiplier` — function factory that returns a multiplier function
- [ ] `personObject` — object methods using `this`, demonstrate arrow vs regular function
- [ ] `shallowCopyProblem` — show how mutating a shallow copy affects the original
- [ ] `deepCopySolution` — fix the shallow copy problem with deep cloning
- [ ] `lexicalScopeDemo` — nested functions accessing outer variables

## Rules for the session

- Spend the first 60–90 minutes solving and debugging without AI-generated code.
- Ask for a hint, a test case, or a review only after you have attempted it.
- Explain every solution in your own words in `notes.md`.

## Useful commands

```powershell
pnpm install
pnpm run day:02
pnpm run typecheck
```
