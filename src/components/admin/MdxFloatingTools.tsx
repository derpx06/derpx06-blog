"use client";

import {
  applyBlockType$,
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  CodeToggle,
  ConditionalContents,
  CreateLink,
  insertMarkdown$,
  ListsToggle,
  Separator,
} from "@mdxeditor/editor";
import { usePublisher } from "@mdxeditor/gurx";
import { useCallback, useEffect, useRef, useState } from "react";
import { PALETTE, type Snippet } from "./palette";

/**
 * The two things a writing surface actually needs: format what you selected,
 * insert what you haven't written yet.
 *
 * Rendered as the toolbar plugin's contents so it sits inside MDXEditor's realm
 * and can reuse the package's own controls — the toolbar container itself is
 * flattened to nothing in CSS, and everything here is positioned against the
 * caret instead. Nothing in this file knows how to bold text; it only decides
 * where the existing buttons appear.
 */

/** Headings the site allows. `h1` is deliberately absent: the article title is
 *  already the page's H1, and `scripts/check-content.mjs` blocks a body with a
 *  second one, so offering it would only produce an unpublishable draft. */
const BLOCK_TYPES = [
  { type: "paragraph", label: "Text" },
  { type: "h2", label: "H2" },
  { type: "h3", label: "H3" },
  { type: "quote", label: "Quote" },
] as const;

type Point = { top: number; left: number };

/**
 * The contenteditable this toolbar belongs to, resolved on every read rather
 * than cached: a lookup that missed once would otherwise leave both tools dead
 * for the life of the editor, with nothing to show for it.
 */
function editorRoot(anchor: React.RefObject<HTMLDivElement | null>): HTMLElement | null {
  return (
    anchor.current?.closest(".ds-mdx-canvas")?.querySelector<HTMLElement>("[contenteditable]") ??
    null
  );
}

/**
 * Runs `read` on every selection change, and on scroll — a caret-anchored
 * element is positioned in viewport coordinates, so it has to follow the page.
 */
function useSelectionEffect(read: () => void) {
  const latest = useRef(read);
  latest.current = read;
  useEffect(() => {
    const run = () => latest.current();
    document.addEventListener("selectionchange", run);
    window.addEventListener("scroll", run, true);
    window.addEventListener("resize", run);
    run();
    return () => {
      document.removeEventListener("selectionchange", run);
      window.removeEventListener("scroll", run, true);
      window.removeEventListener("resize", run);
    };
  }, []);
}

/** The live selection, but only when it is text in the canvas and not in code. */
function selectionInside(anchor: React.RefObject<HTMLDivElement | null>): Selection | null {
  const root = editorRoot(anchor);
  const selection = window.getSelection();
  if (!root || !selection || selection.rangeCount === 0) return null;
  const node = selection.anchorNode;
  if (!node || !root.contains(node)) return null;
  // CodeMirror runs its own editor inside a decorator node; its selection is
  // not markdown, and the bubble's buttons would throw at it.
  const element = node instanceof Element ? node : node.parentElement;
  if (element?.closest(".cm-editor")) return null;
  return selection;
}

export function MdxFloatingTools() {
  const anchor = useRef<HTMLDivElement>(null);

  return (
    <div ref={anchor} className="ds-mdx-tools">
      <SelectionBubble anchor={anchor} />
      <InsertMenu anchor={anchor} />
    </div>
  );
}

type Anchored = { anchor: React.RefObject<HTMLDivElement | null> };

/* ------------------------------------------------------------------ bubble */

function SelectionBubble({ anchor }: Anchored) {
  const [at, setAt] = useState<Point | null>(null);
  const applyBlockType = usePublisher(applyBlockType$);

  useSelectionEffect(() => {
    const selection = selectionInside(anchor);
    if (!selection || selection.isCollapsed) return setAt(null);
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (!rect.width && !rect.height) return setAt(null);
    setAt({ top: rect.top, left: rect.left + rect.width / 2 });
  });

  if (!at) return null;

  return (
    <div
      className="ds-mdx-bubble"
      role="toolbar"
      aria-label="Format selection"
      style={{ top: at.top, left: at.left }}
      // The bubble must not steal the selection it is acting on.
      onMouseDown={(event) => event.preventDefault()}
    >
      <ConditionalContents
        options={[
          {
            when: (editor) => editor?.editorType === "codeblock",
            contents: () => <ChangeCodeMirrorLanguage />,
          },
          {
            fallback: () => (
              <>
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <Separator />
                {BLOCK_TYPES.map((block) => (
                  <button
                    type="button"
                    key={block.type}
                    className="ds-mdx-bubble-block"
                    onClick={() => applyBlockType(block.type)}
                  >
                    {block.label}
                  </button>
                ))}
                <Separator />
                <ListsToggle />
                <CreateLink />
              </>
            ),
          },
        ]}
      />
    </div>
  );
}

/* ------------------------------------------------------------ insert menu */

function InsertMenu({ anchor }: Anchored) {
  const [at, setAt] = useState<Point | null>(null);
  const [open, setOpen] = useState(false);
  const insertMarkdown = usePublisher(insertMarkdown$);

  useSelectionEffect(() => {
    const root = editorRoot(anchor);
    const selection = selectionInside(anchor);
    // Mid-selection the bubble has the floor; two controls over one line of
    // text is one too many.
    if (selection && !selection.isCollapsed) return setAt(null);

    // The top-level block the caret sits in — the line the button belongs
    // beside, not whatever inline span the caret happens to be in. With no
    // caret yet the first block stands in, so opening an article always shows
    // one way in rather than a page with no controls at all.
    let block: Element | null = null;
    if (selection) {
      const node = selection.anchorNode;
      block = node instanceof Element ? node : (node?.parentElement ?? null);
      while (block && block.parentElement !== root) block = block.parentElement;
    }
    block ??= root?.firstElementChild ?? null;
    if (!block) return setAt(null);
    const rect = block.getBoundingClientRect();
    setAt({ top: rect.top, left: rect.left });
  });

  const choose = useCallback(
    (snippet: Snippet) => {
      setOpen(false);
      // `|` marked the caret for the old textarea; MDXEditor places it itself.
      insertMarkdown(snippet.body.replace("|", ""));
    },
    [insertMarkdown],
  );

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".ds-mdx-insert")) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!at) return null;

  // Near the foot of the window the menu would open off-screen, so it opens
  // upwards instead — the caret can be on the last line of a long article.
  const dropUp = at.top > window.innerHeight / 2;

  return (
    <div className="ds-mdx-insert" style={{ top: at.top, left: at.left }}>
      <button
        type="button"
        className="ds-mdx-insert-button"
        aria-label="Insert a block"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        +
      </button>
      {open && (
        <div className={`ds-mdx-insert-menu${dropUp ? " ds-mdx-insert-up" : ""}`}>
          {PALETTE.map((group) => (
            <div className="ds-palette-group" key={group.group}>
              <span>{group.group}</span>
              {group.items.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className="ds-palette-item"
                  onClick={() => choose(item)}
                >
                  {item.label}
                  <small>{item.hint}</small>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
