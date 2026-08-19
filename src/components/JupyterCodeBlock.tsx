import { highlight } from "@/lib/highlight";
import { CodeBlock, type CodeTab } from "@/components/site/CodeBlock";

export type JupyterCell = {
  code: string;
  output?: string;
  label: string;
  language: string;
  showOutput?: boolean;
};

/** Notebook cells as a tabbed block, each cell highlighted on the server. */
export async function JupyterCodeBlock({ cells }: { cells: JupyterCell[] }) {
  if (!cells || cells.length === 0) return null;

  const tabs: CodeTab[] = await Promise.all(
    cells.map(async (cell) => ({
      code: cell.code,
      language: cell.language || "python",
      label: cell.label || "Code",
      output: cell.showOutput ? cell.output : undefined,
      html: await highlight(cell.code, cell.language || "python"),
    })),
  );

  return <CodeBlock tabs={tabs} />;
}

export default JupyterCodeBlock;
