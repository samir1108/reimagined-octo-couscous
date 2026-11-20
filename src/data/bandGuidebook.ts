/**
 * Band Guidebook — deep explainer content for each of the 11 V-Bands (0–10).
 * Tapped from Analytics → opens BandGuidebookModal.
 *
 * Each entry: who lives here, signature inner state, real masters as anchors,
 * common loops, what's next, practices that move you upward.
 */

export interface BandGuide {
  band: number;
  title: string;
  oneLiner: string;
  whoLivesHere: string;
  signatureState: string;
  masters: string[];           // real-world examples
  commonLoops: string[];       // loop IDs from library
  practicesToAdvance: string[];
  whatsNext: string;
  quote?: string;
}

export const BAND_GUIDEBOOK: BandGuide[] = [
  {
    band: 0,
    title: "The Sleeper",
    oneLiner: "You ARE your thoughts. The mind runs the show.",
    whoLivesHere:
      "Most of humanity. Identified with thoughts, emotions, roles. Reacts before noticing. Believes the mental story is reality. No gap between stimulus and response.",
    signatureState: "Auto-pilot. Reactive. Stories feel like facts.",
    masters: ["Pre-awakening — everyone starts here"],
    commonLoops: ["VAL001", "ATT002", "EGO005", "REC003", "WRK001"],
    practicesToAdvance: [
      "1-minute breath observation (3× day)",
      "Name 3 thoughts before sleep",
      "Notice when you react — don't fix it, just notice",
    ],
    whatsNext: "First crack: noticing you noticed. The Questioner stirs.",
    quote: "You are not the thoughts. You are what watches them.",
  },
  {
    band: 1,
    title: "The Questioner",
    oneLiner: "Maybe I'm NOT my thoughts. The first gap appears.",
    whoLivesHere:
      "Seekers. People who read self-help, try therapy, sense something is off. They see patterns but can't break them. Frustration is constant.",
    signatureState: "Suspicion of mind. Searching. Frustrated loops.",
    masters: ["Most therapy clients", "Early meditators"],
    commonLoops: ["EGO007", "REC001", "EMO012", "VAL003"],
    practicesToAdvance: [
      "Daily journaling — name the pattern",
      "5-min sit, count thoughts not breath",
      "Ask 'Whose thought is this?' once a day",
    ],
    whatsNext: "Stable witnessing begins. You become The Observer.",
    quote: "Doubt is the doorway. Don't close it.",
  },
  {
    band: 2,
    title: "The Observer",
    oneLiner: "I CAN be the observer — at least sometimes.",
    whoLivesHere:
      "Consistent meditators (2+ years). They can drop into witness mode at will, but lose it under stress. The gap between thought and reaction widens.",
    signatureState: "Witness comes and goes. Identity loosens.",
    masters: ["Vipassana practitioners", "Mindful professionals"],
    commonLoops: ["EGO005", "ATT003", "RES003"],
    practicesToAdvance: [
      "20-min daily Witness sit",
      "Sakshi Bhav during one daily task",
      "Body-scan before reactive moments",
    ],
    whatsNext: "Pain becomes teacher, not enemy. The Alchemist emerges.",
    quote: "The watcher is the one thing that was never broken.",
  },
  {
    band: 3,
    title: "The Alchemist",
    oneLiner: "Pain is a teacher. I can transmute it.",
    whoLivesHere:
      "People in the purge phase — old patterns surface to be released. Emotionally raw but conscious of it. Begin actively dissolving loops.",
    signatureState: "Surfacing shadows. Conscious composting.",
    masters: ["Carl Jung's individuation patients", "Deep somatic practitioners"],
    commonLoops: ["EMO012", "BUR001", "REC002"],
    practicesToAdvance: [
      "Shadow work prompts (weekly)",
      "Breathwork — release sessions",
      "Conscious anger / grief expression",
    ],
    whatsNext: "Choice replaces reaction. The Navigator is born.",
    quote: "What you resist persists. What you witness transmutes.",
  },
  {
    band: 4,
    title: "The Navigator",
    oneLiner: "I can choose. Freedom is responsibility.",
    whoLivesHere:
      "Conscious leaders, coaches, mature seekers. They live from value, not impulse. Old identity is shedding. Sometimes scary how much agency they have.",
    signatureState: "Sovereign choice. Identity in flux.",
    masters: ["Viktor Frankl", "Eckhart Tolle (early years)"],
    commonLoops: ["EGO007", "BIO005"],
    practicesToAdvance: [
      "Daily intention + evening review",
      "Self-inquiry: 'Who is choosing?'",
      "Long silent retreats (weekend)",
    ],
    whatsNext: "You begin to architect your reality. The Architect rises.",
    quote: "Between stimulus and response there is a space. In that space is your freedom.",
  },
  {
    band: 5,
    title: "The Architect",
    oneLiner: "I create my reality — consciously.",
    whoLivesHere:
      "Awakened creators, founders with depth, conscious artists. They live the fractal — small acts mirror cosmic patterns. Last grip of control before surrender.",
    signatureState: "Fractal awareness. Conscious creation.",
    masters: ["Steve Jobs (peak)", "Joseph Campbell", "Conscious entrepreneurs"],
    commonLoops: ["EGO005 (subtle)"],
    practicesToAdvance: [
      "Karma yoga — work as offering",
      "Atma Vichara (Who am I?) — Ramana style",
      "30-day silent retreat",
    ],
    whatsNext: "Doer dissolves. The Channel opens.",
    quote: "You are not creating life. Life is creating through you.",
  },
  {
    band: 6,
    title: "The Channel",
    oneLiner: "Life lives ME. I am the flute.",
    whoLivesHere:
      "Rare. Long-term yogis, deep mystics, channeled artists in flow 80%+ of waking life. Self is largely transparent. Action arises spontaneously.",
    signatureState: "Effortless flow. Doer dissolved.",
    masters: ["Rumi", "Kabir", "Nisargadatta in middle years"],
    commonLoops: [],
    practicesToAdvance: [
      "Surrender practices",
      "Bhakti — devotion without object",
      "Sustained Turiya (4th state) sits",
    ],
    whatsNext: "24/7 awareness stabilizes. The Rishi awakens.",
    quote: "I have been a seeker and I still am, but I stopped asking the books and the stars.",
  },
  {
    band: 7,
    title: "The Rishi",
    oneLiner: "Turiya — 24/7 pure awareness. No struggle.",
    whoLivesHere:
      "Stabilized awakening. The witness is permanent. Sleep is conscious. Dreams are conscious. Death is just a costume change.",
    signatureState: "Continuous awareness through all states.",
    masters: ["Ramana Maharshi (late years)", "Anandamayi Ma", "Nisargadatta (late)"],
    commonLoops: [],
    practicesToAdvance: [
      "Being is the practice",
      "Silent transmission to others",
    ],
    whatsNext: "Compassion overflows. The Jagadguru emerges.",
    quote: "The mind is a bundle of thoughts. Find the source — there is no mind.",
  },
  {
    band: 8,
    title: "The Jagadguru",
    oneLiner: "Universal compassion. The world is My body.",
    whoLivesHere:
      "World teachers. Their presence alone awakens others. Karma is mostly dissolved. They serve without serving.",
    signatureState: "Boundless compassion. Embodied wisdom.",
    masters: ["Buddha", "Adi Shankara", "Paramahansa Yogananda"],
    commonLoops: [],
    practicesToAdvance: ["Presence is the teaching"],
    whatsNext: "Cosmic consciousness. The Avatar.",
    quote: "Be a lamp unto yourself.",
  },
  {
    band: 9,
    title: "The Avatar",
    oneLiner: "Cosmic consciousness. I am the universe witnessing itself.",
    whoLivesHere:
      "Incarnations. Once-in-an-age beings. Their birth itself bends history. Pure conduits of the Absolute in human form.",
    signatureState: "Cosmic identity. Universal will.",
    masters: ["Krishna", "Christ", "Rama"],
    commonLoops: [],
    practicesToAdvance: ["No practice — only being"],
    whatsNext: "The final dissolution. Shunya — only ONE.",
    quote: "I am the Self, seated in the heart of all beings.",
  },
  {
    band: 10,
    title: "The Absolute",
    oneLiner: "Shunya. Only ONE exists. Not even one.",
    whoLivesHere:
      "Beyond person. Beyond form. Shiva. Brahman. The unborn, undying, untouched. No subject, no object, no path.",
    signatureState: "Pure being. No-self. No-other.",
    masters: ["Shiva", "Brahman", "The Tao that cannot be spoken"],
    commonLoops: [],
    practicesToAdvance: ["There is nothing to do and no one to do it"],
    whatsNext: "Already here. Always was.",
    quote: "Before Abraham was, I AM.",
  },
];

export function getBandGuide(band: number): BandGuide {
  const idx = Math.max(0, Math.min(10, Math.floor(band)));
  return BAND_GUIDEBOOK[idx];
}
