import { Icon } from "./Icon";

export function MarqueeStrip() {
  const items = [
    "100% Eco-Friendly Products",
    "Satisfaction Guaranteed",
    "Insured & Vetted Staff",
    "Flexible Scheduling",
    "Transparent Pricing",
    "Background-Checked Pros",
    "4.9★ Google Rated",
    "Same-Day Availability",
  ];
  const row = [...items, ...items];
  return (
    <div
      style={{
        background: "var(--eco-green-dark)",
        color: "rgba(255,255,255,0.7)",
        padding: "20px 0",
        overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="marquee-track" style={{ display: "flex", gap: 56, whiteSpace: "nowrap", width: "max-content" }}>
        {row.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 600, letterSpacing: "0.04em" }}>
            <Icon name="leaf" size={14} /> {t}
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
