# Copilot / AI Agent Instructions

## 1. Project Context & Architecture ✅
- **Framework**: Next.js 16 (App Router) + TypeScript.
- **UI Library**: Once UI System (`@once-ui-system/core`).
- **Styling**: Prop-based styling via Once UI components (e.g., `paddingTop="24"`).
  - ❌ Avoid Tailwind classes or raw CSS/SCSS unless unavoidable.
  - ✅ Use Once UI layout components (`Flex`, `Grid`, `Column`, `Row`) for structure.
- **Data Layer**: File-system based MDX content.
  - Data access: `getPosts` and `getMDXData` in `src/utils/utils.ts`.
  - Content structure: `src/app/[section]/posts/*.mdx`.
- **Config**: Centralized in `src/resources`.
  - `once-ui.config.ts`: Routes, fonts, theme, social.
  - `content.tsx`: Static text content (labels, titles).

## 2. Codebase Map (The "Roadmap") 🗺️
Understand the purpose of every key folder to navigate quickly.

### `src/app`
- **`[route]/page.tsx`**: Server Component entry point for routes (e.g., `/blog`, `/work`). Fetches data via `utils.ts`.
- **`[route]/posts/[slug].mdx`**: The actual content files. AI should read these to understand content structure.
- **`api/`**: Next.js API Routes.
  - `authenticate/`: Validates password (`POST`).
  - `check-auth/`: Verifies `authToken` cookie (`GET`).
  - `og/generate/`: Dynamic OpenGraph image generation.

### `src/components`
- **`mdx.tsx`**: The custom MDX renderer. Maps HTML tags to Once UI components (e.g., `a` -> `SmartLink`).
- **`RouteGuard.tsx`**: Client-side auth wrapper. Checks `protectedRoutes` config and handles password UI.
- **`Header.tsx` / `Footer.tsx`**: Global layout elements.

### `src/resources` (Configuration Center)
- **`once-ui.config.ts`**: **The Brain**. Controls distinct site settings:
  - `routes`: Enable/disable top-level links.
  - `protectedRoutes`: specific paths requiring password.
  - `style`: Theme, visual tokens (radius, scaling).
- **`content.tsx`**: **The Voice**. Contains all static strings, labels, and person details. Edit this to change site text.

### `src/utils`
- **`utils.ts`**: **The Engine**.
  - `getPosts()`: Reads MDX files recursively.
  - `getMDXData()`: Parses frontmatter (gray-matter).
  - Defines `Metadata` type (title, date, images, team).

## 3. Key Patterns & Conventions 🧩
- **Navigation & Auth**:
  - Protected routes defined in `protectedRoutes` (`once-ui.config.ts`).
  - `RouteGuard.tsx` (Client Component) handles locking logic via `PAGE_ACCESS_PASSWORD` env var.
  - Auth flow: Client -> `POST /api/authenticate` -> Set `authToken` cookie.
- **MDX Rendering**:
  - Use `CustomMDX` (`src/components/mdx.tsx`) to render content.
  - Internal links MUST be relative (start with `/`).
- **State Management**:
  - Prefer Server Components for data fetching (`page.tsx`).
  - Use simple React state (`useState`) for interactive UI.

## 4. Developer Workflow Reality 🔧
- **Start**: `npm run dev` (Next.js dev server).
- **Format**: `npm run biome-write` (Uses Biome, NOT Prettier).
- **Build**: `npm run build` (Standard Next.js build).
- **Images**:
  - Store in `public/images`.
  - Reference dynamically via `baseURL` in metadata.

## 5. Integration & Data Flow 📡
- **Content Flow**: MDX Files -> `utils.ts` (fs read) -> Server Page (`page.tsx`) -> `CustomMDX`.
- **Auth Flow**: User visits Protected Route -> `RouteGuard` checks config -> If locked & no cookie, show Password Input -> API Validate -> Cookie Set -> Refetch/Access.
- **External**: Mailchimp & Netlify configured via `once-ui.config.ts` and `netlify.toml`.

## 6. Do's and Don'ts
- ✅ **DO** update `src/resources/content.tsx` when changing static text.
- ✅ **DO** use `npm run biome-write` before committing.
- ❌ **DON'T** hardcode colors. Use semantic tokens from Once UI.