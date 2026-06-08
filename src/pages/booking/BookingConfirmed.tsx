import { Icon, type IconName } from "../../components/Icon";
import { Reveal } from "../../components/Reveal";
import { SERVICES, ADDONS, PROPERTY_SIZES } from "../../data/content";
import { useGo } from "../../lib/nav";
import { Row } from "./Row";
import type { BookingData } from "./types";

export function BookingConfirmed({ data, total }: { data: BookingData; total: number }) {
  const go = useGo();
  const payRef = data.paymentIntentId ?? "—";
  const svc = SERVICES.find((s) => s.id === data.service) ?? SERVICES[0];
  const sz = PROPERTY_SIZES.find((p) => p.id === data.size) ?? PROPERTY_SIZES[1];
  const sized = Math.round(svc.price * sz.mult);
  const sizeAdj = sized - svc.price;
  const dateStr = data.date
    ? data.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";
  const email = data.email || "your email";

  const next: { i: IconName; t: string }[] = [
    { i: "clock", t: "We'll confirm your booking within 24 hours" },
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
              <h2 style={{ fontSize: 36, color: "#fff", marginBottom: 8 }}>Payment successful!</h2>
              <p style={{ color: "rgba(255,255,255,0.85)" }}>
                Thank you — your booking is paid and your fresh, eco-friendly clean is on the way.
              </p>
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
                  Payment Reference
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "var(--eco-green-dark)",
                    letterSpacing: "0.01em",
                    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                    wordBreak: "break-all",
                  }}
                >
                  #{payRef}
                </div>
              </div>

              <div style={{ fontWeight: 700, marginBottom: 12 }}>Receipt</div>
              <Row label="Service" value={svc.name} />
              <Row label="Date & time" value={`${dateStr}${data.time ? " at " + data.time : ""}`} />
              <Row label="Address" value={data.address ? `${data.address}, ${data.city}` : "—"} />

              <div
                style={{
                  marginTop: 14,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--eco-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: 4,
                }}
              >
                Itemized
              </div>
              <Row label={`Base price · ${svc.name.replace(" Cleaning", "")}`} value={`$${svc.price}`} />
              {sizeAdj !== 0 && (
                <Row label={`Size adjustment · ${sz.label}`} value={`${sizeAdj > 0 ? "+" : "−"}$${Math.abs(sizeAdj)}`} />
              )}
              {data.addons.map((id) => {
                const a = ADDONS.find((x) => x.id === id);
                return a ? <Row key={id} label={`Add-on · ${a.name}`} value={`+$${a.price}`} /> : null;
              })}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 0 6px",
                  marginTop: 6,
                  borderTop: "2px solid var(--eco-line)",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 16 }}>Total paid</span>
                <span style={{ fontWeight: 800, color: "var(--eco-green)", fontSize: 22 }}>${total}</span>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "var(--eco-cream-2)",
                  fontSize: 14,
                  color: "var(--eco-ink)",
                }}
              >
                <Icon name="mail" size={16} style={{ color: "var(--eco-green)" }} />
                A receipt has been emailed to <strong style={{ fontWeight: 700 }}>{email}</strong>.
              </div>

              <div style={{ marginTop: 24, fontWeight: 700, marginBottom: 10 }}>What happens next?</div>
              {next.map((it) => (
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
                      flexShrink: 0,
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
