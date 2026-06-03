import { useMemo } from "react";
import { Icon, type IconName } from "../../components/Icon";
import { Reveal } from "../../components/Reveal";
import { SERVICES } from "../../data/content";
import { useGo } from "../../lib/nav";
import { Row } from "./Row";
import type { BookingData } from "./types";

export function BookingConfirmed({ data, total }: { data: BookingData; total: number }) {
  const go = useGo();
  const ref = useMemo(() => "EC" + Math.floor(Math.random() * 900000 + 100000), []);
  const svc = SERVICES.find((s) => s.id === data.service) ?? SERVICES[0];
  const dateStr = data.date
    ? data.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  const steps: { i: IconName; t: string }[] = [
    { i: "phone", t: "We'll confirm by phone or email within 24 hours" },
    { i: "map-pin", t: "Ensure access to your property at the scheduled time" },
    { i: "sparkles", t: "Sit back — your eco clean is on the way!" },
  ];

  return (
    <section style={{ padding: "60px 0" }}>
      <div className="container-x" style={{ maxWidth: 680 }}>
        <Reveal>
          <div style={{ background: "#fff", borderRadius: 28, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
            <div
              style={{
                background: "linear-gradient(180deg, var(--eco-green), var(--eco-green-dark))",
                color: "#fff",
                padding: "48px 32px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  margin: "0 auto 18px",
                  display: "grid",
                  placeItems: "center",
                }}
                className="pulse-ring"
              >
                <Icon name="check-circle" size={42} />
              </div>
              <h2 style={{ fontSize: 36, color: "#fff", marginBottom: 8 }}>Booking confirmed!</h2>
              <p style={{ color: "rgba(255,255,255,0.85)" }}>Your fresh, eco-friendly space is on the way.</p>
            </div>
            <div style={{ padding: 32 }}>
              <div
                style={{
                  background: "var(--eco-cream-2)",
                  borderRadius: 14,
                  padding: 18,
                  textAlign: "center",
                  marginBottom: 26,
                  border: "2px dashed var(--eco-green-soft)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--eco-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    marginBottom: 6,
                  }}
                >
                  Your Booking Reference
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--eco-green-dark)", letterSpacing: "0.02em" }}>
                  #{ref}
                </div>
              </div>

              <div style={{ fontWeight: 700, marginBottom: 12 }}>Booking summary</div>
              <Row label="Service" value={svc.name} />
              <Row label="Date & Time" value={`${dateStr} at ${data.time ?? "—"}`} />
              <Row label="Address" value={`${data.address}, ${data.city}`} />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 6px", marginTop: 6 }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, color: "var(--eco-green)", fontSize: 20 }}>${total}</span>
              </div>

              <div style={{ marginTop: 22, fontWeight: 700, marginBottom: 10 }}>What happens next?</div>
              {steps.map((it) => (
                <div key={it.t} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: "var(--eco-cream-2)",
                      color: "var(--eco-green)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon name={it.i} size={16} />
                  </div>
                  <span style={{ fontSize: 14 }}>{it.t}</span>
                </div>
              ))}

              <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => go("home")}>
                  Return Home
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => window.location.reload()}
                >
                  Book Another Clean
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
