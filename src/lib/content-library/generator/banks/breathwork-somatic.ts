/**
 * BREATHWORK + SOMATIC BANKS — compact archetypes with real protocols.
 */

import type { WisdomArchetype } from "./types";

export type BreathworkArchetype = WisdomArchetype & { breathworkType: string };
export type SomaticArchetype = WisdomArchetype & { somaticType: string };

function B(type: string, concept: string, explanation: string, application: string, tags: string[], difficulty: "beginner" | "intermediate" | "advanced" = "beginner", minutes = 6): BreathworkArchetype {
  return { concept, tradition: "Breathwork", source: "ConsciousOS original protocol", explanation, application, questions: ["What is my breath's pattern right now?", "What is the protocol's effect?"], references: ["ConsciousOS original protocol"], excerpt: undefined, evidence: "original", dimensions: ["body", "thought"], paths: ["kriya", "hatha"], domains: ["health", "self_care"], tags, difficulty, minutes, breathworkType: type } as BreathworkArchetype;
}

export const BREATHWORK: BreathworkArchetype[] = [
  B("box", "Box Breathing", "Box breathing (4-4-4-4): inhale 4, hold 4, exhale 4, hold 4. The symmetry regulates the nervous system. Used by athletes and first responders.", "Use as a 5-minute practice. The box is the most portable regulation tool.", ["breathwork", "box", "4-4-4-4", "regulation", "symmetry", "portable"], "beginner", 5),
  B("coherent", "Coherent Breathing", "Coherent breathing (5-5 or 6-6): inhale 5, exhale 5. The resonance frequency optimizes heart rate variability.", "Use as a 10-minute practice. The coherent breath is the HRV optimizer.", ["breathwork", "coherent", "5-5", "6-6", "hrv", "resonance"], "beginner", 10),
  B("wim_hof", "Wim Hof Method", "Wim Hof method: 30-40 power breaths, then breath retention, then recovery breath. The protocol activates the sympathetic nervous system and the immune response.", "Use as a 10-minute practice. The Wim Hof method is the immune activator.", ["breathwork", "wim_hof", "power_breaths", "retention", "immune", "sympathetic"], "intermediate", 10),
  B("bhastrika", "Bhastrika", "Bhastrika (bellows breath): active inhale and exhale, belly pumping. The protocol energizes and clears.", "Use as a 5-minute practice. The bhastrika is the energizer.", ["breathwork", "bhastrika", "bellows", "active", "energizing", "clearing"], "intermediate", 5),
  B("nadi_shodhana", "Nadi Shodhana", "Nadi shodhana (alternate nostril): inhale left, exhale right, inhale right, exhale left. The protocol balances the hemispheres.", "Use as a 10-minute practice. The nadi shodhana is the balancer.", ["breathwork", "nadi_shodhana", "alternate_nostril", "balance", "hemispheres"], "beginner", 10),
  B("ujjayi", "Ujjayi", "Ujjayi (ocean breath): slight throat constriction, oceanic sound. The protocol anchors attention and builds inner heat.", "Use as a 10-minute practice. The ujjayi is the anchor.", ["breathwork", "ujjayi", "ocean", "throat", "anchor", "heat"], "beginner", 10),
  B("sheetali", "Sheetali", "Sheetali (cooling breath): curled tongue, cool air in, nose out. The protocol cools the system.", "Use as a 5-minute practice. The sheetali is the cooler.", ["breathwork", "sheetali", "cooling", "tongue", "cool", "heat"], "beginner", 5),
  B("kapalabhati", "Kapalabhati", "Kapalabhati (skull-shining): sharp exhales, passive inhales. The protocol clears and energizes.", "Use as a 5-minute practice. The kapalabhati is the cleanser.", ["breathwork", "kapalabhati", "skull_shining", "sharp_exhale", "clearing", "energizing"], "intermediate", 5),
  B("sigh", "Physiological Sigh", "Physiological sigh: two quick inhales, one long exhale. The protocol is the fastest known breath reset.", "Use as a 1-minute practice. The sigh is the reset.", ["breathwork", "sigh", "physiological", "reset", "fast", "double_inhale"], "beginner", 1),
  B("custom", "Custom Protocol", "Custom breathwork protocol: user-designed pattern. The protocol is the practitioner's own.", "Use as a 5-minute practice. The custom is the personal.", ["breathwork", "custom", "personal", "user_designed", "pattern"], "beginner", 5),
];

function S(type: string, concept: string, explanation: string, application: string, tags: string[], difficulty: "beginner" | "intermediate" | "advanced" = "beginner", minutes = 10): SomaticArchetype {
  return { concept, tradition: "Somatic", source: "ConsciousOS original protocol", explanation, application, questions: ["What is the body's sensation right now?", "What is the protocol's effect?"], references: ["ConsciousOS original protocol"], excerpt: undefined, evidence: "original", dimensions: ["body", "emotion"], paths: ["hatha", "tantra"], domains: ["health", "self_care"], tags, difficulty, minutes, somaticType: type } as SomaticArchetype;
}

export const SOMATIC: SomaticArchetype[] = [
  S("body_scan", "Systematic Body Scan", "A systematic body scan: progressive awareness from feet to crown. The scan reveals chronic tension and restores body awareness.", "Use as a daily 15-minute practice. The body scan is the somatic foundation.", ["somatic", "body_scan", "progressive", "awareness", "tension", "feet_to_crown"], "beginner", 15),
  S("tension_release", "Tension Release", "A tension release: identify holding, breathe into it, allow release. The release is the body's own undo.", "Use as a daily 10-minute practice. The tension release is the body's reset.", ["somatic", "tension_release", "holding", "breath", "release", "undo"], "beginner", 10),
  S("grounding", "Grounding", "A grounding practice: feet on earth, weight felt, cord visualized. The grounding is the body's stabilization.", "Use as a daily 5-minute practice. The grounding is the body's anchor.", ["somatic", "grounding", "feet", "earth", "weight", "cord", "stabilization"], "beginner", 5),
  S("movement", "Somatic Movement", "A somatic movement: gentle, awareness-led movement. The movement is the body's expression, not the mind's command.", "Use as a daily 15-minute practice. The somatic movement is the body's voice.", ["somatic", "movement", "gentle", "awareness_led", "expression", "body_voice"], "beginner", 15),
  S("touch", "Touch and Pressure", "A touch practice: self-touch, pressure points, gentle pressure. The touch is the body's reassurance.", "Use as a daily 5-minute practice. The touch is the body's comfort.", ["somatic", "touch", "pressure", "self_touch", "pressure_points", "reassurance"], "beginner", 5),
  S("sensation", "Sensation Tracking", "A sensation tracking: follow sensation without naming, without changing. The tracking is the body's reporting.", "Use as a daily 10-minute practice. The sensation tracking is the body's report.", ["somatic", "sensation", "tracking", "following", "reporting", "no_naming"], "beginner", 10),
  S("energy", "Energy Movement", "An energy movement: feel prana's flow, direct attention, allow movement. The energy is the body's vitality.", "Use as a daily 10-minute practice. The energy movement is the body's vitality.", ["somatic", "energy", "prana", "flow", "attention", "vitality"], "intermediate", 10),
  S("posture", "Posture Awareness", "A posture awareness: feel the spine, the balance, the micro-adjustments. The posture is the body's alignment.", "Use as a daily 5-minute practice. The posture awareness is the body's alignment.", ["somatic", "posture", "spine", "balance", "micro_adjustments", "alignment"], "beginner", 5),
  S("breath_body", "Breath-Body", "A breath-body practice: feel the breath as a whole-body event. The breath is the body's tide.", "Use as a daily 10-minute practice. The breath-body is the body's tide.", ["somatic", "breath_body", "whole_body", "tide", "event"], "beginner", 10),
  S("trauma_informed", "Trauma-Informed", "A trauma-informed practice: invitational language, choice, grounding, modifications. The practice is the body's safety.", "Use as a daily 10-minute practice. The trauma-informed is the body's safety.", ["somatic", "trauma_informed", "invitational", "choice", "grounding", "modifications", "safety"], "advanced", 10),
];
