import Link from "next/link";
import LogoutButton from "./LogoutButton";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/queue", label: "Review Queue" },
  { href: "/admin/published", label: "Published" },
  { href: "/admin/sources", label: "Sources" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0a" }}>
      {/* Top bar */}
      <header
        style={{
          background: "#000",
          borderBottom: "1px solid #1a1a1a",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 52,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF000F", display: "inline-block" }} />
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Continuum
            </span>
          </Link>
          <span style={{ color: "#333", fontSize: 13 }}>/</span>
          <span style={{ color: "#666", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'JetBrains Mono Variable', monospace" }}>
            Admin
          </span>
        </div>
        <LogoutButton />
      </header>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <nav
          style={{
            width: 200,
            background: "#000",
            borderRight: "1px solid #1a1a1a",
            padding: "24px 0",
            flexShrink: 0,
          }}
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "9px 20px",
                fontSize: 13,
                color: "#666",
                textDecoration: "none",
                letterSpacing: "0.04em",
                borderLeft: "2px solid transparent",
              }}
            >
              {item.label}
            </Link>
          ))}

          <div style={{ borderTop: "1px solid #1a1a1a", margin: "16px 0" }} />

          <Link
            href="/"
            style={{
              display: "block",
              padding: "9px 20px",
              fontSize: 12,
              color: "#444",
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            ← Public site
          </Link>
        </nav>

        {/* Content */}
        <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
