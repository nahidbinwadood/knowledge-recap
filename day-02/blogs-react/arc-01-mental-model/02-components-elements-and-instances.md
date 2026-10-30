---
title: "Components, Elements, and Instances in React"
excerpt: "People talk about components as if they were DOM nodes or objects. They are not. This post separates components, elements, and instances, and explains why the distinction matters for rendering, composition, and identity."
tags: ["react", "components", "elements", "instances", "composition", "mental-model"]
---

# Components, Elements, and Instances

React terminology is one of the most common sources of confusion.

People say:

- "I created a component instance"
- "This component is mounted"
- "The element is rendered"

Those phrases sometimes mean the same thing informally, but they are not the same thing technically.

A clear separation helps a lot.

## Three things with different jobs

The three ideas are:

1. Component
2. Element
3. Instance

A component is a piece of UI logic.

An element is a description of what should appear.

An instance is the live thing React is tracking during rendering.

These are not synonyms.

## Components are functions or classes

A component is the thing you write.

```javascript
function Button({ label }) {
  return <button>{label}</button>;
}
```

Or, in older code:

```javascript
class Button extends React.Component {
  render() {
    return <button>{this.props.label}</button>;
  }
}
```

Either way, a component is a definition.

It is not yet a piece of the screen.

It is code that can produce UI when given the right inputs.

A component is like a function.

```javascript
const el = <Button label="Save" />;

// roughly means
const el = React.createElement(Button, { label: "Save" });
```

The component itself is the function. The element is the call.

## Elements are descriptions

An element is not a component.

An element is a plain object that describes something React should render.

```javascript
const element = React.createElement("div", null, "Hello");
```

This is conceptually similar to:

```javascript
{
  type: "div",
  props: {
    children: "Hello"
  }
}
```

For a component element:

```javascript
const element = React.createElement(Button, { label: "Save" });
```

It describes:

- what type to render: `Button`
- what props to pass: `{ label: "Save" }`

That is all.

An element is a cheap description. It is not:

- a DOM node
- a component instance
- a component class
- a live piece of UI

It is a recipe.

React reads the recipe and decides what to do with it.

This is why JSX looks like HTML but is not HTML.

```javascript
return <button />;
```

That is not a DOM element. It is an element object.

## Instances are the live things React tracks

This is where people get confused, because the word "instance" is used in a few ways.

In class components, an instance was a real JavaScript object.

```javascript
class Button extends React.Component {
  // `this` is the instance
  handleClick() {
    console.log(this.props.label);
  }

  render() {
    return <button>{this.props.label}</button>;
  }
}
```

In that model:

- the component class is the blueprint
- the instance is the object React creates
- `this` refers to the instance
- the instance holds internal state and lifecycle

Function components do not have instances in that same sense.

```javascript
function Button({ label }) {
  return <button>{label}</button>;
}
```

There is no `this`. There is no persistent object attached to the component by React.

Instead, React calls the function, gets a description, and moves on.

That does not mean function components are "stateless" or "not real." It means the mechanism is different.

In modern React, the important idea is not "component instance" as an object. It is the component's place in the UI tree and the React-managed data associated with that place.

## The tree is more important than the word instance

A lot of people try to think in terms of "instances" because that is how older UI systems were explained.

But in React, the more useful mental model is the tree.

```text
App
  ├── Header
  │     └── SearchBar
  ├── MainContent
  │     ├── Article
  │     └── Sidebar
  └── Footer
```

Each node in the tree is a component or a host element.

React keeps track of that structure during render.

When state changes, React does not ask "which object do I mutate?"

It asks "what changed in the tree?"

That is why keys, identity, and tree position matter so much.

## Hosting vs composition

Host elements are the low-level rendering primitives.

Usually, that means DOM elements in the browser.

```javascript
<div />
<button />
<input />
```

Component elements are your own components.

```javascript
<Button />
<UserProfile />
<Card />
```

The difference is important.

A host element like `<div />` tells React to create a real DOM node.

A component element like `<Button />` tells React to run a component function or class.

You compose components out of other components and host elements.

```javascript
function Card({ title, children }) {
  return (
    <article className="card">
      <h2>{title}</h2>
      {children}
    </article>
  );
}
```

This is composition.

You are building bigger UI descriptions out of smaller ones.

## One element, many levels

A single JSX tree contains both kinds of elements.

```javascript
return (
  <section>
    <h1>Hello</h1>
    <Button label="Click me" />
  </section>
);
```

Here:

- `<section>`, `<h1>`, and the button inside `Button` are host elements
- `<Button />` is a component element

React sees the whole tree and handles each node appropriately.

## Why the distinction matters

### Reason 1: mounts and unmounts are not the same as "creating an element"

When you write:

```javascript
const el = <Button />;
```

you are not mounting anything.

You are just making a description.

Mounting happens when React actually realizes the element in the DOM.

### Reason 2: state is tied to position, not to the function call

If you write:

```javascript
function App() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

the state is associated with that component's place in the tree, not with a particular call to the function.

If React sees the same component type in the same tree position across renders, it keeps the associated state.

That is a key idea.

It is also why moving components around can reset behavior if you do it carelessly.

### Reason 3: identity matters for lists

If you render a list without stable keys, React may reuse or reorder instances in surprising ways.

```javascript
items.map((item) => <li>{item.name}</li>);
```

The element here is `<li>`. The component is not.

But React still needs to know which `<li>` corresponds to which item across renders.

That is what keys provide.

Keys are not about performance magic. They are about identity in the tree.

## Common confusion: "mounting a component"

People often say:

> Mount the component

What they usually mean is:

> Render the component into the DOM

But technically, mounting is a lifecycle concept.

A component is "mounted" when React has placed it into the UI and it has a real place in the tree.

For function components, you do not have a traditional mount object. You have:

- the render
- the DOM result
- the effects that run after the commit

So "mount" is still a useful idea, but it is not the same thing as "the component is created."

## Common confusion: "element vs component"

A component is the thing you define.

An element is what you write in JSX or create with `React.createElement`.

```javascript
// component
function Button() { ... }

// element
<Button />
```

This is similar to:

```javascript
// function
function f() { ... }

// call
f()
```

JSX is a syntax for elements, not for component invocations directly.

## A more precise vocabulary

If you want to be precise:

- a component is a function or class that returns UI
- an element is the description of what to render
- the host is the underlying platform element, like a DOM node
- the tree is the structure React tracks
- an instance, in modern terms, is less important than the component's position and React's associated state

You do not need to say "component instance" every time. You usually mean either:

- "this component is rendered here"
- "this element describes that component"
- "this DOM node is the host result"

## A compact model

```text
Component   → definition
Element     → description of what to render
Host element → platform primitive like <div>
Component element → description of a custom component
Tree        → structure React tracks across renders
Instance    → older class-based object idea; today, think in terms of position in the tree
```

## Example that makes it concrete

```javascript
function App() {
  return (
    <div>
      <Greeting name="Nahid" />
    </div>
  );
}

function Greeting({ name }) {
  return <p>Hello, {name}</p>;
}
```

Here:

- `App` is a component
- `<App />` is an element
- `<div>` is a host element
- `<Greeting />` is a component element
- `Greeting` is a component
- `<p>` is a host element

React takes the `App` element, sees it contains a `Greeting` element, runs `Greeting`, gets `<p>Hello, Nahid</p>`, and puts the whole thing together.

No DOM has been created yet by the components themselves.

The components only return descriptions.

## Interview questions you should be able to answer

### 1. What is the difference between a component and an element?

A component is the thing you define. An element is the description of what to render, usually created by JSX.

### 2. What does JSX actually create?

It creates React element objects, not DOM nodes.

### 3. What is a host component?

A platform primitive like a DOM element.

### 4. What is the tree in React?

The structure of components and host elements that React tracks across renders.

### 5. Why do we care about identity in lists?

Because React uses identity to decide what changed, was added, or was removed across renders.

## Final mental model

```text
You write components.
JSX creates elements.
React builds a tree from elements.
React renders the tree into the host.
State is associated with positions in the tree.
The word "instance" is weaker in function components;
think in terms of place in the tree, not object identity.
```

Or in one sentence:

> **A component is a UI definition, an element is the description it produces, and React turns that description into the real UI while keeping track of the tree across renders.**

The next step is to understand what happens after the tree is described: rendering, reconciliation, and the commit phase.
