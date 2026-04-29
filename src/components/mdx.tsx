import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import React, { ReactNode } from "react";
import { slugify as transliterate } from "transliteration";
import { HeadingLink } from "@/components/HeadingLink";
import { SafeCodeBlock } from "@/components/SafeCodeBlock";
import { JupyterCodeBlock } from "@/components/JupyterCodeBlock";
import { Timeline } from "@/components/Timeline";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

import {
  Heading,
  Text,
  InlineCode,
  TextProps,
  MediaProps,
  Accordion,
  AccordionGroup,
  Table as OnceTable,
  Feedback,
  Button,
  Card,
  Grid,
  Row,
  Column,
  Icon,
  Media,
  SmartLink,
  List,
  ListItem,
  Line,
} from "@once-ui-system/core";

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
      <SmartLink href={href} {...props}>
        {children}
      </SmartLink>
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

export function createImage({ alt, src, ...props }: MediaProps & { src: string }) {
  if (!src) {
    console.error("Media requires a valid 'src' property.");
    return null;
  }

  return (
    <Media
      marginTop="8"
      marginBottom="16"
      enlarge
      radius="m"
      border="neutral-alpha-medium"
      sizes="(max-width: 960px) 100vw, 960px"
      alt={alt}
      src={src}
      {...props}
    />
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
  const str = extractText(input);
  const strWithAnd = str.replace(/&/g, " and ");
  return transliterate(strWithAnd, {
    lowercase: true,
    separator: "-",
  }).replace(/\-\-+/g, "-");
}

function createHeading(as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  const CustomHeading = ({
    children,
    ...props
  }: Omit<React.ComponentProps<typeof HeadingLink>, "as" | "id" | "level">) => {
    const slug = slugify(children as string);
    const level = parseInt(as.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
    return (
      <HeadingLink marginTop="24" marginBottom="12" level={level} id={slug} {...props}>
        {children}
      </HeadingLink>
    );
  };

  CustomHeading.displayName = `${as}`;

  return CustomHeading;
}

function createParagraph({ children }: TextProps) {
  return (
    <Text
      style={{ lineHeight: "175%" }}
      variant="body-default-m"
      onBackground="neutral-medium"
      marginTop="8"
      marginBottom="12"
    >
      {children}
    </Text>
  );
}

function createInlineCode({ children }: { children: ReactNode }) {
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

    return <JupyterCodeBlock cells={jupyterCells} marginBottom={rest.marginBottom} />;
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

function createList({ children }: { children: ReactNode }) {
  return <List>{children}</List>;
}

function createListItem({ children }: { children: ReactNode }) {
  return (
    <ListItem
      marginTop="4"
      marginBottom="8"
      onBackground="neutral-medium"
      style={{ lineHeight: "175%" }}
    >
      {children}
    </ListItem>
  );
}

function createHR() {
  return (
    <Row fillWidth horizontal="center">
      <Line maxWidth="40" />
    </Row>
  );
}

function normalizeTableData(data: any, props: any): TableData | null {
  if (data && Array.isArray(data.headers) && Array.isArray(data.rows)) {
    return data as TableData;
  }

  if (Array.isArray(props?.headers) && Array.isArray(props?.rows)) {
    return {
      headers: props.headers,
      rows: props.rows,
    };
  }

  return null;
}

function MarkdownTable({ children }: { children?: ReactNode }) {
  return (
    <Column fillWidth overflowX="auto" marginBottom="16">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {children}
      </table>
    </Column>
  );
}

function ResponsiveTable(props: any) {
  const { data, headers, rows, children, ...rest } = props;
  const normalizedData = normalizeTableData(data, { headers, rows });

  if (normalizedData) {
    return (
      <Column fillWidth overflowX="auto">
        <OnceTable data={normalizedData} {...rest} />
      </Column>
    );
  }

  if (children) {
    return <MarkdownTable>{children}</MarkdownTable>;
  }

  console.warn("Table render skipped: expected either data.headers+data.rows, headers+rows, or markdown table children.");
  return null;
}

function CustomFeedback({ children, ...props }: any) {
  return (
    <Feedback
      {...props}
      style={{
        backdropFilter: "blur(24px)",
        background: "rgba(125, 125, 125, 0.08)",
        border: "1px solid var(--neutral-alpha-medium)",
        ...props.style,
      }}
    >
      <Column fillWidth style={{ marginTop: "-6px" }}>
        {children}
      </Column>
    </Feedback>
  );
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
  ol: createList as any,
  ul: createList as any,
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
  Feedback: CustomFeedback,
  Button,
  Card,
  Grid,
  Row,
  Column,
  Icon,
  Media,
  SmartLink,
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
