import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import React, { ReactNode } from "react";
import { slugify as transliterate } from "transliteration";
import { HeadingLink } from "@/components/HeadingLink";
import { SafeCodeBlock } from "@/components/SafeCodeBlock";
import { JupyterCodeBlock } from "@/components/JupyterCodeBlock";
import { Timeline } from "@/components/Timeline";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';


import {
  Heading,
  Text,
  InlineCode,
  CodeBlock,
  TextProps,
  MediaProps,
  Accordion,
  AccordionGroup,
  Table,
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
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node?.props?.children) return extractText(node.props.children);
  return '';
}

function slugify(input: any): string {
  const str = extractText(input);
  const strWithAnd = str.replace(/&/g, " and "); // Replace & with 'and'
  return transliterate(strWithAnd, {
    lowercase: true,
    separator: "-", // Replace spaces with -
  }).replace(/\-\-+/g, "-"); // Replace multiple - with single -
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

import fs from 'fs';
import path from 'path';

function ServerCodeBlock(props: any) {
  const { codes, showOutput, ...rest } = props;

  // If showOutput is true and we have Jupyter notebook cells, use JupyterCodeBlock
  if (showOutput && Array.isArray(codes)) {
    const jupyterCells = codes.map((codeItem: any) => {
      if (codeItem.file && codeItem.file.endsWith('.ipynb')) {
        try {
          const filePath = path.join(process.cwd(), codeItem.file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const notebook = JSON.parse(fileContent);
          const cells = notebook.cells;

          // Use single cellIndex instead of cellIndices array
          const cellIndex = codeItem.cellIndex !== undefined ? codeItem.cellIndex : 0;
          const cell = cells[cellIndex];

          if (!cell) {
            return {
              code: `Error: Cell ${cellIndex} not found`,
              label: codeItem.label || 'Code',
              language: 'text',
              showOutput: false
            };
          }

          // Extract code from the single cell
          const code = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

          // Extract output from the cell if it exists
          let output = "";
          if (cell.outputs && cell.outputs.length > 0) {
            cell.outputs.forEach((outputItem: any) => {
              if (outputItem.text) {
                output += Array.isArray(outputItem.text) ? outputItem.text.join('') : outputItem.text;
              } else if (outputItem.data && outputItem.data['text/plain']) {
                output += Array.isArray(outputItem.data['text/plain']) ? outputItem.data['text/plain'].join('') : outputItem.data['text/plain'];
              }
            });
          }

          return {
            code,
            output: output || undefined,
            label: codeItem.label || 'Code',
            language: codeItem.language || 'python',
            showOutput: codeItem.showOutput === true  // Default to false
          };
        } catch (error) {
          console.error(`Error reading notebook file: ${codeItem.file}`, error);
          return {
            code: `Error: Could not read file ${codeItem.file}`,
            label: codeItem.label || 'Code',
            language: 'text',
            showOutput: false
          };
        }
      }
      return {
        code: codeItem.code || '',
        output: codeItem.output,
        label: codeItem.label || 'Code',
        language: codeItem.language || 'text',
        showOutput: codeItem.showOutput === true
      };
    });

    return <JupyterCodeBlock cells={jupyterCells} marginBottom={rest.marginBottom} />;
  }

  // Original processing for regular CodeBlock
  let processedCodes = codes;

  if (Array.isArray(codes)) {
    processedCodes = codes.map((codeItem: any) => {
      if (codeItem.file) {
        try {
          const filePath = path.join(process.cwd(), codeItem.file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          // Handle Jupyter Notebooks
          if (codeItem.file.endsWith('.ipynb')) {
            const notebook = JSON.parse(fileContent);
            const cells = notebook.cells;
            let content = "";

            // Extract output from the LAST specified cell if displayOutput is true
            if (codeItem.displayOutput) {
              const cellIndex = codeItem.cellIndices ? codeItem.cellIndices[codeItem.cellIndices.length - 1] : 0;
              const cell = cells[cellIndex];
              if (cell && cell.outputs) {
                // Prioritize 'text' field which might be an array or string
                // Standard nbformat: outputs[i].text or outputs[i].data['text/plain']
                cell.outputs.forEach((output: any) => {
                  if (output.text) {
                    content += Array.isArray(output.text) ? output.text.join('') : output.text;
                  } else if (output.data && output.data['text/plain']) {
                    content += Array.isArray(output.data['text/plain']) ? output.data['text/plain'].join('') : output.data['text/plain'];
                  }
                });
              }
            } else {
              // Extract Source Code
              const indices = codeItem.cellIndices || [];
              // Concatenate source from all specified cells
              content = indices.map((index: number) => {
                const cell = cells[index];
                if (!cell || !cell.source) return "";
                const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
                return source;
              }).join('\n\n');
            }

            return {
              ...codeItem,
              code: content
            };
          }

          // Handle other files (text/py/etc)
          return {
            ...codeItem,
            code: fileContent
          };
        } catch (error) {
          console.error(`Error reading file: ${codeItem.file}`, error);
          return {
            ...codeItem,
            code: `Error: Could not read file ${codeItem.file}`
          };
        }
      }
      return codeItem;
    });
  }

  // Handle standard Markdown usage (children + className)
  if (!processedCodes && rest.children) {
    const language = rest.className ? rest.className.replace('language-', '') : 'text';
    processedCodes = [{
      code: rest.children.toString(),
      language: language,
      label: language.charAt(0).toUpperCase() + language.slice(1)
    }];
  }

  return <SafeCodeBlock codes={processedCodes} {...rest} />;
}

function createList({ children }: { children: ReactNode }) {
  return <List>{children}</List>;
}

function createListItem({ children }: { children: ReactNode }) {
  return (
    <ListItem marginTop="4" marginBottom="8" style={{ lineHeight: "175%" }}>
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
  Heading,
  Text,
  CodeBlock: ServerCodeBlock,
  InlineCode,
  Accordion,
  AccordionGroup,
  Table,
  Feedback,
  Button,
  Card,
  Grid,
  Row,
  Column,
  Icon,
  Media,
  SmartLink,
  Timeline,
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
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
      }}
    />
  );
}
