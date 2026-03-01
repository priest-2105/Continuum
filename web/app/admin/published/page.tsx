import type { Metadata } from "next";
import { deleteEntry } from "../actions";
import type { Postmortem } from "@/lib/types";

export const metadata: Metadata = { title: "Published — Admin" };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

async function getPublished(): Promise<Postmortem[]> {
  try {
    const res = await fetch(`${API_URL}/postmortems/?status=published&limit=100`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function PublishedPage() {
  const entries = await getPublished();

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px", fontFamily: "monospace" }}>
            Archive
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
            Published
          </h1>
        </div>
        <span style={{ fontSize: 13, color: "#555", fontFamily: "monospace" }}>
          {entries.length} total
        </span>
      </div>

      {entries.length === 0 ? (
        <div style={{ border: "1px dashed #222", padding: "48px 24px", textAlign: "center" }}>
          <p style={{ color: "#444", fontSize: 13, fontFamily: "monospace", margin: 0 }}>
            No published entries yet.
          </p>
        </div>
      ) : (
        <div style={{ border: "1px solid #1a1a1a" }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 100px 90px 80px",
              padding: "10px 16px",
              borderBottom: "1px solid #1a1a1a",
              background: "#000",
              gap: 12,
            }}
          >
            {["Company", "Title", "Published", "Tags", ""].map((h) => (
              <span key={h} style={{ fontSize: 10, color: "#333", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {entries.map((post, i) => (
            <div
              key={post.id}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 100px 90px 80px",
                padding: "12px 16px",
                borderBottom: i < entries.length - 1 ? "1px solid #111" : "none",
                alignItems: "center",
                gap: 12,
                background: "#0a0a0a",
              }}
            >
              <span style={{ fontSize: 11, color: "#FF000F", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {post.company}
              </span>
              <div>
                <a
                  href={`/postmortems/${post.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "#ccc", textDecoration: "none", fontWeight: 500, display: "block", lineHeight: 1.3 }}
                >
                  {post.title}
                </a>
                <span style={{ fontSize: 10, color: "#333", fontFamily: "monospace" }}>{post.id}</span>
              </div>
              <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>
                {formatDate(post.published_at)}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {post.tags.slice(0, 2).map((t) => (
                  <span key={t} style={{ fontSize: 10, color: "#333", background: "#111", padding: "1px 5px", fontFamily: "monospace" }}>
                    #{t}
                  </span>
                ))}
              </div>
              <form action={deleteEntry.bind(null, post.id)}>
                <button
                  type="submit"
                  style={{
                    background: "transparent",
                    border: "1px solid #222",
                    color: "#444",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    width: "100%",
                  }}
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
