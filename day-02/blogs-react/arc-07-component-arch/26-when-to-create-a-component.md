---
title: "When to Create a Component in React"
excerpt: "Not every piece of JSX deserves its own component. This post explains when splitting is worth it, when duplication is fine, and how to tell the difference between a real abstraction and noise."
tags: ["react", "component-design", "refactoring", "abstraction", "duplication", "components"]
---

# When to Create a Component in React

A common question in React is: when should I extract this into its own component?

There is no fixed rule like "extract at three lines" or "extract whenever you repeat something twice."

The answer depends on what the new component would make easier.

This post is about that decision.

## A useful framing

You write a separate component when it makes the system easier to:
- read
- reuse
- change
- test
- understand

That is the real question.

If the split does none of those, it may not be worth it yet.

## When extraction helps

### 1. When the piece has its own story

If a section of UI has a clear role, it may deserve its own component.

For example:

```javascript
function CommentForm({ onSubmit }) {
  return (
    <form>
      <input placeholder="Write a comment..." />
      <button type="submit">Post</button>
    </form>
  );
}
```

That is a coherent unit.

It has a job.

It is easy to name.

### 2. When it is repeated and likely to change together

If the same structure appears several times, and the repetition is real, extraction can help.

```javascript
function Badge({ label, variant }) {
  return <span className={`badge badge-${variant}`}>{label}</span>;
}
```

Now every place using badges gets one place to change.

### 3. When the UI is easier to read with a named boundary

Sometimes naming a piece helps the reader understand the page.

```javascript
function StatsPanel({ stats }) {
  return ...
}
```

That is clearer than one giant render function.

The name tells the reader what this part of the page is.

### 4. When you need independent behavior

If a part of the UI needs its own state, effects, or lifecycle, it may be a good candidate for a component.

```javascript
function LikeButton({ initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  ...
}
```

The behavior is local to that button.

### 5. When you want to evolve the piece separately

If a piece will change often, a separate component gives it a boundary.

That makes changes narrower.

It also makes it easier to test that piece on its own.

## When extraction is premature

### 1. When it is only a visual repetition

Sometimes two things look similar but are not the same idea.

If they are only visually similar, a shared component can become awkward.

```javascript
// Maybe two cards are not the same thing yet
function Card({ title, body, action }) {
  return ...
}
```

If the future variations will diverge a lot, a generic card may fight you.

### 2. When the abstraction is built from one use case

If you only have one use case, the abstraction may be guessing too much.

```javascript
function EmptyState({ title, message, icon }) {
  return ...
}
```

If you have only one empty state today, ask whether this is a real abstraction or just a dressed-up JSX block.

### 3. When the split hides what is happening

Sometimes a component hides too much context.

If a reader has to jump through many tiny files to understand the page, the split may be hurting more than helping.

Small is usually good.

But too many tiny pieces can also make the system harder to follow.

### 4. When the component name is vague

If you cannot give the component a meaningful name, the abstraction may be weak.

Vague names are a signal:

- `Wrapper`
- `Container`
- `Box`
- `CardInner`
- `ItemLayout`

These are often signs that the split is only cosmetic.

## Duplication is not always bad

Duplication gets a bad reputation, but sometimes it is better than a premature abstraction.

A little duplication can be fine if:

- the pieces are still changing
- the shared abstraction would be too general
- the different copies already differ in meaning

For example:

```javascript
// Two forms that look similar but behave differently
function LoginForm() { ... }
function SignupForm() { ... }
```

If their rules differ, sharing a single form component too early can make both harder to express.

## A practical decision model

Ask these questions:

```text
Does this piece have a clear identity?
Is it likely to be reused or varied?
Does naming it make the parent easier to read?
Does it carry its own behavior or state?
Will the abstraction make future changes easier?
Or is it just a cosmetic split?
```

If most answers point toward value, extract.

If not, leave it inside the current component for now.

## Concrete rules of thumb

```text
If it has one job, a name, and a role, it is probably a good component.
If it is just a block of JSX with no clear meaning, maybe not yet.
If two things are duplicated but differ in intent, keep them separate longer.
If duplication is increasing and the shape is stable, extract.
If a component needs its own state or behavior, that supports extraction.
If the abstraction has to stretch to fit all uses, it may be too early.
```

## A refactoring sequence

A sensible way to extract is:

1. Leave the code inline while you understand it.
2. Notice the shape getting repeated.
3. Notice the piece having a stable role.
4. Extract it once you are sure of the interface.
5. Clean up the props only after you know what varies.

This avoids the common trap of building an abstraction before you understand the pattern.

## A common mistake: extracting UI too early

A common mistake is extracting a component before you know what it should own.

That leads to component props that are awkward and full of flags.

```javascript
function SharedWidget({
  mode,
  showTitle,
  variant,
  extraAction,
  isCompact,
  ...
}) {
  ...
}
```

That usually means the abstraction was not ready yet.

## A common mistake: never extracting

The other mistake is refusing to extract anything.

A large component with many responsibilities becomes hard to read.

If the piece has a real role, extract it.

Do not keep every page as one giant function just because it is familiar.

## A balanced rule

```text
Do not extract too early.
Do not wait too long.
Extract when the component would be easier to name, reuse, understand, or change.
Keep duplication when the repetition is not yet a real pattern.
```

## Interview questions you should be able to answer

### 1. When should you extract a React component?

When the piece has a clear role, is reusable or varied, carries its own behavior, or makes the parent easier to read.

### 2. When might duplication be acceptable?

When the repeated pieces are not yet the same idea, or when sharing them would create a bad abstraction.

### 3. What is a sign that a component is too premature?

If the props are full of flags, the name is vague, or the abstraction has to stretch to fit all cases.

### 4. What is a sign that a component should be extracted?

If it has a clear identity, its own state or behavior, or a stable repeated shape.

### 5. What matters more than line count?

The meaning and role of the piece, not just how many lines it contains.

## Final mental model

```text
component = a piece with a clear role
extract = when naming, reuse, behavior, or readability justifies it
too early = vague props, forced abstraction, guessing the future
too late = giant components, hidden responsibilities
duplication = not evil by itself
rule = extract when it makes the system better, not just smaller
```

Or in one sentence:

> **Extract a React component when it earns its own name and boundary by making the code easier to read, reuse, or change—not just because a block of JSX exists.**

The next piece is about how React components get identified and why `key` matters when lists change.
