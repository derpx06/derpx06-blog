"use client";

import dynamic from "next/dynamic";

/**
 * The WYSIWYG body editor, kept off the server.
 *
 * MDXEditor is built on Lexical and touches `document` while its plugins
 * initialise, so it cannot be server-rendered — importing it from a server
 * component is a hydration error, not a warning. The dynamic import has to
 * live inside a client component for `ssr: false` to be allowed at all under
 * the App Router, which is the only reason this thin file exists.
 */
const Inner = dynamic(() => import("./MdxCanvasInner"), {
  ssr: false,
  loading: () => <div className="ds-mdx-canvas-loading">Loading the editor…</div>,
});

export type MdxCanvasProps = {
  value: string;
  onChange: (markdown: string) => void;
  /** Uploads a pasted or inserted image and returns its URL. */
  onUploadImage?: (file: File) => Promise<string>;
};

export function MdxCanvas(props: MdxCanvasProps) {
  return <Inner {...props} />;
}
