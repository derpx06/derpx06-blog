/**
 * Makes a multi-line JSX attribute expression survive an editor save.
 *
 * The corruption everyone blamed on the serialiser is actually in the parser.
 * `micromark-extension-mdxjs` strips `min(leading spaces, 2)` from every
 * continuation line of an attribute expression, unconditionally:
 *
 *     pad=0 → 0 stripped    pad=3 → 2 stripped
 *     pad=1 → 1 stripped    pad=8 → 2 stripped
 *
 * `mdast-util-mdx-jsx` then writes the value back verbatim — it says so itself
 * ("we can't indent attribute values"). So each save loses two spaces, and
 * indented code inside a `<CodeBlock codes={[{ code: `…` }]} />` decays until it
 * no longer runs.
 *
 * The fix is to put those two spaces back on the way out, so the next read's
 * strip is a no-op and the round trip is lossless. Empty lines are left alone:
 * padding them would only add trailing whitespace, and `""` already round-trips.
 *
 * Pure and free of `@mdxeditor/editor` on purpose — the editor registers this
 * through a realm plugin, and `scripts/mdx-roundtrip.test.ts` serialises with
 * the very same extensions, so the gate cannot drift from the editor.
 */

import { mdxToMarkdown } from "mdast-util-mdx";

type Attribute = { type?: string; value?: unknown };
type JsxNode = { attributes?: Attribute[] };
type Handler = (...args: unknown[]) => string;
type Extension = { handlers?: Record<string, Handler>; extensions?: Extension[] };

/** `min(leading, 2)` is what the parser takes, so two is what the writer owes. */
const INDENT = "  ";

function pad(value: string): string {
  return value
    .split("\n")
    .map((line, index) => (index === 0 || line === "" ? line : INDENT + line))
    .join("\n");
}

/** A copy of `node` whose multi-line attribute expressions carry the indent. */
function indentAttributes(node: JsxNode): JsxNode {
  return {
    ...node,
    attributes: (node.attributes ?? []).map((attribute) => {
      const value = attribute.value as { type?: string; value?: unknown } | null;
      if (attribute.type !== "mdxJsxAttribute" || !value || typeof value !== "object") {
        return attribute;
      }
      if (typeof value.value !== "string" || !value.value.includes("\n")) return attribute;
      return { ...attribute, value: { ...value, value: pad(value.value) } };
    }),
  };
}

function wrap(extension: Extension): Extension {
  const handlers = extension.handlers;
  if (!handlers?.mdxJsxFlowElement && !handlers?.mdxJsxTextElement) return extension;

  const indented =
    (handler: Handler): Handler =>
    (node, ...rest) =>
      handler(indentAttributes(node as JsxNode), ...rest);

  return {
    ...extension,
    handlers: {
      ...handlers,
      ...(handlers.mdxJsxFlowElement && {
        mdxJsxFlowElement: indented(handlers.mdxJsxFlowElement),
      }),
      ...(handlers.mdxJsxTextElement && {
        mdxJsxTextElement: indented(handlers.mdxJsxTextElement),
      }),
    },
  };
}

/**
 * The mdx to-markdown extensions with the indent restored. Registered *after*
 * `jsxPlugin()`'s own copy, because `mdast-util-to-markdown` lets the last
 * handler for a node type win.
 */
export function jsxIndentExtensions(): Extension {
  const mdx = mdxToMarkdown() as unknown as Extension;
  return { extensions: (mdx.extensions ?? []).map(wrap) };
}
