---
title: "JavaScript Modules: ESM, Live Bindings, Default vs Named, and Circular Imports"
excerpt: "Modules are not just files. They are a language-level boundary with its own rules for imports, exports, live bindings, and evaluation order. This post explains ES modules, named and default exports, import() vs static import, circular imports, and what the module system actually does."
tags: ["javascript", "modules", "esm", "import", "export", "circular-imports"]
---

# JavaScript Modules

A module is not just a file.

A file is a location. A module is a boundary with rules.

In ES modules:

- each file is its own scope
- top-level variables are not global
- imports are bindings, not copies
- exports are connections, not snapshots
- the module system cares about evaluation order

That is why modules behave differently from scripts that happen to live in separate files.

```javascript
// math.js
export let counter = 0;

export function increment() {
  counter += 1;
  return counter;
}

// main.js
import { counter, increment } from "./math.js";

console.log(counter); // 0
increment();
console.log(counter); // 1
```

That works because `counter` is a live connection to the same binding in `math.js`, not a copy at import time.

This is one of the most important module concepts.

> **Imports are live bindings, not copied values.**

## ES modules versus scripts

A script runs in the global scope and shares bindings with other scripts loaded in the same environment.

A module runs in its own scope and explicitly shares what it wants to share.

```javascript
// script.js
var x = 1; // becomes global

// module.js
export const x = 1; // stays inside the module unless imported
```

Modules are also strict by default.

```javascript
// module.js
x = 10; // error if x was not declared
```

That is one reason modules tend to be safer and cleaner than old-style concatenated scripts.

Another difference is how they are loaded.

Modules are deferred by default in browsers, and they are evaluated once, with their exports shared across all importers.

## Named exports and named imports

Named exports are the most direct form.

```javascript
// utils.js
export function add(a, b) {
  return a + b;
}

export const PI = 3.14;
```

Import them by name:

```javascript
import { add, PI } from "./utils.js";

console.log(add(2, 3)); // 5
console.log(PI);        // 3.14
```

You do not have to import everything.

```javascript
import { add } from "./utils.js";
```

You can also rename on import.

```javascript
import { add as sum } from "./utils.js";
console.log(sum(2, 3)); // 5
```

Named exports are useful when a module exposes several related things and the caller picks what it needs.

## Default exports

A module can have one default export.

```javascript
// calculator.js
export default function add(a, b) {
  return a + b;
}
```

Import it with any name.

```javascript
import add from "./calculator.js";
import sum from "./calculator.js";
```

The name on the import side is not tied to the export name. That is the point of default exports: the module says "this is the main thing", and the importer chooses the local name.

Default exports are common for a single primary export, like a component, a function, or a class.

```javascript
export default class Person {
  constructor(name) {
    this.name = name;
  }
}
```

## Default versus named

Neither is strictly better. They communicate different things.

Named exports say:

> Here are several things. Import the ones you want.

Default exports say:

> Here is the main thing this module provides.

Named exports are explicit. Default exports are convenient for a single primary value.

A module can have both.

```javascript
// math.js
export const PI = 3.14;

export function circleArea(r) {
  return PI * r * r;
}

export default circleArea;
```

Some codebases prefer all named exports because they make re-exports and tooling behavior more uniform. Others prefer default exports for the main thing and named exports for helpers. The important part is to be deliberate.

## Re-exports

You can re-export from another module without importing into your own scope.

```javascript
// index.js
export { add, subtract } from "./arithmetic.js";
export { default as calculate } from "./calculator.js";
```

Or shorten:

```javascript
export * from "./arithmetic.js";
```

Re-exports are common in package entry points, where one file collects public API from internal files.

This is different from importing and then exporting again.

```javascript
// not a re-export
import { add } from "./arithmetic.js";
export { add };
```

A re-export preserves the original binding more directly.

## Import variants

There are a few ways to import.

Static import:

```javascript
import { add } from "./math.js";
```

Static imports are analyzed before the module runs. That is why they are static. The browser or runtime can see them early.

Dynamic import:

```javascript
const math = await import("./math.js");
console.log(math.add(2, 3));
```

Dynamic import returns a promise. It is useful when:

- the module is loaded conditionally
- the module is large and you want to delay loading
- you need to import at runtime based on data

```javascript
if (featureEnabled) {
  const { run } = await import("./feature.js");
  run();
}
```

Dynamic import is not just "async require". It is the module system's runtime loading path.

You can also import for side effects.

```javascript
import "./setup.js";
```

This runs the module but does not bind any exports. It is used when a module does setup work, registers something, or mutates shared state in a deliberate way.

## Live bindings in practice

Live bindings are the part of modules that surprises people most.

```javascript
// state.js
export let count = 0;

export function inc() {
  count += 1;
}

// a.js
import { count, inc } from "./state.js";
console.log(count); // 0
inc();
console.log(count); // 1

// b.js
import { count } from "./state.js";
console.log(count); // 1
```

`a.js` and `b.js` see the same `count`. Changes in one module are visible in the other.

This is not because the value was copied. It is because the import points at the same binding.

That matters when you compare modules to a naive copy model.

If imports were copies:

```javascript
// imagined wrong model
let count = state.count; // snapshot
```

Then later changes would not be visible. But with ES modules, they are visible.

This also means you should be careful with mutable exports.

```javascript
// shared.js
export const items = [];

// a.js
import { items } from "./shared.js";
items.push("a");

// b.js
import { items } from "./shared.js";
console.log(items); // ["a"]
```

Here the array is shared, and both modules see the mutation.

That can be intentional. It can also be a source of hidden coupling. The export model makes the sharing visible at the binding level, but it does not automatically tell you whether sharing is a good idea.

## Circular imports

Circular imports happen when two or more modules import each other.

```javascript
// a.js
import { bValue } from "./b.js";
export const aValue = "a";

// b.js
import { aValue } from "./a.js";
export const bValue = "b";
```

This can be valid, but it depends on evaluation order and what is used at import time.

The module system evaluates modules in a graph. If the shape creates a cycle, the system still needs to resolve bindings without getting stuck.

A common safe pattern is to keep imports and exports on separate lines from the code that uses them, so that the binding is established before use.

```javascript
// a.js
import { bValue } from "./b.js";
export const aValue = "a";

// b.js
import { aValue } from "./a.js";
export const bValue = "b";
```

If one module needs the other's value during its own top-level evaluation, circular dependencies can become fragile.

A more robust pattern is to avoid cycles where possible:

```text
a → b → c
not
a ↔ b
```

When cycles are unavoidable, keep the shared part in a third module that both depend on.

```javascript
// shared.js
export const shared = "shared";

// a.js
import { shared } from "./shared.js";

// b.js
import { shared } from "./shared.js";
```

This breaks the cycle and makes the dependency graph easier to reason about.

## What happens during module evaluation

A module is not just a bag of exports. It has an evaluation order.

Roughly:

```text
1. Parse the module graph.
2. Load the entry module.
3. Resolve imports.
4. Evaluate each module once, in dependency order.
5. Bind exports.
6. Make imports available to importers.
```

Because of this, top-level code in a module runs when the module is first evaluated.

```javascript
// db.js
console.log("db module loaded");
export const connection = "connected";
```

If `db.js` is imported, the log runs once, not every time something imports it.

```javascript
import { connection } from "./db.js";
```

The side effect happens once per module graph evaluation.

This is why modules are useful for initialization. You get one execution per module, with exports wired up after evaluation.

## Bindings are not values

This is the key mental model shift.

```javascript
export let count = 0;
```

This exports a binding called `count`, not a snapshot of `0`.

```javascript
import { count } from "./state.js";
```

This creates a reference to that binding.

If `state.js` later does:

```javascript
count = 5;
```

the imported `count` sees the new value.

That is why renaming can be helpful for clarity, but it does not detach you from the source.

```javascript
import { count as total } from "./state.js";
```

`total` still refers to the same live binding.

If you want a snapshot instead of a live connection, you must copy it explicitly.

```javascript
import { count } from "./state.js";
const snapshot = count;
```

Now `snapshot` is your own local value, unrelated to future changes in the exporting module.

## Common mistakes

### Mistake 1: assuming imports are copies

Imports are bindings. A mutable export can change under the importer.

### Mistake 2: using default exports everywhere by reflex

Default exports are good for a primary thing, but they can make large APIs harder to scan. Named exports make the surface more explicit.

### Mistake 3: mixing import styles without a plan

A codebase that sometimes uses default, sometimes named, sometimes re-exports, sometimes wrapped imports can be hard to follow. Pick a convention.

### Mistake 4: ignoring circular imports until they cause errors

Circular imports are not always fatal, but they make evaluation order matter more. When possible, flatten the graph.

### Mistake 5: assuming a module runs every time it is imported

It runs once per evaluation. Later imports reuse the same module instance.

### Mistake 6: using dynamic import for everything because it looks flexible

Dynamic import is for runtime, conditional, or lazy loading. Static import is for the stable public API of a module.

### Mistake 7: treating import side effects as invisible

If a module does important work at the top level, that work happens when the module is imported. This can be useful, but it can also make execution order surprising.

## A practical import checklist

```text
Do I need this now?
  yes → static import
  no  → dynamic import, if lazy loading helps

Is this a single primary thing?
  yes → default export may fit
  no  → named exports may fit

Do I want to expose many helpers?
  yes → named exports

Do I want to re-export a public API from another module?
  yes → export { ... } from "..." or export * from "..."

Am I importing two modules that depend on each other?
  maybe → restructure into a shared module if possible
```

## Interview questions you should be able to answer

### 1. What is the difference between a script and a module?

A module has its own scope, is strict by default, and uses `import` and `export` to share bindings instead of relying on the global scope.

### 2. What is the difference between a default export and a named export?

A default export is the main export of a module and can be imported with any name. Named exports are imported by their declared names and can be many per module.

### 3. What does "live binding" mean for imports?

It means an import refers to the same binding in the exporting module, so changes to that binding are visible to importers.

### 4. When would you use dynamic import?

When you want to load a module conditionally or lazily, because static import is analyzed before execution and always loads the module as part of the graph.

### 5. Why can circular imports be problematic?

Because they make evaluation order matter and can blur which bindings are ready when a module runs its top-level code.

### 6. What is a re-export?

It is a way to export something from another module without importing it into your own local scope.

### 7. Why does a module usually run only once?

Because the module system evaluates each module once and shares that instance across imports.

## Final mental model

```text
A module is a file with its own scope and its own export surface.

Named export   → several things, imported by name
Default export → one main thing, imported by chosen name
Re-export      → expose another module's export directly
Static import  → analyzed before execution
Dynamic import → loaded at runtime, returns a promise
Live binding   → import points at the same export binding
Circular import → possible, but often a sign to restructure
```

Or in one sentence:

> **ES modules are a language-level way to separate code into scopes, share bindings instead of copies, and control what is public, what is private, and when code runs.**

Once modules are clear, the rest of the language stack—objects, binding, types, initialization, and code structure—starts to fit together.
