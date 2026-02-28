import PostmortemCard from "@/components/PostmortemCard";
import EmptyState from "@/components/EmptyState";
import { getPostmortems, getCompanies } from "@/lib/api";
import Link from "next/link";

const PAGE_SIZE = 20;

const SEVERITIES = ["critical", "high", "medium", "low"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first", sort_by: "published_at", sort_dir: "desc" },
  { value: "oldest", label: "Oldest first", sort_by: "published_at", sort_dir: "asc" },
  { value: "az",     label: "Company A–Z",  sort_by: "company",      sort_dir: "asc" },
  { value: "za",     label: "Company Z–A",  sort_by: "company",      sort_dir: "desc" },
];

interface Props {
  searchParams: Promise<{
    company?: string;
    severity?: string;
    sort?: string;
    page?: string;
  }>;
}

function buildUrl(base: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function BrowsePage({ searchParams }: Props) {
  const { company, severity, sort = "newest", page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const sortOpt = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  const [result, companies] = await Promise.all([
    getPostmortems({
      company,
      severity,
      sort_by: sortOpt.sort_by,
      sort_dir: sortOpt.sort_dir,
      limit: PAGE_SIZE,
      offset,
    }),
    getCompanies(),
  ]);

  const { data: postmortems, total } = result;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filterBase = { company, severity, sort };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-block",
    padding: "5px 12px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    textDecoration: "none",
    border: "1px solid",
    borderColor: active ? "#000" : "#ddd",
    background: active ? "#000" : "transparent",
    color: active ? "#fff" : "#666",
    cursor: "pointer",
  });

  return (
    <div style={{ background: "#fff" }}>
      {/* Page header */}
      <div style={{ borderBottom: "2px solid #000", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 32px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#FF000F", marginBottom: 10, fontFamily: "var(--font-jetbrains), monospace" }}>
            Archive
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: "-0.01em", textTransform: "uppercase" }}>
            All Postmortems
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 40, alignItems: "flex-start" }}>
        {/* Sidebar */}
        <aside style={{ width: 180, flexShrink: 0 }}>
          {/* Company filter */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 10px", color: "#666" }}>
            Company
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 28 }}>
            <FilterLink label="All" href={buildUrl("/postmortems", { ...filterBase, company: undefined, page: undefined })} active={!company} />
            {companies.map((c) => (
              <FilterLink key={c} label={c} href={buildUrl("/postmortems", { ...filterBase, company: c, page: undefined })} active={company === c} />
            ))}
          </div>

          {/* Severity filter */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 10px", color: "#666" }}>
            Severity
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FilterLink label="All" href={buildUrl("/postmortems", { ...filterBase, severity: undefined, page: undefined })} active={!severity} />
            {SEVERITIES.map((s) => (
              <FilterLink key={s} label={s} href={buildUrl("/postmortems", { ...filterBase, severity: s, page: undefined })} active={severity === s} />
            ))}
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Sort + count row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <p style={{ fontSize: 12, color: "#888", margin: 0, fontFamily: "var(--font-jetbrains), monospace" }}>
              {total} result{total !== 1 ? "s" : ""}
              {company ? ` · ${company.toUpperCase()}` : ""}
              {severity ? ` · ${severity}` : ""}
            </p>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {SORT_OPTIONS.map((o) => (
                <Link
                  key={o.value}
                  href={buildUrl("/postmortems", { ...filterBase, sort: o.value, page: undefined })}
                  style={chipStyle(sort === o.value)}
                >
                  {o.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Grid */}
          {postmortems.length === 0 ? (
            <EmptyState message="No postmortems found for this filter." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "#000", border: "1px solid #000" }}>
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
                href={buildUrl("/postmortems", { ...filterBase, page: page > 1 ? String(page - 1) : undefined })}
                style={{ fontSize: 12, fontWeight: 700, color: page > 1 ? "#000" : "#ccc", textDecoration: "none", letterSpacing: "0.08em", pointerEvents: page > 1 ? "auto" : "none" }}
              >
                ← Prev
              </Link>

              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "…")[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`ellipsis-${i}`} style={{ fontSize: 12, color: "#aaa", padding: "5px 4px" }}>…</span>
                    ) : (
                      <Link
                        key={p}
                        href={buildUrl("/postmortems", { ...filterBase, page: String(p) })}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: p === page ? "#fff" : "#000",
                          background: p === page ? "#000" : "transparent",
                          border: "1px solid",
                          borderColor: p === page ? "#000" : "#ddd",
                          padding: "5px 10px",
                          textDecoration: "none",
                          minWidth: 32,
                          textAlign: "center",
                        }}
                      >
                        {p}
                      </Link>
                    )
                  )}
              </div>

              <Link
                href={buildUrl("/postmortems", { ...filterBase, page: page < totalPages ? String(page + 1) : undefined })}
                style={{ fontSize: 12, fontWeight: 700, color: page < totalPages ? "#000" : "#ccc", textDecoration: "none", letterSpacing: "0.08em", pointerEvents: page < totalPages ? "auto" : "none" }}
              >
                Next →
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
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
    </Link>
  );
}
