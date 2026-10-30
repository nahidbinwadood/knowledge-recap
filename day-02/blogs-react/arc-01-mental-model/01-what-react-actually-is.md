---
title: "What React Actually Is"
excerpt: "React is not a DOM library and not a template engine. It is a system for turning UI state into rendered output and keeping that output in sync when state changes. This post separates the mental model from the API."
tags: ["react", "mental-model", "render", "state", "components"]
---

# What React Actually Is

React is often described as a library for building user interfaces.

That is true, but not specific enough.

A more precise description is:

> React is a system for describing UI as a function of state, and for updating that UI when state changes.

Everything else — components, hooks, JSX, the virtual DOM — is a way to make that sentence work in practice.

## UI as a function of state

The core idea is simple.

```javascript
function UserProfile({ user }) {
  return <div>{user.name}</div>;
}
```

Given the same `user`, this component always produces the same UI description.

That is the "function of state" part.

```text
state → UI description
```

React does not own state. It does not manage your entire data model. It takes some piece of state or props, turns it into a UI description, and then renders that description into the DOM.

## React is not a DOM library

jQuery is a DOM library. It gives you direct access to the DOM.

React does not.

React owns a description of what the UI should look like. It decides how to translate that description into real DOM operations.

```text
Your component
    │
    ▼
UI description
    │
    ▼
React reconciles it with the previous description
    │
    ▼
React applies the minimal DOM changes
```

You do not call `querySelector` or `appendChild` to build your UI.

You describe what you want. React figures out how to make the DOM match.

This is a big shift.

In a DOM library, you tell the browser what to do.

In React, you tell React what you want, and React tells the browser what to do.

## React is not a template engine

Template engines like Handlebars or early server-side templating work by taking data and producing HTML once.

```html
<div>{{ user.name }}</div>
```

That HTML is the end product.

React is different because the UI is expected to change over time.

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

The component does not just render once and disappear. It can re-render many times as state changes.

React's job is not "render this once." It is "keep the UI in sync with the state."

## What React owns

React owns three things in particular.

1. The description of the UI
2. The reconciliation process
3. The commit to the DOM or Native layer

### 1. The UI description

When a component runs, it returns a description of UI.

In JSX, that looks like:

```javascript
return <div />;
```

But JSX compiles to:

```javascript
return React.createElement("div");
```

That description is not the DOM. It is a lightweight representation of what should exist.

### 2. Reconciliation

When state changes, React does not immediately touch the DOM.

First it re-runs the affected components and produces a new UI description.

Then it compares the new description with the previous one.

That comparison is the reconciliation process.

React uses that comparison to decide what changed and what to update.

### 3. Commit

After reconciliation, React applies the changes to the actual rendering target.

In the browser, that means DOM mutations.

In React Native, that means native view updates.

The commit phase is where the screen actually changes.

```text
render phase → description + reconciliation
commit phase → apply changes to the real UI
```

This split matters later when you talk about rendering behavior, effects, and performance.

## What React does not own

React does not own:

- your business logic
- your data fetching strategy
- your global application state
- the DOM directly
- your routing
- your auth system

You can use React with any of those. But React does not provide them.

React is concerned with:

> Turning state into UI, and keeping that UI consistent.

That is a smaller job than "build the whole app."

A lot of confusion comes from expecting React to be a full application framework. It is not. It is a UI system.

## The component as the unit of description

React organizes UI into components.

A component is a function that takes inputs and returns a UI description.

```javascript
function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}
```

Inputs:

- props
- state
- context
- refs
- hooks

Output:

- a UI description

That is the contract.

A component is not:

- a controller
- a service
- a DOM element
- a template file
- a class that knows about the browser

It is a piece of UI logic that reacts to inputs.

## Implications of the model

Once you see React as a UI function, a few things become clearer.

### Reason 1: UI should be predictable

If the same inputs produce the same UI description, the UI becomes easier to reason about.

This is why React pushes you toward declarative code.

```javascript
// declarative
return <div>{user.name}</div>;

// imperative
const div = document.createElement("div");
div.textContent = user.name;
```

The declarative version says what the UI is. The imperative version says how to build it.

React favors the declarative version because it is easier to keep in sync with state.

### Reason 2: Updates are rewrites, not patches

When state changes, React does not usually say "change this one attribute."

It re-renders the affected parts of the tree and reconciles the result.

That is why React apps are structured around state changes.

If a button click changes a value, the UI is rebuilt from the new state.

You do not manually update each DOM node.

### Reason 3: You think in state transitions

A lot of React code is easier to understand when you think:

> What state am I in?
> What should the UI look like in that state?
> What changes the state?

That question does not always have a simple answer, but it is the right starting point.

## The common misunderstanding

Many people think of React as:

> A way to attach behavior to DOM elements.

That is too narrow.

React is not primarily about attaching handlers to DOM nodes.

It is about describing the UI in terms of state and letting React manage the result.

The handlers are part of the system, but they are not the point.

## Another misunderstanding

Some people think React is just "faster DOM manipulation."

It is not faster DOM manipulation.

React often does more work than raw DOM code in simple cases.

The benefit is not raw speed. It is predictability and maintainability at scale.

For tiny interactive bits, direct DOM code can be simpler.

For a large UI with many interacting pieces, React's model usually pays off because it reduces the amount of manual coordination you have to do.

## A simple way to remember it

```text
React does not build the DOM for you.
React does not fetch your data.
React does not manage your whole application.

React does:
  take state
  describe UI
  keep the description in sync with changes
```

Or in one sentence:

> **React is a UI system that turns state into a description of the screen and keeps that description consistent when state changes.**

Once that is clear, the next question is:

What exactly is a component, and what is it that components return?

That is the next piece.
