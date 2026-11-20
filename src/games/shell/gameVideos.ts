// Cinematic ambient video loops per game — painterly, meditative, 5s.
// Falls back to hero image (heroImages.ts) then faculty cover (facultyCovers.ts).
// Videos live as .asset.json pointers in src/games/assets/videos/.

const modules = import.meta.glob("../assets/videos/*.mp4.asset.json", {
  eager: true,
}) as Record<string, { default: { url: string } }>;

const REGISTRY: Record<string, string> = {};
for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/videos\/(.+)\.mp4\.asset\.json$/);
  if (match) REGISTRY[match[1]] = mod.default.url;
}

export function getGameVideo(gameId: string): string | undefined {
  return REGISTRY[gameId];
}