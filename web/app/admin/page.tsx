import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Admin" };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

async function getStats() {
  try {
    const [published, pending] = await Promise.all([
      fetch(`${API_URL}/postmortems?status=published&limit=100`, {
        headers: { "x-admin-secret": ADMIN_SECRET },
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/admin/queue`, {
        headers: { "x-admin-secret": ADMIN_SECRET },
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : [])),
    ]);
    return { published, pending };
  } catch {
    return { published: [], pending: [] };
  }
}

export default async function AdminDashboard() {
  const { published, pending } = await getStats();

  const companies = [...new Set([...published, ...pending].map((p: { company: string }) => p.company))];

  const statCards = [
    { label: "Total published", value: published.length },
    { label: "Pending review", value: pending.length, alert: pending.length > 0 },
    { label: "Companies indexed", value: companies.length },
  ];

  return (
    <div>
      <AdminPageHeader label="Overview" title="Dashboard" />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#1a1a1a", border: "1px solid #1a1a1a", marginBottom: 32 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ background: "#0f0f0f", padding: "24px 20px" }}>
            <p style={{ fontSize: 11, color: "#444", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 10px", fontFamily: "monospace" }}>
              {s.label}
            </p>
            <p style={{ fontSize: 36, fontWeight: 800, color: s.alert ? "#FF000F" : "#fff", margin: 0, lineHeight: 1 }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Company breakdown */}
      {companies.length > 0 && (
        <div>
          <SectionLabel>Sources indexed</SectionLabel>
          <div style={{ border: "1px solid #1a1a1a" }}>
            {companies.map((company, i) => {
              const count = published.filter((p: { company: string }) => p.company === company).length;
              const pendingCount = pending.filter((p: { company: string }) => p.company === company).length;
              return (
                <div
                  key={company}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 80px",
                    padding: "12px 16px",
                    borderBottom: i < companies.length - 1 ? "1px solid #1a1a1a" : "none",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#ccc", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {company}
                  </span>
                  <span style={{ fontSize: 12, color: "#555", fontFamily: "monospace", textAlign: "right" }}>
                    {count} published
                  </span>
                  <span style={{ fontSize: 12, color: pendingCount > 0 ? "#FF000F" : "#333", fontFamily: "monospace", textAlign: "right" }}>
                    {pendingCount} pending
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div style={{ marginTop: 24, padding: "14px 16px", border: "1px solid #FF000F", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#FF000F", fontFamily: "monospace" }}>
            {pending.length} item{pending.length !== 1 ? "s" : ""} waiting for review
          </p>
          <a href="/admin/queue" style={{ fontSize: 12, color: "#FF000F", textDecoration: "none", fontWeight: 700, letterSpacing: "0.08em" }}>
            Go to queue →
          </a>
        </div>
      )}
    </div>
  );
}

function AdminPageHeader({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px", fontFamily: "monospace" }}>
        {label}
      </p>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
        {title}
      </h1>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 12px", fontFamily: "monospace" }}>
      {children}
    </p>
  );
}
