/**
 * Registry mapping ShowroomProgram slug -> CDN video URL.
 * Cards look up their 5-sec hero clip here so program data files stay clean.
 */
import decision from "@/assets/programs/videos/decision-making-with-krishna.mp4.asset.json";
import onion from "@/assets/programs/videos/the-onion-who-am-i.mp4.asset.json";
import reactor from "@/assets/programs/videos/stop-the-reactor.mp4.asset.json";
import watch from "@/assets/programs/videos/watch-your-thoughts.mp4.asset.json";
import willpower from "@/assets/programs/videos/willpower-reforged.mp4.asset.json";
import heart from "@/assets/programs/videos/heart-open-with-meera.mp4.asset.json";
import witness from "@/assets/programs/videos/inner-witness-with-ramana.mp4.asset.json";
import burnout from "@/assets/programs/videos/burnout-reset-with-patanjali.mp4.asset.json";
import letting from "@/assets/programs/videos/letting-go-with-lao-tzu.mp4.asset.json";
import threeBrains from "@/assets/programs/videos/three-brains-protocol.mp4.asset.json";
import stillness from "@/assets/programs/videos/stillness-with-dogen.mp4.asset.json";
// Audience programs (Wave 3)
import audCorpFire from "@/assets/programs/videos/corporate-leadership-under-fire.mp4.asset.json";
import audDuty from "@/assets/programs/videos/duty-without-damage.mp4.asset.json";
import audLoops from "@/assets/programs/videos/loops-trauma-and-the-nervous-system.mp4.asset.json";
import audShakti from "@/assets/programs/videos/shakti-and-the-ethics-of-power.mp4.asset.json";
import audCreator from "@/assets/programs/videos/creator-flow-and-block.mp4.asset.json";
import audParent from "@/assets/programs/videos/parent-patience-presence.mp4.asset.json";
import audStudent from "@/assets/programs/videos/student-focus-under-pressure.mp4.asset.json";
import audAthlete from "@/assets/programs/videos/athlete-mind-in-motion.mp4.asset.json";
import audFounder from "@/assets/programs/videos/founder-decision-loneliness.mp4.asset.json";
import audHealthcare from "@/assets/programs/videos/healthcare-compassion-fatigue.mp4.asset.json";
import audTeacher from "@/assets/programs/videos/teacher-classroom-presence.mp4.asset.json";
import audGrief from "@/assets/programs/videos/grief-and-loss.mp4.asset.json";
import audTeamRepair from "@/assets/programs/videos/corporate-team-repair.mp4.asset.json";
import audGov from "@/assets/programs/videos/government-bureaucrat-integrity.mp4.asset.json";
import audTherapist from "@/assets/programs/videos/healers-therapist-hygiene.mp4.asset.json";
import audRitual from "@/assets/programs/videos/ritual-daily-devotional.mp4.asset.json";

export const PROGRAM_VIDEO_BY_SLUG: Record<string, string> = {
  "decision-making-with-krishna": decision.url,
  "the-onion-who-am-i": onion.url,
  "stop-the-reactor": reactor.url,
  "watch-your-thoughts": watch.url,
  "willpower-reforged": willpower.url,
  "heart-open-with-meera": heart.url,
  "inner-witness-with-ramana": witness.url,
  "burnout-reset-with-patanjali": burnout.url,
  "letting-go-with-lao-tzu": letting.url,
  "three-brains-protocol": threeBrains.url,
  "stillness-with-dogen": stillness.url,
  // Audience programs (base)
  "corporate-leadership-under-fire": audCorpFire.url,
  "duty-without-damage": audDuty.url,
  "loops-trauma-and-the-nervous-system": audLoops.url,
  "shakti-and-the-ethics-of-power": audShakti.url,
  // Audience programs (expansion)
  "creator-flow-and-block": audCreator.url,
  "parent-patience-presence": audParent.url,
  "student-focus-under-pressure": audStudent.url,
  "athlete-mind-in-motion": audAthlete.url,
  "founder-decision-loneliness": audFounder.url,
  "healthcare-compassion-fatigue": audHealthcare.url,
  "teacher-classroom-presence": audTeacher.url,
  "grief-and-loss": audGrief.url,
  "corporate-team-repair": audTeamRepair.url,
  "government-bureaucrat-integrity": audGov.url,
  "healers-therapist-hygiene": audTherapist.url,
  "ritual-daily-devotional": audRitual.url,
  // Audience programs (batch 2) — thematically reuse existing R2 clips
  "nurses-compassion-fatigue": audHealthcare.url,
  "lawyers-mind-of-advocate": audGov.url,
  "monks-renunciate-real-life": stillness.url,
  "refugees-portable-home": audLoops.url,
  "recovery-other-23-hours": willpower.url,
  "caregivers-invisible-shift": audHealthcare.url,
  "lgbtq-self-not-costume": onion.url,
  "prisoners-inside-practice": witness.url,
  "journalists-camera-not-break": audCorpFire.url,
  "sexworkers-body-not-self": audShakti.url,
  "widows-other-side-bed": audGrief.url,
  "musicians-instrument-player": audCreator.url,
};

// Category → fallback video URL for the 300+ mega-catalog programs.
// We reuse existing R2-hosted clips so no new asset uploads are required.
import type { ShowroomProgram } from "./showroomPrograms";
const CATEGORY_FALLBACK_VIDEO: Record<ShowroomProgram["category"], string> = {
  decision: decision.url,
  willpower: willpower.url,
  love: heart.url,
  knowledge: onion.url,
  purpose: audDuty.url,
  nervous: burnout.url,
  art: audCreator.url,
  "self-inquiry": witness.url,
  attention: watch.url,
  shadow: audLoops.url,
};

export function getProgramVideo(slug: string, category?: ShowroomProgram["category"]): string | undefined {
  const direct = PROGRAM_VIDEO_BY_SLUG[slug];
  if (direct) return direct;
  if (category) return CATEGORY_FALLBACK_VIDEO[category];
  return undefined;
}
