// 38 Mirror checkpoints — a mirror of src/data/pre-journey/mirrors.ts
// but reduced to what the Elder needs at onboarding time: number, title,
// module, and one surgical probe question the Elder can weave into the
// dialogue (or use to score at finalize).
//
// Keep this list in lockstep with src/data/pre-journey/mirrors.ts.

export interface MirrorProbe {
  n: number;               // 1..38
  title: string;
  module: string;
  slug: string;            // assessment slug (frontend uses this to open the full assessment)
  probe: string;           // one surgical question the Elder can ask, or use as scoring rubric
}

export const MIRROR_PROBES: MirrorProbe[] = [
  { n: 1,  module: 'Welcome',     slug: 'loop-map',                    title: 'Map your loops',              probe: "Which 1-2 loops actually run you day to day, and how loud is each right now?" },
  { n: 2,  module: 'Welcome',     slug: 'spiritual-stage',             title: 'Where you stand today',        probe: "Where on the path are they — seeker, striver, wounded, awakening, integrated?" },
  { n: 3,  module: 'Welcome',     slug: 'inner-compass',               title: 'Your inner compass',           probe: "What are the 3 values they'd die on a hill for, not the polite ones?" },
  { n: 4,  module: 'Engines',     slug: 'three-brains',                title: 'The three brains',             probe: "Head, heart, or gut — which one actually runs the show for them?" },
  { n: 5,  module: 'Engines',     slug: 'dosha-constitution',          title: 'Your constitution',            probe: "Vata (airy/anxious), Pitta (fiery/driven), or Kapha (steady/heavy) — which weather do they carry?" },
  { n: 6,  module: 'Engines',     slug: 'mind-body-type',              title: 'Mind-body type',               probe: "How does the body talk to the mind: through tightness, energy, numbness, or fatigue?" },
  { n: 7,  module: 'Observation', slug: 'witness-capacity',            title: 'The witness',                  probe: "How long can they watch a feeling or thought without reacting to it?" },
  { n: 8,  module: 'Observation', slug: 'presence-quality',            title: 'Quality of presence',          probe: "When they show up, is it distracted, performing, half-there, or actually here?" },
  { n: 9,  module: 'Observation', slug: 'time-relationship',           title: 'Relationship with time',       probe: "Do they live mostly in past regret, future anxiety, or the present?" },
  { n: 10, module: 'Observation', slug: 'emotional-range',             title: 'Emotional range',              probe: "How wide is their inner weather — flat/numb, narrow, or full spectrum?" },
  { n: 11, module: 'Observation', slug: 'energy-bodies',               title: 'Subtle anatomy',               probe: "Do they sense subtle energy or is body purely physical for them?" },
  { n: 12, module: '12 Skills',   slug: 'practice-level-calibration',  title: 'Practice level calibration',   probe: "Across observation, breath, mantra, self-inquiry — where do they actually stand?" },
  { n: 13, module: '12 Skills',   slug: 'path-affinity',               title: 'Your yoga path',               probe: "Karma, Bhakti, Jnana, or Raja — which one lights them up the most?" },
  { n: 14, module: '12 Skills',   slug: 'triguna-analysis',            title: 'Triguna',                      probe: "Their Sattva/Rajas/Tamas ratio — clear+calm, driven+restless, or heavy+stuck?" },
  { n: 15, module: '12 Skills',   slug: 'pancha-kosha',                title: 'Pancha Kosha',                 probe: "Which sheath is loudest right now — physical, energy, mind, wisdom, or bliss?" },
  { n: 16, module: '12 Skills',   slug: 'discipline-style',            title: 'Discipline style',             probe: "How do they actually keep any practice alive — willpower, ritual, guilt, or love?" },
  { n: 17, module: '12 Skills',   slug: 'sankalpa-shakti',             title: 'Sankalpa Shakti',              probe: "The strength of their inner vow — do they keep promises they make to themselves?" },
  { n: 18, module: 'Patanjali',   slug: 'klesha-map',                  title: 'The Five Afflictions',         probe: "Which klesha runs hottest — ignorance, ego, attachment, aversion, or fear of death?" },
  { n: 19, module: 'Patanjali',   slug: 'discipline-style',            title: 'Your stable seat',             probe: "Can they sit still and comfortable — physically, emotionally — for even a few minutes?" },
  { n: 20, module: 'Patanjali',   slug: 'presence-quality',            title: 'Sense gates',                  probe: "What do they let in through eyes/ears/phone — is intake disciplined or leaky?" },
  { n: 21, module: 'Patanjali',   slug: 'witness-capacity',            title: 'The Witness depth',            probe: "Attention level — flickering, held (dharana), flowing (dhyana), or absorbed (samadhi)?" },
  { n: 22, module: '4 Yogas',     slug: 'sankalpa-shakti',             title: 'Karma signature',              probe: "How attached are they to results — do they work for the fruit or for the offering?" },
  { n: 23, module: '4 Yogas',     slug: 'attachment-style',            title: 'Heart aperture',               probe: "Is the heart open, armoured, leaky, or bypassed?" },
  { n: 24, module: '4 Yogas',     slug: 'path-affinity',               title: 'Path affinity (Krishna mix)',  probe: "Their full mix across karma/bhakti/jnana/raja — not just the favourite." },
  { n: 25, module: '4 Yogas',     slug: 'purpose-mirror',              title: 'Purpose mirror',               probe: "What are they secretly here to do that they haven't fully admitted?" },
  { n: 26, module: 'Levels',      slug: 'jungian-archetypes',          title: 'Inner archetype',              probe: "Which figure keeps casting them — seeker, orphan, warrior, lover, sage, ruler?" },
  { n: 27, module: 'Levels',      slug: 'inner-council',               title: 'Inner council',                probe: "Which sub-personalities take turns running them — critic, child, pleaser, rebel?" },
  { n: 28, module: 'Levels',      slug: 'shadow-inventory',            title: 'Shadow inventory',             probe: "What have they stopped looking at — anger, need, envy, sexuality, ambition?" },
  { n: 29, module: 'Loops',       slug: 'vasana-map',                  title: 'Vasana map',                   probe: "Which grooves does their mind keep falling into without permission?" },
  { n: 30, module: 'Loops',       slug: 'karmic-patterns',             title: 'Karmic patterns',              probe: "What situation keeps repeating in different disguises across their life?" },
  { n: 31, module: 'Loops',       slug: 'witchcraft-karma-memory',     title: 'Karma memory',                 probe: "What does the body remember (stored trauma/tension) that the mind has forgotten?" },
  { n: 32, module: 'Heart',       slug: 'attachment-style',            title: 'Inner bonding',                probe: "Attachment: secure, anxious, avoidant, or disorganised?" },
  { n: 33, module: 'Heart',       slug: 'relationship-roles',          title: 'Relationship roles',           probe: "The role they play in every room — caretaker, invisible, star, peacemaker, judge?" },
  { n: 34, module: 'Heart',       slug: 'inner-child',                 title: 'Inner child',                  probe: "The age they still get small at — 4, 7, 13? What triggers it?" },
  { n: 35, module: 'Heart',       slug: 'spiritual-bypass',            title: 'The bypass mirror',            probe: "Where do they use 'spirituality' to skip a hard human feeling?" },
  { n: 36, module: 'Launch',      slug: 'chakra-balance',              title: 'Chakra resonance',             probe: "Which centres feel open, and which feel locked — root, sacral, solar, heart, throat, third-eye, crown?" },
  { n: 37, module: 'Launch',      slug: 'money-psyche',                title: 'Money psyche',                 probe: "What is their real story about worth, scarcity, and abundance?" },
  { n: 38, module: 'Launch',      slug: 'death-awareness',             title: 'Marana Smriti',                probe: "How close does mortality sit — denied, feared, or a companion?" },
];

export const MIRROR_TOTAL = MIRROR_PROBES.length;

/** Compact block the Elder can be primed with (kept short to save tokens). */
export function mirrorProbesBlock(): string {
  return MIRROR_PROBES
    .map((m) => `M${m.n} · ${m.module} · ${m.title} — ${m.probe}`)
    .join("\n");
}
