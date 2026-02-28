"use client";

import { useState, useTransition } from "react";
import { createSource } from "../actions";

const METHODS = [
  { value: "github_json", label: "GitHub JSON" },
  { value: "rss", label: "RSS Feed" },
  { value: "scrape", label: "Web Scrape" },
  { value: "statuspage_api", label: "Statuspage API" },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AddSourceForm() {
  const [method, setMethod] = useState("github_json");
  const [company, setCompany] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCompanyChange(val: string) {
    setCompany(val);
    if (!slugTouched) setSlug(slugify(val));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createSource(fd);
        (e.target as HTMLFormElement).reset();
        setCompany("");
        setSlug("");
        setSlugTouched(false);
        setMethod("github_json");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create source");
      }
    });
  }

  const inputStyle: React.CSSProperties = {
    background: "#0f0f0f",
    border: "1px solid #222",
    color: "#fff",
    padding: "8px 10px",
    fontSize: 13,
    fontFamily: "monospace",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    color: "#444",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    marginBottom: 5,
    fontFamily: "monospace",
  };

  const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 0 };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
        {/* Company */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Company</label>
          <input
            name="company"
            required
            value={company}
            onChange={(e) => handleCompanyChange(e.target.value)}
            placeholder="Cloudflare"
            style={inputStyle}
          />
        </div>

        {/* Slug */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Slug</label>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            placeholder="cloudflare"
            style={inputStyle}
          />
        </div>

        {/* Method */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Method</label>
          <select
            name="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic config fields */}
      <div style={{ marginTop: 12 }}>
        {method === "github_json" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Repo (owner/name)</label>
              <input
                name="config_repo"
                required
                placeholder="outages/cloudflare-outages"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>File path</label>
              <input
                name="config_file"
                required
                placeholder="cloudflare_outages.json"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {method === "rss" && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Feed URL</label>
            <input
              name="config_feed_url"
              required
              placeholder="https://example.com/feed.xml"
              style={inputStyle}
            />
          </div>
        )}

        {method === "scrape" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>URL</label>
              <input
                name="config_url"
                required
                placeholder="https://example.com/incidents"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>CSS Selector</label>
              <input
                name="config_selector"
                required
                placeholder=".incident-item"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {method === "statuspage_api" && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Status Page URL</label>
            <input
              name="config_statuspage_url"
              required
              placeholder="https://status.example.com"
              style={inputStyle}
            />
          </div>
        )}
      </div>

      {error && (
        <p style={{ fontSize: 12, color: "#FF000F", fontFamily: "monospace", margin: "10px 0 0" }}>{error}</p>
      )}

      <div style={{ marginTop: 14 }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            background: isPending ? "#1a1a1a" : "#FF000F",
            color: "#fff",
            border: "none",
            padding: "9px 20px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: isPending ? "not-allowed" : "pointer",
            fontFamily: "monospace",
          }}
        >
          {isPending ? "Adding…" : "Add Source"}
        </button>
      </div>
    </form>
  );
}
