import { mailchimp } from "@/resources";

/**
 * The design's newsletter block. Posts straight to the configured provider —
 * no client JS, so it works before hydration and on a failed bundle.
 */
export function NewsletterBlock({
  title = "One email a month",
  copy = "What I read, built and got wrong.",
  stacked = false,
}: {
  title?: string;
  copy?: string;
  stacked?: boolean;
}) {
  return (
    <div>
      <span className="ds-kickq" style={{ marginBottom: 14 }}>
        The monthly letter
      </span>
      <div className="ds-t-s" style={{ marginBottom: 10 }}>
        {title}
      </div>
      <p className="ds-dek" style={{ fontSize: 14, marginBottom: 14 }}>
        {copy}
      </p>
      <form
        action={mailchimp.action}
        method="post"
        target="_blank"
        rel="noopener noreferrer"
        className={stacked ? "ds-stack" : "ds-joined"}
        style={{ display: "flex", flexDirection: stacked ? "column" : "row", gap: stacked ? 8 : 0 }}
      >
        <label className="ds-sr" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          className="ds-field"
          type="email"
          name="EMAIL"
          required
          placeholder="you@work.com"
          style={stacked ? { borderRight: "1px solid var(--ink)" } : undefined}
        />
        <button type="submit" className={`ds-box ds-dark${stacked ? " ds-block" : ""}`}>
          Join
        </button>
      </form>
    </div>
  );
}
