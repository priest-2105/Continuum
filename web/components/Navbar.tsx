import Link from "next/link";

export default function Navbar() {
  return (
    <header style={{ background: "#000" }}>
      <nav
        style={{ maxWidth: 1200, margin: "0 auto" }}
        className="flex items-center justify-between px-6 py-4"
      >
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#FF000F",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "inherit",
            }}
          >
            Continuum
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/postmortems"
            style={{
              color: "#999",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              fontWeight: 500,
            }}
            className="hover:text-white transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/about"
            style={{
              color: "#999",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              fontWeight: 500,
            }}
            className="hover:text-white transition-colors"
          >
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
