import { Icon } from "./Icon";
import { Img } from "./Img";
import { Reveal } from "./Reveal";
import { U } from "../data/content";
import { useCurrentRoute, useGo } from "../lib/nav";

const CTA_IMAGES: Record<string, { src: string; alt: string }> = {
  home: { src: U("1527515637462-cff94eecc1ac", 800), alt: "Cleaning in action — fresh and sparkling" },
  services: { src: U("1556909114-f6e7ad7d3136", 800), alt: "Spotless kitchen ready for the day" },
  subscriptions: { src: U("1416879595882-3373a0480b5b", 800), alt: "Cozy clean living room" },
  about: { src: U("1556228720-195a672e8a03", 800), alt: "Eco-cleaning in progress" },
};

export function FinalCTA() {
  const route = useCurrentRoute();
  const go = useGo();
  const img = CTA_IMAGES[route] || CTA_IMAGES.home;
  return (
    <section style={{ paddingBottom: 0 }}>
      <div className="container-x">
        <Reveal>
          <div
            style={{
              background: "linear-gradient(135deg, var(--eco-green-light) 0%, #84d6a0 100%)",
              borderRadius: 32,
              padding: "64px 56px",
              position: "relative",
              overflow: "hidden",
            }}
            className="cta-box"
          >
            <div
              style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "center", position: "relative", zIndex: 1 }}
              className="cta-grid"
            >
              <div>
                <h2 style={{ fontSize: "clamp(32px, 4.5vw, 52px)", color: "var(--eco-green-dark)" }}>
                  Experience your<br />cleanest home yet.
                </h2>
                <p style={{ color: "rgba(17,39,27,0.78)", fontSize: 18, marginTop: 18, marginBottom: 28, maxWidth: 500 }}>
                  Book in under a minute. Pay only after we're done and you're delighted.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    className="btn"
                    style={{ background: "var(--eco-green-dark)", color: "#fff" }}
                    onClick={() => go("booking")}
                  >
                    Get Instant Price <Icon name="arrow-right" size={16} />
                  </button>
                  <button className="btn btn-light" onClick={() => go("contact")}>
                    <Icon name="phone" size={16} /> +1 (437) 265-4977
                  </button>
                </div>
              </div>
              <div style={{ position: "relative", height: 280 }} className="cta-img">
                <Img src={img.src} alt={img.alt} radius={24} style={{ height: 280 }} />
              </div>
            </div>
            <div className="blob" style={{ width: 320, height: 320, top: -100, right: -60, background: "#fff", opacity: 0.25 }} />
          </div>
        </Reveal>
      </div>
      <style>{`@media (max-width: 880px){.cta-grid{grid-template-columns:1fr !important;}.cta-img{display:none;}.cta-box{padding:48px 30px !important;}}`}</style>
    </section>
  );
}
