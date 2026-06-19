import { Icon } from "nuueco";

const wrap = {
  display: "flex",
  gap: 18,
  alignItems: "center",
  flexWrap: "wrap" as const,
  padding: 24,
  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
};

// The full inline-SVG set, swept at brand green — the canonical "what icons do I
// have" gallery a design author reaches for first.
export function Gallery() {
  const names = [
    "leaf", "sparkles", "shield", "calendar", "clock", "check-circle",
    "star", "droplet", "wind", "spray", "phone", "map-pin",
  ] as const;
  return (
    <div style={{ ...wrap, color: "var(--eco-green)" }}>
      {names.map((n) => <Icon key={n} name={n} size={28} />)}
    </div>
  );
}

// `size` is the primary scale axis.
export function Sizes() {
  return (
    <div style={{ ...wrap, color: "var(--eco-green-dark)" }}>
      {[16, 20, 28, 40, 56].map((s) => <Icon key={s} name="leaf" size={s} />)}
    </div>
  );
}

// Icons inherit `currentColor` — recolor via style/className with the brand tokens.
export function Colors() {
  return (
    <div style={wrap}>
      <Icon name="sparkles" size={34} style={{ color: "var(--eco-green)" }} />
      <Icon name="award" size={34} style={{ color: "var(--eco-accent)" }} />
      <Icon name="shield" size={34} style={{ color: "var(--eco-muted)" }} />
      <Icon name="leaf" size={34} style={{ color: "var(--eco-green-light)" }} />
    </div>
  );
}
