import { notFound } from "next/navigation";
import Link from "next/link";
import CompanyBadge from "@/components/CompanyBadge";
import SeverityBadge from "@/components/SeverityBadge";
import { getPostmortem } from "@/lib/api";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostmortem(id);
  if (!post) return { title: "Not Found — Continuum" };
  return { title: `${post.title} — Continuum` };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PostmortemDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostmortem(id);
  if (!post) notFound();

  return (
    <div style={{ background: "#fff" }}>

      {/* Back link */}
      <div style={{ borderBottom: "1px solid #eee" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px" }}>
          <Link
            href="/postmortems"
            style={{
              fontSize: 12,
              color: "#666",
              textDecoration: "none",
              fontFamily: "var(--font-jetbrains), monospace",
              letterSpacing: "0.05em",
            }}
          >
            ← Back to all
          </Link>
        </div>
      </div>

      {/* Header block */}
      <div style={{ background: "#000", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <CompanyBadge company={post.company} />
            <SeverityBadge severity={post.severity} />
          </div>
          <h1
            style={{
              fontSize: "clamp(24px, 4vw, 42px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.2,
              margin: "0 0 16px",
              letterSpacing: "-0.01em",
            }}
          >
            {post.title}
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#666",
              margin: 0,
              fontFamily: "var(--font-jetbrains), monospace",
              letterSpacing: "0.04em",
            }}
          >
            {formatDate(post.published_at)}
          </p>
        </div>
      </div>

      {/* Red accent bar */}
      <div style={{ height: 3, background: "#FF000F" }} />

      {/* Content area */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 40,
          alignItems: "flex-start",
        }}
      >
        {/* Main column */}
        <main>
          {/* Source block */}
          <div
            style={{
              border: "1px solid #000",
              padding: "32px",
              marginBottom: 32,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#888",
                marginBottom: 16,
                fontFamily: "var(--font-jetbrains), monospace",
              }}
            >
              Original Source
            </p>
            <p
              style={{
                fontSize: 15,
                color: "#333",
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              This postmortem is published on{" "}
              <strong style={{ color: "#000" }}>
                {post.company.charAt(0).toUpperCase() + post.company.slice(1)}
                &apos;s
              </strong>{" "}
              engineering blog. The full incident report — including timelines,
              contributing factors, and action items — is available at the
              original source.
            </p>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#FF000F",
                color: "#fff",
                padding: "12px 22px",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              View original post ↗
            </a>
          </div>

          {/* Metadata table */}
          <div style={{ border: "1px solid #eee" }}>
            <MetaRow label="Company" value={post.company.toUpperCase()} />
            <MetaRow label="Published" value={formatDate(post.published_at)} mono />
            {post.root_cause_category && (
              <MetaRow label="Root Cause" value={post.root_cause_category} />
            )}
            {post.affected_services.length > 0 && (
              <MetaRow
                label="Affected Services"
                value={post.affected_services.join(", ")}
              />
            )}
            {post.tags.length > 0 && (
              <MetaRow label="Tags" value={post.tags.map((t) => `#${t}`).join("  ")} mono />
            )}
            <MetaRow label="Source URL" value={post.url} mono truncate />
          </div>
        </main>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* AI Summary */}
          <div
            style={{
              border: "1px solid #000",
              padding: "24px",
              background: "#fff",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#888",
                marginBottom: 14,
                fontFamily: "var(--font-jetbrains), monospace",
              }}
            >
              AI Summary
            </p>
            {post.ai_summary ? (
              <p
                style={{
                  fontSize: 14,
                  color: "#333",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {post.ai_summary}
              </p>
            ) : (
              <p
                style={{
                  fontSize: 13,
                  color: "#aaa",
                  fontFamily: "var(--font-jetbrains), monospace",
                  margin: 0,
                  letterSpacing: "0.03em",
                }}
              >
                Summary pending generation.
              </p>
            )}
          </div>

          {/* Root cause category */}
          {post.root_cause_category && (
            <div
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "20px 24px",
                background: "#fff",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#888",
                  marginBottom: 10,
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                Root Cause Category
              </p>
              <span
                style={{
                  display: "inline-block",
                  background: "#000",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "5px 12px",
                }}
              >
                {post.root_cause_category}
              </span>
            </div>
          )}

          {/* Disclaimer */}
          <div
            style={{
              border: "1px solid #eee",
              borderTop: "none",
              padding: "16px 24px",
              background: "#f9f9f9",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#aaa",
                lineHeight: 1.6,
                margin: 0,
                fontFamily: "var(--font-jetbrains), monospace",
              }}
            >
              AI-generated summary is for navigation only. Always refer to the
              original source for accuracy.
            </p>
          </div>
        </aside>
      </div>

    </div>
  );
}

function MetaRow({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        borderBottom: "1px solid #eee",
        padding: "12px 16px",
        gap: 16,
        alignItems: "start",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#888",
          fontFamily: "var(--font-jetbrains), monospace",
          paddingTop: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "#222",
          fontFamily: mono ? "var(--font-jetbrains), monospace" : "inherit",
          wordBreak: truncate ? "break-all" : "normal",
          lineHeight: 1.5,
        }}
      >
        {value}
      </span>
    </div>
  );
}
