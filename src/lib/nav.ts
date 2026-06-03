import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type RouteName =
  | "home"
  | "services"
  | "subscriptions"
  | "commercial"
  | "about"
  | "contact"
  | "booking";

const PATHS: Record<RouteName, string> = {
  home: "/",
  services: "/services",
  subscriptions: "/subscriptions",
  commercial: "/commercial",
  about: "/about",
  contact: "/contact",
  booking: "/booking",
};

export function pathFor(route: RouteName, params: Record<string, string> = {}) {
  const base = PATHS[route];
  const keys = Object.keys(params);
  if (!keys.length) return base;
  const q = keys
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join("&");
  return `${base}?${q}`;
}

export function useGo() {
  const navigate = useNavigate();
  return useCallback(
    (route: RouteName, params: Record<string, string> = {}) => {
      navigate(pathFor(route, params));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate]
  );
}

export function useCurrentRoute(): RouteName {
  const { pathname } = useLocation();
  if (pathname === "/") return "home";
  for (const [k, v] of Object.entries(PATHS)) {
    if (v !== "/" && pathname.startsWith(v)) return k as RouteName;
  }
  return "home";
}
