---
title: "Dependency Arrays and Stale Closures in React"
excerpt: "Effect dependency arrays are not a performance option. They describe what the effect depends on. This post explains how stale closures happen, why missing dependencies are a correctness problem, and how to reason about effects so the dependency array stops feeling like a checklist."
tags: ["react", "useEffect", "dependency-array", "stale-closures", "hooks", "bugs"]
---

# Dependency Arrays and Stale Closures in React

The dependency array is one of the most important parts of `useEffect`, and also one of the easiest to get wrong.

A lot of React bugs come from one of two mistakes:

- pretending an effect does not depend on something it clearly does
- adding dependencies without understanding what the effect is syncing

This post is about why the dependency array matters, what stale closures are, and how to think about effects so the dependencies become obvious.

## The dependency array is a contract

When you write:

```javascript
useEffect(() => {
  // ...
}, [a, b]);
```

you are saying:

> Re-run this effect when `a` or `b` changes.

That is not a suggestion. It is the effect's contract with React.

If the effect uses `a` or `b` to stay in sync with something, then it depends on them.

If it uses a value and the dependency array does not include it, the effect can become stale.

## What a stale closure is

A stale closure is a function that captured an old value and keeps using it after the world has changed.

```javascript
function Counter() {
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

The effect runs once. The interval callback closes over the `count` from that render.

When the interval fires later, it still sees the old `count`.

That is a stale closure.

The UI may show a changing `count` because the component re-renders, but the effect's callback still uses the initial value.

## Why stale closures happen

Stale closures happen because JavaScript functions remember the variables they were created around.

If you create a callback inside an effect, the callback sees the values from that effect's render.

If the effect does not re-run when those values change, the callback keeps the old ones.

This is not a React bug. It is JavaScript.

React's job is to help you declare when the effect should re-sync so the closure stays current.

## Missing dependencies are a correctness problem

The most common advice is "follow the linter."

That advice matters because missing dependencies usually mean the effect is lying about what it depends on.

```javascript
useEffect(() => {
  fetchData(query);
}, []); // missing query
```

If `query` changes, the effect will not re-run.

That can lead to:

- showing stale data
- not refreshing when the user expects it
- using outdated values inside timers, listeners, or callbacks

Sometimes an empty dependency array is correct. Sometimes it is a bug.

The point is: the array should reflect reality.

## The wrong fix: avoiding dependencies without a reason

A common bad pattern is to suppress the dependency warning without thinking.

```javascript
useEffect(() => {
  fetchData(query);
}, []); // eslint-disable-line
```

Or:

```javascript
useEffect(() => {
  fetchData(query);
}, []); // ignoring query on purpose
```

Sometimes people do this because they think "I only want this to run once."

But if the effect really depends on `query`, then "once" is not the right model. The right model is "sync with `query`."

If you want the effect to run once for the initial `query` and again when `query` changes, then `query` belongs in the dependency array.

## Functional updates can help with state dependency problems

A common stale-closure pattern shows up when state updates depend on previous state.

```javascript
useEffect(() => {
  setCount(count + 1);
}, []);
```

If `count` changes over time, this effect may keep using the initial value.

A better version is:

```javascript
useEffect(() => {
  setCount((prev) => prev + 1);
}, []);
```

The functional update uses the latest state value React has, not the closed-over one.

This does not magically fix every dependency problem, but it solves a specific class of stale-state-in-effect bugs.

## The linter is not your enemy

The React Hooks lint rules exist because dependency mistakes are easy to make and hard to spot.

When the linter says a dependency is missing, it is usually pointing at a real risk.

That does not mean you must blindly add every variable you see.

It means you should understand why the variable is there and whether the effect truly depends on it.

If it does, add it.

If it does not, remove the usage or move the logic.

## A better way to write effects

A useful discipline is to write the effect first, then let the dependencies fall out of it.

```javascript
useEffect(() => {
  const id = setInterval(() => {
    doSomething(value);
  }, 1000);

  return () => clearInterval(id);
}, [value]);
```

If the effect reads `value`, and `value` can change, then `value` belongs in the dependency array.

If the effect is meant to use the latest value every time it runs, and `value` can change, then the effect must re-run when `value` changes or use a ref.

The dependency array should match the values the effect actually uses to stay correct.

## When an empty dependency array is correct

An empty dependency array is correct when the effect truly only needs to run once for setup and cleanup.

```javascript
useEffect(() => {
  const socket = openSocket();
  socket.on("message", handleMessage);
  return () => socket.close();
}, []);
```

If the socket connection does not depend on props or state, and the effect should only connect and disconnect once per mount, `[]` can be right.

But if the effect uses a prop or state value to set up the connection, and that value can change, then `[]` is likely wrong.

## When not all dependencies can be in the array

Sometimes an effect needs to read the latest value without re-running every time that value changes.

In that case, people often use a ref.

```javascript
const ref = useRef(value);

useEffect(() => {
  ref.current = value;
}, [value]);

useEffect(() => {
  const id = setInterval(() => {
    doSomething(ref.current);
  }, 1000);

  return () => clearInterval(id);
}, []);
```

The ref gives the effect access to the latest value without requiring it to re-run on every change.

This pattern is useful, but it should be a deliberate choice, not a way to hide dependencies.

## The real question is not "how do I silence the warning?"

The real question is:

> What is this effect trying to stay in sync with?

If the effect is syncing with `value`, then it depends on `value`.

If the effect is only syncing with a one-time setup, it may not depend on much.

If the effect needs the latest value but not a re-run, use a ref or restructure the logic.

The dependency array should express the synchronization intent.

## A practical example

```javascript
function Search({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    let cancelled = false;

    fetch(`/search?q=${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setResults(data);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return <ul>{results.map(renderResult)}</ul>;
}
```

Here the effect depends on `query`.

If `query` changes, the effect re-runs and fetches new results.

If the cleanup flag is used correctly, racing async responses can be handled more safely.

The dependency array matches the synchronization need.

## A stale-closure example

```javascript
function StaleExample({ item }) {
  const [mode, setMode] = useState("view");

  useEffect(() => {
    const id = setInterval(() => {
      console.log(item, mode);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return ...;
}
```

This effect logs `item` and `mode`, but it never re-runs when they change.

So the interval always logs the initial values.

That is the bug.

If the effect should see the latest values, the dependencies should include them, or the effect should use refs.

## A common confusion

People sometimes think:

> If I add a dependency, the effect will run too often

Sometimes that is true, and it may indicate that the effect is doing too much.

But the fix is not to pretend the dependency does not exist.

The fix is usually one of:

- split the effect into smaller effects with clearer concerns
- stabilize the dependency if it is recreated too often
- use a ref for the value that does not need to trigger a re-run
- restructure the logic so the dependencies are accurate and small

## A compact model

```text
dependency array = what the effect depends on
missing dependency = stale closure risk
empty array = only correct if the effect truly does not depend on changing values
functional update = helps when a state update depends on previous state
ref = a way to read latest values without re-running the effect
goal = make dependencies match the sync intent
```

## Interview questions you should be able to answer

### 1. What does the dependency array do?

It tells React when the effect should re-run.

### 2. What is a stale closure?

A callback that captured an old value and keeps using it even after the value has changed.

### 3. Why can missing dependencies be a bug?

Because the effect may not re-sync when it should, using outdated values.

### 4. What is a functional state update useful for?

It lets a state update use the latest state instead of a closed-over snapshot.

### 5. When is an empty dependency array correct?

When the effect only needs to run once for setup and cleanup and does not depend on changing props or state.

## Final mental model

```text
effect reads values → those values belong in the dependency array
effect does not re-run when it should → stale closure
effect re-runs too much → dependency or design problem
functional updates → safer when depending on previous state
ref → useful when you need latest value without re-running
```

Or in one sentence:

> **The dependency array should list the values the effect truly depends on, because omitting them creates stale closures, and adding them without understanding the effect creates confusion.**

The next piece is one of the hardest parts of effects: cleanup, race conditions, and the fact that async work does not always finish in the order you expect.
