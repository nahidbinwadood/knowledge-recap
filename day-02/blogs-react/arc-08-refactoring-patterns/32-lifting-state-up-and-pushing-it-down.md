---
title: "Lifting State Up and Pushing State Down in React"
excerpt: "State often starts in the wrong place. Sometimes it needs to move up so related components can share it; sometimes it needs to move down so a component is not burdened with values it does not need. This post explains both moves and when each one makes sense."
tags: ["react", "state", "lifting-state", "component-design", "refactoring", "propagation"]
---

# Lifting State Up and Pushing State Down in React

State ownership changes.

That is normal.

A React app is not built once and frozen.

The tree changes.

The components change.

The responsibilities change.

So state often needs to move.

Two common moves are:

- lifting state up
- pushing state down

Both are about placing state closer to the components that actually need it.

## When state starts in the wrong place

A common beginner pattern is to put state where it first showed up, not where it belongs.

For example, if a child needs a value and a way to change it, but the value lives only in another child, the components can become awkward.

Another common pattern is the opposite: state lives very high up, even though only one small subtree uses it.

Both can be improved by moving the state.

## Lifting state up

Lifting state up means moving state from a lower component to a common ancestor so that multiple children can share it.

Why do this?

Because two or more components need the same source of truth.

### A typical situation

Imagine two sibling inputs that need to stay in sync.

If each has its own state, they can drift apart.

```javascript
// not ideal when they should be coordinated
function FieldA() {
  const [value, setValue] = useState("");
}

function FieldB() {
  const [value, setValue] = useState("");
}
```

If the value should be shared, a better place for it is the parent.

```javascript
function Parent() {
  const [value, setValue] = useState("");

  return (
    <div>
      <FieldA value={value} onChange={setValue} />
      <FieldB value={value} onChange={setValue} />
    </div>
  );
}
```

Now both fields read from the same state and write to the same state.

That is lifting.

## A more realistic example

Suppose you have a search form and a results list.

```javascript
function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div>
      <SearchForm query={query} onChange={setQuery} />
      <Results query={query} />
    </div>
  );
}
```

The query is owned by the page because both pieces need it.

The form edits it.

The results display based on it.

That is a natural lift.

## Why lifting helps

Lifting helps when:

- multiple components need the same value
- there should be one source of truth
- siblings need to stay consistent
- the parent is the right scope for the shared concern

Without lifting, the components may copy state, duplicate logic, or communicate through awkward side channels.

## What lifting does not mean

Lifting does not mean "put every piece of state in the top component."

That would make the top component a giant owner of everything.

A better rule is:

```text
lift state to the lowest component that needs to share it
```

Not to the highest component in the tree.

## Pushing state down

Pushing state down is the reverse.

If a component is receiving a value through props even though only a deeper child uses it, the state may belong deeper.

### A typical situation

```javascript
function Page() {
  const [details, setDetails] = useState(null);
  return <Layout details={details} />;
}

function Layout({ details }) {
  return <main><DetailPanel details={details} /></main>;
}

function DetailPanel({ details }) {
  return <span>{details?.title}</span>;
}
```

Here `details` passes through `Layout` even though `Layout` does not really need it.

If only `DetailPanel` cares, the state could live in or near `DetailPanel`.

```javascript
function Page() {
  return (
    <main>
      <DetailPanel />
    </main>
  );
}

function DetailPanel() {
  const [details, setDetails] = useState(null);
  ...
}
```

That is pushing state down.

## When pushing down helps

Pushing down helps when:

- a value is passed through components that do not use it
- the value is only relevant to a small subtree
- the intermediate component should not know about it
- the state is local to that part of the UI

This makes the dependency graph cleaner.

## A key distinction

Not every value that comes from above should be pushed down.

Some values are shared intentionally.

For example, a user, a theme, or a locale may legitimately appear at many levels.

The question is whether the value is truly shared or merely forwarded.

## How to decide the right level

Ask:

```text
Who needs this value directly?
Who needs to change it?
Is this shared by several unrelated parts of the tree?
Or is it only used in one place?
```

If the answer is "one place," the state probably belongs there.

If the answer is "several places," the state probably belongs higher.

If the answer is "it is forward all the way down," the state is likely too high.

## A pattern: start local, lift when needed

A common healthy pattern is:

1. Start with local state where the value first appears.
2. If a parent needs it, lift it just enough to share.
3. If a deeper component needs it too, lift it to the common owner.
4. If it is only used in one subtree, keep it there.

This avoids two extremes:

- state scattered across many components incorrectly
- state centralized too early in one giant parent

## A pattern: extract and move

Sometimes the move is not just about state but about the whole cluster of related behavior.

For example, a form that is deeply nested may be easier to understand if it owns its own state and only reports back when needed.

That could mean:

- moving the form state down into the form component
- lifting only the final result or submission event
- leaving intermediate fields alone

This keeps the form self-contained.

## What about controlled vs uncontrolled?

Lifting and pushing also connect to control.

If a parent needs to control the input value, the state should be lifted.

If the component can manage its own value internally, it may be more natural to keep the state local.

So control is often the real reason for the move.

## A practical rule of thumb

```text
lift state when multiple components need the same source of truth
push state down when it is irrelevant to the components on the way
do not lift everything to the top
do not keep shared state in multiple places
if the tree is forwarding props it doesn't use, consider moving the state lower
```

## A common mistake: over-lifting

Over-lifting happens when developers put too much state in a top component "just in case."

That makes the top component heavy and makes propagation noisy.

```text
bad pattern: state for every detail lives in the root
better pattern: state lives where it is shared or used
```

## A common mistake: too much local isolation

The other mistake is keeping everything local even when sharing is needed.

That can lead to duplicated state and inconsistency.

Two siblings with their own copies of the same value may get out of sync.

## A common mistake: confusing ownership with visibility

A component may be visible near the value but not own it.

Ownership is about responsibility, not about where the value happens to appear in the tree.

A parent can own state for its children.

A child can own state for itself.

The tree structure is not the only factor.

## A compact summary

```text
lifting = move state up to a common owner
pushing down = move state closer to where it is used
rule = place state at the lowest shared owner, or at the local owner
over-lift = too much state too high
too local = duplicated state when sharing is needed
best shape = state near the components that need it
```

Or in one sentence:

> **In React, state should usually live at the lowest level that shares it; lift it up when siblings need the same value, and push it down when it is only needed deeper in the tree.**

The next piece is about a related topic: when to use composition instead of large switch-y components with lots of variant props.
