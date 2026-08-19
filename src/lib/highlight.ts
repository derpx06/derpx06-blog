import { createHighlighter, type Highlighter } from "shiki";

const THEMES = { light: "github-light", dark: "github-dark" } as const;

const LANGS = [
  "bash",
  "c",
  "cpp",
  "csharp",
  "css",
  "diff",
  "docker",
  "go",
  "graphql",
  "html",
  "ini",
  "java",
  "javascript",
  "json",
  "jsx",
  "kotlin",
  "lua",
  "markdown",
  "php",
  "python",
  "ruby",
  "rust",
  "scss",
  "shell",
  "sql",
  "swift",
  "toml",
  "tsx",
  "typescript",
  "xml",
  "yaml",
] as const;

const ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  "c++": "cpp",
  md: "markdown",
  text: "plaintext",
  txt: "plaintext",
  "": "plaintext",
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  // One highlighter per process — creating it per block is what makes shiki slow.
  highlighterPromise ||= createHighlighter({
    themes: [THEMES.light, THEMES.dark],
    langs: [...LANGS],
  });
  return highlighterPromise;
}

export function normalizeLanguage(language: string): string {
  const value = (language || "").toLowerCase().trim();
  const resolved = ALIASES[value] ?? value;
  return (LANGS as readonly string[]).includes(resolved) ? resolved : "plaintext";
}

/**
 * Highlights server-side and emits both themes in one tree; CSS picks the one
 * that matches `data-theme`. No highlighting JS reaches the browser.
 */
export async function highlight(code: string, language: string): Promise<string> {
  const lang = normalizeLanguage(language);
  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(code, {
      lang,
      themes: THEMES,
      defaultColor: false,
      cssVariablePrefix: "--shiki-",
    });
  } catch (error) {
    console.error("Highlight failed:", error);
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre class="shiki"><code>${escaped}</code></pre>`;
  }
}
