/**
 * Where the global witness orb may mount.
 *
 * AppLayout owns the launcher for the signed-in shell (including its immersive
 * routes), and live session surfaces own the whole viewport, so the public
 * mount point stays out of both.
 */
export function shouldMountGlobalOrb(pathname: string): boolean {
  if (pathname.startsWith("/app")) return false;
  if (pathname.includes("/session")) return false;
  if (pathname.startsWith("/bience")) return false;
  return true;
}
