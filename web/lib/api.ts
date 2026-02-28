import type { Postmortem } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface PostmortemsResult {
  data: Postmortem[];
  total: number;
}

export async function getPostmortems(params?: {
  company?: string;
  severity?: string;
  sort_by?: string;
  sort_dir?: string;
  limit?: number;
  offset?: number;
}): Promise<PostmortemsResult> {
  const url = new URL(`${API_URL}/postmortems/`);
  if (params?.company) url.searchParams.set("company", params.company);
  if (params?.severity) url.searchParams.set("severity", params.severity);
  if (params?.sort_by) url.searchParams.set("sort_by", params.sort_by);
  if (params?.sort_dir) url.searchParams.set("sort_dir", params.sort_dir);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return { data: [], total: 0 };
    return res.json();
  } catch {
    return { data: [], total: 0 };
  }
}

export async function getPostmortem(id: string): Promise<Postmortem | null> {
  try {
    const res = await fetch(`${API_URL}/postmortems/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getCompanies(): Promise<string[]> {
  const result = await getPostmortems({ limit: 100 });
  return [...new Set(result.data.map((p) => p.company))].sort();
}
