"use client";

import { addToMarkdownExtension$, realmPlugin } from "@mdxeditor/editor";
import { jsxIndentExtensions } from "@/lib/mdx-jsx-indent";

/**
 * Restores the two spaces the MDX parser strips from every continuation line of
 * a multi-line JSX attribute expression. See `src/lib/mdx-jsx-indent.ts` for the
 * measurement; without this, indented code inside `<CodeBlock codes={…} />`
 * decays by two spaces per save until it no longer runs.
 *
 * Register it *after* `jsxPlugin()`. `mdast-util-to-markdown` lets the last
 * handler registered for a node type win, and that ordering is the whole
 * mechanism — moving this line above `jsxPlugin()` silently disables it.
 */
export const jsxIndentPlugin = realmPlugin({
  init: (realm) => {
    realm.pubIn({ [addToMarkdownExtension$]: jsxIndentExtensions() });
  },
});
