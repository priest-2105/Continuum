import Link from "next/link";
import PostmortemCard from "@/components/PostmortemCard";
import EmptyState from "@/components/EmptyState";
import { getPostmortems } from "@/lib/api";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest",      sort_by: "published_at", sort_dir: "desc" },
  { value: "oldest", label: "Oldest",      sort_by: "published_at", sort_dir: "asc" },
  { value: "az",     label: "Company A–Z", sort_by: "company",      sort_dir: "asc" },
];

interface Props {
  searchParams: Promise<{ sort?: string; page?: string }>;
}

function buildUrl(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function HomePage({ searchParams }: Props) {
  const { sort = "newest", page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const sortOpt = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  const result = await getPostmortems({
    sort_by: sortOpt.sort_by,
    sort_dir: sortOpt.sort_dir,
    limit: PAGE_SIZE,
    offset,
  });

  const { data: postmortems, total } = result;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-block",
    padding: "6px 14px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    textDecoration: "none",
    border: "1px solid",
    borderColor: active ? "#fff" : "rgba(255,255,255,0.2)",
    background: active ? "#fff" : "transparent",
    color: active ? "#000" : "rgba(255,255,255,0.6)",
  });

  return (
    <div style={{ background: "#fff" }}>
      {/* Hero */}
      <section style={{ background: "#000", padding: "80px 24px 56px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#FF000F", marginBottom: 20, fontFamily: "var(--font-jetbrains), monospace" }}>
            Industry Postmortems
          </p>
          <h1 style={{ fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1, margin: "0 0 24px", textTransform: "uppercase" }}>
            Continuum
          </h1>
          <p style={{ fontSize: 18, color: "#888", maxWidth: 480, lineHeight: 1.6, margin: "0 0 40px" }}>
            A centralized repository of software postmortems from across the industry — preserved as written.
          </p>
          <Link
            href="/postmortems"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FF000F", color: "#fff", padding: "12px 24px", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}
          >
            Browse all →
          </Link>
        </div>
      </section>

      {/* Red bar */}
      <div style={{ height: 4, background: "#FF000F" }} />

      {/* Latest section */}
      <section style={{ padding: "48px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, borderBottom: "2px solid #000", paddingBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
            Latest · {total} total
          </h2>
          <Link href="/postmortems" style={{ fontSize: 12, color: "#FF000F", textDecoration: "none", fontWeight: 600, letterSpacing: "0.05em" }}>
            View all →
          </Link>
        </div>

        {/* Sort bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          {SORT_OPTIONS.map((o) => (
            <Link key={o.value} href={buildUrl({ sort: o.value, page: undefined })}
              style={{
                display: "inline-block",
                padding: "5px 12px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                border: "1px solid",
                borderColor: sort === o.value ? "#000" : "#ddd",
                background: sort === o.value ? "#000" : "transparent",
                color: sort === o.value ? "#fff" : "#666",
              }}
            >
              {o.label}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {postmortems.length === 0 ? (
          <EmptyState message="No postmortems yet — check back soon." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: "#000", border: "1px solid #000" }}>
            {postmortems.map((post) => (
              <div key={post.id} style={{ background: "#fff" }}>
                <PostmortemCard post={post} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32, paddingTop: 20, borderTop: "1px solid #eee" }}>
            <Link
              href={buildUrl({ sort, page: page > 1 ? String(page - 1) : undefined })}
              style={{ fontSize: 12, fontWeight: 700, color: page > 1 ? "#000" : "#ccc", textDecoration: "none", letterSpacing: "0.08em", pointerEvents: page > 1 ? "auto" : "none" }}
            >
              ← Prev
            </Link>

            <span style={{ fontSize: 12, color: "#666", fontFamily: "var(--font-jetbrains), monospace" }}>
              Page {page} of {totalPages}
            </span>

            <Link
              href={buildUrl({ sort, page: page < totalPages ? String(page + 1) : undefined })}
              style={{ fontSize: 12, fontWeight: 700, color: page < totalPages ? "#000" : "#ccc", textDecoration: "none", letterSpacing: "0.08em", pointerEvents: page < totalPages ? "auto" : "none" }}
            >
              Next →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
