export type GuruPractice = {
  name: string;
  duration: string;
  description: string;
  steps: string[];
  modes: ("chat" | "timer")[];
  difficulty: "beginner" | "intermediate" | "advanced";
};

export type Guru = {
  id: string;
  name: string;
  title: string;
  quote: string;
  image: string;
  bgImage: string;
  accentColor: string;
  practices: GuruPractice[];
  bio?: string;
  keyTeaching?: string;
  path?: string;
  category?: string;
  livingStudentOf?: string;
  programs?: any[];
  journey?: any;
  associatedTexts?: string[];
};

// ─── Temple Guides replace real masters ───
import { TEMPLE_GUIDES, isRealMaster, type MasterCategory, MASTER_CATEGORIES } from "./temple-guides";

/**
 * Public guru roster shown to users — REAL historical masters only.
 * Fictional Sanskrit-named composite guides (Aarav, Veer, etc.) are kept in
 * TEMPLE_GUIDES for backward compatibility (questionnaires, rotation, legacy
 * user data) but excluded from the visible roster so users see only authentic
 * lineage masters.
 */
export const GURUS: Guru[] = TEMPLE_GUIDES
  .filter((g) => isRealMaster(g.id))
  .map((guide) => ({
    id: guide.id,
    name: guide.name,
    title: guide.title,
    quote: guide.quote,
    image: guide.image,
    bgImage: guide.bgImage,
    accentColor: guide.accentColor,
    practices: guide.practices,
    bio: guide.bio,
    keyTeaching: guide.keyTeaching,
    path: guide.path,
    category: guide.category,
    programs: guide.programs,
    journey: guide.journey,
    associatedTexts: guide.associatedTexts,
  }));

/** Internal: full roster including fictional ones (for legacy lookups only). */
export const ALL_GUIDES: Guru[] = TEMPLE_GUIDES.map((guide) => ({
  id: guide.id,
  name: guide.name,
  title: guide.title,
  quote: guide.quote,
  image: guide.image,
  bgImage: guide.bgImage,
  accentColor: guide.accentColor,
  practices: guide.practices,
  bio: guide.bio,
  keyTeaching: guide.keyTeaching,
  path: guide.path,
  category: guide.category,
  programs: guide.programs,
  journey: guide.journey,
  associatedTexts: guide.associatedTexts,
}));

export { TEMPLE_GUIDES, MASTER_CATEGORIES, isRealMaster };
export type { MasterCategory };
