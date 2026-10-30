---
title: "Server State Libraries as Shared Infrastructure in React"
excerpt: "Server-state libraries like TanStack Query are often described as magic, but they are really a structured way to solve caching, deduping, loading, error handling, and invalidation. This post explains what they do, what they do not do, and when they are worth using."
tags: ["react", "server-state", "tanstack-query", "react-query", "caching", "invalidation", "mutations"]
---

# Server State Libraries as Shared Infrastructure in React

Server-state libraries are popular for a reason.

They take a problem that is easy to underestimate and make it more manageable.

But they are not magic, and they are not a replacement for understanding the underlying ideas.

This post is about what these libraries actually do, and where they fit.

## The problem they solve

When you fetch data in React by hand, you usually end up solving the same set of problems over and over:

- loading state
- error state
- caching
- deduping requests
- refetching
- invalidation after mutations
- background refresh
- request retries
- pagination and infinite queries
- optimistic updates

Each one is manageable on its own.

Together they become a lot of boilerplate.

A server-state library tries to make that boilerplate consistent and reusable.

## What the library does

A library like TanStack Query gives you a framework for server data.

Roughly, it provides:

- a way to fetch data and expose it as React state
- a cache keyed by query identifiers
- deduping of in-flight requests
- automatic refetching in some situations
- invalidation and refetching after mutations
- loading and error states
- retry behavior
- a two-step data flow: query for reads, mutation for writes

This is the core value.

It is not just "fetch data."

It is "manage server data as a shared, cacheable, refreshable resource."

## Query keys matter

In these libraries, you usually describe a query with a key.

```javascript
const { data, isLoading } = useQuery({
  queryKey: ["users", userId],
  queryFn: () => fetchUser(userId)
});
```

The key matters because it is how the library identifies cached data.

If two components use the same key, they usually share the same cache entry.

That is good.

It means:

- duplicate fetches are reduced
- the cache is centralized
- invalidation can target keys or patterns

A good key is stable and specific.

A bad key is too vague or too dynamic.

```javascript
// too vague
queryKey: ["data"]

// better
queryKey: ["users", userId]
```

The key should describe what the query represents.

## Mutations are different from queries

In server-state libraries, mutations are the write side.

```javascript
const mutation = useMutation({
  mutationFn: (updates) => updateUser(userId, updates)
});
```

Mutations are usually not cached the same way as queries.

They are actions.

They may:

- update the cache directly
- invalidate related queries
- trigger a refetch
- support optimistic updates

This split between query and mutation is important.

Queries are for reading data.

Mutations are for changing data.

Treating them differently helps keep the mental model clean.

## Invalidation is the big win

One of the biggest practical benefits is invalidation.

Instead of manually clearing caches and triggering refetches everywhere, you can say:

> after this mutation, invalidate these queries

For example:

```javascript
const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }
});
```

This says:

> after updating a user, any cached query related to users may be stale

That is a powerful idea because it decouples the mutation from the exact list of affected UI parts.

The mutation does not need to know every component that uses the data.

It just says which data is now stale.

## Loading and error states become more uniform

With a library, loading and error states often follow a consistent pattern.

```javascript
const { data, isLoading, error } = useQuery(...);
const mutation = useMutation(...);
```

This can make the UI code more uniform.

You do not have to invent a new state shape for every fetch.

That does not mean the UI is automatic.

You still have to decide how to show loading, error, empty, and success.

But the state management is more consistent.

## Background refetching is part of the model

Many server-state libraries can refetch data in the background.

For example:

- when the window refocuses
- when the network reconnects
- when a query is considered stale
- when the user returns to a resource

This is useful because server state can become stale.

A library can make stale-while-revalidate behavior easier to express.

Again, this is not magic. It is a policy for handling cache freshness.

## Optimistic updates are possible, but not required

Optimistic updates are when the UI is updated before the server responds.

A library can help with that.

```javascript
const mutation = useMutation({
  mutationFn: createTodo,
  onMutate: () => {
    // optimistically add the new todo
  },
  onError: () => {
    // roll back
  }
});
```

Optimistic updates make the UI feel faster.

But they are not required.

Sometimes it is better to wait for the server.

The library gives you the tools, not a rule.

## A library is not a data model

A server-state library is not a replacement for thinking about your data model.

If your queries and mutations are messy, the library will make the mess more consistent, not disappear.

If your cache keys are inconsistent, invalidation will be confusing.

If your mutations do not map cleanly to your queries, invalidation will be incomplete.

So the library helps, but the design still matters.

## You still need to decide the policy

The library does not decide everything for you.

You still decide:

- when to fetch
- which keys to use
- when data is stale
- when to invalidate
- whether to use optimistic updates
- when to retry
- what to show while loading
- what to show on error

These are policy decisions, not just technical ones.

A library can enforce consistency, but it cannot make the product decisions for you.

## When a library is worth using

A server-state library is often worth using when:

- you have many queries
- you need caching and deduping
- you need consistent invalidation after mutations
- you want background refetching
- you want a standard pattern across the app
- the manual boilerplate is becoming painful

If you only have one or two simple fetches, a library may be overkill.

If your data is mostly static or local, it may not be necessary.

## When it may be overkill

A library may be overkill when:

- the app has very few async reads
- the data does not need caching
- the mutation and query patterns are trivial
- the team is small and the app is simple

In those cases, hand-rolled fetching may be simpler.

## A common misunderstanding

People sometimes think a server-state library makes data fetching "solved" in a universal way.

It does not.

It solves a category of problems more consistently.

It does not remove the need to think about data shape, caching strategy, invalidation scope, or UI policy.

If you use it without understanding the underlying ideas, you can still build a confusing system.

## A common misunderstanding 2

Some people think the library is only for "big apps."

That is not quite right.

The real question is whether the app has the problems the library solves.

If it does, the library can help even in a small app.

If it does not, the library may add more structure than you need.

## A practical rule

Use a server-state library when the app has real server-state concerns and you want a shared, consistent way to handle them.

Do not use it as a default dependency if your app does not need caching, invalidation, or deduping.

And even when you use it, understand what it is doing for you.

## A compact model

```text
server-state library = shared infrastructure for async reads and writes
queries = reads, cached by key
mutations = writes, trigger invalidation or refetch
dedup = avoid duplicate in-flight requests
invalidation = mark related data stale
background refetch = refresh stale data automatically
optimistic update = update UI before server confirms
policy = you still decide when and how to fetch and invalidate
```

## Interview questions you should be able to answer

### 1. What problem do server-state libraries solve?

They manage caching, deduping, loading, error handling, invalidation, and refetching for server data in a consistent way.

### 2. What is the difference between a query and a mutation?

A query reads data. A mutation changes data.

### 3. Why are query keys important?

They identify cached data and allow deduping and invalidation.

### 4. What is invalidation?

Marking cached data as stale so it can be refetched when needed.

### 5. Does a library remove the need to think about data fetching policy?

No. You still decide when to fetch, when to invalidate, and how to handle loading and error states.

## Final mental model

```text
server-state library = structured caching and invalidation for async data
query = cached read by key
mutation = write that can invalidate or update cache
dedup = one request for many consumers
invalidation = the main value
background refetch = freshness policy
optimistic update = optional faster UX
you still decide = cache keys, staleness, retry, UI policy
```

Or in one sentence:

> **Server-state libraries like TanStack Query are shared infrastructure for managing async data consistently, but they do not remove the need to think about caching, invalidation, query keys, and UI policy.**

That finishes Arc 6. Now I'll write Arc 7 — Component architecture.
