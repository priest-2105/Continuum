"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      secret,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Invalid credentials.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF000F", display: "inline-block" }} />
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Continuum
          </span>
        </div>

        <h1
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            margin: "0 0 6px",
            letterSpacing: "-0.01em",
          }}
        >
          Admin access
        </h1>
        <p
          style={{
            color: "#555",
            fontSize: 13,
            margin: "0 0 32px",
            fontFamily: "'JetBrains Mono Variable', monospace",
          }}
        >
          Enter your admin secret to continue.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin secret"
            required
            autoFocus
            style={{
              background: "#0f0f0f",
              border: "1px solid #222",
              color: "#fff",
              padding: "12px 14px",
              fontSize: 14,
              fontFamily: "'JetBrains Mono Variable', monospace",
              outline: "none",
              width: "100%",
            }}
          />

          {error && (
            <p
              style={{
                color: "#FF000F",
                fontSize: 12,
                margin: 0,
                fontFamily: "'JetBrains Mono Variable', monospace",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#333" : "#FF000F",
              color: "#fff",
              border: "none",
              padding: "12px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%",
              marginTop: 4,
            }}
          >
            {loading ? "Checking..." : "Enter →"}
          </button>
        </form>
      </div>
    </div>
  );
}
