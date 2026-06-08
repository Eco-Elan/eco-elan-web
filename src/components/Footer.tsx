import { Icon, type IconName } from "./Icon";
import { Logo } from "./Logo";
import { pathFor, useGo } from "../lib/nav";
import { SERVICES } from "../data/content";

const socials: IconName[] = ["instagram", "facebook", "linkedin", "twitter"];

const quickLinks: Array<["home" | "services" | "subscriptions" | "commercial" | "about" | "contact", string]> = [
  ["home", "Home"],
  ["services", "Services"],
  ["subscriptions", "Subscriptions"],
  ["commercial", "Commercial"],
  ["about", "About"],
  ["contact", "Contact"],
];

export function Footer() {
  const go = useGo();
  return (
    <footer>
      <div className="container-x" style={{ padding: "64px 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1.2fr", gap: 40 }} className="footer-grid">
          <div>
            <Logo light size={42} />
            <p style={{ marginTop: 18, maxWidth: 320 }}>
              Premium plant-based cleaning for homes and businesses across the Greater Toronto Area. Safer for kids, pets and the planet.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              {socials.map((k) => (
                <a
                  key={k}
                  href="#"
                  aria-label={k}
                  style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "grid", placeItems: "center" }}
                >
                  <Icon name={k} size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 18 }}>Quick Links</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {quickLinks.map(([k, v]) => (
                <li key={k}>
                  <a
                    href={pathFor(k)}
                    onClick={(e) => {
                      e.preventDefault();
                      go(k);
                    }}
                  >
                    {v}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 18 }}>Services</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <a
                    href={pathFor("booking", { service: s.id })}
                    onClick={(e) => {
                      e.preventDefault();
                      go("booking", { service: s.id });
                    }}
                  >
                    {s.name.replace(" Cleaning", "").replace(" Eco", "")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 18 }}>Contact</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Icon name="map-pin" size={16} />
                <span>
                  Toronto &amp; GTA<br />Ontario, Canada
                </span>
              </li>
              <li style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Icon name="phone" size={16} />
                <a href="tel:+14372654977">+1 (437) 265-4977</a>
              </li>
              <li style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Icon name="mail" size={16} />
                <a href="mailto:info@eco-elan.com">info@eco-elan.com</a>
              </li>
              <li style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Icon name="clock" size={16} />
                Mon–Sat · 8am–6pm
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            paddingTop: 22,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 13,
          }}
        >
          <span>© {new Date().getFullYear()} Eco Elan. All rights reserved.</span>
          <span style={{ display: "inline-flex", gap: 22 }}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Accessibility</a>
            <a href="/sitemap.xml">Sitemap</a>
          </span>
        </div>
      </div>
      <style>{`
        @media (max-width: 880px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 520px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
