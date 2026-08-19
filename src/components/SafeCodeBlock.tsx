import { highlight } from "@/lib/highlight";
import { CodeBlock, type CodeTab } from "@/components/site/CodeBlock";

type RawCode = { code?: unknown; language?: string; label?: string };

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value && typeof value === "object" && "content" in (value as Record<string, unknown>)) {
    const content = (value as { content?: unknown }).content;
    return typeof content === "string" ? content : "";
  }
  return "";
}

function normalize(codes: unknown): RawCode[] {
  if (!Array.isArray(codes) || codes.length === 0) return [{ code: "", language: "text", label: "Code" }];
  return codes as RawCode[];
}

/**
 * Server-side code block: highlights every tab, then hands the markup to the
 * client component that owns tabs and copy.
 */
export async function SafeCodeBlock({
  codes,
  minimized = false,
}: {
  codes?: unknown;
  minimized?: boolean;
  [key: string]: unknown;
}) {
  const tabs: CodeTab[] = await Promise.all(
    normalize(codes).map(async (item) => {
      const code = toText(item?.code);
      const language = item?.language?.trim() || "text";
      return {
        code,
        language,
        label: item?.label?.trim() || language.charAt(0).toUpperCase() + language.slice(1),
        html: await highlight(code, language),
      };
    }),
  );

  return <CodeBlock tabs={tabs} minimized={minimized} />;
}

export default SafeCodeBlock;
