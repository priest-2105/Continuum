"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getToken(): Promise<string> {
  const jar = await cookies();
  return jar.get("admin_token")?.value ?? "";
}

export async function publishEntry(id: string) {
  const token = await getToken();
  await fetch(`${API_URL}/admin/${id}/publish`, {
    method: "PATCH",
    headers: { "x-admin-secret": token },
  });
  revalidatePath("/admin/queue");
  revalidatePath("/admin/published");
}

export async function rejectEntry(id: string) {
  const token = await getToken();
  await fetch(`${API_URL}/admin/${id}/reject`, {
    method: "PATCH",
    headers: { "x-admin-secret": token },
  });
  revalidatePath("/admin/queue");
}

export async function deleteEntry(id: string) {
  const token = await getToken();
  await fetch(`${API_URL}/admin/${id}`, {
    method: "DELETE",
    headers: { "x-admin-secret": token },
  });
  revalidatePath("/admin/queue");
  revalidatePath("/admin/published");
}
