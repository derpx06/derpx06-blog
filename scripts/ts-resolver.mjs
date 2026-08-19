import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const EXTENSIONS = [".ts", ".tsx", ".js", "/index.ts", "/index.tsx"];

/**
 * Teaches `node --test` the two things the app's imports rely on and Node
 * does not: the `@/` alias from tsconfig, and extensionless relative paths.
 */
export function resolve(specifier, context, next) {
  let target = null;

  if (specifier.startsWith("@/")) {
    target = path.join(root, "src", specifier.slice(2));
  } else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    target = path.resolve(path.dirname(new URL(context.parentURL).pathname), specifier);
  }

  if (target && !existsSync(target)) {
    const match = EXTENSIONS.map((ext) => target + ext).find(existsSync);
    if (match) return next(pathToFileURL(match).href, context);
  }
  if (target && existsSync(target)) {
    return next(pathToFileURL(target).href, context);
  }

  return next(specifier, context);
}
