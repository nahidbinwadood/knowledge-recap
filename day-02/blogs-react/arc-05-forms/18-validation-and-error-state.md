---
title: "Validation and Error State in React Forms"
excerpt: "Validation is where many forms go from simple to messy. This post explains how to think about field errors, submission errors, validation timing, error shapes, and how to keep error state close to the form instead of scattering it through the UI."
tags: ["react", "forms", "validation", "error-state", "react-hook-form", "zod"]
---

# Validation and Error State in React Forms

Validation is one of the places where forms become surprisingly complicated.

At first it looks simple:

> check the input, show an error if it is wrong

But in practice, validation touches:

- when you validate
- what you validate
- how you store errors
- how you show errors
- what happens on submit
- what happens after a successful submit
- how server errors fit in

This post is about keeping that complexity manageable.

## Two kinds of errors

A useful distinction is between:

1. Field errors
2. Submission errors

Field errors are about a specific input.

```text
"Email is required"
"Password is too short"
```

Submission errors are about the whole form attempt.

```text
"Email already exists"
"Server error"
"Session expired"
```

These are different enough that they should usually be handled differently.

Field errors are often shown next to individual fields.

Submission errors are often shown at the top of the form or near the submit button.

## When to validate

There are three common timing choices:

1. On change
2. On blur
3. On submit

On change validation is the most aggressive.

```javascript
function Field({ validate, value, onChange }) {
  const error = validate(value);
  return <input value={value} onChange={onChange} />;
}
```

This can be helpful for real-time feedback, but it can also be annoying if the user sees errors before they have finished typing.

On blur validation is often a better default for field-level errors.

The idea is:

> Validate a field when the user leaves it.

That feels more natural for many forms because the user has had a chance to finish the field.

On submit validation is the most common for overall correctness.

Even if you validate on blur, you still usually validate everything again on submit.

Why?

Because the user may skip fields, or the state may have changed, or you may want to make sure the whole form is valid before sending it.

A common pattern is:

- validate on blur for field-level feedback
- validate on submit for the final check
- re-validate fields when the user returns to them after errors

## What to validate

Validation usually answers questions like:

- Is the field required?
- Is the value the right format?
- Is the value within allowed ranges?
- Is the value consistent with other fields?
- Is the value available or unique?

Some validation is local.

```text
Password must be at least 8 characters.
```

Some validation is relational.

```text
Confirm password must match password.
```

Some validation is async or server-side.

```text
Email is already taken.
```

Local validation is usually easiest to handle in the UI.

Server validation usually comes back as part of the submission result and needs to be merged back into error state.

## Error shape

How you store errors matters.

A simple and common shape is:

```javascript
const errors = {
  email: "Email is required",
  password: "Password is too short"
};
```

This maps field names to error messages.

It is easy to use for field-level errors.

For submission errors, you may want a separate shape.

```javascript
const submitError = "Email already exists";
```

Or:

```javascript
const errors = {
  fields: {
    email: "Invalid email"
  },
  submit: "Email already exists"
};
```

The point is not to pick the perfect schema. The point is to separate field errors from form-level errors so they do not get mixed together by accident.

## Keeping error state close to the form

A common mistake is to scatter error handling across many components.

For example, each field might try to manage its own errors in a way that is hard to coordinate.

Better is to keep the form's error state in one place, or at least in one clear ownership boundary.

If you are using controlled inputs, the form component often owns the errors.

```javascript
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  function validate() {
    const next = {};
    if (!email) next.email = "Email is required";
    if (!password) next.password = "Password is required";
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // submit
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {errors.email && <span>{errors.email}</span>}

      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      {errors.password && <span>{errors.password}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

This keeps errors in the same component as the submission logic.

That is often a good default for small forms.

## Validation functions should be predictable

A validation function should usually be pure or close to it.

It should take the current form values and return errors.

```javascript
function validateForm(values) {
  const errors = {};
  if (!values.email) errors.email = "Email is required";
  if (!values.password) errors.password = "Password is required";
  return errors;
}
```

This is easier to test and reuse than a validation function that reaches into the DOM or relies on hidden state.

## Don't validate too early

A common mistake is to show errors before the user has had a chance to interact.

For example, showing "Email is required" on the first render can be alarming.

A better pattern is often to validate fields after interaction.

You can track touched fields.

```javascript
const [touched, setTouched] = useState({});
```

Then show a field error only when the field has been touched.

```javascript
{errors.email && touched.email && <span>{errors.email}</span>}
```

This reduces noise and makes the form feel more polite.

## Clear errors when the user fixes them

If a user fixes a field, the error should usually go away.

You can do this by re-validating on change or on blur.

```javascript
function handleEmailChange(e) {
  setEmail(e.target.value);
  const newErrors = validateField("email", e.target.value);
  setErrors({ ...errors, email: newErrors.email });
}
```

Or you can recompute the whole error object from state on each change.

This is one reason schema-based validation libraries are popular: they make it easier to recompute errors from values consistently.

## Server errors need to fit into the same UI

When the server returns an error, you need to decide where it goes.

Sometimes it is a field-level error.

```text
"Email is already taken"
```

Sometimes it is a form-level error.

```text
"Account locked"
```

Sometimes it is a network error.

```text
"Unable to connect"
```

You should map these into your error state in a consistent way.

If the server returns field-level errors, merge them into the field errors.

If the server returns a global error, put it in the submit error area.

This keeps the UI coherent.

## Submission state is not the same as error state

A form usually has several states:

- idle
- validating
- submitting
- success
- error

These are not all the same thing.

You should not confuse "submitting" with "error."

```javascript
const [status, setStatus] = useState("idle");
```

Or:

```javascript
const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState(null);
const [success, setSuccess] = useState(false);
```

The right split depends on the form, but the key idea is that submission state and error state are related but not identical.

## Avoid boolean flag soup

A common mistake is to use many booleans.

```javascript
const [invalid, setInvalid] = useState(false);
const [touched, setTouched] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState(false);
const [success, setSuccess] = useState(false);
```

This can work, but it can also become hard to keep consistent.

If you find yourself constantly syncing flags, it is a sign to use a more explicit state model.

For example:

```javascript
const [status, setStatus] = useState("idle");
const [errors, setErrors] = useState({});
```

That is often easier to reason about than five independent booleans.

## Validation libraries help, but the ideas matter more

Libraries like React Hook Form and Zod make forms easier, but they are not a replacement for understanding the concepts.

The concepts are:

- when to validate
- what to validate
- how to store errors
- how to show errors
- how to handle server errors
- how to keep error state close to the form

A library can reduce boilerplate, but it cannot decide the UX policy for you.

## A practical rule

For field errors:

- validate after interaction when possible
- show errors near the field
- clear errors when the field is corrected

For submission errors:

- validate the whole form before sending
- show form-level errors separately
- merge server errors into the same error structure when possible

For the form as a whole:

- keep error state near the form
- avoid boolean flag soup
- keep the error shape consistent

## A compact model

```text
field error = per-field validation problem
submission error = whole-form or server problem
timing = on blur or change for fields, on submit for final check
touched = helps avoid showing errors too early
error shape = map of fields + optional form-level error
server errors = merged into the same error structure
submission state = separate from error state
```

## Interview questions you should be able to answer

### 1. What is the difference between field errors and submission errors?

Field errors are about individual inputs. Submission errors are about the whole form or a server response.

### 2. Why validate on blur instead of on every change?

Because validating too early can show errors before the user has finished typing.

### 3. Why track touched fields?

To avoid showing errors before the user has interacted with a field.

### 4. How should server errors fit into form state?

They should be merged into the same error model or shown as form-level errors, depending on the type of error.

### 5. Why is error state often better kept near the form?

Because it keeps validation and submission logic in one place and avoids scattering error handling across many components.

## Final mental model

```text
validation = when, what, and how
field errors = per-field, shown near the field
submission errors = whole-form, shown separately
touched = gate for early errors
error state = keep it close to the form
server errors = merge into the same model
avoid flag soup = use explicit status and error shapes
```

Or in one sentence:

> **Good form error handling separates field errors from submission errors, validates at the right time, keeps error state close to the form, and merges server errors into a consistent error model.**

The next piece is what happens when forms get more complex: multi-step flows, dependent fields, and real form composition.
