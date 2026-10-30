---
title: "Derived State and Computation in React"
excerpt: "One of the most common React mistakes is storing values that can be computed from other values. This post explains derived state, why it matters, when caching is useful, and how to tell the difference between state, derived values, and server state."
tags: ["react", "state", "derived-state", "computation", "memoization", "mental-model"]
---

# Derived State and Computation in React

A very common React mistake is storing values that should be computed.

```javascript
const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

This looks harmless, but it introduces an extra source of truth and an extra synchronization step that is often unnecessary.

A better version is:

```javascript
const fullName = `${firstName} ${lastName}`;
```

That is derived state.

This post is about telling the difference between:

- real state
- derived values
- cached computation
- server state

Once that distinction is clear, a lot of component design becomes simpler.

## What derived state means

Derived state is a value that can be calculated from other state or props.

If you already have the ingredients, you usually do not need to store the result separately.

```javascript
function Cart({ items }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return <p>Total: ${total}</p>;
}
```

`total` is derived from `items`.

You do not need a separate state variable for it.

If `items` changes, `total` changes automatically.

That is the benefit of derived values. They stay in sync by construction.

## Why people store derived values anyway

There are a few common reasons:

1. They think they need to "update" the UI manually.
2. They think state is the only way to get a re-render.
3. They are trying to cache a heavy computation without knowing a better way.
4. They copied a pattern they saw in older code.

Sometimes people also store derived values because they want to avoid recomputing them.

That instinct is not wrong. The implementation is often wrong.

## Not every value should be state

A good rule is:

> If a value can be calculated from existing state or props, compute it, do not store it.

This reduces:

- synchronization bugs
- extra render logic
- stale derived values
- unnecessary `useEffect` usage

`useEffect` is not the tool for turning one state value into another during normal rendering.

```javascript
// usually wrong
useEffect(() => {
  setDerived(valueFromState);
}, [valueFromState]);
```

If the derived value is cheap, compute it directly during render.

## When derived computation is cheap

If the computation is small, put it directly in the render body.

```javascript
function Stats({ scores }) {
  const total = scores.length;
  const average = scores.length
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;

  return <div>{total} scores, average {average}</div>;
}
```

That is fine for many cases.

The computation runs during render, but if it is cheap, that is not a problem.

## When you might want to cache a computation

Sometimes deriving a value is expensive.

Maybe you are filtering a large list, transforming a lot of data, or doing something costly on every render.

In that case, caching can help.

But the important distinction is:

- derived state is about correctness and simplicity
- caching is about performance

They are related but not the same.

If you cache a value, you are still computing it from something else. You are just avoiding recomputation when the inputs have not changed.

## useMemo is for caching, not for replacing state

`useMemo` can cache a computed value.

```javascript
const filtered = useMemo(() => {
  return largeList.filter(isVisible);
}, [largeList, isVisible]);
```

This does not mean `filtered` is state. It means the result is reused when the inputs stay the same.

This is useful when the computation is expensive.

It is not a default for every derivation.

Overusing `useMemo` can make code harder to read and can even add overhead.

A good rule:

> Use `useMemo` when recomputation is expensive enough to matter.
> Do not use it just because you can.

## The difference between state and derived cache

State represents something that genuinely changes over time and is not fully determined by other values already in the component.

A cached derived value is still derived. It just avoids recomputing.

This matters because people sometimes say:

> I need state for this value

when what they really mean is:

> I need to compute this value, and maybe I should cache it.

Those are different needs.

## A common pattern that should be derived

Take a search filter.

```javascript
function UserList({ users, query }) {
  const filtered = users.filter(
    (user) => user.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ul>
      {filtered.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

`filtered` is derived from `users` and `query`.

It should not be stored as state unless there is a special reason.

Storing it as state would create the possibility of `filtered` being out of sync with `users` and `query`.

## When derived state gets tricky

Derived state is usually simple, but it can get tricky when:

- the derivation is expensive
- the inputs change frequently
- the derivation depends on async data that is not yet available
- the derivation involves multiple sources of truth

In those cases, the answer is usually not "put it in state."

The answer is usually one of:

- compute it more carefully
- cache it only if needed
- move the computation out of the component if appropriate
- use a server-state layer if the data comes from the server

## Server state is not derived state

It is easy to confuse server state with derived state.

Server state is data that comes from the server and is often shared, cached, and refetched.

Derived state is usually something the component can compute from the data it already has.

If you find yourself storing server data in `useState` and trying to keep it in sync manually, you may be using the wrong tool.

That is where server-state libraries or a custom fetching layer become relevant.

But that is a larger topic. The point here is simpler:

> Do not treat server data as local derived state.

## A practical test

When you are about to call `useState`, ask:

```text
Could I compute this from existing state or props?
If I store it, will I have to keep it in sync?
Is the computation expensive enough to cache?
Do I really need a cache, or is the computation cheap?
```

If the answer is "I can compute it" and the computation is cheap, do that instead.

If the answer is "it is expensive," consider `useMemo`.

If the answer is "it is server data," consider a server-state layer.

If the answer is "it is a real independent value that changes on its own," then `useState` may be appropriate.

## A bad pattern

```javascript
function BadExample({ items }) {
  const [sorted, setSorted] = useState(items);

  useEffect(() => {
    setSorted([...items].sort(byName));
  }, [items]);

  return <ul>{sorted.map(...)}</ul>;
}
```

The `sorted` list is derived from `items`.

Storing it separately creates an extra source of truth and an extra synchronization step.

A simpler version:

```javascript
function BetterExample({ items }) {
  const sorted = useMemo(() => {
    return [...items].sort(byName);
  }, [items]);

  return <ul>{sorted.map(...)}</ul>;
}
```

Now `sorted` is derived and cached only if needed.

## A good pattern

```javascript
function Form({ values }) {
  const hasErrors = Object.keys(errors).length > 0;
  const isSubmitting = status === "submitting";
  const canSubmit = !isSubmitting && !hasErrors;

  return ...;
}
```

These values are derived from other state or props.

They should be computed during render.

They should not be stored separately unless profiling proves otherwise.

## The deeper principle

State should represent the smallest set of values you need to keep as source of truth.

Everything else should ideally be derived from that source of truth.

This keeps UI consistent and reduces the number of things you have to manually synchronize.

## Interview questions you should be able to answer

### 1. What is derived state?

A value that can be calculated from existing state or props instead of stored separately.

### 2. Why avoid storing derived values as state?

Because storing them creates extra synchronization and can drift out of sync with the source values.

### 3. When is useMemo useful?

When a computation is expensive and you want to reuse the result while inputs have not changed.

### 4. Is useMemo required for derived values?

No. It is only useful when caching is actually beneficial.

### 5. How do you decide whether a value should be state?

If it is independent, changes over time, and is not derivable from other state or props, it may be state. Otherwise, compute it.

## Final mental model

```text
state        = source of truth
derived      = computed from state or props
cache        = avoid recomputing expensive derivation
server state = data that belongs to the server and is managed separately
rule         = store the smallest source of truth, compute the rest
```

Or in one sentence:

> **If a value can be derived from existing state or props, compute it during render rather than storing it as state, and only cache the derivation when it is expensive enough to matter.**

The next piece is effects, which are where many people first run into confusion about how React syncs with the outside world.
