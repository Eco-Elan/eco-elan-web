import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ChatFab } from "./components/ChatFab";
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { CommercialPage } from "./pages/CommercialPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { BookingPage } from "./pages/BookingPage";

// Warm the browser image cache during idle time so each page's hero (and other
// key images) is already downloaded before the user navigates there. Ordered by
// likelihood of being visited next; chained sequentially so it never competes
// with the visible page's own loads.
const PREFETCH = [
  "/assets/healthier_air.jpg",
  "/assets/happier_families.avif",
  "/assets/fresher_mornings.avif",
  "/assets/greener_earth.avif",
  "/assets/safer_for_pets.jpg",
  "/assets/services_hero.png",
  "/assets/subscription_hero.jpg",
  "/assets/commercial_hero.avif",
  "/assets/about_hero.png",
  "/assets/contact_hero.jpg",
  "/assets/still-life-cleaning-tools.jpg",
];

function usePrefetchImages() {
  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const ric: (cb: () => void) => void =
      "requestIdleCallback" in window
        ? (cb) => (window as unknown as { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback(cb, { timeout: 1500 })
        : (cb) => window.setTimeout(cb, 200);
    const warmNext = () => {
      if (cancelled || i >= PREFETCH.length) return;
      const img = new Image();
      img.decoding = "async";
      img.src = PREFETCH[i++];
      img.onload = img.onerror = () => ric(warmNext);
    };
    ric(warmNext);
    return () => {
      cancelled = true;
    };
  }, []);
}

export default function App() {
  usePrefetchImages();
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/commercial" element={<CommercialPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
      <ChatFab />
    </>
  );
}
