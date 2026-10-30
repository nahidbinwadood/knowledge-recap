---
title: "Cleanup and Race Conditions in React Effects"
excerpt: "Effects often start async work, subscriptions, or timers. When that work finishes later, React may have already moved on. This post explains cleanup, why effects need to be resilient to out-of-order completion, and how race conditions show up in real React code."
tags: ["react", "useEffect", "cleanup", "race-conditions", "async", "hooks"]
---

# Cleanup and Race Conditions in React Effects

Effects are where React code meets the outside world.

That meeting is not always orderly.

A fetch can finish after a navigation.

A subscription can fire after the component is gone.

A timer can still be running when the next effect starts.

This post is about two related problems:

1. Cleanup
2. Race conditions

Both matter because effects do not live in a vacuum. They run in a UI that changes.

## The basic idea of cleanup

An effect can return a function.

```javascript
useEffect(() => {
  const id = setInterval(tick, 1000);

  return () => clearInterval(id);
}, []);
```

That returned function is cleanup.

Cleanup runs:

- before the effect runs again
- when the component unmounts

It is how you undo what the effect set up.

If you start a timer, stop it.

If you add an event listener, remove it.

If you open a subscription, close it.

Without cleanup, effects can leave behind running code that still references the old component state.

## Why cleanup matters

Cleanup is not just a nice-to-have. It is often what keeps an app from leaking behavior.

```javascript
useEffect(() => {
  window.addEventListener("resize", handleResize);
}, []);
```

If you never remove the listener, every remount adds another one.

That is a leak.

If the listener updates state, and the component is gone but the listener still runs, you can get unexpected state updates or errors.

Cleanup is what makes effects safe to install and remove repeatedly.

## The cleanup timing myth

A common misunderstanding is that cleanup runs only when the component is destroyed.

In reality, cleanup can also run before the effect runs again.

```javascript
useEffect(() => {
  setup(value);
  return cleanup;
}, [value]);
```

If `value` changes, React may clean up the previous effect before running the new one.

That means cleanup is part of the normal update cycle, not just a farewell at unmount.

This is important for subscriptions and timers because it means old effects can be torn down before new ones start, which helps prevent stale behavior.

## Async effects are tricky

Effects often do async work.

```javascript
useEffect(() => {
  fetch("/api/data")
    .then((res) => res.json())
    .then((data) => setData(data));
}, []);
```

The effect itself is synchronous. The async work happens later.

That mismatch is the source of many bugs.

React does not wait for the async work to finish.

It runs the effect, moves on, and may render again, mount a new effect, or unmount the component before the request completes.

So async effects need to be written defensively.

## The race condition problem

A race condition happens when later async work completes before earlier async work, and the later result overwrites the earlier one in a bad way.

A common example:

```javascript
function Search({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`/search?q=${query}`)
      .then((res) => res.json())
      .then((data) => setResults(data));
  }, [query]);

  return <ul>{results.map(renderResult)}</ul>;
}
```

Imagine:

- user types "a" → request for "a" starts
- user types "ab" → request for "ab" starts
- request for "ab" finishes first
- request for "a" finishes later

If the later request is the older one, it can overwrite the newer results.

That is a race condition.

## Why this happens

React does not automatically cancel previous async work when the effect re-runs.

Each effect execution can start its own async task.

If the task completes out of order, the UI can end up with stale data.

This is one reason effects that trigger async work need more care than effects that just sync a DOM property.

## A simple cleanup pattern for async work

One common fix is an ignore flag.

```javascript
useEffect(() => {
  let ignored = false;

  fetch(`/search?q=${query}`)
    .then((res) => res.json())
    .then((data) => {
      if (!ignored) {
        setResults(data);
      }
    });

  return () => {
    ignored = true;
  };
}, [query]);
```

When the effect re-runs or unmounts, the cleanup sets the flag.

If the old request finishes after the flag is set, its result is ignored.

This does not cancel the network request. It just prevents stale results from updating state.

## AbortController is another option for fetch

For fetch requests, you can also abort them.

```javascript
useEffect(() => {
  const controller = new AbortController();

  fetch(`/search?q=${query}`, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => setResults(data))
    .catch((err) => {
      if (err.name !== "AbortError") {
        handleError(err);
      }
    });

  return () => controller.abort();
}, [query]);
```

This is stronger than an ignore flag because the request is actually canceled.

It is especially useful when the network request is expensive or should stop early.

## Cleanup is also for subscriptions

Async fetch is one example, but subscriptions are another common source of cleanup bugs.

```javascript
useEffect(() => {
  const socket = new WebSocket(url);

  socket.addEventListener("message", (event) => {
    setData(JSON.parse(event.data));
  });

  return () => {
    socket.close();
  };
}, [url]);
```

If you do not close the socket, the connection can stay open and keep firing after the component is gone.

That is a leak and a correctness problem.

## Effects should be resilient to out-of-order completion

A good effect is not one that assumes everything finishes in the expected order.

A good effect is one that can tolerate:

- a newer effect starting before an older fetch finishes
- an unmount before a result arrives
- a dependency change that invalidates the previous work

That resilience is what makes effects safe in a reactive UI.

## The stale result bug

One common bug pattern is:

- effect starts work
- dependency changes
- new effect starts work
- old work finishes and overwrites new work

This is often visible in search interfaces, dashboards, and anything that fetches based on changing parameters.

The fix is usually one of:

- abort the old request
- ignore the old result
- ensure the effect only acts on the latest identity it cares about

## The stale subscription bug

Another pattern is:

- effect subscribes
- component unmounts
- subscription still fires
- subscription updates state on an unmounted component or stale closure

Cleanup prevents this by removing the subscription or by ignoring results after unmount.

## The timer cleanup bug

Timers are simpler, but still dangerous.

```javascript
useEffect(() => {
  const id = setInterval(() => {
    doSomething();
  }, 1000);

  // missing cleanup
}, []);
```

Without cleanup, the interval keeps running.

If `doSomething` updates state and the component unmounts, you can get warnings or errors.

Cleanup is:

```javascript
return () => clearInterval(id);
```

## Not every effect needs heavy cleanup logic

Some effects are simple and synchronous.

```javascript
useEffect(() => {
  document.title = title;
}, [title]);
```

This effect does not start a persistent outside process. It just sets a property.

In that case, cleanup may be unnecessary or trivial.

Cleanup is most important when the effect:

- starts a timer
- opens a connection
- subscribes to events
- triggers async work that can finish later
- mutates external state that needs restoration

## A good mental model

When you write an effect, ask:

```text
What does this effect start?
What should happen if the component unmounts?
What should happen if the dependency changes before the work finishes?
Can a later result overwrite an earlier one?
```

If you can answer those questions, you can usually design the cleanup and race handling correctly.

## A practical rule

If an effect starts something that continues after the effect returns, plan for cleanup from the beginning.

If an effect starts async work that can complete out of order, plan for race handling.

If an effect only mutates a property or sets a value once, cleanup may be minimal.

The goal is not to make every effect complex. The goal is to make every effect honest about what it starts.

## A compact model

```text
effect = setup + optional cleanup
cleanup = undo what setup did
async effect = effect starts work that finishes later
race condition = later completion can overwrite newer results
ignore flag = prevent stale updates after unmount or re-run
abort = cancel the async work itself
```

## Interview questions you should be able to answer

### 1. What is cleanup in an effect?

The function returned by an effect that undoes its setup before the next effect runs or when the component unmounts.

### 2. Why are async effects risky?

Because React does not wait for them, and they can finish after the component or effect has moved on.

### 3. What is a race condition in an effect?

When older async work finishes after newer async work and overwrites the result you wanted.

### 4. How can you avoid stale results from an effect?

By ignoring old results after unmount or dependency change, or by aborting the old work.

### 5. When is cleanup most important?

When the effect starts a timer, subscription, connection, or other work that continues after the effect returns.

## Final mental model

```text
effect = start external work
cleanup = stop or ignore it when it is no longer relevant
async effect = work finishes after the effect returns
race condition = older work can finish after newer work
resilience = effects should tolerate out-of-order completion
```

Or in one sentence:

> **Cleanup undoes the effect's external work, and async effects need race handling because the outside world can finish later than React expects.**

The next piece is refs, which are the other side of the state/sync model: mutable values that do not trigger re-renders.
