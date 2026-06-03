import { Icon, type IconName } from "../components/Icon";
import { Img } from "../components/Img";
import { Reveal } from "../components/Reveal";
import { PageHero } from "../components/PageHero";
import { FinalCTA } from "../components/FinalCTA";
import { SERVICES, ADDONS, IMG } from "../data/content";
import { useGo } from "../lib/nav";

type Row = [label: string, a: boolean, b: boolean, c: boolean, d: boolean] | [label: string, header: true];

const ROWS: Row[] = [
  ["All Areas", true],
  ["Dust and wipe all surfaces", true, true, true, true],
  ["Vacuum and mop floors", true, true, true, true],
  ["Clean tables and chairs", true, true, true, true],
  ["Clean mirrors and fixtures", true, true, true, true],
  ["Clean doors and cabinet surfaces", true, true, true, true],
  ["Baseboard dusting", false, true, true, true],
  ["Inside windows", false, false, true, false],
  ["Walls (spot clean)", false, true, true, false],
  ["Kitchen", true],
  ["Clean the sink", true, true, true, true],
  ["Wipe outside of microwave & appliances", true, true, true, true],
  ["Wipe and clean kitchen surfaces", true, true, true, true],
  ["Clean outside of fridge and oven", true, true, true, true],
  ["Clean inside of oven", false, true, true, false],
  ["Clean inside of fridge", false, false, true, false],
  ["Bathroom", true],
  ["Clean sinks, toilets, mirrors", true, true, true, true],
  ["Clean tubs and showers", true, true, true, true],
  ["Wipe inside cabinets and drawers", false, false, true, false],
];

const serviceImages = [
  IMG.service_standard,
  IMG.service_deep,
  IMG.service_movein,
  IMG.service_airbnb,
  IMG.service_office,
];

export function ServicesPage() {
  const go = useGo();
  return (
    <>
      <PageHero
        title="Premium eco cleaning,"
        accent="tailored to you."
        subtitle="Professional, plant-based cleaning solutions for every kind of home — from quick recurring touch-ups to deep seasonal resets."
        bgImage="/assets/services_hero.png"
        imgPos="right center"
        bgContain
        bgColor="#9FD9CB"
      >
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
          <button
            className="btn"
            style={{ background: "var(--eco-green-light)", color: "var(--eco-green-dark)" }}
            onClick={() => go("booking")}
          >
            Book a Clean <Icon name="arrow-right" size={16} />
          </button>
          <button className="btn btn-outline-light" onClick={() => go("contact")}>
            Talk to a human
          </button>
        </div>
      </PageHero>

      <section>
        <div className="container-x">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span className="eyebrow">What's Included</span>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", marginTop: 14 }}>Service comparison</h2>
              <p style={{ color: "var(--eco-muted)", marginTop: 14, maxWidth: 640, marginInline: "auto" }}>
                We offer four core types of clean. Choose the one that fits your moment — or talk to us about a custom plan.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                  <thead>
                    <tr style={{ background: "var(--eco-green-light)" }}>
                      <th style={{ textAlign: "left", padding: "18px 22px", fontWeight: 700, color: "var(--eco-green-dark)" }}>Task</th>
                      {["Standard", "Deep", "Move-Out", "Airbnb"].map((h) => (
                        <th key={h} style={{ padding: "18px 22px", fontWeight: 700, color: "var(--eco-green-dark)", textAlign: "center" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row, i) => {
                      if (row.length === 2 && row[1] === true) {
                        return (
                          <tr key={i} style={{ background: "var(--eco-cream-2)" }}>
                            <td
                              colSpan={5}
                              style={{
                                padding: "12px 22px",
                                fontWeight: 700,
                                fontSize: 13,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                color: "var(--eco-green)",
                              }}
                            >
                              {row[0]}
                            </td>
                          </tr>
                        );
                      }
                      const [label, a, b, c, d] = row as [string, boolean, boolean, boolean, boolean];
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid var(--eco-line)" }}>
                          <td style={{ padding: "14px 22px", fontSize: 14 }}>{label}</td>
                          {[a, b, c, d].map((v, k) => (
                            <td
                              key={k}
                              style={{ padding: "14px 22px", textAlign: "center", color: v ? "var(--eco-green)" : "#D88" }}
                            >
                              {v ? <Icon name="check-circle" size={20} /> : <Icon name="x-circle" size={20} />}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ background: "var(--eco-cream-2)" }}>
        <div className="container-x">
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {SERVICES.map((s, i) => (
              <Reveal key={s.id}>
                <div
                  className="card svc-row"
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: i % 2 === 0 ? "1fr 1.2fr" : "1.2fr 1fr",
                    gap: 0,
                  }}
                >
                  <div style={{ minHeight: 280, order: i % 2 === 0 ? 0 : 1, overflow: "hidden" }}>
                    <Img src={serviceImages[i]} alt={s.name} style={{ minHeight: 280 }} />
                  </div>
                  <div style={{ padding: "40px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: "var(--eco-cream-2)",
                          color: "var(--eco-green)",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <Icon name={s.icon as IconName} size={22} />
                      </div>
                      <h3 style={{ fontSize: 28 }}>{s.name}</h3>
                      {s.popular && (
                        <span
                          style={{
                            background: "var(--eco-green-light)",
                            color: "var(--eco-green-dark)",
                            padding: "4px 10px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          POPULAR
                        </span>
                      )}
                    </div>
                    <p style={{ color: "var(--eco-muted)", fontSize: 15, marginBottom: 22 }}>{s.desc}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 }}>
                      {["100% plant-based", "Background-checked team", "Fully insured", "Satisfaction guaranteed"].map((b) => (
                        <div key={b} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
                          <Icon name="check-circle" size={16} style={{ color: "var(--eco-green)" }} />
                          {b}
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid var(--eco-line)",
                        paddingTop: 22,
                        flexWrap: "wrap",
                        gap: 14,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--eco-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontWeight: 600,
                          }}
                        >
                          Pricing
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--eco-green)" }}>{s.priceLabel}</div>
                      </div>
                      <button className="btn btn-primary" onClick={() => go("booking", { service: s.id })}>
                        Book this Service <Icon name="arrow-right" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 880px){.svc-row{grid-template-columns:1fr !important;}.svc-row > div:first-child{order:0 !important;}}`}</style>
      </section>

      <section>
        <div className="container-x">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span className="eyebrow">Customize your clean</span>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", marginTop: 14 }}>Add-on services</h2>
              <p style={{ color: "var(--eco-muted)", marginTop: 12 }}>Enhance any clean with these specialized extras.</p>
            </div>
          </Reveal>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 800, margin: "0 auto" }}
            className="addon-grid"
          >
            {ADDONS.map((a, i) => (
              <Reveal key={a.id} delay={i * 50}>
                <div className="card" style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "var(--eco-cream-2)",
                        color: "var(--eco-green)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Icon name="leaf" size={16} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--eco-green)" }}>+${a.price}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <style>{`@media (max-width: 720px){.addon-grid{grid-template-columns:1fr 1fr !important;}}@media (max-width:460px){.addon-grid{grid-template-columns:1fr !important;}}`}</style>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
