/**
 * Wave 16 atoms — Ayurveda Integration.
 * Doshas, dinacharya, ritucharya, agni, marma, panchakarma — the science of life integrated with yoga.
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
  category: "movement",
  label,
  intent,
  durationSec: { min: 180, typical: 300, max: 600 },
  level,
  modality: "move",
  intensity,
  gates,
  energy: ["low", "medium", "high"],
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

export const WAVE16_ATOMS: Atom[] = [
  // ─── Doshas (3) ───
  read("wisdom.ayurveda.vata", "Vata Dosha", "Air + ether — movement, creativity, anxiety",
    "Vata governs all movement: breath, circulation, nerve impulses, thoughts. Balanced vata = creativity, flexibility, enthusiasm. Imbalanced = anxiety, insomnia, dryness, constipation, joint pain. Pacify with warmth, oil, routine, grounding.", ["ayurveda", "vata", "dosha"]),
  read("wisdom.ayurveda.pitta", "Pitta Dosha", "Fire + water — transformation, intelligence, anger",
    "Pitta governs digestion, metabolism, intelligence, vision. Balanced pitta = sharp mind, strong digestion, leadership. Imbalanced = anger, inflammation, acid reflux, skin rashes, burnout. Pacify with cooling, moderation, sweet/bitter/astringent tastes.", ["ayurveda", "pitta", "dosha"]),
  read("wisdom.ayurveda.kapha", "Kapha Dosha", "Earth + water — structure, stability, attachment",
    "Kapha governs structure, lubrication, immunity, memory. Balanced kapha = strength, endurance, compassion. Imbalanced = lethargy, congestion, weight gain, depression, attachment. Pacify with stimulation, lightness, pungent/bitter/astringent tastes.", ["ayurveda", "kapha", "dosha"]),

  // ─── Daily & seasonal routines ───
  read("wisdom.ayurveda.dinacharya", "Dinacharya", "Daily routine aligned with nature's rhythms",
    "Wake before sunrise (brahma muhurta), scrape tongue, oil pull, drink warm water, evacuate, self-massage (abhyanga), exercise to half capacity, bathe, meditate, eat mindfully. Sleep by 10pm. Align daily rhythms with the sun.", ["ayurveda", "dinacharya", "routine"]),
  read("wisdom.ayurveda.ritucharya", "Ritucharya", "Seasonal routine — flow with the year",
    "Six seasons: spring (kapha), summer (pitta), monsoon (vata), autumn (pitta), early winter (vata), late winter (kapha). Adjust diet, lifestyle, herbs, and practices per season. Prevent seasonal imbalances before they arise.", ["ayurveda", "ritucharya", "seasons"]),

  // ─── Agni & Ama ───
  read("wisdom.ayurveda.agni", "Agni — The digestive fire", "The transformer of food into consciousness",
    "Agni is the digestive fire that transforms food into tissues, energy, and consciousness. 13 types: jatharagni (digestive), 7 dhatvagni (tissue), 5 bhutagni (elemental). Balanced agni = health. Weak agni = ama (toxins). Strong agni = vitality, clarity, immunity.", ["ayurveda", "agni", "digestion"]),
  read("wisdom.ayurveda.ama", "Ama — Toxins from incomplete digestion", "The root of disease",
    "Ama is the sticky, foul-smelling residue of undigested food that clogs channels (srotas), weakens agni, and creates disease. Signs: coating on tongue, fatigue, heaviness, cloudy mind, foul breath. Remove ama: fasting, spices, panchakarma.", ["ayurveda", "ama", "toxins"]),

  // ─── Marma & Panchakarma ───
  read("wisdom.ayurveda.marma", "Marma Points", "107 vital junctions of consciousness and matter",
    "Marma are vital points where flesh, veins, arteries, tendons, bones, and joints meet. They are seats of prana. 107 marmas: 11 limbs, 26 trunk, 37 head/neck, 14 back. Stimulating marmas balances doshas, moves prana, heals. Key: hridaya (heart), sthapani (third eye), kshipra (hands/feet).", ["ayurveda", "marma", "vital-points"]),
  read("wisdom.ayurveda.panchakarma", "Panchakarma", "The five cleansing actions — deep purification",
    "The five karmas: 1) Vamana (therapeutic emesis) — clears kapha. 2) Virechana (purgation) — clears pitta. 3) Basti (medicated enema) — clears vata. 4) Nasya (nasal administration) — clears head/neck. 5) Raktamokshana (bloodletting) — clears blood toxins. Preceded by oleation (snehana) and sweating (swedana).", ["ayurveda", "panchakarma", "cleansing"]),

  // ─── Teaching atoms ───
  teach("teach.ayurveda.overview", "Ayurveda — the science of life", "Know your constitution, live in harmony",
    "Ayurveda (ayus = life, veda = knowledge) is the sister science of yoga. It recognizes each person's unique constitution (prakriti) of three doshas: vata (movement), pitta (transformation), kapha (structure). Health is balance of doshas, strong agni, clear channels, and contented mind/senses/soul. Treatment: diet, lifestyle, herbs, yoga, panchakarma.", 0),
  teach("teach.ayurveda.constitution", "Know your prakriti", "Vata = creative, quick, anxious. Pitta = sharp, driven, irritable. Kapha = steady, loving, sluggish. Most people are dual (vata-pitta, pitta-kapha, vata-kapha). Know your nature to make choices that balance.", 0),
  teach("teach.ayurveda.dinacharya", "Dinacharya — the daily rhythm", "Align with the sun, honor the body's intelligence",
    "The ideal day: rise 4:30-6am (vata time), eliminate, cleanse senses, abhyanga (oil massage), yoga/pranayama, bathe, breakfast 7-9am (kapha time), main meal 12-1pm (pitta time - strongest agni), light work/creativity 1-4pm (vata time), wind down 6-8pm, sleep 10pm (kapha time). Consistency > perfection.", 0),
  teach("teach.ayurveda.seasons", "Ritucharya — flow with the seasons", "The year is a cycle of doshas; ride the wave",
    "Spring (kapha): lighten, cleanse, move. Summer (pitta): cool, hydrate, moderate. Monsoon (vata): ground, warm, oil. Autumn (pitta): clear heat, bitter taste. Early winter (vata): nourish, oil, routine. Late winter (kapha): stimulate, lighten, move. Adjust food, sleep, exercise, herbs.", 0),
  teach("teach.ayurveda.agni", "Tend your agni", "Strong digestion = strong life",
    "Eat only when hungry. Eat to 75% full. Chew thoroughly. Sip warm water with meals. Largest meal at noon. No snacking between meals. Spices: ginger, cumin, coriander, fennel, turmeric. Avoid: cold drinks, heavy late meals, overeating, eating when stressed. Agni is the gatekeeper of health.", 0),
  teach("teach.ayurveda.marma", "Marma therapy — touch the vital points", "107 doorways to prana",
    "Marma points are where consciousness touches matter. Self-marma: press hridaya (heart center) for emotion, sthapani (third eye) for clarity, kshipra (palm centers) for energy, talahridaya (palm) for heart connection. Gentle circular pressure, breathe into the point. Integrates beautifully with yoga asana and meditation.", 1),
  teach("teach.ayurveda.panchakarma", "Panchakarma — the deep reset", "Cleanse the root, not the symptom",
    "Panchakarma is not a spa treatment — it's a medical protocol. Requires preparation (snehana/swedana), main treatment (5 karmas), and rejuvenation (rasayana). Done under supervision. Seasonal: spring (kapha) = vamana/nasya. Autumn (pitta) = virechana/raktamokshana. Any time (vata) = basti. Post-care is crucial: gradual return to normal diet/activity.", 1),
];