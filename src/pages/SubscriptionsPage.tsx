import { Icon, type IconName } from "../components/Icon";
import { Reveal } from "../components/Reveal";
import { PageHero } from "../components/PageHero";
import { FaqSection } from "../components/FaqSection";
import { FinalCTA } from "../components/FinalCTA";
import { PLANS } from "../data/content";
import { useGo } from "../lib/nav";

function planIcon(p: (typeof PLANS)[number], idx: number): IconName {
  if (p.host) return "bed";
  if (idx === 0) return "sparkles";
  if (idx === 1) return "leaf";
  return "home";
}

export function SubscriptionsPage() {
  const go = useGo();
  return (
    <>
      <PageHero
        title="Save more."
        accent="Stay clean. Always."
        subtitle="Subscribe for consistent, eco-friendly cleaning at our best rates. Flexible scheduling, transparent pricing, cancel anytime."
        bgImage="/assets/subscription_hero.jpg"
        imgPos="75% center"
      />

      <section>
        <div className="container-x">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="plan-grid">
            {PLANS.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <div
                  className="card"
                  style={{
                    padding: 30,
                    height: "100%",
                    position: "relative",
                    borderColor: p.accent ? "var(--eco-green)" : "var(--eco-line)",
                    borderWidth: p.accent ? 2 : 1,
                    background: p.accent ? "linear-gradient(180deg, rgba(109,200,144,0.06), #fff)" : "#fff",
                  }}
                >
                  {p.badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: -14,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "var(--eco-green)",
                        color: "#fff",
                        padding: "6px 16px",
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                  <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 6 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        background: "var(--eco-cream-2)",
                        color: "var(--eco-green)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Icon name={planIcon(p, i)} size={22} />
                    </div>
                    <h3 style={{ fontSize: 24 }}>{p.name}</h3>
                  </div>
                  <p style={{ color: "var(--eco-muted)", fontSize: 13.5, marginBottom: 18 }}>{p.desc}</p>
                  <div
                    style={{
                      background: "var(--eco-cream-2)",
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--eco-green-dark)",
                      display: "inline-block",
                      marginBottom: 22,
                    }}
                  >
                    {p.tag}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
                    {(p.host
                      ? ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom"]
                      : ["1 Bedroom", "2 Bedroom", "3 Bedroom House", "4 Bedroom House"]
                    ).map((sz, k) => (
                      <div
                        key={sz}
                        style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed var(--eco-line)" }}
                      >
                        <span style={{ fontSize: 14 }}>{sz}</span>
                        <span style={{ fontWeight: 700, color: "var(--eco-green-dark)" }}>${p.prices[k]}</span>
                      </div>
                    ))}
                  </div>
                  {p.host && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--eco-muted)", marginBottom: 22 }}>
                      <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Icon name="check-circle" size={14} style={{ color: "var(--eco-green)" }} /> Linen change &amp; laundry (optional)
                      </span>
                      <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Icon name="check-circle" size={14} style={{ color: "var(--eco-green)" }} /> Priority scheduling for check-ins
                      </span>
                      <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Icon name="check-circle" size={14} style={{ color: "var(--eco-green)" }} /> Eco-friendly, plant-based products
                      </span>
                    </div>
                  )}
                  <button
                    className={`btn ${p.accent ? "btn-primary" : "btn-ghost"}`}
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => go("booking", { service: p.host ? "airbnb" : "standard", plan: p.id })}
                  >
                    Join {p.name} <Icon name="arrow-right" size={16} />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div
              style={{
                marginTop: 36,
                background: "var(--eco-cream-2)",
                borderRadius: 22,
                padding: "26px 30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 18,
              }}
            >
              <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "#fff",
                    color: "var(--eco-green)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon name="award" size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>Optional Commitment Discount</div>
                  <div style={{ fontSize: 13, color: "var(--eco-muted)" }}>
                    Commit to 3+ months — get an extra <strong>25% off</strong>. Cancel-anytime plans are still our most popular option.
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
        <style>{`@media (max-width: 880px){.plan-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      <FaqSection />
      <FinalCTA />
    </>
  );
}
