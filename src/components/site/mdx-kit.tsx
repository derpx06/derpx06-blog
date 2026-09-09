import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Sparkles,
  X,
} from "lucide-react";

/**
 * Plain replacements for the layout components the MDX bodies reference.
 * The bodies were written against Once UI, so these honour the props those
 * bodies actually pass: numeric-string spacing tokens, `variant`,
 * `onBackground`, `label`, `description`, and the `s={{…}}` breakpoint object.
 */

type Spacing = string | number | undefined;
type Breakpoint = { columns?: Spacing; direction?: string };

function px(value: Spacing): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${numeric}px` : String(value);
}

const ALIGN: Record<string, string> = {
  center: "center",
  start: "flex-start",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
};

type BoxProps = {
  children?: ReactNode;
  gap?: Spacing;
  padding?: Spacing;
  paddingX?: Spacing;
  paddingY?: Spacing;
  marginTop?: Spacing;
  marginBottom?: Spacing;
  vertical?: string;
  horizontal?: string;
  style?: CSSProperties;
  className?: string;
  [key: string]: unknown;
};

function spacing(props: BoxProps): CSSProperties {
  return {
    gap: px(props.gap),
    padding: px(props.padding),
    paddingInline: px(props.paddingX),
    paddingBlock: px(props.paddingY),
    marginTop: px(props.marginTop),
    marginBottom: px(props.marginBottom),
    ...props.style,
  };
}

/* ------------------------------------------------------------- typography */

const SIZES: Record<string, Record<string, number>> = {
  display: { xs: 32, s: 40, m: 48, l: 56, xl: 64 },
  heading: { xs: 15, s: 17, m: 20, l: 24, xl: 28 },
  body: { xs: 12, s: 14, m: 16, l: 18, xl: 20 },
  label: { xs: 11, s: 12, m: 13, l: 14, xl: 15 },
};

const TONES: Record<string, string> = {
  weak: "var(--mut)",
  medium: "var(--body)",
  strong: "var(--ink)",
};

/** e.g. "heading-strong-s" → serif/sans, size, weight. */
function variantStyle(variant?: string, onBackground?: string): CSSProperties {
  const [family = "body", weight = "default", size = "m"] = (variant || "").split("-");
  const scale = SIZES[family] ?? SIZES.body;
  const style: CSSProperties = {
    fontSize: scale[size] ?? scale.m,
    lineHeight: family === "display" ? 1.06 : family === "heading" ? 1.25 : 1.55,
    fontWeight: weight === "strong" ? 600 : 400,
  };

  if (family === "display") {
    style.fontFamily = "var(--ds-serif)";
    style.fontWeight = 400;
  }
  if (family === "label") {
    style.letterSpacing = "0.04em";
  }

  const [group, tone] = (onBackground || "").split("-");
  if (tone) {
    style.color =
      group === "neutral"
        ? (TONES[tone] ?? "var(--body)")
        : group === "danger"
          ? "var(--acc)"
          : group === "warning"
            ? "var(--warn)"
            : group === "success"
              ? "var(--ok)"
              : "var(--acc)";
  }

  return style;
}

/* ------------------------------------------------------------------ boxes */

export function Row({ children, vertical, horizontal, className, ...rest }: BoxProps) {
  const small = rest.s as Breakpoint | undefined;
  return (
    <div
      className={`ds-mdx-row${small?.direction === "column" ? " ds-mdx-stack-s" : ""} ${className ?? ""}`.trim()}
      style={{
        alignItems: ALIGN[vertical ?? ""],
        justifyContent: ALIGN[horizontal ?? ""],
        ...spacing(rest),
      }}
    >
      {children}
    </div>
  );
}

export function Column({ children, vertical, horizontal, className, ...rest }: BoxProps) {
  return (
    <div
      className={`ds-mdx-col ${className ?? ""}`.trim()}
      style={{
        justifyContent: ALIGN[vertical ?? ""],
        alignItems: ALIGN[horizontal ?? ""],
        ...spacing(rest),
      }}
    >
      {children}
    </div>
  );
}

export function Grid({ children, columns, className, ...rest }: BoxProps & { columns?: Spacing }) {
  const count = Math.max(1, Number(columns) || 2);
  return (
    <div
      className={`ds-mdx-grid ${className ?? ""}`.trim()}
      // auto-fit means the declared column count is a maximum, and the grid
      // collapses on narrow screens without a breakpoint prop.
      style={{ "--ds-cols": count, gap: px(rest.gap) ?? "16px", ...spacing(rest) } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function Card({
  children,
  direction,
  className,
  ...rest
}: BoxProps & { direction?: string }) {
  return (
    <div
      className={`ds-card ${className ?? ""}`.trim()}
      style={{
        display: "flex",
        flexDirection: direction === "row" ? "row" : "column",
        gap: px(rest.gap) ?? "6px",
        ...spacing(rest),
      }}
    >
      {children}
    </div>
  );
}

export function Text({
  children,
  variant,
  onBackground,
  className,
  ...rest
}: BoxProps & {
  variant?: string;
  onBackground?: string;
}) {
  return (
    <span
      className={className}
      style={{ display: "block", ...variantStyle(variant, onBackground), ...spacing(rest) }}
    >
      {children}
    </span>
  );
}

export function Heading({
  children,
  as = "h3",
  variant,
  onBackground,
  className,
  ...rest
}: BoxProps & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  variant?: string;
  onBackground?: string;
}) {
  const Tag = as;
  return (
    <Tag
      className={className}
      style={{ ...variantStyle(variant || "heading-strong-l", onBackground), ...spacing(rest) }}
    >
      {children}
    </Tag>
  );
}

export function Line({ vert }: { vert?: boolean }) {
  if (vert) return <span className="ds-mdx-vline" aria-hidden="true" />;
  return <hr className="ds-rule" style={{ border: "none", margin: "24px 0" }} />;
}

export function InlineCode({ children }: { children?: ReactNode }) {
  return <code className="ds-inline-code">{children}</code>;
}

/* ------------------------------------------------------------------ icons */

const ICONS: Record<string, typeof Info> = {
  sparkle: Sparkles,
  sparkles: Sparkles,
  info: Info,
  warning: AlertTriangle,
  danger: X,
  close: X,
  check: Check,
  checkCircle: Check,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  openLink: ExternalLink,
};

const ICON_PX: Record<string, number> = { xs: 12, s: 14, m: 18, l: 22, xl: 28 };

export function Icon({ name, size = "m" }: { name?: string; size?: string }) {
  const Component = ICONS[name ?? ""] ?? Info;
  return <Component size={ICON_PX[size] ?? 18} aria-hidden="true" />;
}

/* ---------------------------------------------------------------- actions */

export function Button({
  children,
  href,
  label,
  variant,
  prefixIcon,
  suffixIcon,
  ...rest
}: BoxProps & {
  href?: string;
  label?: ReactNode;
  variant?: string;
  prefixIcon?: string;
  suffixIcon?: string;
}) {
  // Once UI takes the text as `label`; markdown children also work.
  const content = (
    <>
      {prefixIcon && <Icon name={prefixIcon} size="s" />}
      {children ?? label}
      {suffixIcon && <Icon name={suffixIcon} size="s" />}
    </>
  );
  const className = `ds-box ds-mdx-button${variant === "primary" ? " ds-dark" : ""}`;

  if (href) {
    return href.startsWith("/") || href.startsWith("#") ? (
      <Link href={href} className={className} style={spacing(rest)}>
        {content}
      </Link>
    ) : (
      <a
        href={href}
        className={className}
        style={spacing(rest)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={className} style={spacing(rest)}>
      {content}
    </button>
  );
}

export function Media({
  src,
  alt = "",
  aspectRatio,
  ...rest
}: {
  src?: string;
  alt?: string;
  aspectRatio?: string;
  [key: string]: unknown;
}) {
  if (!src) return null;
  return (
    <figure className="ds-figure" style={{ aspectRatio }}>
      <Image
        src={src}
        alt={alt}
        width={Number(rest.width) || 1200}
        height={Number(rest.height) || 675}
        sizes="(max-width: 960px) 100vw, 960px"
        style={{ width: "100%", height: "auto" }}
      />
      {alt ? <figcaption>{alt}</figcaption> : null}
    </figure>
  );
}

/* --------------------------------------------------------------- callouts */

const FEEDBACK_ICON: Record<string, typeof Info> = {
  info: Info,
  success: Check,
  warning: AlertTriangle,
  danger: X,
};

export function Feedback({
  children,
  variant = "info",
  title,
  description,
  ...rest
}: BoxProps & { variant?: string; title?: ReactNode; description?: ReactNode }) {
  const IconComponent = FEEDBACK_ICON[variant] ?? Info;
  return (
    <aside className={`ds-callout ds-callout-${variant}`} style={spacing(rest)}>
      <IconComponent size={16} aria-hidden="true" />
      <div style={{ minWidth: 0 }}>
        {title && <strong className="ds-callout-title">{title}</strong>}
        {description && <p style={{ margin: 0 }}>{description}</p>}
        {children}
      </div>
    </aside>
  );
}

export function Accordion({ title, children }: { title?: ReactNode; children?: ReactNode }) {
  return (
    <details className="ds-accordion">
      <summary>{title ?? "Details"}</summary>
      <div>{children}</div>
    </details>
  );
}

export function AccordionGroup({
  items,
  children,
}: {
  items?: Array<{ title: ReactNode; content: ReactNode }>;
  children?: ReactNode;
}) {
  return (
    <div className="ds-accordion-group">
      {Array.isArray(items)
        ? items.map((item, index) => (
            // Titles are free-form and may repeat; position is the only stable id here.
            // biome-ignore lint/suspicious/noArrayIndexKey: static list, never reordered
            <Accordion key={index} title={item.title}>
              {item.content}
            </Accordion>
          ))
        : children}
    </div>
  );
}
