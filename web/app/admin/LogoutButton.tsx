"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "transparent",
        border: "1px solid #333",
        color: "#666",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "5px 12px",
        cursor: "pointer",
        fontFamily: "'JetBrains Mono Variable', monospace",
      }}
    >
      Logout
    </button>
  );
}
