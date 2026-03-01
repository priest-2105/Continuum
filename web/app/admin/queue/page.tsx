import type { Metadata } from "next";
import type { Postmortem } from "@/lib/types";
import QueueList from "./QueueList";

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

      <QueueList queue={queue} />
    </div>
  );
}
