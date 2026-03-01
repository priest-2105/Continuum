"use client";

import { useState, useTransition, useMemo } from "react";
import { publishEntry, rejectEntry, deleteEntry, bulkPublish, bulkReject } from "../actions";
import type { Postmortem } from "@/lib/types";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#FF000F",
  high: "#cc4400",
  medium: "#888",
  low: "#555",
};

export default function QueueList({ queue }: { queue: Postmortem[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filterCompany, setFilterCompany] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "company">("date_desc");
  const [isPending, startTransition] = useTransition();

  const companies = useMemo(
    () => Array.from(new Set(queue.map((p) => p.company))).sort(),
    [queue]
  );

  const filtered = useMemo(() => {
    let list = [...queue];
    if (filterCompany) list = list.filter((p) => p.company === filterCompany);
    if (filterSeverity) list = list.filter((p) => p.severity === filterSeverity);
    if (sortBy === "date_desc") list.sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    else if (sortBy === "date_asc") list.sort((a, b) => (a.published_at ?? "").localeCompare(b.published_at ?? ""));
    else if (sortBy === "company") list.sort((a, b) => a.company.localeCompare(b.company));
    return list;
  }, [queue, filterCompany, filterSeverity, sortBy]);

  const filteredIds = filtered.map((p) => p.id);
  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...filteredIds]));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedCount = [...selected].filter((id) => filteredIds.includes(id)).length;

  const selectStyle: React.CSSProperties = {
    background: "#0f0f0f",
    border: "1px solid #222",
    color: "#fff",
    padding: "6px 10px",
    fontSize: 11,
    fontFamily: "monospace",
    cursor: "pointer",
    letterSpacing: "0.05em",
  };

  return (
    <div>
      {/* Filter / sort bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} style={selectStyle}>
          <option value="">All companies</option>
          {companies.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} style={selectStyle}>
          <option value="">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} style={selectStyle}>
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="company">Company A–Z</option>
        </select>

        <span style={{ fontSize: 11, color: "#444", fontFamily: "monospace", marginLeft: "auto" }}>
          {filtered.length} shown
        </span>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div style={{ background: "#1a1a1a", border: "1px solid #333", padding: "10px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>
            {selectedCount} selected
          </span>
          <button
            disabled={isPending}
            onClick={() => startTransition(async () => {
              const ids = [...selected].filter((id) => filteredIds.includes(id));
              await bulkPublish(ids);
              setSelected(new Set());
            })}
            style={{ background: "#1a6b1a", color: "#fff", border: "none", padding: "6px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: isPending ? "not-allowed" : "pointer", fontFamily: "monospace" }}
          >
            Publish all
          </button>
          <button
            disabled={isPending}
            onClick={() => startTransition(async () => {
              const ids = [...selected].filter((id) => filteredIds.includes(id));
              await bulkReject(ids);
              setSelected(new Set());
            })}
            style={{ background: "transparent", color: "#FF000F", border: "1px solid #FF000F", padding: "6px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: isPending ? "not-allowed" : "pointer", fontFamily: "monospace" }}
          >
            Reject all
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ border: "1px dashed #222", padding: "48px 24px", textAlign: "center" }}>
          <p style={{ color: "#444", fontSize: 13, fontFamily: "monospace", margin: 0 }}>
            {queue.length === 0 ? "Queue is empty — all caught up." : "No items match the current filters."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#1a1a1a", border: "1px solid #1a1a1a" }}>
          {/* Select-all header */}
          <div style={{ background: "#0a0a0a", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #1a1a1a" }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              style={{ cursor: "pointer", accentColor: "#FF000F" }}
            />
            <span style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Select all ({filtered.length})
            </span>
          </div>

          {filtered.map((post) => (
            <div key={post.id} style={{ background: "#0f0f0f" }}>
              {/* Row */}
              <div style={{ padding: "18px 20px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "start" }}>
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selected.has(post.id)}
                  onChange={() => toggleOne(post.id)}
                  style={{ marginTop: 3, cursor: "pointer", accentColor: "#FF000F" }}
                />

                {/* Info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#FF000F", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      {post.company}
                    </span>
                    {post.severity && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: SEVERITY_COLOR[post.severity] ?? "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {post.severity}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "#333", fontFamily: "monospace" }}>
                      {formatDate(post.published_at)}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 6px", lineHeight: 1.4 }}>
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
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                      {post.tags.map((t) => (
                        <span key={t} style={{ fontSize: 10, color: "#444", background: "#1a1a1a", padding: "2px 6px", fontFamily: "monospace" }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                  <button
                    onClick={() => toggleExpand(post.id)}
                    style={{ background: "transparent", color: "#888", border: "1px solid #222", padding: "6px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "monospace" }}
                  >
                    {expanded.has(post.id) ? "Hide" : "View"}
                  </button>
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

              {/* Expanded detail */}
              {expanded.has(post.id) && (
                <div style={{ borderTop: "1px solid #1a1a1a", padding: "16px 20px 20px", background: "#0a0a0a" }}>
                  <table style={{ fontSize: 11, fontFamily: "monospace", borderCollapse: "collapse", width: "100%", marginBottom: 14 }}>
                    <tbody>
                      {[
                        ["ID", post.id],
                        ["Company", post.company],
                        ["Severity", post.severity ?? "—"],
                        ["Published at", formatDate(post.published_at)],
                        ["Tags", post.tags.join(", ") || "—"],
                      ].map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ color: "#444", paddingRight: 24, paddingBottom: 4, whiteSpace: "nowrap" }}>{k}</td>
                          <td style={{ color: "#aaa", paddingBottom: 4 }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF000F", fontFamily: "monospace", textDecoration: "none", border: "1px solid #FF000F", padding: "5px 12px" }}
                  >
                    View source →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({ label, color, bg, border }: { label: string; color: string; bg: string; border?: string }) {
  return (
    <button
      type="submit"
      style={{
        background: bg,
        color,
        border: `1px solid ${border ?? bg}`,
        padding: "6px 14px",
        fontSize: 10,
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
