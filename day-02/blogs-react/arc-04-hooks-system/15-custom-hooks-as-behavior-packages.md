---
title: "Custom Hooks as Behavior Packages in React"
excerpt: "Custom Hooks are the main way to reuse logic in React. This post explains what custom Hooks are good for, how to design one, what they should return, and how they differ from component reuse and utility functions."
tags: ["react", "custom-hooks", "hooks", "reuse", "hooks-system"]
---

# Custom Hooks as Behavior Packages in React

Custom Hooks are the primary way React encourages logic reuse.

They are not components.

They are not utility functions in the usual sense.

They are a way to package behavior that uses Hooks into a reusable unit.

A good custom Hook takes something complicated and turns it into a simple interface.

## The basic idea

A custom Hook is just a function whose name starts with `use` and that may call other Hooks.

```javascript
function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0
  });

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
```

Now any component can use it:

```javascript
function App() {
  const { width, height } = useWindowSize();
  return <p>{width} x {height}</p>;
}
```

The component does not care how the size is tracked. It just uses the Hook.

## Custom Hooks are behavior, not UI

A component returns UI.

A custom Hook returns data, state, or functions.

```javascript
// component
function Button() {
  return <button>Click</button>;
}

// custom Hook
function useCounter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((c) => c + 1);
  return { count, increment };
}
```

This distinction matters.

If you find yourself copying and pasting Hook logic between components, a custom Hook is often the right abstraction.

If you find yourself copying UI, a component is usually the right abstraction.

## A good custom Hook hides complexity

A well-designed Hook hides the messy parts.

```javascript
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    return stored !== null ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    typeof localStorage !== "undefined" &&
      localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

The component using this Hook does not need to know about localStorage, JSON parsing, or the effect setup.

It just calls:

```javascript
const [theme, setTheme] = useLocalStorage("theme", "light");
```

That is the value of a custom Hook: it turns a multi-part concern into one clean API.

## What custom Hooks should usually return

A custom Hook should return the things consumers need.

Common patterns:

- return state
- return state and setters
- return state, setters, and other derived helpers
- return loading, data, and error for async behavior

For example:

```javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
```

The consumer gets a clear set of values to work with.

## A good custom Hook is composable

Custom Hooks can call other custom Hooks.

```javascript
function useApp() {
  const user = useUser();
  const theme = useTheme();
  const size = useWindowSize();

  return { user, theme, size };
}
```

This is useful when several pieces of state or behavior belong together conceptually.

But be careful not to turn every little thing into a Hook. A Hook should capture a reusable unit of behavior, not just a random grouping of values.

## A common mistake: using Hooks as a grab bag

Some people make a single giant Hook for everything.

```javascript
function useEverything() {
  // 30 pieces of state
}
```

That is usually a bad sign.

A Hook should encapsulate a concern.

If it tries to do too much, it becomes hard to test, hard to reuse, and hard to understand.

Better to split:

- `useAuth()`
- `useTheme()`
- `useForm()`
- `useMediaQuery()`

## A common mistake: returning too little

Some custom Hooks hide too much.

```javascript
function useData() {
  // fetches and stores data internally
  // returns nothing useful
}
```

If the consumer cannot access loading, error, or data, the Hook is not very reusable.

A Hook should expose the part of its behavior that consumers reasonably need.

## A common mistake: using Hooks for pure logic

If the logic is pure and does not need state or effects, a Hook is usually the wrong abstraction.

```javascript
// unnecessary Hook
function useFormatName(first, last) {
  return `${first} ${last}`;
}
```

This should just be a function:

```javascript
function formatName(first, last) {
  return `${first} ${last}`;
}
```

Custom Hooks are for Hook-based logic, not for general utilities.

## A common mistake: using Hooks to hide side effects too aggressively

A custom Hook can hide effects, but it should not hide important behavior in a way that makes the consumer surprised.

If a Hook fetches data, the consumer should probably know that.

If a Hook subscribes to something, the consumer should probably understand the lifecycle.

Good Hooks are powerful, but they should not become invisible magic.

## The naming rule

Custom Hooks should be named with the `use` prefix.

```javascript
useCounter
useWindowSize
useLocalStorage
useFetch
```

This is important because React relies on the naming convention in some tooling and because it signals that the function follows Hook rules.

A function called `useSomething` should actually be a Hook.

## The body of a custom Hook follows the same rules

Inside a custom Hook, you must follow the Rules of Hooks.

```javascript
function useCounter() {
  const [count, setCount] = useState(0);
  // ...
}
```

You cannot call Hooks conditionally inside the custom Hook any more than you can in a component.

The same order and top-level rules apply.

## Custom Hooks can take arguments

Like regular functions, custom Hooks can take parameters.

```javascript
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
```

This makes Hooks flexible and reusable.

## Custom Hooks can return setters and behavior

A Hook can return more than just data.

```javascript
function useCounter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount((c) => c + 1);
  const reset = () => setCount(0);

  return { count, increment, reset };
}
```

This is a useful pattern when the actions are part of the concern the Hook owns.

## A good design question

When writing a custom Hook, ask:

```text
What does the consumer need to know?
What does the consumer need to control?
What can be hidden?
What should remain flexible?
```

A good Hook exposes the right surface and hides the rest.

## A practical example

```javascript
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);

  const toggle = () => setOn((prev) => !prev);
  const enable = () => setOn(true);
  const disable = () => setOn(false);

  return { on, toggle, enable, disable };
}
```

This Hook is small, clear, and reusable.

It captures a toggle pattern without forcing the consumer to know how it works.

## Custom Hooks vs components

Component:

- renders UI
- can accept props
- can be composed in JSX

Custom Hook:

- encapsulates logic
- can use state and effects
- returns data and functions, not UI

Sometimes the right abstraction is a component.

Sometimes it is a Hook.

Sometimes you need both.

For example, a Hook for the logic and a component for the UI.

## A compact model

```text
custom Hook = function starting with use
purpose = reuse Hook-based logic
returns = state, behavior, or both
should hide = unnecessary complexity
should expose = what consumers need
not for = pure utility logic
rules = same Hook rules apply inside
```

## Interview questions you should be able to answer

### 1. What is a custom Hook?

A function starting with `use` that can call other Hooks and package reusable behavior.

### 2. What is the difference between a custom Hook and a component?

A component returns UI. A custom Hook returns data, state, or behavior.

### 3. Why use a custom Hook?

To reuse Hook logic without copying it between components.

### 4. What should a custom Hook usually expose?

The values and actions the consumer needs, without hiding too much or returning too little.

### 5. Do custom Hooks follow the same Hook rules?

Yes. They must call Hooks unconditionally and at the top level.

## Final mental model

```text
custom Hook = reusable Hook logic
name = useSomething
purpose = extract behavior, not UI
return = state + behavior, shaped for the consumer
compose = Hooks can call other Hooks
rule = same Rules of Hooks apply
```

Or in one sentence:

> **Custom Hooks are the main way to package reusable React logic, and a good custom Hook hides the messy details while exposing the data and actions the consumer actually needs.**

The next piece is when state gets complicated enough that simple booleans and sliders stop being enough, and finite state thinking becomes useful.
