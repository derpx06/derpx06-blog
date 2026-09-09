"use client";

/**
 * KaTeX support for MDXEditor.
 *
 * MDXEditor ships no maths. Without this, `micromark-extension-mdxjs` hands the
 * braces inside `\frac{a}{b}` to acorn and the whole document fails to parse, so
 * the 14 maths articles cannot be opened in the WYSIWYG canvas at all.
 *
 * The round trip is deliberately dumb: the Lexical node stores the mdast node it
 * was imported from and hands the same object straight back on export, so an
 * untouched equation is re-serialised by `mdast-util-math` from a value that was
 * never transformed. `scripts/math-roundtrip.test.ts` guards that at the mdast
 * layer against the real corpus.
 *
 * Plug it in alongside the other plugins:
 *
 *     <MDXEditor plugins={[jsxPlugin(...), ..., mathPlugin()]} />
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
  addMdastExtension$,
  addSyntaxExtension$,
  addToMarkdownExtension$,
  insertDecoratorNode$,
  type LexicalExportVisitor,
  type MdastImportVisitor,
  realmPlugin,
} from "@mdxeditor/editor";
import { map, Signal } from "@mdxeditor/gurx";
import katex from "katex";
import { DecoratorNode, type LexicalNode, type NodeKey, type SerializedLexicalNode } from "lexical";
import {
  type InlineMath,
  type Math as MathFlow,
  mathFromMarkdown,
  mathToMarkdown,
} from "mdast-util-math";
import { math } from "micromark-extension-math";
import { useCallback, useEffect, useRef, useState } from "react";

type MathMdastNode = MathFlow | InlineMath;

/** Cheap structural clone — these nodes are `{type, value, meta?}` and nothing else. */
const cloneMdast = (node: MathMdastNode): MathMdastNode => ({ ...node });

// ---------------------------------------------------------------------------
// Lexical node
// ---------------------------------------------------------------------------

export class LexicalMathNode extends DecoratorNode<React.JSX.Element> {
  __mdastNode: MathMdastNode;

  constructor(mdastNode: MathMdastNode, key?: NodeKey) {
    super(key);
    this.__mdastNode = mdastNode;
  }

  static getType(): string {
    return "math";
  }

  static clone(node: LexicalMathNode): LexicalMathNode {
    return new LexicalMathNode(cloneMdast(node.__mdastNode), node.__key);
  }

  static importJSON(serialized: SerializedLexicalNode & Record<string, unknown>): LexicalMathNode {
    return new LexicalMathNode(cloneMdast(serialized.mdastNode as MathMdastNode));
  }

  exportJSON() {
    return { mdastNode: cloneMdast(this.__mdastNode), type: "math", version: 1 };
  }

  getMdastNode(): MathMdastNode {
    return this.__mdastNode;
  }

  setValue(value: string): void {
    const writable = this.getWritable();
    writable.__mdastNode = { ...writable.__mdastNode, value };
  }

  createDOM(): HTMLElement {
    return document.createElement(this.isInline() ? "span" : "div");
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return this.__mdastNode.type === "inlineMath";
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  decorate(): React.JSX.Element {
    return <MathEditor node={this} />;
  }
}

export function $createLexicalMathNode(mdastNode: MathMdastNode): LexicalMathNode {
  return new LexicalMathNode(mdastNode);
}

export function $isLexicalMathNode(node: LexicalNode | null | undefined): node is LexicalMathNode {
  return node instanceof LexicalMathNode;
}

// ---------------------------------------------------------------------------
// The in-editor UI
// ---------------------------------------------------------------------------

function renderKatex(value: string, displayMode: boolean): string {
  try {
    return katex.renderToString(value, { displayMode, throwOnError: false, output: "html" });
  } catch (error) {
    return `<span class="mdx-math-error">${error instanceof Error ? error.message : "invalid LaTeX"}</span>`;
  }
}

function MathEditor({ node }: { node: LexicalMathNode }) {
  const [editor] = useLexicalComposerContext();
  const mdastNode = node.getMdastNode();
  const displayMode = mdastNode.type === "math";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(mdastNode.value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    if (draft === node.getMdastNode().value) return;
    editor.update(() => {
      node.setValue(draft);
    });
  }, [draft, editor, node]);

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        className="mdx-math-input"
        value={draft}
        spellCheck={false}
        rows={displayMode ? Math.max(2, draft.split("\n").length) : 1}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setDraft(node.getMdastNode().value);
            setEditing(false);
          }
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey || !displayMode)) {
            event.preventDefault();
            commit();
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className="mdx-math"
      title="Click to edit the LaTeX"
      style={{
        display: displayMode ? "block" : "inline",
        width: displayMode ? "100%" : undefined,
        background: "none",
        border: "none",
        padding: 0,
        font: "inherit",
        color: "inherit",
        cursor: "pointer",
      }}
      onClick={() => {
        setDraft(node.getMdastNode().value);
        setEditing(true);
      }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: katex.renderToString output; KaTeX escapes its input and `trust` is off by default.
      dangerouslySetInnerHTML={{ __html: renderKatex(mdastNode.value, displayMode) }}
    />
  );
}

// ---------------------------------------------------------------------------
// Visitors
// ---------------------------------------------------------------------------

const MdastMathVisitor: MdastImportVisitor<MathMdastNode> = {
  testNode: (node) => node.type === "math" || node.type === "inlineMath",
  visitNode({ lexicalParent, mdastNode }) {
    (lexicalParent as LexicalNode & { append(node: LexicalNode): void }).append(
      $createLexicalMathNode(cloneMdast(mdastNode)),
    );
  },
};

const LexicalMathVisitor: LexicalExportVisitor<LexicalMathNode, MathMdastNode> = {
  testLexicalNode: $isLexicalMathNode,
  visitLexicalNode({ actions, mdastParent, lexicalNode }) {
    actions.appendToParent(mdastParent, cloneMdast(lexicalNode.getMdastNode()));
  },
};

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

/** Insert a new equation at the cursor. `kind` defaults to block maths. */
export const insertMath$ = Signal<{ kind?: "inline" | "block"; value?: string }>((r) => {
  r.link(
    r.pipe(
      insertMath$,
      map(({ kind, value }): (() => DecoratorNode<unknown>) => {
        const node: MathMdastNode =
          kind === "inline"
            ? { type: "inlineMath", value: value ?? "" }
            : { type: "math", value: value ?? "", meta: null };
        return () => $createLexicalMathNode(node) as unknown as DecoratorNode<unknown>;
      }),
    ),
    insertDecoratorNode$,
  );
});

/**
 * `$…$` / `$$…$$` maths for MDXEditor, rendered with KaTeX.
 *
 * `singleDollarTextMath` defaults to true on both halves, matching `remark-math`
 * on the read side (`src/components/mdx.tsx`). Keep them in step.
 */
export const mathPlugin = realmPlugin<{ singleDollarTextMath?: boolean }>({
  init(realm, params) {
    const singleDollarTextMath = params?.singleDollarTextMath ?? true;
    realm.pubIn({
      [addSyntaxExtension$]: math({ singleDollarTextMath }),
      [addMdastExtension$]: mathFromMarkdown(),
      [addImportVisitor$]: MdastMathVisitor,
      [addLexicalNode$]: LexicalMathNode,
      [addExportVisitor$]: LexicalMathVisitor,
      [addToMarkdownExtension$]: mathToMarkdown({ singleDollarTextMath }),
    });
  },
});
