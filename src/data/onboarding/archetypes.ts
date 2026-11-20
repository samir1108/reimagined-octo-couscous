/**
 * 12 spiritual archetypes. Each has a gift, a shadow, path affinities,
 * and typical loops. Chamber 8 diagnoses which one is dominant + which
 * is shadow (the exiled twin).
 */
import type { PathSlug } from "./soulChambers";

export type ArchetypeSlug =
  | "seeker" | "devotee" | "warrior" | "sage" | "mystic" | "healer"
  | "lover" | "creator" | "ruler" | "rebel" | "hermit" | "servant";

export interface Archetype {
  slug: ArchetypeSlug;
  name: string;
  oneLine: string;
  gift: string;
  shadow: string;
  shadowTwin: ArchetypeSlug;      // the archetype that carries what this one exiles
  paths: Partial<Record<PathSlug, number>>;
  commonLoops: string[];          // slugs from loops/families the archetype tends to run
  councilAffinity: string[];      // guide slugs (see innerCouncil.ts) that speak this archetype's language
}

export const ARCHETYPES: Archetype[] = [
  { slug: "seeker",  name: "The Seeker",  oneLine: "Always one more book, one more teacher, one more retreat.",
    gift: "Insatiable curiosity. Will not settle for received wisdom.",
    shadow: "Never arrives. Uses seeking to avoid actually landing.",
    shadowTwin: "hermit", paths: { jnana: 3, raja: 2 },
    commonLoops: ["spiritual-bypass", "impostor-syndrome", "not-enough"],
    councilAffinity: ["ramana", "nisargadatta", "krishnamurti"] },
  { slug: "devotee", name: "The Devotee", oneLine: "Loves God — through music, tears, a person, a form.",
    gift: "Melts. Loves without a wall. Makes the invisible feel near.",
    shadow: "Loses self in the beloved. Waits for someone to save them.",
    shadowTwin: "warrior", paths: { bhakti: 3, tantra: 1 },
    commonLoops: ["abandonment", "people-pleasing", "codependence"],
    councilAffinity: ["ma", "kabir", "rumi"] },
  { slug: "warrior", name: "The Warrior", oneLine: "Meets what must be met. Cuts through, does not flinch.",
    gift: "Fierce clarity. Protects the vulnerable. Does the hard thing.",
    shadow: "Fights everything. Cannot receive. Suspects softness.",
    shadowTwin: "devotee", paths: { karma: 2, shakti: 3 },
    commonLoops: ["control", "rage-loop", "over-responsibility"],
    councilAffinity: ["adiyogi", "kali", "krishna"] },
  { slug: "sage",    name: "The Sage",    oneLine: "Watches, thinks, waits until the truth becomes obvious.",
    gift: "Discrimination. Sees through the story. Names what is.",
    shadow: "Lives from the neck up. Bypasses the body's information.",
    shadowTwin: "lover", paths: { jnana: 3, raja: 2 },
    commonLoops: ["over-thinking", "detachment", "spiritual-bypass"],
    councilAffinity: ["ramana", "vasishtha", "krishnamurti"] },
  { slug: "mystic",  name: "The Mystic",  oneLine: "Slips between worlds. Hears what others don't.",
    gift: "Direct contact with the numinous. Doorway for others.",
    shadow: "Ungrounded. Confuses vision with instruction. Loses the day.",
    shadowTwin: "ruler", paths: { raja: 3, tantra: 2, bhakti: 1 },
    commonLoops: ["dissociation", "spiritual-bypass", "loneliness"],
    councilAffinity: ["adiyogi", "osho", "ma"] },
  { slug: "healer",  name: "The Healer",  oneLine: "Tunes into pain — theirs, others' — and holds it.",
    gift: "Presence with pain. Makes people feel met.",
    shadow: "Absorbs. Cannot say no. Loses their own signal.",
    shadowTwin: "rebel", paths: { karma: 3, bhakti: 1, shakti: 1 },
    commonLoops: ["over-caretaking", "people-pleasing", "resentment"],
    councilAffinity: ["buddha", "ma", "kabir"] },
  { slug: "lover",   name: "The Lover",   oneLine: "Wants union — with a person, with life, with the moment.",
    gift: "Full-body yes. Sensual intelligence. Melts armor.",
    shadow: "Merges. Loses edges. Uses intimacy to escape aloneness.",
    shadowTwin: "sage", paths: { tantra: 3, bhakti: 2 },
    commonLoops: ["romantic-fusion", "lust-loop", "abandonment"],
    councilAffinity: ["rumi", "osho", "krishna"] },
  { slug: "creator", name: "The Creator", oneLine: "Cannot help but make things — beauty, systems, worlds.",
    gift: "Brings the unmanifest through. Devotion via making.",
    shadow: "Never satisfied with the made thing. Ties worth to output.",
    shadowTwin: "servant", paths: { shakti: 3, karma: 1 },
    commonLoops: ["perfectionism", "burnout", "impostor-syndrome"],
    councilAffinity: ["osho", "krishna", "ma"] },
  { slug: "ruler",   name: "The Ruler",   oneLine: "Holds structure. Others' lives get better around them.",
    gift: "Order, protection, the container others need.",
    shadow: "Cannot let go. Controls. Turns love into governance.",
    shadowTwin: "mystic", paths: { karma: 3, raja: 1 },
    commonLoops: ["control", "over-responsibility", "isolation"],
    councilAffinity: ["krishna", "vasishtha", "adiyogi"] },
  { slug: "rebel",   name: "The Rebel",   oneLine: "Cannot bow to what is false — even at their own cost.",
    gift: "Breaks stale forms. Insists on the real.",
    shadow: "Rebels against everything. Cannot receive teaching. Alone.",
    shadowTwin: "healer", paths: { shakti: 3, jnana: 1 },
    commonLoops: ["defiance", "isolation", "rage-loop"],
    councilAffinity: ["osho", "krishnamurti", "kali"] },
  { slug: "hermit",  name: "The Hermit",  oneLine: "Needs silence and solitude the way most need company.",
    gift: "Depth. Uncontaminated by the herd. Direct seeing.",
    shadow: "Hides. Uses solitude to avoid relational reality.",
    shadowTwin: "seeker", paths: { raja: 3, jnana: 2 },
    commonLoops: ["isolation", "avoidance", "over-thinking"],
    councilAffinity: ["ramana", "buddha", "nisargadatta"] },
  { slug: "servant", name: "The Servant", oneLine: "Life = usefulness. Small acts, done well, for others.",
    gift: "Humility. Steady. Turns work into worship.",
    shadow: "Self-erasing. Loses vow. Cannot claim their gift.",
    shadowTwin: "creator", paths: { karma: 3, bhakti: 1 },
    commonLoops: ["self-erasure", "people-pleasing", "not-enough"],
    councilAffinity: ["buddha", "ma", "kabir"] },
];

export const ARCHETYPE_BY_SLUG: Record<ArchetypeSlug, Archetype> =
  Object.fromEntries(ARCHETYPES.map(a => [a.slug, a])) as any;