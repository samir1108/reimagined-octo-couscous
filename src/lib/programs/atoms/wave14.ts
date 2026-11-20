/**
 * Wave 14 atoms — Gheranda Samhita (the 7 limbs of Hatha Yoga).
 * Shatkarma, Asana, Mudra, Pratyahara, Pranayama, Dhyana, Samadhi.
 */
import type { Atom } from "../types";

const read = (
  id: string,
  label: string,
  intent: string,
  body: string,
  tags: string[] = [],
): Atom => ({
  id,
  category: "wisdom-read",
  label,
  intent,
  durationSec: { min: 60, typical: 120, max: 240 },
  level: 0,
  modality: "read",
  intensity: "gentle",
  gates: ["any"],
  energy: ["low", "medium", "high"],
  body,
  tags,
});

const practice = (
  id: string,
  label: string,
  intent: string,
  script: string[],
  level = 1,
  intensity: Atom["intensity"] = "balanced",
  gates: Atom["gates"] = ["any"],
): Atom => ({
  id,
  category: "kriya",
  label,
  intent,
  durationSec: { min: 180, typical: 300, max: 600 },
  level,
  modality: "sit",
  intensity,
  gates,
  energy: ["medium", "high"],
  script,
});

const teach = (
  id: string,
  label: string,
  intent: string,
  body: string,
  level = 1,
): Atom => ({
  id,
  category: "teaching",
  label,
  intent,
  durationSec: { min: 90, typical: 150, max: 300 },
  level,
  modality: "read",
  intensity: "balanced",
  gates: ["any"],
  energy: ["low", "medium", "high"],
  body,
});

export const WAVE14_ATOMS: Atom[] = [
  // ─── Gheranda Samhita wisdom-read atoms ───
  read("wisdom.gheranda.overview", "Gheranda Samhita", "The seven-limbed Hatha Yoga",
    "The Gheranda Samhita is one of the three classic Hatha Yoga texts (with Hatha Pradipika and Shiva Samhita). It teaches seven limbs: 1) Shatkarma (cleansing), 2) Asana (seat), 3) Mudra (seal), 4) Pratyahara (withdrawal), 5) Pranayama (breath), 6) Dhyana (meditation), 7) Samadhi (absorption). Unlike Patanjali's eight limbs, Gheranda starts with purification.", ["gheranda", "hatha", "seven-limbs"]),
  read("wisdom.gheranda.shatkarma", "Gheranda · Shatkarma", "The six purifications — neti, dhauti, nauli, basti, kapalbhati, trataka",
    "Shatkarma is the first limb. The six cleansings purify the body so the light of awareness can shine through. Neti cleanses the nasal passages. Dhauti cleanses the digestive tract. Nauli churns the abdomen. Basti cleanses the colon. Kapalbhati shines the skull. Trataka steadies the gaze.", ["gheranda", "shatkarma"]),
  read("wisdom.gheranda.asana", "Gheranda · Asana", "32 asanas — the seat that steadies",
    "Gheranda lists 32 asanas. The key ones: siddhasana (accomplished seat), padmasana (lotus), bhadrasana (gracious), muktasana (liberated), vajrasana (thunderbolt), swastikasana (auspicious). The seat must be steady (sthira) and easeful (sukha). Master the seat, and the body becomes a temple.", ["gheranda", "asana"]),
  read("wisdom.gheranda.mudra", "Gheranda · Mudra", "The 25 mudras — seals that hold the energy",
    "Gheranda teaches 25 mudras. The great ones: mahamudra (great seal), khecari (tongue to palate), viparita (inverted), karni (ear), yoni (womb), shakti (power), bhujangini (cobra), manduki (frog), tadagi (pond). Each seals the energy in a specific channel, directing prana toward the crown.", ["gheranda", "mudra"]),
  read("wisdom.gheranda.pratyahara", "Gheranda · Pratyahara", "Withdrawal — the senses turn inward",
    "Pratyahara is the fifth limb. When the senses withdraw from their objects, they turn inward toward the self. It is the bridge between the outer limbs (body/breath) and the inner limbs (meditation/absorption). Without pratyahara, meditation is scattered.", ["gheranda", "pratyahara"]),
  read("wisdom.gheranda.pranayama", "Gheranda · Pranayama", "The 8 kumbhakas — breath retentions",
    "Gheranda teaches 8 kumbhakas (breath retentions): sahita (with mantra), suryabhedana (right nostril), ujjayi (victorious), sheetali (cooling), bhastrika (bellows), bhramari (bee), moorchha (fainting), kevala (spontaneous). Each has specific effects on body and mind.", ["gheranda", "pranayama"]),
  read("wisdom.gheranda.dhyana", "Gheranda · Dhyana", "Meditation — the three types",
    "Gheranda teaches three dhyana: sthula (gross — meditation on form), jyotir (light — meditation on inner light), sukshma (subtle — meditation on the self). The progression is from gross to subtle to formless. Dhyana is the unbroken flow of attention on the object.", ["gheranda", "dhyana"]),
  read("wisdom.gheranda.samadhi", "Gheranda · Samadhi", "Absorption — the final goal",
    "Samadhi is the seventh and final limb. The mind dissolves into the object, the seer rests in its own nature. Gheranda describes samadhi as the state where the duality of meditator and meditated vanishes. The yogi becomes the meditation itself.", ["gheranda", "samadhi"]),

  // ─── Teaching atoms ───
  teach("teach.gheranda.overview", "Gheranda Samhita — the seven-limbed Hatha Yoga", "Purify first, then sit, then absorb",
    "Unlike Patanjali's eight limbs (which start with ethics), Gheranda's seven limbs start with purification: 1) Shatkarma (cleanse), 2) Asana (steady seat), 3) Mudra (seal energy), 4) Pratyahara (withdraw senses), 5) Pranayama (master breath), 6) Dhyana (meditate), 7) Samadhi (absorb). The logic: purify the vessel first, then it can hold the rising energy without breaking.", 1),
  teach("teach.gheranda.shata", "Shatkarma — the six cleansings", "Clean the vessel before filling it",
    "The six shatkarmas are the foundation: neti (nasal), dhauti (digestive), nauli (abdominal), basti (colonic), kapalbhati (cranial), trataka (ocular). Each cleanses a specific channel. A pure body is flexible, light, and ready for the subtle practices. Practice under guidance.", 1),
  teach("teach.gheranda.mudra", "Mudra — the 25 seals", "Seal the energy, direct the current",
    "Mudras are not just hand gestures. They are body seals that redirect prana. Maha mudra: chin to chest, one leg extended, press perineum. Khecari: tongue to soft palate. Viparita: inverted. Each mudra seals a specific leak in the energy body. The great mudras require preparation and guidance.", 2),
  teach("teach.gheranda.progression", "The seven limbs in sequence", "Each limb prepares the next",
    "The sequence is intelligent: shatkarma cleanses → asana steadies → mudra seals → pratyahara withdraws → pranayama masters breath → dhyana steadies mind → samadhi absorbs. You cannot skip steps. A shaky seat makes meditation wobble. Unclean channels make pranayama dangerous. Unsealed energy makes pratyahara impossible. The sequence is the safety net.", 1),
];