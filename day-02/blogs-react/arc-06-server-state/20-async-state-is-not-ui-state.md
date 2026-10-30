---
title: "Async State Is Not UI State in React"
excerpt: "Data that comes from the server is not the same kind of state as a toggle, a draft, or a selected tab. This post explains why async state has its own shape, why loading/error/empty/success need explicit thinking, and why ad-hoc boolean flags break down quickly."
tags: ["react", "async-state", "server-state", "loading", "error", "empty-state", "state"]
---

# Async State Is Not UI State in React

A lot of React code treats all state the same way.

```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

That can work for a while, but async state has its own structure, and it is easy to lose track of it when you mix it with UI state.

This post is about the difference between async state and UI state, and why that difference matters.

## UI state is usually about the interface

UI state is state that helps the UI behave.

Examples:

- is the modal open?
- which tab is active?
- is the accordion expanded?
- what is the user typing in this draft field?
- which item is selected?

This state often has a clear owner and a clear scope.

It is often local to one component or one small subtree.

It usually does not need caching, deduplication, or background refresh.

## Async state is about data that comes from outside

Async state is state that originates outside the UI.

Examples:

- a list of users from an API
- a product detail page
- a search result
- a user profile
- a dashboard chart

This state usually comes from a server or another async source.

It has a lifecycle:

- not requested
- loading
- loaded
- error
- maybe stale later

That lifecycle is different from the lifecycle of a toggle.

## Why the difference matters

If you treat async state like UI state, a few things go wrong.

You may forget:

- that the data can be stale
- that loading is not a one-time thing
- that errors can be retryable
- that empty results are a real state, not just "null"
- that multiple components may need the same data
- that refreshing data is part of the contract

A toggle does not usually need to be refreshed.

A user list usually does.

## Loading is not a boolean with no context

A common pattern is:

```javascript
const [loading, setLoading] = useState(false);
```

That is fine at first.

But async state usually needs more context than "loading or not."

For example:

- is this the initial load?
- is this a refresh?
- is this a background update?
- is this a retry after an error?

The UI may need to show different things in each case.

The spinner for the first load may be different from the indicator for a background refresh.

## Error is not just "setError(true)"

Errors in async state are also more varied than a simple flag.

```javascript
const [error, setError] = useState(null);
```

What kind of error is it?

- network error
- timeout
- 404
- 401
- 500
- validation error from the server
- permission error

The UI may need to handle each differently.

A 401 might mean "redirect to login."

A 404 might mean "show empty state."

A network error might mean "retry button."

If all errors are stored as one blob, the UI has to guess.

## Empty is a real state

One of the most overlooked parts of async state is empty.

If a query returns no results, that is not the same as "loading failed."

It is also not the same as "not loaded yet."

```text
not requested
loading
empty
data
error
```

Each of those can have a different UI.

If you treat empty as null, you end up either showing a spinner forever or showing a confusing "no data" message too early.

## Async state is often shared

UI state is often local.

Async state is often shared.

If one component fetches a user list, another component may also need it.

If both fetch independently, you can get:

- duplicate requests
- inconsistent data
- race conditions
- wasted bandwidth

That is one reason async state often benefits from a shared layer.

Local state is usually fine inside one component. Shared async state is where things become more interesting.

## Async state can go stale

UI state is usually only wrong if you set it wrong.

Async state can be correct at one moment and stale later.

A list of items can change on the server.

A profile can be updated by another device.

A dashboard can become outdated.

This means async state often needs a refresh strategy, not just a fetch-on-mount strategy.

That can mean:

- polling
- invalidation after mutations
- manual refresh
- background refetching
- cache expiry

This is a different kind of thinking from "set state and forget it."

## The boolean state trap

A common mistake is to model async state with many booleans.

```javascript
const [loading, setLoading] = useState(false);
const [loaded, setLoaded] = useState(false);
const [error, setError] = useState(false);
const [hasData, hasData] = useState(false);
```

This can work, but it is easy to make the flags disagree.

Is `loaded` true when there is an error?

Is `hasData` true when loading?

Is `error` still true after a successful retry?

These questions are hard to keep consistent with independent booleans.

A better pattern is often a small explicit state model.

```javascript
const [status, setStatus] = useState("idle");
// idle, loading, success, error
```

Or a combined object:

```javascript
const [state, setState] = useState({
  status: "idle",
  data: null,
  error: null
});
```

This keeps the related pieces together.

## Derived async UI is usually better than storing everything

You can often derive UI from async state instead of storing many flags.

```javascript
const isLoading = status === "loading";
const hasError = status === "error";
const hasData = status === "success" && data !== null;
const isEmpty = status === "success" && Array.isArray(data) && data.length === 0;
```

This reduces the chance of inconsistent flags.

If the status changes, the derived UI changes with it.

## Async state is not just "data"

Async state is a combination of:

- the data
- the status
- the error
- the time it last loaded
- maybe the request parameters
- maybe the cache key

If you only store `data`, you lose the context.

If you store `data` and `loading`, you may lose the error.

If you store all three but nothing else, you may not know whether the data is fresh.

The exact shape depends on the app, but the point is that async state is richer than a single variable.

## A practical rule

If the state represents something the user sees because of a UI interaction, it is probably UI state.

If the state represents something fetched from outside, shared across the app, cacheable, retryable, or refreshable, it is probably async state.

Those two should not always be managed the same way.

## A simple example

```javascript
function UserProfile({ userId }) {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus("loading");
    fetchUser(userId)
      .then((user) => {
        setUser(user);
        setStatus("success");
      })
      .catch((err) => {
        setError(err);
        setStatus("error");
      });
  }, [userId]);

  if (status === "loading") return <Spinner />;
  if (status === "error") return <ErrorMessage error={error} />;
  if (!user) return <Empty />;

  return <UserCard user={user} />;
}
```

This separates the async state from UI-only state.

The component renders differently based on the async lifecycle.

## A bad example

```javascript
function BadProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);

  // lots of unrelated flags that need to stay in sync
}
```

This is the kind of code that becomes fragile quickly.

## A compact model

```text
UI state = interface behavior, usually local
async state = outside data, lifecycle, cache, refresh
async lifecycle = idle, loading, success, error, empty
boolean trap = many unrelated flags
better model = explicit status + data + error
shared async state = may need a shared layer
staleness = async state can become outdated
```

## Interview questions you should be able to answer

### 1. What is the difference between UI state and async state?

UI state is about interface behavior. Async state is about data from outside the UI with its own lifecycle.

### 2. Why is empty a real state?

Because no results is not the same as loading or error, and it may need its own UI.

### 3. Why can boolean flags be a bad model for async state?

Because they can get out of sync and make it hard to know the actual status.

### 4. Why does async state often need refresh logic?

Because outside data can change and become stale over time.

### 5. When is async state more like shared state than local state?

When multiple parts of the UI need the same data and you want to avoid duplicate fetches.

## Final mental model

```text
UI state = local, interface-driven
async state = external, lifecycle-driven
async state = status + data + error + freshness context
empty = a real state, not null
boolean trap = fragile, easy to desync
better = explicit model or shared async layer
```

Or in one sentence:

> **Async state is not just another variable; it has a lifecycle, can be shared, can go stale, and is better modeled with explicit status and error handling than with a pile of unrelated booleans.**

The next piece is one of the most common async patterns in React: data fetching and the waterfalls it creates.
