import type { Severity } from "@/lib/types";

const config: Record<
  NonNullable<Severity>,
  { label: string; color: string; bg: string }
> = {
  critical: { label: "Critical", color: "#FF000F", bg: "#fff0f0" },
  high:     { label: "High",     color: "#cc0000", bg: "#fff5f5" },
  medium:   { label: "Medium",   color: "#555",    bg: "#f5f5f5" },
  low:      { label: "Low",      color: "#888",    bg: "#f9f9f9" },
};

export default function SeverityBadge({
  severity,
}: {
  severity: Severity | null;
}) {
  if (!severity) return null;
  const { label, color, bg } = config[severity];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: bg,
        border: `1px solid ${color}`,
        color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "2px 8px",
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}
