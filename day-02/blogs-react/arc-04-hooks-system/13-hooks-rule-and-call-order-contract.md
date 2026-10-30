---
title: "The Hooks Rule and the Call-Order Contract in React"
excerpt: "React Hooks work because React can predict how they are called. This post explains the rules of Hooks, why call order matters, what React stores between renders, and why conditional Hook calls break the contract."
tags: ["react", "hooks", "rules-of-hooks", "call-order", "useState", "useEffect", "mental-model"]
---

# The Hooks Rule and the Call-Order Contract in React

React Hooks are not magic. They work because of a very specific agreement between your code and React.

The agreement is this:

> Hooks must be called in the same order every time a component renders.

That is the reason for the rules of Hooks.

It is also the reason conditionals, early returns, and loops can break them.

This post explains why that rule exists and what it implies.

## Hooks are not normal function calls

A normal function call is local.

```javascript
const value = computeSomething();
```

You can call it conditionally. You can call it in a loop. You can call it in different orders.

Hooks are different.

When you call `useState`, `useEffect`, or another Hook, you are not just calling a function.

You are asking React to associate some internal state with the current component render.

React keeps track of that state by remembering the order in which Hooks are called.

## The order matters because React does not name state by variable name

React does not store state by the name you give it in your code.

It stores it by position in the Hooks list for that component.

For example:

```javascript
function Example() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  return <div>{a} {b}</div>;
}
```

React sees:

- first Hook call: state for `a`
- second Hook call: state for `b`

If this order stayed the same every render, React could reliably match each Hook call to the right state.

That is the contract.

## Why conditionals break the contract

Now imagine:

```javascript
function Broken() {
  const [a, setA] = useState(0);

  if (someCondition) {
    const [b, setB] = useState(0);
  }

  return <div>{a}</div>;
}
```

If `someCondition` is true on one render and false on the next, the number of Hook calls changes.

React's internal list no longer matches the previous list.

That means React may associate the wrong state with the wrong Hook call.

This is why conditional Hook calls are not allowed.

The problem is not that Hooks are "special." The problem is that React relies on a stable call order to match state to calls.

## Why early returns can break the contract

An early return can also change the number of Hook calls.

```javascript
function Broken() {
  const [a, setA] = useState(0);

  if (!someCondition) {
    return null;
  }

  const [b, setB] = useState(0);

  return <div>{a} {b}</div>;
}
```

If the return happens before `useState(0)` for `b`, the Hook list is different from a render where the return does not happen.

Again, the order and count must be stable.

## The two main rules

There are two rules you will often hear:

1. Only call Hooks at the top level.
2. Only call Hooks from React function components or custom Hooks.

The first rule is about call order stability.

The second rule is about where Hooks are allowed to attach to React's internal component system.

You should not call Hooks in:

- regular functions
- event handlers
- conditions
- loops
- class components

You can call them in:

- function components
- custom Hooks

## Custom Hooks are the escape hatch

Custom Hooks let you reuse Hook logic while still following the rules.

```javascript
function useCounter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((c) => c + 1);
  return { count, increment };
}
```

Each call to `useCounter` gets its own state because each call goes through the Hook list in order.

This is why custom Hooks work.

They are not a special language feature. They are functions that call Hooks in a stable order under the hood.

## The mental model: Hooks are like a list

A useful way to think about Hooks is:

```text
React keeps a list of Hook results for each component.
Each render fills in that list in the same order.
The order must be predictable.
```

If you keep that list stable, React can match:

- the first `useState` call to the first state slot
- the second `useState` call to the second state slot
- the first `useEffect` call to the first effect slot
- and so on

The names you use in your code are for humans.

The order is for React.

## What React stores between renders

Between renders, React stores:

- state values for each Hook call
- effect references and cleanup functions
- ref values
- memoization caches

It does this based on the order of Hook calls.

That is why the order must be stable.

If the order changes, React's stored data no longer lines up with your code.

## A simple stable example

```javascript
function Stable() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  return (
    <div>
      <p>{count}</p>
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </div>
  );
}
```

No matter how many times this renders, the Hook order is the same:

1. `useState` for `count`
2. `useState` for `name`

React can safely re-render this component.

## A broken example

```javascript
function Broken() {
  const [count, setCount] = useState(0);

  if (count > 0) {
    const [name, setName] = useState("");
  }

  return <p>{count}</p>;
}
```

When `count` goes from 0 to 1, the second `useState` call may appear or disappear.

That changes the Hook list and makes React's state tracking unreliable.

## A safe conditional pattern

If you need conditional behavior, keep the Hook calls stable and use conditionals inside the Hook values or effects.

```javascript
function Safe({ showInput }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  return (
    <div>
      <p>{count}</p>
      {showInput && (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}
    </div>
  );
}
```

Here the Hooks are always called. Only the rendering is conditional.

That is safe.

## A safe early-return pattern

If you need an early return, place Hooks before it.

```javascript
function Safe({ user }) {
  const [state, setState] = useState("loading");

  if (!user) {
    return <p>No user</p>;
  }

  // Hooks already called above
  return <p>Hello, {user.name}</p>;
}
```

This keeps the Hook order stable.

## The rules are not arbitrary

People sometimes say:

> Why does React care about my call order?

It cares because it does not have another reliable way to keep Hooks tied to the right state without using the call order.

If React tried to identify Hooks by variable names or by string keys, it would have to parse your code differently and would lose the simplicity of the current model.

The call-order model is simple and fast. The cost is that you must follow the rules.

## Custom Hooks can also break if written carelessly

A custom Hook must also call Hooks unconditionally.

```javascript
function useBad(isEnabled) {
  if (isEnabled) {
    const [value, setValue] = useState(0);
    return value;
  }
}
```

This is unsafe if `isEnabled` changes between renders.

A safer version moves the Hook outside the condition:

```javascript
function useBetter(isEnabled) {
  const [value, setValue] = useState(0);
  return isEnabled ? value : null;
}
```

The Hook is always called. The conditional is in the return value, not in the Hook call.

## A compact model

```text
Hooks call order = how React matches state
Rules = keep order stable and call Hooks only in allowed places
Conditionals and early returns = can change Hook count
Custom Hooks = reuse Hook logic while preserving order
React stores state per Hook position, not per variable name
```

## Interview questions you should be able to answer

### 1. Why can't you call Hooks conditionally?

Because React uses the order of Hook calls to match state. Conditional calls can change that order.

### 2. What happens if the number of Hook calls changes between renders?

React may associate the wrong state with the wrong Hook, breaking the component.

### 3. Can you call Hooks in a loop?

Not safely, unless the loop always runs the same number of times and the order stays stable. In practice, avoid it.

### 4. Where are Hooks allowed?

In function components and custom Hooks.

### 5. Why do custom Hooks work?

Because each call to a custom Hook goes through the Hook list in order, and React stores separate state for each call.

## Final mental model

```text
Hook call order = stable contract
React state = stored by position in the list
Conditionals = dangerous if they change Hook count
Custom Hooks = reuse logic without breaking order
Rule of thumb = call Hooks unconditionally at the top level
```

Or in one sentence:

> **React Hooks depend on a stable call order, so you must call them unconditionally at the top level of a component or custom Hook, because React matches internal state to Hook calls by position, not by name.**

The next piece is one of the most overused and misunderstood parts of the Hooks system: `useMemo` and `useCallback`.
