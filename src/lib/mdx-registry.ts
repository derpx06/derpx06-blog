/**
 * The single declaration of every custom component an MDX body may use.
 *
 * Three consumers read this: the render map in `src/components/mdx.tsx` (typed
 * as `Record<MdxBlockName, …>`, so a missing implementation is a compile
 * error), the insert palette in `src/components/admin/palette.ts`, and the
 * WYSIWYG editor's component descriptors.
 *
 * Adding a component means adding one entry here plus its implementation.
 * Pure data on purpose — no React, no `next/*` — so a client bundle can import it.
 */

export type MdxPropSpec = {
  name: string;
  /** "string" → prop="v"; "expression" → prop={…}; "boolean" → bare prop */
  type: "string" | "expression" | "boolean";
  /** Fixed choices — the editor renders these as a <select>. */
  options?: readonly string[];
  required?: boolean;
  hint?: string;
};

export type MdxBlockSpec = {
  /** The JSX name a body writes. Must match the key in mdx.tsx's map. */
  name: string;
  label: string;
  hint: string;
  /** MDXEditor descriptor kind: "flow" = block, "text" = inline. */
  kind: "flow" | "text";
  hasChildren: boolean;
  props: readonly MdxPropSpec[];
  group: "Structure" | "Callouts" | "Code" | "Layout" | "Media" | "Data" | "Inline";
  /** Props pre-filled when inserted from the menu. */
  defaults?: Readonly<Record<string, string>>;
  /** Renders, but must not be offered — see `Heading`. */
  deprecated?: boolean;
};

/** Languages shiki is loaded with — mirrors `LANGS` in `src/lib/highlight.ts`. */
export const CODE_LANGUAGES = [
  "bash",
  "c",
  "cpp",
  "csharp",
  "css",
  "diff",
  "docker",
  "go",
  "graphql",
  "html",
  "ini",
  "java",
  "javascript",
  "json",
  "jsx",
  "kotlin",
  "lua",
  "markdown",
  "php",
  "python",
  "ruby",
  "rust",
  "scss",
  "shell",
  "sql",
  "swift",
  "toml",
  "tsx",
  "typescript",
  "xml",
  "yaml",
] as const;

/** Icon names `mdx-kit`'s `ICONS` map resolves; anything else falls back to `info`. */
export const ICON_NAMES = [
  "sparkle",
  "sparkles",
  "info",
  "warning",
  "danger",
  "close",
  "check",
  "checkCircle",
  "chevronLeft",
  "chevronRight",
  "arrowRight",
  "arrowUpRight",
  "openLink",
] as const;

const ICON_SIZES = ["xs", "s", "m", "l", "xl"] as const;

/** `variantStyle()` splits this as family-weight-size. */
const TEXT_VARIANTS: readonly string[] = ["display", "heading", "body", "label"].flatMap((family) =>
  ["default", "strong"].flatMap((weight) =>
    ["xs", "s", "m", "l", "xl"].map((size) => `${family}-${weight}-${size}`),
  ),
);

/** `variantStyle()` splits this as group-tone; only `neutral` honours the tone. */
const ON_BACKGROUND = [
  "neutral-weak",
  "neutral-medium",
  "neutral-strong",
  "accent-strong",
  "danger-strong",
  "warning-strong",
  "success-strong",
] as const;

const ALIGN = ["center", "start", "end", "between", "around"] as const;

/** The `BoxProps` every layout component in `mdx-kit.tsx` spreads into a style. */
const BOX_PROPS = [
  { name: "gap", type: "string", hint: "px" },
  { name: "padding", type: "string", hint: "px" },
  { name: "paddingX", type: "string", hint: "px" },
  { name: "paddingY", type: "string", hint: "px" },
  { name: "marginTop", type: "string", hint: "px" },
  { name: "marginBottom", type: "string", hint: "px" },
] as const satisfies readonly MdxPropSpec[];

const FLEX_PROPS = [
  { name: "vertical", type: "string", options: ALIGN },
  { name: "horizontal", type: "string", options: ALIGN },
  ...BOX_PROPS,
] as const satisfies readonly MdxPropSpec[];

export const MDX_BLOCKS = [
  /* ------------------------------------------------------------- structure */
  {
    name: "Heading",
    label: "Heading",
    hint: "use ## instead — a JSX heading never reaches the contents rail",
    kind: "flow",
    hasChildren: true,
    group: "Structure",
    deprecated: true,
    props: [
      { name: "as", type: "string", options: ["h1", "h2", "h3", "h4", "h5", "h6"] },
      { name: "variant", type: "string", options: TEXT_VARIANTS },
      { name: "onBackground", type: "string", options: ON_BACKGROUND },
      ...BOX_PROPS,
    ],
  },
  {
    name: "Line",
    label: "Rule",
    hint: "horizontal rule, or vert for a divider",
    kind: "flow",
    hasChildren: false,
    group: "Structure",
    props: [{ name: "vert", type: "boolean", hint: "vertical divider" }],
  },

  /* -------------------------------------------------------------- callouts */
  {
    name: "Feedback",
    label: "Callout",
    hint: "<Feedback variant title>",
    kind: "flow",
    hasChildren: true,
    group: "Callouts",
    defaults: { variant: "info", title: "" },
    props: [
      {
        name: "variant",
        type: "string",
        options: ["info", "success", "warning", "danger"],
      },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      ...BOX_PROPS,
    ],
  },

  /* ------------------------------------------------------------------ code */
  {
    name: "CodeBlock",
    label: "Code block, tabbed",
    hint: "<CodeBlock codes={…}>",
    kind: "flow",
    hasChildren: false,
    group: "Code",
    defaults: { codes: '[{ language: "python", label: "Python", code: `` }]' },
    props: [
      {
        name: "codes",
        type: "expression",
        required: true,
        hint: "[{ language, label, code }] or [{ file, language }]",
      },
      {
        name: "language",
        type: "string",
        options: CODE_LANGUAGES,
        hint: "per entry in `codes`, or the fence's language — anything else degrades to plaintext",
      },
      { name: "showOutput", type: "boolean", hint: "notebook cells, with their output" },
    ],
  },
  {
    name: "InlineCode",
    label: "Inline code",
    hint: "<InlineCode> — `backticks` do the same",
    kind: "text",
    hasChildren: true,
    group: "Code",
    props: [],
  },

  /* ---------------------------------------------------------------- layout */
  {
    name: "Card",
    label: "Card",
    hint: "<Card>",
    kind: "flow",
    hasChildren: true,
    group: "Layout",
    defaults: { padding: "20", gap: "8" },
    props: [{ name: "direction", type: "string", options: ["row", "column"] }, ...BOX_PROPS],
  },
  {
    name: "Grid",
    label: "Grid",
    hint: "<Grid columns={2}>",
    kind: "flow",
    hasChildren: true,
    group: "Layout",
    defaults: { columns: "2", gap: "16" },
    props: [
      { name: "columns", type: "expression", hint: "a maximum — the grid collapses when narrow" },
      ...BOX_PROPS,
    ],
  },
  {
    name: "Row",
    label: "Row",
    hint: "side by side",
    kind: "flow",
    hasChildren: true,
    group: "Layout",
    defaults: { gap: "16", vertical: "center" },
    props: FLEX_PROPS,
  },
  {
    name: "Column",
    label: "Column",
    hint: "stacked",
    kind: "flow",
    hasChildren: true,
    group: "Layout",
    defaults: { gap: "8" },
    props: FLEX_PROPS,
  },
  {
    name: "Accordion",
    label: "Accordion",
    hint: "collapsible",
    kind: "flow",
    hasChildren: true,
    group: "Layout",
    defaults: { title: "" },
    props: [{ name: "title", type: "string" }],
  },
  {
    name: "AccordionGroup",
    label: "Accordion group",
    hint: "several at once",
    kind: "flow",
    // `items` wins; nested <Accordion> children are the fallback.
    hasChildren: false,
    group: "Layout",
    defaults: { items: '[{ title: "", content: "" }]' },
    props: [
      { name: "items", type: "expression", hint: "[{ title, content }] — or nest Accordions" },
    ],
  },

  /* ----------------------------------------------------------------- media */
  {
    name: "Image",
    label: "Image",
    hint: "<Image src alt> — ![alt](/path) does the same",
    kind: "flow",
    hasChildren: false,
    group: "Media",
    defaults: { src: "/images/", alt: "" },
    props: [
      { name: "src", type: "string", required: true, hint: "must exist in public/" },
      { name: "alt", type: "string", hint: "also the caption" },
      { name: "width", type: "expression", hint: "defaults to 1200" },
      { name: "height", type: "expression", hint: "defaults to 675" },
    ],
  },
  {
    name: "Media",
    label: "Figure",
    hint: "<Media src alt>",
    kind: "flow",
    hasChildren: false,
    group: "Media",
    defaults: { src: "/images/", alt: "" },
    props: [
      { name: "src", type: "string", required: true, hint: "must exist in public/" },
      { name: "alt", type: "string", hint: "also the caption" },
      { name: "aspectRatio", type: "string", hint: "e.g. 16 / 9" },
      { name: "width", type: "expression", hint: "defaults to 1200" },
      { name: "height", type: "expression", hint: "defaults to 675" },
    ],
  },

  /* ------------------------------------------------------------------ data */
  {
    name: "Table",
    label: "Table, from data",
    hint: "<Table data={…}> — a markdown table does the same",
    kind: "flow",
    // Markdown-table children also render, but that path goes through the `table`
    // override; as JSX it is prop-driven.
    hasChildren: false,
    group: "Data",
    defaults: { data: '{ headers: ["", ""], rows: [["", ""]] }' },
    props: [
      { name: "data", type: "expression", hint: "{ headers, rows }" },
      { name: "headers", type: "expression", hint: "instead of data" },
      { name: "rows", type: "expression", hint: "instead of data" },
    ],
  },
  {
    name: "Timeline",
    label: "Timeline",
    hint: "<Timeline items={…}>",
    kind: "flow",
    hasChildren: false,
    group: "Data",
    defaults: { items: '[{ year: "", title: "", desc: "" }]' },
    props: [
      {
        name: "items",
        type: "expression",
        required: true,
        hint: "[{ year, title, desc, icon? }]",
      },
    ],
  },

  /* ---------------------------------------------------------------- inline */
  {
    name: "Text",
    label: "Styled text",
    hint: "<Text variant>",
    kind: "text",
    hasChildren: true,
    group: "Inline",
    defaults: { variant: "body-strong-m" },
    props: [
      { name: "variant", type: "string", options: TEXT_VARIANTS },
      { name: "onBackground", type: "string", options: ON_BACKGROUND },
      ...BOX_PROPS,
    ],
  },
  {
    name: "Button",
    label: "Button",
    hint: "<Button href label>",
    kind: "text",
    hasChildren: false,
    group: "Inline",
    defaults: { href: "", label: "", variant: "primary" },
    props: [
      { name: "href", type: "string", hint: "omit for a plain button" },
      { name: "label", type: "string", hint: "children work too" },
      {
        name: "variant",
        type: "string",
        options: ["primary", "secondary"],
        hint: "only primary is filled",
      },
      { name: "prefixIcon", type: "string", options: ICON_NAMES },
      { name: "suffixIcon", type: "string", options: ICON_NAMES },
      ...BOX_PROPS,
    ],
  },
  {
    name: "Icon",
    label: "Icon",
    hint: "<Icon name>",
    kind: "text",
    hasChildren: false,
    group: "Inline",
    defaults: { name: "", size: "m" },
    props: [
      { name: "name", type: "string", options: ICON_NAMES, required: true },
      { name: "size", type: "string", options: ICON_SIZES },
    ],
  },
  {
    name: "SmartLink",
    label: "Link",
    hint: "<SmartLink href> — [text](url) does the same",
    kind: "text",
    hasChildren: true,
    group: "Inline",
    defaults: { href: "" },
    props: [
      { name: "href", type: "string", required: true, hint: "external links open in a new tab" },
    ],
  },
] as const satisfies readonly MdxBlockSpec[];

export type MdxBlockName = (typeof MDX_BLOCKS)[number]["name"];
