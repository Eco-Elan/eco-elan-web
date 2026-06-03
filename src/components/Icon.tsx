import type { CSSProperties, SVGProps } from "react";

export type IconName =
  | "leaf" | "sparkle" | "home" | "truck" | "bed" | "building" | "calendar" | "clock"
  | "shield" | "check" | "check-circle" | "x-circle" | "plus" | "minus" | "arrow-right"
  | "arrow-left" | "chevron-down" | "chevron-right" | "phone" | "mail" | "map-pin"
  | "instagram" | "facebook" | "linkedin" | "twitter" | "menu" | "close" | "star"
  | "user" | "users" | "sparkles" | "wind" | "droplet" | "award" | "globe"
  | "credit-card" | "lock" | "headphones" | "thumbs-up" | "spray" | "play"
  | "search" | "send" | "whatsapp";

type IconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
} & Omit<SVGProps<SVGSVGElement>, "name" | "stroke" | "ref">;

export function Icon({ name, size = 20, stroke = 1.8, ...rest }: IconProps) {
  const s = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
  switch (name) {
    case "leaf": return <svg {...s}><path d="M11 20A7 7 0 0 1 4 13V5a7 7 0 0 1 7 7v8Z"/><path d="M11 13c1.5-4.5 5-7 9-7-.5 5-3 8.5-7 9.5"/></svg>;
    case "sparkle": return <svg {...s}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2"/></svg>;
    case "home": return <svg {...s}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z"/></svg>;
    case "truck": return <svg {...s}><path d="M3 7h12v10H3zM15 11h4l2 3v3h-6"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>;
    case "bed": return <svg {...s}><path d="M3 18V8m18 10v-4a3 3 0 0 0-3-3H3"/><circle cx="7" cy="11" r="2"/></svg>;
    case "building": return <svg {...s}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></svg>;
    case "calendar": return <svg {...s}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case "clock": return <svg {...s}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "shield": return <svg {...s}><path d="M12 3 4 6v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "check": return <svg {...s}><path d="m5 13 4 4L19 7"/></svg>;
    case "check-circle": return <svg {...s}><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>;
    case "x-circle": return <svg {...s}><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>;
    case "plus": return <svg {...s}><path d="M12 5v14M5 12h14"/></svg>;
    case "minus": return <svg {...s}><path d="M5 12h14"/></svg>;
    case "arrow-right": return <svg {...s}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "arrow-left": return <svg {...s}><path d="M19 12H5M11 18l-6-6 6-6"/></svg>;
    case "chevron-down": return <svg {...s}><path d="m6 9 6 6 6-6"/></svg>;
    case "chevron-right": return <svg {...s}><path d="m9 6 6 6-6 6"/></svg>;
    case "phone": return <svg {...s}><path d="M22 16.92V21a1 1 0 0 1-1.09 1A19.86 19.86 0 0 1 2 5.09 1 1 0 0 1 3 4h4.09a1 1 0 0 1 1 .75l1 4a1 1 0 0 1-.27 1L7.21 11.21a16 16 0 0 0 6 6l1.46-1.61a1 1 0 0 1 1-.27l4 1a1 1 0 0 1 .76 1Z"/></svg>;
    case "mail": return <svg {...s}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg>;
    case "map-pin": return <svg {...s}><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case "instagram": return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>;
    case "facebook": return <svg {...s}><path d="M14 8h2V5h-2a3 3 0 0 0-3 3v2H9v3h2v8h3v-8h2.5l.5-3H14V8.5c0-.3.2-.5.5-.5Z"/></svg>;
    case "linkedin": return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 1 1 4 0v4M12 13v4"/></svg>;
    case "twitter": return <svg {...s}><path d="M4 4l7 9-7 7h3l5-5 4 5h4l-7-9 7-7h-3l-5 5-4-5z"/></svg>;
    case "menu": return <svg {...s}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case "close": return <svg {...s}><path d="M6 6l12 12M18 6l-12 12"/></svg>;
    case "star": return <svg {...s} fill="currentColor" stroke="none"><path d="m12 2 3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z"/></svg>;
    case "user": return <svg {...s}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>;
    case "users": return <svg {...s}><circle cx="9" cy="8" r="4"/><path d="M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1"/><path d="M16 4a4 4 0 0 1 0 8M22 21v-1a5 5 0 0 0-4-4.9"/></svg>;
    case "sparkles": return <svg {...s}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z"/><path d="M19 16l.7 1.8L21 18.5l-1.3.7L19 21l-.7-1.8L17 18.5l1.3-.7L19 16Z"/></svg>;
    case "wind": return <svg {...s}><path d="M3 8h11a3 3 0 1 0-3-3M3 12h17a3 3 0 1 1-3 3M3 16h9a3 3 0 1 1-3 3"/></svg>;
    case "droplet": return <svg {...s}><path d="M12 3s7 7 7 12a7 7 0 1 1-14 0c0-5 7-12 7-12Z"/></svg>;
    case "award": return <svg {...s}><circle cx="12" cy="9" r="6"/><path d="m8 13-2 8 6-3 6 3-2-8"/></svg>;
    case "globe": return <svg {...s}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    case "credit-card": return <svg {...s}><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg>;
    case "lock": return <svg {...s}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case "headphones": return <svg {...s}><path d="M3 17v-5a9 9 0 0 1 18 0v5M3 17a2 2 0 0 0 2 2h2v-7H5a2 2 0 0 0-2 2v3Zm18 0a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2v3Z"/></svg>;
    case "thumbs-up": return <svg {...s}><path d="M7 11v8H4v-8h3Zm0 0 4-7c2 0 3 1 3 3v3h5a2 2 0 0 1 2 2.3l-1.4 6A2 2 0 0 1 17.6 20H7"/></svg>;
    case "spray": return <svg {...s}><rect x="6" y="9" width="10" height="12" rx="2"/><path d="M11 9V5h-3V2h7v3h-3M19 5h2M19 8h2M19 11h2"/></svg>;
    case "play": return <svg {...s} fill="currentColor" stroke="none"><path d="M7 5v14l12-7z"/></svg>;
    case "search": return <svg {...s}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "send": return <svg {...s}><path d="m22 2-7 20-4-9-9-4 20-7Z"/></svg>;
    case "whatsapp": return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...rest}>
        <path d="M19.05 4.91A9.82 9.82 0 0 0 12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.76.46 3.47 1.34 4.99L2 22l5.16-1.35a9.96 9.96 0 0 0 4.86 1.24h.01c5.51 0 9.99-4.48 10-9.99a9.93 9.93 0 0 0-2.98-6.99Zm-7.03 15.36h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.06.8.82-2.99-.2-.31a8.29 8.29 0 0 1-1.27-4.42c0-4.58 3.72-8.3 8.3-8.3 2.22 0 4.3.86 5.87 2.43a8.25 8.25 0 0 1 2.43 5.87c0 4.58-3.72 8.3-8.35 8.26Zm4.55-6.22c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.13-.56.13-.16.25-.65.81-.79.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-2.01-1.24a7.55 7.55 0 0 1-1.39-1.73c-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.43.13-.15.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.49-.4-.42-.55-.43h-.47c-.16 0-.42.06-.65.31s-.86.84-.86 2.05c0 1.21.88 2.38 1 2.54.13.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.48-.6 1.69-1.18.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.48-.29Z"/>
      </svg>
    );
    default: return null;
  }
}
