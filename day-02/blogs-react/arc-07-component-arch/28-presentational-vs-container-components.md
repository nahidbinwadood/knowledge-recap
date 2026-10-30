---
title: "Presentational and Container Components in React"
excerpt: "React components often fall into two broad roles: ones that handle display and ones that handle data or behavior. This post explains the presentational vs container idea, why it is useful, where it comes from, and why it does not have to become a rigid rule."
tags: ["react", "component-design", "presentational-components", "container-components", "separation-of-concerns", "architecture"]
---

# Presentational and Container Components in React

Some components mainly describe what something looks like.

Some components mainly handle where the data or behavior comes from.

That split is often called "presentational vs container."

It is not a React law.

But it is a useful way to think about component roles.

## The basic idea

A presentational component:

- cares about how things look
- receives data through props
- usually does not fetch data
- usually does not manage major business logic
- often is easier to reuse

A container component:

- cares about where data comes from
- handles state, fetching, or behavior
- passes data down to presentational components
- often is less reusable in different UI contexts

The split is about responsibility, not syntax.

Both kinds of components are still React components.

## A simple example

```javascript
// presentational
function UserInfo({ name, role }) {
  return (
    <div className="user-info">
      <h2>{name}</h2>
      <p>{role}</p>
    </div>
  );
}
```

This component does not fetch.

It does not store user data.

It just renders what it receives.

Now a container might look like:

```javascript
function UserPage() {
  const { name, role } = useCurrentUser();
  return <UserInfo name={name} role={role} />;
}
```

Here `UserPage` is doing the "where does the data come from" job.

`UserInfo` is doing the "what does it look like" job.

## Why this distinction can help

### 1. It clarifies responsibilities

If a component is mostly presentational, you expect it to be simpler.

It should not need to know:

- how data is fetched
- where state lives
- how the auth system works
- what API shape is used

That keeps the component easier to read.

### 2. It makes reuse easier

A presentational component often works in more places because it does not depend on a specific data source.

```javascript
<UserInfo name="Ada" role="Engineer" />
```

You can use it anywhere you can supply the props.

### 3. It makes testing easier

A presentational component is often easy to test because you can feed it props and inspect the output.

```javascript
// concept
render(<UserInfo name="Ada" role="Engineer" />);
```

No mocking of global state is required if the component is truly presentational.

### 4. It helps separate UI from logic

If you keep logic in containers or Hooks, the UI layer stays cleaner.

That does not mean all logic must stay in one place.

It means you can choose where to put it deliberately.

## Where the idea came from

The phrase "presentational vs container" became popular through earlier React patterns and talks.

It helped people describe a useful separation before Hooks became the dominant mental model.

It still matters even though the wording has changed a bit.

Today, the same idea often shows up as:

- a component that receives props
- a Hook that supplies data or behavior
- a container-like component that coordinates both

The core separation is still there.

## When the distinction is useful

This split is helpful when:

- you have UI that should be reusable
- you want to keep rendering code independent of data fetching
- you want to test display logic separately
- different pages use similar UI with different data sources
- you are trying to reduce giant mixed components

For example, a table component might be presentational:

```javascript
function DataTable({ rows, columns }) {
  return ...
}
```

Then the container decides:

- what rows to show
- what columns mean
- how to fetch or compute them
- how to handle sorting or selection

## When the distinction is less useful

The presentational/container idea is not always the right split.

It can become awkward when:

- the component only has one use case
- the UI and behavior are tightly coupled
- the split would create an extra layer with little benefit
- the "container" becomes just a thin wrapper that adds indirection
- the team enforces it as a rule instead of a guideline

In small components, the split may be unnecessary.

In complex UI, it may still be worth thinking in these terms without naming every file as one or the other.

## A modern version of the idea

With Hooks, the old container pattern often changes shape.

Instead of a class-based container, you might have:

```text
Hook = data/behavior supplier
Component = UI renderer
Wrapper = coordinates the two
```

For example:

```javascript
function UserProfile() {
  const user = useUser();
  return <UserCard user={user} />;
}
```

`useUser` is doing the container-like job.

`UserCard` is doing the presentational job.

The component tree may be simpler than a classical container pattern.

## A common mistake: making the split too rigid

Some teams treat presentational vs container as a strict rule.

That can lead to:

- too many files
- too many tiny wrappers
- awkward prop drilling through meaningless layers
- extra abstraction for simple UI

You do not need a separate file for every component.

You do not need to call everything a container or presentational.

If a component is small and obvious, the split may be over-engineering.

## A common mistake: leaking logic into UI components

The opposite problem is also common.

People put fetching, business rules, and global state handling directly into presentational-style components.

That can make the UI harder to reuse and harder to understand.

A sign of this is:

```javascript
function UserCard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser().then(setUser);
  }, []);

  ...
}
```

Now the component is doing more than rendering.

That may be fine in one place, but if you reuse `UserCard`, the fetching behavior comes with it whether you want it or not.

## A useful way to decide

Ask:

```text
Does this component mainly describe appearance?
Does it need to know how data is obtained?
Would it be reusable if it only received props?
Should data logic live closer to the state owner?
Should UI logic live closer to the view?
```

If the answer is clear, the split is easier to choose.

## A practical rule

```text
If a component is mostly about rendering, keep it presentational.
If a component is mostly about data and behavior, keep that concern separate.
If a component is small and only used once, the distinction may not matter much.
If the same UI appears with different data sources, presentational design is especially helpful.
If the UI and behavior are inseparable, do not force them apart.
```

## A note on "container" terminology

Some people dislike the word "container" because it can sound like a wrapper with no other purpose.

The important idea is not the label.

The idea is:

```text
separate UI from data/behavior concerns when it helps
```

That is the real point.

## Interview questions you should be able to answer

### 1. What is the difference between presentational and container components?

Presentational components focus on rendering and receive data via props, while container components focus on data, state, and behavior and pass that down.

### 2. Why can presentational components be easier to reuse?

Because they usually do not depend on a specific data source or side effect.

### 3. Is this a strict React requirement?

No. It is a useful mental model, not a hard rule.

### 4. How does Hooks change this idea?

Hooks often absorb the container-like role by supplying data and behavior, leaving the component more presentational.

### 5. When might the split be unnecessary?

When the component has one clear job, is used in only one place, or when forcing the split would add indirection without benefit.

## Final mental model

```text
presentational = how it looks, receives props
container = where data/behavior comes from
benefit = clearer responsibilities, easier reuse, easier testing
 Hooks = modern way to supply container-like behavior
overuse = unnecessary layers and indirection
rule = separate concerns when it helps, not always
```

Or in one sentence:

> **Presentational components describe what shows up; container components decide what data and behavior feed that UI—and the split is useful when it clarifies responsibility, not when it becomes a rigid rule.**

The next piece is about a real anti-pattern: pushing every component as far down the tree as possible and what that does to your code.
