"use client";

import { useState } from "react";

interface SyncEvent {
  type: string;
  message?: string;
  total?: number;
  sampling?: number;
  done?: number;
  created?: number;
  title?: string;
  id?: string;
  severity?: string;
}

interface Stats {
  commits: number;
  sampling: number;
  fetched: number;
  created: number;
}

export default function SyncButton({ sourceId }: { sourceId: string }) {
  const [phase, setPhase] = useState<"idle" | "running" | "done" | "error">("idle");
  const [log, setLog] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ commits: 0, sampling: 0, fetched: 0, created: 0 });

  function addLog(line: string) {
    setLog((prev) => [...prev, line]);
  }

  function handleEvent(event: SyncEvent) {
    switch (event.type) {
      case "start":
        addLog(event.message ?? "Starting...");
        break;
      case "commits_page":
        setStats((s) => ({ ...s, commits: event.total ?? s.commits }));
        break;
      case "commits_done":
        setStats((s) => ({
          ...s,
          commits: event.total ?? s.commits,
          sampling: event.sampling ?? s.sampling,
        }));
        addLog(event.message ?? `Found ${event.total} commits`);
        break;
      case "fetching":
        setStats((s) => ({
          ...s,
          fetched: event.done ?? s.fetched,
          sampling: event.total ?? s.sampling,
        }));
        break;
      case "incident":
        setStats((s) => ({ ...s, created: s.created + 1 }));
        addLog(`+ ${event.title}`);
        break;
      case "done":
        setStats((s) => ({ ...s, created: event.created ?? s.created }));
        addLog(`Done — ${event.created ?? 0} new entries`);
        setPhase("done");
        break;
      case "error":
        addLog(`Error: ${event.message}`);
        setPhase("error");
        break;
    }
  }

  async function startSync() {
    if (phase === "running") return;
    setPhase("running");
    setLog([]);
    setStats({ commits: 0, sampling: 0, fetched: 0, created: 0 });

    try {
      const res = await fetch(`/api/admin/sync/${sourceId}`, { method: "POST" });
      if (!res.ok || !res.body) {
        addLog(`Request failed (${res.status})`);
        setPhase("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            handleEvent(JSON.parse(line.slice(6)));
          } catch {
            // ignore malformed lines
          }
        }
      }
    } catch (err) {
      addLog(`Connection error: ${(err as Error).message}`);
      setPhase("error");
    }
  }

  const progressPct =
    stats.sampling > 0 ? Math.round((stats.fetched / stats.sampling) * 100) : 0;

  const btnColor = phase === "error" ? "#FF000F" : "#fff";
  const btnBorder = phase === "error" ? "#FF000F" : "#333";

  return (
    <div>
      <button
        onClick={startSync}
        disabled={phase === "running"}
        style={{
          background: "transparent",
          color: btnColor,
          border: `1px solid ${btnBorder}`,
          padding: "7px 14px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: phase === "running" ? "not-allowed" : "pointer",
          fontFamily: "monospace",
          opacity: phase === "running" ? 0.6 : 1,
          whiteSpace: "nowrap",
        }}
      >
        {phase === "running" ? "Syncing…" : phase === "done" ? "Synced ✓" : phase === "error" ? "Error" : "Sync"}
      </button>

      {phase !== "idle" && (
        <div
          style={{
            marginTop: 10,
            padding: "12px 14px",
            background: "#060606",
            border: "1px solid #1a1a1a",
            fontFamily: "monospace",
            fontSize: 11,
            minWidth: 320,
          }}
        >
          {/* Stats row */}
          {(stats.commits > 0 || stats.created > 0) && (
            <div style={{ display: "flex", gap: 16, marginBottom: 8, color: "#555", fontSize: 10 }}>
              {stats.commits > 0 && <span>{stats.commits} commits</span>}
              {stats.sampling > 0 && stats.sampling !== stats.commits && (
                <span>→ {stats.sampling} sampled</span>
              )}
              {stats.sampling > 0 && stats.fetched > 0 && (
                <span>{stats.fetched}/{stats.sampling} fetched</span>
              )}
              <span style={{ color: "#FF000F", marginLeft: "auto" }}>
                {stats.created} new
              </span>
            </div>
          )}

          {/* Progress bar */}
          {phase === "running" && stats.sampling > 0 && (
            <div style={{ background: "#1a1a1a", height: 2, marginBottom: 10 }}>
              <div
                style={{
                  background: "#FF000F",
                  height: "100%",
                  width: `${progressPct}%`,
                  transition: "width 0.2s ease",
                }}
              />
            </div>
          )}

          {/* Log */}
          <div
            style={{
              maxHeight: 140,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {log.map((line, i) => (
              <span
                key={i}
                style={{
                  color: line.startsWith("+")
                    ? "#888"
                    : line.startsWith("Error") || line.startsWith("Connection")
                    ? "#FF000F"
                    : line.startsWith("Done")
                    ? "#aaa"
                    : "#444",
                }}
              >
                {line}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
