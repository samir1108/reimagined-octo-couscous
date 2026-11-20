// Hero image registry — maps gameId → painterly cinematic backdrop.
// Imported once and referenced by ConsciousGameShell intro phase.
import breathTemple from "@/games/assets/hero-breath-temple.jpg";
import mirrorRealm from "@/games/assets/hero-mirror-realm.jpg";
import threeBrains from "@/games/assets/hero-three-brains.jpg";
import witnessWall from "@/games/assets/hero-witness-wall.jpg";

export const HERO_IMAGES: Record<string, string> = {
  "breath-temple": breathTemple,
  "mirror-realm": mirrorRealm,
  "three-brains-speak": threeBrains,
  "witness-wall": witnessWall,
};

export function getHeroImage(gameId: string): string | undefined {
  return HERO_IMAGES[gameId];
}
