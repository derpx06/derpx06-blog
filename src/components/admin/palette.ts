/**
 * The insert palette, derived from `src/lib/mdx-registry.ts`.
 *
 * Every non-deprecated block in the registry becomes a snippet automatically —
 * adding a component there makes it appear here. `EXTRAS` below carries only
 * the things the registry has no entry for: plain markdown and maths, plus the
 * `<CodeBlock>` forms that read from a file.
 *
 * Two rules from `scripts/check-content.mjs` are baked in:
 *  - `<Heading>` is `deprecated: true` in the registry and so never appears. It
 *    renders, but `extractHeadings()` regexes raw markdown, so a JSX heading
 *    never reaches the contents rail. Use `##`.
 *  - Code fences carry a language the shiki loader actually has; anything else
 *    silently degrades to plaintext.
 */

import {
  CODE_LANGUAGES,
  ICON_NAMES,
  MDX_BLOCKS,
  type MdxBlockSpec,
  type MdxPropSpec,
} from "@/lib/mdx-registry";

export { CODE_LANGUAGES, ICON_NAMES };

/** Widened once: the const assertion in the registry makes `spec.deprecated` a union error. */
const BLOCKS: readonly MdxBlockSpec[] = MDX_BLOCKS;

export type Snippet = {
  label: string;
  hint: string;
  /** `|` marks where the cursor lands after inserting. */
  body: string;
};

export type SnippetGroup = { group: string; items: Snippet[] };

function attribute(prop: MdxPropSpec, value: string, caret: boolean): string {
  if (prop.type === "boolean") return prop.name;
  if (prop.type === "expression") {
    // Inside an expression the useful spot is the first empty literal in it.
    const empty = caret ? value.match(/""|``/) : null;
    const text =
      empty?.index === undefined
        ? value
        : `${value.slice(0, empty.index + 1)}|${value.slice(empty.index + 1)}`;
    return `${prop.name}={${text}}`;
  }
  return `${prop.name}="${caret ? `${value}|` : value}"`;
}

/** `<Name prop="v">…</Name>`, built from the spec's defaults and required props. */
export function snippetFor(spec: MdxBlockSpec): Snippet {
  const defaults = spec.defaults ?? {};
  const byName = new Map(spec.props.map((prop) => [prop.name, prop]));
  const used = [
    ...Object.keys(defaults).flatMap((name) => byName.get(name) ?? []),
    ...spec.props.filter((prop) => prop.required && !(prop.name in defaults)),
  ];

  // With no children slot the caret goes inside the first attribute value —
  // that is the part a writer fills in first.
  const caretIndex = spec.hasChildren ? -1 : used.findIndex((prop) => prop.type !== "boolean");
  const attributes = used.map((prop, index) =>
    attribute(prop, defaults[prop.name] ?? "", index === caretIndex),
  );
  const open = `<${spec.name}${attributes.length ? ` ${attributes.join(" ")}` : ""}`;
  const caret = caretIndex === -1 && !spec.hasChildren ? "" : "|";

  if (!spec.hasChildren) {
    const trailing = spec.kind === "flow" ? "\n\n" : "";
    return { label: spec.label, hint: spec.hint, body: `${open} />${trailing}` };
  }
  if (spec.kind === "text")
    return { label: spec.label, hint: spec.hint, body: `${open}>${caret}</${spec.name}>` };
  return {
    label: spec.label,
    hint: spec.hint,
    body: `${open}>\n  ${caret}\n</${spec.name}>\n\n`,
  };
}

/** Snippets with no registry equivalent — markdown, maths, CodeBlock variants. */
const EXTRAS: Record<string, Snippet[]> = {
  Structure: [
    { label: "Section heading", hint: "## — reaches the contents rail", body: "## |\n\n" },
    { label: "Sub-heading", hint: "###", body: "### |\n\n" },
    { label: "Bullet list", hint: "markdown list", body: "- |\n- \n- \n\n" },
    { label: "Numbered list", hint: "markdown list", body: "1. |\n2. \n3. \n\n" },
    { label: "Quote", hint: "> blockquote", body: "> |\n\n" },
  ],
  Callouts: (["warning", "success", "danger"] as const).map((variant) => ({
    label: variant[0].toUpperCase() + variant.slice(1),
    hint: `<Feedback variant="${variant}">`,
    body: `<Feedback variant="${variant}" title="|">\n  \n</Feedback>\n\n`,
  })),
  Code: [
    { label: "Code fence", hint: "```python", body: "```python\n|\n```\n\n" },
    {
      label: "Code from a file",
      hint: "reads from the repo",
      body: '<CodeBlock codes={[{ file: "|", language: "python" }]} />\n\n',
    },
    {
      label: "Notebook cell",
      hint: "with its output",
      body: '<CodeBlock showOutput codes={[{ file: "|", cellIndex: 0, language: "python" }]} />\n\n',
    },
  ],
  Media: [
    { label: "Image, markdown", hint: "![alt](/path)", body: "![|](/images/)\n\n" },
    {
      label: "Diagram",
      hint: "generated SVG plate",
      body: '<Media src="/images/diagrams/|.svg" alt="" />\n\n',
    },
  ],
  Data: [{ label: "Table", hint: "markdown table", body: "| | |\n| --- | --- |\n| | |\n\n" }],
  Inline: [
    { label: "Link, markdown", hint: "[text](url)", body: "[|]()" },
    { label: "Bold", hint: "**text**", body: "**|**" },
    { label: "Italic", hint: "_text_", body: "_|_" },
  ],
  Maths: [
    { label: "Inline maths", hint: "$x^2$", body: "$|$" },
    { label: "Display maths", hint: "$$…$$", body: "$$\n|\n$$\n\n" },
  ],
};

const GROUP_ORDER = ["Structure", "Callouts", "Code", "Layout", "Media", "Data", "Inline", "Maths"];

export function buildPalette(): SnippetGroup[] {
  return GROUP_ORDER.map((group) => ({
    group,
    items: [
      ...BLOCKS.filter((spec) => spec.group === group && !spec.deprecated).map(snippetFor),
      ...(EXTRAS[group] ?? []),
    ],
  })).filter((entry) => entry.items.length > 0);
}

export const PALETTE: SnippetGroup[] = buildPalette();
