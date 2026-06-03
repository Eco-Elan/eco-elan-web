import { useState, type Dispatch, type SetStateAction } from "react";
import { Icon } from "../../components/Icon";
import { Reveal } from "../../components/Reveal";
import type { BookingData } from "./types";

function MiniCalendar({ value, onPick }: { value: Date | null; onPick: (d: Date) => void }) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
          <Icon name="calendar" size={18} style={{ color: "var(--eco-green)" }} /> {monthName}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            aria-label="Previous month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            style={{
              background: "var(--eco-cream-2)",
              border: "none",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              color: "var(--eco-green-dark)",
            }}
          >
            <Icon name="arrow-left" size={14} />
          </button>
          <button
            aria-label="Next month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            style={{
              background: "var(--eco-cream-2)",
              border: "none",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              color: "var(--eco-green-dark)",
            }}
          >
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>
      <div className="cal-grid" style={{ marginBottom: 6 }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} style={{ fontSize: 12, fontWeight: 600, color: "var(--eco-muted)", textAlign: "center", padding: 4 }}>
            {d}
          </div>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="cal-cell muted"></div>;
          const dateObj = new Date(month.getFullYear(), month.getMonth(), d);
          const past = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isToday = dateObj.toDateString() === today.toDateString();
          const selected = value && dateObj.toDateString() === value.toDateString();
          return (
            <div
              key={i}
              className={`cal-cell ${past ? "muted" : ""} ${isToday ? "today" : ""} ${selected ? "selected" : ""}`}
              onClick={() => !past && onPick(dateObj)}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Props = {
  data: BookingData;
  setData: Dispatch<SetStateAction<BookingData>>;
  next: () => void;
  back: () => void;
};

export function StepSchedule({ data, setData, next, back }: Props) {
  const slots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
  const canContinue = data.date && data.time;
  return (
    <section>
      <div className="container-x" style={{ maxWidth: 980 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>Pick a date &amp; time</h2>
            <p style={{ color: "var(--eco-muted)", marginTop: 10 }}>
              Select a schedule that works for you. Reschedule free up to 24h before.
            </p>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }} className="sched-grid">
          <Reveal>
            <MiniCalendar value={data.date} onPick={(d) => setData((s) => ({ ...s, date: d }))} />
          </Reveal>
          <Reveal delay={80}>
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 16 }}>
                <Icon name="clock" size={18} style={{ color: "var(--eco-green)" }} /> Available Time Slots
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {slots.map((t) => (
                  <div
                    key={t}
                    className={`time-slot ${data.time === t ? "selected" : ""}`}
                    onClick={() => setData((s) => ({ ...s, time: t }))}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <button className="btn btn-ghost" onClick={back}>
            <Icon name="arrow-left" size={16} /> Back
          </button>
          <button
            className="btn btn-primary"
            onClick={next}
            disabled={!canContinue}
            style={{ opacity: canContinue ? 1 : 0.5 }}
          >
            Continue <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
      <style>{`@media (max-width:880px){.sched-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}
