import { Counter } from "nuueco";

const stat = {
  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  textAlign: "center" as const,
  padding: 24,
};
const num = {
  fontSize: 48,
  fontWeight: 800,
  color: "var(--eco-green)",
  letterSpacing: "-0.02em",
};
const label = { color: "var(--eco-muted)", fontWeight: 600, marginTop: 4 };

// Counter eases from 0 to `to` when scrolled into view; `suffix` appends a unit.
// In a static preview we want the settled final value, so `duration` is set tiny
// (the live site uses the default ~1400ms ease) — this also makes the card render
// deterministic instead of catching a mid-animation frame.
export function HomesCleaned() {
  return (
    <div style={stat}>
      <div style={num}><Counter to={4800} suffix="+" duration={1} /></div>
      <div style={label}>Homes cleaned</div>
    </div>
  );
}

export function Satisfaction() {
  return (
    <div style={stat}>
      <div style={num}><Counter to={98} suffix="%" duration={1} /></div>
      <div style={label}>Customer satisfaction</div>
    </div>
  );
}
