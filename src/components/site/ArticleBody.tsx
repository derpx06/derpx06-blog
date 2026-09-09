import { CustomMDX } from "@/components/mdx";
import type { ContentBodyFormat } from "@/types/content.types";

/**
 * Renders one article body.
 *
 * There used to be a second branch here: the localhost TipTap editor saved
 * `bodyFormat: "html"`, and handing that to the MDX compiler was a hard parse
 * error that failed `next build`. That editor is gone and the corpus is 100%
 * MDX, so there is nothing left to branch on. `bodyFormat` stays in the
 * signature because old `content_revisions` rows still carry the field and the
 * callers pass it through.
 */
export function ArticleBody({ body }: { body: string; bodyFormat?: ContentBodyFormat }) {
  return <CustomMDX source={body} />;
}
