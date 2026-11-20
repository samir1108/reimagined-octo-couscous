/**
 * Wave 2 atoms — shatkarmas, bandhas, mudras.
 * Practice atoms for the classical Hatha Yoga cleansings, locks, and seals.
 */
import type { Atom } from "../types";

const practice = (
  id: string,
  category: Atom["category"],
  label: string,
  intent: string,
  script: string[],
  level = 1,
  intensity: Atom["intensity"] = "balanced",
  gates: Atom["gates"] = ["morning", "midday"],
): Atom => ({
  id,
  category,
  label,
  intent,
  durationSec: { min: 120, typical: 300, max: 600 },
  level,
  modality: "sit",
  intensity,
  gates,
  energy: ["medium", "high"],
  script,
});

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

const teach = (
  id: string,
  label: string,
  intent: string,
  body: string,
  level = 0,
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

export const WAVE2_ATOMS: Atom[] = [
  // ─── Shatkarma practice atoms ───
  practice("shatkarma.neti", "kriya", "Neti — Nasal Cleansing",
    "Clear the nasal passage with warm saline water",
    ["Prepare lukewarm saline water in a neti pot.", "Tilt the head, pour through one nostril.", "Let it drain through the other.", "Repeat on the other side.", "Blow gently, breathe free."], 1, "gentle"),
  practice("shatkarma.dhauti", "kriya", "Dhauti — Digestive Cleansing",
    "Cleanse the digestive tract (advanced — guided only)",
    ["Under guidance only.", "Swallow a clean cloth strip (vastra dhauti) or practice kunjal (warm water).", "Retain, then expel.", "Rest, sip warm water.", "Never force — stop if any discomfort."], 3, "fierce", ["morning"]),
  practice("shatkarma.nauli", "kriya", "Nauli — Abdominal Churning",
    "Isolate and churn the abdominal muscles",
    ["Stand, feet apart, knees bent.", "Exhale fully, hold the breath out.", "Contract the abdomen, isolate the rectus muscles.", "Churn left to right, then right to left.", "Release, breathe gently."], 2, "fierce", ["morning"]),
  practice("shatkarma.basti", "kriya", "Basti — Colon Cleansing",
    "Cleanse the colon (advanced — guided only)",
    ["Under guidance only.", "Squat in warm water (jala basti) or use a tube (sushka basti).", "Draw water in, hold, expel.", "Rest, hydrate.", "Never force — stop if any discomfort."], 3, "fierce", ["morning"]),
  practice("shatkarma.kapalbhati", "kriya", "Kapalbhati — Skull-Shining",
    "Rapid exhalations to cleanse the skull and lungs",
    ["Sit tall, hands on knees.", "Sharp exhale through the nose — belly snaps in.", "Inhale is passive.", "30 rounds, rest. Repeat 3 sets.", "End with slow, deep breaths."], 1, "fierce", ["morning"]),
  practice("shatkarma.trataka", "concentration", "Trataka — Steady Gaze",
    "Candle gazing to cleanse the eyes and steady the mind",
    ["Light a candle at eye level, 2 feet away.", "Gaze without blinking as long as comfortable.", "Close eyes, see the after-image.", "Open, repeat.", "End with palms over closed eyes."], 1, "balanced", ["evening", "night"]),

  // ─── Bandha practice atoms ───
  practice("bandha.mula", "kriya", "Mula Bandha — Root Lock",
    "Contract the pelvic floor to hold energy at the root",
    ["Sit tall, spine straight.", "Inhale deeply.", "On exhale, gently contract the perineum (pelvic floor).", "Hold the lock with the breath held, or breathe softly while holding.", "Release, rest. Repeat 5–10 times."], 1, "balanced"),
  practice("bandha.uddiyana", "kriya", "Uddiyana Bandha — Abdominal Lock",
    "Draw the abdomen up and in to stoke the digestive fire",
    ["Stand, feet apart, knees bent.", "Exhale fully through the nose.", "Hold the breath out, draw the abdomen up and in toward the spine.", "Hold comfortably, then release and inhale.", "Repeat 3–5 times. Never on a full stomach."], 2, "fierce", ["morning"]),
  practice("bandha.jalandhara", "kriya", "Jalandhara Bandha — Throat Lock",
    "Chin to chest to seal the throat and calm the mind",
    ["Sit tall, palms on knees.", "Inhale deeply.", "On exhale, lower the chin to the chest, lift the sternum slightly.", "Hold the lock with breath held, or breathe softly.", "Release, inhale. Repeat 5 times."], 1, "gentle"),
  practice("bandha.maha", "kriya", "Maha Bandha — The Great Lock",
    "All three locks together — root, abdomen, throat",
    ["Sit tall, spine straight.", "Inhale deeply.", "Exhale: apply mula (root), then uddiyana (abdomen), then jalandhara (throat).", "Hold all three, still and silent.", "Release in reverse order, inhale. Repeat 3 times."], 3, "fierce", ["morning"]),

  // ─── New mudra atoms (6) ───
  practice("mudra.prana", "mudra", "Prana Mudra — Life-Force Seal",
    "Ring and little finger to thumb — awakens vital energy",
    ["Sit tall, hands on knees, palms up.", "Touch ring and little fingertips to the thumb.", "Index and middle fingers extend gently.", "Breathe naturally, eyes soft.", "Hold 3–10 minutes."], 0, "gentle", ["any"]),
  practice("mudra.apana", "mudra", "Apana Mudra — Downward Seal",
    "Middle and ring finger to thumb — supports elimination",
    ["Sit tall, hands on knees, palms up.", "Touch middle and ring fingertips to the thumb.", "Index and little fingers extend gently.", "Breathe naturally.", "Hold 3–10 minutes."], 0, "gentle", ["any"]),
  practice("mudra.vayu", "mudra", "Vayu Mudra — Air Seal",
    "Index finger folded to thumb — calms excess air (anxiety, gas)",
    ["Sit tall, hands on knees, palms up.", "Fold the index finger, press the thumb gently against it.", "Other fingers extend.", "Breathe slowly.", "Hold 3–10 minutes."], 0, "gentle", ["any"]),
  practice("mudra.akash", "mudra", "Akash Mudra — Ether Seal",
    "Middle finger to thumb — opens space, eases ear/throat",
    ["Sit tall, hands on knees, palms up.", "Touch middle fingertip to the thumb.", "Other fingers extend.", "Breathe naturally.", "Hold 3–10 minutes."], 0, "gentle", ["any"]),
  practice("mudra.prithvi", "mudra", "Prithvi Mudra — Earth Seal",
    "Ring finger to thumb — grounds, strengthens body",
    ["Sit tall, hands on knees, palms up.", "Touch ring fingertip to the thumb.", "Other fingers extend.", "Breathe naturally.", "Hold 3–10 minutes."], 0, "gentle", ["any"]),
  practice("mudra.shunya", "mudra", "Shunya Mudra — Emptiness Seal",
    "Middle finger folded to thumb — relieves vertigo, ear issues",
    ["Sit tall, hands on knees, palms up.", "Fold the middle finger, press the thumb gently against it.", "Other fingers extend.", "Breathe slowly.", "Hold 3–10 minutes."], 0, "gentle", ["any"]),

  // ─── Wisdom-read atoms (Gheranda Samhita references) ───
  read("wisdom.gheranda.1", "Gheranda Samhita 1", "The seven limbs of Hatha",
    "The Gheranda Samhita teaches seven limbs: shatkarma (cleansing), asana (seat), mudra (seal), pratyahara (withdrawal), pranayama (breath), dhyana (meditation), samadhi (absorption).", ["gheranda", "hatha"]),
  read("wisdom.gheranda.shatkarma", "Gheranda · Shatkarma", "The six cleansings",
    "Neti, dhauti, nauli, basti, kapalbhati, trataka — the six actions that purify the body so the light of awareness can shine through.", ["gheranda", "shatkarma"]),
  read("wisdom.gheranda.bandha", "Gheranda · Bandha", "The locks that hold the light",
    "Mula, uddiyana, jalandhara — the three bandhas that seal the energy within, so the prana rises through the sushumna and the yogi rests in stillness.", ["gheranda", "bandha"]),
  read("wisdom.gheranda.mudra", "Gheranda · Mudra", "The ten great seals",
    "The Gheranda names ten great mudras — maha, khechari, viparita, karni, yoni, shakti, bhujangini, manduki, tadagi, and the rest — each a doorway to a deeper state.", ["gheranda", "mudra"]),

  // ─── Teaching atoms ───
  teach("teach.shatkarma", "Shatkarma — the six cleansings", "Purify the vessel before the light",
    "Shatkarma is the first limb of Hatha yoga. Neti (nose), dhauti (digestive tract), nauli (abdomen), basti (colon), kapalbhati (lungs), trataka (eyes). Cleanse the body first — a pure vessel can hold the rising energy without breaking.", 1),
  teach("teach.bandha", "Bandha — the energy locks", "Seal the prana so it rises",
    "Bandhas are muscular locks that direct the flow of prana. Mula (root) holds energy at the base, uddiyana (abdomen) stokes the fire, jalandhara (throat) calms the mind. Together (maha bandha) they force the prana up the sushumna, the central channel.", 2),
  teach("teach.mudra", "Mudra — the seals", "Gesture that seals energy into a state",
    "Mudras are hand, body, or eye gestures that seal prana into a specific state. Each mudra links fingers (the five elements) to redirect energy: prana (vitality), apana (elimination), vayu (air), akash (ether), prithvi (earth), shunya (emptiness).", 1),
];
