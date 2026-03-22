"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Props {
  postId: string;
  cachedSummary: string | null;
}

export default function AISummary({ postId, cachedSummary }: Props) {
  const [summary, setSummary] = useState<string | null>(cachedSummary);
  const [loading, setLoading] = useState(!cachedSummary);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cachedSummary) return;

    let cancelled = false;

    fetch(`${API_URL}/postmortems/${postId}/summary`, { method: "POST" })
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setSummary(data.summary);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [postId, cachedSummary]);

  if (loading) {
    return (
      <p style={{ fontSize: 13, color: "#aaa", fontFamily: "var(--font-jetbrains), monospace", margin: 0, letterSpacing: "0.03em" }}>
        Generating summary<span className="dots">...</span>
      </p>
    );
  }

  if (error || !summary) {
    return (
      <p style={{ fontSize: 13, color: "#aaa", fontFamily: "var(--font-jetbrains), monospace", margin: 0, letterSpacing: "0.03em" }}>
        Summary unavailable.
      </p>
    );
  }

  return (
    <p style={{ fontSize: 14, color: "#333", lineHeight: 1.7, margin: 0 }}>
      {summary}
    </p>
  );
}
