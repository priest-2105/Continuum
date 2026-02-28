"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  async function handleLogout() {
    await signOut({ redirectTo: "/admin/login" });
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
