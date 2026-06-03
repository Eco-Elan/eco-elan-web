import { Icon, type IconName } from "../components/Icon";
import { Img } from "../components/Img";
import { Reveal } from "../components/Reveal";
import { PageHero } from "../components/PageHero";
import { FinalCTA } from "../components/FinalCTA";
import { AREAS, U } from "../data/content";

const stats: [string, string][] = [
  ["100%", "Eco Products"],
  ["4.9", "Star Rating"],
  ["500+", "Happy Clients"],
  ["4+", "Years in GTA"],
];

const values: { i: IconName; t: string; d: string }[] = [
  { i: "leaf", t: "Eco Responsibility", d: "We use safe, plant-based, biodegradable products." },
  { i: "award", t: "Quality", d: "Every clean is carried out with care and precision." },
  { i: "users", t: "Transparency", d: "Clear communication and honest, upfront pricing." },
  { i: "shield", t: "Trust", d: "Vetted staff who respect your home and your privacy." },
  { i: "clock", t: "Care", d: "We treat your space as if it were our own." },
];

const standards: { title: string; body: string }[] = [
  { title: "Background-checked", body: "Every cleaner clears a criminal background check before their first booking." },
  { title: "Fully insured", body: "Your home and belongings are protected on every single visit." },
  { title: "Eco-protocol trained", body: "Our team is trained on safe, plant-based, non-toxic cleaning methods." },
  { title: "Vetted & reference-checked", body: "We hire selectively — verifying experience, references and work history." },
  { title: "Always on time", body: "Punctual, reliable service you can plan your day around." },
  { title: "Highly rated", body: "A 4.9-star average across hundreds of cleans completed in the GTA." },
];

export function AboutPage() {
  return (
    <>
      <PageHero
        title="A team built around"
        accent="clean & care."
        subtitle="We're a Toronto cleaning collective on a mission to make clean homes healthier — for the people in them, and the planet around them."
        bgImage="/assets/about_hero.png"
        imgPos="82% 22%"
      />

      <section>
        <div className="container-x">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="about-grid">
            <Reveal>
              <span className="eyebrow">Our Story</span>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", marginTop: 14, marginBottom: 18 }}>
                Premium eco cleaning, for a <span style={{ color: "var(--eco-green)" }}>better tomorrow</span>.
              </h2>
              <p style={{ color: "var(--eco-muted)", fontSize: 16, marginBottom: 14 }}>
                Founded in 2022, Eco Elan was born from a simple realization: the products we used to "clean" our homes were often more harmful than the dirt they removed.
              </p>
              <p style={{ color: "var(--eco-muted)", fontSize: 16, marginBottom: 22 }}>
                We set out to change that — combining premium-quality cleaning techniques with 100% plant-based, non-toxic products. Today, we serve hundreds of families across the GTA, delivering a fresh, natural, elevated cleaning experience.
              </p>
              <div style={{ background: "var(--eco-cream-2)", borderLeft: "4px solid var(--eco-green)", padding: "18px 22px", borderRadius: 12 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--eco-green)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 6,
                  }}
                >
                  Our Mission
                </div>
                <div style={{ fontStyle: "italic", color: "var(--eco-green-dark)", fontSize: 15 }}>
                  "To provide exceptional cleaning services while protecting the health of our clients, our staff, and our planet through sustainable, non-toxic practices."
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div style={{ display: "grid", gridTemplateRows: "1.4fr 1fr", gap: 14, height: 460 }}>
                <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
                  <Img src="/assets/still-life-cleaning-tools.jpg" alt="Eco-friendly cleaning supplies in a caddy" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                    <Img src={U("1610557892470-55d9e80c0bce", 600)} alt="Bamboo cleaning brushes" />
                  </div>
                  <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                    <Img src={U("1585421514738-01798e348b17", 600)} alt="Plant-based cleaning bottles" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
        <style>{`@media (max-width: 980px){.about-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      <section style={{ background: "var(--eco-green-dark)", color: "#fff", padding: "60px 0" }}>
        <div className="container-x">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }} className="stats-row">
            {stats.map(([n, l]) => (
              <Reveal key={l}>
                <div>
                  <div className="stat-num" style={{ fontSize: "clamp(40px, 5vw, 64px)" }}>
                    {n}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      fontWeight: 600,
                      marginTop: 8,
                    }}
                  >
                    {l}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <style>{`@media (max-width: 720px){.stats-row{grid-template-columns:1fr 1fr !important;}}`}</style>
        </div>
      </section>

      <section>
        <div className="container-x">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span className="eyebrow">What we stand for</span>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", marginTop: 14 }}>Our core values</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 20 }} className="values-grid">
            {values.map((v, i) => (
              <Reveal key={v.t} delay={i * 60}>
                <div className="card" style={{ padding: 22, height: "100%", textAlign: "center" }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      background: "var(--eco-cream-2)",
                      color: "var(--eco-green)",
                      display: "grid",
                      placeItems: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    <Icon name={v.i} size={22} />
                  </div>
                  <h3 style={{ fontSize: 15, marginBottom: 8 }}>{v.t}</h3>
                  <p style={{ color: "var(--eco-muted)", fontSize: 13 }}>{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <style>{`@media (max-width: 880px){.values-grid{grid-template-columns:1fr 1fr 1fr !important;}}@media (max-width:560px){.values-grid{grid-template-columns:1fr 1fr !important;}}`}</style>
        </div>
      </section>

      <section style={{ background: "var(--eco-cream-2)" }}>
        <div className="container-x">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48, maxWidth: 680, marginInline: "auto" }}>
              <span className="eyebrow">Our standards</span>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", marginTop: 14 }}>People you can trust in your home</h2>
              <p style={{ color: "var(--eco-muted)", fontSize: 17, marginTop: 16 }}>
                We don't just send anyone. Every Eco Elan cleaner is screened, insured and trained before they ever set foot in your space.
              </p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="standards-grid">
            {standards.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="card" style={{ padding: 24, height: "100%", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: "rgba(46,115,85,0.1)",
                      color: "var(--eco-green)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="check" size={18} stroke={2.5} />
                  </span>
                  <div>
                    <h3 style={{ fontSize: 17, marginBottom: 6 }}>{s.title}</h3>
                    <p style={{ color: "var(--eco-muted)", fontSize: 14, margin: 0 }}>{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <style>{`@media (max-width: 880px){.standards-grid{grid-template-columns:1fr 1fr !important;}}@media (max-width:560px){.standards-grid{grid-template-columns:1fr !important;}}`}</style>
        </div>
      </section>

      <section>
        <div className="container-x" style={{ textAlign: "center" }}>
          <Reveal>
            <span className="eyebrow">Coverage</span>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", marginTop: 14, marginBottom: 24 }}>Proudly serving the GTA</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 900, margin: "0 auto" }}>
              {AREAS.map((a) => (
                <span key={a} className="chip">
                  {a}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
