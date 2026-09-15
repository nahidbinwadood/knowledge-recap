# Nahid's 30-Day Software Engineering Skill Rebuild Roadmap

## Purpose

This roadmap is designed to rebuild coding fluency, fundamentals, problem-solving ability, frontend engineering depth, backend understanding, architecture skills, and interview readiness.

The most important rule:

> **You are the programmer. AI is your senior engineer/reviewer, not your replacement.**

For the first 60–90 minutes of a coding session, avoid AI-generated solutions. Struggle, think, write pseudocode, implement, debug, and only then use AI for hints or review.

---

# Daily System

Every day has four parts:

1. **Learn** — understand the day's concepts.
2. **Practice** — write code yourself.
3. **Explain** — explain what you learned without looking at notes.
4. **Write** — publish/save a small learning note/blog.

## Daily Learning Note

After every practice session, write a small Markdown article.

Use this structure:

```md
# Day X — Topic

## What I learned

- 
- 
- 

## What I implemented

- 
- 

## What confused me

- 

## How I understand it now

...

## Important examples

```ts
// small example
```

## Mistakes I made

- 

## What I want to remember

> One or two important ideas.

## Questions for later

- 

## Summary

Today I learned that...
```

These notes are not supposed to be polished articles. They are **memory anchors**. Writing what you understood after coding will make future recall much easier.

---

# PHASE 1 — Rebuild Coding Muscles
## Days 1–5

Goal: Become comfortable again with an empty editor.

---

# DAY 1 — JavaScript Core + Array/Object Operations

## Topics

### Variables and values
- `const`
- `let`
- primitive values
- objects
- arrays

### Functions
- function declarations
- function expressions
- arrow functions
- parameters
- return values

### Arrays
- `map`
- `filter`
- `reduce`
- `find`
- `findIndex`
- `some`
- `every`
- `includes`
- `sort`

### Objects
- property access
- computed properties
- destructuring
- spread
- object methods

### Modern JavaScript
- optional chaining
- nullish coalescing
- default parameters
- rest parameters

## Practice

Build small functions:

- `getActiveUsers()`
- `getAverageAge()`
- `getOldestUser()`
- `getUserNames()`
- group users by role
- count users by status
- remove duplicate values
- sort products by price
- calculate total cart price

### Production-Relevant Practice

- `searchUsers(query)` — case-insensitive partial match (search bar filtering)
- `sortUsersByAge(asc)` — sorting table columns
- `getInactiveUsers()` — dashboard inactive user reports
- `findUserByEmail(email)` — auth lookups, user profile fetching
- `hasAdmin(users)` — role-based access checks
- `getUserEmails()` — email notifications, CSV export
- `getUniqueRoles()` — populate filter dropdowns
- `getYoungestUser()` — analytics, reports
- `isUserActive(userId)` — permission checks
- `countAdmins()` — admin panel statistics
- `getActiveEditors()` — multi-criteria filtering
- `getUserById(id)` — REST API GET /users/:id
- `getProductsInPriceRange(min, max)` — e-commerce price filters
- `getTotalCartQuantity()` — cart badge count
- `getCartSummary()` — order summary for checkout

## Output

Create:

`01-javascript/day-01/`

Containing:

- `practice.ts`
- `notes.md`

## Blog

Write:

**"Day 1: What I Remembered About JavaScript Arrays and Objects"**

---

# DAY 2 — Scope, Closures, `this` and JavaScript Execution

## Topics

### Scope
- global scope
- function scope
- block scope
- lexical scope

### Hoisting
- `var`
- `let`
- `const`
- function declarations

### Closures
- what a closure is
- lexical environment
- practical use cases
- private state

### `this`
- method call
- regular function
- arrow function
- `call`
- `apply`
- `bind`

### References
- primitive vs reference values
- shallow copy
- deep copy

## Practice

Build:

- counter using closure
- private bank account
- reusable function factory
- object methods using `this`
- examples showing shallow-copy problems

## Blog

**"Day 2: Closures Finally Make Sense"**

Explain it in your own words with one real example.

---

# DAY 3 — Asynchronous JavaScript

## Topics

- synchronous vs asynchronous execution
- callbacks
- Promise
- Promise states
- `.then()`
- `.catch()`
- `.finally()`
- `async`
- `await`
- `Promise.all`
- `Promise.allSettled`
- `Promise.race`
- `Promise.any`
- event loop
- call stack
- Web APIs
- task/macrotask queue
- microtask queue

## Practice

### Prediction exercises

Before running code, predict the output:

```ts
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");
```

Then create your own examples.

### Build

Create:

- fake API function
- sequential requests
- parallel requests
- retry function
- timeout wrapper

## Blog

**"Day 3: How JavaScript Handles Async Code"**

Focus especially on the event loop and Promise/microtask behavior.

---

# DAY 4 — TypeScript Fundamentals

## Topics

- type annotations
- type inference
- primitive types
- arrays
- objects
- tuples
- enums
- union types
- intersection types
- literal types
- optional properties
- function types
- type aliases
- interfaces

## Advanced basics

- generics
- `unknown`
- `any`
- `never`
- `void`
- type narrowing
- type guards

## Utility Types

Understand:

- `Partial`
- `Required`
- `Pick`
- `Omit`
- `Readonly`
- `Record`
- `ReturnType`
- `Parameters`

## Practice

Create types for:

- User
- Product
- Order
- API response
- Pagination response
- API error
- authentication state

Then create:

```ts
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};
```

Use it with different types.

## Blog

**"Day 4: TypeScript — Types Are About Designing Contracts"**

Explain why TypeScript is useful rather than simply listing syntax.

---

# DAY 5 — Problem Solving + Basic Data Structures

## Topics

- problem decomposition
- pseudocode
- arrays
- strings
- objects/maps
- sets
- stack
- queue
- recursion
- searching
- sorting
- Big-O basics

## Practice

Solve 3–5 problems:

- two sum
- remove duplicates
- frequency counter
- reverse string
- valid parentheses
- find maximum
- merge arrays
- group items

## Rule

Do not immediately look for the optimal solution.

First produce a working solution.

Then improve it.

## Blog

**"Day 5: How I Approach a Programming Problem Before Writing Code"**

---

# PHASE 2 — JavaScript/TypeScript Engineering + React
## Days 6–12

Goal: Rebuild the mental model behind React instead of memorizing APIs.

---

# DAY 6 — React Mental Model

## Topics

- components
- props
- state
- rendering
- re-rendering
- component tree
- reconciliation
- virtual DOM
- keys
- component identity

## Practice

Build without AI:

- Counter
- Todo app
- Search/filter UI
- Parent/child communication

## Questions to answer

- What causes a component to render?
- What causes a child to render?
- Why are keys important?
- What does React actually do after state changes?

## Blog

**"Day 6: What Actually Happens When React Renders?"**

---

# DAY 7 — React Hooks

## Topics

- `useState`
- `useEffect`
- `useRef`
- `useMemo`
- `useCallback`
- `useContext`

Deep focus:

### `useEffect`

Understand:

- dependency array
- effect execution
- cleanup
- stale closures
- unnecessary effects
- effect lifecycle

## Practice

Build:

- timer
- search with debounce
- window event listener
- previous-value tracker
- focus management with `useRef`

## Blog

**"Day 7: useEffect — When I Should and Shouldn't Use It"**

---

# DAY 8 — React State Architecture

## Topics

- local state
- derived state
- lifted state
- context
- client state
- server state
- global state
- state normalization

Compare:

- local state
- Context
- Redux
- server-state libraries

## Practice

Take a small application and decide where every piece of state belongs.

## Blog

**"Day 8: Where Should State Live?"**

Include examples of bad state placement and better alternatives.

---

# DAY 9 — Forms + Validation

## Topics

- controlled inputs
- uncontrolled inputs
- form state
- validation
- client validation
- server validation
- field errors
- submission state
- reset

Learn:

- React Hook Form
- Zod

## Practice

Build:

- registration form
- profile form
- password form

Handle:

- loading
- validation
- server errors
- success
- reset

## Blog

**"Day 9: Building Reliable Forms Instead of Just Making Forms Work"**

---

# DAY 10 — REST API Integration

## Topics

- HTTP basics
- GET
- POST
- PUT
- PATCH
- DELETE
- status codes
- request headers
- authentication headers
- error responses
- loading states
- empty states
- retry
- pagination

## Practice

Build:

- user list
- user details
- create user
- update user
- delete user
- search
- pagination

## Blog

**"Day 10: What Really Happens Between My React App and an API?"**

---

# DAY 11 — Server State: TanStack Query / RTK Query

## Topics

- server state
- query
- mutation
- caching
- invalidation
- stale data
- refetching
- prefetching
- optimistic updates
- rollback
- pagination
- infinite queries

## Practice

Build:

- post list
- create post
- update post
- delete post
- optimistic like
- pagination

## Important exercise

Implement:

```text
click Like
    ↓
update UI immediately
    ↓
API request
    ↓
success → keep
failure → rollback
```

## Blog

**"Day 11: Server State Is Different From UI State"**

---

# DAY 12 — React Performance

## Topics

- unnecessary renders
- `React.memo`
- `useMemo`
- `useCallback`
- memoized selectors
- code splitting
- lazy loading
- dynamic imports
- prefetching
- bundle size
- Core Web Vitals
- LCP
- CLS
- INP

## Practice

Create a deliberately slow page.

Measure it.

Improve it.

Document:

- what was slow
- how you found the problem
- what you changed
- whether the change actually helped

## Blog

**"Day 12: How I Diagnose Frontend Performance Problems"**

---

# PHASE 3 — Next.js + Modern Frontend Architecture
## Days 13–20

Goal: Understand Next.js as an architecture, not just a React framework.

---

# DAY 13 — Next.js App Router

## Topics

- App Router
- layouts
- pages
- nested routes
- dynamic routes
- route groups
- loading UI
- error UI
- not-found UI
- metadata

## Practice

Build a small dashboard structure.

## Blog

**"Day 13: Understanding the Next.js App Router"**

---

# DAY 14 — Server Components vs Client Components

## Topics

- Server Components
- Client Components
- `"use client"`
- server/client boundary
- serialization
- browser APIs
- interactivity
- data fetching

## Practice

Take one page and identify:

- what should be server-side
- what must be client-side
- why

## Blog

**"Day 14: Server Components vs Client Components"**

---

# DAY 15 — Rendering + Caching

## Topics

- SSR
- SSG
- static rendering
- dynamic rendering
- revalidation
- request caching
- data caching
- client caching
- invalidation

## Practice

Build pages with different data requirements.

Document what should be cached and why.

## Blog

**"Day 15: Rendering and Caching in Next.js"**

---

# DAY 16 — Authentication + Authorization

## Topics

- authentication
- authorization
- sessions
- JWT
- cookies
- access tokens
- refresh tokens
- protected routes
- role-based access
- middleware
- security boundaries

## Practice

Build:

- login
- logout
- protected dashboard
- user role
- admin role
- route protection

## Blog

**"Day 16: Authentication Is Not the Same as Authorization"**

---

# DAY 17 — Server Actions + Forms

## Topics

- Server Actions
- server-side mutations
- validation
- progressive enhancement
- action errors
- loading state
- revalidation

## Practice

Build a small CRUD flow using Server Actions where appropriate.

Compare it with a traditional REST API approach.

## Blog

**"Day 17: Server Actions vs Traditional API Calls"**

---

# DAY 18 — Frontend Architecture

## Topics

- feature-based architecture
- component boundaries
- shared components
- domain logic
- API layer
- hooks
- utilities
- types
- validation
- separation of concerns
- SRP
- DRY
- dependency direction

## Practice

Design an architecture for:

```text
Admin Dashboard
Users
Orders
Payments
Reports
Settings
```

Don't code first.

Draw the architecture.

Then implement one feature.

## Blog

**"Day 18: How I Decide Where Frontend Code Should Live"**

---

# DAY 19 — Large Application Patterns

## Topics

- reusable components
- compound components
- composition
- custom hooks
- feature modules
- error boundaries
- loading boundaries
- permissions
- API contracts
- reusable form patterns
- table architecture

## Practice

Build a reusable:

- DataTable
- Modal
- FormField
- Pagination
- Permission wrapper

## Blog

**"Day 19: Reusability Without Creating an Over-Engineered Frontend"**

---

# DAY 20 — Full Frontend Feature

Build one complete feature from scratch:

```text
Authentication
    ↓
Dashboard
    ↓
Users
    ↓
Search
    ↓
Filter
    ↓
Pagination
    ↓
Create
    ↓
Edit
    ↓
Delete
    ↓
Role management
```

No AI-generated implementation.

AI can review afterward.

## Blog

**"Day 20: Building a Feature End-to-End Without AI Writing It for Me"**

---

# PHASE 4 — Backend + Systems
## Days 21–25

Goal: Understand what happens behind your frontend.

---

# DAY 21 — Node.js Internals

## Topics

- Node runtime
- V8
- event loop
- non-blocking I/O
- filesystem
- streams
- buffers
- HTTP server
- process
- environment variables

## Practice

Build a raw Node HTTP server.

Implement:

- routing
- request parsing
- response handling
- error handling

## Blog

**"Day 21: What Node.js Actually Does When My API Receives a Request"**

---

# DAY 22 — Express + API Architecture

## Topics

- routing
- middleware
- controllers
- services
- repositories
- error handling
- validation
- authentication
- authorization
- API response structure

## Practice

Build:

```text
Users API
POST /users
GET /users
GET /users/:id
PATCH /users/:id
DELETE /users/:id
```

Use:

- TypeScript
- Express
- Zod

## Blog

**"Day 22: Designing a Clean Node.js API"**

---

# DAY 23 — MongoDB + Mongoose

## Topics

- documents
- collections
- schemas
- indexes
- queries
- aggregation basics
- references
- embedding
- population
- validation

## Practice

Create:

```text
User
Product
Order
```

Implement CRUD and appropriate indexes.

## Blog

**"Day 23: How I Think About MongoDB Data Modeling"**

---

# DAY 24 — Authentication + Security

## Topics

- password hashing
- bcrypt
- JWT
- cookies
- access/refresh tokens
- authorization
- CORS
- CSRF basics
- XSS basics
- rate limiting
- input validation
- secure headers

## Practice

Build authentication from scratch.

Understand every step.

## Blog

**"Day 24: What Happens During Login?"**

---

# DAY 25 — Redis + Queues + Background Jobs

## Topics

- caching
- Redis
- queues
- workers
- asynchronous processing
- rate limiting
- distributed locks basics
- idempotency

## Practice

Design a system where:

```text
User uploads large file
        ↓
API accepts request
        ↓
Queue
        ↓
Worker processes file
        ↓
Database updated
        ↓
User receives result
```

## Blog

**"Day 25: Why We Shouldn't Make the API Do Everything"**

---

# PHASE 5 — Software Engineering + Interview Preparation
## Days 26–30

---

# DAY 26 — System Design Fundamentals

## Topics

- scalability
- availability
- reliability
- latency
- throughput
- horizontal scaling
- vertical scaling
- load balancer
- caching
- database bottlenecks
- queues
- object storage

## Practice

Design:

**Large file upload system**

Then:

**Notification system**

## Blog

**"Day 26: How I Start Designing a Scalable System"**

---

# DAY 27 — Real-Time Systems

## Topics

- WebSockets
- Socket.io
- connection lifecycle
- rooms
- events
- reconnects
- presence
- optimistic UI
- message ordering
- failure handling

## Practice

Build:

```text
Chat application
```

Features:

- rooms
- messages
- online status
- reconnect
- optimistic message

## Blog

**"Day 27: How Real-Time Applications Actually Work"**

---

# DAY 28 — Production Engineering

## Topics

- logging
- monitoring
- error tracking
- metrics
- tracing basics
- CI/CD
- environment configuration
- feature flags
- database migrations
- rollback
- incident response

## Practice

Take one of your applications and answer:

```text
What happens if the database goes down?

What happens if the API becomes slow?

What happens if the frontend receives malformed data?

What happens if a request is duplicated?

What happens if 10,000 users perform the same action?
```

## Blog

**"Day 28: What Makes Software Production-Ready?"**

---

# DAY 29 — Your Real Projects

Use your actual projects:

- StampEzee
- Yaha Chha

Your resume describes KYC workflows, disputes, WebSockets, loyalty systems, admin dashboards and performance work. Reconstruct these systems from memory. 

For every major feature answer:

```text
What problem did it solve?

Why was it needed?

How did the data flow?

Where was state stored?

Why did we choose this architecture?

What alternatives existed?

What could fail?

How did we handle failure?

How would it behave under high traffic?

What would I improve today?
```

## Blog

**"Day 29: Reconstructing the Engineering Decisions Behind My Production Work"**

---

# DAY 30 — Mock Interview + Personal Engineering Review

## Part 1 — Coding

Solve 2–3 problems without AI.

## Part 2 — JavaScript

Explain:

- closure
- event loop
- Promise
- `this`
- prototype

## Part 3 — React

Explain:

- rendering
- reconciliation
- hooks
- state architecture
- performance

## Part 4 — Next.js

Explain:

- Server Components
- Client Components
- caching
- rendering
- middleware
- authentication

## Part 5 — Backend

Explain:

- Node event loop
- API architecture
- MongoDB
- authentication
- Redis
- queues

## Part 6 — System Design

Design:

**A high-traffic SaaS dashboard receiving thousands of requests while large reports are being uploaded.**

## Part 7 — Resume

Defend every technical claim on your resume.

## Blog

**"Day 30: What I Can Build Without AI Now"**

Include:

- what I recovered
- what I still don't understand
- what became easier
- where I still struggle
- what I will study next

---

# After Day 30

Do not go back to the old pattern.

Continue using this weekly cycle:

## Monday
JavaScript/TypeScript

## Tuesday
React

## Wednesday
Next.js

## Thursday
Backend

## Friday
System design

## Saturday
Build something

## Sunday
Review + write

---

# The Long-Term AI Rule

Use AI in this order:

```text
1. Think yourself
       ↓
2. Write pseudocode
       ↓
3. Implement yourself
       ↓
4. Debug yourself
       ↓
5. Ask AI for a hint
       ↓
6. Continue yourself
       ↓
7. Ask AI to review
       ↓
8. Compare approaches
       ↓
9. Refactor yourself
```

Avoid:

```text
Prompt
  ↓
AI writes everything
  ↓
Copy
  ↓
Run
  ↓
Done
```

The second workflow makes you faster temporarily.

The first workflow makes you **better**.

---

# Folder Structure

Use this structure:

```text
nahid-software-rebuild/

├── 01-javascript/
│   ├── day-01/
│   ├── day-02/
│   ├── day-03/
│   ├── day-04/
│   └── day-05/
│
├── 02-react/
│   ├── day-06/
│   ├── day-07/
│   ├── day-08/
│   ├── day-09/
│   ├── day-10/
│   ├── day-11/
│   └── day-12/
│
├── 03-nextjs/
│   ├── day-13/
│   ├── day-14/
│   ├── day-15/
│   ├── day-16/
│   ├── day-17/
│   ├── day-18/
│   ├── day-19/
│   └── day-20/
│
├── 04-backend/
│   ├── day-21/
│   ├── day-22/
│   ├── day-23/
│   ├── day-24/
│   └── day-25/
│
├── 05-system-design/
│   ├── day-26/
│   ├── day-27/
│   └── day-28/
│
├── 06-real-projects/
│   └── day-29/
│
└── 07-interview/
    └── day-30/
```

Every day should contain:

```text
practice/
notes.md
```

---

# The Most Important Rule

You are NOT trying to finish 30 days.

You are trying to make your brain comfortable with this again:

```text
Problem
   ↓
Think
   ↓
Break down
   ↓
Pseudocode
   ↓
Code
   ↓
Error
   ↓
Debug
   ↓
Understand
   ↓
Explain
   ↓
Document
```

That loop is the skill.

Not memorizing syntax.

Not prompting Claude.

Not completing tutorials.

**Engineering is the ability to understand a problem deeply enough that you can build, debug, explain, and improve the solution.**

Start with Day 1 only. Do not jump ahead because another topic looks more interesting.
