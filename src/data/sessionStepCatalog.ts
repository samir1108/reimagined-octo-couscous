// AUTO-GENERATED from scripts/session_steps_raw.txt
// Catalog of all session step types the ConsciousOS session engine can support.

export type SessionStepCategoryId =
  | "attention_concentration"
  | "body_awareness"
  | "breath_regulation"
  | "creativity_visualization"
  | "emotion_shadow"
  | "intention_willpower"
  | "jap_mantra"
  | "karma_habits"
  | "observation_witnessing"
  | "opening_preparation"
  | "reflection_journaling"
  | "relationships_life"
  | "self_inquiry"
  | "session_closing"
  | "silence_open_awareness"
  | "wisdom_knowledge"
;

export interface SessionStepCategory {
  id: SessionStepCategoryId;
  label: string;
  letter: string;
}

export const SESSION_STEP_CATEGORIES: SessionStepCategory[] = [
  { id: "opening_preparation", label: "Session Opening & Preparation", letter: "A" },
  { id: "attention_concentration", label: "Attention & Concentration", letter: "B" },
  { id: "observation_witnessing", label: "Observation & Witnessing", letter: "C" },
  { id: "self_inquiry", label: "Self-Inquiry", letter: "D" },
  { id: "breath_regulation", label: "Breath & Regulation", letter: "E" },
  { id: "body_awareness", label: "Body Awareness & Five Bodies", letter: "F" },
  { id: "emotion_shadow", label: "Emotion & Shadow Work", letter: "G" },
  { id: "karma_habits", label: "Karma, Habits & Behavioral Patterns", letter: "H" },
  { id: "wisdom_knowledge", label: "Wisdom & Knowledge", letter: "I" },
  { id: "jap_mantra", label: "Jap, Mantra & Contemplative Repetition", letter: "J" },
  { id: "intention_willpower", label: "Intention, Willpower & Focus", letter: "K" },
  { id: "relationships_life", label: "Relationships & Life Domains", letter: "L" },
  { id: "creativity_visualization", label: "Creativity, Visualization & Future Self", letter: "M" },
  { id: "silence_open_awareness", label: "Silence & Open Awareness", letter: "N" },
  { id: "reflection_journaling", label: "Reflection, Journaling & Integration", letter: "O" },
  { id: "session_closing", label: "Session Closing", letter: "P" },
];

export interface SessionStepDefinition {
  id: number;
  key: string;
  title: string;
  category: SessionStepCategoryId;
  categoryLabel: string;
  description: string;
}

function titleCase(key: string): string {
  return key.split('_').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
}

export const SESSION_STEP_CATALOG: SessionStepDefinition[] = [
  { id: 1, key: "welcome", title: titleCase("welcome"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "The guide welcomes the user into the session." },
  { id: 2, key: "intention_setting", title: titleCase("intention_setting"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "User identifies what they want from the session." },
  { id: 3, key: "context_recall", title: titleCase("context_recall"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "AI recalls relevant information from past sessions." },
  { id: 4, key: "state_check", title: titleCase("state_check"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "User reports their current mental or emotional state." },
  { id: 5, key: "energy_check", title: titleCase("energy_check"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "User identifies their perceived energy level." },
  { id: 6, key: "readiness_check", title: titleCase("readiness_check"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "Determines whether the user is ready to begin." },
  { id: 7, key: "environment_setup", title: titleCase("environment_setup"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "Helps the user settle into their surroundings." },
  { id: 8, key: "posture_setup", title: titleCase("posture_setup"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "Guides sitting, standing, walking, or lying down." },
  { id: 9, key: "sensory_settling", title: titleCase("sensory_settling"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "Directs attention to sounds, sensations, and surroundings." },
  { id: 10, key: "session_preview", title: titleCase("session_preview"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "Briefly explains what the session will involve." },
  { id: 11, key: "personalized_invocation", title: titleCase("personalized_invocation"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "Opens with a personalized contemplative prompt." },
  { id: 12, key: "silence_entry", title: titleCase("silence_entry"), category: "opening_preparation", categoryLabel: "Session Opening & Preparation", description: "Transitions into silence without additional instructions." },
  { id: 13, key: "attention_anchoring", title: titleCase("attention_anchoring"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Establishes a chosen focus." },
  { id: 14, key: "single_point_focus", title: titleCase("single_point_focus"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Sustains attention on one object." },
  { id: 15, key: "breath_attention", title: titleCase("breath_attention"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Observes the natural breath." },
  { id: 16, key: "sound_attention", title: titleCase("sound_attention"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Focuses on sounds as they arise and fade." },
  { id: 17, key: "visual_attention", title: titleCase("visual_attention"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Observes a visual object or the orb." },
  { id: 18, key: "body_point_focus", title: titleCase("body_point_focus"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Focuses on a particular bodily sensation." },
  { id: 19, key: "attention_counting", title: titleCase("attention_counting"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Counts breaths or attention cycles." },
  { id: 20, key: "distraction_detection", title: titleCase("distraction_detection"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Notices when attention wanders." },
  { id: 21, key: "attention_return", title: titleCase("attention_return"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Gently returns attention to its anchor." },
  { id: 22, key: "sustained_attention", title: titleCase("sustained_attention"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Practices maintaining attention over time." },
  { id: 23, key: "attention_switching", title: titleCase("attention_switching"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Deliberately switches between attention targets." },
  { id: 24, key: "open_attention", title: titleCase("open_attention"), category: "attention_concentration", categoryLabel: "Attention & Concentration", description: "Broadens attention to include multiple experiences." },
  { id: 25, key: "thought_observation", title: titleCase("thought_observation"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Notices thoughts without following them." },
  { id: 26, key: "emotion_observation", title: titleCase("emotion_observation"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Observes emotions as present experiences." },
  { id: 27, key: "sensation_observation", title: titleCase("sensation_observation"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Notices bodily sensations." },
  { id: 28, key: "impulse_observation", title: titleCase("impulse_observation"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Observes urges before acting on them." },
  { id: 29, key: "inner_dialogue_observation", title: titleCase("inner_dialogue_observation"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Notices internal speech." },
  { id: 30, key: "mental_image_observation", title: titleCase("mental_image_observation"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Observes memories and mental imagery." },
  { id: 31, key: "reaction_observation", title: titleCase("reaction_observation"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Examines how reactions arise." },
  { id: 32, key: "pattern_observation", title: titleCase("pattern_observation"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Identifies recurring patterns." },
  { id: 33, key: "witness_perspective", title: titleCase("witness_perspective"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Invites the user to observe experience rather than immediately identify with it." },
  { id: 34, key: "observer_observed_inquiry", title: titleCase("observer_observed_inquiry"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Investigates the relationship between the observer and the observed." },
  { id: 35, key: "spacious_awareness", title: titleCase("spacious_awareness"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Explores awareness of multiple experiences without selecting one." },
  { id: 36, key: "silence_observation", title: titleCase("silence_observation"), category: "observation_witnessing", categoryLabel: "Observation & Witnessing", description: "Notices quietness and the changing presence of mental activity." },
  { id: 37, key: "identity_inquiry", title: titleCase("identity_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Investigates assumptions about personal identity." },
  { id: 38, key: "who_am_i_inquiry", title: titleCase("who_am_i_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Explores the question, \"Who am I?\"" },
  { id: 39, key: "thought_owner_inquiry", title: titleCase("thought_owner_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Investigates the experience of having a thought." },
  { id: 40, key: "emotion_owner_inquiry", title: titleCase("emotion_owner_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Explores how emotions relate to one's sense of self." },
  { id: 41, key: "desire_inquiry", title: titleCase("desire_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Examines a desire and what drives it." },
  { id: 42, key: "fear_inquiry", title: titleCase("fear_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Investigates a fear with appropriate emotional pacing." },
  { id: 43, key: "belief_inquiry", title: titleCase("belief_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Examines a belief and its supporting assumptions." },
  { id: 44, key: "assumption_inquiry", title: titleCase("assumption_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Identifies an assumption behind a reaction." },
  { id: 45, key: "control_inquiry", title: titleCase("control_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Investigates the wish to control an experience or outcome." },
  { id: 46, key: "attachment_inquiry", title: titleCase("attachment_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Explores attachment to outcomes, identities, or expectations." },
  { id: 47, key: "impermanence_inquiry", title: titleCase("impermanence_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Examines how an experience changes over time." },
  { id: 48, key: "awareness_inquiry", title: titleCase("awareness_inquiry"), category: "self_inquiry", categoryLabel: "Self-Inquiry", description: "Explores what the user can notice about awareness itself." },
  { id: 49, key: "natural_breathing", title: titleCase("natural_breathing"), category: "breath_regulation", categoryLabel: "Breath & Regulation", description: "Observes breathing without changing it." },
  { id: 50, key: "paced_breathing", title: titleCase("paced_breathing"), category: "breath_regulation", categoryLabel: "Breath & Regulation", description: "Guides a comfortable breathing rhythm." },
  { id: 51, key: "extended_exhalation", title: titleCase("extended_exhalation"), category: "breath_regulation", categoryLabel: "Breath & Regulation", description: "Invites a gentle, longer exhalation when comfortable." },
  { id: 52, key: "breath_counting", title: titleCase("breath_counting"), category: "breath_regulation", categoryLabel: "Breath & Regulation", description: "Uses counting to stabilize attention." },
  { id: 53, key: "breath_body_sync", title: titleCase("breath_body_sync"), category: "breath_regulation", categoryLabel: "Breath & Regulation", description: "Connects breath awareness with bodily sensations." },
  { id: 54, key: "breath_transition", title: titleCase("breath_transition"), category: "breath_regulation", categoryLabel: "Breath & Regulation", description: "Uses breathing to transition between session phases." },
  { id: 55, key: "relaxation_scan", title: titleCase("relaxation_scan"), category: "breath_regulation", categoryLabel: "Breath & Regulation", description: "Moves attention through the body while releasing unnecessary tension." },
  { id: 56, key: "grounding", title: titleCase("grounding"), category: "breath_regulation", categoryLabel: "Breath & Regulation", description: "Directs attention to contact with the floor, seat, or surroundings." },
  { id: 57, key: "sensory_orientation", title: titleCase("sensory_orientation"), category: "breath_regulation", categoryLabel: "Breath & Regulation", description: "Reorients attention to the immediate environment." },
  { id: 58, key: "settling_pause", title: titleCase("settling_pause"), category: "breath_regulation", categoryLabel: "Breath & Regulation", description: "Provides a brief pause before continuing." },
  { id: 59, key: "physical_body_scan", title: titleCase("physical_body_scan"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Explores physical sensations throughout the body." },
  { id: 60, key: "posture_awareness", title: titleCase("posture_awareness"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Notices alignment, movement, and muscular tension." },
  { id: 61, key: "interoception", title: titleCase("interoception"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Observes internal bodily sensations." },
  { id: 62, key: "energy_sensation_mapping", title: titleCase("energy_sensation_mapping"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Maps the user's subjective sense of energy." },
  { id: 63, key: "emotion_body_mapping", title: titleCase("emotion_body_mapping"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Explores where emotions are felt physically." },
  { id: 64, key: "breath_body_mapping", title: titleCase("breath_body_mapping"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Notices where breathing is experienced in the body." },
  { id: 65, key: "body_boundary_inquiry", title: titleCase("body_boundary_inquiry"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Investigates the felt boundaries of the body." },
  { id: 66, key: "movement_awareness", title: titleCase("movement_awareness"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Observes deliberate movement." },
  { id: 67, key: "stillness_awareness", title: titleCase("stillness_awareness"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Explores bodily stillness." },
  { id: 68, key: "body_mind_relationship", title: titleCase("body_mind_relationship"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Examines relationships between bodily states and mental activity." },
  { id: 69, key: "pranic_body_reflection", title: titleCase("pranic_body_reflection"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Explores the yogic concept of the pranic body." },
  { id: 70, key: "mental_body_reflection", title: titleCase("mental_body_reflection"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Examines thoughts and mental patterns through the yogic kosha framework." },
  { id: 71, key: "wisdom_body_reflection", title: titleCase("wisdom_body_reflection"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Reflects on discernment and deeper understanding." },
  { id: 72, key: "bliss_body_reflection", title: titleCase("bliss_body_reflection"), category: "body_awareness", categoryLabel: "Body Awareness & Five Bodies", description: "Explores ease, contentment, and the traditional anandamaya kosha concept." },
  { id: 73, key: "emotion_naming", title: titleCase("emotion_naming"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Names the current emotion." },
  { id: 74, key: "emotion_intensity_check", title: titleCase("emotion_intensity_check"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Checks perceived emotional intensity." },
  { id: 75, key: "emotion_allowing", title: titleCase("emotion_allowing"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Practices allowing an emotion to be present without forcing it away." },
  { id: 76, key: "emotion_trigger_mapping", title: titleCase("emotion_trigger_mapping"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Identifies a possible trigger." },
  { id: 77, key: "reaction_chain_review", title: titleCase("reaction_chain_review"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Examines trigger to interpretation to emotion to action." },
  { id: 78, key: "shadow_pattern_reflection", title: titleCase("shadow_pattern_reflection"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Reflects on a recurring or avoided aspect of experience." },
  { id: 79, key: "projection_reflection", title: titleCase("projection_reflection"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Examines possible projections onto other people." },
  { id: 80, key: "inner_conflict_mapping", title: titleCase("inner_conflict_mapping"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Identifies competing needs or beliefs." },
  { id: 81, key: "self_compassion", title: titleCase("self_compassion"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Practices responding to difficulty with kindness." },
  { id: 82, key: "forgiveness_reflection", title: titleCase("forgiveness_reflection"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Explores forgiveness without requiring reconciliation." },
  { id: 83, key: "acceptance_reflection", title: titleCase("acceptance_reflection"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Distinguishes acceptance from approval or resignation." },
  { id: 84, key: "emotional_integration", title: titleCase("emotional_integration"), category: "emotion_shadow", categoryLabel: "Emotion & Shadow Work", description: "Identifies a constructive next step after emotional reflection." },
  { id: 85, key: "trigger_identification", title: titleCase("trigger_identification"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Identifies the situation that activates a recurring pattern." },
  { id: 86, key: "habit_loop_mapping", title: titleCase("habit_loop_mapping"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Maps cue to routine to reward." },
  { id: 87, key: "karma_pattern_reflection", title: titleCase("karma_pattern_reflection"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Reflects on actions and their consequences." },
  { id: 88, key: "intention_action_review", title: titleCase("intention_action_review"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Compares intentions with actual behavior." },
  { id: 89, key: "consequence_visualization", title: titleCase("consequence_visualization"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Considers plausible consequences of a potential action." },
  { id: 90, key: "reaction_pause_practice", title: titleCase("reaction_pause_practice"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Practices inserting a pause before responding." },
  { id: 91, key: "alternative_response_design", title: titleCase("alternative_response_design"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Develops a different response to a familiar trigger." },
  { id: 92, key: "behavioral_commitment", title: titleCase("behavioral_commitment"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Chooses one concrete behavior to practice." },
  { id: 93, key: "environment_design", title: titleCase("environment_design"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Identifies environmental changes that support the intended behavior." },
  { id: 94, key: "habit_rehearsal", title: titleCase("habit_rehearsal"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Mentally rehearses a constructive response." },
  { id: 95, key: "pattern_breaking", title: titleCase("pattern_breaking"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Selects a small interruption to a recurring habit." },
  { id: 96, key: "karma_integration", title: titleCase("karma_integration"), category: "karma_habits", categoryLabel: "Karma, Habits & Behavioral Patterns", description: "Connects the session's insight to a real-world action." },
  { id: 97, key: "wisdom_teaching", title: titleCase("wisdom_teaching"), category: "wisdom_knowledge", categoryLabel: "Wisdom & Knowledge", description: "Presents a short teaching relevant to the session." },
  { id: 98, key: "sutra_reflection", title: titleCase("sutra_reflection"), category: "wisdom_knowledge", categoryLabel: "Wisdom & Knowledge", description: "Introduces and reflects on a yogic sutra." },
  { id: 99, key: "teaching_contemplation", title: titleCase("teaching_contemplation"), category: "wisdom_knowledge", categoryLabel: "Wisdom & Knowledge", description: "Invites the user to contemplate one idea." },
  { id: 100, key: "paradox_inquiry", title: titleCase("paradox_inquiry"), category: "wisdom_knowledge", categoryLabel: "Wisdom & Knowledge", description: "Explores a paradoxical question." },
  { id: 101, key: "metaphor_reflection", title: titleCase("metaphor_reflection"), category: "wisdom_knowledge", categoryLabel: "Wisdom & Knowledge", description: "Uses a metaphor to illuminate experience." },
  { id: 102, key: "guided_imagination", title: titleCase("guided_imagination"), category: "wisdom_knowledge", categoryLabel: "Wisdom & Knowledge", description: "Uses a structured imaginative exercise." },
  { id: 103, key: "perspective_reframing", title: titleCase("perspective_reframing"), category: "wisdom_knowledge", categoryLabel: "Wisdom & Knowledge", description: "Examines an alternative interpretation." },
  { id: 104, key: "discernment_practice", title: titleCase("discernment_practice"), category: "wisdom_knowledge", categoryLabel: "Wisdom & Knowledge", description: "Distinguishes observation from interpretation." },
  { id: 105, key: "knowledge_to_experience", title: titleCase("knowledge_to_experience"), category: "wisdom_knowledge", categoryLabel: "Wisdom & Knowledge", description: "Connects a teaching to something the user can directly investigate." },
  { id: 106, key: "insight_verification", title: titleCase("insight_verification"), category: "wisdom_knowledge", categoryLabel: "Wisdom & Knowledge", description: "Asks what the user actually noticed, rather than assuming the teaching is true for them." },
  { id: 107, key: "mantra_introduction", title: titleCase("mantra_introduction"), category: "jap_mantra", categoryLabel: "Jap, Mantra & Contemplative Repetition", description: "Introduces a chosen mantra or phrase." },
  { id: 108, key: "mental_japa", title: titleCase("mental_japa"), category: "jap_mantra", categoryLabel: "Jap, Mantra & Contemplative Repetition", description: "Repeats a mantra mentally." },
  { id: 109, key: "spoken_japa", title: titleCase("spoken_japa"), category: "jap_mantra", categoryLabel: "Jap, Mantra & Contemplative Repetition", description: "Repeats a mantra aloud." },
  { id: 110, key: "breath_synchronized_japa", title: titleCase("breath_synchronized_japa"), category: "jap_mantra", categoryLabel: "Jap, Mantra & Contemplative Repetition", description: "Coordinates repetition with comfortable breathing." },
  { id: 111, key: "mantra_counting", title: titleCase("mantra_counting"), category: "jap_mantra", categoryLabel: "Jap, Mantra & Contemplative Repetition", description: "Counts repetitions." },
  { id: 112, key: "mantra_listening", title: titleCase("mantra_listening"), category: "jap_mantra", categoryLabel: "Jap, Mantra & Contemplative Repetition", description: "Attends to the sound of the mantra." },
  { id: 113, key: "mantra_silence_transition", title: titleCase("mantra_silence_transition"), category: "jap_mantra", categoryLabel: "Jap, Mantra & Contemplative Repetition", description: "Transitions from repetition into silence." },
  { id: 114, key: "meaning_contemplation", title: titleCase("meaning_contemplation"), category: "jap_mantra", categoryLabel: "Jap, Mantra & Contemplative Repetition", description: "Reflects on the meaning of a mantra." },
  { id: 115, key: "devotional_reflection", title: titleCase("devotional_reflection"), category: "jap_mantra", categoryLabel: "Jap, Mantra & Contemplative Repetition", description: "Offers an optional devotional contemplation." },
  { id: 116, key: "repetition_completion", title: titleCase("repetition_completion"), category: "jap_mantra", categoryLabel: "Jap, Mantra & Contemplative Repetition", description: "Ends the practice and reflects on the experience." },
  { id: 117, key: "goal_clarification", title: titleCase("goal_clarification"), category: "intention_willpower", categoryLabel: "Intention, Willpower & Focus", description: "Clarifies what the user wants to accomplish." },
  { id: 118, key: "priority_selection", title: titleCase("priority_selection"), category: "intention_willpower", categoryLabel: "Intention, Willpower & Focus", description: "Selects the most important current priority." },
  { id: 119, key: "distraction_audit", title: titleCase("distraction_audit"), category: "intention_willpower", categoryLabel: "Intention, Willpower & Focus", description: "Identifies likely distractions." },
  { id: 120, key: "urge_surfing", title: titleCase("urge_surfing"), category: "intention_willpower", categoryLabel: "Intention, Willpower & Focus", description: "Observes an urge without immediately acting on it." },
  { id: 121, key: "delayed_response_practice", title: titleCase("delayed_response_practice"), category: "intention_willpower", categoryLabel: "Intention, Willpower & Focus", description: "Practices waiting before responding." },
  { id: 122, key: "commitment_rehearsal", title: titleCase("commitment_rehearsal"), category: "intention_willpower", categoryLabel: "Intention, Willpower & Focus", description: "Mentally rehearses following through." },
  { id: 123, key: "obstacle_forecasting", title: titleCase("obstacle_forecasting"), category: "intention_willpower", categoryLabel: "Intention, Willpower & Focus", description: "Anticipates a likely obstacle." },
  { id: 124, key: "if_then_planning", title: titleCase("if_then_planning"), category: "intention_willpower", categoryLabel: "Intention, Willpower & Focus", description: "Creates an implementation intention: if X happens, I will do Y." },
  { id: 125, key: "focus_sprint_setup", title: titleCase("focus_sprint_setup"), category: "intention_willpower", categoryLabel: "Intention, Willpower & Focus", description: "Defines a short period of focused work." },
  { id: 126, key: "willpower_reflection", title: titleCase("willpower_reflection"), category: "intention_willpower", categoryLabel: "Intention, Willpower & Focus", description: "Reflects on choices and self-regulation." },
  { id: 127, key: "relationship_reflection", title: titleCase("relationship_reflection"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Examines a relationship situation." },
  { id: 128, key: "perspective_taking", title: titleCase("perspective_taking"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Considers another person's possible perspective." },
  { id: 129, key: "boundary_reflection", title: titleCase("boundary_reflection"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Identifies a personal boundary." },
  { id: 130, key: "communication_rehearsal", title: titleCase("communication_rehearsal"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Practices communicating a thought or need." },
  { id: 131, key: "conflict_reflection", title: titleCase("conflict_reflection"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Examines a conflict and possible responses." },
  { id: 132, key: "gratitude_reflection", title: titleCase("gratitude_reflection"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Reflects on something appreciated." },
  { id: 133, key: "work_purpose_reflection", title: titleCase("work_purpose_reflection"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Connects work with personal values." },
  { id: 134, key: "financial_behavior_reflection", title: titleCase("financial_behavior_reflection"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Examines financial decisions and habits without judgment." },
  { id: 135, key: "health_routine_reflection", title: titleCase("health_routine_reflection"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Reviews daily routines related to well-being." },
  { id: 136, key: "purpose_inquiry", title: titleCase("purpose_inquiry"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Explores values, meaning, and direction." },
  { id: 137, key: "life_domain_priority", title: titleCase("life_domain_priority"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Selects one domain for attention." },
  { id: 138, key: "real_world_action_selection", title: titleCase("real_world_action_selection"), category: "relationships_life", categoryLabel: "Relationships & Life Domains", description: "Chooses a concrete action in that domain." },
  { id: 139, key: "future_self_reflection", title: titleCase("future_self_reflection"), category: "creativity_visualization", categoryLabel: "Creativity, Visualization & Future Self", description: "Imagines a realistic future self." },
  { id: 140, key: "guided_visualization", title: titleCase("guided_visualization"), category: "creativity_visualization", categoryLabel: "Creativity, Visualization & Future Self", description: "Visualizes a chosen scenario." },
  { id: 141, key: "obstacle_visualization", title: titleCase("obstacle_visualization"), category: "creativity_visualization", categoryLabel: "Creativity, Visualization & Future Self", description: "Imagines how to respond to a foreseeable challenge." },
  { id: 142, key: "creative_observation", title: titleCase("creative_observation"), category: "creativity_visualization", categoryLabel: "Creativity, Visualization & Future Self", description: "Observes an ordinary experience with fresh attention." },
  { id: 143, key: "possibility_generation", title: titleCase("possibility_generation"), category: "creativity_visualization", categoryLabel: "Creativity, Visualization & Future Self", description: "Generates alternative possibilities." },
  { id: 144, key: "perspective_shift", title: titleCase("perspective_shift"), category: "creativity_visualization", categoryLabel: "Creativity, Visualization & Future Self", description: "Examines the situation from a different perspective." },
  { id: 145, key: "mental_rehearsal", title: titleCase("mental_rehearsal"), category: "creativity_visualization", categoryLabel: "Creativity, Visualization & Future Self", description: "Rehearses a specific future action." },
  { id: 146, key: "values_alignment", title: titleCase("values_alignment"), category: "creativity_visualization", categoryLabel: "Creativity, Visualization & Future Self", description: "Compares a potential action with personal values." },
  { id: 147, key: "guided_silence", title: titleCase("guided_silence"), category: "silence_open_awareness", categoryLabel: "Silence & Open Awareness", description: "Provides a period without verbal guidance." },
  { id: 148, key: "open_monitoring", title: titleCase("open_monitoring"), category: "silence_open_awareness", categoryLabel: "Silence & Open Awareness", description: "Notices experiences as they arise and change." },
  { id: 149, key: "nonjudgmental_noticing", title: titleCase("nonjudgmental_noticing"), category: "silence_open_awareness", categoryLabel: "Silence & Open Awareness", description: "Practices noticing without immediately evaluating." },
  { id: 150, key: "sound_space_awareness", title: titleCase("sound_space_awareness"), category: "silence_open_awareness", categoryLabel: "Silence & Open Awareness", description: "Observes sounds within the surrounding environment." },
  { id: 151, key: "thought_space_awareness", title: titleCase("thought_space_awareness"), category: "silence_open_awareness", categoryLabel: "Silence & Open Awareness", description: "Observes thoughts appearing and disappearing." },
  { id: 152, key: "awareness_rest", title: titleCase("awareness_rest"), category: "silence_open_awareness", categoryLabel: "Silence & Open Awareness", description: "Invites the user to rest attention without a narrow target." },
  { id: 153, key: "unstructured_sitting", title: titleCase("unstructured_sitting"), category: "silence_open_awareness", categoryLabel: "Silence & Open Awareness", description: "Allows a period of self-directed contemplative practice." },
  { id: 154, key: "silence_duration_choice", title: titleCase("silence_duration_choice"), category: "silence_open_awareness", categoryLabel: "Silence & Open Awareness", description: "Lets the user select the length of a silence interval." },
  { id: 155, key: "experience_recall", title: titleCase("experience_recall"), category: "reflection_journaling", categoryLabel: "Reflection, Journaling & Integration", description: "Recalls what happened during the session." },
  { id: 156, key: "insight_capture", title: titleCase("insight_capture"), category: "reflection_journaling", categoryLabel: "Reflection, Journaling & Integration", description: "Captures an important observation." },
  { id: 157, key: "journal_prompt", title: titleCase("journal_prompt"), category: "reflection_journaling", categoryLabel: "Reflection, Journaling & Integration", description: "Presents a written reflection prompt." },
  { id: 158, key: "voice_reflection", title: titleCase("voice_reflection"), category: "reflection_journaling", categoryLabel: "Reflection, Journaling & Integration", description: "Allows spoken reflection." },
  { id: 159, key: "learning_summary", title: titleCase("learning_summary"), category: "reflection_journaling", categoryLabel: "Reflection, Journaling & Integration", description: "Summarizes what the user learned." },
  { id: 160, key: "uncertainty_capture", title: titleCase("uncertainty_capture"), category: "reflection_journaling", categoryLabel: "Reflection, Journaling & Integration", description: "Records something that remains unclear." },
  { id: 161, key: "pattern_update", title: titleCase("pattern_update"), category: "reflection_journaling", categoryLabel: "Reflection, Journaling & Integration", description: "Updates a candidate pattern based on the user's report." },
  { id: 162, key: "session_rating", title: titleCase("session_rating"), category: "reflection_journaling", categoryLabel: "Reflection, Journaling & Integration", description: "Captures a simple subjective assessment." },
  { id: 163, key: "next_session_recommendation", title: titleCase("next_session_recommendation"), category: "reflection_journaling", categoryLabel: "Reflection, Journaling & Integration", description: "Suggests a possible direction for a future session." },
  { id: 164, key: "integration_action", title: titleCase("integration_action"), category: "reflection_journaling", categoryLabel: "Reflection, Journaling & Integration", description: "Defines one real-world application." },
  { id: 165, key: "session_recap", title: titleCase("session_recap"), category: "session_closing", categoryLabel: "Session Closing", description: "Recaps the session." },
  { id: 166, key: "intention_revisit", title: titleCase("intention_revisit"), category: "session_closing", categoryLabel: "Session Closing", description: "Revisits the initial intention." },
  { id: 167, key: "state_recheck", title: titleCase("state_recheck"), category: "session_closing", categoryLabel: "Session Closing", description: "Checks how the user's experience has changed." },
  { id: 168, key: "gratitude_close", title: titleCase("gratitude_close"), category: "session_closing", categoryLabel: "Session Closing", description: "Ends with optional gratitude." },
  { id: 169, key: "grounding_close", title: titleCase("grounding_close"), category: "session_closing", categoryLabel: "Session Closing", description: "Returns attention to the surroundings." },
  { id: 170, key: "transition_to_day", title: titleCase("transition_to_day"), category: "session_closing", categoryLabel: "Session Closing", description: "Prepares the user to resume their activities." },
  { id: 171, key: "micro_commitment", title: titleCase("micro_commitment"), category: "session_closing", categoryLabel: "Session Closing", description: "Sets a small commitment for the next few hours." },
  { id: 172, key: "session_complete", title: titleCase("session_complete"), category: "session_closing", categoryLabel: "Session Closing", description: "Marks the session as complete and saves its outcome." },
];

export const SESSION_STEP_BY_KEY: Record<string, SessionStepDefinition> = Object.fromEntries(
  SESSION_STEP_CATALOG.map(s => [s.key, s])
);

export const SESSION_STEP_BY_ID: Record<number, SessionStepDefinition> = Object.fromEntries(
  SESSION_STEP_CATALOG.map(s => [s.id, s])
);

export function getStepsByCategory(cat: SessionStepCategoryId): SessionStepDefinition[] {
  return SESSION_STEP_CATALOG.filter(s => s.category === cat);
}

export const SESSION_STEP_COUNT = 172;
