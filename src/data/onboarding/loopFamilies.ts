/**
 * The 5 loop *families* used in Chamber 9. This is a shorter, self-scoring
 * layer on top of the existing loopsAtlas / observationLadder / selfInquiryLadder
 * data — it tells every engine WHICH families are actively running this human
 * so they can be surfaced first.
 */
export type LoopFamilySlug =
  | "self-inquiry" | "observation" | "willpower" | "focus" | "witchcraft"
  | "psychological";

export interface LoopFamily {
  slug: LoopFamilySlug;
  name: string;
  ancientName: string;
  oneLine: string;
  runsWhen: string;      // Description of when this family is dominant
  entryPractice: string; // First micro-practice
}

export const LOOP_FAMILIES: LoopFamily[] = [
  { slug: "self-inquiry", name: "Self-Inquiry", ancientName: "Ātma-vichāra",
    oneLine: "Who is the one to whom this is happening?",
    runsWhen: "You keep circling the same identity crisis, role loss, or 'who am I really' question.",
    entryPractice: "Ask 'Who is aware of this thought?' Wait 10 seconds. That's it." },
  { slug: "observation", name: "Observation / Witness", ancientName: "Sākṣī-bhāva",
    oneLine: "Not the wave — the sea that notices the wave.",
    runsWhen: "Emotions grip you fully; you become the anger, the fear, without any distance.",
    entryPractice: "Name it: 'Fear is here.' Not 'I am afraid.' Change the grammar." },
  { slug: "willpower", name: "Willpower / Tapas", ancientName: "Tapas",
    oneLine: "Voluntary hardship as the forge of the self.",
    runsWhen: "You keep breaking your own vows; discipline collapses within days.",
    entryPractice: "One vow, one day. Something you would never fail. Just start there." },
  { slug: "focus", name: "Focus / Dharana", ancientName: "Dhāraṇā",
    oneLine: "One point, held, until the mind burns off around it.",
    runsWhen: "Attention is shattered, you cannot finish a thought, doom-scroll is default.",
    entryPractice: "Trataka — stare at a candle flame, unblinking, for 60 seconds. That is it." },
  { slug: "witchcraft", name: "Shakti-craft / Witchcraft", ancientName: "Śakti-sādhana",
    oneLine: "Direct energy work — intention, cycle, form.",
    runsWhen: "You feel powerless; life happens TO you; you want to shape not just accept.",
    entryPractice: "One intention, written by hand, put under a stone at moonrise. Small is sacred." },
  { slug: "psychological", name: "Psychological Loops", ancientName: "Saṁskāra",
    oneLine: "The old grooves — people-pleasing, doom-scroll, impostor, control.",
    runsWhen: "The same reaction fires in the same situation, decade after decade.",
    entryPractice: "Notice the trigger *before* the reaction. Three breaths in the gap. That's the whole practice." },
];

export const LOOP_FAMILY_BY_SLUG: Record<LoopFamilySlug, LoopFamily> =
  Object.fromEntries(LOOP_FAMILIES.map(f => [f.slug, f])) as any;