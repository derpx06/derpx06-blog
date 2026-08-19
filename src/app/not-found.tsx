import Link from "next/link";
import { Masthead } from "@/components/site/Masthead";

export default function NotFound() {
  return (
    <main id="main">
      <Masthead current={null} />
      <section style={{ padding: "80px var(--gut) 120px" }}>
        <div className="ds-narrow">
          <span className="ds-kick" style={{ marginBottom: 18 }}>
            404
          </span>
          <h1 className="ds-t-page" style={{ marginBottom: 16 }}>
            That page isn&apos;t here
          </h1>
          <p className="ds-dek" style={{ marginBottom: 26 }}>
            The link may be old, or the piece may have moved. The archive is the best place to pick
            the thread back up.
          </p>
          <div className="ds-wrap">
            <Link href="/" className="ds-box ds-dark">
              Home
            </Link>
            <Link href="/blog" className="ds-box">
              All writing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
