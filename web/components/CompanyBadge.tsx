export default function CompanyBadge({ company }: { company: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "#FF000F",
        fontFamily: "inherit",
      }}
    >
      {company}
    </span>
  );
}
