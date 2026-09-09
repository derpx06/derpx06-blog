/**
 * Carries a fenced block's meta string through to the rendered `<code>` element.
 *
 * ```python title="chunking.py"
 * ```
 *
 * `mdast-util-to-hast` turns the language into `class="language-python"` and
 * then drops `meta` on the floor, so without this the filename above never
 * reaches `ServerCodeBlock` and every code tab is labelled "Python".
 *
 * That label used to live in a JSX attribute — `<CodeBlock codes={[{ label:
 * 'chunking.py' }]} />` — which is why it survived at all. Attribute
 * expressions cannot be edited safely (a multi-line one is re-indented on
 * every save, which eats the indentation of the Python inside it), so the code
 * moved into real fences and the label had to come with it.
 */

type MdastNode = {
  type: string;
  lang?: string | null;
  meta?: string | null;
  data?: { hProperties?: Record<string, string> };
  children?: MdastNode[];
};

/** `title="x.py"`, `title='x.py'`, or a bare first word. */
export function labelFromMeta(meta: string | null | undefined): string | null {
  if (!meta) return null;
  const quoted = meta.match(/\btitle=(?:"([^"]*)"|'([^']*)')/);
  if (quoted) return quoted[1] ?? quoted[2] ?? null;
  const bare = meta.trim().split(/\s+/)[0];
  return bare || null;
}

/** The inverse — what the migration and the editor write into a fence. */
export function metaFromLabel(label: string | null | undefined): string {
  return label ? `title="${label.replace(/"/g, "&quot;")}"` : "";
}

export function remarkCodeMeta() {
  return (tree: MdastNode) => {
    const walk = (node: MdastNode) => {
      if (node.type === "code") {
        const label = labelFromMeta(node.meta);
        if (label) {
          node.data ??= {};
          node.data.hProperties = { ...node.data.hProperties, "data-label": label };
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
