export default function EmptyState({ message }: { message?: string }) {
  return (
    <div
      style={{
        border: "1px dashed #ccc",
        padding: "48px 24px",
        textAlign: "center",
        color: "#888",
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontFamily: "var(--font-jetbrains), monospace",
          margin: 0,
          letterSpacing: "0.05em",
        }}
      >
        {message ?? "No postmortems found."}
      </p>
    </div>
  );
}
