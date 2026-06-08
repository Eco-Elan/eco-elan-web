import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { StepBar } from "./booking/StepBar";
import { StepService } from "./booking/StepService";
import { StepSchedule } from "./booking/StepSchedule";
import { StepDetails } from "./booking/StepDetails";
import { StepConfirm } from "./booking/StepConfirm";
import { StepPayment } from "./booking/StepPayment";
import { BookingConfirmed } from "./booking/BookingConfirmed";
import type { BookingData } from "./booking/types";

const steps = ["Service", "Schedule", "Details", "Confirm", "Payment"];

export function BookingPage() {
  const [params] = useSearchParams();
  const serviceParam = params.get("service");

  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState<number | null>(null);
  const [data, setData] = useState<BookingData>({
    service: serviceParam || "deep",
    size: "1br",
    addons: [],
    date: null,
    time: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal: "",
    notes: "",
  });

  useEffect(() => {
    if (serviceParam && serviceParam !== data.service) {
      // Intentional sync of the ?service= URL param into wizard state (resets
      // the flow when a different service is chosen from the navbar dropdown).
      /* eslint-disable react-hooks/set-state-in-effect */
      setData((d) => ({ ...d, service: serviceParam }));
      setStep(0);
      setConfirmed(null);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceParam]);

  if (confirmed !== null) return <BookingConfirmed data={data} total={confirmed} />;

  return (
    <>
      <section style={{ paddingBottom: 20, paddingTop: 40 }}>
        <div className="container-x" style={{ textAlign: "center", paddingTop: 40 }}>
          <h1 style={{ fontSize: "clamp(36px, 5.5vw, 60px)" }}>
            Book your <span style={{ color: "var(--eco-green)" }}>Eco Clean</span>
          </h1>
          <p style={{ color: "var(--eco-muted)", fontSize: 17, marginTop: 14 }}>
            Schedule your premium plant-based clean in a few simple steps.
          </p>
        </div>
      </section>
      <StepBar step={step} steps={steps} />
      <div style={{ paddingTop: 40, paddingBottom: 60 }}>
        {step === 0 && <StepService data={data} setData={setData} next={() => setStep(1)} />}
        {step === 1 && <StepSchedule data={data} setData={setData} next={() => setStep(2)} back={() => setStep(0)} />}
        {step === 2 && <StepDetails data={data} setData={setData} next={() => setStep(3)} back={() => setStep(1)} />}
        {step === 3 && <StepConfirm data={data} back={() => setStep(2)} next={() => setStep(4)} />}
        {step === 4 && (
          <StepPayment
            data={data}
            back={() => setStep(3)}
            onPaid={(total, paymentIntentId) => {
              setData((d) => ({ ...d, paymentStatus: "succeeded", paymentIntentId }));
              setConfirmed(total);
            }}
          />
        )}
      </div>
    </>
  );
}
