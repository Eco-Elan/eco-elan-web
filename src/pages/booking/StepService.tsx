import type { Dispatch, SetStateAction } from "react";
import { Icon, type IconName } from "../../components/Icon";
import { Reveal } from "../../components/Reveal";
import { SERVICES, ADDONS, PROPERTY_SIZES } from "../../data/content";
import type { BookingData } from "./types";

type Props = {
  data: BookingData;
  setData: Dispatch<SetStateAction<BookingData>>;
  next: () => void;
};

export function StepService({ data, setData, next }: Props) {
  const sz = PROPERTY_SIZES.find((p) => p.id === data.size) ?? PROPERTY_SIZES[1];
  const svc = SERVICES.find((s) => s.id === data.service) ?? SERVICES[0];
  const addonsTotal = data.addons.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0);
  const subtotal = Math.round(svc.price * sz.mult + addonsTotal);

  const toggleAddon = (id: string) => {
    setData((d) => ({
      ...d,
      addons: d.addons.includes(id) ? d.addons.filter((x) => x !== id) : [...d.addons, id],
    }));
  };

  return (
    <section>
      <div className="container-x" style={{ maxWidth: 980 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>Choose your service</h2>
            <p style={{ color: "var(--eco-muted)", marginTop: 10 }}>Select the cleaning plan that best fits your needs.</p>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }} className="svc-pick-grid">
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className={`svc-card ${data.service === s.id ? "selected" : ""}`}
              onClick={() => setData((d) => ({ ...d, service: s.id }))}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--eco-cream-2)",
                  color: "var(--eco-green)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={s.icon as IconName} size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
                  {data.service === s.id && (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "var(--eco-green)",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Icon name="check" size={14} />
                    </div>
                  )}
                </div>
                <div style={{ color: "var(--eco-muted)", fontSize: 13, marginTop: 4 }}>{s.desc}</div>
                <div style={{ marginTop: 10, color: "var(--eco-green)", fontWeight: 700, fontSize: 14 }}>{s.priceLabel}</div>
              </div>
            </div>
          ))}
        </div>

        <Reveal>
          <div className="card" style={{ padding: 24 }}>
            <label className="label">Property Size</label>
            <select
              className="select"
              value={data.size}
              onChange={(e) => setData((d) => ({ ...d, size: e.target.value }))}
            >
              {PROPERTY_SIZES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>

            <div style={{ marginTop: 26 }}>
              <label className="label">Add-On Services (Optional)</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="addons-pick">
                {ADDONS.map((a) => (
                  <div
                    key={a.id}
                    className={`svc-card ${data.addons.includes(a.id) ? "selected" : ""}`}
                    style={{ padding: 14, cursor: "pointer", gap: 10 }}
                    onClick={() => toggleAddon(a.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: "var(--eco-green)", marginTop: 2, fontWeight: 700 }}>+${a.price}</div>
                    </div>
                    {data.addons.includes(a.id) ? (
                      <Icon name="check-circle" size={18} style={{ color: "var(--eco-green)" }} />
                    ) : (
                      <Icon name="plus" size={16} style={{ color: "var(--eco-muted)" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontSize: 30, fontWeight: 800, color: "var(--eco-green)" }}>${subtotal}</span>
            <span style={{ color: "var(--eco-muted)", marginLeft: 8 }}>estimated</span>
          </div>
          <button className="btn btn-primary" onClick={next} disabled={!data.service}>
            Continue <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
      <style>{`@media (max-width:720px){.svc-pick-grid,.addons-pick{grid-template-columns:1fr !important;}}@media (min-width:721px) and (max-width:880px){.addons-pick{grid-template-columns:1fr 1fr !important;}}`}</style>
    </section>
  );
}
