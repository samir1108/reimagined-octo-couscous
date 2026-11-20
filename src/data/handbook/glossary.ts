/**
 * Glossary — Sanskrit + neuroscience side by side.
 * High SEO value. People search for these terms.
 */

export type GlossaryDomain = "sanskrit" | "neuroscience" | "psychology" | "practice";

export interface GlossaryTerm {
  term: string;
  domain: GlossaryDomain;
  pronunciation?: string;
  shortDef: string;
  longDef: string;
  seeAlso?: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  // Sanskrit
  { term: "Sakshi", domain: "sanskrit", pronunciation: "SAHK-shee", shortDef: "The witness — pure awareness observing experience.", longDef: "The seer behind seeing. In Vedanta, the unchanging awareness in which all thoughts, emotions, and perceptions arise and pass.", seeAlso: ["Atman", "Witness"] },
  { term: "Vasana", domain: "sanskrit", pronunciation: "VAH-sah-nah", shortDef: "Latent tendency from past action.", longDef: "Subtle impressions left by past actions that condition present perception and behavior. The substrate beneath loops.", seeAlso: ["Samskara", "Karma"] },
  { term: "Samskara", domain: "sanskrit", pronunciation: "sahm-SKAH-rah", shortDef: "Mental impression — the groove a repeated action carves.", longDef: "An imprint in the mind-stream. Repeated samskaras become character. Vasana is the family; samskara is one member.", seeAlso: ["Vasana"] },
  { term: "Atman", domain: "sanskrit", pronunciation: "AHT-mahn", shortDef: "The true Self — unchanging awareness.", longDef: "Not the personality. The awareness that knows the personality. In Advaita: identical with Brahman.", seeAlso: ["Brahman", "Sakshi"] },
  { term: "Brahman", domain: "sanskrit", pronunciation: "BRAH-mahn", shortDef: "The absolute ground of being.", longDef: "The unconditioned reality. Sat-chit-ananda: existence-consciousness-bliss." },
  { term: "Karma", domain: "sanskrit", shortDef: "Action and its consequence.", longDef: "Not punishment. Cause and effect at the level of mind and choice. Every act leaves an impression." },
  { term: "Dharma", domain: "sanskrit", shortDef: "Right action in alignment with one's nature and the larger order.", longDef: "What you uniquely must do — the intersection of capacity, situation, and truth." },
  { term: "Moksha", domain: "sanskrit", shortDef: "Liberation from the cycle of suffering.", longDef: "Not escape from life — release from the false identification that creates suffering." },
  { term: "Maya", domain: "sanskrit", shortDef: "The appearance of separateness.", longDef: "The cognitive overlay that presents reality as fragmented. Not 'illusion' — appearance mistaken for substance." },
  { term: "Avidya", domain: "sanskrit", shortDef: "Ignorance — specifically, ignorance of Self.", longDef: "The root cause of suffering: not knowing what you actually are." },
  { term: "Sadhana", domain: "sanskrit", shortDef: "Spiritual practice — what you do daily.", longDef: "The committed path. Not retreats — what you do on Tuesday at 6 AM." },
  { term: "Sat-Chit-Ananda", domain: "sanskrit", shortDef: "Being-Consciousness-Bliss.", longDef: "The three aspects of ultimate reality, identical in essence." },
  { term: "Prana", domain: "sanskrit", shortDef: "Life-energy carried by breath.", longDef: "Not oxygen. The vital current that animates the body. Cultivated by pranayama." },
  { term: "Pranayama", domain: "sanskrit", shortDef: "Conscious regulation of breath/energy.", longDef: "The fourth limb of Raja Yoga. Direct lever on nervous system and consciousness." },
  { term: "Dharana", domain: "sanskrit", shortDef: "Concentration on a single object.", longDef: "Sixth limb of Raja Yoga. Sustained one-pointed attention." },
  { term: "Dhyana", domain: "sanskrit", shortDef: "Meditation — unbroken flow of attention.", longDef: "Seventh limb. Dharana ripened: effortless sustained absorption." },
  { term: "Samadhi", domain: "sanskrit", shortDef: "Absorption — subject and object merge.", longDef: "Eighth limb. The meditator dissolves into the meditated. Many stages." },
  { term: "Kundalini", domain: "sanskrit", shortDef: "Latent energy coiled at the base of the spine.", longDef: "Subtle-anatomy concept. When awakened, transformative — and requires preparation. Not a goal to chase." },
  { term: "Sahaja", domain: "sanskrit", shortDef: "Effortless, natural state.", longDef: "The realized state where practice has dissolved into being." },
  { term: "Viveka", domain: "sanskrit", shortDef: "Discrimination — real vs unreal.", longDef: "The faculty of seeing what changes (not-self) versus what doesn't (Self)." },
  { term: "Vairagya", domain: "sanskrit", shortDef: "Dispassion — non-attachment that comes from clarity.", longDef: "Not coldness. The natural letting-go when something is seen for what it is." },
  { term: "Bhava", domain: "sanskrit", shortDef: "Devotional mood, felt orientation.", longDef: "The flavor of relationship — servant, friend, child, beloved — through which Bhakti unfolds." },
  { term: "Tapas", domain: "sanskrit", shortDef: "Disciplined heat — the fire of practice.", longDef: "Niyama. Voluntary intensity that burns through samskara." },

  // Neuroscience
  { term: "Default Mode Network", domain: "neuroscience", shortDef: "Brain network active during mind-wandering and self-referential thought.", longDef: "DMN: mPFC + posterior cingulate + angular gyrus. Hyperactive in depression and rumination. Quietens in meditation (Brewer et al., 2011).", seeAlso: ["Rumination"] },
  { term: "Amygdala", domain: "neuroscience", shortDef: "Brain's threat-detector.", longDef: "Almond-shaped subcortical structure. Triggers fight/flight before conscious appraisal. Reduces volume after 8 weeks of MBSR (Hölzel et al., 2011)." },
  { term: "Prefrontal Cortex", domain: "neuroscience", shortDef: "Executive function — planning, regulation, choice.", longDef: "Last brain region to fully develop (~25). Thickens with sustained meditation practice." },
  { term: "Polyvagal", domain: "neuroscience", shortDef: "Theory of autonomic regulation via vagus nerve.", longDef: "Stephen Porges. Maps three states: ventral vagal (safe), sympathetic (fight/flight), dorsal vagal (freeze/collapse). Foundational for trauma-informed practice." },
  { term: "Interoception", domain: "neuroscience", shortDef: "Awareness of internal bodily signals.", longDef: "The 8th sense. Anchored in insula. Increases measurably with body-based contemplative practice." },
  { term: "Neuroplasticity", domain: "neuroscience", shortDef: "The brain's ability to reorganize itself.", longDef: "What practice changes. Not metaphor: synaptic density, cortical thickness, white-matter tracts all measurably shift." },
  { term: "HRV", domain: "neuroscience", shortDef: "Heart Rate Variability — index of nervous-system flexibility.", longDef: "Beat-to-beat variation. Higher = better regulation, recovery, emotional range. Rises with breath practice." },
  { term: "Cortisol", domain: "neuroscience", shortDef: "Stress hormone.", longDef: "Chronic elevation = inflammation, insomnia, weight gain, accelerated aging. Drops with regular meditation." },
  { term: "Dopamine", domain: "neuroscience", shortDef: "Anticipation and reward-seeking neurotransmitter.", longDef: "Not 'pleasure' — wanting. Chronic over-firing (notifications, scroll) creates tolerance and anhedonia." },
  { term: "BDNF", domain: "neuroscience", shortDef: "Brain-Derived Neurotrophic Factor — neuron fertilizer.", longDef: "Increases with exercise, meditation, fasting. Foundation of adult neuroplasticity." },

  // Psychology
  { term: "Rumination", domain: "psychology", shortDef: "Repetitive negative thinking about past or future.", longDef: "Strongest single predictor of depression onset. Differs from problem-solving — produces no resolution." },
  { term: "Spiritual Bypass", domain: "psychology", shortDef: "Using spiritual ideas to avoid feeling.", longDef: "Term coined by John Welwood, 1984. The shadow side of premature transcendence." },
  { term: "Dark Night", domain: "psychology", shortDef: "Phase of disillusionment in spiritual practice.", longDef: "St John of the Cross. Maps to certain meditation jhanas and to depressive episodes in advanced practitioners (Willoughby Britton, Varieties of Contemplative Experience)." },
  { term: "Locus of Control", domain: "psychology", shortDef: "Belief about whether outcomes are caused by self (internal) or other (external).", longDef: "Internal locus predicts higher resilience, agency, mental health." },
  { term: "Allostatic Load", domain: "psychology", shortDef: "Cumulative wear from chronic stress.", longDef: "McEwen, 1993. The body's bill for sustained dysregulation." },

  // Practice
  { term: "Vipassana", domain: "practice", shortDef: "Insight meditation through sustained observation.", longDef: "Theravada Buddhist practice. Goenka's 10-day silent retreat is the modern flagship." },
  { term: "Yoga Nidra", domain: "practice", shortDef: "Conscious deep relaxation — 'yogic sleep'.", longDef: "Systematic body-scan + intention. 20 min = ~2 hours of sleep in restorative effect." },
  { term: "Kirtan", domain: "practice", shortDef: "Devotional call-and-response chanting.", longDef: "Bhakti practice. Activates limbic system and bonds group nervous systems." },
  { term: "Japa", domain: "practice", shortDef: "Mantra repetition.", longDef: "Mala bead aided. Trains attention while seeding samskara of remembrance." },
  { term: "Mauna", domain: "practice", shortDef: "Silence as practice.", longDef: "External silence creates internal listening. Even 1 day/week shifts the system." },
  { term: "Pratyahara", domain: "practice", shortDef: "Withdrawal of senses.", longDef: "Fifth limb of Raja Yoga. Foundation for concentration." },
];
