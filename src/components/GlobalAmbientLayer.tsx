/**
 * GlobalAmbientLayer — mounts the slot-aware ambient background across the
 * whole app, but auto-suppresses on immersive / distraction-free routes:
 *   - Temple / Masters / Witness / Foundation session screens
 *   - Journal writing area
 *   - Auth, landing, marketing, enterprise flows
 *
 * Pure presentation. No business logic. Pointer-events disabled.
 */
import { useLocation } from "react-router-dom";
import HomeAmbientLayer from "@/components/home/HomeAmbientLayer";

// Route prefixes that must stay clean / immersive.
// User wants the home ambient (slot-aware sky + dust + stars) on every screen,
// so we only suppress on pure-marketing & auth surfaces.
const SUPPRESS_PREFIXES = [
  "/auth",
  "/hope-preview",
  "/enterprise",
  "/admin",
];

// Exact landing route — keep marketing hero clean
const SUPPRESS_EXACT = ["/"];

export default function GlobalAmbientLayer() {
  const { pathname } = useLocation();

  if (SUPPRESS_EXACT.includes(pathname)) return null;
  if (SUPPRESS_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname === p)) {
    return null;
  }

  return <HomeAmbientLayer />;
}