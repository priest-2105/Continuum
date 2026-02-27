import Link from "next/link";
import type { Postmortem } from "@/lib/types";
import CompanyBadge from "./CompanyBadge";
import SeverityBadge from "./SeverityBadge";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PostmortemCard({ post }: { post: Postmortem }) {
  return (
    <Link
      href={`/postmortems/${post.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <article
        style={{
          border: "1px solid #000",
          padding: "20px 22px",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          cursor: "pointer",
          transition: "box-shadow 0.15s",
          height: "100%",
        }}
        className="hover:shadow-[4px_4px_0px_#000] transition-shadow"
      >
        {/* Top row: company + severity */}
        <div className="flex items-center justify-between gap-2">
          <CompanyBadge company={post.company} />
          <SeverityBadge severity={post.severity} />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1.4,
            margin: 0,
            color: "#000",
            flexGrow: 1,
          }}
        >
          {post.title}
        </h3>

        {/* Date */}
        <p
          style={{
            fontSize: 12,
            color: "#666",
            margin: 0,
            fontFamily: "var(--font-jetbrains), monospace",
            letterSpacing: "0.03em",
          }}
        >
          {formatDate(post.published_at)}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  color: "#555",
                  background: "#f0f0f0",
                  padding: "2px 7px",
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#FF000F",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: "auto",
          }}
        >
          View →
        </div>
      </article>
    </Link>
  );
}
