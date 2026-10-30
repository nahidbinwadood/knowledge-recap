---
title: "Separating Behavior with Custom Hooks in React"
excerpt: "Custom Hooks are the main way React components separate behavior from rendering. This post explains what custom Hooks are for, how they differ from general utility functions, and how to use them to keep components smaller and clearer."
tags: ["react", "custom-hooks", "hooks", "behavior-extraction", "component-design", "architecture"]
---

# Separating Behavior with Custom Hooks in React

React components often do two kinds of work:

- they describe what to render
- they describe what to do

Those two jobs do not always belong in the same place.

Custom Hooks are a way to pull behavior out of a component and into a reusable function.

That makes the component easier to read and the behavior easier to share.

## What a custom Hook is

A custom Hook is just a function that:

- uses other Hooks
- returns something the component needs
- follows the same rules as other Hooks

For example:

```javascript
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);

  return { count, increment, decrement };
}
```

Now a component can use it:

```javascript
function Counter() {
  const { count, increment, decrement } = useCounter(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

The component no longer contains the counter logic.

It only uses it.

## What custom Hooks are good for

### 1. Extracting repeated behavior

If several components do the same thing, the behavior can move into a Hook.

For example, if multiple components need a selected item, a simple selection Hook can share that logic.

```javascript
function useSelection() {
  const [selected, setSelected] = useState(null);
  const select = (item) => setSelected(item);
  const clear = () => setSelected(null);
  return { selected, select, clear };
}
```

### 2. Keeping components focused on UI

A component should often be easier to read if the logic is in a Hook.

```javascript
function SearchResults() {
  const { query, setQuery, results } = useSearch();

  return (
    <div>
      <input value={query} onChange={...} />
      <ul>
        {results.map(...)}
      </ul>
    </div>
  );
}
```

Here the component is about rendering and basic wiring.

The search behavior is in `useSearch`.

### 3. Sharing logic without sharing UI

A custom Hook can be reused across different components even if the UI is different.

That is one of its main strengths.

One component might render a search box with a list.

Another might render a search box inside a mobile view.

If both use the same Hook, they share the underlying behavior.

### 4. Simplifying component internals

When a component has a lot of state, effects, and derived values, those can be moved into Hooks.

The component then becomes more about assembling the UI from smaller pieces.

## A useful distinction: utilities vs Hooks

Not every shared function is a Hook.

A plain utility function is fine when the logic does not need React state or Hooks.

```javascript
// utility
function formatPrice(amount, currency) {
  return ...
}
```

A Hook is appropriate when the logic:

- uses `useState`, `useEffect`, or other Hooks
- depends on React rendering behavior
- needs to keep internal React-managed state
- needs to subscribe to something React-aware

Put differently:

```text
pure logic -> utility function
React-aware behavior -> Hook
```

## A concrete example of the difference

This is a utility:

```javascript
function buildQuery(filters) {
  const params = new URLSearchParams(filters);
  return `/?${params.toString()}`;
}
```

This is a Hook:

```javascript
function useFilteredItems(items, filters) {
  const query = useMemo(() => buildQuery(filters), [filters]);
  // maybe fetch or filter based on query
  return filteredItems;
}
```

The first is pure data transformation.

The second is tied to React state and rendering.

## What custom Hooks are not for

### 1. Not for every tiny helper

Do not create a Hook just because a function returns a value.

A Hook makes sense when it uses React Hooks or manages React-related behavior.

### 2. Not for changing pure logic into Hooks

If a function is pure, keeping it pure is usually better.

```javascript
// unnecessary as a Hook
function useAdd(a, b) {
  return a + b;
}
```

That adds no value and muddies the distinction.

### 3. Not for hiding too many responsibilities

A Hook can still do too much.

If `useEverything` handles fetching, validation, filtering, caching, and UI decisions, that is still too broad.

A Hook should separate a concern, not collect one.

## A good custom Hook has a clear contract

A good Hook answers these questions:

```text
What does it provide?
What does it own?
What does the component still decide?
```

For example, `useCounter`:

- provides: count, increment, decrement
- owns: internal count state
- does not decide: how the UI looks

That is a clean separation.

## A pattern: behavior in Hooks, UI in components

This pattern often leads to cleaner code:

```text
useSomething() = behavior and state
SomeComponent() = rendering and wiring
```

For example:

```javascript
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored != null ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

Now a component can use a piece of persisted state without knowing the storage details.

## Custom Hooks make testing behavior easier

If behavior is in a Hook, you can test that behavior more directly than if it were buried inside a component.

You do not always need to render a full UI to check the behavior.

You can call the Hook inside a test wrapper and inspect the result.

That is one reason custom Hooks matter for maintainability.

## A note on abstraction

Custom Hooks do not automatically create good abstractions.

A Hook can still be:

- too specific
- too coupled to one UI
- too early
- too big

The improvement comes when the Hook isolates a real concern.

## A bad smell: Hooks that return UI decisions

If a Hook starts deciding what the component should render, the boundary is getting fuzzy.

For example:

```javascript
// less ideal
function useFormLayout() {
  return {
    showSubmit: true,
    layout: "wide",
    ...
  };
}
```

A Hook can return data and actions.

It should usually not return UI decisions that belong in the component.

## A bad smell: components that regain the logic

Another smell is when a Hook exists but the component still does most of the logic anyway.

That means the Hook was not designed around the actual responsibility.

The split should reduce complexity, not duplicate it.

## Composition of Hooks

Hooks compose well.

You can use one Hook inside another.

```javascript
function useTodoList(todoIds) {
  const items = useItems(todoIds);
  const filtered = useFiltered(items);
  return { items: filtered, refresh: useRefresher() };
}
```

This is powerful because behavior can be layered.

## A practical rule of thumb

```text
if several components share the same React behavior, consider a Hook
if the behavior is pure logic, consider a normal function
if the component gets cluttered with state and effects, consider extracting
if the Hook is only used once, question whether it is needed yet
if the Hook returns UI decisions, revisit the boundary
```

## Interview questions you should be able to answer

### 1. What is a custom Hook in React?

It is a function that uses Hooks and can be shared across components to extract reusable behavior.

### 2. When should you use a custom Hook instead of a normal function?

When the logic needs Hooks, React state, effects, or other React-aware behavior.

### 3. What is the main benefit of custom Hooks?

They separate behavior from rendering and make logic easier to reuse and test.

### 4. What should a custom Hook usually not do?

It should usually not become a dumping ground for unrelated responsibilities or return UI decisions that belong in the component.

### 5. Are custom Hooks only for reuse?

No. Reuse is important, but even a single-component Hook can help by clarifying what the component owns versus what the Hook owns.

## Final mental model

```text
custom Hook = React-aware behavior extracted into a function
good use = reusable behavior, cleaner components, clearer contracts
bad use = unnecessary abstraction, logic disguised as a Hook, over-packed responsibilities
plain function = for pure logic
rule = extract behavior when it helps the component and the system
```

Or in one sentence:

> **Custom Hooks exist to move React-aware behavior out of components so that components can stay focused on rendering and the behavior can be reused, understood, and tested more easily.**

Automatically Save
