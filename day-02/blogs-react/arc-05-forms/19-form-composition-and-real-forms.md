---
title: "Form Composition and Real Forms in React"
excerpt: "Real forms are rarely one input and one submit button. They have sections, dependent fields, loading, success, reset, and error recovery. This post explains how to compose forms, how to think about field arrays and dependent fields, and how to keep a form component from becoming a giant blob of state and handlers."
tags: ["react", "forms", "form-composition", "dependent-fields", "multi-step-forms", "react-hook-form"]
---

# Form Composition and Real Forms in React

A toy form is easy.

A real form is not.

Real forms have:

- many fields
- sections and groups
- dependent fields
- validation that changes as the user goes
- loading while submitting
- success and error states
- reset behavior
- sometimes multi-step flows

This post is about keeping those forms understandable instead of letting them grow into one giant component.

## Why forms get messy

Forms get messy because they mix several responsibilities:

- input state
- validation
- submission
- UI feedback
- structure
- conditional fields
- error display

If all of that lives in one component, the component becomes large and hard to change.

A better approach is to separate concerns and compose the form from smaller parts.

## Composition starts with boundaries

A good form is usually built from pieces like:

- a form shell that owns submission state
- field groups for related inputs
- individual field components for repeated patterns
- error display components
- buttons and actions

For example:

```text
LoginForm
  ├── FormHeader
  ├── FieldGroup
  │     ├── Input
  │     └── FieldError
  ├── SubmitButton
  └── FormFooter
```

This is not just cosmetic.

When each piece has a clear job, the form is easier to test, easier to change, and easier to reuse.

## A field component is a good abstraction

A field component can wrap the common pattern of:

- input
- label
- error message
- maybe a help text

```javascript
function Field({ label, error, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
```

Then:

```javascript
<Field label="Email" error={errors.email}>
  <input value={email} onChange={handleEmailChange} />
</Field>
```

This keeps the form body cleaner and gives you one place to style and structure fields.

## Don't make every field fully generic too early

A common trap is to try to build one universal field component that handles every possible kind of input, error, layout, and behavior.

That often leads to a component that is hard to understand and harder to extend.

A better path is to start with the form's real needs and extract only the patterns that actually repeat.

If two fields share most of their structure, extract a small abstraction.

If they differ a lot, keep them separate.

## Dependent fields need coordination

Dependent fields are fields whose meaning or validity depends on another field.

For example:

- a "country" field affects which "state" dropdown is relevant
- a "account type" field affects which additional fields are shown
- a "quantity" field affects the price total

These relationships can be handled by recomputing from state.

```javascript
const country = selectedCountry;
const stateOptions = statesForCountry(country);
```

Or:

```javascript
const showExtraFields = accountType === "business";
```

The important part is that the dependent behavior should usually come from state or props, not from hidden mutations or side effects.

If a field depends on another field, derive the dependency explicitly.

## Field arrays are a common source of complexity

A field array is a dynamic list of fields.

For example:

- a list of team members
- a list of phone numbers
- a list of line items

These are harder because you need to support:

- add
- remove
- reorder
- validate each item
- validate the array as a whole

A good approach is to treat the array as structured data and the UI as a rendering of that data.

```javascript
const [items, setItems] = useState([{ name: "" }]);

function addItem() {
  setItems([...items, { name: "" }]);
}

function removeItem(index) {
  setItems(items.filter((_, i) => i !== index));
}

function updateItem(index, value) {
  setItems(items.map((item, i) => {
    if (i !== index) return item;
    return { ...item, name: value };
  }));
}
```

Then render:

```javascript
{items.map((item, index) => (
  <FieldGroup key={index}>
    <input value={item.name} onChange={(e) => updateItem(index, e.target.value)} />
    <button type="button" onClick={() => removeItem(index)}>Remove</button>
  </FieldGroup>
))}
```

The exact implementation depends on the form, but the idea is to keep the data structure clean and the UI derived from it.

## Multi-step forms need state for the step

A multi-step form is usually not just one big form with a few hidden fields.

It is a flow with steps.

You need state for:

- the current step
- the values entered so far
- validation per step
- whether the user can move forward
- whether the user can go back

A simple model:

```javascript
const [step, setStep] = useState(1);
const [values, setValues] = useState(defaultValues);
const [errors, setErrors] = useState({});
```

Then:

```javascript
function nextStep() {
  if (canMoveToStep(step + 1, values)) {
    setStep(step + 1);
  }
}

function prevStep() {
  setStep(step - 1);
}
```

The key is to keep the values persisted across steps and only validate the step the user is on when it is time to move.

## Submit state should be explicit

Real forms should not leave the user guessing.

During submission, the form should communicate:

- that it is submitting
- that the submit button may be disabled
- that the result is pending

After submission, it should communicate:

- success
- error
- whether the form can be resubmitted

A common pattern is a status state.

```javascript
const [status, setStatus] = useState("idle");
// idle, submitting, success, error
```

Then:

```javascript
if (status === "submitting") {
  return <button disabled>Submitting...</button>;
}
```

This is better than relying on a generic loading spinner that is disconnected from the form logic.

## Reset is part of the contract

A form should usually know how to reset.

Reset can mean:

- clear all fields
- restore default values
- clear errors
- return to the initial step

If you are using controlled state, reset is just setting state back to the initial values.

If the form uses a library, use the library's reset method.

The important thing is that reset is intentional, not a pile of manual clears.

```javascript
const initialValues = { email: "", password: "" };
const [values, setValues] = useState(initialValues);

function resetForm() {
  setValues(initialValues);
  setErrors({});
  setStatus("idle");
}
```

## Validation in real forms is often layered

Real forms usually have:

- client validation for immediate feedback
- server validation for things the client cannot know
- submission-time validation for the final check

The layers need to fit together.

For example:

- client validates format
- server validates uniqueness
- the client shows server errors in the same error structure when possible

If the layers are disjointed, the user gets inconsistent feedback.

## Avoid putting everything in one handler

A common mistake is to write one giant submit handler that does everything.

```javascript
function handleSubmit() {
  // validate
  // set loading
  // fetch
  // handle error
  // handle success
  // reset
  // track analytics
  // update global state
}
```

That is hard to maintain.

A better approach is to keep the handler focused on coordination and move the detailed logic into smaller functions or hooks.

```javascript
function handleSubmit() {
  const validationErrors = validateForm(values);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  setStatus("submitting");
  submitForm({ values, onSuccess, onError });
}
```

The form still owns the flow, but the pieces are clearer.

## Form libraries help, but the architecture is still yours

Libraries like React Hook Form can reduce boilerplate for state, validation, and submission.

But they do not decide:

- how your form is structured
- where validation messages appear
- how multi-step flows work
- how dependent fields behave
- how errors are displayed

Those are still design decisions.

A good library should make the architecture easier, not replace it.

## A practical rule for real forms

When a form starts to grow, ask:

```text
Which part owns submission state?
Which part owns field state?
Which part owns validation?
Which parts can be extracted into components?
Which parts can be extracted into a hook?
Where do dependent fields get their values?
How does reset work?
How does the user know the form is submitting or succeeded?
```

If you can answer these clearly, the form is likely in good shape.

## A compact model

```text
form = shell + fields + actions + error display
field component = reusable input/label/error wrapper
dependent fields = derive from state explicitly
field arrays = structured data with add/remove/update
multi-step = step state + preserved values + step validation
submit state = explicit idle/submitting/success/error
reset = intentional restoration of initial state
validation = layered: client, server, submission
```

## Interview questions you should be able to answer

### 1. Why is form composition important?

Because it keeps field, validation, submission, and error logic separated and easier to maintain.

### 2. What is a good use of a field component?

Wrapping label, input, and error display so the form body stays clean.

### 3. How should dependent fields be handled?

By deriving their options or visibility from state or props, not from hidden mutations.

### 4. What is a field array?

A dynamic list of fields where items can be added, removed, updated, and validated.

### 5. Why should submit state be explicit?

Because the user needs to know whether the form is idle, submitting, successful, or in error.

## Final mental model

```text
real form = structure + state + validation + submission
compose = break the form into clear parts
field component = reusable input wrapper
dependent fields = derived from state
field array = list of structured items
multi-step = preserve values across steps
submit state = explicit and visible
reset = restore initial state cleanly
```

Or in one sentence:

> **A real form is easier to maintain when you compose it from clear parts, keep dependent fields derived from state, and make submit, error, reset, and step state explicit instead of burying them in one large component.**

That finishes Arc 5. Now I'll write Arc 6 — Server and async state.
