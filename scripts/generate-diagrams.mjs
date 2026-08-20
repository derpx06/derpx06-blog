/**
 * Draws one diagram per article into public/images/diagrams/.
 *
 *   node scripts/generate-diagrams.mjs
 *
 * Two constraints shape every drawing here:
 *
 * 1. The background is transparent. The `.ds-ph` plate behind supplies it, so
 *    the same file sits correctly on the light plate and the dark one without
 *    needing two versions or a media query an <img> would ignore.
 * 2. Only two ink colours are used, both chosen to read against `--ph` in
 *    either theme. Nothing here may rely on a web font, since an SVG loaded as
 *    an image cannot fetch one.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const W = 480;
const H = 260;
const ACC = "#c8502f";
const INK = "#8f8878";
const SANS = "ui-sans-serif, system-ui, sans-serif";

// --- primitives ------------------------------------------------------------

const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== false)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}="${v}"`)
    .join(" ");

const rect = (x, y, w, h, o = {}) =>
  `<rect ${attrs({ x, y, width: w, height: h, rx: o.r ?? 2, fill: o.fill ?? "none", stroke: o.stroke ?? INK, strokeWidth: o.sw ?? 1.5, strokeDasharray: o.dash, opacity: o.op })}/>`;

const line = (x1, y1, x2, y2, o = {}) =>
  `<line ${attrs({ x1, y1, x2, y2, stroke: o.stroke ?? INK, strokeWidth: o.sw ?? 1.5, strokeDasharray: o.dash, opacity: o.op, strokeLinecap: "round" })}/>`;

const arrow = (x1, y1, x2, y2, o = {}) =>
  `<line ${attrs({ x1, y1, x2, y2, stroke: o.stroke ?? INK, strokeWidth: o.sw ?? 1.5, strokeDasharray: o.dash, opacity: o.op, markerEnd: `url(#a-${o.stroke === ACC ? "acc" : "ink"})`, strokeLinecap: "round" })}/>`;

const circle = (cx, cy, r, o = {}) =>
  `<circle ${attrs({ cx, cy, r, fill: o.fill ?? "none", stroke: o.stroke ?? INK, strokeWidth: o.sw ?? 1.5, opacity: o.op })}/>`;

const pathEl = (d, o = {}) =>
  `<path ${attrs({ d, fill: o.fill ?? "none", stroke: o.stroke ?? INK, strokeWidth: o.sw ?? 1.5, strokeDasharray: o.dash, opacity: o.op, strokeLinecap: "round", strokeLinejoin: "round" })}/>`;

const text = (x, y, value, o = {}) =>
  `<text ${attrs({ x, y, fill: o.fill ?? INK, fontSize: o.size ?? 11, fontFamily: SANS, fontWeight: o.weight ?? 400, textAnchor: o.anchor ?? "middle", letterSpacing: o.ls, opacity: o.op })}>${String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`;

/** Small uppercase caption, the same role the `.ds-kick` kicker plays in the page. */
const kick = (x, y, value, o = {}) =>
  text(x, y, String(value).toUpperCase(), { size: 8.5, ls: 1.4, weight: 500, ...o });

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
<defs>
<marker id="a-ink" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="${INK}"/></marker>
<marker id="a-acc" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="${ACC}"/></marker>
</defs>
${body}
</svg>
`;

/** A labelled half of a two-panel comparison. */
const panel = (x, label, body) =>
  [
    kick(x + 100, 30, label, { fill: INK, op: 0.85 }),
    line(x + 40, 40, x + 160, 40, { op: 0.35 }),
    body,
  ].join("\n");

// --- the drawings ----------------------------------------------------------

const DIAGRAMS = {
  // ---------- explainers ----------

  /** The pantry and the worktop: many trips versus one. */
  "flashattention-io-awareness": () => {
    const trips = [0, 1, 2, 3]
      .map((i) => arrow(96, 96 + i * 22, 170, 96 + i * 22, { stroke: ACC, sw: 1.2 }))
      .join("\n");
    return [
      panel(
        20,
        "standard",
        [
          rect(40, 80, 56, 96, { dash: "3 3" }),
          text(68, 134, "HBM", { size: 10 }),
          rect(170, 80, 50, 96),
          text(195, 134, "SRAM", { size: 10 }),
          trips,
          kick(130, 200, "n² grid, written twice", { fill: ACC }),
        ].join("\n"),
      ),
      line(240, 60, 240, 210, { op: 0.25 }),
      panel(
        260,
        "flashattention",
        [
          rect(280, 80, 56, 96, { dash: "3 3" }),
          text(308, 134, "HBM", { size: 10 }),
          rect(410, 80, 50, 96),
          text(435, 134, "SRAM", { size: 10 }),
          arrow(336, 128, 410, 128, { stroke: ACC, sw: 1.6 }),
          kick(370, 200, "one pass, nothing stored", { fill: ACC }),
        ].join("\n"),
      ),
    ].join("\n");
  },

  /** The isoFLOP valley, with a wrong answer up each side. */
  "chinchilla-compute-optimal-scaling": () => {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = 70 + t * 340;
      // y grows downward in SVG, so a low loss sits low on the canvas: this
      // traces a valley, which is how an isoFLOP curve is always drawn.
      const y = 186 - 88 * (2 * (t - 0.5)) ** 2;
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return [
      line(70, 200, 430, 200, { op: 0.4 }),
      line(70, 60, 70, 200, { op: 0.4 }),
      kick(250, 224, "model size  →", { op: 0.8 }),
      `<g transform="translate(46,130) rotate(-90)">${kick(0, 0, "← loss", { op: 0.8 })}</g>`,
      pathEl(pts.join(" "), { stroke: ACC, sw: 2 }),
      circle(240, 186, 4, { fill: ACC, stroke: ACC }),
      line(240, 182, 240, 120, { stroke: ACC, dash: "2 3", op: 0.6 }),
      kick(240, 112, "best for this budget", { fill: ACC }),
      circle(92, 100, 3.5, { fill: INK, stroke: INK, op: 0.9 }),
      kick(100, 88, "too small", { anchor: "start", op: 0.95 }),
      circle(408, 100, 3.5, { fill: INK, stroke: INK, op: 0.9 }),
      kick(400, 88, "too big", { anchor: "end", op: 0.95 }),
      kick(250, 42, "one fixed compute budget", { op: 0.7 }),
    ].join("\n");
  },

  /** One large grid rebuilt from two thin ones. */
  "lora-low-rank-adaptation": () =>
    [
      rect(48, 70, 120, 120, { op: 0.9 }),
      kick(108, 206, "frozen  d × k", { op: 0.9 }),
      text(108, 135, "W₀", { size: 15, fill: INK }),
      text(190, 136, "+", { size: 16, fill: INK }),
      rect(212, 70, 26, 120, { stroke: ACC }),
      kick(225, 206, "B", { fill: ACC }),
      text(250, 136, "×", { size: 14, fill: INK }),
      rect(264, 70, 120, 26, { stroke: ACC }),
      kick(324, 112, "A", { fill: ACC }),
      kick(324, 150, "rank r  ≪  d, k", { fill: ACC }),
      line(212, 214, 384, 214, { stroke: ACC, op: 0.5 }),
      kick(298, 232, "≈ 0.4% of the numbers", { fill: ACC }),
      kick(216, 42, "the change, factored", { anchor: "start", op: 0.7 }),
    ].join("\n"),

  /** A transcript that keeps growing beside notes that never do. */
  "mamba-selective-state-spaces": () => {
    const grow = [0, 1, 2, 3, 4, 5]
      .map((i) => rect(40 + i * 26, 150 - i * 16, 18, 30 + i * 16, { stroke: ACC, op: 0.9 }))
      .join("\n");
    const flat = [0, 1, 2, 3, 4, 5].map((i) => rect(280 + i * 26, 118, 18, 44)).join("\n");
    return [
      panel(
        20,
        "attention",
        [grow, kick(120, 200, "memory grows with length", { fill: ACC })].join("\n"),
      ),
      line(250, 60, 250, 210, { op: 0.25 }),
      panel(
        260,
        "state space",
        [flat, kick(360, 200, "fixed-size notes", { op: 0.95 })].join("\n"),
      ),
    ].join("\n");
  },

  /** Four guesses checked in one pass; the last is rejected. */
  "speculative-decoding": () => {
    const g = [0, 1, 2, 3]
      .map((i) => rect(120 + i * 68, 74, 56, 34, { stroke: ACC, op: 0.9 }))
      .join("\n");
    const marks = ["✓", "✓", "✓", "✕"]
      .map((m, i) =>
        text(148 + i * 68, 190, m, { size: 14, fill: i === 3 ? INK : ACC, op: i === 3 ? 0.7 : 1 }),
      )
      .join("\n");
    return [
      kick(66, 95, "draft", { fill: ACC, anchor: "middle" }),
      arrow(92, 91, 116, 91, { stroke: ACC, sw: 1.2 }),
      g,
      [0, 1, 2, 3]
        .map((i) => arrow(148 + i * 68, 112, 148 + i * 68, 138, { sw: 1.2, op: 0.8 }))
        .join("\n"),
      rect(120, 140, 260, 30),
      text(250, 160, "target model — one pass", { size: 10.5 }),
      marks,
      kick(250, 216, "3 words for the price of 1", { fill: ACC }),
      kick(250, 44, "guess ahead, then check", { op: 0.7 }),
    ].join("\n");
  },

  /** One outlier stretching the ladder so every other value collapses. */
  "quantization-what-breaks-at-4-bits": () => {
    const rungs = (x0, spread) =>
      Array.from({ length: 9 }, (_, i) =>
        line(x0, 70 + i * (spread / 8), x0 + 44, 70 + i * (spread / 8), { op: 0.6, sw: 1.2 }),
      ).join("\n");
    return [
      panel(
        20,
        "tight range",
        [
          line(62, 66, 62, 178),
          rungs(62, 112),
          [0.15, 0.35, 0.52, 0.7, 0.88]
            .map((t) => circle(118, 70 + t * 112, 3.5, { fill: ACC, stroke: ACC }))
            .join("\n"),
          kick(120, 206, "values land on distinct rungs", { fill: ACC }),
        ].join("\n"),
      ),
      line(250, 60, 250, 210, { op: 0.25 }),
      panel(
        260,
        "one outlier",
        [
          line(302, 66, 302, 178),
          rungs(302, 112),
          circle(358, 70, 3.5, { fill: ACC, stroke: ACC }),
          kick(368, 74, "outlier", { anchor: "start", fill: ACC }),
          [0.978, 0.99, 1.0, 1.01, 1.022]
            .map((t) => circle(358, 70 + t * 112, 3.2, { fill: ACC, stroke: ACC, op: 0.9 }))
            .join("\n"),
          kick(372, 186, "everything else,", { anchor: "start", op: 0.95 }),
          kick(372, 199, "one rung apart", { anchor: "start", op: 0.95 }),
          kick(360, 226, "the outlier set the spacing", { fill: ACC }),
        ].join("\n"),
      ),
    ].join("\n");
  },

  /** Sparse express layers above a dense local one. */
  "hnsw-vector-search": () => {
    const layer = (y, n, label) => {
      const xs = Array.from({ length: n }, (_, i) => 70 + ((i + 0.5) * 340) / n);
      return [
        line(60, y, 420, y, { op: 0.18 }),
        xs.map((x) => circle(x, y, 3, { fill: INK, stroke: INK, op: 0.75 })).join("\n"),
        kick(46, y + 3, label, { anchor: "end", op: 0.8 }),
      ].join("\n");
    };
    return [
      layer(72, 3, "top"),
      layer(126, 7, "mid"),
      layer(180, 17, "all"),
      arrow(240, 72, 128, 120, { stroke: ACC, sw: 1.6 }),
      arrow(128, 126, 174, 174, { stroke: ACC, sw: 1.6 }),
      arrow(174, 180, 214, 180, { stroke: ACC, sw: 1.6 }),
      circle(214, 180, 5.5, { stroke: ACC, sw: 2 }),
      kick(250, 220, "big steps first, then refine", { fill: ACC }),
      kick(240, 42, "each layer is a sample of the one below", { op: 0.7 }),
    ].join("\n");
  },

  /** One word, three pieces, three integers — and the letters are gone. */
  "tokenizers-and-byte-pair-encoding": () => {
    const parts = [
      ["str", 96],
      ["aw", 66],
      ["berry", 118],
    ];
    let x = 88;
    const boxes = parts
      .map(([label, w]) => {
        const el = [
          rect(x, 82, w, 38, { stroke: ACC }),
          text(x + w / 2, 106, label, { size: 13, fill: ACC }),
        ].join("\n");
        x += w + 10;
        return el;
      })
      .join("\n");
    x = 88;
    const nums = ["2536", "707", "15717"]
      .map((n, i) => {
        const w = parts[i][1];
        const el = [
          arrow(x + w / 2, 124, x + w / 2, 150, { sw: 1.2, op: 0.8 }),
          text(x + w / 2, 172, n, { size: 12 }),
        ].join("\n");
        x += w + 10;
        return el;
      })
      .join("\n");
    return [
      text(240, 58, "s t r a w b e r r y", { size: 13, ls: 1, op: 0.75 }),
      boxes,
      nums,
      line(80, 192, 400, 192, { op: 0.3 }),
      kick(240, 212, "the model only ever sees these", { fill: ACC }),
      kick(240, 232, "no letters, so no r's to count", { op: 0.85 }),
    ].join("\n");
  },

  /** Two majorities of five must share a member. */
  "raft-consensus": () => {
    const cx = 240,
      cy = 128,
      r = 66;
    const nodes = Array.from({ length: 5 }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
    const inA = [0, 1, 2],
      inB = [2, 3, 4];
    return [
      pathEl(
        `M${nodes[0][0]} ${nodes[0][1]} L${nodes[1][0]} ${nodes[1][1]} L${nodes[2][0]} ${nodes[2][1]} Z`,
        { stroke: ACC, op: 0.28, fill: ACC, sw: 0 },
      ),
      pathEl(
        `M${nodes[2][0]} ${nodes[2][1]} L${nodes[3][0]} ${nodes[3][1]} L${nodes[4][0]} ${nodes[4][1]} Z`,
        { stroke: INK, op: 0.22, fill: INK, sw: 0 },
      ),
      nodes
        .map(([x, y], i) => {
          const both = inA.includes(i) && inB.includes(i);
          return circle(x, y, both ? 10 : 8, {
            fill: both ? ACC : "none",
            stroke: both ? ACC : INK,
            sw: both ? 2 : 1.5,
          });
        })
        .join("\n"),
      kick(nodes[2][0] + 26, nodes[2][1] + 4, "in both", { anchor: "start", fill: ACC }),
      kick(120, 60, "majority a", { fill: ACC, op: 0.9 }),
      kick(370, 200, "majority b", { op: 0.9 }),
      kick(240, 240, "any two majorities of five must overlap", { op: 0.85 }),
    ].join("\n");
  },

  // ---------- blog ----------

  /** A wide vague target versus a narrow one a small model can hit. */
  "finetuning-a-05b-model-for-shell-commands": () =>
    [
      panel(
        20,
        "“shell commands”",
        [
          rect(40, 78, 160, 92, { dash: "4 4", op: 0.7 }),
          ["git", "docker", "awk", "find", "systemd", "tar"]
            .map((t, i) =>
              text(66 + (i % 3) * 46, 104 + Math.floor(i / 3) * 34, t, { size: 10, op: 0.85 }),
            )
            .join("\n"),
          kick(120, 196, "too blurry to aim at", { op: 0.95 }),
        ].join("\n"),
      ),
      line(250, 60, 250, 210, { op: 0.25 }),
      panel(
        260,
        "files, one verb family",
        [
          rect(310, 92, 100, 64, { stroke: ACC }),
          ["find", "grep", "du"]
            .map((t, i) => text(360, 112 + i * 20, t, { size: 10.5, fill: ACC }))
            .join("\n"),
          kick(360, 196, "small enough to learn", { fill: ACC }),
        ].join("\n"),
      ),
    ].join("\n"),

  /** The answer sits exactly on the cut. */
  "rag-is-not-a-retrieval-problem": () => {
    const lines = (x, y, widths, o = {}) =>
      widths
        .map((w, i) => line(x, y + i * 13, x + w, y + i * 13, { sw: 3, op: o.op ?? 0.35 }))
        .join("\n");
    return [
      rect(60, 58, 170, 150, { op: 0.55 }),
      kick(145, 44, "one document", { op: 0.75 }),
      lines(76, 78, [138, 130, 142, 120]),
      line(76, 130, 214, 130, { sw: 3, stroke: ACC }),
      lines(76, 143, [136, 128, 140]),
      line(52, 130, 238, 130, { stroke: ACC, dash: "4 4", sw: 1.4 }),
      kick(145, 224, "chunk boundary", { fill: ACC }),
      arrow(244, 130, 286, 100, { sw: 1.3, op: 0.8 }),
      arrow(244, 134, 286, 168, { sw: 1.3, op: 0.8 }),
      rect(292, 72, 132, 56, { op: 0.7 }),
      lines(304, 88, [108, 96], { op: 0.3 }),
      line(304, 114, 108 + 304, 114, { sw: 3, stroke: ACC, op: 0.55 }),
      rect(292, 148, 132, 56, { op: 0.7 }),
      line(304, 164, 412, 164, { sw: 3, stroke: ACC, op: 0.55 }),
      lines(304, 178, [104, 92], { op: 0.3 }),
      kick(358, 224, "half an answer, twice", { op: 0.95 }),
    ].join("\n");
  },

  /** A feeling that only goes up, against a measurement that does not. */
  "evals-are-the-only-moat": () => {
    const felt = [];
    const real = [];
    const ys = [150, 138, 128, 120, 114, 110];
    const rs = [150, 128, 136, 118, 142, 108];
    for (let i = 0; i < 6; i++) {
      const x = 96 + i * 58;
      felt.push(`${i === 0 ? "M" : "L"}${x} ${ys[i]}`);
      real.push(`${i === 0 ? "M" : "L"}${x} ${rs[i]}`);
    }
    return [
      line(80, 190, 440, 190, { op: 0.4 }),
      line(80, 60, 80, 190, { op: 0.4 }),
      kick(260, 214, "each change you shipped  →", { op: 0.8 }),
      pathEl(felt.join(" "), { dash: "4 4", op: 0.75 }),
      kick(400, 96, "what it felt like", { anchor: "end", op: 0.9 }),
      pathEl(real.join(" "), { stroke: ACC, sw: 2 }),
      Array.from({ length: 6 }, (_, i) =>
        circle(96 + i * 58, rs[i], 3.5, { fill: ACC, stroke: ACC }),
      ).join("\n"),
      kick(240, 240, "without a number, every change looks like progress", { fill: ACC }),
      kick(260, 42, "thirty test cases", { op: 0.7 }),
    ].join("\n");
  },

  /** Many callers, one worker, one bounded queue. */
  "local-first-ai-is-a-systems-problem": () =>
    [
      [0, 1, 2, 3]
        .map((i) =>
          [
            rect(40, 68 + i * 34, 58, 24, { op: 0.75 }),
            arrow(100, 80 + i * 34, 168, 128, { sw: 1.2, op: 0.7 }),
          ].join("\n"),
        )
        .join("\n"),
      kick(69, 58, "agents", { op: 0.8 }),
      [0, 1, 2, 3, 4]
        .map((i) => rect(172 + i * 22, 112, 18, 32, { stroke: ACC, op: 0.9 }))
        .join("\n"),
      kick(216, 100, "bounded queue", { fill: ACC }),
      rect(172, 112, 110, 32, { stroke: ACC, dash: "3 3", op: 0.55, sw: 1 }),
      arrow(286, 128, 330, 128, { stroke: ACC, sw: 1.6 }),
      rect(334, 100, 106, 56),
      text(387, 132, "one model", { size: 11 }),
      kick(387, 176, "single worker", { op: 0.9 }),
      kick(240, 224, "full queue is a fast, legible failure", { op: 0.9 }),
    ].join("\n"),

  /** A description read and guessed from, not a signature compiled against. */
  "mcp-is-a-protocol-not-a-plugin-system": () =>
    [
      panel(
        20,
        "plugin",
        [
          rect(40, 84, 74, 30),
          text(77, 104, "caller", { size: 10 }),
          arrow(116, 99, 156, 99, { sw: 1.4 }),
          rect(158, 84, 44, 30, { op: 0.8 }),
          kick(120, 148, "knows exactly", { op: 0.95 }),
          kick(120, 164, "what it wants", { op: 0.95 }),
        ].join("\n"),
      ),
      line(250, 60, 250, 210, { op: 0.25 }),
      panel(
        260,
        "tool over mcp",
        [
          rect(276, 84, 74, 30, { stroke: ACC }),
          text(313, 104, "model", { size: 10, fill: ACC }),
          arrow(352, 92, 392, 92, { stroke: ACC, sw: 1.4 }),
          arrow(392, 108, 352, 108, { stroke: ACC, sw: 1.4, dash: "3 3" }),
          rect(394, 84, 44, 30, { op: 0.8 }),
          kick(360, 148, "reads a description,", { fill: ACC }),
          kick(360, 164, "guesses, reads the reply", { fill: ACC }),
          kick(360, 188, "so the error message", { op: 0.9 }),
          kick(360, 202, "is its next instruction", { op: 0.9 }),
        ].join("\n"),
      ),
    ].join("\n"),

  /** A timeout cannot tell the two branches apart. */
  "your-retry-made-it-worse": () =>
    [
      rect(38, 112, 68, 32),
      text(72, 132, "client", { size: 10.5 }),
      arrow(108, 128, 190, 128, { stroke: ACC, sw: 1.5 }),
      kick(149, 118, "request", { fill: ACC }),
      circle(214, 128, 15, { stroke: ACC, dash: "3 3" }),
      text(214, 132, "?", { size: 14, fill: ACC }),
      kick(214, 162, "timeout", { fill: ACC }),
      arrow(232, 118, 320, 84, { sw: 1.3, op: 0.85 }),
      arrow(232, 138, 320, 176, { sw: 1.3, op: 0.85 }),
      rect(324, 66, 124, 36, { op: 0.8 }),
      text(386, 88, "never arrived", { size: 10 }),
      rect(324, 158, 124, 36, { stroke: ACC }),
      text(386, 180, "already done", { size: 10, fill: ACC }),
      kick(240, 234, "same silence — retry is only safe if repeating is free", { op: 0.9 }),
      kick(240, 40, "what the timeout does not tell you", { op: 0.7 }),
    ].join("\n"),

  /** A folder that grows without limit versus one that cannot. */
  "what-i-got-wrong-about-document-modelling": () => {
    const row = (x, y, w) => rect(x, y, w, 11, { op: 0.4, sw: 1.2 });
    return [
      panel(
        20,
        "bounded",
        [
          rect(46, 66, 148, 116),
          kick(120, 82, "customer", { op: 0.9 }),
          [0, 1, 2].map((i) => row(60, 96 + i * 18, 120)).join("\n"),
          rect(60, 150, 120, 20, { stroke: ACC, op: 0.9 }),
          kick(120, 204, "read together, cannot grow", { fill: ACC }),
        ].join("\n"),
      ),
      line(250, 60, 250, 214, { op: 0.25 }),
      panel(
        260,
        "unbounded",
        [
          rect(286, 66, 148, 150),
          kick(360, 82, "customer", { op: 0.9 }),
          [0, 1].map((i) => row(300, 96 + i * 18, 120)).join("\n"),
          [0, 1, 2, 3, 4]
            .map((i) => rect(300, 134 + i * 15, 120, 11, { stroke: ACC, op: 0.85, sw: 1.2 }))
            .join("\n"),
          text(360, 226, "⋮", { size: 13, fill: ACC }),
          kick(360, 244, "one bad day away from the size limit", { fill: ACC }),
        ].join("\n"),
      ),
    ].join("\n");
  },

  /** A replica with a gap in the line back. */
  "mobile-apps-are-distributed-systems": () =>
    [
      rect(46, 88, 62, 96, { r: 8 }),
      line(60, 172, 94, 172, { op: 0.5 }),
      kick(77, 74, "phone", { op: 0.9 }),
      [0, 1, 2]
        .map((i) => rect(58, 102 + i * 18, 38, 11, { stroke: ACC, op: 0.9, sw: 1.2 }))
        .join("\n"),
      kick(77, 202, "3 unsent changes", { fill: ACC }),
      line(114, 128, 176, 128, { stroke: ACC, sw: 1.5 }),
      line(214, 128, 276, 128, { stroke: ACC, sw: 1.5 }),
      pathEl("M180 116 L196 128 L180 140", { stroke: ACC, sw: 1.4, op: 0.55 }),
      pathEl("M210 116 L194 128 L210 140", { stroke: ACC, sw: 1.4, op: 0.55 }),
      kick(195, 106, "90 minutes", { fill: ACC }),
      rect(280, 88, 154, 96),
      kick(357, 74, "server", { op: 0.9 }),
      [0, 1, 2, 3].map((i) => rect(294, 102 + i * 18, 126, 11, { op: 0.4, sw: 1.2 })).join("\n"),
      kick(357, 202, "2 colleagues + an import", { op: 0.95 }),
      kick(240, 238, "a replica that goes away and comes back disagreeing", { op: 0.85 }),
    ].join("\n"),

  /** Alphabetised shelf against the pile by the door. */
  "btrees-or-lsm-trees": () => {
    const book = (x, y, h, o = {}) => rect(x, y, 11, h, o);
    return [
      panel(
        20,
        "b-tree",
        [
          line(44, 158, 196, 158, { op: 0.5 }),
          Array.from({ length: 11 }, (_, i) =>
            book(48 + i * 13, 158 - (46 + (i % 3) * 4), 46 + (i % 3) * 4, { op: 0.75 }),
          ).join("\n"),
          arrow(150, 88, 120, 108, { stroke: ACC, sw: 1.4 }),
          kick(158, 82, "shuffle to insert", { anchor: "start", fill: ACC, op: 1 }),
          kick(120, 194, "sorted on disk, fast to read", { op: 0.95 }),
        ].join("\n"),
      ),
      line(250, 60, 250, 214, { op: 0.25 }),
      panel(
        260,
        "lsm-tree",
        [
          line(284, 158, 436, 158, { op: 0.5 }),
          Array.from({ length: 6 }, (_, i) => book(290 + i * 13, 112, 46, { op: 0.7 })).join("\n"),
          rect(376, 118, 46, 40, { stroke: ACC }),
          rect(376, 100, 46, 14, { stroke: ACC, op: 0.7 }),
          rect(376, 84, 46, 12, { stroke: ACC, op: 0.45 }),
          kick(399, 74, "new, unsorted", { fill: ACC }),
          kick(360, 194, "append now, tidy up later", { op: 0.95 }),
        ].join("\n"),
      ),
    ].join("\n");
  },
};

const outDir = path.resolve("public/images/diagrams");
await mkdir(outDir, { recursive: true });

for (const [slug, draw] of Object.entries(DIAGRAMS)) {
  await writeFile(path.join(outDir, `${slug}.svg`), svg(draw()), "utf8");
  console.log(`${slug}.svg`);
}
console.log(`\n${Object.keys(DIAGRAMS).length} diagrams → ${outDir}`);
