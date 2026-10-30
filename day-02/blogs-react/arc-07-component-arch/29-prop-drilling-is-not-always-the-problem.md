---
title: "Prop Drilling Is Not Always the Problem in React"
excerpt: "Prop drilling gets a bad reputation, but passing props through layers is not automatically a design failure. This post explains when prop drilling is fine, when it is a clue, and when a deeper change is actually the fix."
tags: ["react", "props", "prop-drilling", "component-design", "state-ownership", "architecture"]
---

# Prop Drilling Is Not Always the Problem in React

"Prop drilling" is the idea that props are passed through many layers of components that do not use them directly.

People often say it like it is a bad thing by default.

Sometimes it is.

But sometimes it is just how a tree works.

A good React codebase is not one with zero drilling.

It is one where drilling has a reason and is not causing pain.

## What prop drilling means

Imagine this:

```javascript
function Page() {
  const [user, setUser] = useState(...);
  return <Header user={user} />;
}

function Header({ user }) {
  return <NavBar user={user} />;
}

function NavBar({ user }) {
  return <UserMenu user={user} />;
}

function UserMenu({ user }) {
  return <span>{user.name}</span>;
}
```

`user` passes through `Header` and `NavBar` before reaching `UserMenu`.

That is prop drilling.

## When drilling is not a problem

Sometimes drilling is fine.

### 1. When the intermediate components are already doing that job

If `Header` and `NavBar` already exist to compose the layout, passing a prop through them is not a big deal.

They are not pretending to be independent; they are just part of the structure.

### 2. When the tree is shallow

If the prop only moves through one or two components, that is usually not worth fighting.

A little passing is normal.

### 3. When the prop is part of the intentional API

If many parts of a subtree genuinely need the same value, passing it down may be the clearest thing.

For example, a theme value, a current user, or a locale might naturally travel through several layers.

### 4. When the alternative is worse

If you reach for context too early, you may make the data flow less obvious.

Props are explicit.

Context is implicit.

Explicit is not always better, but it is often easier to follow.

## When drilling is a clue that something is off

Prop drilling becomes interesting when it starts to feel painful.

That pain can mean:

- too many unrelated components are receiving the same value
- the data should live somewhere more central
- the tree shape is awkward
- the prop is being passed too far through components that do not care
- the component boundary is wrong

For example:

```javascript
function Page() {
  const [theme, setTheme] = useState(...);
  return (
    <Layout
      theme={theme}
      title={<Title theme={theme} />}
      sidebar={<Sidebar theme={theme} />}
      content={<Content theme={theme} />}
      footer={<Footer theme={theme} />}
    />
  );
}
```

If almost everything needs `theme`, drilling through every piece can be noisy.

That may be a sign that the theme belongs in context, or that the layout should accept children and let children read the theme themselves.

## The key question is not "can we remove all drilling?"

The key question is:

```text
Is this drilling annoying because it is deep, or because it is repeated too broadly?
Is the pass-through component doing anything else useful?
Would the design be clearer if the value came from a different source?
```

If the answer is "it is just passing," that may be okay.

If the answer is "this is getting messy and repetitive," then think harder.

## A common mistake: treating prop drilling as a sin

Prop drilling is not a sin.

React is a component tree.

Some values naturally belong higher up.

Passing them down is sometimes the correct design.

A contrived rule like "never pass props through more than two levels" can lead to bad decisions.

It may push people toward context before context is the right tool.

## A common mistake: using context just to avoid drilling

Context is useful, but it is not just a prop-drilling workaround.

If you put something in context too eagerly, you can make dependencies harder to see.

A component that reads from context may look simple, but it now has a hidden dependency.

That can be fine.

It can also become a problem if the context is used everywhere and the dependency graph becomes hard to reason about.

So the rule is not "use context to avoid any drilling."

The rule is "use context when many parts of the tree need the same value and passing it manually is becoming a maintenance burden."

## A common mistake: creating a wrapper just to hide a prop

Another trap is making a component whose only job is to pass a prop along.

```javascript
function Header({ user }) {
  return <HeaderInner user={user} />;
}
```

If `Header` does not do anything else meaningful, this may be unnecessary indirection.

Sometimes this is justified by layout or reuse.

Sometimes it is just paperwork.

## A practical way to think about drilling

```text
small amount of drilling = normal
wide drilling through many unrelated components = possible design issue
deep drilling without purpose = possible structure issue
drilling through components that genuinely compose the UI = usually fine
```

The point is not to minimize prop passing at all costs.

The point is to keep the tree honest.

## A better fix is often structural, not magical

When drilling feels bad, the fix is often one of these:

- move the state closer to where it is used
- reshape the component tree
- split a large parent into smaller pieces
- introduce a Hook that returns exactly what several components need
- use context if the value is genuinely shared across many layers
- combine components that always move together

Not every fix is "add context."

In fact, many drilling problems are really structure problems.

## A small example

Suppose you have:

```javascript
function Dashboard() {
  const [filters, setFilters] = useState(...);
  return (
    <DashboardLayout
      filters={filters}
      onFilterChange={setFilters}
    >
      <Sidebar filters={filters} />
      <Chart filters={filters} />
      <Table filters={filters} />
    </DashboardLayout>
  );
}
```

If `filters` is needed in many children, drilling into each one may be acceptable.

But if `DashboardLayout` only exists to forward props, you might simplify by:

- letting children receive `children` and read what they need
- moving `filters` into something shared
- extracting a small Hook for the filter state and behavior

What matters is the shape of the dependency, not the fact that props are being passed.

## When context is the right call

Context is a good idea when:

- many distant components need the same value
- the value changes in ways that should affect large parts of the tree
- the prop path is long and repetitive
- the value is more like a setting or environment than a temporary UI prop

Examples:

- theme
- locale
- current user
- permissions
- global settings

Context is less helpful when:

- only a few components need the value
- the value is local and temporary
- the data flow is already clear and short
- the context would become a dumping ground for everything

## The real rule

```text
prop drilling is acceptable when it is honest
prop drilling is suspicious when it is repetitive and shallow components are just forwarding
context is helpful when the shared value is real and widespread
context is not a drill-avoidance toy
```

## Interview questions you should be able to answer

### 1. What is prop drilling?

It is passing props through components that do not directly need them, just to reach a deeper component.

### 2. Is prop drilling always bad?

No. It is often normal, especially in shallow trees or when the intermediate components are doing structural work.

### 3. When does drilling suggest a problem?

When it becomes repetitive across many components, or when unrelated parts of the tree are receiving the same data just to forward it.

### 4. Is context the automatic fix for prop drilling?

No. Context is one option, and it works best when there is a genuinely shared value used by many parts of the tree.

### 5. What can you do besides context?

You can move state closer, reshape the tree, compose components better, or extract a Hook.

## Final mental model

```text
prop drilling = passing props through intermediate components
not always bad = sometimes it is the clearest design
bad signal = repetitive forwarding, awkward structure, too-wide sharing
context = useful for real shared environment values
rule = reduce drilling when it hurts, not when it merely exists
```

Or in one sentence:

> **Prop drilling is not automatically a problem; it becomes one when the tree is pushing props around without purpose, at which point the real fix is usually better structure, not a ritual switch to context.**

The next piece is about a related but different idea: how to split behavior cleanly using custom Hooks.
