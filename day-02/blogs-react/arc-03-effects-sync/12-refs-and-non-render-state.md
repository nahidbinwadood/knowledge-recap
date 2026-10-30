---
title: "Refs and Non-Render State in React"
excerpt: "Not every piece of state should trigger a re-render. Sometimes you need a value that changes without affecting the UI immediately. This post explains refs, what they are for, what they are not for, and how they fit alongside state and effects."
tags: ["react", "useRef", "refs", "state", "effects", "hooks"]
---

# Refs and Non-Render State in React

React has two broad kinds of "values that change over time":

1. State, which triggers a re-render when it changes
2. Refs, which can hold a changing value without triggering a re-render

A lot of confusion comes from not knowing which one to use.

The short answer is:

> Use state when the UI should reflect the change.
> Use a ref when you need to remember something without re-rendering.

## What a ref is

A ref is a stable container with a `.current` property.

```javascript
const ref = useRef(0);

ref.current = 5;
```

The value inside the ref can change, but changing it does not cause React to re-render the component.

The ref object itself is stable across renders. You get the same object every time.

That makes refs useful for:

- holding mutable values that do not need to drive the UI
- storing DOM nodes
- keeping previous values
- sharing data between effects and event handlers without triggering renders

## What a ref is not

A ref is not:

- a replacement for state
- a way to make the UI update automatically
- a source of truth for visible UI
- a cheat code for skipping the render model

If changing a value should change what the user sees, it should usually be state.

If changing a value should not affect the render directly, a ref may be appropriate.

## The clearest use: DOM access

This is the most common beginner use of refs.

```javascript
function InputFocus() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}
```

The ref gives you access to the underlying DOM node.

Changing the ref's `.current` does not re-render the component.

That is exactly what you want for DOM focus, measuring, or direct manipulation in rare cases.

## Another use: values that effects or handlers need but do not re-render for

Sometimes an effect or event handler needs the latest value, but you do not want to re-run the effect every time that value changes.

```javascript
function Timer() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <p>{count}</p>;
}
```

Here the ref is used to keep a current value available to an effect that should not re-run on every change.

This is a legitimate pattern, but it should be used deliberately.

A ref is not a way to pretend state does not matter. It is a way to hold a value outside the render-driven update model.

## A common pattern: previous values

Refs are often used to track the previous value of something.

```javascript
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

This is useful when you want to compare the current value with the previous one without storing the previous value as visible state.

## A common pattern: avoiding stale closures

Refs can help with stale closures in effects.

If an effect needs the latest value but does not need to re-run when that value changes, a ref can give you the latest value without causing extra effect runs.

```javascript
const latestRef = useRef(value);

useEffect(() => {
  latestRef.current = value;
}, [value]);

useEffect(() => {
  const id = setInterval(() => {
    doSomething(latestRef.current);
  }, 1000);

  return () => clearInterval(id);
}, []);
```

This is the same idea as the earlier effect example, but spelled out as a pattern.

The ref holds the current value. The effect reads from the ref.

## Refs and state are different tools

A useful comparison:

```text
state
  - triggers re-render
  - is part of the UI snapshot
  - should be used for visible or render-driving values

ref
  - does not trigger re-render
  - is a mutable container
  - should be used for values that do not need to drive rendering directly
```

If you use a ref where you need state, the UI will not update.

If you use state where a ref would be better, you may cause unnecessary renders or effect churn.

## A warning: refs can hide bugs

Because refs do not trigger re-renders, it is easy to mutate them and forget that the UI is not reflecting the change.

```javascript
const countRef = useRef(0);

function handleClick() {
  countRef.current += 1;
  // no re-render
}
```

This can silently break expectations.

If the user should see the count change, this should be state.

If the count is only used internally, a ref may be fine.

## Refs are not a free mutability escape

React's model is centered on render-driven updates.

Refs let you step outside that model for specific reasons, but they do not change the fact that React is rendering UI from state and props.

If you overuse refs, you can end up with values that are hard to trace.

A good rule:

> Use refs for values that are only needed by effects, handlers, or DOM code, not for values that should be visible in the UI on their own.

## Refs for imperative APIs

Sometimes you need to call imperative methods.

```javascript
const modalRef = useRef(null);

function openModal() {
  modalRef.current?.show();
}
```

This is a normal pattern when wrapping a non-React widget or when you need to call a method on a DOM element or child component 노출.

The ref is the bridge to the imperative API.

## Refs are not the same as "state that does not re-render"

That phrase can be misleading.

A ref is not a special React state object. It is a mutable container.

React does not track changes to `.current`.

So:

- updating a ref does not schedule a render
- reading a ref inside render gives you the current value at that moment
- a ref can become stale if you do not manage it carefully

If you need React to respond to a value change, state is usually the right tool.

## A practical way to choose

When deciding between state and ref, ask:

```text
Will this change affect what the user sees?
Will this change need to cause a re-render?
Is this value only needed by effects or handlers?
Do I need to keep a previous or current value without rendering?
```

If the answer is "yes" to the first two, use state.

If the answer is "no" and you just need a mutable container, a ref is often better.

## A common mistake: storing render-critical values in refs

If a value affects what the user sees, do not hide it in a ref.

```javascript
// wrong for visible state
const [visible, setVisible] = useState(true);

// mistaken replacement
const visibleRef = useRef(true);
```

If `visible` controls whether something renders, state is the right place.

Refs do not make the UI react to changes.

## A common mistake: using refs to avoid thinking about dependencies

Sometimes people use refs to avoid adding dependencies to an effect.

That can be legitimate, but it can also hide a design problem.

A better approach is usually to ask why the effect depends on the value in the first place and whether the effect can be split or simplified.

## A compact model

```text
state = render-driving value
ref = mutable container that does not trigger render
DOM refs = access to real nodes
previous refs = track prior values
latest-value refs = help effects read current values without re-running
rule = state for visible change, ref for non-render storage
```

## Interview questions you should be able to answer

### 1. What is a ref?

A stable mutable container, usually created with `useRef`, that persists across renders and does not trigger re-renders when its `.current` value changes.

### 2. When should you use a ref instead of state?

When you need to store a value that does not need to drive a re-render, such as a DOM node, previous value, or latest value for an effect.

### 3. Does changing a ref trigger a re-render?

No.

### 4. Why are refs useful for DOM access?

Because they give you a stable reference to the underlying DOM node without relying on state.

### 5. What is a common danger with refs?

Using them for values that should affect the UI, which can silently break rendering expectations.

## Final mental model

```text
state = visible, render-driving, snapshot per render
ref = non-render mutable storage, stable object, current value opt-in
DOM ref = access to host node
previous ref = diff current against prior value
effect ref = read latest without re-running effect
```

Or in one sentence:

> **Use state when a value should re-render the UI, and use refs when you need a mutable value that React should not react to directly.**

The next piece shifts focus to Hooks as a system, starting with why Hooks work at all and why the rules exist.
