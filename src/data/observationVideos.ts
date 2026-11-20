/**
 * Observation films
 * ─────────────────
 * The observation ladder is voice-led, but each level also has a film body:
 * a silent 5s cinematic loop that gives the sitting a room.
 *
 * All fifteen films in `experienceGameVideos` are used here. Each level maps to
 * a small set of films that fit its lens, and the seed hash rotates within that
 * set so consecutive sittings do not look identical.
 *
 *   1 Body        body-scanner · the-pause
 *   2 Breath      breath-temple · the-sigh
 *   3 Emotion     name-the-emotion · tonglen
 *   4 Thought     thought-watcher · three-brains-speak
 *   5 Pattern     mirror-realm · karma-coin
 *   6 Watcher     who-is-thinking · neti-neti
 *   7 Choiceless  silent-mountain · last-breath · ninth-dharana
 */
import { EXPERIENCE_GAMES } from "./experienceGames";
import { getExperienceGameVideo } from "./experienceGameVideos";
import { hashString } from "@/lib/practice/observationPicker";

export type ObservationFilm = {
  id: string;
  title: string;
  url: string;
  poster?: string;
};

const FILM_IDS_BY_LEVEL: Record<number, string[]> = {
  1: ["body-scanner", "the-pause"],
  2: ["breath-temple", "the-sigh"],
  3: ["name-the-emotion", "tonglen"],
  4: ["thought-watcher", "three-brains-speak"],
  5: ["mirror-realm", "karma-coin"],
  6: ["who-is-thinking", "neti-neti"],
  7: ["silent-mountain", "last-breath", "ninth-dharana"],
};

function filmFromId(id: string): ObservationFilm {
  const meta = EXPERIENCE_GAMES.find((game) => game.id === id);
  return {
    id,
    title: meta?.name ?? id,
    url: getExperienceGameVideo(id) ?? "",
    poster: meta?.image,
  };
}

/** Every film in the observation collection, in ladder order. */
export const ALL_OBSERVATION_FILMS: ObservationFilm[] = Object.values(FILM_IDS_BY_LEVEL)
  .flat()
  .map(filmFromId);

export function observationFilmFor(args: {
  level: number;
  seedId?: string | null;
  lens?: string | null;
}): ObservationFilm {
  const level = Math.max(1, Math.min(7, Math.floor(args.level || 1)));
  const ids = FILM_IDS_BY_LEVEL[level] ?? FILM_IDS_BY_LEVEL[1];
  const key = `${level}|${args.seedId ?? ""}|${args.lens ?? ""}`;
  const id = ids[hashString(key) % ids.length];
  return filmFromId(id);
}

/** The films assigned to one level, in rotation order. */
export function observationFilmsForLevel(level: number): ObservationFilm[] {
  const clamped = Math.max(1, Math.min(7, Math.floor(level || 1)));
  const ids = FILM_IDS_BY_LEVEL[clamped] ?? FILM_IDS_BY_LEVEL[1];
  return ids.map(filmFromId);
}
