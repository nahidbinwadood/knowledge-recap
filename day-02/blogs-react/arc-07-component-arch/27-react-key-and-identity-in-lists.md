---
title: "Keys and Identity in React Lists"
excerpt: "Keys are not about performance magic. They tell React which list item is which when the list changes. This post explains what keys do, why stable identity matters, what happens with bad keys, and how to choose key values responsibly."
tags: ["react", "lists", "key", "identity", "reconciliation", "rendering"]
---

# Keys and Identity in React Lists

React uses `key` to keep track of list items.

That sounds simple, but `key` is often misunderstood.

People hear "keys improve performance" and stop there.

That is not really the point.

The real point is identity.

React needs to know which item in the old list corresponds to which item in the new list.

## What a key is for

When you render a list:

```javascript
function ItemList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

React sees a set of elements.

If the list changes, React needs to figure out what changed.

Did an item get added?

Did one get removed?

Did two get reordered?

Did one get updated?

Keys help React answer that.

## The simplest mental model

Think of keys as identity markers.

```text
item without key = "I don't know who you are"
item with key = "I know which one you are"
```

Without a stable identity, React has to guess.

With a good key, React can match old items to new items more reliably.

## Why React needs this at all

Imagine a list changing from:

```javascript
[
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
]
```

to:

```javascript
[
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 4, name: "Diana" }
]
```

If React only looks at position, it may think:

- position 0 is the same
- position 1 is the same
- position 2 is a new item

That might be wrong if the actual change was different.

A key helps React see that item `3` disappeared and item `4` appeared.

## The common mistake: using index as a key

A common pattern is:

```javascript
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}
```

Using index as a key is not always a disaster, but it can cause problems.

The issue is that index changes when the list changes.

```text
before: [A, B, C]   -> keys 0, 1, 2
after:  [B, A, C]   -> keys 0, 1, 2 again, but for different items
```

Now React may associate the wrong identity with the wrong position.

That can lead to:

- unnecessary re-renders
- wrong local state
- confusing behavior when items are reordered or removed

## A concrete problem with index keys

Imagine each item has its own input.

```javascript
{items.map((item, idx) => (
  <li key={idx}>
    <input defaultValue={item.name} />
  </li>
))}
```

If the list reorders, React may keep the input state attached to the wrong visual position.

That happens because index is positional, not identity-based.

## When index as key is less harmful

Index keys are less problematic when:

- the list is static
- items are not reordered
- items are not removed in the middle
- the component has no local state tied to identity
- the list is a simple one-time render

Even then, it is usually better to use a real identifier if one exists.

## What makes a good key

A good key is:

- unique among siblings
- stable over time
- tied to the item's identity, not its position

For example:

```javascript
key={item.id}
key={user.uuid}
key={todo.id}
```

These are better than:

```javascript
key={index}
key={item.name} // risky if names repeat or change
key={Math.random()} // unstable and breaks reconciliation
```

## Unstable keys are harmful

If the key changes every render, React cannot match the item to itself.

```javascript
key={Math.random()}
```

That defeats the purpose.

React may treat the item as new every time.

That can cause problems with:

- state
- focus
- animation
- performance
- expected reconciliation

## Keys are local to the list

Keys only need to be unique among siblings.

They do not need to be globally unique across the whole app.

So in one list, `id` is fine.

In another list elsewhere, `id` can also be fine.

They just need to be unique within that sibling group.

## What happens when keys are missing

If you omit keys in a map, React will usually warn.

It will also fall back to using index-based matching internally.

So the practical issue is not "React breaks."

The issue is that you lose the benefit of identity.

## Keys and state in child components

A common confusion is:

"Why is my component's state resetting when the list changes?"

That often happens because the identity changed.

For example:

```javascript
function ItemRow({ item }) {
  const [text, setText] = useState("");
  return <input value={text} onChange={...} />;
}
```

If React thinks the item is new, it may remount the component.

Then state resets.

If the item is the same by key, React is more likely to preserve the component instance and its state.

That is one reason keys matter beyond "looking nice."

## A better list example

```javascript
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

Here each `TodoItem` gets an identity based on `todo.id`.

If the list is reordered, React can match items more intelligently.

If a todo is removed, only that one is affected.

If a todo is added, only the new one is inserted.

## What keys do not do

Keys:

- do not magically make lists faster in every case
- do not replace good component design
- do not solve every reconciliation issue
- do not make identity meaningful if the key itself is wrong

Keys are about matching.

They are not a performance silver bullet.

## Related idea: stable ID sources

When possible, use IDs that come from the data model.

For example:

```text
database id
uuid
stable business key
```

Avoid keys that depend on:

```text
render order
temporary index
random values
changing text content
```

If you do not have a stable ID, you may need to think about where identity should come from.

Sometimes the data itself needs an ID.

## Common interview questions

### 1. What is the purpose of the key prop in React?

It helps React identify which items in a list correspond to which items after a change.

### 2. Why is using index as a key sometimes problematic?

Because index is positional, and position can change when the list changes, which can break identity tracking.

### 3. What makes a good key?

A unique, stable identifier that reflects the item's real identity.

### 4. Do keys need to be globally unique?

Not globally. They need to be unique among sibling elements in the same list.

### 5. What happens if keys change every render?

React may treat the items as new each time, which can cause remounting and state loss.

## Final mental model

```text
key = identity marker for a list item
good key = unique, stable, tied to the item
bad key = positional, random, or changing
index as key = sometimes OK, often risky
keys matter because = they help React match old items to new items
main cost of bad keys = wrong behavior, not just slower rendering
rule = use a real identifier when one exists
```

Or in one sentence:

> **A key in React is not a performance trick; it is the label React uses to know which list item is which when the list changes, so stable identity matters more than the key itself.**

The next piece is about separating how behavior varies from how it looks: presentational and container components.
