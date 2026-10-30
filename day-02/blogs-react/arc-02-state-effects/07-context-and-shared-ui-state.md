---
title: "Context and Shared UI State in React"
excerpt: "Context is often treated like a global store, but it is really a way to make a value available to a subtree without threading it through every layer. This post explains what Context is, when it is useful, when it causes re-render problems, and how to use it without turning it into a dumping ground for all state."
tags: ["react", "context", "state", "props", "re-renders", "mental-model"]
---

# Context and Shared UI State in React

Context is one of the most misunderstood React features because people use it for too many things.

Some use it as a global store.

Some use it as a replacement for props everywhere.

Some avoid it entirely because they heard it causes performance problems.

The truth is more ordinary:

> Context is a way to provide a value to a subtree so descendants can read it without receiving it as a prop at every level.

That is it.

It is not a state manager by itself. It is a dependency injection mechanism for React trees.

## What Context solves

Imagine this tree:

```text
App
  └── MainLayout
        └── Page
              └── Header
                    └── UserMenu
```

If `user` is needed in `UserMenu`, and every layer between `App` and `UserMenu` genuinely does not care about `user`, passing it manually through every layer is noisy.

```javascript
<App>
  <MainLayout user={user}>
    <Page user={user}>
      <Header user={user}>
        <UserMenu user={user} />
      </Header>
    </Page>
  </MainLayout>
</App>
```

That is prop drilling.

Context gives you another option:

```javascript
const UserContext = React.createContext();

function App() {
  return (
    <UserContext.Provider value={user}>
      <MainLayout />
    </UserContext.Provider>
  );
}

function UserMenu() {
  const user = useContext(UserContext);
  return <span>{user.name}</span>;
}
```

Now the intermediate components do not need to pass `user` along.

That is the practical value of Context.

## What Context is not

Context is not:

- a full state management solution
- a replacement for all props
- a magic performance optimization
- a guarantee that only the components that use the value will re-render

Context does not magically solve state updates, caching, mutations, or server data.

It only supplies a value.

How you manage that value is a separate question.

## Context + useState is a common pattern

A common use of Context is to combine it with `useState` so a subtree can both read and update a shared value.

```javascript
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  return <button onClick={() => setTheme("dark")}>{theme}</button>;
}
```

This works well for values that are genuinely shared across a subtree and need to be updated by multiple consumers.

## The re-render risk

Context has a known downside: if the provided value changes, all components that read it via `useContext` may re-render.

```javascript
<ThemeContext.Provider value={{ theme, setTheme }}>
  <Header />
  <Main />
  <Footer />
</ThemeContext.Provider>
```

If the `value` object is recreated on every render, every consumer may see a new reference and re-render.

This is one reason Context can have a bad reputation.

The problem is not Context itself. It is passing unstable values into Context.

A common fix is to stabilize the value:

```javascript
const value = useMemo(() => ({ theme, setTheme }), [theme]);
```

Or to split large Contexts into smaller ones so a change in one part does not invalidate unrelated consumers.

The lesson is:

> Context is not bad. Careless Context values are bad.

## Splitting Context is often better than one big Context

A single big Context for everything tends to become a performance and organization problem.

```javascript
// not ideal
const AppContext = createContext();

// better in many cases
const AuthContext = createContext();
const ThemeContext = createContext();
const SettingsContext = createContext();
```

Why?

Because a change to settings should not necessarily re-render auth-related components.

Smaller Contexts let you isolate the parts of state that change together.

This is one of the most useful design decisions when using Context.

## Context is best for shared UI state, not for everything

Context is a good fit when:

- many parts of the subtree need the same value
- the value is not per-component
- the value changes together as a unit
- you want to avoid prop drilling through layers that do not need the value

Context is less good when:

- only one component needs the value
- the value is truly local
- the value is server data that should be cached and managed separately
- you are using Context as a global dump for every state in the app

Local state is often better for values that belong to one component.

Server state is often better handled by a data-fetching layer.

## A common misunderstanding

People say:

> Context makes components re-render too much

But the real issue is often:

- they put frequently changing values into a broad Context
- they passed a new object reference every render
- they used one Context for too many unrelated values

The fix is usually not "avoid Context." It is "use Context more carefully."

## When Context is the right call

- Theme settings
- Locale or language
- Authentication user and permissions, when shared across a subtree
- UI preferences like sidebar open/closed for a large layout region
- Shared mutable UI state for a feature area

These are values that tend to be read in many places and updated together.

## When Context is the wrong call

- Form field state that only one field needs
- Local open/closed state for a small isolated widget
- Per-component loading flags that do not need to be shared
- Every piece of application state, regardless of scope

If the value is only relevant to one branch, Context may be unnecessary overhead.

## Context does not make data global by magic

Context makes a value accessible to a subtree.

It does not make that value globally correct, globally cached, or globally owned.

If you put server data in Context without thinking about fetching, caching, or invalidation, you are using Context as an ad hoc data store, and that usually grows poorly.

## A practical rule

When deciding whether to use Context, ask:

```text
Does more than one distant part of the subtree need this?
Do they need it at the same time?
Does it change together?
Would prop drilling be clearly worse?
```

If yes, Context is likely appropriate.

If the answer is no, local state or props are probably better.

## A compact model

```text
Context = a way to provide a value to a subtree
useContext = a way to read that value
Context + useState = shared UI state in a subtree
large Context = frequent re-render risk
small Contexts = better isolation
Context is not a state manager by itself
```

## Interview questions you should be able to answer

### 1. What is Context used for?

Providing a value to a subtree so descendants can read it without props at every level.

### 2. Does Context prevent all re-renders?

No. If the Context value changes, consumers may re-render.

### 3. Why can one large Context be a problem?

Because changes to any part of it can re-render all consumers, even those that only care about a small part.

### 4. How can you reduce unnecessary re-renders from Context?

Split Contexts, stabilize values with memoization, and keep frequently changing values out of broad Contexts.

### 5. Is Context a state manager?

No. It is a way to share values. You still need to manage the state yourself, often with `useState` or another layer.

## Final mental model

```text
Context     = subtree-level dependency injection
Provider    = supplies a value
Consumer    = reads the value
Common use  = shared UI state
Common risk = too much in one Context, unstable values
Better habit = split Contexts, keep scope narrow
```

Or in one sentence:

> **Context is a way to share values across a subtree without threading props through every layer, and it works best for genuinely shared UI state used with narrow, stable Contexts.**

The next piece is how to tell whether something should be state at all, since many values people store as state can instead be derived.
