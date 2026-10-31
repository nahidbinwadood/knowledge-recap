#!/usr/bin/env node
// Publishes react blogs from day-02/blogs-react/**/*.md to the playground
// backend: frontmatter title/excerpt, body after the closing `---`, React
// category, PUBLISHED status. Covers are optional — pass --cover, let Gemini
// generate one, or use --no-cover and add images later.
//
//   ACCESS_TOKEN=... node scripts/publish-react-blog.mjs --dir day-02/blogs-react --no-cover
//   ACCESS_TOKEN=... node scripts/publish-react-blog.mjs --file <one.md> --no-cover
//   GEMINI_API_KEY=... node scripts/publish-react-blog.mjs --file <one.md> --image-only
//
//   --file <path>     publish one markdown file
//   --dir <path>      publish every .md under a directory (idempotent: posts
//                     whose title already exists on the backend are skipped)
//   --no-cover        omit the cover image entirely
//   --cover <path>    reuse an existing image
//   --image-only      generate/verify the cover only, never call the API
//   --status <s>      PUBLISHED (default) or DRAFT
//   --sync-content    rewrite the stored body of posts that already exist
//   --dry-run         print what would be sent, without sending it
//   --exclude <pat>   skip directories whose name contains <pat> (repeatable)
//
// Secrets come from the environment and are never printed or written.

import fs from 'node:fs';
import path from 'node:path';

const BASE =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  'https://playground-backend-rho.vercel.app/api/v1';
const API_KEY = process.env.GEMINI_API_KEY;
const MAX_BYTES = 1000 * 1024;

// Daily image quota is enforced per model, so every distinct image model on the
// key is worth a try before giving up.
const MODELS = process.env.GEMINI_IMAGE_MODEL
  ? [process.env.GEMINI_IMAGE_MODEL]
  : [
      'gemini-3.1-flash-lite-image',
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-image-preview',
      'gemini-2.5-flash-image',
      'nano-banana-pro-preview',
      'gemini-3-pro-image',
    ];

const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);

// ------------------------------------------------------------- frontmatter
const parseBlog = (file) => {
  const src = fs.readFileSync(file, 'utf8');
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error('no frontmatter block');

  const frontmatter = match[1];
  const field = (name) => {
    const line = frontmatter.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'));
    if (!line) return '';
    const raw = line[1].trim();
    if (raw.startsWith('"') && raw.endsWith('"')) {
      try {
        return JSON.parse(raw);
      } catch {
        return raw.slice(1, -1);
      }
    }
    if (raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1);
    return raw;
  };

  let tags = [];
  try {
    const parsed = JSON.parse(field('tags') || '[]');
    if (Array.isArray(parsed)) tags = parsed;
  } catch {
    tags = [];
  }

  const title = field('title').trim();
  const excerpt = field('excerpt').trim();
  if (!title) throw new Error('frontmatter has no title');

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Body = everything after the closing ---, including the post's own `# H1`.
  // The stored content is meant to be the markdown file verbatim from there on.
  const body = src.slice(match[0].length).trim();
  if (!body) throw new Error('body is empty');

  return { title, excerpt, tags, slug, body };
};

// ------------------------------------------------------------- cover prompt
// One hand-written direction per post so no two covers look alike; anything
// without an entry gets a deterministic variant of the house style.
const HOUSE = `Near-black charcoal background (#0b0e11), a single electric-lime
accent, thin wireframe grid lines, soft volumetric glow, fine film grain,
high contrast, editorial tech-magazine cover art, 16:9 composition, wide empty
space on the left third for a headline, absolutely no text, letters, numbers,
logos, watermarks, UI screenshots or people.`;

const COVER_IDEAS = {
  'what-react-actually-is': `An isometric wireframe diorama: one glowing lime cube built
from thin grid lines rests on a dark plane, and from it a translucent projection
rises upward into a flat panel of plain rectangles and lines, as if state is
casting a screen above itself. Sparse dust particles in the lime light. ${HOUSE}`,
  'components-elements-and-instances': `A dark plane carrying three identical
lime outline shapes that share one silhouette but sit at different depths, with a
faint copy of each shape suspended above it like a shadow cast by a light source
behind. ${HOUSE}`,
  'rendering-and-reconciliation': `Two overlapping wireframe trees drawn in thin
lines, the nearer one in electric lime and the farther one in cold grey, with the
few differing branches highlighted as bright nodes and the rest left dim. ${HOUSE}`,
  'props-and-one-way-flow': `A wireframe funnel of thin lime lines pouring
small geometric tokens from a single source at the top down through narrowing
channels into separate dark containers, each token travelling only downward
with no return path. ${HOUSE}`,
};

const FALLBACK_STYLES = [
  'a single monumental wireframe object lit from below by lime light on a dark plane,',
  'an exploded isometric diagram of flat translucent planes, one glowing lime,',
  'a long thin lime beam cutting across layered dark glass panels,',
  'a dense field of small lime dots connected by faint lines into one larger form,',
];

const buildPrompt = ({ slug, title, excerpt, tags }) => {
  if (COVER_IDEAS[slug]) return COVER_IDEAS[slug];
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const style = FALLBACK_STYLES[hash % FALLBACK_STYLES.length];
  return `Abstract editorial cover art for a technical article called "${title}"
(topics: ${tags.join(', ') || 'react'}). The image shows ${style} evoking this idea:
${excerpt}. ${HOUSE}`;
};

// --------------------------------------------------------------- gemini call
const generateCover = async (prompt) => {
  if (!API_KEY) throw new Error('GEMINI_API_KEY is not set');

  const call = async (model, modalities) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: modalities,
            imageConfig: { aspectRatio: '16:9', imageSize: '1K' },
          },
        }),
      }
    );
    const json = await res.json();
    if (!json.candidates) {
      throw new Error(`gemini ${res.status}: ${JSON.stringify(json).slice(0, 220)}`);
    }
    const part = (json.candidates[0].content?.parts || []).find((p) => p.inlineData);
    return part?.inlineData;
  };

  const problems = [];
  for (const model of MODELS) {
    for (const modalities of [['IMAGE'], ['TEXT', 'IMAGE']]) {
      try {
        const inline = await call(model, modalities);
        if (inline) {
          console.log(`    cover: generated with ${model}`);
          return inline;
        }
        problems.push(`${model} (${modalities.join('+')}): no image returned`);
      } catch (error) {
        problems.push(`${model} (${modalities.join('+')}): ${error.message}`);
        if (/ 429:| 404:| 403:/.test(` ${error.message}`)) break;
      }
    }
  }
  throw new Error(`no image from any model: ${problems[0]}`);
};

// -------------------------------------------------------------- size check
const imageDims = (buf) => {
  if (buf.subarray(1, 4).toString('ascii') !== 'PNG') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};

// ---------------------------------------------------------------- transport
const request = async (p, { method = 'GET', body, token } = {}) => {
  const isForm = body instanceof FormData;
  const headers = {};
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${p}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${res.status}: non-JSON: ${text.slice(0, 160)}`);
  }
  if (!json.success) throw new Error(`${res.status}: ${json.message}`);
  return json;
};

// ------------------------------------------------------------------- files
const collectExcludes = () => {
  const excludes = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--exclude' && args[i + 1]) excludes.push(args[i + 1]);
  }
  return excludes;
};

const collectFiles = () => {
  const one = arg('file');
  if (one) return [one];

  const dir = arg('dir');
  if (!dir) throw new Error('pass --file <path> or --dir <path>');

  const excludes = collectExcludes();
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (excludes.some((pat) => entry.name.includes(pat))) continue;
        walk(full);
      } else if (entry.name.endsWith('.md')) out.push(full);
    }
  };
  walk(dir);
  return out.sort();
};

// --------------------------------------------------------------------- main
const main = async () => {
  const files = collectFiles();
  const status = arg('status') || 'PUBLISHED';
  const noCover = flag('no-cover');
  const dryRun = flag('dry-run');
  const syncContent = flag('sync-content');

  console.log(`files:   ${files.length}`);
  console.log(`status:  ${status}${noCover ? ' (no cover)' : ''}`);

  let token;
  let me;
  let category;
  let existing = new Map();

  if (!flag('image-only') && !dryRun) {
    token = process.env.ACCESS_TOKEN;
    if (!token) throw new Error('ACCESS_TOKEN is not set');
    me = await request('/auth/me', { token });
    const categories = await request('/categories');
    category = categories.data.find((c) => c.slug === 'react');
    if (!category) throw new Error('no "react" category on the backend');

    // Idempotency: re-running must not create duplicates.
    const all = await request('/blogs/all?limit=100', { token });
    const list = all.data.docs || all.data;
    existing = new Map(list.map((b) => [b.title.trim().toLowerCase(), b]));
    console.log(`account: ${me.data.name} | already on backend: ${existing.size}`);
  }

  const created = [];
  const skipped = [];
  const repaired = [];
  const failed = [];

  for (const [i, file] of files.entries()) {
    const label = `${String(i + 1).padStart(2, '0')}/${files.length}`;
    let post;
    try {
      post = parseBlog(file);
    } catch (error) {
      failed.push({ file, reason: error.message });
      console.log(`${label} ✗ ${path.basename(file)} — ${error.message}`);
      continue;
    }

    console.log(
      `${label} ${post.title} — body ${post.body.length}B, ` +
        `excerpt ${post.excerpt.length}B, tags ${post.tags.length}`
    );

    if (existing.has(post.title.toLowerCase())) {
      const current = existing.get(post.title.toLowerCase());

      if (!syncContent) {
        skipped.push(post);
        console.log('     ↳ already published, skipped');
        continue;
      }

      // Same post, newer markdown: rewrite the stored body in place. Stored
      // content comes back with CRLF, so normalise before comparing.
      const stored = (current.content || '').replace(/\r\n/g, '\n');
      if (stored === post.body) {
        skipped.push(post);
        console.log('     ↳ content already current');
        continue;
      }

      try {
        const form = new FormData();
        form.append('title', post.title);
        form.append('excerpt', post.excerpt);
        form.append('content', post.body);
        form.append('status', current.status || status);
        form.append('category', current.category);
        if (current.author) form.append('author', current.author);

        const response = await request(`/blogs/${current.id}`, {
          method: 'PATCH',
          body: form,
          token,
        });
        repaired.push(response.data);
        console.log(
          `     ↳ content rewritten (${stored.length} → ${post.body.length} chars)`
        );
      } catch (error) {
        failed.push({ file, reason: error.message });
        console.log(`     ↳ FAILED to rewrite content: ${error.message}`);
      }
      continue;
    }

    if (dryRun) {
      created.push(post);
      continue;
    }

    try {
      const form = new FormData();
      form.append('title', post.title);
      form.append('excerpt', post.excerpt);
      form.append('content', post.body);
      form.append('status', status);
      form.append('category', category.id);
      form.append('author', me.data.id);

      if (!noCover) {
        const coversDir = path.join(path.dirname(file), '..', 'covers');
        fs.mkdirSync(coversDir, { recursive: true });
        const existingCover = arg('cover');
        let cover;
        let coverName;
        if (existingCover) {
          cover = fs.readFileSync(existingCover);
          coverName = path.basename(existingCover);
        } else {
          // Auto-discover a co-located image with the same basename
          const dir = path.dirname(file);
          const base = path.basename(file, '.md');
          const IMAGE_EXTS = ['.jfif', '.jpg', '.jpeg', '.png', '.webp'];
          const colocated = IMAGE_EXTS
            .map((ext) => path.join(dir, `${base}${ext}`))
            .find((p) => fs.existsSync(p));

          if (colocated) {
            cover = fs.readFileSync(colocated);
            coverName = path.basename(colocated);
            console.log(`    cover: using co-located ${coverName}`);
          } else {
            const inline = await generateCover(buildPrompt(post));
            cover = Buffer.from(inline.data, 'base64');
            const ext = cover.subarray(1, 4).toString('ascii') === 'PNG' ? '.png' : '.jpg';
            coverName = `${post.slug}${ext}`;
            fs.writeFileSync(path.join(coversDir, coverName), cover);
          }
        }
        if (cover.length > MAX_BYTES) {
          throw new Error(`cover is ${(cover.length / 1024).toFixed(0)} KB, over 1 MB`);
        }
        const dims = imageDims(cover);
        const mimeType = coverName.endsWith('.jfif') || coverName.endsWith('.jpg') || coverName.endsWith('.jpeg')
          ? 'image/jpeg'
          : dims ? 'image/png' : 'image/jpeg';
        form.append(
          'coverImage',
          new Blob([cover], { type: mimeType }),
          coverName
        );
      }

      const response = await request('/blogs/create', {
        method: 'POST',
        body: form,
        token,
      });
      created.push(response.data);
      console.log(`     ↳ created ${response.data.slug} (${response.data.status})`);
    } catch (error) {
      failed.push({ file, reason: error.message });
      console.log(`     ↳ FAILED: ${error.message}`);
    }
  }

  console.log('\n================ summary ================');
  console.log(`created:  ${created.length}`);
  console.log(`repaired: ${repaired.length}`);
  console.log(`skipped:  ${skipped.length}`);
  console.log(`failed:   ${failed.length}`);
  for (const f of failed) console.log(`  - ${path.basename(f.file)}: ${f.reason}`);

  if (failed.length) process.exitCode = 1;
};

main().catch((error) => {
  console.error(`\nfailed: ${error.message}`);
  process.exit(1);
});
