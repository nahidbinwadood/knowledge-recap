# Day 2 — Scope, Closures, `this` and JavaScript Execution

Your goal today is to understand how JavaScript stores variables, how functions remember their birthplace, and how `this` behaves in different contexts.

## Start here

1. Make sure dependencies are installed: `pnpm install`
2. Open [practice.ts](./practice.ts).
3. Work through the phases in order — each builds on the previous.
4. Pick one `TODO`, write pseudocode as a comment, then implement it yourself.
5. Uncomment that function's `console.log` line and run `pnpm run day:02`.
6. When you are finished, write what happened in [notes.md](./notes.md).

## Structure

This day is divided into **3 phases**. Complete each phase before moving to the next.

### Phase 1: Values & Memory (Foundation)
**Start here.** Understand how JavaScript stores and compares data.

- Primitive vs non-primitive values
- Value comparison (primitives compare by value)
- Reference comparison (objects compare by reference)
- Memory storage: Stack vs Heap
- Equality operators: `===` vs `==` vs `Object.is`

### Phase 2: Scope & Hoisting
Now that you understand values, learn how variables are accessed.

- Global scope
- Function scope
- Block scope
- Lexical scope
- Hoisting behavior (`var`, `let`, `const`, function declarations)
- Temporal Dead Zone

### Phase 3: Closures & `this`
Combine your knowledge of values, scope, and functions.

- Closures (counter, private state, function factories)
- `this` context (method calls, regular functions, arrow functions)
- `call`, `apply`, `bind`
- Shallow copy vs deep copy problems

## Exercises

### Phase 1: Values & Memory
- [ ] Identify primitive vs non-primitive values
- [ ] Compare primitive values using `===` and `==`
- [ ] Compare object references
- [ ] Understand memory storage (stack vs heap)
- [ ] Explore equality operators

### Phase 2: Scope & Hoisting
- [ ] Global scope access
- [ ] Function scope isolation
- [ ] Block scope with `const`/`let` vs `var`
- [ ] Lexical scope in nested functions
- [ ] Hoisting behavior examples

### Phase 3: Closures & `this`
- [ ] `createCounter` — closure-based counter
- [ ] `createBankAccount` — private balance with closure
- [ ] `createMultiplier` — function factory
- [ ] Person object methods using `this`
- [ ] `call`, `apply`, `bind` demonstrations
- [ ] Shallow copy problem
- [ ] Deep copy solution

## Rules for the session

- Spend the first 60–90 minutes solving and debugging without AI-generated code.
- Ask for a hint, a test case, or a review only after you have attempted it.
- Explain every solution in your own words in `notes.md`.
- Complete Phase 1 before moving to Phase 2, and Phase 2 before Phase 3.

## Useful commands

```powershell
pnpm install
pnpm run day:02
pnpm run typecheck
```

## Key Concepts to Remember

1. **Primitives** are compared by value; **objects** are compared by reference
2. **Scope** determines variable accessibility
3. **Closures** allow functions to remember their lexical environment
4. **`this`** depends on how a function is called, not where it's defined
5. **Shallow copy** only copies one level deep; **deep copy** clones everything