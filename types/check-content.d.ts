/**
 * `scripts/check-content.mjs` is plain JS, but its `checkDocument` is pure and
 * is the single definition of the site's editorial rules. The admin editor
 * imports it rather than restating them, so the live linting in the editor and
 * `npm run content:check` can never disagree.
 */
declare module "*/check-content.mjs" {
  export type ContentProblem = { rule: string; detail: string };
  export function checkDocument(document: unknown): ContentProblem[];
}
