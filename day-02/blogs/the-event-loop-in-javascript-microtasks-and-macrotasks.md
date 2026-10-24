---
title: "The Event Loop in JavaScript: How Microtasks and Macrotasks Decide What Runs Next"
excerpt: "setTimeout, promises, and async/await all finish later, but not in the order you might expect. This guide breaks down the call stack, task queue, microtask queue, rendering, and the exact rules that decide which callback runs next."
tags: ["javascript", "async", "event-loop", "promises"]
---

# The Event Loop in JavaScript

You have probably seen this question:

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");
```

The output is:

```
1
4
3
2
```

Not `1 2 3 4`.

Not `1 4 2 3`.

This is not a trick. It follows from a small set of rules about who is allowed to run, and when.

Those rules are the event loop.

## The pieces

Five pieces matter.

```
┌──────────────────────────────────────────────┐
│                JavaScript Engine             │
│                                              │
│  Call Stack          Heap                    │
│  ──────────          ────                    │
│  active function     objects                 │
│  calls               dynamically allocated   │
│                                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│              Host Environment                │
│                                              │
│  Web APIs / Node APIs                        │
│  ────────────────────                        │
│  timers, network, DOM events, file I/O       │
│                                              │
└──────────────────────────────────────────────┘

Queues
──────
Task queue       (sometimes called macrotask queue)
Microtask queue
```

### The call stack

The stack holds the functions currently executing. It runs one frame at a time.

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
second()
first()
Global
```

When `second()` finishes, it is popped. Then `first()` is popped.

### The heap

The heap holds dynamically allocated data such as objects and arrays.

```javascript
const user = { name: "Nahid" };
```

The variable refers to an object in the heap.

### Host APIs

Timers, network requests, DOM events, and file operations are not part of the JavaScript language. The host environment provides them.

When you call:

```javascript
setTimeout(callback, 1000);
```

JavaScript hands the callback and the duration to the host. The host tracks the timer. The stack is free immediately.

### The task queue

When an asynchronous operation completes, its callback is placed in the **task queue**.

Tasks include:

- timer callbacks from `setTimeout` and `setInterval`
- I/O callbacks
- user events such as clicks
- message events
- some rendering-related callbacks

A task is sometimes called a **macrotask**. That word is colloquial; the specification calls it a task. The distinction matters less than understanding that it is a separate queue from microtasks.

### The microtask queue

Microtasks are smaller, higher-priority continuations.

They include:

- promise reactions (`.then()`, `.catch()`, `.finally()`)
- `await` continuations
- `queueMicrotask()` callbacks
- `MutationObserver` callbacks

Microtasks run **after the current task finishes**, and **before the next task**.

## One turn of the loop

A simplified browser event loop iteration looks like this:

```
1. Pick one task from the task queue
2. Run it until the call stack is empty
3. Drain the entire microtask queue
4. Render if the browser decides it is time
5. Repeat
```

The important detail is step 3:

> **The microtask queue is drained completely, including microtasks added during the drain, before the browser moves on.**

That single rule explains most ordering puzzles.

## Example 1: sync, micro, macro

```javascript
console.log("start");

setTimeout(() => {
  console.log("timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("promise");
});

console.log("end");
```

Step by step:

```
1. console.log("start")        → start
2. setTimeout                  → callback queued as a task
3. Promise.resolve().then      → callback queued as a microtask
4. console.log("end")          → end

Stack is empty.

5. Drain microtasks            → promise
6. Next task                   → timeout
```

Output:

```
start
end
promise
timeout
```

The `0` in `setTimeout` does not mean "run now". It means "queue this task as soon as possible". The promise callback still goes first, because microtasks always run before the next task.

## Example 2: chained promises

```javascript
console.log("start");

setTimeout(() => {
  console.log("timeout");
}, 0);

Promise.resolve()
  .then(() => {
    console.log("promise 1");
  })
  .then(() => {
    console.log("promise 2");
  });

console.log("end");
```

Output:

```
start
end
promise 1
promise 2
timeout
```

The first `.then()` runs, returns `undefined`, and schedules the second `.then()` as a new microtask. The queue is still drained before the timer task runs.

```
Microtask queue

[ promise 1 ]
      │
      ▼
[ promise 2 ]
      │
      ▼
   empty
      │
      ▼
Task queue

[ timeout ]
```

This is why a long promise chain delays tasks but never interleaves with them.

## Example 3: a microtask inside a microtask

```javascript
Promise.resolve()
  .then(() => {
    console.log("A");
    Promise.resolve().then(() => console.log("B"));
  })
  .then(() => console.log("C"));

Promise.resolve().then(() => console.log("D"));
```

This is a good test of whether you understand the drain rule.

Initial microtask queue:

```
[ A handler, D handler ]
```

Run the `A` handler:

- print `A`
- queue `B`
- returning schedules `C`

Queue:

```
[ D, B, C ]
```

Run `D`:

- print `D`

Run `B`:

- print `B`

Run `C`:

- print `C`

Output:

```
A
D
B
C
```

The newly added microtasks do not wait for the next task. They join the current drain.

## Example 4: `await` is a microtask boundary

```javascript
async function main() {
  console.log("A");
  await Promise.resolve();
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

What happens:

```
1. console.log("C")                → C
2. main() starts                   → A
3. await Promise.resolve()         → suspend main, queue continuation
4. main() returns a pending promise
5. console.log("D")                → D
6. Stack empty, drain microtasks   → B
```

`await` does not block the program. It schedules the rest of the function as a microtask and returns control to the caller.

This is also why an `async` function can start executing immediately but finish later.

## Example 5: a microtask created inside a task

```javascript
console.log("start");

setTimeout(() => {
  console.log("timeout");
  Promise.resolve().then(() => console.log("microtask in timeout"));
}, 0);

Promise.resolve().then(() => console.log("microtask"));

console.log("end");
```

Output:

```
start
end
microtask
timeout
microtask in timeout
```

Trace:

```
Synchronous:
  start
  end

Microtask drain:
  microtask

Task:
  timeout
  queue "microtask in timeout"

Microtask drain after the task:
  microtask in timeout
```

Every task gets its own microtask drain afterward.

## Why promises run before timers

Promises and timers are not competing on the same queue.

```
Microtask queue
→ drained after the current task
→ before the next task

Task queue
→ one task per turn
```

So this is not a race between "promise speed" and "timer speed". A resolved promise is simply handled at a higher-priority checkpoint.

> **Promises do not run faster. They run at a different point in the loop.**

Even this runs `promise` before `timeout`:

```javascript
setTimeout(() => console.log("timeout"), 0);

Promise.resolve().then(() => console.log("promise"));
```

The timer was registered first. It still runs after the microtask.

## Microtask starvation

Because the microtask queue must be fully drained, a microtask that keeps adding more microtasks can prevent the browser from ever reaching the next task.

```javascript
function recurse() {
  Promise.resolve().then(recurse);
}

recurse();

setTimeout(() => {
  console.log("timeout");
}, 0);
```

The timer callback may never run. The page can freeze.

This is called **microtask starvation**.

```
Microtask queue never empties
        │
        ▼
Browser never renders
        │
        ▼
Timers and events never run
```

The same risk exists with a long synchronous loop, but the cause is different. A synchronous loop blocks inside one task. Starvation blocks by never leaving the microtask drain.

## Rendering

The browser does not render after every microtask. It renders when it decides enough time has passed or the page needs an update.

A simplified browser loop:

```
task
  ↓
microtasks
  ↓
maybe render
  ├── requestAnimationFrame callbacks
  ├── style and layout
  └── paint
  ↓
next task
```

This is why:

- Promise callbacks run before paint if scheduled during the current task.
- Heavy microtask work can delay paint.
- Heavy synchronous work can also delay paint.
- `requestAnimationFrame` is for visual updates, not general async work.

## Browser vs Node.js

The general idea is the same: a loop picks work and runs callbacks one at a time.

The details differ.

### Browser

The main queues are:

```
Task queue
Microtask queue
Rendering steps
```

### Node.js

Node has a more explicit phase-based loop:

```
timers
  ↓
pending callbacks
  ↓
idle, prepare
  ↓
poll
  ↓
check
  ↓
close callbacks
```

It also has:

- `process.nextTick()` queue
- promise microtask queue
- `setImmediate()` callbacks in the check phase

Two Node-specific details are worth remembering.

`process.nextTick()` runs before promise microtasks:

```javascript
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
```

Output:

```
nextTick
promise
```

And `setTimeout(fn, 0)` versus `setImmediate(fn)` is not always deterministic from the main module:

```javascript
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
```

The order can depend on how long the current operation takes and the environment. Inside an I/O callback, `setImmediate` is typically processed before timers.

This is why you should not treat browser and Node ordering rules as identical.

## Common misconceptions

### Misconception 1: `setTimeout(fn, 0)` means "run immediately"

It means "queue this task as soon as possible". It still waits for the current task and all microtasks.

```javascript
setTimeout(() => console.log("timeout"), 0);
console.log("sync");
```

Output:

```
sync
timeout
```

### Misconception 2: Promises are always faster

A promise callback is not faster than a timer. It just runs earlier in the loop.

### Misconception 3: `await` blocks everything

Only the current async function is suspended. Other code continues.

### Misconception 4: All queues are FIFO, so registration order decides everything

Each queue is FIFO, but the queues have priority relative to each other.

```
Microtasks
   before
Tasks
   before
Future tasks
```

### Misconception 5: The event loop only exists in the browser

Node.js has one too. Browsers and Node implement it differently, but both run JavaScript callbacks on a single main thread and coordinate them with host APIs.

### Misconception 6: Async code runs in parallel

The host may perform I/O in parallel. Your JavaScript callbacks still run one at a time.

## How to trace any ordering snippet

Use a repeatable method.

### Step 1: Mark the synchronous code

Anything not inside a callback, `.then()`, or after an `await` runs first, top to bottom.

### Step 2: List when each callback is scheduled

```
setTimeout                 → task
setInterval                → task
DOM event                  → task
Promise.then / catch       → microtask
await continuation         → microtask
queueMicrotask             → microtask
```

### Step 3: Drain microtasks fully

When the synchronous code ends, run every microtask in order. If a microtask adds another microtask, append it and keep draining.

### Step 4: Run one task

Take the next task. Run it. Then drain microtasks again.

### Step 5: Repeat

```
sync code
   ↓
all microtasks
   ↓
one task
   ↓
all microtasks
   ↓
one task
   ↓
...
```

Once you follow those steps, most puzzles become mechanical.

## Practice traces

### Trace A

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => console.log("3"));
}, 0);

Promise.resolve().then(() => {
  console.log("4");
  Promise.resolve().then(() => console.log("5"));
});

console.log("6");
```

Output:

```
1
6
4
5
2
3
```

Reason: `1 6` are sync. Microtasks `4` and its nested `5` drain. Then timer `2`, then its microtask `3`.

### Trace B

```javascript
async function one() {
  console.log("one");
  await two();
  console.log("one after await");
}

async function two() {
  console.log("two");
}

console.log("start");
one();
console.log("end");
```

Output:

```
start
one
two
end
one after await
```

`two()` runs synchronously until it returns. Its returned promise is already fulfilled, but resuming `one()` still goes through the microtask queue.

### Trace C

```javascript
queueMicrotask(() => console.log("microtask 1"));

Promise.resolve().then(() => console.log("microtask 2"));

setTimeout(() => console.log("timeout"), 0);

console.log("sync");
```

Output:

```
sync
microtask 1
microtask 2
timeout
```

Both microtasks run before the timer, in the order they were queued.

## Final mental model

```
        One turn of the event loop
        ─────────────────────────

  ┌─────────────────────────────────┐
  │ 1. Run one task                 │
  │    (until the stack is empty)   │
  └────────────────┬────────────────┘
                   │
                   ▼
  ┌─────────────────────────────────┐
  │ 2. Drain all microtasks         │
  │    (including new ones)         │
  └────────────────┬────────────────┘
                   │
                   ▼
  ┌─────────────────────────────────┐
  │ 3. Maybe render                 │
  └────────────────┬────────────────┘
                   │
                   ▼
              next task
```

Or in one sentence:

> **The event loop runs one task at a time, then empties the entire microtask queue, then maybe renders, and only then moves to the next task.**

Every ordering question about `setTimeout`, promises, and `await` is answered by that sentence.

Once you can see the queues, asynchronous JavaScript stops feeling random.
