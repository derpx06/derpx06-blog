import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { buildPalette } from "@/components/admin/palette";
import { normalizeLanguage } from "@/lib/highlight";
import { MDX_BLOCKS, type MdxBlockSpec } from "@/lib/mdx-registry";

const BLOCKS: readonly MdxBlockSpec[] = MDX_BLOCKS;

function spec(name: string): MdxBlockSpec {
  const found = BLOCKS.find((block) => block.name === name);
  assert.ok(found, `${name} is missing from MDX_BLOCKS`);
  return found;
}

test("every block name is unique", () => {
  const names = BLOCKS.map((block) => block.name);
  assert.equal(new Set(names).size, names.length);
});

test("options are non-empty and defaults name real props", () => {
  for (const block of BLOCKS) {
    for (const prop of block.props) {
      if (prop.options) {
        assert.ok(prop.options.length > 0, `${block.name}.${prop.name} has empty options`);
      }
    }
    for (const key of Object.keys(block.defaults ?? {})) {
      assert.ok(
        block.props.some((prop) => prop.name === key),
        `${block.name} defaults ${key}, which is not one of its props`,
      );
    }
  }
});

test("every CodeBlock language survives normalizeLanguage", () => {
  const languages = spec("CodeBlock").props.find((prop) => prop.name === "language")?.options;
  assert.ok(languages?.length);
  for (const language of languages) {
    assert.notEqual(normalizeLanguage(language), "plaintext", `${language} degrades to plaintext`);
  }
});

test("every Icon name is a key of the ICONS map in mdx-kit", () => {
  // mdx-kit is JSX, so it cannot be imported here; read the map out of the source.
  const source = fs.readFileSync(
    path.join(import.meta.dirname, "..", "src", "components", "site", "mdx-kit.tsx"),
    "utf-8",
  );
  const map = source.match(/const ICONS: Record<string, typeof Info> = \{([^}]*)\}/)?.[1];
  assert.ok(map, "could not find the ICONS map");
  const keys = new Set([...map.matchAll(/^\s*(\w+):/gm)].map((match) => match[1]));

  const names = spec("Icon").props.find((prop) => prop.name === "name")?.options;
  assert.ok(names?.length);
  for (const name of names) {
    assert.ok(keys.has(name), `Icon name ${name} is not in the ICONS map`);
  }
  assert.equal(names.length, keys.size, "the ICONS map and Icon.name options have drifted");
});

test("the palette carries every non-deprecated block", () => {
  const labels = new Set(buildPalette().flatMap((group) => group.items.map((item) => item.label)));
  for (const block of BLOCKS) {
    assert.equal(
      labels.has(block.label),
      !block.deprecated,
      `${block.name} should ${block.deprecated ? "not " : ""}be in the palette`,
    );
  }
});
