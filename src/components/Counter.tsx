import { useEffect, useRef, useState } from "react";

type CounterProps = { to: number; suffix?: string; duration?: number };

export function Counter({ to, suffix = "", duration = 1400 }: CounterProps) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) run();
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);

    // Safety net: if the observer never fires (e.g. the element is already in
    // view on load, or layout quirks keep it from intersecting), land on the
    // final value so the stat never stays stuck at 0.
    const fallback = window.setTimeout(() => {
      if (!started.current) {
        started.current = true;
        setVal(to);
      }
    }, 1600);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [to, duration]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}
