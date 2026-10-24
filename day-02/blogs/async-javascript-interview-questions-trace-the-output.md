---
title: "Async JavaScript Interview Questions: Trace the Output"
excerpt: "Ordering questions with setTimeout, promises, and await are not memorization tests. They test whether you can see the queues. This post walks through ten snippets step by step and gives you a repeatable method for any trace question."
tags: ["javascript", "async", "interview", "event-loop"]
---

# Async JavaScript Interview Questions

Async ordering questions look like trivia.

They are not.

Every one of them can be solved with the same method:

```
1. Run the synchronous code first
2. Collect the microtasks
3. Drain all microtasks
4. Run the next task
5. Repeat
```

If you can apply those steps without guessing, you can trace almost any snippet an interviewer gives you.

This post uses ten examples to make that method automatic.

## The rules, in one place

```
Tasks (macrotasks)         Microtasks
─────────────────          ──────────
setTimeout                 Promise.then
setInterval                Promise.catch
DOM events                 Promise.finally
I/O callbacks              await continuations
message events             queueMicrotask
```

Remember:

- Microtasks run after the current task.
- All microtasks run before the next task.
- Microtasks added while draining still run in the same drain.
- `await` schedules the rest of the function as a microtask.
- `async` functions start synchronously until the first `await`.

## Puzzle 1: The basics

```javascript
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");
```

Output:

```
A
D
C
B
```

Trace:

```
Sync:       A, D
Microtask:  C
Task:       B
```

If this one is not immediate, revisit the event loop before continuing.

## Puzzle 2: Nested microtasks

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => console.log("3"));
}, 0);

Promise.resolve()
  .then(() => {
    console.log("4");
    Promise.resolve().then(() => console.log("5"));
  })
  .then(() => console.log("6"));

console.log("7");
```

Output:

```
1
7
4
5
6
2
3
```

Trace:

```
Sync:
  1
  7

Microtask drain:
  4
    → queues 5
    → returning schedules 6
  5
  6

Task:
  2
    → queues 3

Microtask drain:
  3
```

The counterintuitive part is `5` before `6`.

The nested promise is queued **before** the outer `.then()` returns and schedules the next chain link.

```
During "4":
  queue: [5]
  then return → queue: [5, 6]
```

## Puzzle 3: Multiple awaits

```javascript
async function main() {
  console.log("A");

  await Promise.resolve();
  console.log("B");

  await Promise.resolve();
  console.log("C");
}

console.log("D");
main();
console.log("E");
```

Output:

```
D
A
E
B
C
```

Trace:

```
Sync:
  D
  A          (main starts and runs until the first await)
  E

Microtasks:
  resume after first await  → B
  resume after second await → C
```

Each `await` is a new suspension point. The function does not resume all at once.

## Puzzle 4: Timers queued from different places

```javascript
setTimeout(() => console.log("timeout 1"), 0);

Promise.resolve().then(() => {
  console.log("promise 1");
  setTimeout(() => console.log("timeout 2"), 0);
});

setTimeout(() => console.log("timeout 3"), 0);

Promise.resolve().then(() => console.log("promise 2"));
```

Output:

```
promise 1
promise 2
timeout 1
timeout 3
timeout 2
```

Trace:

```
Sync: nothing

Microtasks:
  promise 1
    → queue timeout 2
  promise 2

Tasks (in registration order):
  timeout 1
  timeout 3
  timeout 2
```

The timer created inside the microtask joins the task queue after the timers that were already registered.

## Puzzle 5: What does an async function return?

```javascript
async function getValue() {
  console.log("A");
  return 42;
}

console.log("B");

const result = getValue();
console.log(result);

result.then((value) => console.log(value));

console.log("C");
```

Output (Node.js):

```
B
A
Promise { 42 }
C
42
```

Output (browser console) is similar, with the promise shown as fulfilled.

Trace:

```
Sync:
  B
  A                     (async function body runs immediately)
  log result            (Promise object)
  C

Microtask:
  42
```

The async function does not return `42`. It returns a promise fulfilled with `42`.

## Puzzle 6: `forEach` with async

```javascript
[1, 2, 3].forEach(async (number) => {
  console.log("start", number);
  await null;
  console.log("end", number);
});

console.log("done");
```

Output:

```
start 1
start 2
start 3
done
end 1
end 2
end 3
```

Trace:

```
Sync:
  start 1
  start 2
  start 3
  done

Microtasks:
  end 1
  end 2
  end 3
```

`forEach` calls each async callback and ignores the returned promise. Every callback runs synchronously until its first `await`, then resumes later.

This is not a bug in `forEach`. It simply was not designed to await anything.

## Puzzle 7: `Promise.all` preserves order

```javascript
const slow = new Promise((resolve) => {
  setTimeout(() => resolve("slow"), 100);
});

const fast = Promise.resolve("fast");

Promise.all([slow, fast]).then((values) => {
  console.log(values);
});

console.log("start");
```

Output:

```
start
["slow", "fast"]
```

The result order matches the input order, not the completion order.

```
Input:   [slow, fast]
Finish:  fast first, slow later
Result:  ["slow", "fast"]
```

If order does not matter, you still get a predictable array. If you need completion order, you have to track it yourself.

## Puzzle 8: `try`, `catch`, and `finally` with await

```javascript
async function run() {
  try {
    console.log("A");
    await Promise.reject(new Error("boom"));
    console.log("B");
  } catch (error) {
    console.log("C", error.message);
  } finally {
    console.log("D");
  }
}

run();
console.log("E");
```

Output:

```
A
E
C boom
D
```

Trace:

```
Sync:
  A                     (run starts, prints A, suspends at await)
  E

Microtask:
  rejection resumes run
  catch                 → C boom
  finally               → D

"B" never runs.
```

The async function starts synchronously. It prints `A`, hits the rejected promise, and suspends. Then the caller continues and prints `E`.

Only when the stack is clear does the rejection resume `run()`, enter `catch`, and finally run `finally`.

## Puzzle 9: Two async functions

```javascript
async function first() {
  console.log("first start");
  await null;
  console.log("first end");
}

async function second() {
  console.log("second start");
  await null;
  console.log("second end");
}

first();
second();
console.log("sync end");
```

Output:

```
first start
second start
sync end
first end
second end
```

Trace:

```
Sync:
  first start
  second start
  sync end

Microtasks (in suspension order):
  first end
  second end
```

Each function runs synchronously until its first `await`. Then their continuations queue in the order they suspended.

## Puzzle 10: The final boss

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => console.log("3"));
}, 0);

(async () => {
  console.log("4");
  await null;
  console.log("5");
  setTimeout(() => console.log("6"), 0);
})();

Promise.resolve()
  .then(() => console.log("7"))
  .then(() => console.log("8"));

console.log("9");
```

Output:

```
1
4
9
5
7
8
2
3
6
```

Trace:

```
Sync:
  1
  4                  (async IIFE runs until await)
  9

Microtask drain:
  5                  (resume IIFE)
    → queue timeout 6
  7
  8

Tasks:
  2
    → queue microtask 3
  3                  (drain after task)
  6
```

The key detail: `timeout 6` is scheduled during the microtask drain, so it is queued after `timeout 2`, which was scheduled during the synchronous phase.

## A reusable checklist

When you see a trace question, write this down:

```
SYNC:
  ...

MICRO:
  ...

TASK:
  ...
```

Then fill it in as you read the code.

Three questions to ask at every line:

1. Does this run now, or is it scheduled?
2. If scheduled, is it a microtask or a task?
3. If this is inside a callback, what gets queued before the callback returns?

That last question catches most nested ordering traps.

## Common mistakes

### Mistake 1: Treating `setTimeout(0)` as synchronous

It is always later than the current synchronous code and all microtasks.

### Mistake 2: Assuming `await` runs the rest immediately

Everything after `await` is a microtask continuation.

### Mistake 3: Forgetting that async functions start synchronously

```javascript
async function run() {
  console.log("inside");
}
```

`inside` prints as soon as `run()` is called, before any `await`.

### Mistake 4: Assuming promise chains interleave with timers

A chain runs entirely in microtask drains. Timers wait until the drain is complete.

### Mistake 5: Ignoring nested microtasks

A `.then()` inside a `.then()` is added to the same drain. It does not wait for the next task.

## Final mental model

```
Read the code
    │
    ▼
Run everything synchronous
    │
    ▼
Queue microtasks in the order they were created
    │
    ▼
Drain the queue, including new microtasks
    │
    ▼
Run one task
    │
    ▼
Drain again
```

Or in one sentence:

> **Trace the synchronous phase, then the microtask phase, then one task at a time, and never guess.**

Ordering questions are not about memorizing outputs. They are about reading the code with the event loop in mind.
