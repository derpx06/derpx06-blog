"use client";

import "@mdxeditor/editor/style.css";

import {
  codeBlockPlugin,
  codeMirrorPlugin,
  GenericJsxEditor,
  headingsPlugin,
  imagePlugin,
  type JsxComponentDescriptor,
  jsxPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  MDXEditor,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import { useMemo, useRef } from "react";
import { CODE_LANGUAGES, MDX_BLOCKS, type MdxBlockSpec } from "@/lib/mdx-registry";
import { MdxBlockEditor } from "./MdxBlockEditor";
import type { MdxCanvasProps } from "./MdxCanvas";
import { MdxFloatingTools } from "./MdxFloatingTools";
import { jsxIndentPlugin } from "./mdx-jsx-indent-plugin";
import { mathPlugin } from "./mdx-math-plugin";

/**
 * `MDX_BLOCKS` is `as const`, so optional fields exist only on the entries that
 * set them. Widening once here keeps every read below honest.
 */
const BLOCKS: readonly MdxBlockSpec[] = MDX_BLOCKS;

/**
 * `MdxBlockSpec` speaks in the site's terms; MDXEditor wants its own shape.
 * Everything here is derived, so adding a component to the registry is the
 * only edit needed to make it appear in the editor.
 */
function toDescriptor(spec: MdxBlockSpec): JsxComponentDescriptor {
  return {
    name: spec.name,
    kind: spec.kind,
    hasChildren: spec.hasChildren,
    // The registry's "boolean" is a bare JSX prop; MDXEditor has no such type,
    // and treating it as a string is the closest honest mapping.
    props: spec.props.map((prop) => ({
      name: prop.name,
      type: prop.type === "expression" ? ("expression" as const) : ("string" as const),
      required: prop.required,
    })),
    Editor: MdxBlockEditor,
  };
}

/**
 * Anything the registry does not know about — a component added to a body by
 * hand, or one removed from the registry since. Without this catch-all the
 * import visitor refuses the node and the export throws "Component X is used
 * but not imported"; with it, the raw mdast node is carried through untouched.
 * Never remove it: it is what stops an unrecognised block being dropped.
 */
const WILDCARD: JsxComponentDescriptor = {
  name: "*",
  kind: "flow",
  hasChildren: true,
  props: [],
  Editor: GenericJsxEditor,
};

/** Shiki's language list, in the shape codeMirrorPlugin wants. */
const CODE_BLOCK_LANGUAGES = Object.fromEntries(
  CODE_LANGUAGES.map((language) => [language, language]),
);

export default function MdxCanvasInner({ value, onChange, onUploadImage }: MdxCanvasProps) {
  const descriptors = useMemo(() => [...BLOCKS.map(toDescriptor), WILDCARD], []);

  // MDXEditor is uncontrolled: it takes the body once and reports edits back.
  // Feeding it `value` on every keystroke would reset its document — and the
  // caret — from inside its own onChange.
  const initialMarkdown = useRef(value).current;

  // The plugin list must be stable — rebuilding it every render re-runs each
  // plugin's `update`, which churns the document on every keystroke.
  const plugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      tablePlugin(),
      imagePlugin({
        imageUploadHandler: onUploadImage ? (file: File) => onUploadImage(file) : undefined,
      }),
      codeBlockPlugin({ defaultCodeBlockLanguage: "python" }),
      codeMirrorPlugin({ codeBlockLanguages: { ...CODE_BLOCK_LANGUAGES, "": "Plain" } }),
      mathPlugin(),
      jsxPlugin({ jsxComponentDescriptors: descriptors }),
      // After jsxPlugin, never before: the last to-markdown handler registered
      // for a node type wins, and that ordering is the entire mechanism.
      jsxIndentPlugin(),
      markdownShortcutPlugin(),
      toolbarPlugin({ toolbarContents: () => <MdxFloatingTools /> }),
    ],
    [descriptors, onUploadImage],
  );

  return (
    <div className="ds-mdx-canvas">
      <MDXEditor
        // Both tools follow the caret, so without one there is nothing on
        // screen to write with when an article first opens.
        autoFocus
        markdown={initialMarkdown}
        onChange={onChange}
        plugins={plugins}
        // The writing surface is the reading surface: the exact classes
        // ArticleView.tsx puts around a published body.
        contentEditableClassName="ds-mdx-canvas-body ds-prose ds-prose-dropcap"
        // Pinned so the editor and scripts/mdx-roundtrip.test.ts normalise
        // identically — the gate proves what this actually writes.
        toMarkdownOptions={{
          listItemIndent: "one",
          bullet: "-",
          emphasis: "_",
          strong: "*",
          fence: "`",
          rule: "-",
        }}
      />
    </div>
  );
}
