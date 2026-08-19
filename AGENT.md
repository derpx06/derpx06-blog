# Copilot / AI Agent Instructions

## 1. Project Context & Architecture ✅
- **Framework**: Next.js 16 (App Router) + TypeScript.
- **UI**: no component library. The site is plain semantic HTML styled by the
  editorial design system in `src/resources/design-system.css`.
  - ✅ Use the `ds-` primitives (`.ds-t-*`, `.ds-dek`, `.ds-meta`, `.ds-box`,
    `.ds-item`, `.ds-rule`, `.ds-ph`, `.ds-main-rail`, `.ds-three`, …).
  - ✅ Use the CSS custom properties for colour (`--ink`, `--acc`, `--tint`, …).
    They are defined for light on `:root` and for dark on `[data-theme="dark"]`.
  - ❌ Never hardcode a hex value in a component.
  - Tailwind is still installed, but only the effect components in
    `src/components/ui/*` use it.
- **Data Layer**: MongoDB via `src/lib/content-repository.ts` and
  `src/lib/course-repository.ts`, with MDX files on disk as a fallback.
  `CONTENT_STORAGE` / `COURSE_STORAGE` choose `local`, `hybrid` or `mongodb`.
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
- **`api/articles` / `api/upload`**: the localhost-only editor's write API.
- **`api/og/generate`**: dynamic OpenGraph images.

### `src/components/site` (the design system in React)
- **`Masthead` / `SiteFooter`**: the page chrome on every route.
- **`ArticleView` / `ReaderHeader` / `ArticleContents`**: the reader.
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

## 4. Developer Workflow 🔧
- **Start**: `npm run dev`
- **Test**: `npm test` (pure logic), `npm run content:test`, `npm run course:test`
- **Lint**: `npm run lint` (Biome) · **Format**: `npm run biome-write`
- **Build**: `npm run build`
- **Images**: store in `public/images`; editor uploads land in `public/uploads`
  (or Cloudinary when `CLOUDINARY_*` is configured).

## 5. Do's and Don'ts
- ✅ **DO** put new copy in `src/resources/site.config.ts` or `content.tsx`.
- ✅ **DO** add a case to `scripts/site-logic.test.ts` when you touch a pure helper.
- ✅ **DO** check both themes and 390 / 768 / 1440 widths before calling UI done.
- ❌ **DON'T** reintroduce a component library; the design is the markup.
