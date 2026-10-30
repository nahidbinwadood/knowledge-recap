---
title: "Composition Over Conditional Components in React"
excerpt: "When a component contains a long chain of conditionals for different UI shapes, it often means the component is trying to be too flexible. This post explains why composition can be a cleaner way to express variation and when conditionals are still fine."
tags: ["react", "conditional-rendering", "composition", "component-design", "abstraction", "maintainability"]
---

# Composition Over Conditional Components in React

A component can become hard to read when it contains many conditional branches for different shapes.

That is not always a mistake.

Sometimes one component really does need to express several modes.

But when the conditionals grow, the component can start to look like a switchboard for UI.

This post is about when that is a problem and how composition can help.

## The conditional-heavy component

A common shape is this:

```javascript
function Widget({ type, state, compact, icon, label, actions }) {
  if (type === "header") {
    return <Header label={label} />;
  }
  if (type === "list") {
    return <List items={...} />;
  }
  if (type === "detail") {
    return <Detail state={state} />;
  }
  if (type === "form") {
    return <Form actions={actions} />;
  }
  ...
}
```

This component has become a dispatcher.

It decides which shape to render based on props.

That can be convenient.

It can also become messy.

## When conditionals are fine

Conditionals are not bad by themselves.

They are fine when:

- the component is genuinely one thing with a few modes
- the modes are similar and only differ in small ways
- the conditional logic is simple
- the component is not growing a large catalog of unrelated shapes

For example:

```javascript
function StatusBadge({ status }) {
  if (status === "error") return <span className="badge-error">Error</span>;
  if (status === "ok") return <span className="badge-ok">OK</span>;
  return <span className="badge-default">Unknown</span>;
}
```

That is a small, coherent component.

The conditional is part of its job.

## When conditionals become a problem

Conditionals become a problem when:

- the component starts handling many distinct UI shapes
- each shape has its own logic and layout
- the props grow to support every combination
- the component is doing too many different jobs
- the reader has to hold the whole dispatch in their head

At that point, the component is less like a widget and more like a small factory.

## A sign that composition may be better

If you see this pattern:

```javascript
if (mode === "A") ...
else if (mode === "B") ...
else if (mode === "C") ...
else if (mode === "D") ...
else if (mode === "E") ...
```

and the branches are not closely related, it may be time to split.

The component can still exist.

But the different shapes can live in separate pieces.

## Composition as the alternative

Composition means letting the consumer choose the structure instead of asking the component to dispatch it.

For example:

```javascript
function Panel({ header, body, footer }) {
  return (
    <div className="panel">
      {header}
      <div className="panel-body">{body}</div>
      {footer}
    </div>
  );
}
```

Now the consumer builds the panel from parts:

```javascript
<Panel
  header={<PanelHeader title="Details" />}
  body={<DetailBody data={item} />}
  footer={<PanelFooter />}
/>
```

The Panel does not need to know every possible internal shape.

It only knows how to arrange the parts.

## Another composition style: children

Sometimes the simplest split is to accept children:

```javascript
function Card({ children }) {
  return <div className="card">{children}</div>;
}
```

Now the consumer decides the interior.

That is the opposite of a dispatcher component.

## Another composition style: slot props

Sometimes a component needs named slots instead of a single children block.

```javascript
function Layout({ title, sidebar, content }) {
  return (
    <div>
      <h1>{title}</h1>
      <aside>{sidebar}</aside>
      <main>{content}</main>
    </div>
  );
}
```

This is still composition.

The layout does not render the content itself.

It receives and places it.

## Why composition can reduce conditionals

If variation is expressed through composition, the component does not need to branch as much.

```javascript
// conditional version
<Widget type="list" items={...} />
<Widget type="chart" data={...} />
<Widget type="form" onSubmit={...} />

// compositional version
<Widget>
  <Widget.List items={...} />
</Widget>

<Widget>
  <Widget.Chart data={...} />
</Widget>

<Widget>
  <Widget.Form onSubmit={...} />
</Widget>
```

The widget becomes a container for parts.

The parts express the variation.

## When dispatching is still the right model

There are cases where a dispatcher component is appropriate.

For example, a component that maps a known set of UI types to implementations may be exactly what you want.

```javascript
function RenderItem({ kind, ...props }) {
  switch (kind) {
    case "heading":
      return <Heading {...props} />;
    case "paragraph":
      return <Paragraph {...props} />;
    case "image":
      return <Image {...props} />;
    default:
      return null;
  }
}
```

If the set of kinds is small and stable, this is fine.

If the set keeps expanding and the branches start to differ a lot, composition may be better.

## A useful way to decide

Ask:

```text
Is this one component with a few variations?
Or is it many different things sharing one file?
Do the branches differ in layout, behavior, and data?
Is the caller assembling the shape, or asking the component to choose for them?
Would named parts or children make the API clearer?
```

If the answer points toward "many different things," composition usually helps.

If the answer points toward "one thing with a few modes," conditionals may be fine.

## A bad smell: flag props that decide shape

If a component has many props that decide what it renders, that is often a sign of a dispatcher disguised as a normal component.

```javascript
<Box
  showHeader
  showFooter
  showSidebar
  variant="stacked"
  mode="compact"
  includeActions
  ...
/>
```

This can work.

But it is often harder to understand than a compositional version.

## A useful rule of thumb

```text
small set of related modes -> conditionals can be okay
large or unrelated set of shapes -> composition is often better
flag-heavy shape control -> consider part-based design
caller knows the shape -> let the caller assemble it
component only knows how to arrange -> keep it simple
```

## A common mistake: making one component do everything

A common mistake is to put every possible variation into one component so that "it can render anything."

That usually leads to:

- a long internal branch list
- awkward props
- hard-to-read internals
- a component that is hard to change because everything is connected

Sometimes one component really does need to render many things, but usually the better answer is a smaller container and separable parts.

## A common mistake: forcing composition where conditionals are simpler

The opposite mistake is to avoid conditionals too aggressively.

If a component has two or three closely related modes, a small conditional can be clearer than a complex compositional API.

The goal is not to eliminate all conditionals.

The goal is to keep them where they belong.

## A practical example

Suppose you have a notification component.

```javascript
function Notification({ type, title, message, action }) {
  if (type === "info") {
    return (
      <div className="info">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    );
  }
  if (type === "warning") {
    return (
      <div className="warning">
        <h3>{title}</h3>
        <p>{message}</p>
        {action}
      </div>
    );
  }
  ...
}
```

A compositional version might be:

```javascript
function Notification({ children, variant }) {
  return <div className={`notification notification-${variant}`}>{children}</div>;
}

function NotificationTitle({ children }) {
  return <h3>{children}</h3>;
}

function NotificationMessage({ children }) {
  return <p>{children}</p>;
}
```

Now the consumer builds the notification:

```javascript
<Notification variant="warning">
  <NotificationTitle>Warning</NotificationTitle>
  <NotificationMessage>Be careful</NotificationMessage>
</Notification>
```

This is more flexible and often easier to extend.

## A final thought

Composition does not mean "no conditionals ever."

It means:

```text
prefer assembling variation from parts when the parts are different enough to deserve their own shape
keep conditionals when they express a small, coherent set of modes
```

## Interview questions you should be able to answer

### 1. What is a conditional-heavy component?

A component that renders different UI shapes by branching on props or state.

### 2. When are conditionals acceptable?

When the component really is one thing with a few coherent variations.

### 3. When does composition help more?

When the shapes are distinct enough that they deserve separate components or parts.

### 4. What is a sign that a dispatcher component is getting out of hand?

When new requests keep adding new branches or flags to the same component.

### 5. Is composition always better than conditionals?

No. Sometimes a small conditional is simpler and clearer than a compositional API.

## Final mental model

```text
conditional components = one component branches into multiple shapes
composition = variation expressed through parts, children, or slots
good rule = small coherent modes = conditionals; many distinct shapes = composition
flag-heavy shape control = often a sign to split
goal = clearer API and easier extension
```

Or in one sentence:

> **If a React component is becoming a long chain of conditionals for different shapes, composition—through children, slots, or separate parts—is often a cleaner way to let the consumer assemble what varies.**

All 34 React blogs are done. The series is complete and organized by arc under `day-02/blogs-react/`. You can let me know if you want me to continue with the remaining Frontend/Backend catalogs, or review, trim, or reorder anything here.
