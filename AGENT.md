# Copilot / AI Agent Instructions

## 1. Project Context & Architecture ✅
- **Framework**: Next.js 16 (App Router) + TypeScript.
- **UI**: no component library. Public pages use the violet design system in
  `src/styles/theme.css` (tokens + `.wrap .eyebrow .btn* .card .darkCard .pill
  .tag .h2 .lede .hero` primitives) plus CSS modules per component; the editorial
  `ds-*` system in `src/resources/design-system.css` remains for the admin CMS,
  MDX prose and code blocks, with its tokens bridged onto the new palette.
  - ✅ Use the CSS custom properties for colour (`--acc`, `--ink`, `--bg`,
    `--line`, …). Light on `:root`, dark on `[data-theme="dark"]`.
  - ❌ Never hardcode a hex value in a component. No Tailwind.
- **Data Layer**: MongoDB only, via `src/lib/content-repository.ts` and
  `src/lib/course-repository.ts`. There is no on-disk fallback: if the cluster
  is unreachable during a production build, `src/lib/build-guard.ts` fails the
  build rather than deploying an empty site.
- **Config**: centralized in `src/resources`.
  - `site.config.ts`: routes, fonts, editorial copy, newsletter, schema.
  - `content.tsx`: person details, page titles, about-page content.

## 2. Codebase Map 🗺️

### `src/app`
- **`[route]/page.tsx`**: Server Component per route. Reads through
  `src/lib/site-data.ts`, never the database directly.
- **`api/auth/*`**: reader accounts — signup, login, logout.
- **`api/reader/*`**: per-reader state — progress, saved, lessons, and a
  `state` endpoint the client provider reads once on mount.
- **`api/upload`**: image upload for the admin editor, localhost-gated.
- **`api/og/generate`**: dynamic OpenGraph images.

### `src/components/site` (the design system in React)
- **`SiteNav` / `SiteFooter`**: the page chrome, mounted once in `app/layout.tsx`.
- **`ArticleView`** → `src/components/article/ArticleLayout` + `ArticleReader`: the reader.
- **`ReaderProvider`**: fetches reader state once and applies optimistic
  updates. Every retention component reads it through `useReader()`.
- **`mdx-kit.tsx`**: plain replacements for the component-library tags the
  existing MDX bodies still reference (`Row`, `Card`, `Feedback`, …).

### `src/lib`
- **`pieces.ts`**: pure shaping of content records (read time, tags, grouping).
- **`site-data.ts`**: the I/O layer over `pieces.ts`.
- **`reader-selectors.ts`**: pure reads over reader state (resume point,
  course standing). Shared by server and client so the rules cannot diverge.
- **`auth/`**: scrypt password hashing, Mongo-backed sessions, rate limiting.
- **`images.ts`**: `resolveImage()` — never render a path that isn't on disk.
- **`highlight.ts`**: shiki, server-side only.

## 3. Key Patterns 🧩
- **Static by default.** Content routes are prerendered; anything per-reader
  arrives through `ReaderProvider`'s single `/api/reader/state` fetch. Do not
  call `cookies()` in a layout — it would make the whole site dynamic.
- **`routes` disables sections.** `RouteGuard` treats it as a deny-list: a path
  it does not mention is a real page.
- **Two auth systems, deliberately.** `PAGE_ACCESS_PASSWORD` gates author
  routes; reader accounts (`/signin`, `/signup`) gate nothing and only carry
  saved pieces, reading progress and lesson completion.
- **No invented numbers.** There is no analytics; never render a read count,
  student count or "most read" ranking that isn't backed by real data.

## 3b. Writing an article ✍️
Bodies are **markdown-first MDX**. The checker (`npm run content:check`) enforces
these because each one fails silently otherwise:
- Open with a **plain paragraph** — `.ds-prose-dropcap > p:first-child` supplies
  the drop cap, so a JSX hero means no drop cap at all.
- Use `##` / `###` markdown headings. `extractHeadings()` regexes the raw body,
  so a `<Heading as="h2">` renders but never reaches the contents rail. Never an
  `#` — the page already renders the title as its H1.
- Fence code with a language from `src/lib/highlight.ts`; anything else silently
  degrades to plaintext.
- Give every article a diagram. `npm run content:diagrams` regenerates them all
  from `scripts/generate-diagrams.mjs`, keyed by slug. They are transparent SVG
  drawn in two theme-neutral inks, so one file sits correctly on the light plate
  and the dark one — never add a second copy for dark mode.
- Never leave `image` pointing at a file that is not on disk. An empty value
  falls through to the generated OG card; a stale path 404s for crawlers.
  A `.ds-ph` plate renders **only** when there is an image, so an article with
  none simply shows no plate — it must never show a caption in its place.
- Reach for JSX only where it earns it: `<Feedback>`, `<CodeBlock>`, `<Button>`.

Publication dates are set in the draft's frontmatter and imported directly;
`saveContent()` cannot backdate. Nothing filters on date, so a future-dated post
is live immediately — add `publishedAt: { $lte: new Date() }` to `getContentList`
and `getContentBySlug` if you want the stagger to act as a real schedule.

## 4. Developer Workflow 🔧
- **Start**: `npm run dev`
- **Test**: `npm test` (pure logic over `scripts/*.test.ts`)
- **Content**: `npm run content:check` (editorial lint over every document),
  `npm run content:import` (MDX drafts → Mongo, `-- --write` to commit),
  `npm run content:export` (Mongo → `content-backup/`, run before migrations),
  `npm run content:diagrams` (redraw every article diagram)
- **Lint**: `npm run lint` (Biome) · **Format**: `npm run biome-write`
- **Build**: `npm run build`
- **Images**: store in `public/images`; admin-editor uploads land in
  `public/uploads` (or Cloudinary when `CLOUDINARY_*` is configured).

## 5. Do's and Don'ts
- ✅ **DO** put new copy in `src/resources/site.config.ts` or `content.tsx`.
- ✅ **DO** add a case to `scripts/site-logic.test.ts` when you touch a pure helper.
- ✅ **DO** run `npm run content:check` after writing or editing an article.
- ✅ **DO** check both themes and 390 / 768 / 1440 widths before calling UI done.
- ❌ **DON'T** reintroduce a component library; the design is the markup.
