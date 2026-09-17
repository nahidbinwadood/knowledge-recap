# Agent Instructions — Knowledge Recap Project

This file tells the agent how to scaffold and manage daily tasks in the Knowledge Recap project.

## How to Scaffold a New Day

When the user says "start day X" or "move to day X", follow these steps exactly:

### 1. Create the day directory and files

```powershell
New-Item -ItemType Directory -Path "day-{XX}"
New-Item -ItemType File -Path "day-{XX}/practice.ts", "day-{XX}/notes.md", "day-{XX}/blog.md", "day-{XX}/README.md"
```

Replace `{XX}` with the two-digit day number (e.g., `03`, `04`, `05`).

### 2. Add the run script to package.json

Read `package.json`, then add a new script entry:

```json
"day:XX": "tsx day-XX/practice.ts"
```

Place it after the previous day's script in sequential order.

### 3. Write the README.md for the day

Read `TASKS.MD` to find the section for that day. Use the following template to create `day-{XX}/README.md`:

```markdown
# Day {XX} — {Topic Title}

Your goal today is to {one-sentence summary of the day's focus}.

## Start here

1. Make sure dependencies are installed: `pnpm install`
2. Open [practice.ts](./practice.ts).
3. Pick one `TODO`, write pseudocode as a comment, then implement it yourself.
4. Uncomment that function's `console.log` line and run `pnpm run day:{XX}`.
5. When you are finished, write what happened in [notes.md](./notes.md).

## Topics

### {Subtopic 1}
- bullet points from TASKS.MD

### {Subtopic 2}
- bullet points from TASKS.MD

## Exercises

- [ ] {Exercise 1} — {hint about which concept it tests}
- [ ] {Exercise 2} — {hint about which concept it tests}
...

## Rules for the session

- Spend the first 60–90 minutes solving and debugging without AI-generated code.
- Ask for a hint, a test case, or a review only after you have attempted it.
- Explain every solution in your own words in `notes.md`.

## Useful commands

```powershell
pnpm install
pnpm run day:{XX}
pnpm run typecheck
```
```

### 4. Populate practice.ts with TODO stubs

Read `TASKS.MD` to find the practice exercises for that day. Create a `practice.ts` file with:

- A header comment explaining the day's topic
- TODO function stubs with typed signatures
- Commented-out `console.log` lines the user can uncomment to test
- A sample data array if the day needs one (e.g., users, products)
- Each exercise separated by a `// ============================================================` comment block
- Each TODO includes: description of what to build, expected behavior, expected output in a comment

Example structure:

```typescript
// Day {XX} — {Topic}
// Complete each function below. Uncomment the console.log to test.

// ============================================================
// 1. CLOSURE — Counter
// ============================================================
// TODO: Create a function `createCounter` that returns an object with:
//   - increment() — increases count by 1
//   - decrement() — decreases count by 1
//   - getCount() — returns current count
// The count should NOT be accessible from outside.

// function createCounter(initial: number) {
//   // your code here
// }

// const counter = createCounter(0);
// counter.increment();
// console.log("Counter:", counter.getCount()); // Expected: 2
```

### 5. Create empty notes.md and blog.md

Leave `notes.md` and `blog.md` empty — the user fills these in after practicing.

### 6. Confirm completion

Tell the user:
- What files were created
- What script was added (e.g., `pnpm run day:XX`)
- A brief summary of the day's topics
- Remind them to start with practice before asking for AI help

## File Structure Convention

Every day directory must contain exactly these four files:

```
day-{XX}/
├── README.md       # Overview, topics, exercises, instructions
├── practice.ts     # TypeScript implementations (run with pnpm run day:XX)
├── notes.md        # User's learning reflections (filled by user)
└── blog.md         # User's blog post (filled by user)
```

## Day-to-Day Mapping

| Day | Topic | Script |
|-----|-------|--------|
| 01 | JavaScript Core + Array/Object Operations | `pnpm run day:01` |
| 02 | Scope, Closures, `this` and Execution | `pnpm run day:02` |
| 03 | Asynchronous JavaScript | `pnpm run day:03` |
| 04 | TypeScript Fundamentals | `pnpm run day:04` |
| 05 | Problem Solving + Basic Data Structures | `pnpm run day:05` |
| 06 | React Mental Model | `pnpm run day:06` |
| 07 | React Hooks | `pnpm run day:07` |
| 08 | React State Architecture | `pnpm run day:08` |
| 09 | Forms + Validation | `pnpm run day:09` |
| 10 | REST API Integration | `pnpm run day:10` |
| 11 | Server State (TanStack Query) | `pnpm run day:11` |
| 12 | React Performance | `pnpm run day:12` |
| 13 | Next.js App Router | `pnpm run day:13` |
| 14 | Server vs Client Components | `pnpm run day:14` |
| 15 | Rendering + Caching | `pnpm run day:15` |
| 16 | Authentication + Authorization | `pnpm run day:16` |
| 17 | Server Actions + Forms | `pnpm run day:17` |
| 18 | Frontend Architecture | `pnpm run day:18` |
| 19 | Large Application Patterns | `pnpm run day:19` |
| 20 | Full Frontend Feature | `pnpm run day:20` |
| 21 | Node.js Internals | `pnpm run day:21` |
| 22 | Express + API Architecture | `pnpm run day:22` |
| 23 | MongoDB + Mongoose | `pnpm run day:23` |
| 24 | Authentication + Security | `pnpm run day:24` |
| 25 | Redis + Queues + Background Jobs | `pnpm run day:25` |
| 26 | System Design Fundamentals | `pnpm run day:26` |
| 27 | Real-Time Systems | `pnpm run day:27` |
| 28 | Production Engineering | `pnpm run day:28` |
| 29 | Your Real Projects | `pnpm run day:29` |
| 30 | Mock Interview + Personal Review | `pnpm run day:30` |

## Important Rules

- Never skip the README.md — it is the user's primary guide for the day.
- Always reference `TASKS.MD` for the canonical topic list and exercises.
- Keep `practice.ts` focused on TODO stubs — do not write full solutions.
- Never modify a day that the user has already started working on.
- Always add the new day's script in sequential order in `package.json`.
