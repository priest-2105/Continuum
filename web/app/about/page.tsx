import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About — Continuum",
  description:
    "Learn about Continuum — why it was built, how it works, and who made it possible.",
};

const PIPELINE = [
  {
    step: "01",
    label: "Detection",
    desc: "RSS feeds and public status pages are monitored continuously for new incident reports and engineering blog posts from tracked companies.",
  },
  {
    step: "02",
    label: "Collection",
    desc: "Modular Python Incident Handlers — one per company — fetch metadata and content. Each handler is purpose-built for its source's structure.",
  },
  {
    step: "03",
    label: "Storage",
    desc: "Raw content is committed directly to a GitHub repository (docs-as-code). Metadata is stored in a Postgres database. The Git history is the audit trail.",
  },
  {
    step: "04",
    label: "AI Enrichment",
    desc: "An LLM generates a concise 120–140 word summary and predicts a root cause category using chain-of-thought prompting grounded in the original text.",
  },
  {
    step: "05",
    label: "Discovery",
    desc: "FastText embeddings convert each postmortem into a numeric vector, enabling semantic search — find similar incidents across different companies by context, not just keywords.",
  },
];

const SOURCES = [
  {
    company: "Etsy (Code as Craft)",
    license: "Copyright — metadata + link only",
    color: "#888",
  },
  {
    company: "Google SRE Book",
    license: "CC BY-NC-ND 4.0 — full content with attribution",
    color: "#4caf50",
  },
  {
    company: "Microsoft Research (RCACopilot)",
    license: "Academic use — educational reference",
    color: "#4caf50",
  },
  {
    company: "AWS, GCP, Cloudflare, GitHub",
    license: "Status data via git-scraping (The Outages Project)",
    color: "#888",
  },
];

const CREDITS = [
  {
    name: "Simon Willison",
    url: "https://simonwillison.net/2020/Oct/9/git-scraping/",
    contribution:
      "Originated the git-scraping technique — the foundational data collection pattern behind Continuum's handler architecture.",
  },
  {
    name: "The Outages Project",
    url: "https://github.com/outages",
    contribution:
      "Demonstrated git-scraping at scale across dozens of cloud providers. Their modular, per-company repo pattern directly inspired Continuum's handler design.",
  },
  {
    name: "Microsoft Research — RCACopilot",
    url: "https://www.microsoft.com/en-us/research/publication/rcacopilot/",
    contribution:
      "The academic research paper on AI-assisted root cause analysis that shaped Continuum's AI enrichment layer — including root cause categorization, chain-of-thought prompting, and FastText embeddings.",
  },
  {
    name: "Google Site Reliability Engineering",
    url: "https://sre.google/sre-book/postmortem-culture/",
    contribution:
      "The SRE book's chapters on postmortem culture, blameless retrospectives, and action item frameworks defined the principles Continuum is built to serve.",
  },
  {
    name: "Etsy — Code as Craft",
    url: "https://www.etsy.com/codeascraft",
    contribution:
      "Pioneered open postmortem culture in the tech industry. The Morgue open-source tool and their Debriefing Facilitation Guide provided early architectural reference.",
  },
];

const STACK = [
  { name: "Python", role: "Handler scripts, backend logic" },
  { name: "FastAPI", role: "REST API" },
  { name: "Next.js 16", role: "Frontend — public site + admin" },
  { name: "Supabase (Postgres)", role: "Metadata storage" },
  { name: "ChromaDB", role: "Vector search" },
  { name: "FastText", role: "Semantic embeddings" },
  { name: "Groq / Ollama", role: "LLM summarization" },
  { name: "GitHub Actions", role: "Handler automation (cron)" },
  { name: "Vercel", role: "Frontend hosting" },
  { name: "Inter", role: "UI typeface" },
  { name: "JetBrains Mono", role: "Monospace / code font" },
];

export default function AboutPage() {
  return (
    <div style={{  background: "#fff", display: "flex", flexDirection: "column" }}>
  
      {/* Hero */}
      <div style={{ background: "#000", padding: "56px 24px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#FF000F",
              marginBottom: 16,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            About the project
          </p>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              margin: "0 0 20px",
              textTransform: "uppercase",
            }}
          >
            Continuum
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "#777",
              maxWidth: 560,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            A centralized, open repository of software postmortems from across
            the industry — preserved exactly as written, enriched by AI, and
            searchable across companies.
          </p>
        </div>
      </div>
      <div style={{ height: 3, background: "#FF000F" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px", flex: 1 }}>

        {/* Mission */}
        <Section label="Mission">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <div>
              <p style={bodyText}>
                Every major software failure carries a lesson. When companies publish
                postmortems — detailed accounts of what broke, why, and what was
                learned — they contribute to a shared body of engineering knowledge
                that the entire industry can learn from.
              </p>
              <p style={bodyText}>
                The problem is fragmentation. These postmortems live scattered across
                hundreds of engineering blogs, status pages, and documentation sites.
                Finding them requires knowing where to look. Comparing incidents across
                companies is nearly impossible.
              </p>
            </div>
            <div>
              <p style={bodyText}>
                Continuum solves this. It is a single, structured repository of
                industry postmortems — aggregated automatically, searchable
                semantically, and always linking back to the original source.
              </p>
              <p style={bodyText}>
                The original author&apos;s words are never altered. The raw narrative,
                the technical diagrams, the candid timelines — they remain exactly as
                published. AI is used only as a navigational aid: summaries and
                root cause categorization appear in a sidebar, never replacing the
                source material.
              </p>
            </div>
          </div>
        </Section>

        <Divider />

        {/* Philosophy */}
        <Section label="Philosophy">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid #000", background: "#000" }}>
            {[
              {
                title: "Source Mirroring",
                body: "The original incident report is always the primary source of truth. Continuum preserves it exactly — including the author's framing, phrasing, and technical context.",
              },
              {
                title: "Blameless by Design",
                body: "Following Google's SRE principles and Etsy's postmortem culture, Continuum treats every incident as a systemic learning opportunity, not an individual failure.",
              },
              {
                title: "AI as Navigator",
                body: "AI-generated summaries and root cause categories exist to help you find the right postmortem faster. They are explicitly secondary to the original text and clearly labeled as such.",
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  background: "#fff",
                  padding: "28px 24px",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#FF000F",
                    marginBottom: 12,
                    fontFamily: "var(--font-jetbrains), monospace",
                  }}
                >
                  {card.title}
                </p>
                <p style={{ ...bodyText, margin: 0 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* How it works */}
        <Section label="How it works">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {PIPELINE.map((item, i) => (
              <div
                key={item.step}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 160px 1fr",
                  gap: 24,
                  padding: "20px 0",
                  borderBottom: i < PIPELINE.length - 1 ? "1px solid #eee" : "none",
                  alignItems: "start",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#FF000F",
                    fontFamily: "var(--font-jetbrains), monospace",
                    lineHeight: 1,
                  }}
                >
                  {item.step}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    paddingTop: 3,
                  }}
                >
                  {item.label}
                </span>
                <p style={{ ...bodyText, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* Data sources */}
        <Section label="Data Sources & Licensing">
          <p style={{ ...bodyText, marginBottom: 28 }}>
            Continuum respects the intellectual property of every source it
            indexes. The content strategy differs based on the license of each
            source. Copyright-restricted content is represented by metadata and
            a direct link to the original only — no full-text hosting.
          </p>
          <div style={{ border: "1px solid #000" }}>
            {SOURCES.map((s, i) => (
              <div
                key={s.company}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                  padding: "16px 20px",
                  borderBottom: i < SOURCES.length - 1 ? "1px solid #eee" : "none",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.company}</span>
                <span
                  style={{
                    fontSize: 12,
                    color: s.color,
                    fontFamily: "var(--font-jetbrains), monospace",
                  }}
                >
                  {s.license}
                </span>
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: 12,
              color: "#888",
              marginTop: 16,
              fontFamily: "var(--font-jetbrains), monospace",
              lineHeight: 1.6,
            }}
          >
            If you represent a company and have questions about how your content
            is indexed, please open an issue on the project repository.
          </p>
        </Section>

        <Divider />

        {/* Credits */}
        <Section label="Credits & Acknowledgements">
          <div style={{ display: "flex", flexDirection: "column", gap: 1, border: "1px solid #000", background: "#000" }}>
            {CREDITS.map((c) => (
              <div
                key={c.name}
                style={{
                  background: "#fff",
                  padding: "24px",
                  display: "grid",
                  gridTemplateColumns: "220px 1fr",
                  gap: 24,
                  alignItems: "start",
                }}
              >
                <div>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#000",
                      textDecoration: "none",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {c.name} ↗
                  </a>
                </div>
                <p style={{ ...bodyText, margin: 0 }}>{c.contribution}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* Tech stack */}
        <Section label="Tech Stack">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 1,
              border: "1px solid #000",
              background: "#000",
            }}
          >
            {STACK.map((s) => (
              <div
                key={s.name}
                style={{ background: "#fff", padding: "16px 18px" }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    margin: "0 0 4px",
                    fontFamily: "var(--font-jetbrains), monospace",
                  }}
                >
                  {s.name}
                </p>
                <p style={{ fontSize: 12, color: "#666", margin: 0 }}>{s.role}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
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
            Browse postmortems →
          </Link>
        </div>
      </div>

    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 0 }}>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#888",
          marginBottom: 24,
          fontFamily: "var(--font-jetbrains), monospace",
        }}
      >
        {label}
      </p>
      {children}
    </section>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid #eee", margin: "56px 0" }} />;
}

const bodyText: React.CSSProperties = {
  fontSize: 15,
  color: "#333",
  lineHeight: 1.75,
  margin: "0 0 16px",
};
