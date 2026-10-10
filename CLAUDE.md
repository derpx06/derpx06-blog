# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENT.md` in this repo is the long-form convention guide — read it before writing an
article or touching the design system. This file covers commands and the shape of the
system; it does not repeat AGENT.md's editorial rules.

## Commands

```bash
npm run dev                # next dev
npm run build              # next build — fails hard if MongoDB is unreachable
npm test                   # node:test over scripts/*.test.ts
# a single test — the flag must precede the file, so npm run-script args won't do:
node --experimental-strip-types --import ./scripts/register-ts.mjs \
  --test --test-name-pattern "resumePoint" scripts/site-logic.test.ts
npm run lint               # biome lint over src and scripts
npm run biome-write        # format

npm run content:check      # editorial lint over every published document
npm run content:import     # content-drafts/**/*.mdx → Mongo (dry run)
npm run content:import -- --write     # commit the import
npm run content:export     # Mongo → content-backup/ (run before migrations)
npm run content:diagrams   # redraw every article SVG from scripts/generate-diagrams.mjs
npm run content:snapshot   # Mongo → content-snapshot.json (commit it; the build's fallback)
npm run admin:create -- you@example.com   # create the account for an ADMIN_EMAILS address
node scripts/snapshot-content.mjs --check    # CI: snapshot present and < 30 days old
```

Every `content:*` script talks to Mongo directly and needs `MONGODB_URI` in `.env.local`
(see `.env.example`). Tests run TypeScript natively via `scripts/register-ts.mjs`, which
also resolves the `@/` alias — no build step.

## Architecture

**Next.js 16 App Router, MongoDB-only content.** Mongo is the source of truth. A Mongo
failure during `next build` falls back to the committed `content-snapshot.json`
(`src/lib/build-guard.ts` + `content-snapshot.ts`) and warns loudly; with no snapshot either,
the build fails rather than shipping an empty site. At runtime the same queries degrade
quietly — the snapshot is never served to readers, only used to get a build out.

Refresh the snapshot with `npm run content:snapshot` whenever you publish, and commit it.

The read path is layered and one-directional — a route never queries Mongo itself:

```
app/**/page.tsx  →  lib/site-data.ts  →  lib/{content,course}-repository.ts  →  lib/mongodb.ts
                         └─ lib/pieces.ts (pure shaping: read time, tags, grouping)
```

`pieces.ts` and `reader-selectors.ts` are pure and shared by server and client, which is why
the tests only cover those two plus `headings.ts` and `auth/passwords.ts`. Adding logic to a
pure helper means adding a case to `scripts/site-logic.test.ts`.

**Static by default.** Content routes prerender. Everything per-reader arrives through one
`/api/reader/state` fetch in `ReaderProvider` and is applied optimistically. Calling
`cookies()` in a layout would make the entire site dynamic — don't.

**Route policy is enforced server-side.** `routes` and `protectedRoutes` live in
`src/resources/route-policy.ts` — kept out of `site.config.ts` because that imports
`next/font`, which the proxy cannot load. `src/proxy.ts` rewrites a disabled route to
`/blocked` (a real 404) and a locked one to `/locked` before the page renders, so protected
HTML is never produced. `RouteGuard` is the client-side half of the same policy, not the
enforcement. `routes` is a **deny-list**: a path it doesn't mention is a live page.

**Two independent auth systems.** `PAGE_ACCESS_PASSWORD` gates the routes in
`protectedRoutes`; the cookie is an HMAC over its own expiry (`src/lib/auth/page-access.ts`),
so it cannot be forged or replayed. Reader accounts (`/signin`, `/signup`, scrypt + Mongo
sessions under `src/lib/auth/`) gate nothing and only carry saved pieces, progress and lesson
completion.

## The admin CMS

`/admin` is full CRUD over every content type, from inside the site.

- **Who gets in**: `ADMIN_EMAILS` (comma-separated) promotes ordinary reader
  accounts. There is no role in Mongo, so admin rights change only in the deploy
  config. `src/lib/auth/admin.ts` is the single authorisation point;
  `src/lib/auth/admin-emails.ts` holds the pure rule so it can be tested.
  **Signup refuses any allowlisted address** — otherwise, since signup is open,
  whoever registered it first would become an admin. Accounts come from
  `npm run admin:create`.
- **Guarding**: `src/proxy.ts` excludes `/api`, so every `/api/admin/*` route
  calls `guardAdminRequest()` itself, and `src/app/admin/layout.tsx` guards the
  pages. Purging content or deleting a course additionally requires the
  page-access password (`requireReauth`), so a borrowed session cannot destroy
  anything.
- **Writes** live in `src/lib/admin/{content,course}-writes.ts`, not the
  repositories. They do what `saveContent()` cannot: archive, move section/slug
  (the `{section, slug}` upsert key means a naive write duplicates), set
  `publishedAt`, and delete. Course topics/lessons are **array edits** — lesson
  order *is* array order.
- **Editing** is a WYSIWYG canvas (MDXEditor) over the same MDX source, plus the
  palette of every component (`src/components/admin/palette.ts`). The canvas *is*
  the preview, so there is no second column; "Preview ↗" still opens
  `/preview/<signed token>` in a tab for the finished article template, which is
  the only place shiki and KaTeX actually run. A source view opens instead for
  the 15 documents carrying multi-line JSX attributes — `src/lib/mdx-safety.ts`
  is the rule, and `scripts/mdx-roundtrip.test.ts` proves the other 96 survive a
  save unchanged. The palette, the MDX component map and the canvas's component
  list are all driven by the registry in `src/lib/mdx-registry.ts`, so the
  compiler catches drift between them.
- **Publishing** runs `checkDocument` from `scripts/check-content.mjs` — imported,
  not restated. `editorial-check.ts` adds severity: silent breakage (no drop cap,
  empty contents rail, missing image, script tags) blocks; cosmetic gaps warn.
- **Revalidation** matters: content is ISR at 300s, and a page fetched while a
  piece was a draft caches its own 404. `revalidateContent`/`revalidateCourses`
  therefore revalidate both the literal path and the **route pattern**.

**The legacy TipTap editor is gone.** `/blog/editor`, `/simple` and `/api/articles` were
deleted once `/admin` got a real editor; `src/components/tiptap-*`, `src/hooks/*` and the
`@tiptap/*` dependencies went with them. What survives is `/api/upload` — the admin editor's
image upload — still gated on a localhost `Host` header (`isLocalArticleEditorHost()`) *and*,
in a production build, on `ENABLE_LOCAL_EDITOR=1`; never set that in Vercel. A dev machine
needs no configuration. Uploads go to Cloudinary when `CLOUDINARY_*` is set; the
`public/uploads` fallback refuses to run in production.

**Article bodies are MDX, full stop.** `ContentRecord.bodyFormat` still exists — old
`content_revisions` rows carry it and must keep parsing — but every live document is `"mdx"`
and nothing writes `"html"` any more. `src/components/site/ArticleBody.tsx` renders through
`CustomMDX` unconditionally, and `extractHeadings()` reads markdown `##`/`###` only.

## Styling

No component library. The public UI is the violet "derpx06.dev" system: global tokens and
primitives in `src/styles/theme.css` (`--acc --bg --ink --mute --line …`, `.wrap .eyebrow .btn*
.card .darkCard .pill .tag .h2 .lede .hero`; light on `:root`, dark on `[data-theme="dark"]`),
page/component styles in CSS modules next to their component, fonts Archivo + JetBrains Mono
(DM Serif Display and VT323 only for the Explainers/Notes display headlines). The older
`ds-*` editorial system in `src/resources/design-system.css` still styles the admin CMS, the
MDX prose (`.ds-prose`), code blocks and the locked/preview pages; `theme.css` bridges its
tokens (`--pg --acc --rule …`) onto the new palette, so never hardcode a hex in a component.
Page chrome: `SiteNav` (fixed; a bar at the top, a frosted capsule once scrolled) and
`SiteFooter` are mounted once in `src/app/layout.tsx` — pages do not render a masthead.
Article/lesson template: `src/components/article/ArticleLayout.tsx` (via `ArticleView`).
Tailwind is no longer used anywhere. All copy belongs in `src/resources/site.config.ts` or
`content.tsx`, not in components.

## Content gotchas

Article bodies are markdown-first MDX and several failure modes are silent — `npm run
content:check` is the only thing that catches them. See AGENT.md §3b for the full list; the
short version: open with a plain paragraph (the drop cap comes from `p:first-child`), use
`##`/`###` markdown headings (`extractHeadings()` regexes raw text, so JSX and HTML headings
never reach the contents rail at all — `content:check` fails a body with no `##`), fence code with a language known to `src/lib/highlight.ts`, and never point `image` at
a file that isn't on disk.

## Security invariants

Five things are load-bearing; don't undo them without a replacement:
- `src/proxy.ts` is what enforces `routes`/`protectedRoutes`. `RouteGuard` alone leaks HTML.
- `/api/og/{proxy,fetch}` must go through `src/lib/safe-fetch.ts` — they take a
  caller-supplied URL, which is an SSRF primitive without the scheme + resolved-address check.
- `/api/upload` is unauthenticated; `isLocalArticleEditorHost()` is the only thing in front
  of it, and it also gates `/api/og/{proxy,fetch}`.
- `CustomMDX` runs with next-mdx-remote's default `blockJS`. Bodies come from the database.
- Admin auth is `ADMIN_EMAILS` + the signup refusal. Removing either one opens the CMS.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
