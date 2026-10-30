---
title: "Caching and Invalidation by Hand in React"
excerpt: "Caching sounds simple until you need to refresh data, avoid duplicate requests, and keep the UI consistent after mutations. This post explains the basic ideas behind caching and invalidation, how they can be done without a library, and why invalidation is usually the harder part."
tags: ["react", "caching", "invalidation", "server-state", "async", "data-fetching"]
---

# Caching and Invalidation by Hand in React

Caching is one of those ideas that sounds easy until you actually build it.

At first it looks like:

> store the result, use it next time

But real caching needs more than that.

It needs to answer:

- When is the stored data still valid?
- When should it be refreshed?
- What happens after a mutation?
- How do you avoid duplicate requests?
- What happens when the same data is needed in multiple places?

This post is about those questions and how they can be handled without assuming a library does everything for you.

## Why caching exists

Caching exists because fetching every time is usually wrong.

If a user list is needed in three components, fetching it three times is wasteful.

If a page is navigated away from and back quickly, re-fetching from scratch can be unnecessary.

If data rarely changes, refetching on every mount can make the app slower and noisier.

Caching is the idea that some data is worth keeping around for a while.

## The simplest cache: a module-level variable

The simplest cache in JavaScript is just a variable.

```javascript
let userCache = null;

async function getUser(id) {
  if (userCache) {
    return userCache;
  }
  const res = await fetch(`/users/${id}`);
  userCache = await res.json();
  return userCache;
}
```

This works for a single user, but it is crude.

It does not handle:

- multiple users
- cache expiry
- invalidation after updates
- duplicate in-flight requests
- clearing the cache when it is no longer relevant

So it is a starting point, not a real solution.

## A better shape: a map cache

A more useful cache is a map.

```javascript
const cache = new Map();

async function fetchItem(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  const data = await fetch(`/items/${id}`).then((r) => r.json());
  cache.set(id, data);
  return data;
}
```

This can handle multiple keys.

But the same issues remain.

What if the item changes on the server?

What if the cache should expire?

What if the same request is made while the first one is still in flight?

## Duplicate request problem

A common problem in hand-rolled caching is duplicate requests.

```javascript
function ComponentA() {
  const [data] = useFetch("/item/1");
  return <div>{data}</div>;
}

function ComponentB() {
  const [data] = useFetch("/item/1");
  return <div>{data}</div>;
}
```

If both components fetch independently, you can get two requests for the same URL.

A cache can solve this by deduping.

One pattern is to store a pending promise.

```javascript
const pending = new Map();

async function fetchWithDedup(url) {
  if (pending.has(url)) {
    return pending.get(url);
  }
  const promise = fetch(url).then((res) => res.json());
  pending.set(url, promise);
  try {
    const data = await promise;
    return data;
  } finally {
    pending.delete(url);
  }
}
```

This helps when multiple parts of the UI request the same data at the same time.

## Invalidation is the harder part

Caching is easy to start. Invalidation is where it gets hard.

Invalidation means deciding when cached data is no longer trustworthy.

Common reasons to invalidate:

- a mutation changed the data
- the data is old enough to refresh
- the user navigated and the context changed
- the app explicitly requested a refresh

The problem is that invalidation is not always obvious.

If a user updates their profile, which caches are affected?

- the profile cache
- any list that includes the profile
- any widget that shows the same data

If you only invalidate the profile cache, other parts of the UI may still show stale data.

This is why invalidation is often the hardest part of caching.

## A simple invalidation strategy

A common simple strategy is to invalidate after a mutation.

```javascript
async function updateUser(id, updates) {
  await fetch(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates)
  });
  invalidateUserCache(id);
}
```

This says:

> when the user is updated, the cached version is no longer valid

That is straightforward when the cache keys are clear.

If the cache is keyed by user ID, invalidation is easy.

If the cache is keyed by a complex query, invalidation is harder.

## Query-key invalidation

If you cache results by query, invalidation becomes more interesting.

```javascript
const cache = new Map();

async function fetchUsers(query) {
  const key = `users:${query}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = await fetch(`/users?q=${query}`).then((r) => r.json());
  cache.set(key, data);
  return data;
}
```

Now invalidation may need to clear all keys that include a certain resource.

For example, updating a user might invalidate any cache that includes that user.

That can be done with a pattern like:

```javascript
const userTags = new Set();

function tagKey(key, tags) {
  // associate key with tags for later invalidation
}

function invalidateTags(tags) {
  // clear all cached keys associated with those tags
}
```

This is the basic idea behind tag-based invalidation.

It is more flexible than a simple key-based cache, but it is also more work to build by hand.

## Time-based staleness

Some caches expire after a time.

```javascript
const cache = new Map();

function getCached(key, fetchFn, ttl) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < ttl) {
    return entry.data;
  }
  const data = await fetchFn();
  cache.set(key, { data, time: Date.now() });
  return data;
}
```

This is useful when data does not change often and you are okay with slightly stale data for a short window.

It is not precise invalidation, but it can be enough for some cases.

## Manual refresh

Sometimes invalidation is manual.

The user clicks "Refresh."

The app refetches and updates the cache.

This is simple and predictable.

It is also sometimes the right choice when automatic invalidation is too complex.

## Cache consistency and mutations

The hardest cache problems usually involve mutations.

A mutation changes server data.

The cache must reflect that change.

There are a few common approaches:

- refetch after mutation
- update the cache optimistically
- update the cache after the mutation succeeds
- invalidate and let the next fetch bring the new data

Each has tradeoffs.

Refetching is simple and safe, but can be slower.

Optimistic updates feel faster, but you have to handle rollback if the mutation fails.

Invalidation is simple if your cache keys are well designed, but can leave the UI briefly stale.

## Optimistic update example

```javascript
function toggleTodo(id) {
  const previous = todos.find((t) => t.id === id);
  setTodos((prev) =>
    prev.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    )
  );

  fetch(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ completed: !previous.completed })
  }).catch(() => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? previous : t
      )
    );
  });
}
```

This makes the UI feel immediate.

If the request fails, the cache is rolled back.

This is a common pattern, but it requires careful error handling.

## The real difficulty: knowing what to invalidate

The core challenge is not storing data.

It is knowing when stored data is wrong.

If your app has a small, well-defined data model, invalidation can be simple.

If your app has many overlapping queries and shared resources, invalidation can become a design problem.

That is why many teams use a server-state library for caching and invalidation.

The library is not magic. It is a structured way to solve the same problem.

But the underlying ideas are still the same.

## A practical rule

When caching by hand, start with the simplest thing that works.

- cache by key
- invalidate after known mutations
- dedup in-flight requests
- add time-based expiry only if needed
- add tag-based invalidation only if the app needs it

Do not build a full cache system until you know you need one.

## A compact model

```text
cache = stored result for reuse
dedup = avoid duplicate in-flight requests
invalidation = decide when cached data is no longer valid
mutation invalidation = clear cache after updates
time-based expiry = refresh after a duration
tag-based invalidation = clear related cache entries
optimistic update = update UI before server confirms
central problem = knowing what is stale
```

## Interview questions you should be able to answer

### 1. Why cache data in a frontend app?

To avoid duplicate fetches and to make repeated access faster and cheaper.

### 2. Why is invalidation often harder than caching?

Because you have to decide when cached data is no longer correct, which depends on mutations and data relationships.

### 3. What is a common duplicate-request problem?

Multiple components requesting the same data at the same time and triggering separate fetches.

### 4. What is an optimistic update?

Updating the UI before the server confirms the change and rolling back if it fails.

### 5. Why can tag-based invalidation be useful?

Because it lets you invalidate all cache entries related to a resource, not just one exact key.

## Final mental model

```text
cache = keep data for reuse
dedup = one request for many consumers
invalidation = clear or refresh when data changes
mutation = the main trigger for invalidation
time-based = simple but imprecise
tag-based = more flexible, more work
optimistic update = fast UI, needs rollback
real challenge = knowing what is stale
```

Or in one sentence:

> **Caching is about reusing fetched data, but the hard part is invalidation: knowing when that cached data is no longer correct and deciding how to refresh or clear it.**

The next piece is how server-state libraries fit into this picture and what they actually solve.
