---
title: "Composition Over Variant Props in React"
excerpt: "When a component grows a long list of props like variant, size, style, and special-case flags, it is often a sign that a variant-based design is getting hard to maintain. This post explains why composition is often a better way to handle variation."
tags: ["react", "component-design", "composition", "variant-props", "abstraction", "maintainability"]
---

# Composition Over Variant Props in React

A common way to build reusable components is to add props for every variation.

```javascript
function Button({
  variant,
  size,
  color,
  fullWidth,
  icon,
  label,
  disabled,
  loading,
  theme,
  type
}) {
  ...
}
```

That can work for a while.

But as variation grows, the component can turn into a branching mess.

This post is about an alternative: composition.

## The variant-prop pattern

Variant props are tempting because they are explicit.

```javascript
<Button variant="primary" size="large" />
<Button variant="secondary" size="small" />
<Button variant="danger" loading />
```

From the outside, this looks clean.

From the inside, the component often has a lot of conditional logic.

```javascript
if (variant === "primary") {
  className = "btn-primary";
} else if (variant === "secondary") {
  className = "btn-secondary";
} else if (variant === "danger") {
  className = "btn-danger";
}
```

Add sizes, states, icons, layouts, and special flags, and the component can get hard to reason about.

## The problem with too many variant props

### 1. Combinations multiply

If you have:

- 5 variants
- 3 sizes
- 2 states
- 4 layout flags

The number of possible combinations can become large.

Even if you do not support every combination, the code has to decide what to do when props conflict.

### 2. The component starts guessing

When props fight each other, the component has to prioritize one over another.

```javascript
if (danger) ...
else if primary ...
else if secondary ...
else if ...
```

That means the component is making a lot of decisions.

### 3. New variations require changes in the same file

Every new variant is another branch inside the same component.

The file grows, and the branches become harder to keep consistent.

### 4. The API becomes noisy

A component with many props can be hard to use because you have to know which props matter together.

```javascript
<Button variant="ghost" size="tiny" compact rounded iconLeft label="Save" />
```

That is a lot of knobs.

## Composition as an alternative

Composition means building variation by combining smaller parts, not by adding one giant prop surface.

```javascript
<Button variant="primary">
  <Icon name="save" />
  <Label>Save</Label>
</Button>
```

Or:

```javascript
<Button>
  <Prefix>$</Prefix>
  <Text>Submit</Text>
</Button>
```

Here the Button does not need to know every possible thing that can appear inside it.

It just knows how to render its children and apply its base behavior.

## Why composition can be better

### 1. Variation is expressed by structure, not by conditionals

Instead of encoding every variant as a prop, you let the outside assemble the result.

That keeps the core component simpler.

### 2. Reuse becomes easier

A component that accepts children or slot props can be reused in more ways without changing its internals.

```javascript
<Wrapper>
  <Button>Go</Button>
</Wrapper>

<Wrapper>
  <Button variant="small">Skip</Button>
</Wrapper>
```

The wrapper or the children express the variation.

### 3. New patterns do not always require new props

If you need a button with an icon on the left, a label, and a suffix, you can often do that through composition without adding new variant props.

### 4. Less branching inside the component

The component concerns itself with what it owns.

The consumer concerns itself with what it wants to show.

## A practical comparison

Variant-heavy style:

```javascript
function Card({
  header,
  body,
  footer,
  showBorder,
  elevated,
  compact,
  padded,
  dark,
  light,
  variant
}) {
  // lots of branching
}
```

Composition style:

```javascript
function Card({ children, className }) {
  return <div className={`card ${className ?? ''}`}>{children}</div>;
}

function CardHeader({ children }) {
  return <div className="card-header">{children}</div>;
}

function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
}
```

The second set does not try to predict every card layout.

It lets the consumer compose one.

## Where variant props still make sense

Variant props are not always wrong.

They make sense when:

- the variation is limited and stable
- the component has a small number of meaningful modes
- the variation is a real property of the component, not just visual decoration
- most consumers would use the same few patterns

For example:

```javascript
<Button variant="primary" />
<Button variant="danger" />
```

If the button really has two or three intentional styles, a variant prop can be fine.

The problem starts when the number of variants keeps growing without limit.

## A useful rule of thumb

```text
if the component has a few stable modes, variant props can be fine
if the component needs to handle many combinations, composition is often better
if every new request leads to a new prop, the component is probably over-generalized
if the outside can assemble the result cleanly, prefer that
```

## A bad smell: long prop conditionals

If you keep writing things like:

```javascript
if (variant === "special" || compact || isEmbedded || isInline) {
  ...
}
```

that is a sign the component is trying to be too smart.

## A bad smell: props that mostly control layout

If many props exist only to decide internal layout, consider whether the component should accept children or slots instead.

For example:

```javascript
// maybe unnecessary
<Box padded header={...} footer={...} sidebar={...} />

// maybe clearer
<Box>
  <Box.Header>...</Box.Header>
  <Box.Body>...</Box.Body>
  <Box.Footer>...</Box.Footer>
</Box>
```

This is not a hard rule, but it is a useful direction.

## A common mistake: assuming composition is always better

Composition is powerful, but it is not the only tool.

Sometimes a simple variant prop is the clearest choice.

The goal is not to eliminate variant props everywhere.

The goal is to notice when variant props are becoming a maintenance problem and to replace them with a more compositional design.

## A common mistake: making the component too flexible

Composition can also go too far if the component becomes so generic that it no longer expresses anything.

There is a balance between:

- flexible assembly
- clear intent

If the component is just a blank box with no guidance, the consumer has to do too much work.

## A balanced model

```text
use variant props for a small, intentional set of modes
use composition for visual or structural variation
let children and slots handle what can vary
keep the component focused on its real responsibility
extract variants into components when the pattern repeats
```

## A final example

Instead of:

```javascript
<Widget variant="dashboard" showTitle showIcon compact compactHeader bordered />
```

You might write:

```javascript
<Widget>
  <Widget.Header>
    <Widget.Icon />
    <Widget.Title>Dashboard</Widget.Title>
  </Widget.Header>
  <Widget.Body>...</Widget.Body>
</Widget>
```

That can be clearer because the structure tells you what is what.

## Interview questions you should be able to answer

### 1. Why can variant props become a problem?

Because combinations multiply, conditionals pile up, and the component ends up making too many decisions.

### 2. What is composition in this context?

Building UI by combining parts instead of encoding every variation as a prop.

### 3. When are variant props still a good choice?

When the set of variations is small, stable, and intentionally part of the component's identity.

### 4. What is a sign that composition may be better?

When each new request adds another prop or conditional branch to the same component.

### 5. What is the risk of too much composition?

The component may become overly generic and lose clarity if it offers no structure.

## Final mental model

```text
variant props = explicit but can explode in complexity
composition = flexible, often easier to grow
good rule = few variants = props; many combinations = composition
new variation = ask whether it belongs in the component or in the consumer
goal = simpler core component, clearer usage
```

Or in one sentence:

> **If a React component needs a long list of variant, size, and flag props, composition is often a better way to express variation because it keeps the component simpler and lets the consumer assemble what differs.**

The next piece is about one of the hardest judgment calls in React: when memoization helps and when it just adds noise.
