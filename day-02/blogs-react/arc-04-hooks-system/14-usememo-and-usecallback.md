---
title: "useMemo and useCallback in React"
excerpt: "useMemo and useCallback are often treated as default optimization tools, but they are not. This post explains what they stabilize, when they help, when they add noise, and why referential equality matters more than the hooks themselves."
tags: ["react", "useMemo", "useCallback", "memoization", "performance", "hooks"]
---

# useMemo and useCallback in React

`useMemo` and `useCallback` are two of the most overused Hooks in React.

They are also two of the most useful, when used for the right reasons.

The key idea is simple:

> Both hooks help you keep a stable reference so that other code does not see a new value on every render.

But that does not mean you should wrap everything in them.

## What useMemo does

`useMemo` returns a cached value.

```javascript
const value = useMemo(() => expensiveCalculation(a, b), [a, b]);
```

React will reuse the cached result until `a` or `b` changes.

This is useful when the calculation is expensive and you want to avoid recomputing it on every render.

It is not a magic speed switch. It is a way to skip recomputation.

If the calculation is cheap, `useMemo` is usually unnecessary.

## What useCallback does

`useCallback` returns a cached function.

```javascript
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

This is useful when you need a function to keep the same reference across renders.

Why would you need that?

Because some components and Hooks care about referential equality.

If a function is recreated every render, a child component may see it as a prop change even if the behavior did not really change.

That can cause unnecessary re-renders in memoized children.

## Referential equality matters

In JavaScript:

```javascript
{} !== {};
() => {} !== () => {};
```

A new object or function is not equal to the previous one, even if it does the same thing.

That matters in React because props are compared by reference when you use `React.memo` or similar patterns.

```javascript
function Child({ onClick }) {
  console.log("child rendered");
  return <button onClick={onClick}>Click</button>;
}

const MemoChild = React.memo(Child);

function Parent() {
  const onClick = () => console.log("clicked");

  return <MemoChild onClick={onClick} />;
}
```

Without `useCallback`, `onClick` is a new function every render.

`MemoChild` may re-render because its prop changed by reference.

With `useCallback`:

```javascript
const onClick = useCallback(() => {
  console.log("clicked");
}, []);
```

The function reference stays stable, so `MemoChild` can skip re-rendering if nothing else changed.

## The most common use case for useCallback

The most common reason to use `useCallback` is to keep props stable for memoized children.

```javascript
const MemoizedChild = React.memo(Child);

function Parent() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  return (
    <div>
      <p>{count}</p>
      <MemoizedChild onClick={increment} />
    </div>
  );
}
```

Now `increment` is stable, and `MemoizedChild` does not re-render just because `Parent` re-rendered for another reason.

## A common mistake: using useCallback everywhere

A lot of code wraps every function in `useCallback` just in case.

That is usually noise.

If the function is not passed to a memoized child, and if it does not need to stay stable for a Hook or effect, `useCallback` may not help.

It also has a cost. The dependency array must be maintained. If you get it wrong, you can create stale closures.

The rule is:

> Use `useCallback` when the function reference needs to stay stable.
> Do not use it by default for every function.

## A common mistake: using useMemo for everything

The same logic applies to `useMemo`.

```javascript
const value = useMemo(() => a + b, [a, b]);
```

If `a + b` is cheap, this is unnecessary.

`useMemo` is not a way to make everything faster. It is a way to avoid recomputing expensive values.

For trivial computations, the cache logic may even add overhead.

## What useMemo is good for

- expensive list filtering or sorting
- building large derived structures
- preventing unnecessary recomputation in render-heavy components
- keeping a value referentially stable when needed

A good example:

```javascript
const filtered = useMemo(() => {
  return items.filter(isVisible).sort(byName);
}, [items, isVisible]);
```

If `items` and `isVisible` have not changed, the filtered list is reused.

## What useCallback is good for

- passing stable callbacks to memoized children
- avoiding breaking `React.memo` comparisons
- keeping a function reference stable for an effect or another Hook
- preventing a handler from being recreated unnecessarily

A good example:

```javascript
const onUpdate = useCallback((value) => {
  setForm((prev) => ({ ...prev, ...value }));
}, []);
```

If the form state update does not depend on props or other changing values, the callback can be stable.

## The decorator effect

One important consequence of using these hooks is that they can affect child rendering behavior.

If you memoize a child, you are making a promise:

> I want this child to skip rendering when its props have not changed.

That promise only works if the props are stable.

If you pass unstable objects or functions into a memoized child, the memoization may not help much.

So `useMemo` and `useCallback` often matter most when you are deliberately memoizing part of the tree.

## The dependency array still matters

Both hooks rely on dependencies.

```javascript
const fn = useCallback(() => {
  doSomething(value);
}, [value]);
```

If `value` changes, the callback is recreated.

If you forget a dependency, the callback may capture a stale value.

If you add unnecessary dependencies, the callback may change too often.

The dependency array is not optional decoration. It is part of the correctness of the hook.

## A practical rule for useMemo

Use `useMemo` when:

- the computation is expensive
- the result is used in render
- you have evidence that recomputation is a problem

Do not use `useMemo` when:

- the calculation is trivial
- you are just trying to "optimize" without evidence
- the value does not need to be cached

## A practical rule for useCallback

Use `useCallback` when:

- the function is passed to a memoized child
- the function's stability matters for rendering or effect behavior
- you have a reason to keep the same reference

Do not use `useCallback` when:

- the function is local and never leaves the component
- no memoized child depends on it
- stability is not actually required

## A common source of confusion

People often think `useCallback` is the same as "this function will not re-render."

That is not what it does.

`useCallback` returns the same function reference across renders.

It does not prevent the component that uses the callback from re-rendering for other reasons.

It just lets you pass a stable function to something that cares about reference equality.

## Another common confusion

People sometimes think these hooks are required to make effects safe.

They are not.

Effects and refs have their own patterns for stale values.

`useCallback` is mainly about function identity, not about general effect safety.

If you need a callback inside an effect, you still have to decide whether the effect should depend on it or whether a ref is more appropriate.

## The cost of over-memoization

Overusing `useMemo` and `useCallback` can make code harder to read and maintain.

It adds dependency arrays everywhere.

It can hide real performance problems by spreading optimization across many small hooks.

And it can give the illusion of performance work without actually improving the bottleneck.

A better approach is to profile first, then optimize the real cost.

## A compact model

```text
useMemo     = cache a computed value
useCallback = cache a function reference
both        = stabilize references
referential equality = why stability matters in some APIs
React.memo = uses reference stability to skip child renders
overuse     = noise and maintenance cost
```

## Interview questions you should be able to answer

### 1. What does useMemo do?

It caches the result of a computation and only recomputes it when dependencies change.

### 2. What does useCallback do?

It returns a stable function reference across renders.

### 3. Why does referential equality matter in React?

Because some components and patterns compare props by reference, so a new function or object can cause re-renders even if behavior is unchanged.

### 4. When should you use useCallback?

When a function needs a stable reference, especially for memoized children or for dependencies that should not change.

### 5. Is useMemo required for every calculation?

No. It is only useful when the calculation is expensive enough to justify caching.

## Final mental model

```text
useMemo     = cache expensive computed values
useCallback = cache function identity
both        = stabilize references
referential equality = why it matters
memo        = uses stable props to skip renders
default     = do not memoize by habit
```

Or in one sentence:

> **`useMemo` caches expensive values and `useCallback` stabilizes function references, but both should be used only when reference stability or recomputation cost actually matters.**

The next piece is how to package Hook logic into reusable custom Hooks.
