---
title: "Controlled and Uncontrolled Inputs in React"
excerpt: "Inputs in React can be controlled by React state or left to the DOM. This post explains the difference, why controlled inputs are the default in React, when uncontrolled inputs make sense, and how to avoid the common mistakes around input state."
tags: ["react", "forms", "controlled-inputs", "uncontrolled-inputs", "inputs", "state"]
---

# Controlled and Uncontrolled Inputs in React

Inputs are one of the first places people feel the difference between React and plain HTML.

In HTML, an input keeps its own internal state. You type, and the input updates itself.

In React, you can either let the input do that, or you can control it with React state.

Those two choices are called uncontrolled and controlled inputs.

## Uncontrolled inputs

An uncontrolled input is one where React does not control the value.

```javascript
function Form() {
  return <input name="email" defaultValue="me@example.com" />;
}
```

Here the input keeps its own value in the DOM.

React may know about it through a ref, but it does not drive the value.

This is similar to how inputs work in normal HTML.

Uncontrolled inputs are useful when you do not need to re-render based on every keystroke.

They can also be simpler for basic forms.

## Controlled inputs

A controlled input is one where React state is the source of truth.

```javascript
function Form() {
  const [email, setEmail] = useState("");

  return (
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  );
}
```

Now the input's value comes from React.

If the user types, `onChange` updates the state.

The state update triggers a re-render.

The input gets the new value from React.

This is the controlled pattern.

## Why React favors controlled inputs

Controlled inputs fit React's model better.

React wants the UI to be a function of state.

If an input's value lives in React state, the UI can stay consistent with that state.

That makes it easier to:

- validate as the user types
- force input format
- disable input based on conditions
- sync input value with other UI
- clear or reset the input
- enforce uppercase, numbers only, or other rules

For example:

```javascript
function UppercaseInput() {
  const [value, setValue] = useState("");

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value.toUpperCase())}
    />
  );
}
```

The input always shows the transformed value.

That is easier to express with a controlled input.

## The controlled input contract

A controlled input must have its value driven by React.

If you set `value` without an `onChange`, the input becomes read-only in practice.

```javascript
<input value={text} />
```

If `text` never changes, the user cannot type anything new.

That is because React keeps setting the value back to the same state.

So a controlled input needs both:

- `value` from state
- `onChange` to update state

## Controlled inputs can feel heavier

Controlled inputs require a state update per keystroke.

In simple cases, that is fine.

In large forms, the extra rendering can add up if not handled carefully.

That is one reason people sometimes reach for uncontrolled inputs.

The tradeoff is that you give up the React-driven model for that input.

## Uncontrolled inputs can be a better fit in some cases

Uncontrolled inputs make sense when:

- you only need the final value at submit time
- the input does not need to react to every keystroke
- you are integrating with a non-React component
- you want to avoid re-rendering on each keystroke
- the input is a simple field in a larger form

For example:

```javascript
function SimpleForm() {
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(inputRef.current.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" ref={inputRef} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

Here the input is uncontrolled. The value is read at submit time.

## Default values

Uncontrolled inputs often use `defaultValue` or `defaultChecked`.

```javascript
<input defaultValue="hello" />
```

Controlled inputs use `value`.

```javascript
<input value={text} />
```

A common mistake is to use `defaultValue` on a controlled input.

That does not work the way people expect, because `value` overrides it.

If you want to initialize a controlled input, initialize the state instead.

```javascript
const [text, setText] = useState("hello");
```

## A common mistake: mixing controlled and uncontrolled

You cannot switch an input back and forth between controlled and uncontrolled in a way that React expects.

If you conditionally pass `value`, you can get warnings or odd behavior.

```javascript
// problematic
<input value={cond ? text : undefined} />
```

A better pattern is to decide once whether the input is controlled.

If it is controlled, always pass `value` and `onChange`.

If it is uncontrolled, use `defaultValue` and read through a ref.

## A common mistake: trying to make React do less work by avoiding state

Some people avoid controlled inputs because they think state updates are expensive.

In many cases, that is not the real issue.

The real issue is usually that the form state is organized poorly, or that the component is re-rendering too much for unrelated reasons.

If the form is large, the solution is often:

- break the form into smaller components
- lift only the state that needs lifting
- use a form library for complex forms
- use controlled inputs where they matter and uncontrolled where they do not

## When to use controlled inputs

Controlled inputs are a good default when:

- you need to validate or transform input as the user types
- the input value affects other UI
- you need to disable or constrain the input dynamically
- you want React to own the input's truth
- you are building a small or medium form

They are the React-native way to handle input state.

## When to use uncontrolled inputs

Uncontrolled inputs are a good fit when:

- you only need the value once, usually at submit
- you want to avoid re-rendering on every keystroke
- the input is a simple field with no live React logic
- you are wrapping a third-party component that already manages its own internal state

They are a pragmatic choice, not a mistake.

## File inputs are uncontrolled by nature

File inputs are a special case.

You generally cannot force a file input's value from React.

The user chooses files through the browser.

So file inputs are usually uncontrolled.

```javascript
const inputRef = useRef(null);

function handleSubmit(e) {
  e.preventDefault();
  const file = inputRef.current.files[0];
  // ...
}

<input type="file" ref={inputRef} />
```

You read the files from the DOM rather than from React state.

## A practical rule

If the input's value matters as the user types, use a controlled input.

If the input's value only matters when the form is submitted, an uncontrolled input may be simpler.

If you need both, you can use a controlled input for the fields that need it and uncontrolled inputs for the rest.

## A compact model

```text
controlled input = React owns value
uncontrolled input = DOM owns value
controlled = good for validation, transformation, dynamic behavior
uncontrolled = good for simple final-value forms
defaultValue = uncontrolled initial value
value + onChange = controlled pattern
file input = usually uncontrolled
```

## Interview questions you should be able to answer

### 1. What is a controlled input?

An input whose value is driven by React state and updated through onChange.

### 2. What is an uncontrolled input?

An input that keeps its own value in the DOM and is usually read with a ref.

### 3. Why does a controlled input need both value and onChange?

Because without onChange, the input cannot update React state, and without value, React does not control the input.

### 4. When is an uncontrolled input a good choice?

When you only need the value at submit time or want to avoid re-rendering on every keystroke.

### 5. How do you initialize a controlled input?

By initializing the React state, not by using defaultValue.

## Final mental model

```text
controlled = React state is the value
uncontrolled = DOM is the value
controlled = live React control, good for validation and dynamic behavior
uncontrolled = simpler, good for final-value reading
don't mix = choose one pattern per input
file input = usually uncontrolled
```

Or in one sentence:

> **Controlled inputs let React own the input value and are the default when you need live control, while uncontrolled inputs are simpler when you only need the value at submit time.**

The next piece is how to handle validation and error state, which is where many forms become complicated.
