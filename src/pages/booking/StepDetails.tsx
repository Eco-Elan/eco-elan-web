import type { Dispatch, SetStateAction } from "react";
import { Icon } from "../../components/Icon";
import { Reveal } from "../../components/Reveal";
import type { BookingData } from "./types";

type Props = {
  data: BookingData;
  setData: Dispatch<SetStateAction<BookingData>>;
  next: () => void;
  back: () => void;
};

export function StepDetails({ data, setData, next, back }: Props) {
  const canContinue = data.firstName && data.lastName && data.email && data.phone && data.address && data.city;
  return (
    <section>
      <div className="container-x" style={{ maxWidth: 880 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>Your details</h2>
            <p style={{ color: "var(--eco-muted)", marginTop: 10 }}>Tell us about your home and how to reach you.</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }} className="d-grid">
              <div>
                <label className="label">First Name *</label>
                <input
                  className="input"
                  value={data.firstName}
                  onChange={(e) => setData((s) => ({ ...s, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input
                  className="input"
                  value={data.lastName}
                  onChange={(e) => setData((s) => ({ ...s, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  className="input"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData((s) => ({ ...s, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input
                  className="input"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="(416) 555-0123"
                />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label className="label">Street Address *</label>
              <input
                className="input"
                value={data.address}
                onChange={(e) => setData((s) => ({ ...s, address: e.target.value }))}
                placeholder="123 Main St, Apt 4B"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }} className="d-grid">
              <div>
                <label className="label">City *</label>
                <input
                  className="input"
                  value={data.city}
                  onChange={(e) => setData((s) => ({ ...s, city: e.target.value }))}
                  placeholder="Toronto"
                />
              </div>
              <div>
                <label className="label">Postal Code</label>
                <input
                  className="input"
                  value={data.postal}
                  onChange={(e) => setData((s) => ({ ...s, postal: e.target.value }))}
                  placeholder="M5V 1J1"
                />
              </div>
            </div>
            <div>
              <label className="label">Special Instructions (Optional)</label>
              <textarea
                className="textarea"
                rows={3}
                value={data.notes}
                onChange={(e) => setData((s) => ({ ...s, notes: e.target.value }))}
                placeholder="Any special requests or access instructions…"
              />
            </div>
          </div>
        </Reveal>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <button className="btn btn-ghost" onClick={back}>
            <Icon name="arrow-left" size={16} /> Back
          </button>
          <button
            className="btn btn-primary"
            onClick={next}
            disabled={!canContinue}
            style={{ opacity: canContinue ? 1 : 0.5 }}
          >
            Continue <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
      <style>{`@media (max-width:720px){.d-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}
