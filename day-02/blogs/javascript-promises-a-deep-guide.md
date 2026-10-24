---
title: "JavaScript Promises: A Deep Guide to States, Chaining, and Combinators"
excerpt: "Promises replaced nested callbacks with a value you can chain, compose, and handle errors on. This guide covers the three states, the executor, then/catch/finally, flattening, static combinators, scheduling, and the mistakes that still trip up experienced developers."
tags: ["javascript", "async", "promises"]
---

# JavaScript Promises

A promise is a placeholder for a value that does not exist yet.

```javascript
const userPromise = fetch("/api/users/1");
```

At this moment, `userPromise` is not a user. It is an object that says:

> I will either give you a response later, or I will tell you why I could not.

That is all a promise is at its core.

The power is not in the placeholder. It is in the rules around it.

## The problem promises solve

With callbacks, sequencing depends on nesting:

```javascript
getUser(1, (error, user) => {
  if (error) {
    handleError(error);
    return;
  }

  getPosts(user.id, (error, posts) => {
    if (error) {
      handleError(error);
      return;
    }

    render(posts);
  });
});
```

Every step repeats the same error check. Every new step adds another level. The flow is controlled by the callee, not the caller.

Promises change the shape of the code:

```javascript
getUser(1)
  .then((user) => getPosts(user.id))
  .then((posts) => render(posts))
  .catch(handleError);
```

Now the flow reads top to bottom. One error handler covers the whole chain. Each step returns something the next step can use.

That is the real improvement:

> **Promises turn asynchronous composition into a value you can pass, return, chain, and combine.**

## The three states

A promise is always in exactly one of three states:

```
pending
   │
   ├──► fulfilled   (with a value)
   │
   └──► rejected    (with a reason)
```

- **Pending** — the operation has not finished.
- **Fulfilled** — it finished successfully.
- **Rejected** — it failed.

Fulfilled and rejected are both called **settled**.

Once a promise settles, it never changes state again.

```javascript
const promise = new Promise((resolve, reject) => {
  resolve("first");
  reject(new Error("second"));
});

promise.then((value) => console.log(value));
```

Output:

```
first
```

The `reject` call is ignored. The promise has already settled.

That guarantee is one of the reasons promises are easier to trust than raw callbacks. A promise cannot succeed and fail. It cannot settle twice.

## Creating a promise

The constructor takes an executor function:

```javascript
const promise = new Promise((resolve, reject) => {
  // start some work
});
```

The executor runs **synchronously**, immediately.

```javascript
console.log("A");

const promise = new Promise((resolve) => {
  console.log("B");
  resolve("done");
});

console.log("C");

promise.then((value) => console.log(value));
```

Output:

```
A
B
C
done
```

`A` and `B` run immediately. The `.then()` callback runs later, after the current synchronous code finishes.

This is a common source of confusion:

> **The promise executor is synchronous. Only the handlers registered with `.then()` are asynchronous.**

### When do you write the constructor?

Only when you need to wrap an API that still uses callbacks.

```javascript
function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

await delay(1000);
```

Or when wrapping an event:

```javascript
function waitForEvent(target, eventName) {
  return new Promise((resolve) => {
    target.addEventListener(eventName, resolve, { once: true });
  });
}
```

If an API already returns a promise, you usually do not need `new Promise`.

## `then` returns a new promise

This is the single most important fact about chaining.

```javascript
const first = Promise.resolve(1);

const second = first.then((value) => value + 1);

console.log(first === second); // false
```

`then` does not mutate the original promise. It returns a new one.

That new promise settles based on what the handler does:

```
handler returns a value
        │
        ▼
next promise fulfills with that value
```

```javascript
Promise.resolve(1)
  .then((value) => value + 1)
  .then((value) => console.log(value)); // 2
```

```
handler returns a promise
        │
        ▼
next promise adopts that promise's outcome
```

```javascript
Promise.resolve(1)
  .then((value) => Promise.resolve(value + 1))
  .then((value) => console.log(value)); // 2
```

```
handler throws
        │
        ▼
next promise rejects with that error
```

```javascript
Promise.resolve(1)
  .then(() => {
    throw new Error("boom");
  })
  .then(() => console.log("never"))
  .catch((error) => console.log(error.message)); // boom
```

This is called **flattening**. If a handler returns a promise, you do not get a promise inside a promise. The chain waits for it and continues with its value.

## Chaining in practice

```javascript
fetch("/api/user")
  .then((response) => response.json())
  .then((user) => fetch(`/api/posts/${user.id}`))
  .then((response) => response.json())
  .then((posts) => console.log(posts))
  .catch((error) => console.error("Request failed:", error.message));
```

Each `.then()` returns a new promise. The next `.then()` waits for the previous one.

If any step throws or returns a rejected promise, the remaining success handlers are skipped and the nearest `.catch()` runs.

```
fulfilled → handler → fulfilled → handler → rejected
                                                │
                                                ▼
                                              catch
```

That is why one `.catch()` at the end can handle errors from every step.

## Error propagation

A rejection travels down the chain until something handles it.

```javascript
Promise.reject(new Error("boom"))
  .then(() => console.log("step 1"))
  .then(() => console.log("step 2"))
  .catch((error) => console.log("caught:", error.message));
```

Output:

```
caught: boom
```

The two success handlers are skipped because the promise entering them is rejected.

A `.catch()` can also recover the chain:

```javascript
Promise.reject(new Error("boom"))
  .catch((error) => "fallback value")
  .then((value) => console.log(value)); // fallback value
```

Because `catch` returns a normal value, the next promise is fulfilled.

### `finally`

`finally` runs regardless of the outcome:

```javascript
startSpinner();

fetch("/api/users")
  .then((response) => response.json())
  .then(renderUsers)
  .catch(showError)
  .finally(() => stopSpinner());
```

It does not change the value or the rejection, unless it throws or returns a rejected promise itself.

```javascript
Promise.resolve("value")
  .finally(() => console.log("cleanup"))
  .then((value) => console.log(value));
```

Output:

```
cleanup
value
```

### `then(onFulfilled, onRejected)` vs `catch`

You can pass a second argument to `then`:

```javascript
promise.then(onSuccess, onError);
```

But it does **not** catch errors thrown inside `onSuccess`.

```javascript
Promise.resolve()
  .then(
    () => {
      throw new Error("from success handler");
    },
    (error) => console.log("not called")
  )
  .catch((error) => console.log("caught:", error.message));
```

Output:

```
caught: from success handler
```

The rejection handler in `then` only handles the incoming rejection, not errors created by its sibling handler.

Prefer `.catch()` at the end of the chain for clarity.

## Static combinators

Promises become much more useful when you combine them.

### `Promise.all`

Waits for all promises. Rejects as soon as one rejects.

```javascript
const [users, posts, comments] = await Promise.all([
  fetch("/api/users").then((r) => r.json()),
  fetch("/api/posts").then((r) => r.json()),
  fetch("/api/comments").then((r) => r.json())
]);
```

Results are in the same order as the input, regardless of which request finishes first.

Use it when **all results are required**.

### `Promise.allSettled`

Waits for all promises, including rejected ones.

```javascript
const results = await Promise.allSettled([
  fetch("/api/a"),
  fetch("/api/b"),
  fetch("/api/c")
]);

for (const result of results) {
  if (result.status === "fulfilled") {
    console.log("ok:", result.value);
  } else {
    console.log("failed:", result.reason);
  }
}
```

Use it when **partial success is acceptable**.

### `Promise.race`

Settles with the first promise to settle, whether fulfilled or rejected.

```javascript
const result = await Promise.race([
  fetch("/api/slow"),
  timeout(3000)
]);
```

Use it for timeouts and "first available" cases.

### `Promise.any`

Fulfills with the first promise to fulfill. Rejects only if every promise rejects.

```javascript
const fastest = await Promise.any([
  fetch("https://primary.example.com/data"),
  fetch("https://backup.example.com/data")
]);
```

If all reject, it throws an `AggregateError` containing every rejection reason.

Use it when you need **any one success**.

```
Promise.all        → all must succeed
Promise.allSettled → wait for all, collect outcomes
Promise.race       → first to settle
Promise.any        → first to succeed
```

### `Promise.resolve` and `Promise.reject`

These create settled promises.

```javascript
Promise.resolve(42);
Promise.reject(new Error("boom"));
```

They are useful for normalizing values and building APIs that always return a promise.

## Promise scheduling

Promise handlers are not executed immediately.

```javascript
console.log("1");

Promise.resolve().then(() => {
  console.log("2");
});

console.log("3");
```

Output:

```
1
3
2
```

The `.then()` callback is placed in the **microtask queue**. It runs after the current synchronous code, but before timers and other tasks.

That ordering matters:

```javascript
setTimeout(() => console.log("timeout"), 0);

Promise.resolve().then(() => console.log("promise"));

console.log("sync");
```

Output:

```
sync
promise
timeout
```

Microtasks run before the next macrotask.

This is covered in detail in the event loop guide. For now, remember:

> **Promise handlers always run asynchronously, even when the promise is already settled.**

## Common mistakes

### 1. Forgetting to return

```javascript
fetch("/api/user")
  .then((response) => {
    response.json(); // missing return
  })
  .then((user) => {
    console.log(user); // undefined
  });
```

The first handler returns `undefined`, so the next handler receives `undefined`.

Fix:

```javascript
fetch("/api/user")
  .then((response) => response.json())
  .then((user) => console.log(user));
```

### 2. Nesting promises

```javascript
fetch("/api/user").then((response) => {
  response.json().then((user) => {
    fetch(`/api/posts/${user.id}`).then((response) => {
      response.json().then((posts) => {
        render(posts);
      });
    });
  });
});
```

This is promise hell. It has the same shape as callback hell and loses the benefit of chaining.

Fix:

```javascript
fetch("/api/user")
  .then((response) => response.json())
  .then((user) => fetch(`/api/posts/${user.id}`))
  .then((response) => response.json())
  .then(render);
```

### 3. Wrapping a promise in `new Promise`

```javascript
function getUser(id) {
  return new Promise((resolve, reject) => {
    fetch(`/api/users/${id}`)
      .then((response) => response.json())
      .then(resolve)
      .catch(reject);
  });
}
```

This adds no value and can swallow errors in subtle ways.

Fix:

```javascript
function getUser(id) {
  return fetch(`/api/users/${id}`).then((response) => response.json());
}
```

### 4. Expecting `forEach` to wait

```javascript
[1, 2, 3].forEach(async (id) => {
  await doSomething(id);
});

console.log("done");
```

`forEach` ignores the returned promises. `done` is printed before the work finishes.

Use `for...of` with `await`, or `Promise.all` with `map`.

### 5. Ignoring unhandled rejections

```javascript
Promise.reject(new Error("boom"));
```

Nothing handles this rejection. Browsers and Node.js report it as an unhandled rejection. In Node.js, it can terminate the process depending on configuration.

Always attach a handler, or let the rejection propagate to a caller that does.

### 6. Creating a new promise inside a loop

```javascript
const results = [];

for (const id of ids) {
  results.push(fetch(`/api/${id}`)); // started, but errors are unhandled
}
```

If one request fails, the rejection may go unhandled. Use `Promise.all` or `Promise.allSettled` to manage the group.

## Promise vs callback

```
Callbacks                          Promises
─────────                          ────────
You pass behavior                  You receive a value
Nesting controls flow              Chaining controls flow
Error per step                     One catch for the chain
Callee decides timing              Promise defines settlement
Hard to compose                    Combinators built in
```

Promises do not remove asynchrony. They make it structured.

## Interview questions you should be able to answer

### 1. What are the three promise states?

Pending, fulfilled, and rejected. Fulfilled and rejected are settled and cannot change.

### 2. Does the promise executor run synchronously or asynchronously?

Synchronously. The handlers attached with `.then()` run asynchronously.

### 3. What does `.then()` return?

A new promise. Its outcome depends on what the handler returns or throws.

### 4. What happens if a `.then()` handler returns a promise?

The outer promise adopts the inner promise's state. This is flattening.

### 5. What is the difference between `Promise.all` and `Promise.allSettled`?

`Promise.all` rejects immediately when any input rejects. `Promise.allSettled` waits for every input and returns a status for each.

### 6. What is the difference between `Promise.race` and `Promise.any`?

`Promise.race` settles with the first settled promise, even if it rejects. `Promise.any` fulfills with the first fulfilled promise and rejects only if all reject.

### 7. Why is this code wrong?

```javascript
promise.then((value) => {
  doSomething(value);
});
return promise;
```

Because it returns the original promise, not the promise representing `doSomething`. Errors thrown in the handler are not part of the returned chain.

## Final mental model

```
A promise is a state machine
            │
     ┌──────┴──────┐
     ▼             ▼
  pending ──────► settled
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
      fulfilled            rejected
          │                   │
          └──── then/catch ───┘
                    │
                    ▼
             returns a new promise
```

Or in one sentence:

> **A promise is a one-time state machine that lets you compose asynchronous values and errors instead of nesting control flow.**

Once you can read a chain as a sequence of transformations and error boundaries, promises stop being syntax and become a composition tool.

The next step is making that composition look synchronous.

That is `async/await`.
