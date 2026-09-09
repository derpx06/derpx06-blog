"use client";

import { type JsxEditorProps, NestedLexicalEditor, useMdastNodeUpdater } from "@mdxeditor/editor";
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import { useId, useMemo } from "react";
import { MDX_BLOCKS, type MdxBlockSpec, type MdxPropSpec } from "@/lib/mdx-registry";

/**
 * How a custom component looks and behaves inside the canvas.
 *
 * MDXEditor's `GenericJsxEditor` hides every prop behind a gear popover and,
 * for a component with no children, renders nothing but its name — so a
 * `<Media>` shows as an empty grey box you cannot judge. This shows the block
 * for what it is: its name, its properties as real fields (a `<select>`
 * wherever the registry pins the choices), a picture where there is a picture,
 * and a nested editor for whatever children it takes.
 *
 * It is driven entirely by `MDX_BLOCKS`, so a component added to the registry
 * arrives here already knowing its own prop list and enums.
 */

const isAttribute = (value: unknown): value is MdxJsxAttribute =>
  typeof value === "object" &&
  value !== null &&
  (value as { type?: string }).type === "mdxJsxAttribute";

/** Attribute values are either a plain string or a wrapped expression. */
function readAttribute(node: JsxEditorProps["mdastNode"], name: string): string {
  const attribute = node.attributes.find((item) => isAttribute(item) && item.name === name);
  if (!attribute || !isAttribute(attribute)) return "";
  const { value } = attribute;
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "value" in value) return String(value.value);
  return "";
}

/** Components whose whole point is an image — worth showing rather than naming. */
const IMAGE_BLOCKS = new Set(["Image", "Media"]);

/**
 * Spacing and alignment props are shared by almost every block, so showing them
 * inline buries the two or three props that actually say what the block is.
 * They go behind a disclosure instead.
 */
const LAYOUT_PROPS = new Set([
  "gap",
  "padding",
  "paddingX",
  "paddingY",
  "marginTop",
  "marginBottom",
  "vertical",
  "horizontal",
  "className",
  "style",
]);

export function MdxBlockEditor({ mdastNode, descriptor }: JsxEditorProps) {
  const updateMdastNode = useMdastNodeUpdater();
  const fieldId = useId();
  const spec = useMemo(
    () => (MDX_BLOCKS as readonly MdxBlockSpec[]).find((block) => block.name === mdastNode.name),
    [mdastNode.name],
  );

  const props: readonly MdxPropSpec[] = spec?.props ?? [];
  const label = spec?.label ?? mdastNode.name ?? "Component";

  const setProp = (prop: MdxPropSpec, next: string) => {
    const others = mdastNode.attributes.filter(
      (item) => !(isAttribute(item) && item.name === prop.name),
    );
    const attributes = next
      ? [
          ...others,
          {
            type: "mdxJsxAttribute" as const,
            name: prop.name,
            value:
              prop.type === "expression"
                ? { type: "mdxJsxAttributeValueExpression" as const, value: next }
                : next,
          },
        ]
      : others;
    updateMdastNode({ attributes });
  };

  const src = readAttribute(mdastNode, "src");
  const showImage = IMAGE_BLOCKS.has(mdastNode.name ?? "") && src;

  const primary = props.filter((prop) => !LAYOUT_PROPS.has(prop.name));
  const layout = props.filter((prop) => LAYOUT_PROPS.has(prop.name));

  // Long-form props get a full row; the rest sit side by side.
  const inline = primary.filter((prop) => prop.options || prop.name.length <= 6);
  const wide = primary.filter((prop) => !inline.includes(prop));

  const field = (prop: MdxPropSpec, full: boolean) => (
    <label
      key={prop.name}
      htmlFor={`${fieldId}-${prop.name}`}
      className={full ? "ds-mdxblock-wide" : undefined}
    >
      <span>{prop.name}</span>
      {prop.options ? (
        <select
          id={`${fieldId}-${prop.name}`}
          value={readAttribute(mdastNode, prop.name)}
          onChange={(event) => setProp(prop, event.target.value)}
        >
          <option value="">—</option>
          {prop.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={`${fieldId}-${prop.name}`}
          type="text"
          value={readAttribute(mdastNode, prop.name)}
          placeholder={prop.hint ?? ""}
          onChange={(event) => setProp(prop, event.target.value)}
        />
      )}
    </label>
  );

  return (
    <div className={descriptor.kind === "text" ? "ds-mdxblock ds-mdxblock-inline" : "ds-mdxblock"}>
      <div className="ds-mdxblock-head">
        <span className="ds-mdxblock-name">{label}</span>
        {spec?.hint && <span className="ds-mdxblock-hint">{spec.hint}</span>}
      </div>

      {primary.length > 0 && (
        <div className="ds-mdxblock-props">
          {[...inline, ...wide].map((prop) => field(prop, wide.includes(prop)))}
        </div>
      )}

      {layout.length > 0 && (
        <details className="ds-mdxblock-layout">
          <summary>Spacing</summary>
          <div className="ds-mdxblock-props">{layout.map((prop) => field(prop, false))}</div>
        </details>
      )}

      {showImage && (
        // Deliberately a plain <img>: this is the editor, and next/image would
        // demand the file be resolvable at build time, which a draft's is not.
        // biome-ignore lint/performance/noImgElement: editor-only preview
        <img className="ds-mdxblock-media" src={src} alt="" />
      )}

      {descriptor.hasChildren && (
        <div className="ds-mdxblock-children">
          <NestedLexicalEditor<MdxJsxFlowElement | MdxJsxTextElement>
            block={mdastNode.type === "mdxJsxFlowElement"}
            getContent={(node) => node.children}
            getUpdatedMdastNode={(node, children) =>
              ({ ...node, children }) as MdxJsxFlowElement | MdxJsxTextElement
            }
          />
        </div>
      )}
    </div>
  );
}
