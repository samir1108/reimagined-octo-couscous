// Landing/auth background film playlist. One film plays, then the next, then repeats.
export const LANDING_VIDEOS = [
  "/LA01 (1).mp4",
  "/LA03.mp4",
  "/LA04.mp4",
  "/LA05.mp4",
] as const;

let cursor = 0;

export function getLandingVideo(): string {
  return LANDING_VIDEOS[cursor % LANDING_VIDEOS.length];
}

export function advanceLandingVideo(): string {
  cursor = (cursor + 1) % LANDING_VIDEOS.length;
  return LANDING_VIDEOS[cursor];
}
