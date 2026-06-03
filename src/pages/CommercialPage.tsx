import { Icon, type IconName } from "../components/Icon";
import { Reveal } from "../components/Reveal";
import { PageHero } from "../components/PageHero";
import { useGo } from "../lib/nav";

const offerings: { i: IconName; t: string }[] = [
  { i: "clock", t: "Daily / Weekly cleaning" },
  { i: "shield", t: "Eco-safe disinfection" },
  { i: "droplet", t: "Washroom sanitization" },
  { i: "spray", t: "Office kitchens" },
  { i: "leaf", t: "Floor & carpet care" },
  { i: "user", t: "Reception areas" },
  { i: "wind", t: "Air-quality friendly" },
  { i: "calendar", t: "Custom schedules" },
];

const advantages: { i: IconName; t: string; d: string }[] = [
  { i: "leaf", t: "Healthier Environment", d: "Non-toxic products lead to fewer sick days and better workspaces." },
  { i: "calendar", t: "Flexible Schedules", d: "We work around your hours to minimize disruption." },
  { i: "award", t: "Trained Professionals", d: "Our team is vetted, insured and trained for commercial standards." },
  { i: "spray", t: "Custom Plans", d: "Tailored checklists that match your facility's specific needs." },
  { i: "shield", t: "Fully Insured", d: "Comprehensive liability coverage for your peace of mind." },
  { i: "globe", t: "Eco Certification", d: "Show your commitment to sustainability — we'll provide documentation." },
];

const industries = [
  "Medical Clinics","Retail Stores","Showrooms","Co-working Spaces","Restaurants",
  "Gyms & Studios","Educational Facilities","Salons & Spas","Corporate Offices","Tech Startups",
];

export function CommercialPage() {
  const go = useGo();
  return (
    <>
      <PageHero
        title="Cleaner workspaces."
        accent="Healthier teams."
        subtitle="Professional eco-cleaning for offices, clinics, retail and commercial spaces across the GTA. Daily, weekly, or fully custom."
        bgImage="/assets/commercial_hero.avif"
        imgPos="center"
      >
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
          <button
            className="btn"
            style={{ background: "var(--eco-green-light)", color: "var(--eco-green-dark)" }}
            onClick={() => go("contact")}
          >
            Request a Quote <Icon name="arrow-right" size={16} />
          </button>
          <button className="btn btn-outline-light">
            <Icon name="phone" size={16} /> Call +1 (437) 265-4977
          </button>
        </div>
      </PageHero>

      <section>
        <div className="container-x">
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56 }} className="comm-grid">
            <Reveal>
              <span className="eyebrow">What we offer</span>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", marginTop: 14, marginBottom: 22 }}>Commercial cleaning includes</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {offerings.map((it) => (
                  <div
                    key={it.t}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      padding: 14,
                      background: "#fff",
                      borderRadius: 14,
                      border: "1px solid var(--eco-line)",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: "var(--eco-cream-2)",
                        color: "var(--eco-green)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Icon name={it.i} size={18} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{it.t}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="card" style={{ padding: 32, background: "linear-gradient(180deg, #fff, var(--eco-cream-2))" }}>
                <h3 style={{ fontSize: 24, marginBottom: 18 }}>Office Cleaning Pricing</h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "18px 0",
                    borderBottom: "1px solid var(--eco-line)",
                  }}
                >
                  <span style={{ color: "var(--eco-muted)" }}>Hourly Rate</span>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "var(--eco-green)" }}>$50–$65/hr</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "22px 0" }}>
                  {[
                    "Free on-site walkthrough",
                    "Custom checklist for your business",
                    "Long-term & short-term contracts",
                    "Monthly, weekly or daily options",
                    "Insurance & WSIB clearance",
                  ].map((b) => (
                    <div key={b} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
                      <Icon name="check-circle" size={16} style={{ color: "var(--eco-green)" }} /> {b}
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => go("contact")}>
                  Request My Quote <Icon name="arrow-right" size={16} />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
        <style>{`@media (max-width: 980px){.comm-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      <section style={{ background: "var(--eco-green-dark)", color: "#fff" }}>
        <div className="container-x">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span className="eyebrow" style={{ color: "var(--eco-green-light)" }}>
                The Eco Elan advantage
              </span>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", marginTop: 14, color: "#fff" }}>Why businesses choose us</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="why-comm">
            {advantages.map((it, i) => (
              <Reveal key={it.t} delay={i * 60}>
                <div
                  style={{
                    padding: 28,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 20,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(109,200,144,0.15)",
                      color: "var(--eco-green-light)",
                      display: "grid",
                      placeItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Icon name={it.i} size={20} />
                  </div>
                  <h3 style={{ fontSize: 18, marginBottom: 8, color: "var(--eco-green-light)" }}>{it.t}</h3>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{it.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <style>{`@media (max-width: 880px){.why-comm{grid-template-columns:1fr 1fr !important;}}@media (max-width:520px){.why-comm{grid-template-columns:1fr !important;}}`}</style>
        </div>
      </section>

      <section style={{ background: "var(--eco-cream-2)" }}>
        <div className="container-x">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span className="eyebrow">We serve</span>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", marginTop: 14 }}>Industries we clean for</h2>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 900, margin: "0 auto" }}>
              {industries.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
