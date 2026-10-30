---
title: "Rendering and Reconciliation in React"
excerpt: "React does not patch the DOM directly from your component. It renders a tree, compares it to the last one, and then commits changes. This post explains the render phase, the commit phase, the role of keys, and what reconciliation actually decides."
tags: ["react", "rendering", "reconciliation", "virtual-dom", "keys", "commit"]
---

# Rendering and Reconciliation in React

React looks declarative, but the machinery underneath is what makes the model work.

The important question is not:

> How do I write this UI?

The important question is:

> What happens after React runs my component?

That answer has two parts:

1. Rendering and reconciliation
2. Commit

Once you understand those two parts, a lot of React behavior stops feeling like rules you memorized and starts feeling like consequences of a system.

## The two-phase model

A React update is not one atomic "change the DOM" action.

It is usually:

```text
1. Render phase
   → run components
   → produce a new tree description
   → compare with the previous tree

2. Commit phase
   → apply the changes to the DOM
   → run effects
```

The render phase is about figuring out what the UI should be.

The commit phase is about making the real world match that description.

This split is why React can pause, prioritize, or interrupt some work in advanced setups.

It also explains why rendering is not the same as painting.

## Rendering is not painting

A component render in React is not necessarily a visual paint.

Rendering means:

- React runs your component function or class
- React gathers the returned description
- React builds or updates the internal tree

That tree may eventually become DOM changes, but the render itself is a computation step.

This is why you can have expensive renders without seeing anything change yet.

And why "render" is a different word from "paint" or "display."

## The description tree

When your components run, React builds a tree of elements.

```javascript
function App() {
  return (
    <div>
      <h1>Title</h1>
      <PageContent />
    </div>
  );
}
```

After rendering, React has a tree like:

```text
div
  ├── h1
  │     └── "Title"
  └── PageContent
```

That tree is not the DOM. It is React's internal structure for describing the UI.

During reconciliation, React compares this new tree to the previous one.

## Reconciliation

Reconciliation is React's algorithm for deciding what changed.

It does not literally diff the DOM.

It diffs the tree of React elements.

```text
previous tree        new tree
    div                 div
      h1                 h1
      p           vs      article
```

React asks:

- Is the type the same?
- Are the props similar enough?
- Did children change?
- Did the structure change?

Then it decides:

- Keep the same host node and update it
- Replace a subtree
- Add new nodes
- Remove old nodes

This is the reconciliation process.

## Type matters

If the top-level type changes, React usually tears down the old subtree and builds a new one.

```javascript
// previous
return <div>...</div>;

// next
return <span>...</span>;
```

Because `div` and `span` are different host types, React will replace the node instead of trying to morph `div` into `span`.

If a component element changes type:

```javascript
// previous
<Profile />

// next
<Settings />
```

React typically unmounts the old component and mounts the new one.

That is because different component types are treated as different subtrees.

This is one reason component identity and tree shape matter.

## Keys are identity, not magic

Keys do not make React faster in some mystical way.

Keys tell React how to match children across renders.

```javascript
function List({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

When the list updates, React uses the key to decide:

- This `<li>` is the same as that one from before
- This one is new
- This one is gone

Without stable keys, React may fall back to index-based matching, which can cause incorrect DOM reuse or unnecessary re-renders when the list order changes.

A bad key pattern:

```javascript
items.map((item, index) => <li key={index}>{item.name}</li>);
```

That can work for static lists, but it breaks down when items are inserted, removed, or reordered.

The rule is not "always use keys." The rule is "use keys that reflect the real identity of the item."

## What reconciliation actually decides

Reconciliation decides the minimum set of changes to the React tree structure.

It decides:

- which host nodes stay
- which host nodes are updated
- which subtrees are replaced
- which children are added or removed

It does not directly decide:

- how to style the element
- what className string to use
- whether the user sees a flicker

Those are downstream results.

## Reconciliation is not the same as DOM diffing

React does not diff the live DOM node by node against your JSX.

It compares the React element tree against the previous React element tree.

That is more efficient and more predictable because React controls the description.

If React compared the DOM directly, it would have to cope with all the ways the DOM can change outside React.

Instead, React diffs its own representation.

That is one reason it can be unsafe to mutate the DOM under React's control in surprising places.

## The commit phase

Once React has decided what changed, it commits the changes.

In the browser:

- host nodes are created, updated, or removed
- the DOM is mutated
- refs may be populated
- effects run in a defined order

The commit phase is where the user sees the result.

This is also where side effects can run, because the DOM is now in its new shape.

## Render and commit are separate for a reason

The separation gives React flexibility.

```text
Render
  → compute the new tree
  → can be interrupted in advanced use cases

Commit
  → apply the DOM changes
  → usually must complete once started
```

This is why React can do things like defer rendering work in some situations, but still needs to commit the final result cleanly.

It is also why expensive component trees can be a problem even if the result is the same.

## State drives the process

A state change usually triggers a re-render.

```javascript
const [count, setCount] = useState(0);

setCount(count + 1);
```

React does not immediately touch the DOM.

It schedules a render.

During that render:

- the component runs again
- the new tree is produced
- reconciliation compares it with the old tree
- commit applies the difference

That is the full flow.

## A simple example

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

When the button is clicked:

1. `setCount` schedules an update
2. React re-renders `Counter`
3. React sees `<p>{count}</p>` changed from `0` to `1`
4. React updates the text node in the commit phase

The `<div>` and `<button>` may stay the same.

Only the changed part is updated.

That is the practical result of reconciliation.

## What changes and what stays

Reconciliation prefers to keep the same host node when the type is the same.

```javascript
// before
<div className="box">First</div>

// after
<div className="box">Second</div>
```

The `<div>` is reused. Only the text content and possibly the class are updated.

If the type changes:

```javascript
// before
<div>Content</div>

// after
<p>Content</p>
```

React replaces the element.

If the children change type or structure, React may replace those subtrees too.

So the rules are:

- same type → update if needed
- different type → replace subtree
- lists → match by key

## Common confusion: "React re-renders everything"

It is not accurate to say React re-renders everything on every state change.

React renders the affected parts of the tree.

If a state change is local, only that subtree re-renders in the sense that React re-runs the relevant components.

But React still reconciles the result, and the commit only touches what changed.

That is why performance is often about what you render, not about React being slow by default.

## Common confusion: "keys are for performance"

Keys are for identity and correct matching.

They can reduce unnecessary work, but their main job is correctness in dynamic lists.

If you treat keys as a performance hack, you can end up using them wrong.

## Common confusion: "virtual DOM is the same as the real DOM"

The virtual DOM is React's description tree, not a live DOM clone.

It is lighter than the real DOM because it is just data React controls.

It exists so React can reconcile changes cheaply before committing to the real DOM.

## Why this matters for component design

Once you understand reconciliation, a lot of component behavior becomes predictable.

- If you change the type of the returned element, React is more likely to replace the subtree.
- If you reorder list items without keys, React may reuse the wrong DOM nodes.
- If you force a new component type in the same spot, React may unmount the old one.

This is why it is good to keep tree shape stable unless you mean to change it.

## A mental model shortcut

```text
render → new tree
reconcile → compare trees, decide changes
commit → apply changes to the host
```

Or in one sentence:

> **React renders a tree from your components, diffs that tree against the previous one, and commits only the changes that the diff requires.**

The next piece is what props do in that model, because props are the main input that flows down the tree and drives what gets rendered.
