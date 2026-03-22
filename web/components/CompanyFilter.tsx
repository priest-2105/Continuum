"use client";

import { useState } from "react";
import Link from "next/link";

const SHOW_LIMIT = 8;

interface Props {
  companies: string[];
  activeCompany: string | undefined;
  buildUrl: (company: string | undefined) => string;
}

export default function CompanyFilter({ companies, activeCompany, buildUrl }: Props) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = companies.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const visible = expanded || search ? filtered : filtered.slice(0, SHOW_LIMIT);
  const hasMore = !search && filtered.length > SHOW_LIMIT;

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "6px 8px",
          fontSize: 11,
          fontFamily: "var(--font-jetbrains), monospace",
          border: "1px solid #ddd",
          borderRadius: 0,
          outline: "none",
          marginBottom: 6,
          boxSizing: "border-box",
          letterSpacing: "0.05em",
        }}
      />

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {!search && (
          <FilterLink
            label="All"
            href={buildUrl(undefined)}
            active={!activeCompany}
          />
        )}
        {visible.map((c) => (
          <FilterLink
            key={c}
            label={c}
            href={buildUrl(c)}
            active={activeCompany === c}
          />
        ))}
        {filtered.length === 0 && (
          <p style={{ fontSize: 11, color: "#aaa", margin: "4px 0 0 10px", fontFamily: "var(--font-jetbrains), monospace" }}>
            No match
          </p>
        )}
      </div>

      {/* Expand / collapse */}
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            marginTop: 6,
            background: "none",
            border: "none",
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#FF000F",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {expanded ? "Show less ↑" : `+${filtered.length - SHOW_LIMIT} more ↓`}
        </button>
      )}
    </div>
  );
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        color: active ? "#fff" : "#333",
        background: active ? "#000" : "transparent",
        textDecoration: "none",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        borderLeft: active ? "3px solid #FF000F" : "3px solid transparent",
      }}
    >
      {label}
    </Link>
  );
}
