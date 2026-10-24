---
title: "Async/Await in JavaScript: Promises in Disguise"
excerpt: "async/await makes asynchronous code read like synchronous code, but it is still promises underneath. Learn what async returns, what await really pauses, how to run work in parallel, and why forEach with async is a trap."
tags: ["javascript", "async", "promises"]
---

# Async/Await in JavaScript

`async/await` is not a new kind of asynchronous programming.

It is a cleaner way to write the same promise chains you already know.

```javascript
// Promises
function loadUser() {
  return fetch("/api/user")
    .then((response) => response.json())
    .then((user) => user.name);
}

// async/await
async function loadUser() {
  const response = await fetch("/api/user");
  const user = await response.json();

  return user.name;
}
```

Both functions do the same thing.

The second one simply reads from top to bottom, using the same control flow you already use for synchronous code.

That is the entire promise of `async/await`.

It is also the source of most of its bugs, because the code **looks** synchronous while the rules are still asynchronous.

## `async` always returns a promise

This is the first rule.

```javascript
async function getValue() {
  return 42;
}
```

Calling it does not return `42`.

```javascript
console.log(getValue());
```

Output:

```
Promise { 42 }
```

The return value is wrapped in a fulfilled promise.

If the function throws, the returned promise is rejected.

```javascript
async function fail() {
  throw new Error("boom");
}

console.log(fail());
```

Output:

```
Promise { <rejected> Error: boom }
```

So these two functions are equivalent:

```javascript
function getValue() {
  return Promise.resolve(42);
}

async function getValue() {
  return 42;
}
```

And so are these:

```javascript
function fail() {
  return Promise.reject(new Error("boom"));
}

async function fail() {
  throw new Error("boom");
}
```

> **An `async` function is a function that always returns a promise.**

That means the caller can use `.then()`, `await`, or any promise combinator.

## `await` pauses the function, not the program

```javascript
async function main() {
  console.log("A");

  await null;

  console.log("B");
}

console.log("C");
main();
console.log("D");
```

Output:

```
C
A
D
B
```

Here is the order:

1. `C` runs.
2. `main()` starts and prints `A`.
3. `await null` suspends `main()`. The rest of the function is scheduled as a microtask.
4. `main()` returns a pending promise to the caller.
5. `D` runs.
6. The microtask resumes `main()` and prints `B`.

The important part:

> **`await` does not block the thread. It suspends the async function and returns control to its caller.**

Everything after `await` becomes a continuation that runs later.

Conceptually, this:

```javascript
async function run() {
  before();
  const value = await getValue();
  after(value);
}
```

behaves like this:

```javascript
function run() {
  before();

  return getValue().then((value) => {
    after(value);
  });
}
```

That is the mental model. `await` is `.then()` with better syntax.

## `await` on a non-promise

`await` accepts any value.

```javascript
const value = await 42;
```

If the value is not a promise, it is wrapped with `Promise.resolve()`.

```javascript
const value = await 42;
// equivalent to
const value = await Promise.resolve(42);
```

This still schedules a microtask. Even `await null` pauses until the current synchronous code finishes.

That is why this does not print in the order beginners expect:

```javascript
async function run() {
  console.log("inside");
  await null;
  console.log("after await");
}

run();
console.log("outside");
```

Output:

```
inside
outside
after await
```

## Error handling with `try/catch`

Because `await` turns a rejection into a thrown error, `try/catch` works:

```javascript
async function loadUser() {
  try {
    const response = await fetch("/api/user");

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Could not load user:", error.message);
    return null;
  }
}
```

This is a major readability improvement over:

```javascript
function loadUser() {
  return fetch("/api/user")
    .then((response) => response.json())
    .catch((error) => {
      console.error("Could not load user:", error.message);
      return null;
    });
}
```

A `try` block can contain multiple `await` calls. Any of them throwing sends control to the same `catch`.

```
try
  ├── await stepOne()
  ├── await stepTwo()
  └── await stepThree()
        │
        ▼
      catch
```

This gives you **error boundaries** around groups of asynchronous work.

## Sequential vs parallel

This is where most performance bugs live.

### Sequential

```javascript
async function loadDashboard() {
  const users = await fetchUsers();
  const posts = await fetchPosts();
  const comments = await fetchComments();

  return { users, posts, comments };
}
```

Each request starts only after the previous one finishes.

```
fetchUsers   ──────────►
fetchPosts              ──────────►
fetchComments                       ──────────►
```

If each request takes one second, this takes about three seconds.

Sometimes that is necessary. If the second request needs data from the first, it must wait:

```javascript
const user = await fetchUser(1);
const posts = await fetchPosts(user.id);
```

But often the requests are independent. Then sequential awaiting is wasted time.

### Parallel

```javascript
async function loadDashboard() {
  const usersPromise = fetchUsers();
  const postsPromise = fetchPosts();
  const commentsPromise = fetchComments();

  const [users, posts, comments] = await Promise.all([
    usersPromise,
    postsPromise,
    commentsPromise
  ]);

  return { users, posts, comments };
}
```

All three requests start before the first `await`.

```
fetchUsers    ──────────►
fetchPosts    ──────────►
fetchComments ──────────►
```

Total time is roughly the slowest request, not the sum of all requests.

### The subtle mistake

```javascript
const users = await fetchUsers();
const posts = await fetchPosts(); // starts after fetches complete
```

This is not wrong. It is simply sequential.

The parallel version must start the promises **before** awaiting:

```javascript
const usersPromise = fetchUsers();
const postsPromise = fetchPosts();

const users = await usersPromise;
const posts = await postsPromise;
```

Or with `Promise.all`, which is usually clearer.

## Loops and async

### `for...of` with `await` is sequential

```javascript
for (const id of ids) {
  await processItem(id);
}
```

Each iteration waits for the previous one. That is the correct choice when order matters or each step depends on the last.

### `forEach` with an async callback does not wait

```javascript
ids.forEach(async (id) => {
  await processItem(id);
});

console.log("done");
```

Output:

```
done
...processed items later
```

`forEach` was not designed to handle returned promises. It calls the callback, ignores the returned promise, and moves on.

This is one of the most common async bugs in JavaScript.

Use `for...of` if you want sequential behavior, or `Promise.all` with `map` if you want parallel behavior.

### `map` + `Promise.all` is parallel

```javascript
const results = await Promise.all(
  ids.map((id) => processItem(id))
);
```

`map` starts every promise immediately. `Promise.all` waits for all of them.

Order of results matches the order of `ids`, even if the work finishes in a different order.

### `map` + `forEach` is a trap

```javascript
const results = ids.map(async (id) => {
  await processItem(id);
});

console.log(results);
```

`results` is an array of promises, not an array of values. You still need to await them.

```javascript
const results = await Promise.all(
  ids.map(async (id) => {
    return processItem(id);
  })
);
```

## `return await`

In general, `return await promise` inside an `async` function is redundant.

```javascript
async function getData() {
  return await fetchData();
}
```

and

```javascript
async function getData() {
  return fetchData();
}
```

produce the same result for the caller, because the returned promise is flattened.

But there is one important exception: `try/catch`.

```javascript
async function getData() {
  try {
    return await fetchData();
  } catch (error) {
    return fallback;
  }
}
```

Without `await`:

```javascript
async function getData() {
  try {
    return fetchData();
  } catch (error) {
    return fallback;
  }
}
```

The `catch` does not handle the rejection, because the function returns the promise before it settles. The rejection happens outside the `try` block.

So:

> **Use `return await` when you need the surrounding `try/catch` to handle the rejection. Otherwise, it is usually unnecessary.**

## Top-level await

Inside an ECMAScript module, you can use `await` outside a function:

```javascript
const response = await fetch("/api/config");
const config = await response.json();

export default config;
```

This is called **top-level await**.

It is not available in classic scripts, and it changes how the module is evaluated. Modules that use it become asynchronous, and importers wait for them.

Use it for initialization that genuinely must finish before the module is usable. Avoid it for casual side effects.

## Common mistakes

### 1. Forgetting to await

```javascript
async function saveUser(user) {
  updateDatabase(user); // missing await
}
```

The function returns before the update finishes. Errors may become unhandled rejections.

### 2. Awaiting in a loop when parallel is safe

```javascript
for (const url of urls) {
  const response = await fetch(url);
  results.push(await response.json());
}
```

If the requests are independent, this is unnecessarily slow.

### 3. Using `async` inside `forEach`

Already covered. It silently does not wait.

### 4. Creating promises inside a loop and losing track of them

```javascript
const promises = [];

for (const id of ids) {
  promises.push(fetch(`/api/${id}`));
}

await Promise.all(promises);
```

This is correct. The mistake is starting promises and never awaiting or catching them.

### 5. Assuming `async` makes code concurrent

```javascript
async function run() {
  await taskOne();
  await taskTwo();
}
```

This is sequential. `async` enables `await`. It does not start anything in parallel.

### 6. Swallowing errors

```javascript
async function load() {
  try {
    await fetchData();
  } catch {
    // silently ignore
  }
}
```

If the failure affects the user, handle it. Do not hide it.

### 7. Using `await` for CPU-bound work

`await` does not make a heavy calculation faster. It only helps with operations that yield to the event loop. A long synchronous loop still blocks.

## When not to use `async/await`

`async/await` is not always the best tool.

### Short promise chains

```javascript
const user = await fetchUser();
```

is fine.

But this:

```javascript
const user = await fetchUser();
```

does not need to be wrapped in another `async` function if the caller already handles promises.

### Event listeners

```javascript
button.addEventListener("click", async () => {
  await save();
});
```

This works, but the event system ignores the returned promise. Any rejection becomes an unhandled rejection unless you catch it inside the listener.

### CPU-bound work

`async` does not help. Use optimization, chunking, workers, or a different algorithm.

## `async/await` in one comparison

```
Callbacks
  ↓
Nested control flow, manual error handling

Promises
  ↓
Flat chains, centralized errors, combinators

async/await
  ↓
Flat code that reads synchronously,
  still backed by promises
```

Each step is an improvement in readability, not a change in the underlying runtime model.

## Interview questions you should be able to answer

### 1. What does an `async` function return?

Always a promise. Returned values fulfill it. Thrown errors reject it.

### 2. Does `await` block the main thread?

No. It suspends the current async function and returns control to the caller. The rest of the program continues.

### 3. What is the difference between these two?

```javascript
await taskA();
await taskB();
```

```javascript
await Promise.all([taskA(), taskB()]);
```

The first is sequential. The second starts both immediately and waits for both.

### 4. Why does `forEach` with an async callback not work as expected?

`forEach` ignores the promise returned by the callback. It does not await it.

### 5. When is `return await` useful?

Inside `try/catch`, so the rejection is caught by the surrounding block.

### 6. Is `async/await` faster than promises?

No. It is the same mechanism with different syntax. Performance differences come from **how** you schedule work, not from the keyword.

## Final mental model

```
async function
      │
      ▼
always returns a promise
      │
      ▼
await suspends only this function
      │
      ▼
the rest of the program keeps running
      │
      ▼
when the awaited value settles,
the continuation is scheduled as a microtask
```

Or in one sentence:

> **`async/await` is promise syntax that lets you write asynchronous steps in a synchronous shape, without changing what the runtime actually does.**

Once the shape is familiar, the next question is the one that explains all ordering puzzles:

When exactly does each continuation run?

That is the event loop.
