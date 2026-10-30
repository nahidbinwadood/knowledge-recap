---
title: "useState and Local State in React"
excerpt: "useState is the most basic React state hook, but it is easy to overuse. This post explains what useState does, how local state differs from other kinds of state, when local state is the right place, and when it is a sign that state has been put in the wrong spot."
tags: ["react", "useState", "local-state", "state", "hooks"]
---

# useState and Local State in React

`useState` is the hook that most React beginners learn first, and also the one they misuse the most.

The usual mistake is not technical. It is architectural.

People put too much state into `useState`, in the wrong component, or in too many pieces.

The goal of this post is to clarify what `useState` actually gives you, and when local state is the right tool.

## What useState does

`useState` gives a component a piece of state that survives across renders.

```javascript
const [count, setCount] = useState(0);
```

The call returns:

- the current value for this render
- a function to request an update

When you call the setter, React schedules a re-render.

```javascript
setCount(count + 1);
```

The next render sees the new value.

That is the entire contract.

`useState` is not:

- a global store
- a way to sync state with the DOM manually
- a replacement for props
- a way to avoid thinking about where state should live

It is a local state primitive.

## Local state means local responsibility

Local state is state that belongs to one component and its subtree.

A good example is a text field's draft value while the user is typing.

```javascript
function SearchInput({ onSearch }) {
  const [query, setQuery] = useState("");

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onBlur={() => onSearch(query)
    />
  );
}
```

That state is local because:

- only this component needs the draft value during typing
- the parent does not need to own every intermediate keystroke
- the parent only needs the final result when it matters

This is a good use of `useState`.

Another example is an expanded/collapsed toggle.

```javascript
function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <button onClick={() => setOpen(!open)}>{title}</button>
      {open && <div className="body">{children}</div>}
    </section>
  );
}
```

The expanded state belongs to the accordion.

Nobody else needs to know whether it is open unless the parent explicitly wants to control that.

## When local state is the right place

Local state is a good fit when:

- the value is only relevant to one component
- the value is temporary or UI-only
- the value does not need to be shared with distant parts of the tree
- the value does not represent important application data

Examples:

- input draft values
- toggle state
- temporary selection state
- animation or hover-related UI flags
- loading indicators that belong to a specific component

A good rule:

> If removing the component would also remove the meaning of the state, the state is probably local.

## When local state is the wrong place

Local state becomes a problem when it is used for something that should be shared, owned elsewhere, or derived.

### 1. When the parent already owns the truth

If the parent already has the source of truth, the child should receive it as props, not duplicate it in local state.

```javascript
// bad
function Profile({ user }) {
  const [name, setName] = useState(user.name);
  ...
}
```

If `user` can change, the child's local `name` can drift out of sync.

Better:

```javascript
function Profile({ user }) {
  // receive what you need
}
```

### 2. When multiple components need the same value

If several components need the same value, local state in one of them usually leads to lifting or copying, both of which are warning signs.

### 3. When the state is really server data

If the data comes from the server and should be cached, shared, or refreshed, `useState` is usually the wrong primitive.

That is server state, not local UI state.

### 4. When the state is just derived

If the value can be calculated from other state or props, it often should not be a separate `useState`.

```javascript
// unnecessary
const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);
```

Better:

```javascript
const fullName = `${first} ${last}`;
```

State should not be used as a cache for something you can compute.

## Local state can be too isolated

Sometimes people avoid lifting state because they fear "making the parent too big."

That fear is understandable, but it can lead to a different problem: many small pieces of state that should be coordinated live in different places.

If two sibling components need to stay in sync, the state probably belongs in their parent, or in a shared layer if the tree is deeper.

This is not a rule that says "always lift to the top."

It is a rule that says "put state where it has the smallest effective scope that still satisfies the sharing requirement."

## A mental model for placement

When deciding where state should live, ask:

```text
Which component really owns this value?
Which components need to read it?
Which components need to change it?
Does the value represent UI only, or application data?
Can it be derived instead?
```

If only one component needs it and it is purely UI, local `useState` is likely fine.

If multiple components need it, consider lifting.

If it is server data, consider server-state tools instead of a local hook.

## Local state is still state

Local state is not "less important" state. It is state with a smaller scope.

That means the same rules still apply:

- treat it as a snapshot
- do not mutate it in place
- be careful with stale closures
- avoid storing derived values unless there is a good reason
- keep the state shape as simple as possible

A common beginner pattern is to store too many unrelated values in one object.

```javascript
const [form, setForm] = useState({
  name: "",
  email: "",
  age: "",
  errors: {}
});
```

Sometimes that is useful. Sometimes it is overkill.

It is often better to split related pieces so each piece has a clear owner.

```javascript
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [errors, setErrors] = useState({});
```

The right split depends on how the state is used.

## A simple example of good local state

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

This state is local, simple, and owned by the component.

There is no need to lift it unless another component also needs it.

## A simple example of misplaced local state

```javascript
function App() {
  return (
    <div>
      <Header />
      <Main />
    </div>
  );
}

function Main() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser().then(setUser);
  }, []);

  return <Profile user={user} />;
}
```

If `user` is needed by `Header`, `Main` is a poor owner for it.

A better approach is to fetch closer to the shared owner, or to use a server-state layer.

## The right balance

The goal is not to minimize `useState`.

The goal is to match state to responsibility.

```text
UI-only temporary value → local useState
Shared UI value → lift or context
Server data → server state layer
Derived value → compute, don't store
```

## Interview questions you should be able to answer

### 1. What does useState do?

It gives a component a piece of state that persists across renders and provides a way to request updates.

### 2. When is local state a good choice?

When the value is only relevant to one component or its subtree and is not shared application data.

### 3. When should you avoid useState for a value?

When the value is derived, owned elsewhere, shared broadly, or represents server state.

### 4. Why is duplicating a prop into local state often a bad idea?

Because it can drift out of sync with the parent and create two sources of truth.

### 5. What is the difference between local state and server state?

Local state is UI or component-local data. Server state is data that comes from, and often belongs to, the server and is shared or cached across the UI.

## Final mental model

```text
useState = local state primitive
local state = state owned by one component subtree
good local state = UI-only, temporary, not shared
bad local state = duplicated source of truth, derived, or server data
placement = smallest scope that still satisfies sharing
```

Or in one sentence:

> **`useState` is for local state, and local state is best when the value belongs to one component and does not need to be the source of truth for the rest of the UI.**

The next piece is how to share UI state across distant parts of the tree without turning everything into global state, which is what Context is for.
