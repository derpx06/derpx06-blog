import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import React, { ReactNode } from "react";
import { HeadingLink } from "@/components/HeadingLink";
import { SafeCodeBlock } from "@/components/SafeCodeBlock";
import { JupyterCodeBlock } from "@/components/JupyterCodeBlock";
import { Timeline } from "@/components/Timeline";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

import Image from "next/image";
import Link from "next/link";
import { slugifyHeading } from "@/lib/slug";
import {
  Accordion,
  AccordionGroup,
  Button,
  Card,
  Column,
  Feedback,
  Grid,
  Heading,
  Icon,
  InlineCode,
  Line,
  Media,
  Row,
  Text,
} from "@/components/site/mdx-kit";

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

type TableData = {
  headers: Array<{ content: ReactNode; key: string }>;
  rows: ReactNode[][];
};

function CustomLink({ href, children, ...props }: CustomLinkProps) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

export function createImage({
  alt,
  src,
  ...props
}: { alt?: string; src: string } & Record<string, unknown>) {
  if (!src) {
    console.error("Media requires a valid 'src' property.");
    return null;
  }

  return (
    <figure className="ds-figure">
      <Image
        src={src}
        alt={alt || ""}
        width={Number(props.width) || 1200}
        height={Number(props.height) || 675}
        sizes="(max-width: 960px) 100vw, 960px"
        style={{ width: "100%", height: "auto" }}
      />
      {alt ? <figcaption>{alt}</figcaption> : null}
    </figure>
  );
}

function extractText(node: any): string {
  if (typeof node === "string") return node;
  if (typeof node === "number" || typeof node === "boolean") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) return extractText((node as React.ReactElement<any>).props?.children);
  if (node && typeof node === "object") {
    if (typeof node.value === "string") return node.value;
    if (typeof node.raw === "string") return node.raw;
    if (typeof node.code === "string") return node.code;
    if (node.children) return extractText(node.children);
  }
  if (node?.props?.children) return extractText(node.props.children);
  return "";
}

function isNumericKey(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

function asArrayLikeObject(input: any): any[] | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const keys = Object.keys(input);
  if (keys.length === 0) return null;
  if (!keys.every(isNumericKey)) return null;

  return keys
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => input[key]);
}

function slugify(input: any): string {
  return slugifyHeading(extractText(input));
}

function createHeading(as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  const CustomHeading = ({
    children,
    ...props
  }: { children?: ReactNode }) => {
    const slug = slugify(children as string);
    const level = parseInt(as.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
    return (
      <HeadingLink level={level} id={slug}>
        {children}
      </HeadingLink>
    );
  };

  CustomHeading.displayName = `${as}`;

  return CustomHeading;
}

function createParagraph({ children }: { children?: ReactNode }) {
  return <p>{children}</p>;
}

function createInlineCode({ children }: { children?: ReactNode }) {
  return <InlineCode>{children}</InlineCode>;
}

import fs from "fs";
import path from "path";

function normalizeCodeItem(codeItem: any) {
  const codeCandidate = codeItem?.code ?? codeItem?.value ?? codeItem?.raw ?? codeItem?.children;
  const normalizedCode = codeCandidate !== undefined ? extractText(codeCandidate) : "";
  const language = typeof codeItem?.language === "string" && codeItem.language.trim().length > 0
    ? codeItem.language
    : "text";
  const fallbackLabel = language ? language.charAt(0).toUpperCase() + language.slice(1) : "Code";
  const label = typeof codeItem?.label === "string" && codeItem.label.trim().length > 0
    ? codeItem.label
    : fallbackLabel;

  return {
    ...codeItem,
    code: normalizedCode,
    language,
    label,
  };
}

function normalizeCodesInput(input: any) {
  if (Array.isArray(input)) {
    return input.map((item) => normalizeCodeItem(item));
  }

  const arrayLike = asArrayLikeObject(input);
  if (arrayLike) {
    return arrayLike.map((item) => normalizeCodeItem(item));
  }

  if (input && typeof input === "object") {
    if (Array.isArray(input.codes)) {
      return input.codes.map((item: any) => normalizeCodeItem(item));
    }
    return [normalizeCodeItem(input)];
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return undefined;

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeCodesInput(parsed);
      } catch {
        // Keep as plain code when parsing fails.
      }
    }

    return [normalizeCodeItem({ code: trimmed, language: "text", label: "Code" })];
  }

  return undefined;
}

function toSafeNotebookCode(input: any): string {
  if (Array.isArray(input)) return input.map((item) => extractText(item)).join("");
  return extractText(input);
}

function ServerCodeBlock(props: any) {
  const { codes, showOutput, ...rest } = props;
  let processedCodes = normalizeCodesInput(codes);

  if (showOutput && Array.isArray(processedCodes)) {
    const jupyterCells = processedCodes.map((codeItem: any) => {
      if (codeItem.file && codeItem.file.endsWith(".ipynb")) {
        try {
          const filePath = path.join(process.cwd(), codeItem.file);
          const fileContent = fs.readFileSync(filePath, "utf-8");
          const notebook = JSON.parse(fileContent);
          const cells = notebook.cells;

          const cellIndex = codeItem.cellIndex !== undefined ? codeItem.cellIndex : 0;
          const cell = cells[cellIndex];

          if (!cell) {
            return {
              code: `Error: Cell ${cellIndex} not found`,
              label: codeItem.label || "Code",
              language: "text",
              showOutput: false,
            };
          }

          const code = toSafeNotebookCode(cell.source);

          let output = "";
          if (cell.outputs && cell.outputs.length > 0) {
            cell.outputs.forEach((outputItem: any) => {
              if (outputItem.text) {
                output += toSafeNotebookCode(outputItem.text);
              } else if (outputItem.data && outputItem.data["text/plain"]) {
                output += toSafeNotebookCode(outputItem.data["text/plain"]);
              }
            });
          }

          return {
            code,
            output: output || undefined,
            label: codeItem.label || "Code",
            language: codeItem.language || "python",
            showOutput: codeItem.showOutput === true,
          };
        } catch (error) {
          console.error(`Error reading notebook file: ${codeItem.file}`, error);
          return {
            code: `Error: Could not read file ${codeItem.file}`,
            label: codeItem.label || "Code",
            language: "text",
            showOutput: false,
          };
        }
      }

      return {
        code: extractText(codeItem.code),
        output: codeItem.output,
        label: codeItem.label || "Code",
        language: codeItem.language || "text",
        showOutput: codeItem.showOutput === true,
      };
    });

    return <JupyterCodeBlock cells={jupyterCells} />;
  }

  if (Array.isArray(processedCodes)) {
    processedCodes = processedCodes.map((codeItem: any) => {
      if (codeItem.file) {
        try {
          const filePath = path.join(process.cwd(), codeItem.file);
          const fileContent = fs.readFileSync(filePath, "utf-8");

          if (codeItem.file.endsWith(".ipynb")) {
            const notebook = JSON.parse(fileContent);
            const cells = notebook.cells;
            let content = "";

            if (codeItem.displayOutput) {
              const cellIndex = codeItem.cellIndices ? codeItem.cellIndices[codeItem.cellIndices.length - 1] : 0;
              const cell = cells[cellIndex];
              if (cell && cell.outputs) {
                cell.outputs.forEach((output: any) => {
                  if (output.text) {
                    content += toSafeNotebookCode(output.text);
                  } else if (output.data && output.data["text/plain"]) {
                    content += toSafeNotebookCode(output.data["text/plain"]);
                  }
                });
              }
            } else {
              let indices = codeItem.cellIndices || [];
              if (codeItem.cellIndex !== undefined && indices.length === 0) {
                indices = [codeItem.cellIndex];
              }

              content = indices
                .map((index: number) => {
                  const cell = cells[index];
                  if (!cell || !cell.source) return "";
                  return toSafeNotebookCode(cell.source);
                })
                .join("\n\n");
            }

            return normalizeCodeItem({
              ...codeItem,
              code: content,
            });
          }

          return normalizeCodeItem({
            ...codeItem,
            code: fileContent,
          });
        } catch (error) {
          console.error(`Error reading file: ${codeItem.file}`, error);
          return normalizeCodeItem({
            ...codeItem,
            code: `Error: Could not read file ${codeItem.file}`,
          });
        }
      }

      return normalizeCodeItem(codeItem);
    });
  }

  if (!processedCodes && rest.children) {
    let language = "text";
    let codeString = "";

    if (React.isValidElement(rest.children)) {
      codeString = extractText(rest.children);
      const childProps = (rest.children as React.ReactElement).props as any;
      if (childProps && childProps.className) {
        language = childProps.className.replace("language-", "");
      }
    } else {
      codeString = extractText(rest.children);
    }

    if (rest.className && rest.className.includes("language-")) {
      language = rest.className.replace("language-", "");
    }

    processedCodes = [
      normalizeCodeItem({
        code: codeString,
        language,
      }),
    ];
  }

  return <SafeCodeBlock codes={processedCodes} {...rest} />;
}

function createUnorderedList({ children }: { children?: ReactNode }) {
  return <ul>{children}</ul>;
}

function createOrderedList({ children }: { children?: ReactNode }) {
  return <ol>{children}</ol>;
}

function createListItem({ children }: { children?: ReactNode }) {
  return <li>{children}</li>;
}

function createHR() {
  return <hr />;
}

function MarkdownTable({ children }: { children?: ReactNode }) {
  return (
    <div className="ds-table-scroll">
      <table>{children}</table>
    </div>
  );
}

/** Accepts either markdown table children or a {headers, rows} data object. */
function ResponsiveTable(props: any) {
  const { data, headers, rows, children } = props;
  const resolvedHeaders = data?.headers ?? headers;
  const resolvedRows = data?.rows ?? rows;

  if (Array.isArray(resolvedHeaders) && Array.isArray(resolvedRows)) {
    return (
      <div className="ds-table-scroll">
        <table>
          <thead>
            <tr>
              {resolvedHeaders.map((header: any, index: number) => (
                <th key={header?.key ?? index}>{header?.content ?? header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resolvedRows.map((row: ReactNode[], rowIndex: number) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (children) return <MarkdownTable>{children}</MarkdownTable>;

  console.warn("Table render skipped: expected headers+rows or markdown table children.");
  return null;
}

const components = {
  p: createParagraph as any,
  h1: createHeading("h1") as any,
  h2: createHeading("h2") as any,
  h3: createHeading("h3") as any,
  h4: createHeading("h4") as any,
  h5: createHeading("h5") as any,
  h6: createHeading("h6") as any,
  img: createImage as any,
  Image: createImage as any,
  a: CustomLink as any,
  code: createInlineCode as any,
  pre: ServerCodeBlock as any,
  ol: createOrderedList as any,
  ul: createUnorderedList as any,
  li: createListItem as any,
  hr: createHR as any,
  table: MarkdownTable as any,
  Heading,
  Text,
  CodeBlock: ServerCodeBlock,
  InlineCode,
  Accordion,
  AccordionGroup,
  Table: ResponsiveTable,
  Feedback,
  Button,
  Card,
  Grid,
  Row,
  Column,
  Icon,
  Media,
  SmartLink: CustomLink,
  Timeline,
  Line,
};

type CustomMDXProps = MDXRemoteProps & {
  components?: typeof components;
};

export function CustomMDX(props: CustomMDXProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        blockJS: false,
        blockDangerousJS: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [rehypeKatex],
        },
      }}
    />
  );
}
