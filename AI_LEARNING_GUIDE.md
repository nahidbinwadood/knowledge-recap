# AI Learning Guide for Web Developers

> For someone who already knows React, Next.js and backend development, with zero AI knowledge.
> Goal: become an **AI engineer**, someone who builds products on top of AI models through their APIs.
> You do **not** need to train models or know heavy math. About 80% of the skill is Levels 1–6.

---

## Level 0: Core concepts (week 1, no code)

| Term | Meaning |
|---|---|
| **LLM** | Large Language Model. It predicts the next piece of text. Claude, GPT and Gemini are LLMs. |
| **Token** | A chunk of text (~¾ of a word). You pay per token, and limits are counted in tokens. |
| **Context window** | How much text the model can see at once: prompt + chat history + documents. |
| **Prompt** | Your input. The **system prompt** sets the role and rules. The **user message** is the actual request. |
| **Temperature** | Randomness. Low = consistent and predictable, high = creative and varied. |
| **Hallucination** | The model confidently makes things up. This is the #1 problem to design around. |
| **Embedding** | Text converted into a list of numbers (a vector). Similar meanings get similar numbers. It powers semantic search. |
| **Vector** | That list of numbers. "Distance" between vectors means difference in meaning. |
| **Multimodal** | A model that handles images, audio, PDFs or video as well as text. |
| **Diffusion model** | An image or video generator (Stable Diffusion, FLUX). It works differently from an LLM. |
| **Inference** | Running a model to get output. This is what you do. |
| **Training** | Creating a model from huge datasets. Big labs do this, and you usually won't. |
| **Fine-tuning** | Further training an existing model on your own data. Rarely needed. |
| **Reasoning / thinking models** | Models that "think" step by step before answering. Better at hard tasks, but slower and pricier. |

**Watch / read:**
- Andrej Karpathy, "Intro to Large Language Models" (YouTube, 1 hour)
- 3Blue1Brown, "But what is a GPT?" and the transformer videos (visual intuition)
- Karpathy, "Deep Dive into LLMs like ChatGPT"

---

## Level 1: Call the AI APIs (week 2)

### What to learn
- Get an API key from Anthropic (Claude) or OpenAI, and call a model from Node.js.
  - `@anthropic-ai/sdk`, `openai`
- The **messages format**: `system` + alternating `user` / `assistant` turns.
- **The model has no memory.** You resend the conversation history on every call.
- **Streaming:** show tokens as they arrive, like ChatGPT does (Server-Sent Events).
- **Structured output:** force the model to return JSON that matches a schema (zod). This is huge for real apps.
- **Model sizes:** small = cheap and fast, large = smart and expensive. Choose the model for each task.
- **Cost control:** count tokens, set `max_tokens`, and use **prompt caching** for repeated long prompts.
- **Vercel AI SDK** (`ai` package): a React/Next.js-friendly layer with `streamText`, `generateObject` and the `useChat` hook. It supports multiple providers.

### Minimal example
```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const msg = await client.messages.create({
  model: "claude-sonnet-5-5",
  max_tokens: 1024,
  system: "You are a helpful assistant. Answer briefly.",
  messages: [{ role: "user", content: "Explain embeddings in one paragraph." }],
});

console.log(msg.content);
```

### Build
1. A streaming chatbot in Next.js (AI SDK + `useChat`).
2. A "summarize this text into JSON" API endpoint with a zod schema.

---

## Level 2: Prompt engineering (ongoing)

- Write clear, specific instructions: say exactly what you want and in what format.
- Give **examples** (few-shot prompting).
- Use **XML tags** to separate parts: `<document>...</document>`, `<instructions>...</instructions>`.
- Give the model a **role** in the system prompt.
- Ask it to **think step by step** for hard tasks, or use extended thinking / reasoning models.
- Tell it what to do when unsure ("If the answer is not in the document, say you don't know") to reduce hallucination.
- **Prompts are code:** keep them in files, version them, and test them.

**Read:** the Anthropic prompt engineering docs and the OpenAI prompting guide. Both are free.

---

## Level 3: Tool use / function calling (week 3)

- You describe functions to the model, e.g. `getWeather(city: string)`.
- The model decides **when** to call a function and with **what arguments**.
- Your code runs the function and sends the result back. The model then uses it in its answer.
- This is how AI **takes actions**: queries your database, calls external APIs, sends emails, creates records.
- Tool schemas are JSON Schema, which you can generate from zod.

### Flow
```
User question → LLM → "call getOrders(userId)" → your code runs it
→ result sent back to LLM → LLM writes final answer
```

### Build
A chat assistant that answers "What are my recent orders?" by calling your own backend API.

---

## Level 4: RAG (Retrieval-Augmented Generation) (weeks 4–5)

The model doesn't know **your** data (docs, database, PDFs). RAG gives it the relevant pieces at question time.

### Steps
1. **Load** documents (PDF, Markdown, web pages, DB rows).
2. **Chunk:** split them into small pieces (e.g. 300–800 tokens, with some overlap).
3. **Embed:** convert each chunk to a vector using an embedding model.
4. **Store** the vectors in a **vector database**:
   - **pgvector** (a Postgres extension, the easiest choice if you already use Postgres)
   - Pinecone, Qdrant, Weaviate, Chroma, Turbopuffer
   - MongoDB Atlas Vector Search (if you use MongoDB)
5. **Retrieve:** embed the user's question and find the most similar chunks.
6. **Generate:** put those chunks in the prompt and ask the model to answer **using only them**, with citations.

### Advanced
- **Hybrid search:** keyword (BM25 / full-text) + vector search combined.
- **Reranking:** a second model reorders results by relevance (Cohere Rerank, Voyage).
- **Chunking strategies:** by heading, by paragraph, semantic chunking.
- **Metadata filtering:** only search the current user's or workspace's documents. This is a security issue, not just a feature.
- **Contextual retrieval:** add context to each chunk before embedding it.

### Build
"Chat with your docs/PDFs." It's the classic AI portfolio project.

---

## Level 5: Agents (weeks 6–8)

- **Agent = an LLM running in a loop with tools:** think → call a tool → look at the result → repeat until the task is done.
- **Workflow vs agent:**
  - *Workflow*: you define fixed steps in code. Predictable, and usually better.
  - *Agent*: the model decides the steps. Flexible, but harder to control.
- **Patterns:**
  - Prompt chaining (step 1 output → step 2 input)
  - Routing (classify the request, then send it to a specialized prompt)
  - Parallelization (several calls at once, then merge)
  - Orchestrator–workers (one model plans, others execute)
  - Evaluator–optimizer (one model writes, another critiques, then loop)
  - Human-in-the-loop (ask the user before risky actions)
- **Memory:** short-term (conversation) and long-term (store facts in a DB, retrieve them later).
- **MCP (Model Context Protocol):** an open standard for connecting tools and data to any AI app (Claude, ChatGPT, IDEs). Building **MCP servers** is a valuable skill right now.
- **Frameworks (learn without one first, since a raw loop is ~50 lines):**
  - Vercel AI SDK (agents + tools, TypeScript)
  - Mastra (TypeScript agent framework)
  - Claude Agent SDK, OpenAI Agents SDK
  - LangChain / LangGraph (Python + JS)

**Read:** Anthropic, "Building Effective Agents" (essential).

### Build
1. A research agent: searches the web, reads pages, writes a report.
2. An MCP server that exposes your own API, then use it from Claude Desktop or Claude Code.

---

## Level 6: Production AI (where the real jobs are)

### Evals (testing AI output)
- AI output is not deterministic, so normal unit tests aren't enough.
- Build a **golden dataset** of inputs and expected outputs.
- Score outputs with code checks, regex, schema validation, or **LLM-as-judge** (another model grades the answer).
- Run evals on every prompt or model change, like CI tests.
- Tools: Promptfoo, Braintrust, LangSmith, Langfuse, Evalite.

### Observability
- Log every call: prompt, response, tokens, cost, latency, user.
- Tools: Langfuse (open source), Helicone, LangSmith, OpenTelemetry GenAI conventions.

### Security and guardrails
- **Prompt injection:** malicious text in a document or web page tells your AI to "ignore previous instructions." This is the #1 AI security risk.
  - Never give the model more permissions than the user has.
  - Treat model output as untrusted input.
  - Require confirmation for destructive actions.
- **Moderation:** filter unsafe input and output.
- **PII:** don't leak personal data into prompts or logs.
- **Data leakage across users** in RAG: always filter by user or tenant.
- Read: the **OWASP Top 10 for LLM Applications**.

### Reliability
- Retries with backoff, timeouts, fallback models or providers.
- Queues (BullMQ, Inngest, Trigger.dev) for long AI jobs.
- Validate structured output, and retry on schema failure.

### Cost
- Prompt caching, response caching, model routing (cheap model first, smart model when needed), batch APIs (~50% cheaper for non-urgent work).
- Per-user rate limits and credit systems.

### AI UX
- Stream everything, and show progress for long jobs.
- Let users edit, regenerate, undo, and give feedback (👍/👎).
- Show sources and citations, and be honest that "AI can make mistakes."
- Design good empty, loading and error states.

---

## Level 7: Other modalities

| Area | What | Tools / providers |
|---|---|---|
| **Image generation** | Text → image, editing, inpainting, upscaling, background removal | FLUX, Imagen, GPT Image, Stable Diffusion via **Replicate** / **fal.ai** |
| **Vision** | Send images/screenshots/PDFs to an LLM to describe or extract data | Claude, GPT, Gemini |
| **Speech-to-text** | Transcription, captions | Whisper, Deepgram, AssemblyAI |
| **Text-to-speech** | Natural voices | ElevenLabs, OpenAI TTS, Cartesia |
| **Realtime voice agents** | Talk to AI live | OpenAI Realtime, LiveKit Agents, Vapi |
| **Video generation** | Text/image → video | Veo, Runway, Kling, Sora |
| **Browser AI** | Run small models in the browser | Transformers.js, WebLLM, Chrome built-in AI APIs |

---

## Level 8: Deeper ML (optional, only if curious)

- **Python basics:** most ML research and tooling is in Python.
- **How neural networks work:** neurons, layers, gradient descent, backpropagation.
- **Transformers and attention:** the architecture behind every LLM.
- **Fine-tuning:** LoRA, when it's worth it (style, format, narrow tasks) and when RAG + prompting is better (usually).
- **Running local / open models:** Ollama, LM Studio, vLLM. Open models: Llama, Qwen, Mistral, DeepSeek, Gemma.
- **Hugging Face:** a GitHub for models and datasets.
- **Courses:**
  - Karpathy, "Neural Networks: Zero to Hero" (build GPT from scratch)
  - fast.ai, "Practical Deep Learning for Coders"
  - DeepLearning.AI short courses (free, many AI engineering topics)

---

## Portfolio projects (build in this order)

1. **Streaming chatbot:** Next.js + Vercel AI SDK + `useChat`.
2. **Structured extraction:** upload a receipt or invoice image → get clean JSON (vision + zod).
3. **Chat with docs:** RAG with a vector database, with citations.
4. **Tool-calling assistant:** an AI that reads and writes data through your own backend API.
5. **Agent + MCP server:** a research agent, plus an MCP server for your API.
6. **Production polish:** add evals, tracing (Langfuse), rate limits and cost tracking to any project above.
7. **Bonus:** an image generation app (Replicate/fal) or a voice assistant.

---

## 8-week plan

| Week | Focus | Output |
|---|---|---|
| 1 | Level 0 concepts, videos, play with Claude/ChatGPT | Notes on all core terms |
| 2 | Level 1 APIs, streaming, structured output | Project 1 + 2 |
| 3 | Level 2 prompting + Level 3 tool use | Project 4 |
| 4–5 | Level 4 RAG + vector DB | Project 3 |
| 6–7 | Level 5 agents + MCP | Project 5 |
| 8 | Level 6 evals, observability, security | Project 6 |
| After | Level 7 modalities, Level 8 if curious | Bonus projects |

---

## Key resources

- **Docs:** Anthropic docs (docs.anthropic.com / platform.claude.com), OpenAI docs, Vercel AI SDK docs (ai-sdk.dev)
- **Must-read articles:** Anthropic "Building Effective Agents", Anthropic "Contextual Retrieval", OWASP Top 10 for LLM Apps
- **Videos:** Andrej Karpathy (YouTube), 3Blue1Brown (neural networks series)
- **Courses:** DeepLearning.AI short courses, Anthropic courses on GitHub (`anthropics/courses`)
- **Book:** *AI Engineering* by Chip Huyen (the best single book for this path)
- **Stay updated:** Simon Willison's blog (simonwillison.net), Latent Space podcast, the Hugging Face blog

---

## Golden rules

1. Start with the simplest thing: one API call, then add complexity only when needed.
2. Prefer workflows over agents, and prompting + RAG over fine-tuning.
3. Measure with evals. Without evals you're guessing.
4. Treat model output as untrusted. Validate it, and never give the AI more power than the user has.
5. Watch cost from day one.
6. The field moves fast. Learn the fundamentals (tokens, context, tools, retrieval, evals), because they outlast any framework.
