import { useLocation } from "react-router-dom";
import PresenceOrb from "./PresenceOrb";
import { shouldMountGlobalOrb } from "./presenceRoute";

/**
 * Mount point for public routes rendered outside AppLayout. The signed-in shell
 * mounts PresenceOrb itself so immersive routes can suppress it.
 */
export default function GlobalPresenceOrb() {
  const { pathname } = useLocation();
  if (!shouldMountGlobalOrb(pathname)) return null;
  return <PresenceOrb />;
}
