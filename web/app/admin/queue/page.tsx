import type { Metadata } from "next";
import { publishEntry, rejectEntry, deleteEntry } from "../actions";
import type { Postmortem } from "@/lib/types";

export const metadata: Metadata = { title: "Review Queue — Admin" };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

async function getQueue(): Promise<Postmortem[]> {
  try {
    const res = await fetch(`${API_URL}/admin/queue`, {
      headers: { "x-admin-secret": ADMIN_SECRET },
      cache: "no-store",
    });
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function QueuePage() {
  const queue = await getQueue();

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px", fontFamily: "monospace" }}>
            Moderation
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
            Review Queue
          </h1>
        </div>
        <span style={{ fontSize: 13, color: queue.length > 0 ? "#FF000F" : "#444", fontFamily: "monospace" }}>
          {queue.length} pending
        </span>
      </div>

      {queue.length === 0 ? (
        <div style={{ border: "1px dashed #222", padding: "48px 24px", textAlign: "center" }}>
          <p style={{ color: "#444", fontSize: 13, fontFamily: "monospace", margin: 0, letterSpacing: "0.05em" }}>
            Queue is empty — all caught up.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#1a1a1a", border: "1px solid #1a1a1a" }}>
          {queue.map((post) => (
            <div
              key={post.id}
              style={{
                background: "#0f0f0f",
                padding: "20px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 20,
                alignItems: "start",
              }}
            >
              {/* Info */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#FF000F", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    {post.company}
                  </span>
                  <span style={{ fontSize: 11, color: "#333", fontFamily: "monospace" }}>
                    {formatDate(post.published_at)}
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 8px", lineHeight: 1.4 }}>
                  {post.title}
                </p>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: "#444", fontFamily: "monospace", textDecoration: "none", wordBreak: "break-all" }}
                >
                  {post.url}
                </a>
                {post.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                    {post.tags.map((t) => (
                      <span key={t} style={{ fontSize: 10, color: "#444", background: "#1a1a1a", padding: "2px 6px", fontFamily: "monospace" }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                <form action={publishEntry.bind(null, post.id)}>
                  <ActionButton color="#fff" bg="#1a6b1a" label="Publish" />
                </form>
                <form action={rejectEntry.bind(null, post.id)}>
                  <ActionButton color="#FF000F" bg="transparent" border="#FF000F" label="Reject" />
                </form>
                <form action={deleteEntry.bind(null, post.id)}>
                  <ActionButton color="#333" bg="transparent" border="#222" label="Delete" />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  label,
  color,
  bg,
  border,
}: {
  label: string;
  color: string;
  bg: string;
  border?: string;
}) {
  return (
    <button
      type="submit"
      style={{
        background: bg,
        color,
        border: `1px solid ${border ?? bg}`,
        padding: "7px 16px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        cursor: "pointer",
        width: "100%",
        fontFamily: "monospace",
      }}
    >
      {label}
    </button>
  );
}
