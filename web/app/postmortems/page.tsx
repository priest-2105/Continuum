import Navbar from "@/components/Navbar";
import PostmortemCard from "@/components/PostmortemCard";
import EmptyState from "@/components/EmptyState";
import { getPostmortems, getCompanies } from "@/lib/api";

interface Props {
  searchParams: Promise<{ company?: string }>;
}

export default async function BrowsePage({ searchParams }: Props) {
  const { company } = await searchParams;
  const [postmortems, companies] = await Promise.all([
    getPostmortems({ company, limit: 100 }),
    getCompanies(),
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Navbar />

      {/* Page header */}
      <div style={{ borderBottom: "2px solid #000", background: "#fff" }}>
        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 32px" }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#FF000F",
              marginBottom: 10,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            Archive
          </p>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
            }}
          >
            All Postmortems
          </h1>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 24px",
          display: "flex",
          gap: 40,
          alignItems: "flex-start",
        }}
      >
        {/* Sidebar filter */}
        <aside style={{ width: 160, flexShrink: 0 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: "0 0 12px",
              color: "#666",
            }}
          >
            Company
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FilterLink label="All" href="/postmortems" active={!company} />
            {companies.map((c) => (
              <FilterLink
                key={c}
                label={c}
                href={`/postmortems?company=${c}`}
                active={company === c}
              />
            ))}
          </div>
        </aside>

        {/* Grid */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 12,
              color: "#888",
              marginBottom: 20,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            {postmortems.length} result{postmortems.length !== 1 ? "s" : ""}
            {company ? ` · ${company.toUpperCase()}` : ""}
          </p>

          {postmortems.length === 0 ? (
            <EmptyState message="No postmortems found for this filter." />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 1,
                background: "#000",
                border: "1px solid #000",
              }}
            >
              {postmortems.map((post) => (
                <div key={post.id} style={{ background: "#fff" }}>
                  <PostmortemCard post={post} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <footer
        style={{
          borderTop: "1px solid #eee",
          padding: "24px",
          textAlign: "center",
          marginTop: 64,
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

function FilterLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        color: active ? "#fff" : "#333",
        background: active ? "#000" : "transparent",
        textDecoration: "none",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        borderLeft: active ? "3px solid #FF000F" : "3px solid transparent",
      }}
    >
      {label}
    </a>
  );
}
