import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "../components/Icon";
import { Reveal } from "../components/Reveal";
import { Counter } from "../components/Counter";
import { MarqueeStrip } from "../components/MarqueeStrip";
import { FaqSection } from "../components/FaqSection";
import { FinalCTA } from "../components/FinalCTA";
import { SERVICES, TESTIMONIALS, IMG } from "../data/content";
import { useGo } from "../lib/nav";

type Go = ReturnType<typeof useGo>;

/* ─────────────────────────────────────────────────────────────────────────
   HERO — five bespoke rotating scenes + one-time sponge-clean reveal.
   White headline line is always "Cleaner homes."; the green line, image,
   layout and copy change per scene. Crossfade only — no carousel chrome.
   Pauses on hover/focus, freezes on interaction, reserves a fixed height,
   and degrades to a single static scene under reduced-motion.
   ───────────────────────────────────────────────────────────────────────── */

/* ===== Sponge-cleaning reveal overlay (portaled above nav, covers nav+hero) ===== */
const DIRT_SRC = "/assets/dirt.png";
const SPONGE_SRC = "/assets/sponge.svg";
const SCRUB_MS = 3000;
const TAIL_MS = 650;
const SPAWN_MS = 32;
const MAX_BUBBLES = 70;
const POP_MS = 230;
const TAU = Math.PI * 2;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

type Pt = { x: number; y: number };
type Bubble = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  wob: number;
  age: number;
  ttl: number;
  pop: boolean;
  popAge: number;
};

function SpongeCleanOverlay({ heroRef, onDone }: { heroRef: RefObject<HTMLElement | null>; onDone?: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const grimeRef = useRef<HTMLCanvasElement>(null);
  const toolRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(true);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const gcan = grimeRef.current;
    const tcan = toolRef.current;
    const finish = () => {
      setMounted(false);
      if (doneRef.current) doneRef.current();
    };
    if (!wrap || !gcan || !tcan) {
      finish();
      return;
    }
    const gctx = gcan.getContext("2d");
    const tctx = tcan.getContext("2d");
    if (!gctx || !tctx) {
      finish();
      return;
    }

    let raf = 0;
    let resizeRaf = 0;
    let cancelled = false;
    let dirtLoaded = false;
    let dpr = 1;
    let gw = 0;
    let gh = 0;
    let brushR = 0;
    let spongeS = 0;
    let points: Pt[] = [];
    let startT: number | null = null;
    let lastT = 0;
    let lastSpawn = 0;
    let prevX = 0;
    let prevY = 0;
    let cleared = false;
    let tailStart = 0;
    const bubbles: Bubble[] = [];
    const dirt = new Image();
    const sponge = new Image();
    let spongeReady = false;

    const measure = () => {
      const W = Math.max(1, Math.round(window.innerWidth));
      const hb = heroRef.current ? heroRef.current.getBoundingClientRect().bottom : 0;
      const H = Math.max(1, Math.round(hb > 0 ? hb : window.innerHeight));
      return { W, H };
    };
    const computeSize = () => {
      const { W, H } = measure();
      dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      gw = W * dpr;
      gh = H * dpr;
      wrap.style.width = W + "px";
      wrap.style.height = H + "px";
      for (const c of [gcan, tcan]) {
        c.width = gw;
        c.height = gh;
        c.style.width = W + "px";
        c.style.height = H + "px";
      }
      brushR = Math.max(110 * dpr, Math.min(gh * 0.17, 230 * dpr));
      spongeS = brushR * 2;
      buildPath();
    };
    const buildPath = () => {
      const spacing = brushR * 1.05;
      const cols = Math.max(2, Math.ceil(gw / spacing));
      const rows = Math.max(2, Math.ceil(gh / spacing));
      const cw = gw / cols;
      const ch = gh / rows;
      const pts: Pt[] = [];
      for (let r = 0; r < rows; r++) {
        const y = (r + 0.5) * ch;
        if (r % 2 === 0) for (let c = 0; c < cols; c++) pts.push({ x: (c + 0.5) * cw, y });
        else for (let c = cols - 1; c >= 0; c--) pts.push({ x: (c + 0.5) * cw, y });
      }
      points = pts;
      prevX = pts[0].x;
      prevY = pts[0].y;
    };
    const prefillFlat = () => {
      gctx.setTransform(1, 0, 0, 1, 0, 0);
      gctx.globalCompositeOperation = "source-over";
      gctx.clearRect(0, 0, gw, gh);
      gctx.fillStyle = "rgba(146, 150, 138, 0.9)";
      gctx.fillRect(0, 0, gw, gh);
    };
    const buildFilm = () => {
      gctx.setTransform(1, 0, 0, 1, 0, 0);
      gctx.globalCompositeOperation = "source-over";
      gctx.clearRect(0, 0, gw, gh);
      const pat = gctx.createPattern(dirt, "repeat");
      if (!pat) return;
      gctx.fillStyle = pat;
      gctx.fillRect(0, 0, gw, gh);
      try {
        const id = gctx.getImageData(0, 0, gw, gh);
        const d = id.data;
        const TR = 146;
        const TG = 150;
        const TB = 138;
        const BASE = 0.9;
        const EXTRA = 0.09;
        for (let i = 0; i < d.length; i += 4) {
          const L = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const a = Math.min(0.99, BASE + (L / 255) * EXTRA);
          d[i] = TR;
          d[i + 1] = TG;
          d[i + 2] = TB;
          d[i + 3] = Math.round(a * 255);
        }
        gctx.putImageData(id, 0, 0);
      } catch {
        /* keep flat film */
      }
    };
    const eraseStroke = (x0: number, y0: number, x1: number, y1: number) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / (brushR * 0.35)));
      gctx.globalCompositeOperation = "destination-out";
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ex = x0 + dx * t;
        const ey = y0 + dy * t;
        const r = brushR * (0.92 + Math.random() * 0.14);
        const g = gctx.createRadialGradient(ex, ey, 0, ex, ey, r);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.72, "rgba(0,0,0,1)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        gctx.fillStyle = g;
        gctx.beginPath();
        gctx.arc(ex, ey, r, 0, TAU);
        gctx.fill();
      }
      gctx.globalCompositeOperation = "source-over";
    };
    const spawnBubble = (cx: number, cy: number) => {
      const off = brushR * 0.6;
      bubbles.push({
        x: cx + (Math.random() - 0.5) * off,
        y: cy + (Math.random() - 0.5) * off,
        r: (3 + Math.random() * 9) * dpr,
        vx: (-22 + Math.random() * 44) * dpr,
        vy: -(24 + Math.random() * 42) * dpr,
        phase: Math.random() * TAU,
        wob: (10 + Math.random() * 16) * dpr,
        age: 0,
        ttl: 550 + Math.random() * 800,
        pop: false,
        popAge: 0,
      });
    };
    const drawBubble = (b: Bubble, alpha: number, scale: number) => {
      const rr = b.r * scale;
      tctx.save();
      tctx.globalAlpha = alpha * 0.9;
      const g = tctx.createRadialGradient(b.x - rr * 0.3, b.y - rr * 0.3, rr * 0.1, b.x, b.y, rr);
      g.addColorStop(0, "rgba(255,255,255,0.6)");
      g.addColorStop(0.4, "rgba(222,246,236,0.2)");
      g.addColorStop(1, "rgba(200,235,220,0.05)");
      tctx.fillStyle = g;
      tctx.beginPath();
      tctx.arc(b.x, b.y, rr, 0, TAU);
      tctx.fill();
      tctx.globalAlpha = alpha * 0.6;
      tctx.lineWidth = Math.max(1, dpr);
      tctx.strokeStyle = "rgba(255,255,255,0.72)";
      tctx.beginPath();
      tctx.arc(b.x, b.y, rr, 0, TAU);
      tctx.stroke();
      tctx.globalAlpha = alpha * 0.85;
      tctx.fillStyle = "rgba(255,255,255,0.92)";
      tctx.beginPath();
      tctx.arc(b.x - rr * 0.34, b.y - rr * 0.34, Math.max(1, rr * 0.16), 0, TAU);
      tctx.fill();
      tctx.restore();
    };
    const drawTool = (x: number, y: number, p: number, dt: number, showSponge: boolean) => {
      tctx.setTransform(1, 0, 0, 1, 0, 0);
      tctx.clearRect(0, 0, gw, gh);
      const secs = dt / 1000;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.age += dt;
        b.y += b.vy * secs;
        b.x += b.vx * secs + Math.sin((b.age / 1000) * 4 + b.phase) * b.wob * secs;
        if (!b.pop && b.age >= b.ttl) b.pop = true;
        if (b.pop) b.popAge += dt;
        if (b.pop && b.popAge >= POP_MS) {
          bubbles.splice(i, 1);
          continue;
        }
        const scale = b.pop ? 1 + (b.popAge / POP_MS) * 0.7 : 1;
        const alpha = b.pop ? Math.max(0, 1 - b.popAge / POP_MS) : Math.min(1, b.age / 150);
        drawBubble(b, alpha, scale);
      }
      if (showSponge && spongeReady) {
        tctx.save();
        tctx.translate(x, y);
        tctx.rotate(Math.sin(p * Math.PI * 3) * 0.05);
        tctx.drawImage(sponge, -spongeS / 2, -spongeS / 2, spongeS, spongeS);
        tctx.restore();
      }
    };
    const frame = (now: number) => {
      if (cancelled) return;
      if (startT == null) {
        startT = now;
        lastT = now;
        lastSpawn = now;
      }
      const dt = Math.min(50, now - lastT);
      lastT = now;
      const gp = (now - startT) / SCRUB_MS;
      const segs = Math.max(1, points.length - 1);
      if (gp < 1) {
        const f = gp * segs;
        const i = Math.min(segs - 1, Math.floor(f));
        const lt = f - i;
        const a = points[i];
        const b = points[i + 1];
        const e = easeInOut(lt);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const wob = Math.sin(lt * Math.PI) * brushR * 0.16;
        const x = a.x + dx * e + nx * wob;
        const y = a.y + dy * e + ny * wob;
        eraseStroke(prevX, prevY, x, y);
        prevX = x;
        prevY = y;
        if (now - lastSpawn > SPAWN_MS && bubbles.length < MAX_BUBBLES) {
          lastSpawn = now;
          const n = 1 + Math.floor(Math.random() * 3);
          for (let k = 0; k < n && bubbles.length < MAX_BUBBLES; k++) spawnBubble(x, y);
        }
        drawTool(x, y, gp, dt, true);
      } else {
        if (!cleared) {
          cleared = true;
          tailStart = now;
          gctx.setTransform(1, 0, 0, 1, 0, 0);
          gctx.globalCompositeOperation = "source-over";
          gctx.clearRect(0, 0, gw, gh);
        }
        drawTool(0, 0, 1, dt, false);
        if (bubbles.length === 0 || now - tailStart >= TAIL_MS) {
          finish();
          return;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      if (cleared) return;
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        computeSize();
        if (dirtLoaded) buildFilm();
        else prefillFlat();
        startT = null;
        bubbles.length = 0;
      });
    };

    computeSize();
    prefillFlat();
    dirt.onload = () => {
      if (cancelled) return;
      dirtLoaded = true;
      buildFilm();
      raf = requestAnimationFrame(frame);
    };
    dirt.onerror = () => {
      if (!cancelled) finish();
    };
    sponge.onload = () => {
      spongeReady = true;
    };
    sponge.onerror = () => {
      spongeReady = false;
    };
    dirt.src = DIRT_SRC;
    sponge.src = SPONGE_SRC;
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
    };
  }, [heroRef]);

  if (!mounted) return null;
  return createPortal(
    <div ref={wrapRef} aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none" }}>
      <canvas ref={grimeRef} style={{ position: "absolute", inset: 0, display: "block" }} />
      <canvas ref={toolRef} style={{ position: "absolute", inset: 0, display: "block" }} />
    </div>,
    document.body
  );
}

/* ===== shared bits ===== */
const HERO_IMAGES = {
  air: "/assets/healthier_air.jpg",
  families: "/assets/happier_families.avif",
  mornings: "/assets/fresher_mornings.avif",
  earth: "/assets/greener_earth.avif",
  pets: "/assets/safer_for_pets.jpg",
};

function PrimaryBtn({ go, label = "Book Your Clean" }: { go: Go; label?: string }) {
  return (
    <button className="btn btn-primary" onClick={() => go("booking")} style={{ background: "var(--eco-green-light)", color: "var(--eco-green-dark)" }}>
      {label} <Icon name="arrow-right" size={16} />
    </button>
  );
}

const WHITE = "Cleaner homes.";

/* ===== Scene 1 — Healthier air ===== */
function SceneAir({ go }: { go: Go }) {
  return (
    <div className="scene scene-air" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
      <img className="air-bg" src={HERO_IMAGES.air} alt="A person breathing fresh air outdoors under a blue sky" loading="eager" />
      <div className="air-scrim" aria-hidden="true" />
      <div className="container-x" style={{ position: "relative", width: "100%" }}>
        <div className="scene-rise" style={{ maxWidth: 600 }}>
          <span className="hero-eyebrow"><Icon name="wind" size={14} /> Breathe easier indoors</span>
          <h1 className="hero-h1 hero-h1-xl">
            {WHITE}<br /><span style={{ color: "var(--eco-green-light)" }}>Healthier air.</span>
          </h1>
          <p className="hero-sub" style={{ maxWidth: 520 }}>
            Plant-based products leave no synthetic fumes and no harsh residue — just genuinely cleaner air in every room you breathe.
          </p>
          <div className="hero-btns">
            <PrimaryBtn go={go} />
            <button className="btn btn-outline-light" onClick={() => go("services")}>Why plant-based</button>
          </div>
          <div className="air-chips">
            <span className="hero-pill-soft"><Icon name="check-circle" size={14} /> Zero synthetic fragrance</span>
            <span className="hero-pill-soft"><Icon name="droplet" size={14} /> VOC-free formulas</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Scene 2 — Happier families ===== */
function SceneFamilies({ go }: { go: Go }) {
  return (
    <div className="scene scene-fam" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
      <img className="fam-bg" src={HERO_IMAGES.families} alt="A family together in a sunlit field at golden hour" loading="eager" />
      <div className="fam-scrim" aria-hidden="true" />
      <div className="container-x" style={{ position: "relative", width: "100%" }}>
        <div className="scene-rise" style={{ maxWidth: 580 }}>
          <span className="hero-eyebrow"><Icon name="users" size={14} /> Loved by 500+ GTA families</span>
          <h1 className="hero-h1">
            {WHITE}<br /><span style={{ color: "var(--eco-green-light)" }}>Happier families.</span>
          </h1>
          <p className="hero-sub" style={{ maxWidth: 500 }}>
            Safe for the whole household — kids, pets and the people you love. A spotless home with nothing to worry about.
          </p>
          <div className="fam-badges">
            {["Kid-safe", "Pet-safe", "Non-toxic", "Hypoallergenic"].map((b) => (
              <span key={b} className="fam-badge"><Icon name="check" size={13} /> {b}</span>
            ))}
          </div>
          <div className="hero-btns">
            <PrimaryBtn go={go} />
            <button className="btn btn-outline-light" onClick={() => go("subscriptions")}>See family plans</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Scene 3 — Fresher mornings ===== */
function SceneMornings({ go }: { go: Go }) {
  return (
    <div className="scene scene-morn" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end" }}>
      <img className="morn-img" src={HERO_IMAGES.mornings} alt="Sunrise over misty green hills" loading="eager" />
      <div className="morn-tint" aria-hidden="true" />
      <div className="morn-scrim" aria-hidden="true" />
      <div className="container-x" style={{ position: "relative", width: "100%", paddingBottom: "clamp(48px, 9vh, 96px)" }}>
        <div className="scene-rise" style={{ maxWidth: 620 }}>
          <span className="hero-eyebrow"><Icon name="sparkles" size={14} /> Wake up to clean</span>
          <h1 className="hero-h1">
            {WHITE}<br /><span style={{ color: "#BFF0CF" }}>Fresher mornings.</span>
          </h1>
          <p className="hero-sub" style={{ maxWidth: 520 }}>
            Wake up to spaces that feel renewed. Consistent, eco-friendly cleaning that keeps every morning bright and calm.
          </p>
          <div className="hero-btns">
            <PrimaryBtn go={go} />
            <button className="btn btn-outline-light" onClick={() => go("subscriptions")}>Set a routine</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Scene 4 — Greener earth ===== */
function SceneEarth({ go }: { go: Go }) {
  return (
    <div className="scene scene-earth" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
      <img className="earth-bg" src={HERO_IMAGES.earth} alt="A lush green planet" loading="eager" />
      <div className="earth-scrim" aria-hidden="true" />
      <div className="earth-glow" aria-hidden="true" />
      <div className="container-x" style={{ position: "relative", width: "100%" }}>
        <div className="scene-rise" style={{ maxWidth: 600 }}>
          <span className="hero-eyebrow"><Icon name="globe" size={14} /> Kinder to the planet</span>
          <h1 className="hero-h1">
            {WHITE}<br /><span style={{ color: "var(--eco-green-light)" }}>Greener earth.</span>
          </h1>
          <p className="hero-sub" style={{ maxWidth: 500 }}>
            Biodegradable, non-toxic and better for the world outside your door. A cleaner home that doesn't cost the earth.
          </p>
          <div className="hero-btns">
            <PrimaryBtn go={go} />
            <button className="btn btn-outline-light" onClick={() => go("about")}>Our eco promise</button>
          </div>
          <div className="earth-meta">
            <span><strong>0</strong> harsh chemicals</span>
            <span className="earth-dot">·</span>
            <span><strong>100%</strong> biodegradable</span>
            <span className="earth-dot">·</span>
            <span><strong>Recyclable</strong> packaging</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Scene 5 — Safer for pets ===== */
function ScenePets({ go }: { go: Go }) {
  return (
    <div className="scene scene-pets" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
      <img className="pets-bg" src={HERO_IMAGES.pets} alt="A happy puppy in a freshly cleaned home" loading="eager" />
      <div className="pets-scrim" aria-hidden="true" />
      <div className="container-x" style={{ position: "relative", width: "100%" }}>
        <div className="scene-rise" style={{ maxWidth: 580 }}>
          <span className="hero-eyebrow"><Icon name="leaf" size={14} /> Paw-approved</span>
          <h1 className="hero-h1 pets-h1">
            {WHITE}<br /><span className="pets-green">Safer for pets.</span>
          </h1>
          <p className="hero-sub" style={{ maxWidth: 500 }}>
            Pet-safe, plant-based formulas with no harsh chemicals on the floors and surfaces your furry friends love.
          </p>
          <div className="hero-btns">
            <PrimaryBtn go={go} />
            <button className="btn btn-outline-light" onClick={() => go("services")}>What we use</button>
          </div>
          <div className="pets-tag-row">
            <span className="hero-pill-soft"><Icon name="check-circle" size={14} /> Non-toxic floors</span>
            <span className="hero-pill-soft"><Icon name="droplet" size={14} /> No harsh residue</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const HERO_SCENES = [SceneAir, SceneFamilies, SceneMornings, SceneEarth, ScenePets];
const ROTATE_MS = 7000;

// Module-level: the sponge reveal plays only on the first Hero mount per page
// load. Client-side navigations back to Home (which remount Hero) skip it.
// A full browser reload re-evaluates this module, so it plays again then.
let spongeHasPlayed = false;

function shuffled<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Hero() {
  const go = useGo();
  const heroRef = useRef<HTMLElement>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [runOverlay] = useState(() => !reduced && !spongeHasPlayed);
  useEffect(() => {
    spongeHasPlayed = true;
  }, []);
  // Randomize both the order AND the first scene shown, fresh on every mount.
  const [order] = useState(() => shuffled(HERO_SCENES.map((_, i) => i)));
  const [pos, setPos] = useState(0);
  const activeIdx = order[pos];
  const [rotateOn, setRotateOn] = useState(false);
  const [hoverFocus, setHoverFocus] = useState(false);
  const [frozen, setFrozen] = useState(false);

  // Begin rotation only after the sponge reveal finishes (or skip entirely
  // under reduced-motion). If no overlay runs, start after a short beat.
  const enableRotation = useCallback(() => {
    if (!reduced) setRotateOn(true);
  }, [reduced]);
  useEffect(() => {
    if (reduced || runOverlay) return; // overlay's onDone handles enabling
    const t = setTimeout(enableRotation, 400);
    return () => clearTimeout(t);
  }, [reduced, runOverlay, enableRotation]);

  const paused = hoverFocus || frozen;
  useEffect(() => {
    if (!rotateOn || paused || reduced) return;
    const id = setInterval(() => setPos((p) => (p + 1) % order.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [rotateOn, paused, reduced, order.length]);

  const sceneStyle = (active: boolean): CSSProperties => ({
    position: "absolute",
    inset: 0,
    opacity: active ? 1 : 0,
    visibility: active ? "visible" : "hidden",
    transition: active ? "opacity 1s ease" : "opacity 1s ease, visibility 0s linear 1s",
    willChange: "opacity",
  });

  return (
    <section
      ref={heroRef}
      className="hero-rotator"
      style={{ position: "relative", overflow: "hidden", minHeight: "calc(var(--hero-h) + var(--nav-h, 112px))", marginTop: "calc(-1 * var(--nav-h, 112px))" }}
      onFocusCapture={() => setHoverFocus(true)}
      onBlurCapture={() => setHoverFocus(false)}
      onPointerDownCapture={() => setFrozen(true)}
      onMouseEnter={() => setHoverFocus(true)}
      onMouseLeave={() => setHoverFocus(false)}
    >
      {runOverlay && <SpongeCleanOverlay heroRef={heroRef} onDone={enableRotation} />}
      {HERO_SCENES.map((S, i) => {
        const active = i === activeIdx;
        return (
          <div key={i} className={`hero-scene ${active ? "is-active" : ""}`} style={sceneStyle(active)} aria-hidden={!active}>
            <S go={go} />
          </div>
        );
      })}

      <style>{`
        .hero-rotator { --hero-h: clamp(660px, 88vh, 860px); }
        /* content clears the overlaid nav; full-bleed scene images still fill behind it */
        .hero-scene .scene { padding-top: var(--nav-h, 112px); }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 99px;
          background: rgba(109,200,144,0.16); color: #B6E3C7;
          font-size: 13px; font-weight: 600; margin-bottom: 24px;
        }
        .hero-h1 { font-size: clamp(40px, 6vw, 74px); color: #fff; margin-bottom: 22px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.02; }
        .hero-h1-xl { font-size: clamp(44px, 7vw, 88px); }
        .hero-sub { color: rgba(255,255,255,0.80); font-size: 19px; margin-bottom: 30px; }
        .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
        .hero-pill-soft {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 13px; border-radius: 99px; font-size: 13px; font-weight: 600;
          color: #CDEBD7; background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
        }

        /* entrance for the active scene's content */
        @media (prefers-reduced-motion: no-preference) {
          .hero-scene .scene-rise { opacity: 0.001; }
          .hero-scene.is-active .scene-rise { animation: heroRise .85s cubic-bezier(.2,.7,.2,1) both; }
        }
        @keyframes heroRise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }

        /* ---- Scene 1: Air ---- */
        .air-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 62% center; }
        @media (prefers-reduced-motion: no-preference) {
          .hero-scene.is-active .air-bg { animation: airDrift 16s ease-in-out infinite; }
        }
        @keyframes airDrift { 0%,100% { transform: scale(1.04); } 50% { transform: scale(1.1); } }
        .air-scrim { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(8,26,19,0.92) 0%, rgba(8,26,19,0.78) 34%, rgba(8,26,19,0.4) 58%, rgba(8,26,19,0.08) 78%), linear-gradient(180deg, rgba(8,26,19,0.4), transparent 30%, transparent 60%, rgba(8,26,19,0.45)); }
        .air-chips { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 26px; }

        /* ---- Scene 2: Families ---- */
        .fam-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 60%; }
        @media (prefers-reduced-motion: no-preference) {
          .hero-scene.is-active .fam-bg { animation: airDrift 16s ease-in-out infinite; }
        }
        .fam-scrim { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(8,26,19,0.9) 0%, rgba(8,26,19,0.74) 34%, rgba(8,26,19,0.36) 58%, rgba(8,26,19,0.06) 80%), linear-gradient(180deg, rgba(8,26,19,0.42), transparent 32%, transparent 64%, rgba(8,26,19,0.4)); }
        .fam-badges { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 28px; }
        .fam-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 99px; font-size: 13px; font-weight: 700;
          color: var(--eco-green-dark); background: var(--eco-green-light);
        }

        /* ---- Scene 3: Mornings ---- */
        .morn-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 40%; }
        .morn-tint { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(16,52,40,0.25), rgba(11,38,26,0.45)); mix-blend-mode: multiply; }
        .morn-scrim { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(7,22,15,0.86) 0%, rgba(7,22,15,0.55) 38%, rgba(7,22,15,0.06) 70%), linear-gradient(0deg, rgba(7,22,15,0.7), transparent 55%); }

        /* ---- Scene 4: Earth ---- */
        .earth-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 42%; }
        @media (prefers-reduced-motion: no-preference) {
          .hero-scene.is-active .earth-bg { animation: earthDrift 14s ease-in-out infinite; }
        }
        @keyframes earthDrift { 0%,100% { transform: scale(1.04); } 50% { transform: scale(1.1); } }
        .earth-scrim { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(6,20,14,0.88) 0%, rgba(6,20,14,0.6) 42%, rgba(6,20,14,0.12) 72%), linear-gradient(0deg, rgba(6,20,14,0.62), transparent 50%); }
        .earth-glow { position: absolute; right: 4%; top: 18%; width: 380px; height: 380px; background: radial-gradient(circle, rgba(109,200,144,0.22), transparent 65%); filter: blur(24px); pointer-events: none; }
        .earth-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 26px; color: rgba(255,255,255,0.78); font-size: 14px; }
        .earth-meta strong { color: #fff; }
        .earth-dot { color: rgba(255,255,255,0.3); }

        /* ---- Scene 5: Pets ---- */
        .pets-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 78% 22%; }
        @media (prefers-reduced-motion: no-preference) {
          .hero-scene.is-active .pets-bg { animation: petsDrift 16s ease-in-out infinite; }
        }
        @keyframes petsDrift { 0%,100% { transform: scale(1.05); } 50% { transform: scale(1.11); } }
        .pets-scrim { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(8,28,19,0.94) 0%, rgba(8,28,19,0.82) 30%, rgba(8,28,19,0.42) 54%, rgba(8,28,19,0.06) 74%), linear-gradient(0deg, rgba(8,28,19,0.55), transparent 46%); }
        .pets-h1 .pets-green { color: var(--eco-green-light); font-size: 1.12em; display: inline-block; }
        .pets-tag-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 26px; }

        /* ---- Responsive ---- */
        @media (max-width: 960px) {
          .hero-rotator { --hero-h: clamp(620px, 96vh, 820px); }
          .earth-bg { object-position: center 38%; }
          .pets-bg { object-position: 72% 20%; }
          .air-bg { object-position: 58% center; }
          .fam-bg { object-position: 60% 62%; }
          .hero-h1, .hero-h1-xl { font-size: clamp(38px, 11vw, 60px); }
          .pets-h1 .pets-green { font-size: 1em; }
        }
        @media (max-width: 600px) {
          .fam-badges { gap: 8px; }
          .hero-sub { font-size: 17px; }
          .scene { align-items: center; }
        }
      `}</style>
    </section>
  );
}

function TrustGrid() {
  const items: { icon: IconName; title: string; desc: string }[] = [
    { icon: "thumbs-up", title: "100% Satisfaction", desc: "We guarantee it — if you're not happy, we re-clean for free." },
    { icon: "users", title: "Vetted Eco Team", desc: "Background-checked, trained and insured cleaning specialists." },
    { icon: "credit-card", title: "Upfront Pricing", desc: "Transparent flat-rate pricing with no hidden fees, ever." },
    { icon: "lock", title: "Secure Booking", desc: "Encrypted online booking and payment after service." },
  ];
  return (
    <section style={{ background: "#fff", padding: "80px 0", borderBottom: "1px solid var(--eco-line)" }}>
      <div className="container-x">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }} className="trust-grid">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 80}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "var(--eco-cream-2)",
                    color: "var(--eco-green)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={it.icon} size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{it.title}</div>
                  <div style={{ color: "var(--eco-muted)", fontSize: 14 }}>{it.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 880px){.trust-grid{grid-template-columns:1fr 1fr !important;}}@media (max-width:520px){.trust-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}

function ServicesPreview() {
  const go = useGo();
  const featured = SERVICES.slice(0, 5);
  return (
    <section>
      <div className="container-x">
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, gap: 40, flexWrap: "wrap" }}>
            <div>
              <span className="eyebrow">Our Services</span>
              <h2 style={{ fontSize: "clamp(34px, 4.5vw, 56px)", marginTop: 14, maxWidth: 640 }}>
                Everything your home needs — <span style={{ color: "var(--eco-green)" }}>none of the chemicals</span>.
              </h2>
            </div>
            <button className="btn btn-ghost" onClick={() => go("services")}>
              View all services <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="svc-preview-grid">
          {featured.map((s, i) => (
            <Reveal key={s.id} delay={i * 70}>
              <div className="card" style={{ padding: 26, height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                {s.popular && (
                  <span
                    style={{
                      position: "absolute",
                      top: 18,
                      right: 18,
                      background: "var(--eco-green-light)",
                      color: "var(--eco-green-dark)",
                      padding: "4px 10px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Popular
                  </span>
                )}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "var(--eco-cream-2)",
                    color: "var(--eco-green)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Icon name={s.icon as IconName} size={26} />
                </div>
                <h3 style={{ fontSize: 22, marginBottom: 10 }}>{s.name}</h3>
                <p style={{ color: "var(--eco-muted)", fontSize: 14, marginBottom: 20 }}>{s.desc}</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "auto",
                    paddingTop: 18,
                    borderTop: "1px solid var(--eco-line)",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "var(--eco-green)" }}>{s.priceLabel}</span>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "8px 14px", fontSize: 13 }}
                    onClick={() => go("booking", { service: s.id })}
                  >
                    Book <Icon name="arrow-right" size={14} />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={featured.length * 70}>
            <div
              className="card"
              style={{
                padding: 26,
                height: "100%",
                background: "linear-gradient(160deg, var(--eco-green) 0%, var(--eco-green-dark) 100%)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: "none",
              }}
            >
              <div>
                <Icon name="sparkles" size={26} />
                <h3 style={{ fontSize: 22, marginTop: 18, marginBottom: 10, color: "#fff" }}>Not sure which clean?</h3>
                <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 14 }}>
                  Take our 30-second quiz and we'll recommend the right service for your home.
                </p>
              </div>
              <button
                className="btn btn-accent"
                style={{ background: "#fff", color: "var(--eco-green-dark)", marginTop: 22, alignSelf: "flex-start" }}
                onClick={() => go("services")}
              >
                Find my service <Icon name="arrow-right" size={16} />
              </button>
            </div>
          </Reveal>
        </div>
      </div>
      <style>{`@media (max-width: 980px){.svc-preview-grid{grid-template-columns:1fr 1fr !important;}}@media (max-width:600px){.svc-preview-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}

function HowItWorks() {
  const steps: { n: string; icon: IconName; title: string; desc: string }[] = [
    { n: "01", icon: "spray", title: "Pick your service", desc: "Choose from one-time cleans, subscriptions or commercial." },
    { n: "02", icon: "calendar", title: "Schedule online", desc: "Pick a date and time that works — even same-day in many areas." },
    { n: "03", icon: "users", title: "We arrive & clean", desc: "Our vetted, eco-trained team brings everything — you don't lift a finger." },
    { n: "04", icon: "sparkles", title: "Enjoy your space", desc: "Sit back and breathe in your fresh, chemical-free home." },
  ];
  return (
    <section style={{ background: "var(--eco-cream-2)" }}>
      <div className="container-x">
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="eyebrow">How it works</span>
            <h2 style={{ fontSize: "clamp(34px, 4.5vw, 52px)", marginTop: 14, maxWidth: 720, margin: "14px auto 0" }}>
              From booking to breathing easy — in <span style={{ color: "var(--eco-green)" }}>under a minute</span>.
            </h2>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, position: "relative" }} className="how-grid">
          <div
            style={{
              position: "absolute",
              top: 36,
              left: "12.5%",
              right: "12.5%",
              height: 2,
              background: "repeating-linear-gradient(90deg, var(--eco-green-soft) 0 6px, transparent 6px 12px)",
              zIndex: 0,
            }}
            className="hide-on-mobile-only"
          />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "#fff",
                    color: "var(--eco-green)",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 18px",
                    boxShadow: "var(--shadow-sm)",
                    border: "3px solid var(--eco-cream-2)",
                    position: "relative",
                  }}
                >
                  <Icon name={s.icon} size={28} />
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      background: "var(--eco-green)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 6px",
                      borderRadius: 99,
                    }}
                  >
                    {s.n}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: "var(--eco-muted)", fontSize: 14 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 880px){.how-grid{grid-template-columns:1fr 1fr !important;}.hide-on-mobile-only{display:none;}}@media (max-width:520px){.how-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}

function WhyUs() {
  const items: { icon: IconName; title: string; desc: string }[] = [
    { icon: "leaf", title: "100% Plant-Based Products", desc: "Every product we use is biodegradable, non-toxic and free of synthetic fragrances." },
    { icon: "users", title: "Trained Cleaning Specialists", desc: "Background-checked, fully trained, and treated well — happy teams clean better." },
    { icon: "shield", title: "Bonded & Insured", desc: "Full liability and bonding coverage on every clean. Total peace of mind." },
    { icon: "credit-card", title: "Flat-Rate Pricing", desc: "Upfront flat-rate pricing — no surprise fees, no upsells, ever." },
    { icon: "headphones", title: "Real Human Support", desc: "Talk to a real person within minutes — not a chatbot, not a queue." },
    { icon: "calendar", title: "Flexible Scheduling", desc: "Reschedule or cancel free up to 24 hours before. Subscription paused anytime." },
  ];
  return (
    <section>
      <div className="container-x">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 60, alignItems: "center" }} className="why-grid">
          <Reveal>
            <span className="eyebrow">Why Eco Elan</span>
            <h2 style={{ fontSize: "clamp(34px, 4.5vw, 52px)", marginTop: 14, marginBottom: 18 }}>
              Premium clean.
              <br />
              <span style={{ color: "var(--eco-green)" }}>Zero compromise.</span>
            </h2>
            <p style={{ color: "var(--eco-muted)", fontSize: 17, marginBottom: 28 }}>
              We've spent four years building a cleaning service that treats your health, your home, and your time the way they deserve. Here's what makes us different.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, padding: 24, background: "var(--eco-cream-2)", borderRadius: 22 }}>
              <div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "var(--eco-green)", letterSpacing: "-0.03em" }}>
                  <Counter to={500} suffix="+" />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--eco-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                  }}
                >
                  Happy Clients
                </div>
              </div>
              <div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "var(--eco-green)", letterSpacing: "-0.03em" }}>
                  <Counter to={4} />+ yrs
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--eco-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                  }}
                >
                  Serving the GTA
                </div>
              </div>
              <div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "var(--eco-green)", letterSpacing: "-0.03em" }}>
                  <Counter to={100} suffix="%" />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--eco-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                  }}
                >
                  Plant-based
                </div>
              </div>
              <div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "var(--eco-green)", letterSpacing: "-0.03em" }}>
                  4.9<span style={{ fontSize: 22 }}>★</span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--eco-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                  }}
                >
                  Google Rating
                </div>
              </div>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="why-cards">
            {items.map((it, i) => (
              <Reveal key={it.title} delay={i * 60}>
                <div className="card" style={{ padding: 22, height: "100%" }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "var(--eco-cream-2)",
                      color: "var(--eco-green)",
                      display: "grid",
                      placeItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <Icon name={it.icon} size={20} />
                  </div>
                  <h3 style={{ fontSize: 16, marginBottom: 8 }}>{it.title}</h3>
                  <p style={{ color: "var(--eco-muted)", fontSize: 13.5 }}>{it.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 980px){.why-grid{grid-template-columns:1fr !important;}}@media (max-width:600px){.why-cards{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}

function Testimonials() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % TESTIMONIALS.length), 6500);
    return () => clearInterval(id);
  }, []);

  const avatars = [IMG.av_w1, IMG.av_m1, IMG.av_w2, IMG.av_m2];

  return (
    <section style={{ background: "var(--eco-green-dark)", color: "#fff" }}>
      <div className="container-x">
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="eyebrow" style={{ color: "var(--eco-green-light)" }}>
              Client Success
            </span>
            <h2 style={{ fontSize: "clamp(34px, 4.5vw, 52px)", marginTop: 14, color: "#fff", maxWidth: 760, margin: "14px auto 0" }}>
              Toronto's <span style={{ color: "var(--eco-green-light)" }}>top-rated</span> eco-cleaning team.
            </h2>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", maxWidth: 880, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 28,
                padding: 40,
                position: "relative",
                minHeight: 280,
              }}
            >
              <Icon name="sparkles" size={28} stroke={1.6} />
              <div style={{ position: "relative", marginTop: 24, minHeight: 130 }}>
                {TESTIMONIALS.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      position: i === active ? "relative" : "absolute",
                      inset: 0,
                      opacity: i === active ? 1 : 0,
                      transition: "opacity .5s",
                      pointerEvents: i === active ? "auto" : "none",
                    }}
                  >
                    <div style={{ display: "flex", gap: 4, color: "var(--eco-accent)", marginBottom: 16 }}>
                      {Array.from({ length: t.rating }).map((_, k) => (
                        <Icon key={k} name="star" size={18} />
                      ))}
                    </div>
                    <p style={{ fontSize: 22, lineHeight: 1.45, color: "#fff", fontWeight: 500, letterSpacing: "-0.01em" }}>
                      "{t.quote}"
                    </p>
                    <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
                      <img
                        src={avatars[i]}
                        alt={t.name}
                        style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div>
                        <div style={{ fontWeight: 700 }}>{t.name}</div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 30 }}>
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  style={{
                    width: i === active ? 40 : 10,
                    height: 10,
                    borderRadius: 99,
                    border: "none",
                    background: i === active ? "var(--eco-green-light)" : "rgba(255,255,255,0.2)",
                    transition: "all .3s",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <TrustGrid />
      <ServicesPreview />
      <HowItWorks />
      <WhyUs />
      <Testimonials />
      <FaqSection />
      <FinalCTA />
    </>
  );
}
