---
title: "Effects Are for Synchronization in React"
excerpt: "useEffect is often taught as a lifecycle hook, but that mental model leads to the wrong use of effects. This post explains that effects are for syncing React with the outside world, not for mirroring mount/update/unmount, and why that shift matters for writing correct React code."
tags: ["react", "useEffect", "effects", "synchronization", "mental-model", "hooks"]
---

# Effects Are for Synchronization in React

`useEffect` is one of the most misunderstood hooks because it is often explained using old lifecycle language.

People hear:

- "runs on mount"
- "runs on update"
- "runs on unmount"

That language is not wrong in a narrow sense, but it can be misleading.

A better mental model is:

> Effects are for synchronizing React with something outside React.

That "something" can be:

- the DOM
- a network request
- a third-party widget
- a timer
- a browser API
- a subscription

The effect is the bridge between React's render model and the external system.

## Why the lifecycle model is misleading

In class components, you had methods like `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`.

People started thinking in terms of lifecycle phases.

That led to code organized around "when did this happen?" rather than "what am I syncing?"

```javascript
// old mindset
componentDidMount() {
  setupThing();
}

componentDidUpdate() {
  updateThing();
}

componentWillUnmount() {
  cleanupThing();
}
```

The problem is that this organizes code around the component's life, not around the synchronization goal.

Sometimes the same logic belongs together even though it touches mount, update, and cleanup.

## The synchronization mental model

A better way to think about effects is:

> I have some external system. I want React to keep it in sync with my current state and props.

For example:

- I want the document title to match the current page name.
- I want a tooltip to follow a DOM node.
- I want to start a timer when a condition is true.
- I want to subscribe to a socket when the component is active.

In each case, the effect is there to push React's current state into the outside world, or to bring outside changes back into React through events or callbacks.

```javascript
useEffect(() => {
  document.title = `Hello, ${name}`;
}, [name]);
```

This effect says:

> Whenever `name` changes, keep the document title in sync.

It is not "run on mount and on update because that's what effects do."

It is "sync the title with `name`."

## Not every effect is the same kind of sync

Some effects are one-way synchronization.

```javascript
useEffect(() => {
  const id = setInterval(() => {
    setIsOn(true);
  }, 1000);
  return () => clearInterval(id);
}, []);
```

This effect sets up a timer and cleans it up.

The "sync" here is that React should own the timer for as long as this component is relevant.

Other effects are more like event subscriptions.

```javascript
useEffect(() => {
  function handleResize() {
    setWidth(window.innerWidth);
  }

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

Here the sync is bidirectional in a sense:

- React sets up the listener
- The browser fires events
- The listener updates React state

The effect is the bridge.

## Effects are not for rendering logic

An effect should not be the primary way you compute what to render.

If a value can be derived during render, it should be.

```javascript
// wrong
useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);

// better
const fullName = `${first} ${last}`;
```

Effects are for things that cannot be expressed as a pure function of state during render.

A good test is:

> Could I compute this from props and state without side effects?

If yes, you probably do not need an effect.

## Effects are for side effects

Side effects are actions that reach outside the render result.

Examples:

- subscribing to an external store
- manually mutating the DOM
- starting a timer
- fetching data
- logging
- integrating with a non-React widget

Effects exist because React cannot express those things during render without breaking the render model.

Render should be more predictable than "fire a network request every time something renders."

So React gives you effects as a separate layer for synchronization.

## A common misuse: using effects like a lifecycle hook

A common mistake is to put logic in effects just because "it should run when the component loads."

```javascript
useEffect(() => {
  console.log("mounted");
}, []);
```

Sometimes that is fine. But if you start using effects only because you are thinking in mount/update/unmount terms, you can end up with fragmented logic.

A better question is:

> What external thing am I syncing, and when should that sync happen?

If the sync depends on a value, declare that dependency.

If the sync is only about setup and cleanup, the dependency array may be empty or close to empty.

## A common misuse: putting state derivation inside effects

Another common mistake is using effects to recreate state that should be derived.

```javascript
useEffect(() => {
  setFilteredItems(items.filter(isActive));
}, [items]);
```

Unless there is a real reason to store this separately, it is usually better to derive during render or cache with `useMemo`.

Effects should not be used as a default tool for transforming state into another value.

## A common misuse: one effect per checklist item

Some codebases end up with many effects that each do a tiny lifecycle-style task.

```javascript
useEffect(() => {
  doSetup();
}, []);

useEffect(() => {
  doUpdate();
}, [value]);

useEffect(() => {
  doCleanup();
}, []);
```

This can become tangled because the real synchronization concern is split across multiple effects.

Sometimes it is better to group the related setup, update, and cleanup into one effect if they belong to the same external system.

The goal is not "one effect per dependency." The goal is "one effect per synchronization concern."

## The dependency array is part of the model

The dependency array tells React when to re-run the effect.

```javascript
useEffect(() => {
  syncSomething(value);
}, [value]);
```

This says:

> Re-run the sync whenever `value` changes.

If the dependency array is wrong, the effect can:

- stale, because it missed a dependency
- too frequent, because it includes unnecessary dependencies
- buggy, because the sync no longer matches the state of the world

This is why the dependency array is not just a performance detail. It is a correctness detail.

## Cleanup is part of synchronization

Many effects need cleanup.

```javascript
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

Cleanup is not an afterthought. It is how React keeps the external system in sync when the component no longer needs the effect.

If you start a subscription, clean it up.

If you start a timer, stop it.

If you mutate the DOM, restore it if needed.

Without cleanup, effects leave behind state in the outside world, which is exactly the kind of drift React tries to avoid.

## The outside world does not know about React renders

This is the key reason effects exist.

React renders are pure descriptions of UI. They do not automatically:

- start timers
- subscribe to sockets
- talk to third-party widgets
- write to the document title
- manage external stores

Effects are where you leave the pure render world and do those things.

Because the outside world is not reactive in the same way React is, you have to explicitly sync it.

## A practical way to think about an effect

When you write an effect, ask:

```text
What external system am I syncing?
What should happen when this component mounts?
What should happen when the relevant values change?
What should happen when the component leaves the screen?
```

If you can answer those clearly, the effect is usually easier to write correctly.

## A simple example

```javascript
function WindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <p>Window width: {width}</p>;
}
```

This effect syncs the window resize event with React state.

It does not compute the width during render, because the width can change outside React's control.

That is a good use of an effect.

## A wrong example

```javascript
function BadExample({ user }) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(`Hello, ${user.name}`);
  }, [user]);

  return <p>{greeting}</p>;
}
```

If `greeting` is just derived from `user`, this effect is probably unnecessary.

A better version:

```javascript
function BetterExample({ user }) {
  const greeting = `Hello, ${user.name}`;
  return <p>{greeting}</p>;
}
```

Here the value is pure and can be computed during render.

## The rule of thumb

Use an effect when:

- you need to sync with an external system
- the value changes outside React
- you need cleanup for a subscription, timer, or DOM interaction

Do not use an effect when:

- you are just deriving a value
- you are trying to fake a lifecycle method
- you want to update state from state without a real external reason

## Interview questions you should be able to answer

### 1. What is an effect for?

Synchronizing React with an external system or side effect.

### 2. Why is the lifecycle mental model incomplete?

Because it focuses on when the component renders, not on what external thing the effect is syncing.

### 3. When should you not use an effect?

When the value can be derived during render or when the logic is purely about transforming state into another state value.

### 4. What is cleanup for?

It undoes the effect's external synchronization when the component no longer needs it.

### 5. What does the dependency array represent?

The values that should cause the effect to re-run to stay in sync.

## Final mental model

```text
effect = bridge between React and the outside world
purpose = synchronization
not for = rendering logic or state derivation
dependency array = what should trigger re-sync
cleanup = undo the sync when it is no longer needed
```

Or in one sentence:

> **Use effects to keep React in sync with external systems, not to mimic lifecycle methods or to derive state that could be computed during render.**

The next piece is one of the most common sources of effect bugs: dependency arrays and stale closures.
