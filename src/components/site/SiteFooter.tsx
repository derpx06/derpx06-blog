import Link from "next/link";
import { editorial, person } from "@/resources";

export function SiteFooter() {
  return (
    <footer className="ds-foot">
      <div>
        <div className="ds-ser" style={{ fontSize: 26, marginBottom: 10 }}>
          {person.name.toLowerCase()}
        </div>
        <p
          style={{
            margin: 0,
            font: "400 14px/1.55 var(--ds-sans)",
            color: "var(--foot-dim)",
            maxWidth: "34ch",
          }}
        >
          {editorial.footerBlurb}
        </p>
        <p className="ds-meta" style={{ color: "var(--foot-mut)", marginTop: 18 }}>
          © {new Date().getFullYear()} {person.name}
        </p>
      </div>

      {editorial.footerColumns.map((column) => (
        <div key={column.title}>
          <span className="ds-kickq" style={{ marginBottom: 14 }}>
            {column.title}
          </span>
          <div className="ds-flist">
            {column.links.map((link) =>
              link.external ? (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={link.href}>
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>
      ))}
    </footer>
  );
}
