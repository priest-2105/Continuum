import type { Postmortem } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getPostmortems(params?: {
  company?: string;
  limit?: number;
  offset?: number;
}): Promise<Postmortem[]> {
  const url = new URL(`${API_URL}/postmortems`);
  if (params?.company) url.searchParams.set("company", params.company);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getPostmortem(id: string): Promise<Postmortem | null> {
  try {
    const res = await fetch(`${API_URL}/postmortems/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getCompanies(): Promise<string[]> {
  const postmortems = await getPostmortems({ limit: 100 });
  return [...new Set(postmortems.map((p) => p.company))].sort();
}
