import { Reveal } from "nuueco";

const font = '"Plus Jakarta Sans", system-ui, sans-serif';

// Reveal wraps any content for a scroll-triggered fade/slide-in. In view it adds
// the `.in` class and settles to its final, fully-visible state.
export function Card() {
  return (
    <div style={{ padding: 24, maxWidth: 440, fontFamily: font }}>
      <Reveal>
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--eco-line)",
            borderRadius: 18,
            padding: 24,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <span className="eyebrow">Eco-friendly</span>
          <h3 style={{ margin: "8px 0", color: "var(--eco-ink)" }}>Plant-based deep clean</h3>
          <p style={{ color: "var(--eco-muted)", margin: 0 }}>
            Non-toxic products, spotless results — gentle on your home and the planet.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

// Stagger siblings with `delay` (ms) to cascade them in.
export function Staggered() {
  const items = ["Healthier air", "Safer for pets", "Greener earth"];
  return (
    <div style={{ padding: 24, display: "grid", gap: 12, fontFamily: font }}>
      {items.map((t, i) => (
        <Reveal key={t} delay={i * 120}>
          <div
            style={{
              background: "var(--eco-cream-2)",
              borderRadius: 12,
              padding: "14px 18px",
              fontWeight: 600,
              color: "var(--eco-green-dark)",
            }}
          >
            {t}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
