---
title: "Data Fetching Patterns in React"
excerpt: "Fetching data in React is easy to start and easy to mess up. This post explains the common patterns, why request waterfalls happen, when to start requests, and how to think about parallel and dependent fetching without turning every component into an effect maze."
tags: ["react", "data-fetching", "async", "waterfall", "parallel-fetching", "effects"]
---

# Data Fetching Patterns in React

Data fetching is one of the most common things React apps do, and one of the easiest places to create hidden performance and correctness problems.

The basic idea is simple.

```javascript
useEffect(() => {
  fetchSomething();
}, []);
```

But real apps usually need more than one fetch, and the way those fetches relate to each other matters a lot.

This post is about the common patterns and the mistakes that show up when fetching becomes part of the component tree.

## The simplest pattern: fetch on mount

A common starting point is to fetch when the component mounts.

```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/users/${userId}`)
      .then((res) => res.json())
      .then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

This works for a single piece of data.

The problem is that many UIs are not one fetch. They are several fetches that may depend on each other.

## Dependent fetching

Dependent fetching means one request depends on the result of another.

```javascript
function UserDashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch(`/users/${userId}`)
      .then((res) => res.json())
      .then((user) => {
        setUser(user);
        return fetch(`/projects?ownerId=${user.id}`);
      })
      .then((res) => res.json())
      .then(setProjects);
  }, [userId]);

  return <div>{user?.name} has {projects.length} projects</div>;
}
```

This is sometimes necessary.

But it can also create a chain.

If each step waits for the previous one, the total time is the sum of the steps.

That is where waterfalls come from.

## Request waterfalls

A waterfall is when requests happen one after another instead of together.

```text
fetch user
  → user loaded
    → fetch projects
      → projects loaded
        → fetch notifications
```

This can be slow.

If those requests are independent, they should start together.

```text
fetch user
fetch projects
fetch notifications
  ↓
all complete
```

The difference is not just speed. It is also perceived latency.

Users feel the difference between one wait and several waits.

## Parallel fetching

Parallel fetching starts independent requests at the same time.

```javascript
function Dashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userPromise = fetch(`/users/${userId}`).then((r) => r.json());
    const projectsPromise = fetch(`/projects?ownerId=${userId}`).then((r) => r.json());
    const notificationsPromise = fetch(`/notifications?userId=${userId}`).then((r) => r.json());

    Promise.all([userPromise, projectsPromise, notificationsPromise]).then(([user, projects, notifications]) => {
      setUser(user);
      setProjects(projects);
      setNotifications(notifications);
    });
  }, [userId]);

  return <div>...</div>;
}
```

This is usually better when the requests do not depend on each other.

The key point is to start the requests before awaiting them.

A common mistake is:

```javascript
const user = await fetchUser();
const projects = await fetchProjects(user.id);
```

If `fetchProjects` only depends on `userId`, it could have started earlier.

## The "await in render" mistake

You cannot await in the component body.

```javascript
// not allowed
const data = await fetchSomething();
```

So people use effects.

But effects have their own limitations.

They run after render. They are not a generic data-loading system. They are a synchronization mechanism.

That is why data fetching patterns matter: because the fetching logic often sits right next to rendering logic, and the two can get tangled.

## Fetching based on props or state

A common pattern is to fetch when a parameter changes.

```javascript
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

This is fine for many cases.

But it can also create waterfalls if one component fetches, passes data down, and then a child fetches again based on that data.

Sometimes that is unavoidable.

Sometimes it is a sign that the data should be fetched higher up or in a more coordinated way.

## The problem with scattered fetches

If every component fetches its own data, you can end up with:

- many small fetches
- duplicate work
- inconsistent timing
- hard-to-follow data flow
- loading states that are local and fragmented

This is not always wrong. Sometimes components really do own their own data.

But if the same data is needed in many places, scattering fetches can get messy.

That is one reason people move fetching toward a shared layer or a higher-level component.

## Composition can help

A common pattern is to separate data from rendering.

```javascript
function UserProfile({ user }) {
  return <div>{user.name}</div>;
}

function UserProfilePage({ userId }) {
  const user = useUser(userId);
  return <UserProfile user={user} />;
}
```

Here `useUser` or a parent component is responsible for fetching.

`UserProfile` just renders.

This is useful because it lets you test the presentational part separately and keep fetching concerns in one place.

## When dependent fetching is the right pattern

Dependent fetching is not always a mistake.

If you genuinely need the result of one request to build the next request, sequential fetching is correct.

```javascript
const user = await fetchUser(userId);
const accessToken = user.token;
const projects = await fetchProjects(accessToken);
```

The mistake is using sequential fetching when the requests are actually independent.

## When parallel fetching is the right pattern

Parallel fetching is right when the requests are independent.

```javascript
const [user, posts, settings] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
  fetchSettings(userId)
]);
```

This is usually the fastest simple pattern for independent data.

## Loading states for multiple fetches

Parallel fetching creates a new problem: what do you show while waiting?

You can:

- show a single loading state for the whole page
- show partial data as it arrives
- skeleton placeholders
- per-section loading states

There is no single right answer.

But the important thing is to make the choice deliberately.

If you use `Promise.all`, all requests complete together, which simplifies loading state.

If you fetch independently, you may want partial UI updates.

## Error handling for multiple fetches

Multiple fetches also create multiple error paths.

If one fetch fails, what happens to the rest?

- fail the whole page
- show the rest and an error for the failed part
- retry the failed part
- show a fallback

Again, there is no universal answer.

But the point is that multiple fetches create multiple failure modes, and the UI should account for that.

## A practical rule

When fetching data, ask:

```text
Are these requests independent?
Can any of them start earlier?
Do the requests need to happen in order?
Where should the fetch live?
How should loading and error be shown for each part?
```

If you answer these questions clearly, the fetching pattern is usually easier to get right.

## A compact model

```text
mount fetch = simple, good for one piece of data
dependent fetch = one request needs another result
parallel fetch = independent requests start together
waterfall = accidental sequential fetches
composition = separate fetching from rendering
loading = can be global or per-section
error = can be local or combined
rule = start independent requests as early as possible
```

## Interview questions you should be able to answer

### 1. What is a request waterfall?

When requests happen one after another because each depends on the previous one, even when they could have started together.

### 2. Why is parallel fetching better for independent requests?

Because it reduces total waiting time.

### 3. When is dependent fetching appropriate?

When one request genuinely needs the result of another.

### 4. Why can scattered fetches become a problem?

Because they can create duplicate work, fragmented loading states, and inconsistent data flow.

### 5. What is a good way to separate fetching from rendering?

By fetching in a parent component or hook and passing the data down to a presentational component.

## Final mental model

```text
fetch on mount = simple starting pattern
depend on result = sometimes necessary
independent requests = start together
waterfall = slow, often accidental
composition = cleaner data/render split
loading and error = need deliberate design
rule = minimize waits by starting early
```

Or in one sentence:

> **Data fetching in React is easiest to get wrong when requests are started too late or too separately, so the main goal is to start independent requests together and keep fetching logic from spreading through every component.**

The next piece is what happens after the fetch: caching and invalidation, which is where async state usually becomes more complex than a single request.
