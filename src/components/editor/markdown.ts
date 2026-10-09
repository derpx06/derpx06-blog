/* Tiny Markdown <-> HTML bridge for the node types the Tiptap toolbar can produce.
   ponytail: no markdown dependency installed; exotic MDX (JSX components, tables) round-trips as raw text. */

// ---------- HTML -> Markdown (browser only: uses DOMParser) ----------

export function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return blocks(doc.body).replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const kids = () => Array.from(el.childNodes).map(inline).join("");
  switch (el.tagName) {
    case "STRONG": case "B": return `**${kids()}**`;
    case "EM": case "I": return `*${kids()}*`;
    case "S": case "DEL": return `~~${kids()}~~`;
    case "CODE": return `\`${el.textContent}\``;
    case "A": return `[${kids()}](${el.getAttribute("href") ?? ""})`;
    case "IMG": return `![${el.getAttribute("alt") ?? ""}](${el.getAttribute("src") ?? ""})`;
    case "BR": return "  \n";
    default: return kids(); // u, mark (highlight), sup, sub, span -> plain text
  }
}

function blocks(parent: Node, prefix = ""): string {
  return Array.from(parent.childNodes).map((n) => block(n, prefix)).filter(Boolean).join("\n\n");
}

function block(node: Node, prefix: string): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim() ? prefix + node.textContent!.trim() : "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const tag = el.tagName;
  const h = /^H([1-6])$/.exec(tag);
  if (h) return prefix + "#".repeat(+h[1]) + " " + inline(el).trim();
  if (tag === "P") return inline(el).trim() ? prefix + inline(el).trim() : "";
  if (tag === "HR") return prefix + "---";
  if (tag === "IMG") return prefix + inline(el);
  if (tag === "PRE") {
    const code = el.querySelector("code");
    const lang = /language-([\w+-]+)/.exec(code?.className ?? "")?.[1] ?? "";
    const body = (code ?? el).textContent ?? "";
    return [prefix + "```" + lang, ...body.replace(/\n$/, "").split("\n").map((l) => prefix + l), prefix + "```"].join("\n");
  }
  if (tag === "BLOCKQUOTE") return blocks(el).split("\n").map((l) => prefix + "> " + l).join("\n");
  if (tag === "UL" || tag === "OL") {
    const ordered = tag === "OL";
    return Array.from(el.children).map((li, i) => {
      const marker = ordered ? `${i + 1}. ` : li.getAttribute("data-checked") === "true" ? "- [x] " : li.hasAttribute("data-checked") ? "- [ ] " : "- ";
      const inner = blocks(li, prefix + " ".repeat(marker.length)).replace(/^\s+/, "");
      return prefix + marker + inner;
    }).join("\n");
  }
  if (el.getAttribute("data-type") === "image-upload") return "";
  return blocks(el, prefix); // div, li wrappers, unknown
}

// ---------- Markdown -> HTML ----------

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function fmt(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/(^|[^_\w])_([^_]+)_/g, "$1<em>$2</em>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/ {2,}\n/g, "<br>");
}

const inlineMd = (s: string) =>
  esc(s).split(/(`[^`]+`)/).map((p, i) => (i % 2 ? `<code>${p.slice(1, -1)}</code>` : fmt(p))).join("");

const LIST_RE = /^(\s*)(?:([-*+])|(\d+)[.)])\s+(?:\[([ xX])\]\s+)?(.*)$/;

export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const fence = /^(```|~~~)\s*([\w+-]*)/.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(fence[1])) body.push(lines[i++]);
      i++;
      out.push(`<pre><code${fence[2] ? ` class="language-${fence[2]}"` : ""}>${esc(body.join("\n"))}</code></pre>`);
      continue;
    }
    const h = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
    if (h) { out.push(`<h${h[1].length}>${inlineMd(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
    if (line.startsWith(">")) {
      const q: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) q.push(lines[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote>${markdownToHtml(q.join("\n"))}</blockquote>`);
      continue;
    }
    if (LIST_RE.test(line)) {
      const items: { indent: number; ordered: boolean; checked?: boolean; text: string }[] = [];
      while (i < lines.length) {
        if (!lines[i].trim() && i + 1 < lines.length && LIST_RE.test(lines[i + 1])) { i++; continue; }
        if (!LIST_RE.test(lines[i])) break;
        const m = LIST_RE.exec(lines[i++])!;
        items.push({ indent: m[1].length, ordered: !!m[3], checked: m[4] ? m[4] !== " " : undefined, text: m[5] });
        while (i < lines.length && lines[i].trim() && !LIST_RE.test(lines[i]) && /^\s+/.test(lines[i])) items[items.length - 1].text += " " + lines[i++].trim();
      }
      let s = 0;
      while (s < items.length) {
        const [html, end] = renderList(items, s, items[s].indent); // always consumes >= 1 item
        out.push(html);
        s = end;
      }
      continue;
    }
    const img = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/.exec(line);
    if (img) { out.push(`<img alt="${esc(img[1])}" src="${esc(img[2])}">`); i++; continue; }
    const p: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|~~~|>|!\[)/.test(lines[i]) && !LIST_RE.test(lines[i]) && !/^(-{3,}|\*{3,})\s*$/.test(lines[i])) p.push(lines[i++]);
    out.push(`<p>${inlineMd(p.join("\n"))}</p>`);
  }
  return out.join("\n");
}

type Item = { indent: number; ordered: boolean; checked?: boolean; text: string };

/** Renders one list starting at `start`; returns [html, index after the list]. A sibling of another type starts a new list. */
function renderList(items: Item[], start: number, indent: number): [string, number] {
  const first = items[start];
  const tag = first.ordered ? "ol" : "ul";
  const task = first.checked !== undefined;
  const sameKind = (it: Item) => it.ordered === first.ordered && (it.checked !== undefined) === task;
  let html = task ? `<ul data-type="taskList">` : `<${tag}>`;
  let k = start;
  while (k < items.length && items[k].indent >= indent && sameKind(items[k])) {
    const it = items[k];
    let li = inlineMd(it.text);
    let j = k + 1;
    while (j < items.length && items[j].indent > indent) {
      const [nested, end] = renderList(items, j, items[j].indent);
      li += nested;
      j = end;
    }
    html += task ? `<li data-type="taskItem" data-checked="${it.checked}">${li}</li>` : `<li>${li}</li>`;
    k = j;
  }
  return [html + (task ? "</ul>" : `</${tag}>`), k];
}
