"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

async function assertAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

export async function publishEntry(id: string) {
  await assertAdmin();
  await fetch(`${API_URL}/admin/${id}/publish`, {
    method: "PATCH",
    headers: { "x-admin-secret": ADMIN_SECRET },
  });
  revalidatePath("/admin/queue");
  revalidatePath("/admin/published");
}

export async function rejectEntry(id: string) {
  await assertAdmin();
  await fetch(`${API_URL}/admin/${id}/reject`, {
    method: "PATCH",
    headers: { "x-admin-secret": ADMIN_SECRET },
  });
  revalidatePath("/admin/queue");
}

export async function deleteEntry(id: string) {
  await assertAdmin();
  await fetch(`${API_URL}/admin/${id}`, {
    method: "DELETE",
    headers: { "x-admin-secret": ADMIN_SECRET },
  });
  revalidatePath("/admin/queue");
  revalidatePath("/admin/published");
}

export async function bulkPublish(ids: string[]) {
  await assertAdmin();
  await fetch(`${API_URL}/admin/bulk-publish`, {
    method: "POST",
    headers: { "x-admin-secret": ADMIN_SECRET, "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  revalidatePath("/admin/queue");
  revalidatePath("/admin/published");
}

export async function bulkReject(ids: string[]) {
  await assertAdmin();
  await fetch(`${API_URL}/admin/bulk-reject`, {
    method: "POST",
    headers: { "x-admin-secret": ADMIN_SECRET, "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  revalidatePath("/admin/queue");
}

export async function createSource(formData: FormData) {
  await assertAdmin();
  const method = formData.get("method") as string;
  const config: Record<string, string> = {};
  if (method === "github_json") {
    const githubUrl = (formData.get("config_github_url") as string) ?? "";
    const m = githubUrl.match(/github\.com\/([^/]+\/[^/]+)\/blob\/([^/]+)\/(.+)/);
    if (!m) throw new Error("Invalid GitHub file URL");
    config.repo   = m[1];
    config.branch = m[2];
    config.file   = m[3];
    const sinceDate = ((formData.get("config_since_date") as string) ?? "").trim();
    if (sinceDate) config.since_date = sinceDate.includes("T") ? sinceDate : sinceDate + "T00:00:00Z";
  } else if (method === "rss") {
    config.feed_url = formData.get("config_feed_url") as string;
  } else if (method === "scrape") {
    config.url = formData.get("config_url") as string;
    config.selector = formData.get("config_selector") as string;
  } else if (method === "statuspage_api") {
    config.statuspage_url = formData.get("config_statuspage_url") as string;
  }
  const res = await fetch(`${API_URL}/admin/sources`, {
    method: "POST",
    headers: { "x-admin-secret": ADMIN_SECRET, "Content-Type": "application/json" },
    body: JSON.stringify({
      company: formData.get("company"),
      slug: formData.get("slug"),
      method,
      config,
      active: true,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? "Failed to create source");
  }
  revalidatePath("/admin/sources");
}

export async function deleteSource(id: string) {
  await assertAdmin();
  await fetch(`${API_URL}/admin/sources/${id}`, {
    method: "DELETE",
    headers: { "x-admin-secret": ADMIN_SECRET },
  });
  revalidatePath("/admin/sources");
}

export async function syncSource(id: string) {
  await assertAdmin();
  await fetch(`${API_URL}/admin/sources/${id}/sync`, {
    method: "POST",
    headers: { "x-admin-secret": ADMIN_SECRET },
  });
  revalidatePath("/admin/sources");
  revalidatePath("/admin/queue");
}
