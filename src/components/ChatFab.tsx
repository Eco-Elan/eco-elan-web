import { Icon } from "./Icon";

export function ChatFab() {
  const phone = "14372654977";
  const msg = encodeURIComponent("Hi Eco Elan — I'd like to ask about your cleaning services.");
  return (
    <a
      className="chat-fab"
      href={`https://wa.me/${phone}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      style={{ background: "#25D366", color: "#fff", textDecoration: "none" }}
    >
      <Icon name="whatsapp" size={28} />
    </a>
  );
}
