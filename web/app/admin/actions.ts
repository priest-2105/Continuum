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
  const config: Record<string, string> = {
    statuspage_url: formData.get("config_statuspage_url") as string,
  };
  const res = await fetch(`${API_URL}/admin/sources`, {
    method: "POST",
    headers: { "x-admin-secret": ADMIN_SECRET, "Content-Type": "application/json" },
    body: JSON.stringify({
      company: formData.get("company"),
      slug: formData.get("slug"),
      method: "statuspage_api",
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
