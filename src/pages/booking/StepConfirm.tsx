import { Icon } from "../../components/Icon";
import { Reveal } from "../../components/Reveal";
import { SERVICES, ADDONS, PROPERTY_SIZES } from "../../data/content";
import { Row } from "./Row";
import type { BookingData } from "./types";

type Props = {
  data: BookingData;
  back: () => void;
  confirm: (total: number) => void;
};

export function StepConfirm({ data, back, confirm }: Props) {
  const svc = SERVICES.find((s) => s.id === data.service) ?? SERVICES[0];
  const sz = PROPERTY_SIZES.find((p) => p.id === data.size) ?? PROPERTY_SIZES[1];
  const addonsTotal = data.addons.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0);
  const total = Math.round(svc.price * sz.mult + addonsTotal);
  const dateStr = data.date
    ? data.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  return (
    <section>
      <div className="container-x" style={{ maxWidth: 980 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>Review &amp; confirm</h2>
            <p style={{ color: "var(--eco-muted)", marginTop: 10 }}>Please review your booking details before confirming.</p>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="confirm-grid">
          <Reveal>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                <Icon name="sparkles" size={20} style={{ color: "var(--eco-green)" }} />
                <div style={{ fontWeight: 700, fontSize: 17 }}>Service Details</div>
              </div>
              <Row label="Service" value={svc.name} />
              <Row label="Property Size" value={sz.label} />
              {data.addons.length > 0 && (
                <>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--eco-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Add-ons
                  </div>
                  {data.addons.map((id) => {
                    const a = ADDONS.find((x) => x.id === id);
                    if (!a) return null;
                    return <Row key={id} label={a.name} value={`+$${a.price}`} />;
                  })}
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                <Icon name="user" size={20} style={{ color: "var(--eco-green)" }} />
                <div style={{ fontWeight: 700, fontSize: 17 }}>Contact Info</div>
              </div>
              <Row label="Name" value={`${data.firstName} ${data.lastName}`} />
              <Row label="Email" value={data.email} />
              <Row label="Phone" value={data.phone} />
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--eco-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Address
              </div>
              <div style={{ fontSize: 14, marginTop: 4 }}>
                {data.address}
                <br />
                {data.city}
                {data.postal ? ` ${data.postal}` : ""}
              </div>
              {data.notes && (
                <>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--eco-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Notes
                  </div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{data.notes}</div>
                </>
              )}
            </div>
          </Reveal>

          <Reveal>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                <Icon name="calendar" size={20} style={{ color: "var(--eco-green)" }} />
                <div style={{ fontWeight: 700, fontSize: 17 }}>Schedule</div>
              </div>
              <Row label="Date" value={dateStr} />
              <Row label="Time" value={data.time ?? "—"} />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div
              style={{
                background: "linear-gradient(180deg, var(--eco-green), var(--eco-green-dark))",
                color: "#fff",
                borderRadius: 22,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Total Amount</div>
                  <div style={{ fontSize: 44, fontWeight: 800, marginTop: 4 }}>${total}</div>
                </div>
                <Icon name="leaf" size={42} stroke={1.4} style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
              <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                Payment collected only after the clean is done — and you're delighted. We bring 100% plant-based products.
              </div>
            </div>
          </Reveal>
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <button className="btn btn-ghost" onClick={back}>
            <Icon name="arrow-left" size={16} /> Back
          </button>
          <button
            className="btn btn-primary"
            onClick={() => confirm(total)}
            style={{ fontSize: 16, padding: "16px 28px" }}
          >
            <Icon name="sparkles" size={16} /> Confirm Booking
          </button>
        </div>
      </div>
      <style>{`@media (max-width:720px){.confirm-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}
