import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Continuum",
    template: "%s — Continuum",
  },
  description:
    "A centralized repository of software postmortems from across the industry — preserved as written.",
  icons: {
    icon: "/continuum-favicon.svg",
    shortcut: "/continuum-favicon.svg",
  },
  openGraph: {
    title: "Continuum",
    description: "Industry postmortems, preserved as written.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{ fontFamily: "'Inter Variable', Inter, system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
