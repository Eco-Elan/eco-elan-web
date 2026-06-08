export type BookingData = {
  service: string;
  size: string;
  addons: string[];
  date: Date | null;
  time: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  notes: string;
  /** Set once Stripe confirms the PaymentIntent (drives the receipt screen). */
  paymentStatus?: "succeeded";
  paymentIntentId?: string;
};
