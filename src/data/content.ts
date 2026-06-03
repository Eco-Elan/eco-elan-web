export type Service = {
  id: string;
  name: string;
  desc: string;
  price: number;
  priceLabel: string;
  icon: string;
  popular?: boolean;
};

export type Addon = { id: string; name: string; price: number };
export type PropertySize = { id: string; label: string; mult: number };
export type Plan = {
  id: string;
  name: string;
  tag: string;
  desc: string;
  prices: number[];
  badge: string | null;
  accent: boolean;
  host?: boolean;
};
export type Testimonial = { name: string; role: string; quote: string; rating: number };
export type Faq = { q: string; a: string };

export const SERVICES: Service[] = [
  { id: "standard", name: "Standard Eco Cleaning", desc: "Recurring maintenance clean with eco-safe, plant-based products.", price: 110, priceLabel: "From $110", icon: "home" },
  { id: "deep", name: "Deep Eco Cleaning", desc: "Full-detail premium clean — buildup, baseboards, behind appliances.", price: 200, priceLabel: "From $200", icon: "sparkles", popular: true },
  { id: "movein", name: "Move-In / Move-Out", desc: "Top-to-bottom clean for empty homes — fridge, oven, cabinets, the works.", price: 240, priceLabel: "From $240", icon: "truck" },
  { id: "airbnb", name: "Airbnb Turnover", desc: "Fast, consistent turnover with linen swap available. Built for hosts.", price: 120, priceLabel: "From $120", icon: "bed" },
  { id: "office", name: "Office / Commercial", desc: "Healthier workspaces with non-toxic products. Daily, weekly or custom.", price: 50, priceLabel: "From $50/hr", icon: "building" },
];

export const ADDONS: Addon[] = [
  { id: "fridge", name: "Inside Fridge", price: 20 },
  { id: "oven", name: "Inside Oven", price: 25 },
  { id: "windows", name: "Windows (Interior)", price: 10 },
  { id: "cabinets", name: "Inside Cabinets", price: 30 },
  { id: "laundry", name: "Laundry", price: 25 },
  { id: "balcony", name: "Balcony Cleaning", price: 25 },
];

export const PROPERTY_SIZES: PropertySize[] = [
  { id: "studio", label: "Studio", mult: 0.8 },
  { id: "1br", label: "1 Bedroom", mult: 1.0 },
  { id: "2br", label: "2 Bedroom", mult: 1.25 },
  { id: "3br", label: "3 Bedroom", mult: 1.55 },
  { id: "4br", label: "4 Bedroom", mult: 1.95 },
];

export const PLANS: Plan[] = [
  { id: "weekly", name: "Fresh Weekly", tag: "Once per week", desc: "Ideal for families, pet owners, busy homes.", prices: [112, 138, 173, 246], badge: null, accent: false },
  { id: "biweekly", name: "Eco Essential Bi-Weekly", tag: "Every two weeks · 10% off standard", desc: "Regular households, condos, professionals.", prices: [124, 152, 191, 272], badge: "Most Popular", accent: true },
  { id: "monthly", name: "Pure Monthly", tag: "Once per month", desc: "Light-traffic homes, minimalists, seniors.", prices: [136, 167, 209, 298], badge: null, accent: false },
  { id: "airbnb", name: "Airbnb Host", tag: "Per booking · Custom cadence", desc: "Perfect for vacation rental hosts.", prices: [80, 100, 140, 170], badge: null, accent: false, host: true },
];

export const TESTIMONIALS: Testimonial[] = [
  { name: "Sarah M.", role: "Etobicoke · Bi-Weekly", quote: "Truly the best cleaning service I've used. The team was professional, kind and the place hasn't smelled this fresh in months. Booked them on the spot for biweekly.", rating: 5 },
  { name: "James R.", role: "North York · Deep Clean", quote: "I'm allergic to most cleaning products — Eco Elan was the first service that didn't trigger anything. Real difference, real shine.", rating: 5 },
  { name: "Elena K.", role: "Downtown · Move-Out", quote: "Incredible attention to detail. They got the spots I usually miss. The move-out clean was worth every penny — landlord couldn't believe it.", rating: 5 },
  { name: "Marcus T.", role: "Yorkville · Airbnb Host", quote: "I host four units across the GTA — Eco Elan's turnover team is the most reliable I've ever worked with. Linen swap is a game changer.", rating: 5 },
];

export const FAQS: Faq[] = [
  { q: "What areas do you service?", a: "We serve Toronto and the entire GTA — including Mississauga, Etobicoke, North York, Scarborough, Brampton, Markham, Vaughan, Richmond Hill, Oakville, Burlington, Ajax and Whitby." },
  { q: "Do you bring your own cleaning supplies?", a: "Yes. We arrive with everything we need — 100% plant-based, biodegradable, non-toxic products and professional-grade equipment. If you'd prefer we use products you provide, just let us know." },
  { q: "Are your products safe for kids and pets?", a: "Absolutely. Every product we use is biodegradable, plant-based and free of harsh chemicals or synthetic fragrances. They're safe for children, pets and people with sensitivities." },
  { q: "How do I book my first appointment?", a: "Use the Book Now button — pick a service, choose a date and time, fill in your details, confirm. You'll get an email confirmation within minutes and a phone follow-up within 24 hours." },
  { q: "Can I cancel or reschedule?", a: "Yes — free cancellation or reschedule up to 24 hours before your appointment. Subscriptions can be paused or cancelled anytime from your account." },
  { q: "What is your satisfaction guarantee?", a: "If you're not happy with your clean, let us know within 24 hours and we'll return to re-clean the area at no charge. No questions asked." },
];

export const AREAS = ["Toronto","Mississauga","Brampton","Etobicoke","North York","Scarborough","Vaughan","Markham","Richmond Hill","Oakville","Burlington","Ajax","Whitby"];

export const U = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const IMG = {
  hero: U("1600585154340-be6161a56a0c", 900),
  cta: U("1556909114-f6e7ad7d3136", 800),
  founder: U("1583947215259-38e31be8751f", 800),
  service_standard: U("1581578731548-c64695cc6952", 800),
  service_deep: U("1583847268964-b28dc8f51f92", 800),
  service_movein: U("1493809842364-78817add7ffb", 800),
  service_airbnb: U("1522771739844-6a9f6d5f14af", 800),
  service_office: U("1497366216548-37526070297c", 800),
  av_w1: "https://randomuser.me/api/portraits/women/44.jpg",
  av_w2: "https://randomuser.me/api/portraits/women/68.jpg",
  av_w3: "https://randomuser.me/api/portraits/women/12.jpg",
  av_m1: "https://randomuser.me/api/portraits/men/32.jpg",
  av_m2: "https://randomuser.me/api/portraits/men/85.jpg",
};
