import { ImageResponse } from "next/og";
import { getPostmortem } from "@/lib/api";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#FF000F",
  high: "#FF000F",
  medium: "#888",
  low: "#555",
  unknown: "#444",
};

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostmortem(id);

  // Fallback image if postmortem not found
  if (!post) {
    return new ImageResponse(
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>CONTINUUM</span>
      </div>,
      { ...size }
    );
  }

  const severity = (post.severity ?? "unknown").toLowerCase();
  const severityColor = SEVERITY_COLOR[severity] ?? "#555";
  const company = post.company.toUpperCase();
  const title = truncate(post.title, 90);
  const affected = (post.affected_services ?? []).slice(0, 3).join(", ");

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 80px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Top row: company + severity | wordmark */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Company badge */}
          <div
            style={{
              background: "#FF000F",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "6px 14px",
            }}
          >
            {company}
          </div>
          {/* Severity badge */}
          <div
            style={{
              border: `1px solid ${severityColor}`,
              color: severityColor,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "5px 12px",
            }}
          >
            {severity.toUpperCase()}
          </div>
        </div>

        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#FF000F",
            }}
          />
          <span
            style={{
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            CONTINUUM
          </span>
        </div>
      </div>

      {/* Main title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div
          style={{
            color: "#fff",
            fontSize: title.length > 60 ? 44 : 54,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
      </div>

      {/* Bottom: date + affected + red bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
          {post.published_at && (
            <span style={{ color: "#555", fontSize: 14, letterSpacing: "0.04em" }}>
              {formatDate(post.published_at)}
            </span>
          )}
          {affected && (
            <span style={{ color: "#444", fontSize: 14, letterSpacing: "0.04em" }}>
              Affected: {affected}
            </span>
          )}
        </div>
        <div style={{ height: 3, background: "#FF000F", width: "100%" }} />
      </div>
    </div>,
    { ...size }
  );
}
