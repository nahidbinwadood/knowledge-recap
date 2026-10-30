---
title: "State Machines and Complex State in React"
excerpt: "As components grow, boolean flags and ad-hoc state often turn into a tangle of impossible combinations. This post explains finite state thinking in React, when a reducer helps, when it is overkill, and how to keep complex state understandable without over-engineering it."
tags: ["react", "state", "state-machines", "reducer", "useReducer", "complex-state"]
---

# State Machines and Complex State in React

Simple components usually have simple state.

A toggle is on or off.

A counter goes up and down.

A form is editing or submitting or idle.

But as state grows, it is easy to end up with a bunch of booleans that do not stay consistent.

```javascript
const [loading, setLoading] = useState(false);
const [ submitting, setSubmitting] = useState(false);
const [success, setSuccess] = useState(false);
const [error, setError] = useState(false);
```

Now you have to keep all of them in sync.

If `success` is true, is `loading` still true?

If `error` is true, is `submitting` still true?

This is the point where state starts to become a small state machine whether you name it that or not.

## The problem with scattered booleans

Booleans are easy to start with and hard to scale.

```javascript
const [isOpen, setIsOpen] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
```

Each flag can be true or false.

That gives you many possible combinations.

Some combinations may be invalid.

For example:

- loading and error at the same time
- open and loading at the same time
- success and loading at the same time

If you manage these with separate setters, you can end up in bad states by accident.

## A better way to think about it

Instead of many independent flags, think about the possible states the component can be in.

For a fetch flow, that might be:

- idle
- loading
- success
- error

Those are mutually exclusive states.

At any given moment, the component is in one of them.

That is a finite state model.

You do not have to use a formal state machine library to benefit from this way of thinking.

You just need to stop treating unrelated booleans as if they were the whole picture.

## A simple reducer example

One way to express this is with a reducer.

```javascript
function fetchReducer(state, action) {
  switch (action.type) {
    case "START":
      return { status: "loading" };
    case "SUCCESS":
      return { status: "success", data: action.data };
    case "ERROR":
      return { status: "error", message: action.message };
    case "RESET":
      return { status: "idle" };
    default:
      return state;
  }
}
```

Now the state has a clear shape.

Transitions are explicit.

You cannot accidentally set both `loading` and `success` because the reducer chooses one status at a time.

## When a reducer helps

A reducer is useful when:

- the state has several related pieces
- transitions should be controlled
- invalid combinations should be impossible or hard to express
- the next state depends on the previous state in a structured way

A form submission flow is a good example.

```javascript
function submitForm() {
  dispatch({ type: "START" });
  // ...
  // on success
  dispatch({ type: "SUCCESS", data });
  // on failure
  dispatch({ type: "ERROR", message });
}
```

This is clearer than setting multiple booleans independently.

## When a reducer is overkill

Not every component needs a reducer.

If you have one or two related values and the transitions are simple, `useState` may be enough.

```javascript
const [isOpen, setIsOpen] = useState(false);
```

A reducer is probably overkill for:

- a single boolean
- a simple counter
- a value that does not have complex transitions
- state that is easy to keep consistent with a small number of setters

Do not introduce a reducer just because it sounds sophisticated.

Use it when the state logic is genuinely complex enough to benefit from explicit transitions.

## State machines are about transitions

The key idea is not the word "machine."

The key idea is transitions.

State machines make transitions explicit.

```text
idle -> loading
loading -> success
loading -> error
error -> idle
success -> idle
```

If you write those transitions down, you often find bugs before you implement them.

For example:

- Can you go from idle directly to success?
- Can you retry after error?
- What happens when the component unmounts during loading?
- What happens if the user clicks submit twice?

Thinking in transitions forces you to answer these questions.

## You can model state without a library

You do not need XState or any formal tool to use state machine thinking.

You can start with:

- a simple string or enum for the current state
- a reducer to handle transitions
- a component that renders differently based on state

For many UI components, that is enough.

The library route is useful when the logic becomes large or when you want formal visualization and stronger enforcement.

But the mental model is the important part.

## A UI example

Imagine a submit button.

```javascript
function SubmitButton() {
  const [status, setStatus] = useState("idle");

  const handleSubmit = async () => {
    setStatus("loading");
    try {
      await submitApi();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "loading") return <button>Saving...</button>;
  if (status === "success") return <button>Saved</button>;
  if (status === "error") return <button>Retry</button>;
  return <button onClick={handleSubmit}>Submit</button>;
}
```

This is simple, but it already benefits from thinking in states.

The button renders differently depending on `status`.

The transitions are still a bit loose, but the idea is there.

If the flow becomes more complex, you can tighten it with a reducer or a more explicit model.

## The danger of mutating state in many places

Complex state gets harder when many parts of the component can change it.

If one effect, one handler, and another effect all touch the same state in different ways, it becomes hard to predict what the next state should be.

A reducer helps by centralizing transitions.

Even if you do not use a real reducer function, the principle is useful:

> Make state changes go through a small number of well-defined paths.

## Derived state and state machines can work together

State machines do not replace derived state.

They complement it.

For example:

```javascript
const isSubmitting = status === "loading";
const hasSucceeded = status === "success";
const hasError = status === "error";
const canRetry = status === "error";
```

These are derived from the machine state.

They are not separate flags.

That keeps the component consistent.

## A practical rule

When state starts to feel tangled, ask:

```text
What are the possible states?
What transitions are allowed?
What should not happen?
What drives each transition?
```

If you can answer these questions, you are already thinking like a state machine designer.

## A compact model

```text
booleans = easy to start, hard to keep consistent
state machine = explicit states and transitions
reducer = one way to enforce transitions
useReducer = helpful when transitions matter
overkill = simple values with simple transitions
derived state = still useful on top of state machines
```

## Interview questions you should be able to answer

### 1. Why can many booleans be a problem?

Because they allow invalid combinations and make it hard to keep the UI consistent.

### 2. What is a finite state approach?

Modeling the component as being in one of several explicit states with defined transitions.

### 3. When is useReducer a good choice?

When state transitions are complex, related, or need to be controlled centrally.

### 4. When is a reducer overkill?

When the state is simple and the transitions are easy to manage with useState.

### 5. Do you need a state machine library for this?

Not always. The mental model is often enough. Libraries help when the logic gets large or needs stronger enforcement.

## Final mental model

```text
state grows → booleans multiply → invalid combinations appear
solution → explicit states and transitions
reducer → one way to enforce those transitions
derived values → stay consistent with the machine state
rule → use state machine thinking when complexity grows, not before
```

Or in one sentence:

> **When state becomes a tangle of flags, finite state thinking helps by making the possible states and transitions explicit, and a reducer is one practical way to enforce them in React.**

That finishes Arc 4. Now I'll write Arc 5 — Forms and user input.
