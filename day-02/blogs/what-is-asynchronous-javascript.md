---
title: "What Is Asynchronous JavaScript?"
excerpt: "JavaScript runs your code on a single thread, yet it can wait for timers, network requests, and user input without freezing the page. This post explains what asynchronous JavaScript actually means, who does the waiting, and why async is not the same as parallel."
tags: ["javascript", "async", "event-loop"]
---

# What Is Asynchronous JavaScript?

Most introductions say the same two things:

> JavaScript is single-threaded.

> JavaScript is asynchronous.

At first, those statements sound like a contradiction.

If JavaScript can only do one thing at a time, how can it wait for a network request without freezing the entire page?

The answer is that **JavaScript itself does not do the waiting**.

The runtime around it does.

## One thing at a time

JavaScript executes your code on a single main thread. At any moment, the engine is running one function, in one place, from the call stack.

```
Call Stack
──────────
main()
```

When a function calls another function, a new frame is added.

```javascript
function first() {
  second();
}

function second() {
  console.log("Hello");
}

first();
```

```
Call Stack
──────────
second()
first()
Global
```

When `second()` finishes, its frame is removed. Then `first()` finishes. Then the stack is empty.

This is **synchronous** execution:

```javascript
console.log("start");
console.log("middle");
console.log("end");
```

Output:

```
start
middle
end
```

Each line waits for the previous line to finish.

That is simple, predictable, and completely blocking.

## Synchronous code can freeze everything

Consider this:

```javascript
console.log("start");

function blockFor(milliseconds) {
  const end = Date.now() + milliseconds;

  while (Date.now() < end) {
    // busy waiting
  }
}

blockFor(3000);

console.log("end");
```

Output:

```
start
end
```

But for three seconds, the page cannot respond.

Clicks are ignored. Scrolling stutters. Rendering stops. No other JavaScript can run, because the single thread is stuck inside `blockFor()`.

Now imagine doing that for a network request that takes two seconds.

A synchronous request would mean:

```
Ask the server
     ↓
Wait 2000ms
     ↓
Nothing else can run
```

That is unacceptable for a user interface.

## Asynchronous code starts work and returns immediately

Now compare:

```javascript
console.log("start");

setTimeout(() => {
  console.log("timer");
}, 2000);

console.log("end");
```

Output:

```
start
end
timer
```

The `setTimeout` call does not wait two seconds.

It registers a timer and returns immediately. The line after it runs right away. The callback runs later, when the timer finishes.

That is the core idea:

> **Asynchronous code does not finish now. It schedules a continuation for later.**

The current code keeps running. The result is handled when it is ready.

## Who is actually doing the waiting?

This is the part that makes the mental model click.

`setTimeout` is not part of the JavaScript language. Neither is `fetch`, `addEventListener`, or the filesystem API in Node.js.

Those come from the **host environment**:

```
Browser              Node.js
───────              ───────
window               process
document             fs
fetch                http
setTimeout           setTimeout
localStorage         Buffer
```

When you call `setTimeout`, JavaScript hands the timer to the environment.

The environment tracks the time independently of the call stack.

When the time is up, the environment does not interrupt your code. It places the callback into a queue.

```
Call Stack            Host Environment          Queue
──────────            ────────────────          ─────
console.log("start")  timer: 2000ms
setTimeout(...)  ───► 
console.log("end")                    (2s later)
                                      callback ───► [ callback ]

Stack empty
     │
     └──── event loop moves callback ────► Call Stack
```

The **event loop** is the coordinator. It checks whether the call stack is empty. If it is, it takes the next queued callback and runs it.

So the full picture is:

```
Your JavaScript        Host APIs           Queues
      │                    │                  │
      │  start async work  │                  │
      ├───────────────────►│                  │
      │                    │                  │
      │  continue running  │  work completes  │
      │                    ├─────────────────►│
      │                    │                  │
      └──── event loop picks the callback when the stack is empty
```

The single JavaScript thread never left. It simply had nothing else to do when the callback arrived.

## A more realistic example

```javascript
console.log("1. Start");

fetch("https://api.example.com/users")
  .then((response) => response.json())
  .then((users) => {
    console.log("3. Users loaded:", users.length);
  });

console.log("2. End");
```

Possible output:

```
1. Start
2. End
3. Users loaded: 10
```

The request is in progress while `console.log("2. End")` runs.

When the response arrives, the `.then()` callback is queued, and the event loop runs it once the stack is clear.

This is why asynchronous code does not have to be slow. It overlaps waiting with other work.

## Async is not the same as parallel

These two words are often used interchangeably, but they describe different things.

```
Asynchronous
→ start something, do not wait for it, handle the result later

Parallel
→ two things are executing at the exact same moment
```

A single JavaScript thread can be asynchronous.

It cannot run two JavaScript functions at the same time.

Here is the nuance worth remembering:

- The **network request** may genuinely happen in parallel with your code, handled by the browser or operating system.
- The **JavaScript callbacks** still run one at a time on the main thread.
- **Web Workers** and Node.js worker threads can run JavaScript in parallel, but they use separate threads and separate memory.

So this statement is incomplete:

```
"JavaScript is asynchronous, therefore JavaScript is multithreaded."
```

A better version:

> **JavaScript schedules work on a single thread. The host environment performs the actual I/O and timers, then queues the callbacks for the single thread to execute.**

## Non-blocking does not mean fast

Asynchronous code is often called **non-blocking**, but that only describes the waiting.

Consider:

```javascript
setTimeout(() => {
  const end = Date.now() + 5000;

  while (Date.now() < end) {
    // five seconds of blocking work
  }

  console.log("done");
}, 0);
```

The timer is asynchronous.

But when the callback runs, it still blocks the thread for five seconds.

Async gives you a way to avoid waiting on I/O. It does not give you a way to avoid expensive computation.

## What asynchronous JavaScript is not

As you learn callbacks, promises, and `async/await`, keep these distinctions clear.

### It is not a separate thread

```javascript
async function loadData() {
  const response = await fetch("/api/users");
  return response.json();
}
```

`async` does not create a thread. The function suspends and resumes on the same main thread.

### It is not automatically concurrent

```javascript
await fetch("/api/a");
await fetch("/api/b");
```

These two requests run one after another, because the second starts only after the first finishes.

Concurrency requires explicitly starting both:

```javascript
const a = fetch("/api/a");
const b = fetch("/api/b");

const [responseA, responseB] = await Promise.all([a, b]);
```

### It does not make CPU work disappear

Heavy calculations still need to be optimized, split, moved to a worker, or avoided.

## Why JavaScript works this way

The single-threaded model avoids a huge class of problems:

- No two functions mutate the same object at the same instant.
- No locks around shared state.
- No race conditions inside ordinary JavaScript code.
- Predictable execution order within a synchronous block.

The price is that you must never block the thread for long.

The event loop model is the trade-off:

```
Simple execution model
        +
Non-blocking I/O through the host
        =
Responsive single-threaded programs
```

## Common misconceptions

### Misconception 1: `setTimeout(fn, 0)` runs immediately

No. It schedules `fn` as a task. It runs after the current synchronous code finishes, and after any pending microtasks.

```javascript
setTimeout(() => console.log("timer"), 0);
console.log("sync");
```

Output:

```
sync
timer
```

### Misconception 2: Promises run in parallel

A promise does not execute anything by itself. It represents the eventual result of work that has already been started.

```javascript
const promise = fetch("/api/users");
```

The request starts here. The `.then()` callback is scheduled later. It does not run alongside your code.

### Misconception 3: `await` blocks the whole program

`await` pauses the current `async` function. The rest of the program continues.

```javascript
async function load() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}

console.log("C");
load();
console.log("D");
```

Output:

```
C
A
D
B
```

### Misconception 4: Asynchronous means out of order

Async code still has a defined order. It is simply a different order from top-to-bottom source code. The event loop decides when queued callbacks run.

## Final mental model

```
JavaScript executes one function at a time
                │
                ▼
     Long operations are handed to the host
                │
                ▼
     The host signals completion by queuing
                a callback
                │
                ▼
     The event loop runs it when the stack
                is empty
                │
                ▼
     Your code continues without blocking
```

Or in one sentence:

> **Asynchronous JavaScript is a scheduling agreement: start work now, let the host do the waiting, and run the continuation later when the main thread is free.**

Once this model is clear, the next question is natural: how exactly do you provide that continuation?

The oldest answer is the callback.
