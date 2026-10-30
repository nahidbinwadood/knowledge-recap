---
title: "Component Boundaries in React"
excerpt: "Every component should have a clear boundary between what it owns, what it receives, and what it delegates. This post explains how to decide component borders, what belongs inside a component, and what should be pushed down or pulled up."
tags: ["react", "component-design", "boundaries", "props", "ui-architecture", "state-ownership"]
---

# Component Boundaries in React

A good component has a clear boundary.

It knows what it owns.

It knows what it receives.

It does not own or receive things it should not.

That sounds obvious, but in practice, component boundaries are where a lot of React code gets messy.

This post is about how to think about those boundaries.

## What a boundary is

A boundary is the line between:

- what the component controls
- what the parent controls
- what is delegated to children
- what is shared through context

A component with a clear boundary is easier to understand, test, and reuse.

A component with a blurry boundary often does too much.

## The first question to ask

Before building a component, ask:

```text
What does this component do?
What does it decide?
What does it receive from outside?
What does it pass inside?
```

If you cannot answer those questions clearly, the boundary is probably fuzzy.

## Responsibilities belong somewhere

A common mistake is to put unrelated responsibilities into one component.

For example, one component might:

- fetch data
- format dates
- render a list
- handle input validation
- decide layout

That is usually too broad.

Some of those belong in:

- a data layer
- a utility function
- a child component
- a Hook
- a separate presentation component

The reason is not just aesthetics.

It is that each responsibility has a different reason to change.

## A small example of a bad boundary

```javascript
function UserCard({ user }) {
  const [active, setActive] = useState(false);

  const fetchUser = async () => {
    const res = await fetch(`/api/users/${user.id}`);
    const data = await res.json();
    setActive(true);
  };

  const formatted = formatDate(user.createdAt);

  useEffect(() => {
    fetchUser();
  }, []);

  if (!active) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card">
      <h2>{user.name}</h2>
      <p>{formatted}</p>
    </div>
  );
}
```

This component has a few problems.

It mixes:

- data fetching
- loading state
- formatting
- UI rendering

Those are not the same concern.

A better split might look like:

- a Hook or data layer for fetching
- a formatting utility for dates
- a presentational component for the card

## A better boundary

```javascript
function UserCard({ name, createdAt }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>{formatDate(createdAt)}</p>
    </div>
  );
}
```

Now `UserCard` owns rendering only.

It receives what it needs.

It does not know about fetching.

That is a cleaner boundary.

## Where should state live?

A key boundary question is where state should live.

If a piece of state is used by only one component, it belongs there.

If several related components need it, it may belong in a common parent.

If unrelated parts of the UI need it, it may belong in context or a higher-level store.

The rule is not "put everything in the top component."

The rule is "put state as close to where it is used as possible."

If you push too much state upward, the parent becomes heavy.

If you push state too deep, sharing becomes awkward.

## A parent that is too big

A common symptom of bad boundaries is a parent that does everything:

```javascript
function Page() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [formState, setFormState] = useState({...});

  // fetch logic
  // filtering logic
  // detail logic
  // form logic
  // layout logic
}
```

This component has become a catch-all.

The fix is usually to split it.

Some parts may become:

- a search component
- a results list
- a detail panel
- a form component
- a Hook for shared logic

Each piece should have a narrower job.

## A useful rule of thumb

If a component is hard to explain in one sentence, it may be doing too much.

For example:

- "This component renders a search form."

That is clear.

- "This component renders a search form, fetches results, manages loading, filters the list, handles the detail view, and also does some analytics."

That is not one responsibility.

## Push logic down when possible

A good boundary often keeps heavy logic in a Hook and keeps the component focused on UI.

For example:

```javascript
function MessageList({ messages }) {
  const visible = useVisibleMessages(messages);
  return (
    <ul>
      {visible.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
    </ul>
  );
}
```

The component does not need to know how visibility is computed.

It only knows the result.

This makes the component easier to read.

## Push UI down when possible

Another boundary improvement is pushing UI variations into children.

```javascript
function Page({ sidebar, main }) {
  return (
    <div>
      <aside>{sidebar}</aside>
      <main>{main}</main>
    </div>
  );
}
```

Now the parent owns the layout.

The consumer owns the content.

That is a good boundary because the parent does not need to know the exact content.

## Keep the contract explicit

A component boundary is basically a contract.

```text
inputs = props, context
lifecycle = hooks, effects
outputs = rendered UI, events, callbacks
internal = private state, local logic
```

If the contract is clear, the component is easier to use.

If the contract is hidden, surprises happen.

For example, if a component mutates props or depends on global side effects, the boundary is weaker.

## What should not cross the boundary

Some things should not leak through a component boundary:

- unrelated side effects
- hidden assumptions about the parent
- direct references to specific parent state
- overly clever global behavior

If a component only works in one exact context, its boundary is too tight.

If it does too many unrelated things, its boundary is too loose.

## Context changes boundaries

Context is useful, but it also changes the boundary.

A component may receive data from context instead of props.

```javascript
function ThemeButton() {
  const theme = useTheme();
  return <button className={theme.className}>Click</button>;
}
```

This is fine when the context is part of the intended API.

But if everything is pulled from context, props become less meaningful and the dependency graph becomes harder to see.

A good boundary balances context and props.

## A simple boundary checklist

For a component, ask:

```text
What does it render?
What does it own?
What does it receive?
What does it publish back?
Does it fetch data, or does it receive data?
Does it know how to format, or does it receive formatted values?
Does it decide behavior, or does it delegate it?
```

If the answers are messy, the boundary is probably also messy.

## A practical lift and split

When a component grows, a common rescue is lift-and-split:

- lift related state up if multiple pieces need it
- split unrelated state into separate components
- move shared logic into a Hook
- move pure presentation into a smaller component
- move formatting or data mapping into utilities

This is not about making more files.

It is about making each piece do one thing well.

## The final idea

A good component boundary is:

- clear about what it owns
- explicit about what it receives
- limited in what it decides
- honest about what it delegates

That is what makes components reusable and understandable.

If you keep boundaries clean, the component tree is easier to change.

## Interview questions you should be able to answer

### 1. What is a component boundary in React?

It is the line between what a component owns internally and what it receives or delegates from outside.

### 2. What makes a boundary weak?

If the component hides dependencies, does too many unrelated things, or relies on hidden context in ways the consumer cannot see.

### 3. Where should state usually live?

As close as possible to where it is used, unless multiple components need to share it.

### 4. Why might a parent become too large?

Because too many responsibilities are kept in one place instead of being split into smaller pieces.

### 5. How do you decide whether logic belongs in a component or a Hook?

If the logic is mostly UI-adjacent and organized around a behavior, a Hook may be a better home than the component body.

## Final mental model

```text
boundary = what a component owns versus what it receives
clear boundary = easier to read, reuse, test
bad boundary = too big, too hidden, too tightly coupled
good split = separate UI, data, and logic where it makes sense
context = useful, but do not let it replace clarity
rule = keep the contract explicit
```

Or in one sentence:

> **A React component is at its best when its boundary is clear: it knows what it owns, what it receives, and what it leaves to children, Hooks, or context.**

The next piece is about when you should build a custom component in the first place, and when you should not.
