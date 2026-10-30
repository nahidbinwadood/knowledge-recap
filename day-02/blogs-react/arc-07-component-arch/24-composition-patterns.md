---
title: "Composition Patterns in React"
excerpt: "React components are meant to be composed, not just nested. This post explains composition patterns like children, render props, compound components, and why composition often beats early abstraction or inherited structure."
tags: ["react", "composition", "children", "compound-components", "render-props", "component-design"]
---

# Composition Patterns in React

Composition is the main way React components are assembled.

If used well, composition keeps components small, flexible, and reusable.

If used poorly, it can create abstractions that are harder to understand than the original code.

This post is about the common composition patterns and when each one makes sense.

## The basic idea of composition

Composition means building UI by combining smaller pieces.

```javascript
function App() {
  return (
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
```

That is composition.

`App` does not inherit `Header`. It contains it.

This is a core React idea.

Components are assembled from other components.

## Children as the simplest slot

The simplest composition pattern is `children`.

```javascript
function Card({ children }) {
  return <div className="card">{children}</div>;
}
```

Now the consumer decides what goes inside.

```javascript
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

This is powerful because `Card` does not need to know the content.

It only knows how to wrap it.

This pattern is good when the interior is flexible and the wrapper is the main responsibility.

## Children are a prop

It helps to remember that `children` is just a prop.

```javascript
function Card({ children }) {
  return <div className="card">{children}</div>;
}
```

You can pass it explicitly if you want.

```javascript
Card({ children: <p>Content</p> });
```

JSX is just a nicer syntax for that.

## Composition with props

Not everything is `children`.

Sometimes a component is composed by passing parts as props.

```javascript
function Page({ header, sidebar, body }) {
  return (
    <div>
      <Header>{header}</Header>
      <Sidebar>{sidebar}</Sidebar>
      <main>{body}</main>
    </div>
  );
}
```

This is useful when the structure is fixed and the consumer provides the pieces.

## Render props

Render props are a pattern where a component receives a function that returns UI.

```javascript
function DataViewer({ render }) {
  const data = useData();
  return render(data);
}
```

Used like:

```javascript
<DataViewer
  render={(data) => (
    <div>{data.name}</div>
  )}
/>
```

This pattern gives the consumer control over what to render while the provider handles the data or behavior.

Render props were very common before Hooks.

With Hooks, the same idea often becomes a custom Hook plus a simple component.

For example:

```javascript
function DataViewer({ children }) {
  const data = useData();
  return children(data);
}
```

Or even simpler, the consumer uses a Hook directly.

## When render props are still useful

Render props are still useful when the rendering decision needs to be dynamic and the provider needs to pass data to the renderer at render time.

But in many cases, Hooks reduce the need for render props as a general pattern.

The important idea is not "use render props everywhere."

The idea is "let the consumer decide some part of the UI."

## Compound components

Compound components are a pattern where several components work together as a system.

```javascript
function Select({ children }) {
  // provides implicit context to children
}
```

A typical example is:

```javascript
<Select>
  <Select.Option value="a">A</Select.Option>
  <Select.Option value="b">B</Select.Option>
</Select>
```

Here `Select`, `Select.Option`, and maybe `Select.Label` work together.

The outer component usually provides context or state that the inner components use.

This pattern is good when the pieces are closely related and need to share behavior or state.

## Why compound components are powerful

Compound components give the consumer a flexible but constrained API.

The user can compose the options, but the internal behavior is managed by the system.

This is better than passing a huge configuration object for every possibility.

It is also better than forcing one rigid structure.

## A practical compound component sketch

```javascript
const SelectContext = React.createContext();

function Select({ children, value, onChange }) {
  const context = { value, onChange };
  return (
    <SelectContext.Provider value={context}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectOption({ value, children }) {
  const ctx = useContext(SelectContext);
  return (
    <button
      onClick={() => ctx.onChange(value)}
      className={ctx.value === value ? "selected" : ""}
    >
      {children}
    </button>
  );
}

Select.Option = SelectOption;
```

This is a simplified sketch, but it shows the idea.

The parent provides the shared context.

The children consume it.

## Composition avoids inheritance

React does not use inheritance as the main composition model.

You do not usually extend a component to specialize it.

You compose it.

```javascript
// inheritance-like thinking is less common in React
// composition is preferred
<SpecialCard>
  <CardBody />
</SpecialCard>
```

This matters because composition is more flexible.

You can change the interior without changing the outer component much.

You can reuse pieces in different arrangements.

## A common mistake: inheritance thinking in React

Some people come from class-based systems and try to model React components as subclasses.

That usually leads to awkward code.

React components are not designed around class inheritance.

They are designed around props, composition, and Hooks.

## A common mistake: building the wrong abstraction

A common composition mistake is building an abstraction too early.

For example, making a generic `Container` that tries to handle every possible layout, padding, margin, and responsive behavior.

That can become hard to use.

A better pattern is to start concrete and extract only what repeats.

If three components really share the same structure, extract it.

If they only look similar, they may not need the same abstraction.

## A common mistake: too much flexibility

Composition can also go too far in the other direction.

If every piece is completely generic, the API can become hard to understand.

```javascript
<Box padding justify align spacing variant theme size>
  ...
</Box>
```

This may be flexible, but it can also be noisy.

A good composition system balances flexibility with clarity.

## A good composition rule

Ask:

```text
What does this component own?
What should the consumer control?
What should be fixed?
What should be open?
```

If the answer is clear, the composition is usually easier to design.

## A compact model

```text
children = slot pattern
props = explicit piece pattern
render props = function-based UI injection
compound components = shared system of related components
context = often the glue for compound components
inheritance = not the React composition model
rule = compose, don't inherit
```

## Interview questions you should be able to answer

### 1. What is composition in React?

Building components by combining smaller components rather than using inheritance.

### 2. What is the children prop for?

It lets a component receive and render content from its parent without knowing the content in advance.

### 3. What is a render prop?

A prop that is a function the component calls to let the consumer decide what to render.

### 4. What is a compound component?

A set of related components that work together and usually share implicit context or state.

### 5. Why is inheritance not the main React model?

Because React favors props and composition, which are more flexible and better aligned with the component model.

## Final mental model

```text
composition = combine small pieces
children = one of the simplest composition patterns
render props = dynamic rendering control
compound components = shared behavior across related parts
context = often the glue
inheritance = not the React way
good abstraction = emerges from repeated pattern, not from guessing
```

Or in one sentence:

> **React favors composition over inheritance, and the main patterns—children, render props, and compound components—are ways to let components share structure while letting the consumer decide what varies.**

The next piece is about where you draw the line between different responsibilities in a component tree: component boundaries.
