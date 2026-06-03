import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { Logo } from "./Logo";
import { useCurrentRoute, useGo, type RouteName } from "../lib/nav";

type ServiceItem = { key: string; label: string; desc: string; icon: IconName };

const servicesItems: ServiceItem[] = [
  { key: "standard", label: "Standard Eco Cleaning", desc: "Weekly maintenance clean", icon: "home" },
  { key: "deep", label: "Deep Eco Cleaning", desc: "Seasonal reset or first-time", icon: "sparkles" },
  { key: "movein", label: "Move-In / Move-Out", desc: "Empty homes, full reset", icon: "truck" },
  { key: "airbnb", label: "Airbnb Turnover", desc: "Fast, consistent turnover", icon: "bed" },
  { key: "office", label: "Office Cleaning", desc: "Commercial workspaces", icon: "building" },
];

type Link = { id: RouteName; label: string; dd?: ServiceItem[] };

const links: Link[] = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services", dd: servicesItems },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "commercial", label: "Commercial" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

function TopBar({ overlay = false }: { overlay?: boolean }) {
  return (
    <div className="topbar" style={overlay ? { background: "transparent" } : undefined}>
      <div
        className="container-x"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", gap: 16, flexWrap: "wrap" }}
      >
        <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
          <a href="tel:+14372654977" className="topbar-link" style={{ display: "inline-flex", gap: 8, alignItems: "center", textDecoration: "none" }}>
            <Icon name="phone" size={14} /> +1 (437) 265-4977
          </a>
          <a href="mailto:info@eco-elan.com" className="topbar-link" style={{ display: "inline-flex", gap: 8, alignItems: "center", textDecoration: "none" }}>
            <Icon name="mail" size={14} /> info@eco-elan.com
          </a>
        </div>
        <div style={{ display: "inline-flex", gap: 10, alignItems: "center", fontWeight: 500 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(109,200,144,0.15)", color: "#B6E3C7", padding: "4px 12px", borderRadius: 99, fontSize: 12 }}>
            <Icon name="leaf" size={12} /> Spring Special — 20% off your first clean
          </span>
        </div>
      </div>
      <style>{`
        .topbar-link {
          color: rgba(255,255,255,0.55);
          transition: color .25s ease, text-shadow .25s ease;
        }
        .topbar-link:hover {
          color: #ffffff;
          text-shadow: 0 0 12px rgba(255,255,255,0.35);
        }
      `}</style>
    </div>
  );
}

function NavDropdown({
  open,
  items,
  onPick,
}: {
  open: boolean;
  items: ServiceItem[];
  onPick: (it: ServiceItem) => void;
}) {
  return (
    <div className={`dd ${open ? "open" : ""}`}>
      {items.map((it) => (
        <div key={it.label} className="dd-item" onClick={() => onPick(it)}>
          <div className="dd-icon">
            <Icon name={it.icon} size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--eco-green-dark)" }}>{it.label}</div>
            <div style={{ fontSize: 12, color: "var(--eco-muted)", marginTop: 2 }}>{it.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Header() {
  const route = useCurrentRoute();
  const go = useGo();
  const [scrolled, setScrolled] = useState(false);
  const [openDD, setOpenDD] = useState<RouteName | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ddTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMenu = (k: RouteName) => {
    if (ddTimer.current) clearTimeout(ddTimer.current);
    setOpenDD(k);
  };
  const closeMenu = () => {
    ddTimer.current = setTimeout(() => setOpenDD(null), 120);
  };

  // Nav has three states:
  //   overlay (at top, any route except booking): transparent bg over the hero
  //     image + legibility scrim, white text — the hero photo shows through.
  //   atTop (booking, at top): solid dark green bg, white text.
  //   scrolled: white bg + shadow, dark text.
  const atTop = !scrolled;
  const overlay = atTop && route !== "booking";
  const navBg = overlay ? "transparent" : atTop ? "#1d4530" : "rgba(255,255,255,0.96)";
  const textColor = atTop ? "#fff" : "var(--eco-green-dark)";

  // Expose the header's height as --nav-h so the homepage hero (and page heroes)
  // can slide up beneath it — the full-bleed background image then fills behind.
  const headRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    const setVar = () => document.documentElement.style.setProperty("--nav-h", el.offsetHeight + "px");
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    window.addEventListener("resize", setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setVar);
    };
  }, []);

  return (
    <>
      <div ref={headRef} style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <TopBar overlay={overlay} />
        <div
          style={{
            background: overlay
              ? "linear-gradient(180deg, rgba(6,20,14,0.55) 0%, rgba(6,20,14,0.18) 60%, transparent 100%)"
              : navBg,
            backdropFilter: scrolled ? "saturate(140%) blur(10px)" : "none",
            WebkitBackdropFilter: scrolled ? "saturate(140%) blur(10px)" : "none",
            transition: "background .35s ease, box-shadow .35s ease, border-color .35s ease",
            borderBottom: "none",
            boxShadow: scrolled ? "0 8px 30px rgba(17,39,27,0.08)" : "none",
            textShadow: overlay ? "0 1px 12px rgba(0,0,0,0.35)" : "none",
          }}
          className={`nav-shell ${atTop ? "nav-top" : "nav-scrolled"}`}
        >
          <div
            className="container-x"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", gap: 24 }}
          >
            <div onClick={() => go("home")} style={{ cursor: "pointer" }}>
              <img
                src="/assets/logo.svg"
                alt="Eco Elan"
                style={{
                  height: 54,
                  width: "auto",
                  display: "block",
                  transition: "filter .3s",
                  filter: atTop ? "brightness(0) invert(1)" : "none",
                }}
              />
            </div>

            <nav style={{ display: "flex", gap: 30, alignItems: "center" }} className="desktop-nav">
              {links.map((l) => (
                <div
                  key={l.id}
                  style={{ position: "relative" }}
                  onMouseEnter={() => l.dd && openMenu(l.id)}
                  onMouseLeave={() => l.dd && closeMenu()}
                >
                  <span
                    className={`nav-link ${route === l.id ? "active" : ""}`}
                    onClick={() => go(l.id)}
                    style={{
                      color: route === l.id ? (atTop ? "var(--eco-green-light)" : "var(--eco-green)") : textColor,
                      transition: "color .3s",
                    }}
                  >
                    {l.label}
                    {l.dd && <Icon name="chevron-down" size={14} />}
                  </span>
                  {l.dd && (
                    <NavDropdown
                      open={openDD === l.id}
                      items={l.dd}
                      onPick={(it) => {
                        setOpenDD(null);
                        go("booking", { service: it.key });
                      }}
                    />
                  )}
                </div>
              ))}
            </nav>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }} className="desktop-cta">
              <button className={`btn ${atTop ? "btn-accent" : "btn-primary"}`} onClick={() => go("booking")} style={{ transition: "all .3s" }}>
                <Icon name={route === "booking" ? "calendar" : "sparkles"} size={16} />
                {route === "booking" ? "Booking" : "Book Now"}
              </button>
            </div>

            <button
              className="mobile-btn"
              onClick={() => setMobileOpen(true)}
              style={{ display: "none", background: "transparent", border: "none", color: textColor, cursor: "pointer", transition: "color .3s" }}
              aria-label="Open menu"
            >
              <Icon name="menu" size={26} />
            </button>
          </div>
        </div>
      </div>

      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Logo light />
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
            aria-label="Close menu"
          >
            <Icon name="close" size={28} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                go(l.id);
                setMobileOpen(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                textAlign: "left",
                color: "#fff",
                padding: "16px 4px",
                fontSize: 22,
                fontWeight: 600,
                cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontFamily: "inherit",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 24 }}>
          <button
            className="btn btn-accent"
            style={{ width: "100%", justifyContent: "center", fontSize: 16, padding: "16px 22px" }}
            onClick={() => {
              go("booking");
              setMobileOpen(false);
            }}
          >
            <Icon name="sparkles" size={16} /> Book Now
          </button>
          <div style={{ marginTop: 22, color: "rgba(255,255,255,0.6)", fontSize: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="tel:+14372654977" style={{ display: "inline-flex", gap: 10, alignItems: "center", color: "inherit", textDecoration: "none" }}>
              <Icon name="phone" size={14} /> +1 (437) 265-4977
            </a>
            <a href="mailto:info@eco-elan.com" style={{ display: "inline-flex", gap: 10, alignItems: "center", color: "inherit", textDecoration: "none" }}>
              <Icon name="mail" size={14} /> info@eco-elan.com
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .desktop-nav, .desktop-cta { display: none !important; }
          .mobile-btn { display: inline-flex !important; }
        }
      `}</style>
    </>
  );
}
