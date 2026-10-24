---
title: "JavaScript Fetch: Promises, Errors, and Cancellation"
excerpt: "fetch looks simple until a 404 resolves successfully and your error handler never runs. This guide covers what fetch actually returns, the two awaits, response bodies, POST requests, timeouts, AbortController, and the mistakes that show up in real projects."
tags: ["javascript", "async", "fetch", "http"]
---

# JavaScript Fetch

`fetch` is one of the most common asynchronous APIs you will use.

It is also one of the most commonly misunderstood.

The basic usage looks harmless:

```javascript
const response = await fetch("/api/users");
const users = await response.json();

console.log(users);
```

But there are several details hiding in those two lines:

- `fetch` returns a promise for a **response**, not for your data.
- The response promise resolves even for `404` and `500`.
- The body is a stream that can only be read once.
- Errors from HTTP status codes must be checked manually.
- Cancellation is handled separately.

This guide covers all of them.

## What `fetch` returns

`fetch` returns a promise:

```javascript
const promise = fetch("/api/users");
```

The promise fulfills with a `Response` object.

```javascript
const response = await fetch("/api/users");

console.log(response.status);     // 200
console.log(response.ok);         // true
console.log(response.headers);    // Headers object
console.log(response.body);       // ReadableStream
```

It does **not** fulfill with JSON.

It does not fulfill with text.

It fulfills with a response object that contains metadata and a body stream.

That is why you need a second step to read the data.

## The two awaits

```javascript
const response = await fetch("/api/users");
const users = await response.json();
```

The first `await` waits for the response headers.

The second `await` reads and parses the body.

You can also write it as one line:

```javascript
const users = await (await fetch("/api/users")).json();
```

This is legal, but two lines are usually easier to read and debug.

With promises:

```javascript
fetch("/api/users")
  .then((response) => response.json())
  .then((users) => console.log(users))
  .catch((error) => console.error(error));
```

Notice the `return` in the first `.then()`.

Without it, the next `.then()` receives `undefined`.

## HTTP errors do not reject

This is the most important rule.

```javascript
const response = await fetch("/api/users/999");

console.log(response.status); // 404
console.log(response.ok);     // false
```

The promise did not reject.

`fetch` only rejects when the request itself fails, for example:

- a network failure
- DNS failure
- a blocked request
- a CORS failure
- an aborted request

An HTTP error response is still a valid response. The server answered.

So this does **not** work as expected:

```javascript
try {
  const response = await fetch("/api/users/999");
  const user = await response.json();

  console.log(user);
} catch (error) {
  console.log("User not found");
}
```

The request completed with `404`, so the `catch` is not triggered. Your code then tries to parse an error response as a user object.

You have to check `response.ok` yourself.

```javascript
async function request(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response;
}
```

Now the caller can use `try/catch` normally:

```javascript
try {
  const response = await request("/api/users/999");
  const user = await response.json();

  console.log(user);
} catch (error) {
  console.error("Request failed:", error.message);
}
```

`response.ok` is `true` for status codes from `200` to `299`.

```
200–299 → ok
3xx     → not ok, but usually handled by the browser
4xx     → not ok
5xx     → not ok
```

## Reading the body once

A response body is a stream. You can read it once.

```javascript
const response = await fetch("/api/users");

const users = await response.json();

const text = await response.text(); // error: body already used
```

The second read fails because the stream has been consumed.

Choose the right method for the data you expect:

```javascript
await response.json();        // parsed JSON
await response.text();        // raw text
await response.blob();        // binary data
await response.arrayBuffer(); // low-level binary
await response.formData();    // form data
```

If you need both the raw text and parsed data, read the text first:

```javascript
const text = await response.text();
const data = JSON.parse(text);
```

## A complete GET example

```javascript
async function getUsers() {
  const response = await fetch("/api/users");

  if (!response.ok) {
    throw new Error(`Could not load users: ${response.status}`);
  }

  return response.json();
}

try {
  const users = await getUsers();
  console.log(users);
} catch (error) {
  console.error(error.message);
}
```

The flow is:

```
fetch
  ↓
check response.ok
  ↓
parse body
  ↓
use data
```

## POST requests

`fetch` does not serialize your data automatically.

You must set the headers and the body yourself.

```javascript
async function createUser(user) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  if (!response.ok) {
    throw new Error(`Could not create user: ${response.status}`);
  }

  return response.json();
}
```

Common methods:

```javascript
fetch(url);                              // GET
fetch(url, { method: "POST", body });    // POST
fetch(url, { method: "PUT", body });     // PUT
fetch(url, { method: "PATCH", body });   // PATCH
fetch(url, { method: "DELETE" });        // DELETE
```

### Sending JSON

```
Content-Type: application/json
body: JSON.stringify(data)
```

### Sending form data

```javascript
const formData = new FormData(form);

await fetch("/api/upload", {
  method: "POST",
  body: formData
});
```

Do not set `Content-Type` manually when sending `FormData`. The browser sets the correct boundary for you.

## Cookies and credentials

By default, cross-origin requests do not send cookies.

```javascript
fetch("https://api.example.com/data", {
  credentials: "include"
});
```

Options:

```
same-origin  → send credentials for same-origin requests (default)
include      → send credentials for cross-origin requests too
omit         → never send credentials
```

If the server does not allow credentials, `include` will fail. This is a server-side CORS configuration issue, not a frontend bug.

## Cancellation with `AbortController`

Sometimes a request should be cancelled:

- the user navigates away
- a new search replaces the old one
- a component unmounts
- a request takes too long

`fetch` supports cancellation through a signal.

```javascript
const controller = new AbortController();

const promise = fetch("/api/users", {
  signal: controller.signal
});

controller.abort();
```

The request is aborted, and the promise rejects with a `DOMException` named `AbortError`.

```javascript
try {
  const response = await fetch("/api/users", {
    signal: controller.signal
  });

  const users = await response.json();
  console.log(users);
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Request cancelled");
    return;
  }

  console.error("Request failed:", error);
}
```

### Timeout

A common pattern is to abort after a fixed time.

```javascript
async function fetchWithTimeout(url, milliseconds) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, milliseconds);

  try {
    const response = await fetch(url, {
      signal: controller.signal
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

Modern environments also provide:

```javascript
const response = await fetch(url, {
  signal: AbortSignal.timeout(5000)
});
```

Both approaches are valid. The manual version works in more environments.

## Parallel requests

Independent requests should not be awaited one by one.

Sequential:

```javascript
const users = await fetch("/api/users").then((r) => r.json());
const posts = await fetch("/api/posts").then((r) => r.json());
const comments = await fetch("/api/comments").then((r) => r.json());
```

Parallel:

```javascript
const [users, posts, comments] = await Promise.all([
  fetch("/api/users").then((r) => r.json()),
  fetch("/api/posts").then((r) => r.json()),
  fetch("/api/comments").then((r) => r.json())
]);
```

With error handling:

```javascript
async function loadDashboard() {
  try {
    const responses = await Promise.all([
      fetch("/api/users"),
      fetch("/api/posts"),
      fetch("/api/comments")
    ]);

    const failed = responses.find((response) => !response.ok);

    if (failed) {
      throw new Error(`Dashboard request failed: ${failed.status}`);
    }

    return Promise.all(responses.map((response) => response.json()));
  } catch (error) {
    console.error(error.message);
    return null;
  }
}
```

If partial success is acceptable, use `Promise.allSettled` instead.

## Common mistakes

### 1. Assuming `fetch` rejects on `404`

Already covered. Check `response.ok`.

### 2. Forgetting the second await

```javascript
const users = await fetch("/api/users");
console.log(users); // Response object, not an array
```

### 3. Missing `return` in a `.then()` chain

```javascript
fetch("/api/users")
  .then((response) => {
    response.json(); // missing return
  })
  .then((users) => {
    console.log(users); // undefined
  });
```

### 4. Reading the body twice

```javascript
const data = await response.json();
const text = await response.text(); // fails
```

### 5. No timeout

A request can hang for a long time. Add a timeout or an abort signal when the UI depends on it.

### 6. Aborting the wrong thing

```javascript
const controller = new AbortController();

fetch("/api/a", { signal: controller.signal });
fetch("/api/b", { signal: controller.signal });
```

Calling `controller.abort()` cancels both requests. Use a separate controller per request when they should be independent.

### 7. Blaming CORS on the frontend

A CORS error means the browser blocked the response because the server did not send the required headers. The fix is on the server.

### 8. Sending JSON without `Content-Type`

```javascript
fetch("/api/users", {
  method: "POST",
  body: JSON.stringify(user)
});
```

The server may not parse the body as JSON unless the header is set.

### 9. Using `fetch` when upload progress is required

`fetch` does not expose upload progress in the same way `XMLHttpRequest` does. If you need granular progress, you may need `XMLHttpRequest` or a streaming approach.

## `fetch` vs older APIs

```
XMLHttpRequest
  ↓
Event-based, verbose, supports upload progress

fetch
  ↓
Promise-based, cleaner, streamable responses

axios
  ↓
Library, convenience features, interceptors
```

`fetch` is built into the platform. That is its main advantage. It has fewer conveniences, but it is always available.

## Interview questions you should be able to answer

### 1. What does `fetch` return?

A promise that fulfills with a `Response` object.

### 2. Does `fetch` reject on a `404`?

No. It only rejects on network-level failures or aborts. Check `response.ok` for HTTP errors.

### 3. Why do you need two `await`s?

The first waits for the response. The second reads and parses the body.

### 4. Can you read a response body twice?

No. The body is a stream and is consumed once.

### 5. How do you cancel a request?

Pass an `AbortSignal` and call `abort()` on its controller.

### 6. How do you handle timeouts?

Abort the request after a timer, or use `AbortSignal.timeout()`.

### 7. What is the difference between network errors and HTTP errors?

Network errors reject the promise. HTTP errors resolve with a response whose `ok` is `false`.

## Final mental model

```
fetch(url)
    │
    ▼
Promise<Response>
    │
    ├── network failure      → rejected
    ├── aborted              → rejected (AbortError)
    └── server responded     → fulfilled
                                 │
                                 ├── response.ok === true
                                 │       ↓
                                 │   read body once
                                 │
                                 └── response.ok === false
                                         ↓
                                     handle status
```

Or in one sentence:

> **`fetch` gives you a promise for a response, not for your data; HTTP errors are still responses, and the body is a stream you read once.**

Once those three facts are automatic, `fetch` stops producing surprise bugs.
