"use client";

import { useState, useTransition } from "react";
import { createSource } from "../actions";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AddSourceForm() {
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
      <input type="hidden" name="method" value="statuspage_api" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Company */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Company</label>
          <input
            name="company"
            required
            value={company}
            onChange={(e) => handleCompanyChange(e.target.value)}
            placeholder="Atlassian"
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
            placeholder="atlassian"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Statuspage URL */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Statuspage URL</label>
        <input
          name="config_statuspage_url"
          required
          placeholder="https://status.atlassian.com"
          style={inputStyle}
        />
        <p style={{ fontSize: 10, color: "#333", fontFamily: "monospace", margin: "5px 0 0", letterSpacing: "0.04em" }}>
          Must expose the Atlassian Statuspage API at <span style={{ color: "#555" }}>/api/v2/incidents.json</span>
        </p>
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
