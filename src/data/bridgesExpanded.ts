// Bridges — every "discovery" of modern science already mapped by the seers.

export interface Bridge {
  slug: string;
  modern: string;          // Modern term
  modernSource: string;    // Modern field / scientist
  ancient: string;         // Ancient term
  ancientSource: string;   // Lineage / text
  bridge: string;          // 1-paragraph essay connecting them
  takeaway: string;        // The one-line punch
  family: "neuroscience" | "physics" | "psychology" | "biology";
}

export const BRIDGES: Bridge[] = [
  {
    slug: "default-mode-network",
    modern: "Default Mode Network",
    modernSource: "Raichle et al., 2001 — neuroimaging",
    ancient: "Vṛtti — the fluctuating mind",
    ancientSource: "Patañjali, Yoga Sutras 1.2",
    bridge:
      "When the brain is not doing a specific task, a particular network lights up — self-referential thought, planning, memory, narrative. This is the DMN. Patañjali, two thousand years earlier, called the same activity vṛtti — the constant whirring of the citta — and defined yoga as exactly the cessation of it. Modern meditation studies confirm: experienced meditators show measurable DMN quieting.",
    takeaway: "Yoga is the quieting of the network that makes you think you are the story.",
    family: "neuroscience",
  },
  {
    slug: "polyvagal-theory",
    modern: "Polyvagal Theory",
    modernSource: "Stephen Porges, 1994",
    ancient: "Iḍā, Piṅgalā & Suṣumnā",
    ancientSource: "Tantric Hatha Yoga texts",
    bridge:
      "Porges showed the vagus nerve has two branches — one for tend-and-befriend (ventral), one for freeze (dorsal) — and a third sympathetic system for fight-and-flight. The Tantric yogis mapped exactly three nāḍīs running through the body: iḍā (cooling, parasympathetic), piṅgalā (heating, sympathetic), and the central suṣumnā that opens only when the other two are balanced. Alternate-nostril breathing is, structurally, a vagal-tone training.",
    takeaway: "The yogis mapped the autonomic nervous system five thousand years before the vagus nerve had a name.",
    family: "neuroscience",
  },
  {
    slug: "neuroplasticity",
    modern: "Neuroplasticity",
    modernSource: "Late 20th-century neuroscience",
    ancient: "Saṃskāra — the groove",
    ancientSource: "The Yoga Sutras and Buddhist Abhidhamma",
    bridge:
      "Modern neuroscience accepts that repeated thought literally rewires the brain — synaptic pathways thicken with use. The classical traditions described this as saṃskāra: each action and thought carves a groove into the substrate of mind, predisposing you to repeat it. The cure is the same — deliberate repetition of the new pattern until the old groove fades through disuse.",
    takeaway: "Neuroplasticity is the lab confirmation of karma as physics.",
    family: "neuroscience",
  },
  {
    slug: "observer-effect",
    modern: "The Observer Effect",
    modernSource: "Quantum mechanics — double-slit experiment",
    ancient: "Sākṣī — the Witness",
    ancientSource: "The Upanishads",
    bridge:
      "In quantum mechanics, the act of measurement collapses a probability wave into a particular outcome. Observation, somehow, participates in reality. The Upanishads insist there is a sākṣī — a witnessing consciousness — that is the ground of all experience, neither acting nor being acted upon, yet present in every act of knowing. The parallel is so structural that physicists like Schrödinger and Bohm explicitly drew the connection.",
    takeaway: "The hardest problem in physics is the easiest sentence in Vedānta.",
    family: "physics",
  },
  {
    slug: "relativity-of-time",
    modern: "Relativity of Time",
    modernSource: "Einstein, 1905",
    ancient: "Kāla — time is māyā",
    ancientSource: "Vedānta",
    bridge:
      "Einstein showed time is not absolute — it stretches and compresses with motion and gravity. There is no universal 'now'. Vedānta said this differently: time (kāla) is an aspect of māyā, the appearance, not an absolute. What we call past and future are simply directions in mind. The eternal is the only present that is actually true.",
    takeaway: "Modern physics agrees: time was never the container you thought it was.",
    family: "physics",
  },
  {
    slug: "interconnection-quantum",
    modern: "Quantum Entanglement",
    modernSource: "Bell's theorem, experimentally confirmed 1972 →",
    ancient: "Brahman — one substance",
    ancientSource: "The Upanishads",
    bridge:
      "Two entangled particles, however far apart, behave as a single system — change one and the other responds instantaneously. The classical scientific worldview cannot tolerate this. The Upanishads stated it as bedrock: there is only one substance, appearing as many. 'That which is here is also there. He who sees variety here sees only death.' (Kaṭha Upaniṣad)",
    takeaway: "Separation may be the persistent illusion physics and Vedānta agree on.",
    family: "physics",
  },
  {
    slug: "three-brains",
    modern: "Triune Brain / Head-Heart-Gut Axis",
    modernSource: "MacLean 1960; HeartMath; Gershon's enteric nervous system",
    ancient: "Three bodies — Sthūla, Sūkṣma, Kāraṇa",
    ancientSource: "Taittirīya Upaniṣad",
    bridge:
      "The gut contains over 500 million neurons — a 'second brain'. The heart contains 40,000 — a third. Together with the head they form a triune system. The Taittirīya Upanishad mapped this exactly: three bodies, gross (sthūla, gut/body), subtle (sūkṣma, heart/emotion), and causal (kāraṇa, head/mind), all enveloping a single Self.",
    takeaway: "You have always had three brains. The yogis just talked to all of them.",
    family: "neuroscience",
  },
  {
    slug: "flow-state",
    modern: "Flow State",
    modernSource: "Mihaly Csikszentmihalyi, 1975",
    ancient: "Dhāraṇā → Dhyāna",
    ancientSource: "Patañjali, Yoga Sutras 3.1–3.2",
    bridge:
      "Csikszentmihalyi mapped a state where action and awareness merge, time distorts, the self dissolves, and performance peaks. He called it flow. Patañjali described the same arc as the transition from dhāraṇā (concentration) to dhyāna (effortless flow of attention) — the sixth and seventh limbs of yoga, leading to samādhi.",
    takeaway: "Flow is dhyāna, rediscovered without the lineage that already mapped its access.",
    family: "psychology",
  },
  {
    slug: "interoception",
    modern: "Interoception",
    modernSource: "A. D. Craig, 2002 — insula research",
    ancient: "Antaḥkaraṇa — the inner instrument",
    ancientSource: "Vedānta",
    bridge:
      "Interoception is the sensing of one's own internal state — heartbeat, breath, gut, hunger — and is the basis of emotional self-awareness. Vedānta maps an antaḥkaraṇa — the inner instrument made of mind, intellect, ego, and memory — that is the organ of inner perception. Both insist: until you can sense yourself accurately from the inside, no real change is possible.",
    takeaway: "The newest neuroscience of self is rediscovering an organ Vedānta named directly.",
    family: "neuroscience",
  },
  {
    slug: "attachment-theory",
    modern: "Attachment Theory",
    modernSource: "Bowlby & Ainsworth, mid-20th century",
    ancient: "Saṃskāra of relationship",
    ancientSource: "Yoga Sutras",
    bridge:
      "Bowlby showed that early caregiver patterns lay down templates that organize adult relationships — secure, anxious, avoidant, disorganized. These templates feel like truth. The yogic tradition called them saṃskāras — deep, often pre-verbal grooves carved by experience. The healing path is the same: bring the pattern into awareness, feel the underlying feeling, install a corrective experience repeatedly, and watch the groove soften.",
    takeaway: "Attachment styles are saṃskāras the West learned to map without naming.",
    family: "psychology",
  },
  {
    slug: "epigenetics",
    modern: "Epigenetics",
    modernSource: "Late-20th-century molecular biology",
    ancient: "Karma across lifetimes",
    ancientSource: "Vedic & Buddhist cosmology",
    bridge:
      "Your grandparents' famine can mark your genes. Trauma is transmissible without a single word being spoken. The ancients said the same: karma travels through lineages, predisposing later generations to particular sufferings until the underlying pattern is consciously met. Different vocabulary, identical mechanism.",
    takeaway: "Karma is not metaphysics. It is partly your grandparents in your nervous system.",
    family: "biology",
  },
  {
    slug: "psychedelic-mysticism",
    modern: "Mystical Experience under Psilocybin",
    modernSource: "Johns Hopkins, Griffiths et al., 2006 →",
    ancient: "Samādhi",
    ancientSource: "Patañjali, Yoga Sutras 1.41–1.51",
    bridge:
      "Subjects in controlled psychedelic studies report ego dissolution, unity, ineffability, sacredness — and rate the experience among the most meaningful of their lives, with sustained changes in well-being. The mapping to classical descriptions of samādhi is exact. The traditions warned: such states are accessible by many doors, including substance, but only stabilize through the discipline of the eight limbs.",
    takeaway: "Psychedelic research is, in effect, the lab re-encountering samādhi — and finding it real.",
    family: "neuroscience",
  },
];

export const BRIDGE_FAMILIES: Record<Bridge["family"], { label: string; color: string }> = {
  neuroscience: { label: "Neuroscience", color: "from-cyan-500/30 to-blue-900/30" },
  physics: { label: "Physics", color: "from-violet-500/30 to-indigo-900/30" },
  psychology: { label: "Psychology", color: "from-amber-500/30 to-rose-900/30" },
  biology: { label: "Biology", color: "from-emerald-500/30 to-teal-900/30" },
};
