---
title: "Callbacks in JavaScript: The Original Async Pattern"
excerpt: "Before promises and async/await, callbacks were how JavaScript handled work that finishes later. This guide explains sync vs async callbacks, error-first conventions, callback hell, and the inversion of control problem that promises were designed to solve."
tags: ["javascript", "async", "callbacks"]
---

# Callbacks in JavaScript

A **callback** is a function passed to another function, with the expectation that the receiving function will call it later.

```javascript
function greet(name, callback) {
  callback(`Hello, ${name}`);
}

greet("Nahid", (message) => {
  console.log(message);
});
```

Output:

```
Hello, Nahid
```

That is the whole idea.

A function is just a value. You can pass it around like a number or a string. When you pass it with the intention that someone else will invoke it, you have passed a callback.

The interesting part is not the syntax. It is **when** the callback runs, and **who** controls that timing.

## Two kinds of callbacks

Callbacks come in two very different flavors, and confusing them causes a lot of broken mental models.

### 1. Synchronous callbacks

A synchronous callback runs during the call to the function that receives it.

```javascript
const numbers = [1, 2, 3];

const doubled = numbers.map((number) => number * 2);

console.log(doubled); // [2, 4, 6]
```

The function passed to `map` is a callback. It runs immediately, once per item, before `map` returns.

```javascript
[1, 2, 3].forEach((number) => {
  console.log(number);
});

console.log("after forEach");
```

Output:

```
1
2
3
after forEach
```

No queue. No event loop. It is just an ordinary function call.

### 2. Asynchronous callbacks

An asynchronous callback runs later, after the current code finishes.

```javascript
console.log("start");

setTimeout(() => {
  console.log("callback");
}, 0);

console.log("end");
```

Output:

```
start
end
callback
```

The callback is registered now and executed later.

So a callback is not automatically asynchronous. The **function that accepts it** decides when to call it.

> **Callbacks are a mechanism for passing behavior. Asynchrony is a property of when that behavior is invoked.**

## Why callbacks exist

Callbacks let a function stay reusable while letting the caller supply the part that varies.

```javascript
function processNumbers(numbers, operation) {
  const result = [];

  for (const number of numbers) {
    result.push(operation(number));
  }

  return result;
}

const doubled = processNumbers([1, 2, 3], (n) => n * 2);
const squared = processNumbers([1, 2, 3], (n) => n * n);
```

The loop is written once. The behavior is supplied by the caller.

The same idea applies to asynchronous work:

```javascript
function loadUser(id, onSuccess, onError) {
  fakeRequest(id, (error, user) => {
    if (error) {
      onError(error);
      return;
    }

    onSuccess(user);
  });
}
```

You are not returning a value. You are providing functions that will receive the value later.

## A realistic asynchronous callback

```javascript
function delayedGreeting(name) {
  setTimeout(() => {
    console.log(`Hello, ${name}`);
  }, 2000);
}

delayedGreeting("Nahid");
console.log("Waiting...");
```

Output:

```
Waiting...
Hello, Nahid
```

The callback keeps access to `name` even though `delayedGreeting` has already returned. That is a closure doing its job.

This combination appears everywhere in older JavaScript:

```javascript
button.addEventListener("click", handleClick);

setInterval(updateClock, 1000);

fs.readFile("data.txt", "utf8", (error, contents) => {
  // ...
});
```

In each case, the environment calls your function when the event happens.

## The error-first convention

In Node.js, asynchronous callbacks traditionally follow a pattern:

> The first argument is an error. The second argument is the result.

```javascript
fs.readFile("notes.txt", "utf8", (error, contents) => {
  if (error) {
    console.error("Could not read the file:", error.message);
    return;
  }

  console.log(contents);
});
```

This convention works because of a simple rule:

```
if error exists  → stop and handle it
otherwise        → use the result
```

It is predictable, but it is easy to forget. And it does not scale well when callbacks are nested.

## Callback hell

Suppose every step depends on the previous one.

```
Log in
  → get the user's posts
    → get comments for the latest post
      → get replies for the first comment
        → render
```

With callbacks:

```javascript
loginUser(email, password, (error, user) => {
  if (error) {
    handleError(error);
    return;
  }

  getUserPosts(user.id, (error, posts) => {
    if (error) {
      handleError(error);
      return;
    }

    getComments(posts[0].id, (error, comments) => {
      if (error) {
        handleError(error);
        return;
      }

      getReplies(comments[0].id, (error, replies) => {
        if (error) {
          handleError(error);
          return;
        }

        render(replies);
      });
    });
  });
});
```

This is often called **callback hell**, or the **pyramid of doom**.

The problem is not the indentation by itself. The problem is what the indentation represents:

- Each step depends on the previous result.
- Error handling is repeated at every level.
- Control flow flows inward instead of downward.
- Reusing one step is difficult.
- Adding a step means editing the middle of the pyramid.

It is readable at first. It becomes painful at scale.

## Inversion of control

There is a deeper problem than nesting.

When you pass a callback to another function, you are trusting that function to:

- call your callback exactly once
- call it with the right arguments
- call it at the right time
- not swallow errors
- not call it synchronously sometimes and asynchronously other times

```javascript
thirdPartyLibrary.fetchData((data) => {
  // Will this run once?
  // Twice?
  // Never?
  // Before or after this function returns?
});
```

You handed over control of **when and how** your code runs to someone else. That is **inversion of control**.

Promises were designed partly to fix this. With a promise:

```javascript
thirdPartyLibrary.fetchData()
  .then((data) => {
    // ...
  });
```

You still trust the library to resolve correctly, but the promise has a defined state machine. It settles once, and `.then()` callbacks are always scheduled the same way.

Callbacks can also break the contract themselves:

```javascript
function getValue(callback) {
  if (cache) {
    callback(cache); // synchronous
    return;
  }

  setTimeout(() => {
    callback(value); // asynchronous
  }, 100);
}
```

The same function sometimes calls back immediately and sometimes later. This is sometimes called **releasing Zalgo**. The caller cannot safely assume ordering, so subtle bugs appear.

## Naming callbacks well

Callback-heavy code becomes much easier to read when callbacks are named.

```javascript
function onUserLoaded(user) {
  renderProfile(user);
}

function onUserError(error) {
  showNotification(error.message);
}

loadUser(1, onUserLoaded, onUserError);
```

Compare that to a deeply nested set of anonymous functions. Naming turns a wall of braces into a list of steps.

## Advantages of callbacks

Callbacks are not obsolete. They are still the correct tool in many places.

### 1. Event-driven APIs

```javascript
window.addEventListener("resize", handleResize);
```

The callback model fits events naturally. You cannot `await` a click. You register interest, and the runtime calls you when it happens.

### 2. Simple one-off operations

```javascript
setTimeout(() => {
  hideTooltip();
}, 300);
```

Wrapping this in a promise would add ceremony without adding value.

### 3. Synchronous iteration

```javascript
users.forEach(renderUser);
```

This is clear and direct.

### 4. Low-level runtime APIs

Many APIs are callback-based by design. Promises are often a wrapper around them.

## Trade-offs

### Strengths

- Simple to understand for a single operation
- Direct access to the environment's native APIs
- Good fit for repeated events
- No additional abstraction required

### Weaknesses

- Nested flows become hard to read
- Error handling is repetitive
- Sequencing is awkward
- Inversion of control
- Inconsistent sync/async behavior can create bugs
- Harder to compose and reuse

## Common misconceptions

### Misconception 1: Every callback is asynchronous

No.

```javascript
[1, 2, 3].map(renderNumber);
```

`renderNumber` is a callback, but it runs synchronously.

### Misconception 2: Callbacks are outdated

No.

Promises and `async/await` are built on top of the same underlying scheduling. Event listeners, timers, and many Node APIs still use callbacks directly.

### Misconception 3: Callback hell is only an indentation problem

No.

Deep indentation is a symptom. The real issues are dependency-driven control flow, repeated error handling, and the inability to compose small pieces.

### Misconception 4: Promises remove callbacks

No.

```javascript
promise.then(callback);
```

A callback is still being passed. The difference is that the promise controls **when** it runs and gives you a standard way to chain and handle errors.

## Interview questions you should be able to answer

### 1. What is a callback?

A function passed to another function so that the receiving function can invoke it, either immediately or later.

### 2. What is the difference between a synchronous and an asynchronous callback?

A synchronous callback runs before the receiving function returns. An asynchronous callback runs after the current execution completes, usually because the host environment scheduled it.

### 3. What is callback hell?

A style of code where asynchronous steps are nested inside each other, producing deep indentation, repeated error handling, and tightly coupled control flow.

### 4. What is inversion of control?

It is the transfer of responsibility for invoking your code to another function or library. You no longer control when, how often, or with what arguments your callback is called.

### 5. How do promises improve on callbacks?

Promises provide a standard state machine, chainable composition, centralized error handling with `.catch()`, and consistent asynchronous scheduling of handlers.

## Final mental model

```
A callback is a function value
            │
            ▼
passed to another function
            │
            ▼
that function decides when to call it
            │
     ┌──────┴──────┐
     ▼             ▼
synchronously   asynchronously
 (map, filter)  (timers, events, I/O)
```

Or in one sentence:

> **A callback is behavior you hand to another function, along with the trust that it will be invoked correctly.**

That trust is exactly what promises make explicit.
