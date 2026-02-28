import type { Metadata } from "next";
import { deleteSource, syncSource } from "../actions";
import AddSourceForm from "./AddSourceForm";

export const metadata: Metadata = { title: "Sources — Admin" };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

interface Source {
  id: string;
  company: string;
  slug: string;
  method: string;
  config: Record<string, string>;
  active: boolean;
  last_synced_at: string | null;
  created_at: string;
}

async function getSources(): Promise<Source[]> {
  try {
    const res = await fetch(`${API_URL}/admin/sources`, {
      headers: { "x-admin-secret": ADMIN_SECRET },
      cache: "no-store",
    });
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "never";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const METHOD_LABEL: Record<string, string> = {
  github_json: "GitHub JSON",
  rss: "RSS",
  scrape: "Scrape",
  statuspage_api: "Statuspage API",
};

export default async function SourcesPage() {
  const sources = await getSources();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px", fontFamily: "monospace" }}>
          Configuration
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
          Sources
        </h1>
      </div>

      {/* Add form */}
      <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "24px", marginBottom: 32 }}>
        <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 16px", fontFamily: "monospace" }}>
          Add Source
        </p>
        <AddSourceForm />
      </div>

      {/* Sources table */}
      {sources.length === 0 ? (
        <div style={{ border: "1px dashed #222", padding: "48px 24px", textAlign: "center" }}>
          <p style={{ color: "#444", fontSize: 13, fontFamily: "monospace", margin: 0, letterSpacing: "0.05em" }}>
            No sources configured yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#1a1a1a", border: "1px solid #1a1a1a" }}>
          {sources.map((src) => (
            <div
              key={src.id}
              style={{
                background: "#0f0f0f",
                padding: "18px 20px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 20,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#FF000F", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    {src.company}
                  </span>
                  <span style={{ fontSize: 10, color: "#333", fontFamily: "monospace", background: "#1a1a1a", padding: "1px 6px" }}>
                    {METHOD_LABEL[src.method] ?? src.method}
                  </span>
                  {!src.active && (
                    <span style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>inactive</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "#888", fontFamily: "monospace", margin: "0 0 4px" }}>
                  /{src.slug}
                </p>
                {src.method === "github_json" && src.config.repo && (
                  <p style={{ fontSize: 11, color: "#444", fontFamily: "monospace", margin: 0 }}>
                    {src.config.repo} → {src.config.file}
                  </p>
                )}
                <p style={{ fontSize: 10, color: "#333", fontFamily: "monospace", margin: "4px 0 0" }}>
                  last sync: {formatDate(src.last_synced_at)}
                </p>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <form action={syncSource.bind(null, src.id)}>
                  <button
                    type="submit"
                    style={{
                      background: "transparent",
                      color: "#fff",
                      border: "1px solid #333",
                      padding: "7px 14px",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}
                  >
                    Sync
                  </button>
                </form>
                <form action={deleteSource.bind(null, src.id)}>
                  <button
                    type="submit"
                    style={{
                      background: "transparent",
                      color: "#FF000F",
                      border: "1px solid #FF000F",
                      padding: "7px 14px",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
