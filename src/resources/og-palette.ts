/**
 * Colours for the OpenGraph cards.
 *
 * `next/og` renders through Satori, which has no CSS custom properties and no
 * stylesheet — so the cards cannot read `design-system.css` and have to carry
 * their own literals. Keeping both cards on this one object is what stops them
 * drifting from the site, and from each other: before this they were `#070707`
 * and `#151515` with an indigo glow left over from the template.
 *
 * These mirror the dark theme, because a social card sits on someone else's
 * timeline and reads better dark than cream.
 */
export const OG = {
  /** --pg, dark */
  background: "#14110b",
  /** --ink, dark */
  ink: "#f2ead9",
  /** --body, dark */
  body: "#cdc5b4",
  /** --mut, dark */
  muted: "#968d7c",
  /** --acc, dark — the amber the whole site now runs on */
  accent: "#e0a82e",
  /** Ink for text sitting on an accent-filled plate. */
  onAccent: "#14110b",
  /** A single warm glow, replacing the template's competing yellow and indigo. */
  glow: "radial-gradient(circle at 18% 14%, rgba(224, 168, 46, 0.20), transparent 42%)",
} as const;
