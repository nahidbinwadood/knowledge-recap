---
title: "Async Patterns in Real Code: Retries, Timeouts, and Concurrency Limits"
excerpt: "Most async bugs in production are not syntax errors. They are missing timeouts, unbounded parallelism, stale responses, and retries that never stop. This post collects the patterns that keep asynchronous code predictable."
tags: ["javascript", "async", "patterns", "fetch"]
---

# Async Patterns in Real Code

Knowing how promises work is not the same as writing reliable asynchronous code.

In real applications, the hard parts are usually:

- a request that never finishes
- a search that returns results for an old query
- a retry loop that hammers a failing server
- a hundred requests started at once
- a component that updates state after it unmounts

These are not language features.

They are patterns.

## 1. Retry with backoff

Network failures are often temporary. Retrying immediately is usually wrong.

This version waits longer after each failure:

```javascript
async function retry(operation, { retries = 3, baseDelay = 300 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        break;
      }

      const delay = baseDelay * 2 ** attempt;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

Usage:

```javascript
const users = await retry(
  () => fetchJson("/api/users"),
  { retries: 2, baseDelay: 500 }
);
```

The delays are:

```
attempt 0 → immediate
attempt 1 → 500ms
attempt 2 → 1000ms
```

### What should be retried?

Retry operations that are:

- network failures
- timeouts
- `429 Too Many Requests`
- `500` and `502`–`504` responses

Do not retry:

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- validation failures
- non-idempotent writes unless the server supports it

Retrying a validation error just wastes time. Retrying a payment request without an idempotency key can be dangerous.

### Add jitter

If many clients fail at the same time, fixed delays create a thundering herd.

```javascript
const delay = Math.random() * baseDelay * 2 ** attempt;
```

Jitter spreads retries out.

## 2. Timeout

A request without a timeout can hang indefinitely.

For `fetch`, use an abort signal:

```javascript
async function fetchWithTimeout(url, milliseconds) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, milliseconds);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
```

Usage:

```javascript
try {
  const response = await fetchWithTimeout("/api/slow", 5000);
  const data = await response.json();
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Request timed out");
  }
}
```

Modern environments support:

```javascript
const response = await fetch("/api/slow", {
  signal: AbortSignal.timeout(5000)
});
```

### A timeout wrapper for any promise

```javascript
function withTimeout(promise, milliseconds) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Operation timed out"));
    }, milliseconds);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}
```

This rejects the wrapper, but it does **not** cancel the underlying operation.

```
withTimeout(fetch(...), 3000)
        │
        ▼
rejects after 3s
        │
        ▼
the request may still be running
```

For requests that support cancellation, always prefer `AbortSignal`.

## 3. Concurrency limits

`Promise.all` starts everything at once.

```javascript
await Promise.all(ids.map(fetchUser));
```

For ten items, that is fine.

For ten thousand, it can:

- exhaust browser connection limits
- overwhelm your server
- trigger rate limiting
- increase memory usage

A concurrency limit runs a fixed number at a time.

```javascript
async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex++;

      results[index] = await worker(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    run
  );

  await Promise.all(workers);

  return results;
}
```

Usage:

```javascript
const users = await mapLimit(ids, 3, (id) => fetchUser(id));
```

Behavior:

```
ids:    [1, 2, 3, 4, 5, 6, 7, 8]
limit:  3

Start:  1, 2, 3
Then:   4 when one finishes
Then:   5 when another finishes
...
```

Results keep their original order, even though completion order may differ.

The core idea is a small pool of workers pulling from a shared index:

```
worker 1 ──► item 1 ──► item 4 ──► item 7
worker 2 ──► item 2 ──► item 5 ──► item 8
worker 3 ──► item 3 ──► item 6
```

## 4. Sequential versus parallel

The most common async performance mistake is awaiting independent work one by one.

Sequential:

```javascript
const user = await fetchUser();
const settings = await fetchSettings();
const notifications = await fetchNotifications();
```

Parallel:

```javascript
const [user, settings, notifications] = await Promise.all([
  fetchUser(),
  fetchSettings(),
  fetchNotifications()
]);
```

Use sequential only when there is a dependency:

```javascript
const user = await fetchUser();
const posts = await fetchPosts(user.id);
```

A useful rule:

```
Independent → start together → Promise.all
Dependent   → await in order
```

And when partial failure is acceptable:

```javascript
const results = await Promise.allSettled([
  fetchUser(),
  fetchSettings(),
  fetchNotifications()
]);

const succeeded = results
  .filter((result) => result.status === "fulfilled")
  .map((result) => result.value);

const failed = results
  .filter((result) => result.status === "rejected")
  .map((result) => result.reason);
```

## 5. Debounce plus cancellation

Search boxes need two different protections.

**Debounce** prevents a request on every keystroke.

**Cancellation** stops a request that is already in flight.

They solve different problems:

```
debounce  → do not start too often
abort     → stop what is already running
```

Combined:

```javascript
function createSearch() {
  let controller;
  let timer;

  return function search(query, onResults) {
    clearTimeout(timer);
    controller?.abort();

    timer = setTimeout(async () => {
      controller = new AbortController();

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        onResults(await response.json());
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      }
    }, 300);
  };
}
```

Without cancellation, slow responses can arrive out of order.

```
Type "rea"
  request A starts
Type "react"
  request B starts
  request B finishes
  request A finishes  ← overwrites the newer results
```

This is a **stale response** bug. Aborting the previous request prevents it.

## 6. Cancellation and cleanup

In React, asynchronous work often outlives the component that started it.

```javascript
useEffect(() => {
  const controller = new AbortController();
  let active = true;

  async function load() {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Could not load user: ${response.status}`);
      }

      const user = await response.json();

      if (active) {
        setUser(user);
      }
    } catch (error) {
      if (error.name !== "AbortError" && active) {
        setError(error);
      }
    }
  }

  load();

  return () => {
    active = false;
    controller.abort();
  };
}, [userId]);
```

Two guards are used:

```
controller.abort()  → stop the network request
active flag         → ignore results that still arrive
```

The flag is still useful because not every async operation supports cancellation.

## 7. Model loading and failure explicitly

Async UI has more states than "data or no data".

```javascript
const [state, setState] = useState({ status: "idle" });

async function load() {
  setState({ status: "loading" });

  try {
    const data = await fetchUsers();
    setState({ status: "success", data });
  } catch (error) {
    setState({ status: "error", error });
  }
}
```

Render:

```javascript
if (state.status === "loading") {
  return <Spinner />;
}

if (state.status === "error") {
  return <ErrorMessage error={state.error} />;
}

if (state.status === "success") {
  return <UserList users={state.data} />;
}

return null;
```

A single status field prevents impossible combinations such as:

```
loading = true
error = true
data = [...]
```

That combination should not be representable.

## 8. Fire-and-forget, but keep the error

Sometimes you intentionally do not want to wait.

```javascript
sendAnalytics(event);
```

If it rejects, you get an unhandled rejection.

Make the intention explicit:

```javascript
void sendAnalytics(event).catch(reportError);
```

`void` communicates that the promise is deliberately ignored. `catch` ensures failures are still handled.

Do not confuse this with forgetting to await.

```
Forgetting await     → probably a bug
void promise.catch() → deliberate
```

## 9. Guard against duplicate work

Repeated clicks can start repeated requests.

A simple guard helps:

```javascript
let saving = false;

async function save() {
  if (saving) {
    return;
  }

  saving = true;

  try {
    await updateProfile(profile);
  } finally {
    saving = false;
  }
}
```

For UI, also disable the button while saving. The guard protects against race conditions. The disabled state communicates why.

## Patterns at a glance

```
Problem                     Pattern
───────                     ───────
Temporary failure           retry with backoff
Request hangs               timeout + abort
Too many requests           concurrency limit
Independent requests        Promise.all
Partial failure allowed     Promise.allSettled
Stale response              abort previous request
Fast typing                 debounce + abort
Unmounted component         active flag + abort
Impossible UI states        explicit status field
Duplicate submissions       in-flight guard
```

## Anti-patterns

### 1. Unbounded parallelism

```javascript
await Promise.all(allUrls.map(fetch));
```

This is fine for small lists and dangerous for large ones.

### 2. Retrying everything

Retries should be selective. Blind retries can duplicate writes and amplify outages.

### 3. No cancellation

If the user navigates away or changes the query, the old work should stop.

### 4. Swallowing errors

```javascript
try {
  await save();
} catch {}
```

An empty catch hides failures. Handle, log, or rethrow deliberately.

### 5. `async` inside `forEach`

```javascript
items.forEach(async (item) => {
  await process(item);
});
```

This does not wait. Use `for...of` or `Promise.all`.

### 6. Wrapping promises unnecessarily

```javascript
return new Promise((resolve, reject) => {
  fetch(url).then(resolve).catch(reject);
});
```

Return the original chain instead.

### 7. Ignoring response status

```javascript
const data = await fetch(url).then((response) => response.json());
```

A `404` or `500` may parse into something that is not the data you expected. Check `response.ok`.

## Final mental model

Reliable async code answers four questions:

```
1. Can this fail?          → handle or retry
2. Can this hang?          → timeout and abort
3. Is this too much work?  → limit concurrency
4. Is this still relevant? → cancel or ignore stale results
```

Or in one sentence:

> **Async patterns are mostly about control: when work starts, how much runs at once, when it stops, and what happens to results that arrive too late.**

Once those four questions become habit, asynchronous code stops being fragile.
