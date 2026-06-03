import type { CSSProperties, ReactNode } from "react";
import { Reveal } from "./Reveal";

type PageHeroProps = {
  title: string;
  accent: string;
  subtitle: string;
  children?: ReactNode;
  /** Full-bleed background photo that also sits behind the nav (matches the home hero). */
  bgImage?: string;
  imgPos?: string;
  strongScrim?: boolean;
  bgContain?: boolean;
  bgColor?: string;
};

export function PageHero({
  title,
  accent,
  subtitle,
  children,
  bgImage,
  imgPos = "center",
  strongScrim = false,
  bgContain = false,
  bgColor,
}: PageHeroProps) {
  const hasBg = !!bgImage;
  const sectionStyle: CSSProperties = hasBg
    ? {
        position: "relative",
        overflow: "hidden",
        marginTop: "calc(-1 * var(--nav-h, 112px))",
        padding: "0 0 84px",
        ...(bgContain && bgColor ? { background: bgColor } : null),
      }
    : { position: "relative", overflow: "hidden", padding: "60px 0 80px" };

  return (
    <section
      className={`hero-bg page-hero ${hasBg ? "has-bg" : ""} ${bgContain ? "contain" : ""}`}
      style={sectionStyle}
    >
      {hasBg && (
        <img
          className={`page-hero-bg ${bgContain ? "contain" : ""}`}
          src={bgImage}
          alt=""
          aria-hidden="true"
          style={{ objectFit: bgContain ? "contain" : "cover", objectPosition: imgPos }}
          loading="eager"
        />
      )}
      {hasBg && (
        <div
          className={`page-hero-scrim ${strongScrim ? "strong" : ""} ${bgContain ? "left" : ""}`}
          aria-hidden="true"
        />
      )}
      {!hasBg && (
        <div className="blob" style={{ width: 480, height: 480, top: -150, right: -120, background: "var(--eco-green-light)" }} />
      )}
      <div
        className="container-x"
        style={
          hasBg
            ? { paddingTop: "calc(var(--nav-h, 112px) + 64px)", position: "relative" }
            : { paddingTop: 80, position: "relative" }
        }
      >
        <Reveal>
          <h1 style={{ fontSize: "clamp(36px, 5.5vw, 68px)", color: "#fff", maxWidth: 800 }}>
            {title}
            <br />
            <span style={{ color: "var(--eco-green-light)" }}>{accent}</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 19, marginTop: 20, maxWidth: 600 }}>{subtitle}</p>
          {children}
        </Reveal>
      </div>
    </section>
  );
}
