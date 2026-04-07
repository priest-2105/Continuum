import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Continuum — Industry postmortems, preserved as written";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Top: wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#FF000F",
          }}
        />
        <span
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          CONTINUUM
        </span>
      </div>

      {/* Center: main copy */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            color: "#FF000F",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          PUBLIC POSTMORTEM REPOSITORY
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Software failures,
          <br />
          preserved as written.
        </div>
        <div
          style={{
            color: "#666",
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.5,
            marginTop: 8,
          }}
        >
          Real incidents. Real resolutions. Across the industry.
        </div>
      </div>

      {/* Bottom: red bar + url */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            color: "#444",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.08em",
          }}
        >
          continuum.fawazbailey.com
        </div>
        <div style={{ height: 3, background: "#FF000F", width: "100%" }} />
      </div>
    </div>,
    { ...size }
  );
}
