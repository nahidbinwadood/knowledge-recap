---
title: "State as Snapshots in React"
excerpt: "React state is not a mutable variable you read and write in place. It is a snapshot of a value at a point in time. This post explains why setState does not change the current render, why state updates are queued, and why reading state inside the wrong closure is a common source of bugs."
tags: ["react", "state", "setState", "closures", "render", "mental-model"]
---

# State as Snapshots in React

If you come from a mutable programming background, React state can feel odd at first.

```javascript
const [count, setCount] = useState(0);

// this does not behave like a normal variable
setCount(count + 1);

console.log(count); // still the old value
```

The value did not change in place. It only changed for the next render.

That is the core idea of this post:

> React state is a snapshot. Each render sees its own version of state.

## The wrong mental model

A common mental model is:

```text
state is a variable
setState changes the variable
the next line sees the new value
```

That is not how React works.

A more accurate mental model is:

```text
state is a value from the current render
setState says "please re-render with a new value"
the current render still sees the old value
```

This is why React state feels stubborn if you try to use it like a regular mutable variable.

## A simple example

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count);
  }

  return <button onClick={handleClick}>{count}</button>;
}
```

When you click the button:

- `setCount` schedules an update
- `console.log(count)` prints the current render's `count`
- the `count` variable in this render does not change

If `count` was 0, the log prints 0, even though a new render with 1 is coming.

## Why React works this way

React renders components as functions of props and state.

During one render:

- the component runs
- it reads its current props and state
- it returns a UI description

That render's `count` is fixed for the duration of that render.

If React mutated `count` in place during the same render, the component's output would become inconsistent with the state it supposedly read.

Instead, React says:

> For this render, `count` is a specific value.
> If you want a new value, request a new render.

This is why state "snapshots" are useful. They make each render self-consistent.

## State updates are queued, not immediate

`setCount` does not mutate state immediately.

```javascript
setCount(1);
setCount(2);
```

If you call `setCount` twice in the same event handler, React does not re-render after each call.

It batch the updates and uses the last one.

```javascript
function handleClick() {
  setCount(1);
  setCount(2);
}
```

The next render sees `count = 2`.

This is important because people sometimes expect:

```javascript
setCount(1);
console.log(count); // expecting 1
```

That does not happen. The console log still sees the old render's `count`.

## Functional updates help when state depends on previous state

If you need to update state based on the previous state, a functional update is safer.

```javascript
setCount((prev) => prev + 1);
```

This is useful when multiple updates happen in the same event, because the function receives the latest state value React intends to use for the update.

```javascript
function handleClick() {
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
}
```

Both calls use the functional form, so the second call receives the intermediate value React has queued.

The result is usually 2 newer than 2, depending on batching, but the point is that functional updates communicate "this update depends on the previous state" instead of "this update depends on the count variable I read right now."

The non-functional form is risky when the new state depends on the old state:

```javascript
// risky if called twice quickly
setCount(count + 1);
setCount(count + 1);
```

Both calls may read the same `count`, because `count` is a snapshot from the current render.

## The closure trap

A very common React bug comes from closures reading stale state.

```javascript
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count);
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <p>{count}</p>;
}
```

If you read `count` inside the interval callback, you may keep seeing the initial value.

Why?

Because the effect ran once, and the callback closed over the `count` from that render.

Every time the interval fires, it still sees the old `count`.

This is the classic stale closure problem.

The fix is usually one of:

- add `count` to the dependency array so the effect re-runs when `count` changes
- use a functional state update
- use a ref for values you need to read without triggering re-renders

```javascript
useEffect(() => {
  const id = setInterval(() => {
    setCount((prev) => prev + 1);
  }, 1000);

  return () => clearInterval(id);
}, []);
```

Here the functional update avoids relying on the closed-over `count`.

## Not every value should be state

This snapshot model is also a reminder that not everything belongs in state.

State is for values that:

- affect the UI
- change over time
- should trigger a re-render when they change

If a value is just a local calculation, it should not be state.

```javascript
// unnecessary state
const [fullName, setFullName] = useState(`${first} ${last}`);

// better
const fullName = `${first} ${last}`;
```

Derived values are computed, not stored.

## State is not the same as a mutable object field

If you mutate an object in state directly, React may not notice.

```javascript
const [user, setUser] = useState({ name: "Nahid" });

// bad
user.name = "Amir";
```

That mutation does not trigger a re-render.

The correct pattern is to treat state as immutable and replace it with a new value.

```javascript
setUser({ ...user, name: "Amir" });
```

This fits the snapshot model. You are not editing the old state in place. You are requesting a new snapshot.

## Why this model helps

Once you accept that state is a snapshot:

- stale closures make more sense
- batching makes more sense
- functional updates make more sense
- direct mutations make less sense
- derived state becomes easier to reason about

A lot of React bugs come from treating state like a mutable variable.

Once you treat it like a snapshot, the rules become simpler.

## A practical mental model

```text
each render has its own state values
setState requests a future render
the current render's variables do not change
if you need the latest state for an update, use a functional update
if you need a value inside a long-lived callback, watch for stale closures
```

## Interview questions you should be able to answer

### 1. Does setState immediately update the current render's state variable?

No. The current render still sees the old value. The update is applied in a future render.

### 2. Why can setCount(count + 1) be wrong when called twice in one handler?

Because both calls may read the same snapshot of `count` from the current render.

### 3. What is a stale closure in React?

A callback that captured an old value of state or props and keeps using it even after the state has changed.

### 4. When should you use a functional state update?

When the new state depends on the previous state, especially when multiple updates may happen in the same batch.

### 5. Why should you not mutate state objects directly?

Because React may not detect the change, and the UI will not update.

## Final mental model

```text
state = snapshot for the current render
setState = request a new render with a new snapshot
current render = reads its own fixed state
future render = sees the updated value
mutations in place = usually wrong
functional updates = safer when depending on previous state
```

Or in one sentence:

> **React state is a snapshot for the current render, and setState asks React to produce a new snapshot later, not to mutate the value you are currently holding.**

The next piece is how `useState` works in practice, and when local state is the right tool.
