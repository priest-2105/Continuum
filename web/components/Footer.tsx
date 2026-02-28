import Image from "next/image";
import Link from "next/link";

const CREDITS = [
  {
    name: "Simon Willison",
    role: "Git-scraping technique",
    url: "https://simonwillison.net/2020/Oct/9/git-scraping/",
  },
  {
    name: "The Outages Project",
    role: "Git-scraping infrastructure pattern",
    url: "https://github.com/outages",
  },
  {
    name: "Microsoft RCACopilot",
    role: "AI-assisted root cause architecture",
    url: "https://www.microsoft.com/en-us/research/publication/rcacopilot/",
  },
  {
    name: "Google SRE Book",
    role: "Postmortem culture & SRE principles",
    url: "https://sre.google/sre-book/postmortem-culture/",
  },
  {
    name: "Etsy Code as Craft",
    role: "Postmortem philosophy & Morgue tool",
    url: "https://www.etsy.com/codeascraft",
  },
];

const STACK = [
  { name: "Next.js", url: "https://nextjs.org" },
  { name: "FastAPI", url: "https://fastapi.tiangolo.com" },
  { name: "Supabase", url: "https://supabase.com" },
  { name: "ChromaDB", url: "https://www.trychroma.com" },
  { name: "Groq", url: "https://groq.com" },
  { name: "FastText", url: "https://fasttext.cc" },
  { name: "GitHub Actions", url: "https://github.com/features/actions" },
  { name: "Vercel", url: "https://vercel.com" },
];

export default function Footer() {
  return (
    <footer style={{ background: "#000", marginTop: "auto" }}>
      {/* Red top border */}
      <div style={{ height: 3, background: "#FF000F" }} />

      {/* Main footer grid */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 40,
        }}
      >
        {/* Col 1: Wordmark + tagline */}
        <div>
          <Link
            href="/"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}
          >
           <Image
            src="/continuum-logo-dark.svg"
            alt=""
            height={60}
            width={200}
            />
          </Link>
          <p
            style={{
              fontSize: 13,
              color: "#555",
              lineHeight: 1.7,
              margin: "0 0 20px",
              maxWidth: 240,
            }}
          >
            A centralized repository of software postmortems from across the
            industry — preserved as written, never altered.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <Link
              href="/postmortems"
              style={{ fontSize: 12, color: "#666", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Browse
            </Link>
            <Link
              href="/about"
              style={{ fontSize: 12, color: "#666", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              About
            </Link>
          </div>
        </div>

        {/* Col 2: Credits */}
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#444",
              marginBottom: 16,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            Credits
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CREDITS.map((c) => (
              <div key={c.name}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13,
                    color: "#ccc",
                    textDecoration: "none",
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 2,
                  }}
                >
                  {c.name} ↗
                </a>
                <span style={{ fontSize: 11, color: "#555" }}>{c.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Built with */}
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#444",
              marginBottom: 16,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            Built with
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {STACK.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11,
                  color: "#666",
                  textDecoration: "none",
                  border: "1px solid #222",
                  padding: "3px 8px",
                  letterSpacing: "0.06em",
                  fontFamily: "var(--font-jetbrains), monospace",
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {s.name}
              </a>
            ))}
          </div>

          <div
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: "1px solid #1a1a1a",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#444",
                lineHeight: 1.6,
                margin: 0,
                fontFamily: "var(--font-jetbrains), monospace",
              }}
            >
              Content belongs to respective owners. Continuum aggregates
              metadata and links only for copyright-restricted sources. Full
              content hosting applies to CC-licensed sources only.
            </p>
          </div>
        </div>
      </div>

      {/* Creator strip */}
      <div style={{ borderTop: "1px solid #111" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#444",
                margin: "0 0 8px",
                fontFamily: "'JetBrains Mono Variable', monospace",
              }}
            >
              Creator
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Fawaz Bailey
              </span>
              <div style={{ display: "flex", gap: 10 }}>
                <a
                  href="https://github.com/priest-2105"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    color: "#FF000F",
                    textDecoration: "none",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    border: "1px solid #FF000F",
                    padding: "3px 10px",
                    fontFamily: "'JetBrains Mono Variable', monospace",
                  }}
                >
                  GitHub ↗
                </a>
                <a
                  href="https://www.linkedin.com/in/fawazbailey/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    color: "#FF000F",
                    textDecoration: "none",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    border: "1px solid #FF000F",
                    padding: "3px 10px",
                    fontFamily: "'JetBrains Mono Variable', monospace",
                  }}
                >
                  LinkedIn ↗
                </a>
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              color: "#333",
              fontFamily: "'JetBrains Mono Variable', monospace",
              letterSpacing: "0.06em",
            }}
          >
            © {new Date().getFullYear()} Continuum
          </span>
        </div>
      </div>
    </footer>
  );
}
