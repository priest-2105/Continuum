import Link from "next/link";
import Navbar from "@/components/Navbar";
import PostmortemCard from "@/components/PostmortemCard";
import EmptyState from "@/components/EmptyState";
import { getPostmortems } from "@/lib/api";

export default async function HomePage() {
  const recent = await getPostmortems({ limit: 6 });

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: "#000", padding: "80px 24px 72px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#FF000F",
              marginBottom: 20,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            Industry Postmortems
          </p>
          <h1
            style={{
              fontSize: "clamp(48px, 8vw, 96px)",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              margin: "0 0 24px",
              textTransform: "uppercase",
            }}
          >
            Continuum
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "#888",
              maxWidth: 480,
              lineHeight: 1.6,
              margin: "0 0 40px",
            }}
          >
            A centralized repository of software postmortems from across the
            industry — preserved as written.
          </p>
          <Link
            href="/postmortems"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#FF000F",
              color: "#fff",
              padding: "12px 24px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Browse all →
          </Link>
        </div>
      </section>

      {/* Divider bar */}
      <div style={{ height: 4, background: "#FF000F" }} />

      {/* Latest postmortems */}
      <section style={{ padding: "64px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 32,
            borderBottom: "2px solid #000",
            paddingBottom: 12,
          }}
        >
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Latest
          </h2>
          <Link
            href="/postmortems"
            style={{
              fontSize: 12,
              color: "#FF000F",
              textDecoration: "none",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState message="No postmortems yet — check back soon." />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 1,
              background: "#000",
              border: "1px solid #000",
            }}
          >
            {recent.map((post) => (
              <div key={post.id} style={{ background: "#fff" }}>
                <PostmortemCard post={post} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #eee",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: "#999",
            margin: 0,
            fontFamily: "var(--font-jetbrains), monospace",
            letterSpacing: "0.08em",
          }}
        >
          CONTINUUM — Industry postmortems, preserved as written.
        </p>
      </footer>
    </div>
  );
}
