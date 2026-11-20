import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { buildThemeDirective, type ThemeMemoryRow } from "../_shared/themeOrchestrator.ts";
import { buildPracticeMatrixSignal, type PracticeRow } from "../_shared/practiceMatrix.ts";
import { detectBlockedChakra } from "../_shared/chakraEngine.ts";
import { decideTShape } from "../_shared/tShapeDecider.ts";
import { buildArcDirective, type ArcRow, type ArcTemplateRow, type ArcChapterRow } from "../_shared/arcEngine.ts";
import { computeChargedPaise } from "../_shared/ai-pricing.ts";
import { corsHeaders } from "../_shared/cors.ts";

// ═══════════════════════════════════════════
// V-LEVEL BAND SYSTEM (8 Bands × 24 sub-levels)
// ═══════════════════════════════════════════
const BANDS = [
  { max: 1, name: "THE SLEEPER", archetype: "Autopilot", tone: "practical, grounded, encouraging, simple language", focus: "basic awareness of habits and reactions" },
  { max: 2, name: "THE QUESTIONER", archetype: "Curiosity", tone: "curious, exploratory, warm, question-oriented", focus: "why do I do what I do? self-inquiry begins" },
  { max: 3, name: "THE OBSERVER", archetype: "Witness", tone: "reflective, witnessing, spacious, present-tense", focus: "developing the witness, seeing thoughts as objects" },
  { max: 4, name: "THE ALCHEMIST", archetype: "Transformer", tone: "transmutative, deep, pattern-aware, metaphorical", focus: "patterns as teachers, shadow work, loop dissolution" },
  { max: 5, name: "THE NAVIGATOR", archetype: "Conscious Choice", tone: "intentional, sovereign, clear, decisive", focus: "choosing responses consciously, mastering reactivity" },
  { max: 6, name: "THE ARCHITECT", archetype: "Inner Designer", tone: "creative, systemic, holistic, visionary", focus: "designing inner states, restructuring beliefs" },
  { max: 7, name: "THE CHANNEL", archetype: "Flow", tone: "flowing, intuitive, surrendered, effortless", focus: "allowing rather than doing, trust in the process" },
  { max: 8, name: "THE SOURCE", archetype: "Recognition", tone: "poetic, paradoxical, vast, silent", focus: "awareness recognizing itself, non-dual presence" },
];

function getBandInfo(band: number) {
  const b = BANDS.find(b => band < b.max) || BANDS[BANDS.length - 1];
  const subLevel = Math.floor((band % 1) * 24);
  const phase = subLevel < 8 ? "Entry" : subLevel < 16 ? "Integration" : "Mastery";
  return { ...b, subLevel, phase };
}

// ═══════════════════════════════════════════
// CHAKRA NAMES
// ═══════════════════════════════════════════
const CHAKRA_NAMES: Record<string, string> = {
  root: "Muladhara (Root — Safety/Grounding)",
  sacral: "Svadhisthana (Sacral — Creativity/Emotion)",
  solar: "Manipura (Solar Plexus — Power/Will)",
  heart: "Anahata (Heart — Love/Compassion)",
  throat: "Vishuddha (Throat — Expression/Truth)",
  third_eye: "Ajna (Third Eye — Intuition/Insight)",
  crown: "Sahasrara (Crown — Connection/Transcendence)",
};

// ═══════════════════════════════════════════
// H-CAPACITY LABELS
// ═══════════════════════════════════════════
const H_CAP_GROUPS = {
  awareness: ["awareness", "presence", "stillness"],
  emotional: ["compassion", "equanimity", "generosity"],
  cognitive: ["wisdom", "inquiry", "humility"],
  volitional: ["courage", "patience", "dedication"],
};

// ═══════════════════════════════════════════
// STRUCTURED THEME TAXONOMY (Category → Theme → Prompt → Practice)
// ═══════════════════════════════════════════
type ThemeDimension = "thought" | "emotion" | "body" | "awareness";

interface StructuredThemeCategory {
  id: string;
  label: string;
  dimensionTargets: ThemeDimension[];
  loopHints: string[];
}

interface StructuredThemeSeed {
  categoryId: string;
  title: string;
  description: string;
  affirmation: string;
  focusAreas: string[];
  microPrompt: string;
  microPractice: string;
}

const STRUCTURED_THEME_CATEGORIES: StructuredThemeCategory[] = [
  { id: "awareness_of_awareness", label: "Awareness of Awareness", dimensionTargets: ["awareness"], loopHints: ["narrative", "spiritual", "identity"] },
  { id: "witness_consciousness", label: "Witness Consciousness", dimensionTargets: ["awareness", "thought"], loopHints: ["mental", "comparison", "ego"] },
  { id: "thought_loops", label: "Thought Loops", dimensionTargets: ["thought"], loopHints: ["mental", "cognitive_bias", "narrative"] },
  { id: "mental_noise", label: "Mental Noise", dimensionTargets: ["thought"], loopHints: ["attention", "decision", "productivity"] },
  { id: "emotional_triggers", label: "Emotional Triggers", dimensionTargets: ["emotion"], loopHints: ["emotional", "attachment", "validation"] },
  { id: "emotional_regulation", label: "Emotional Regulation", dimensionTargets: ["emotion", "body"], loopHints: ["emotional", "survival", "relationship"] },
  { id: "body_awareness", label: "Body Awareness", dimensionTargets: ["body"], loopHints: ["body", "energy", "survival"] },
  { id: "breath_rhythm", label: "Breath Rhythm", dimensionTargets: ["body", "awareness"], loopHints: ["anxiety", "energy", "avoidance"] },
  { id: "grounding", label: "Grounding", dimensionTargets: ["body", "emotion"], loopHints: ["survival", "fear", "control"] },
  { id: "inner_dialogue", label: "Inner Dialogue", dimensionTargets: ["thought", "emotion"], loopHints: ["validation", "comparison", "identity"] },
  { id: "attention_control", label: "Attention Control", dimensionTargets: ["thought", "awareness"], loopHints: ["attention", "habit", "distraction"] },
  { id: "presence_in_conversations", label: "Presence in Conversations", dimensionTargets: ["emotion", "awareness"], loopHints: ["relationship", "social", "ego"] },
  { id: "listening_without_judgment", label: "Listening Without Judgment", dimensionTargets: ["emotion", "awareness"], loopHints: ["judgment", "ego", "comparison"] },
  { id: "discipline_practice", label: "Discipline Practice", dimensionTargets: ["thought", "body"], loopHints: ["habit", "avoidance", "motivation"] },
  { id: "procrastination_awareness", label: "Procrastination Awareness", dimensionTargets: ["thought", "body"], loopHints: ["productivity", "avoidance", "fear"] },
  { id: "non_attachment", label: "Non-Attachment", dimensionTargets: ["emotion", "awareness"], loopHints: ["attachment", "control", "identity"] },
  { id: "surrender_practice", label: "Surrender Practice", dimensionTargets: ["emotion", "awareness"], loopHints: ["control", "anxiety", "perfectionism"] },
  { id: "self_compassion", label: "Self-Compassion", dimensionTargets: ["emotion"], loopHints: ["worth", "comparison", "inner_critic"] },
  { id: "inner_stillness", label: "Inner Stillness", dimensionTargets: ["awareness", "body"], loopHints: ["mental", "energy", "reactivity"] },
  { id: "purpose_alignment", label: "Purpose Alignment", dimensionTargets: ["thought", "awareness"], loopHints: ["purpose", "identity", "decision"] },
  // ─── B3–B5 — Shadow, emotion-alchemy, relational ──────────────────
  { id: "shadow_integration", label: "Shadow Integration", dimensionTargets: ["emotion", "awareness"], loopHints: ["shadow", "projection", "inner_critic"] },
  { id: "ego_observation", label: "Ego Observation", dimensionTargets: ["thought", "awareness"], loopHints: ["ego", "identity", "comparison"] },
  { id: "fear_inquiry", label: "Fear Inquiry", dimensionTargets: ["emotion", "awareness"], loopHints: ["fear", "survival", "anxiety"] },
  { id: "desire_alchemy", label: "Desire Alchemy", dimensionTargets: ["emotion", "body"], loopHints: ["attachment", "craving", "addiction"] },
  { id: "anger_as_fuel", label: "Anger as Fuel", dimensionTargets: ["emotion", "body"], loopHints: ["anger", "reactivity", "power"] },
  { id: "grief_holding", label: "Grief Holding", dimensionTargets: ["emotion", "awareness"], loopHints: ["grief", "loss", "attachment"] },
  { id: "forgiveness_practice", label: "Forgiveness Practice", dimensionTargets: ["emotion", "awareness"], loopHints: ["resentment", "grievance", "attachment"] },
  { id: "relational_mirror", label: "Relational Mirror", dimensionTargets: ["emotion", "awareness"], loopHints: ["relationship", "projection", "validation"] },
  { id: "boundary_clarity", label: "Boundary Clarity", dimensionTargets: ["thought", "emotion"], loopHints: ["people_pleasing", "validation", "boundaries"] },
  { id: "gratitude_field", label: "Gratitude Field", dimensionTargets: ["emotion", "awareness"], loopHints: ["scarcity", "comparison", "negativity"] },
  { id: "heart_opening", label: "Heart Opening", dimensionTargets: ["emotion", "body"], loopHints: ["armor", "fear", "intimacy"] },
  // ─── B5–B6 — Navigator / Architect ────────────────────────────────
  { id: "sovereign_choice", label: "Sovereign Choice", dimensionTargets: ["thought", "awareness"], loopHints: ["reactivity", "victim", "agency"] },
  { id: "response_over_reaction", label: "Response Over Reaction", dimensionTargets: ["thought", "body"], loopHints: ["reactivity", "trigger", "impulse"] },
  { id: "inner_authority", label: "Inner Authority", dimensionTargets: ["thought", "awareness"], loopHints: ["validation", "external_reference", "doubt"] },
  { id: "belief_restructuring", label: "Belief Restructuring", dimensionTargets: ["thought", "awareness"], loopHints: ["limiting_belief", "narrative", "identity"] },
  { id: "solitude_capacity", label: "Solitude Capacity", dimensionTargets: ["emotion", "awareness"], loopHints: ["loneliness", "avoidance", "distraction"] },
  { id: "devotion_practice", label: "Devotion Practice", dimensionTargets: ["emotion", "awareness"], loopHints: ["ego", "control", "surrender"] },
  // ─── B6–B7 — Identity fluidity & flow ─────────────────────────────
  { id: "identity_fluidity", label: "Identity Fluidity", dimensionTargets: ["thought", "awareness"], loopHints: ["identity", "ego", "attachment"] },
  { id: "trust_in_unfolding", label: "Trust in Unfolding", dimensionTargets: ["emotion", "awareness"], loopHints: ["control", "anxiety", "future_tripping"] },
  { id: "effortless_action", label: "Effortless Action", dimensionTargets: ["body", "awareness"], loopHints: ["striving", "force", "perfectionism"] },
  { id: "impermanence_awareness", label: "Impermanence Awareness", dimensionTargets: ["thought", "awareness"], loopHints: ["attachment", "clinging", "fear"] },
  // ─── B7–B8 — Source / Non-dual ────────────────────────────────────
  { id: "non_dual_seeing", label: "Non-Dual Seeing", dimensionTargets: ["awareness"], loopHints: ["duality", "separation", "identity"] },
  { id: "silence_as_teacher", label: "Silence as Teacher", dimensionTargets: ["awareness", "body"], loopHints: ["noise", "distraction", "seeking"] },
  { id: "paradox_holding", label: "Paradox Holding", dimensionTargets: ["thought", "awareness"], loopHints: ["dualism", "either_or", "rigidity"] },
  { id: "death_contemplation", label: "Death Contemplation", dimensionTargets: ["thought", "awareness"], loopHints: ["mortality", "denial", "urgency"] },
  // ─── Low-band gentle entries ──────────────────────────────────────
  { id: "sensory_arrival", label: "Sensory Arrival", dimensionTargets: ["body"], loopHints: ["dissociation", "numbness", "overwhelm"] },
  { id: "micro_joy", label: "Micro Joy", dimensionTargets: ["emotion"], loopHints: ["depression", "anhedonia", "negativity"] },
];

const STRUCTURED_THEME_SEEDS: StructuredThemeSeed[] = [
  {
    categoryId: "witness_consciousness",
    title: "The Witness Becomes Clear",
    description: "Today, keep returning to the one who notices. Thoughts may move fast, but awareness can stay steady.",
    affirmation: "I am the one who notices, not the noise I notice.",
    focusAreas: ["Witness Consciousness", "Thought Watching", "Presence"],
    microPrompt: "When a thought appears, silently say: seen.",
    microPractice: "Take 3 conscious breaths before your next reaction.",
  },
  {
    categoryId: "thought_loops",
    title: "Untie the Mental Knot",
    description: "Notice repeated thought loops without entering argument with them. Today is for clarity, not over-analysis.",
    affirmation: "I can observe repetitive thought without becoming it.",
    focusAreas: ["Thought Loops", "Mental Clarity", "Attention Control"],
    microPrompt: "Each time you repeat a thought, label it as loop and pause.",
    microPractice: "Write one looping thought once, then step away for 2 minutes.",
  },
  {
    categoryId: "emotional_triggers",
    title: "Soften the Trigger Point",
    description: "When irritation or hurt appears, meet it as a signal, not a command. Awareness first, action second.",
    affirmation: "I can feel deeply without reacting immediately.",
    focusAreas: ["Emotional Triggers", "Emotional Waves", "Response Space"],
    microPrompt: "Notice where in the body the emotion lands first.",
    microPractice: "Before replying in a charged moment, exhale slowly for 6 counts.",
  },
  {
    categoryId: "body_awareness",
    title: "Listen to the Body First",
    description: "Your body is speaking all day through posture, breath, and tension. Today, make the body your first teacher.",
    affirmation: "My body signals are valid intelligence.",
    focusAreas: ["Body Awareness", "Posture Awareness", "Physical Presence"],
    microPrompt: "Scan jaw, shoulders, and belly every time you unlock your phone.",
    microPractice: "Do a 90-second body reset: loosen jaw, drop shoulders, slow breath.",
  },
  {
    categoryId: "grounding",
    title: "Return to Ground",
    description: "If the day feels scattered, come back to contact and breath. Stability grows through simple repetition.",
    affirmation: "I return to center, again and again.",
    focusAreas: ["Grounding", "Nervous System State", "Calmness"],
    microPrompt: "Feel both feet for 10 seconds before each new task.",
    microPractice: "Name 3 things you can see, 2 you can hear, 1 you can feel.",
  },
  {
    categoryId: "listening_without_judgment",
    title: "Listen Beyond Opinion",
    description: "In conversations, let understanding come before defending. Presence deepens connection faster than advice.",
    affirmation: "I listen to understand, not to win.",
    focusAreas: ["Listening Without Judgment", "Empathy Awareness", "Communication Clarity"],
    microPrompt: "In one conversation, pause 2 seconds before responding.",
    microPractice: "Reflect one sentence back before sharing your view.",
  },
  {
    categoryId: "discipline_practice",
    title: "Steady Over Intense",
    description: "Choose consistency over perfection. A small completed step today is more transformative than grand intention.",
    affirmation: "Small consistent action reshapes my path.",
    focusAreas: ["Discipline Practice", "Consistency Practice", "Task Completion"],
    microPrompt: "Ask: what is the smallest honest next step?",
    microPractice: "Complete one 10-minute focused block with no switching.",
  },
  {
    categoryId: "non_attachment",
    title: "Release the Grip",
    description: "Notice where outcome-clinging creates tension. You can care deeply while holding lightly.",
    affirmation: "I give my best without gripping the result.",
    focusAreas: ["Non-Attachment", "Emotional Boundaries", "Surrender Practice"],
    microPrompt: "When control urgency appears, whisper: allow.",
    microPractice: "Do one task with full effort and zero result-checking for 30 minutes.",
  },
  {
    categoryId: "self_compassion",
    title: "Gentle Strength",
    description: "Replace self-criticism with clean honesty and warmth. Growth accelerates when inner hostility softens.",
    affirmation: "I can be truthful and kind with myself.",
    focusAreas: ["Self-Compassion", "Emotional Honesty", "Inner Dialogue"],
    microPrompt: "When you fail, ask: what support do I need right now?",
    microPractice: "Write one compassionate sentence to yourself after a difficult moment.",
  },
  {
    categoryId: "inner_stillness",
    title: "Quiet the Inner Current",
    description: "Stillness is available in small pauses throughout the day. Let pauses become your inner reset points.",
    affirmation: "Stillness is present beneath movement.",
    focusAreas: ["Inner Stillness", "Silence Awareness", "Breath Watching"],
    microPrompt: "Take one deliberate pause before transitions.",
    microPractice: "Sit in silence for 3 minutes without fixing anything.",
  },
  {
    categoryId: "purpose_alignment",
    title: "Align with What Matters",
    description: "Let choices today reflect your deeper direction, not just urgency. Meaning grows through aligned micro-decisions.",
    affirmation: "My choices reflect what I truly value.",
    focusAreas: ["Purpose", "Alignment", "Decision Awareness"],
    microPrompt: "Before major choices, ask: does this move me toward my deeper path?",
  },
  // ─── New seeds: Shadow / Emotion-alchemy / Relational ────────────
  {
    categoryId: "shadow_integration",
    title: "Meet the Disowned Part",
    description: "What you reject in others often lives quietly in you. Today, turn toward one disowned quality with curiosity, not blame.",
    affirmation: "What I see in others, I can meet in myself.",
    focusAreas: ["Shadow Work", "Projection", "Self-Honesty"],
    microPrompt: "When you judge someone sharply, ask: where does this live in me?",
    microPractice: "Write one trait you dislike in others. Find one moment you embodied it. Hold it without fixing.",
  },
  {
    categoryId: "ego_observation",
    title: "Watch the Self-Story",
    description: "The 'I' is constantly narrating. Today, catch the narrator at work and notice how often the story shifts to protect itself.",
    affirmation: "I can witness the storyteller without becoming it.",
    focusAreas: ["Ego Observation", "Identity", "Narrative Awareness"],
    microPrompt: "Each time you say 'I am ___', pause and ask: who is the one claiming this?",
    microPractice: "List 5 ways you described yourself today. Notice which were defensive.",
  },
  {
    categoryId: "fear_inquiry",
    title: "Sit With the Fear",
    description: "Fear shrinks when met directly. Today, instead of avoiding the anxious thought, turn toward it as a teacher.",
    affirmation: "I can be present with fear without obeying it.",
    focusAreas: ["Fear Inquiry", "Anxiety", "Courage"],
    microPrompt: "Name the fear out loud: 'I am afraid of ___.' Then ask: is this true right now?",
    microPractice: "When fear rises, place a hand on the chest and breathe 6 slow breaths into the sensation.",
  },
  {
    categoryId: "desire_alchemy",
    title: "The Pull Beneath the Want",
    description: "Every craving is pointing at something deeper — connection, safety, meaning. Today, follow the desire to its real source.",
    affirmation: "Behind every want is a real need I can honor.",
    focusAreas: ["Desire Alchemy", "Craving", "Honest Need"],
    microPrompt: "When you want something urgently, ask: what feeling am I really seeking?",
    microPractice: "Pause before one indulgence today. Name the underlying need in one sentence.",
  },
  {
    categoryId: "anger_as_fuel",
    title: "Anger as Clear Signal",
    description: "Anger is not the enemy — unconscious anger is. Today, let anger arrive cleanly, then ask what boundary it's pointing to.",
    affirmation: "My anger is information, not instruction.",
    focusAreas: ["Anger", "Boundaries", "Clean Expression"],
    microPrompt: "When anger rises, locate it in the body before forming words.",
    microPractice: "Write the anger out fully for 3 minutes. Then ask: what does it want me to protect?",
  },
  {
    categoryId: "grief_holding",
    title: "Make Room for the Ache",
    description: "Grief is love with nowhere to go. Today, stop pushing it away — let it move through without needing it to leave quickly.",
    affirmation: "I can hold grief without becoming it.",
    focusAreas: ["Grief", "Loss", "Tender Presence"],
    microPrompt: "Name what you're grieving — even small losses count.",
    microPractice: "Sit with hand on heart for 5 minutes. Say: 'this is allowed here.'",
  },
  {
    categoryId: "forgiveness_practice",
    title: "Set Down the Stone",
    description: "Forgiveness is not approval — it's choosing not to carry the weight anymore. Today, loosen one grip.",
    affirmation: "I release what I no longer wish to carry.",
    focusAreas: ["Forgiveness", "Resentment", "Release"],
    microPrompt: "Name one person (including yourself) you're still holding charge against.",
    microPractice: "Write: 'I release the need to be right about this' three times. Notice what shifts.",
  },
  {
    categoryId: "relational_mirror",
    title: "Others as Mirror",
    description: "Every relationship reflects something back. Today, treat one difficult interaction as a teaching, not a problem.",
    affirmation: "Every encounter is showing me something true.",
    focusAreas: ["Relational Mirror", "Projection", "Self-Awareness"],
    microPrompt: "In one tense moment, ask: what is this person reflecting in me?",
    microPractice: "After a hard conversation, write one sentence about what it revealed about you.",
  },
  {
    categoryId: "boundary_clarity",
    title: "The Honest No",
    description: "Boundaries are not walls — they are clarity about what you can and cannot offer. Today, practice one clean no.",
    affirmation: "My no protects my yes.",
    focusAreas: ["Boundaries", "People-Pleasing", "Clarity"],
    microPrompt: "Before agreeing, pause and ask: is this a true yes?",
    microPractice: "Say no to one request today without explanation or apology.",
  },
  {
    categoryId: "gratitude_field",
    title: "The Already-Given",
    description: "Gratitude is not denial of hardship — it's noticing what is already here. Today, expand the field of what you can see.",
    affirmation: "What is already here is enough to begin.",
    focusAreas: ["Gratitude", "Sufficiency", "Presence"],
    microPrompt: "Find 3 things in this moment you usually overlook.",
    microPractice: "Write 5 specific gratitudes — not concepts, actual moments from today.",
  },
  {
    categoryId: "heart_opening",
    title: "Soften the Armor",
    description: "The heart wears armor for good reasons — but today, in one safe moment, let it loosen. Even a millimeter is enough.",
    affirmation: "I can let warmth in without losing myself.",
    focusAreas: ["Heart Opening", "Vulnerability", "Tenderness"],
    microPrompt: "Where does the chest feel tight? Breathe into it without trying to fix.",
    microPractice: "Send one honest, warm message to someone today — no agenda.",
  },
  // ─── New seeds: Navigator / Architect (B5–B6) ────────────────────
  {
    categoryId: "sovereign_choice",
    title: "Choose, Don't React",
    description: "Between stimulus and response is a small clearing. Today, lengthen that pause — and choose from it.",
    affirmation: "I am the one choosing, not the one being driven.",
    focusAreas: ["Sovereignty", "Conscious Choice", "Agency"],
    microPrompt: "Before reacting, count one slow breath. Then choose.",
    microPractice: "Catch one reactive impulse today. Pause, choose differently, note the result.",
  },
  {
    categoryId: "response_over_reaction",
    title: "The Two-Second Door",
    description: "Most regret lives in the first two seconds. Today, install a small pause between trigger and reply.",
    affirmation: "I respond from clarity, not from charge.",
    focusAreas: ["Response", "Pause Practice", "Trigger Awareness"],
    microPrompt: "Notice your shoulders before you speak in a tense moment.",
    microPractice: "In one charged conversation, wait a full breath before each reply.",
  },
  {
    categoryId: "inner_authority",
    title: "Your Own Yes",
    description: "Reference yourself before you reference others. Today, your inner knowing is the first authority you consult.",
    affirmation: "I trust my own knowing.",
    focusAreas: ["Inner Authority", "Self-Trust", "Discernment"],
    microPrompt: "Before asking anyone, ask yourself first: what do I already know here?",
    microPractice: "Make one decision today purely from your own knowing — no outside check.",
  },
  {
    categoryId: "belief_restructuring",
    title: "Rewrite the Old Code",
    description: "A belief is just a thought you've thought a thousand times. Today, examine one belief that no longer serves and write a truer one.",
    affirmation: "I am not my old beliefs — I am the one who can question them.",
    focusAreas: ["Belief Work", "Narrative", "Reframing"],
    microPrompt: "Catch one 'I am ___' or 'I always ___' belief. Ask: is this absolutely true?",
    microPractice: "Pick one limiting belief. Write a more accurate, equally true statement. Read it 3x.",
  },
  {
    categoryId: "solitude_capacity",
    title: "Be With Yourself",
    description: "Solitude is different from loneliness — it's the ability to be your own good company. Today, practice it intentionally.",
    affirmation: "I am good company for myself.",
    focusAreas: ["Solitude", "Self-Presence", "Inner Companionship"],
    microPrompt: "When you reach for a distraction, ask: can I just be with myself instead?",
    microPractice: "Spend 15 minutes alone with no input — no phone, no music, no task.",
  },
  {
    categoryId: "devotion_practice",
    title: "Offer the Day",
    description: "Devotion is action with the ego placed aside. Today, do one ordinary thing as an offering — to something larger than your preferences.",
    affirmation: "My actions can be an offering, not a transaction.",
    focusAreas: ["Devotion", "Surrender", "Sacred Action"],
    microPrompt: "Before one task, silently dedicate it: 'this is for ___.'",
    microPractice: "Do one chore today with full attention, as if it were a sacred act.",
  },
  // ─── New seeds: Identity fluidity & flow (B6–B7) ─────────────────
  {
    categoryId: "identity_fluidity",
    title: "Who Were You Before the Label?",
    description: "Identities are useful, not ultimate. Today, hold your roles lightly — notice that you exist before any of them.",
    affirmation: "I wear my identities; I am not them.",
    focusAreas: ["Identity Fluidity", "Self-Inquiry", "Spaciousness"],
    microPrompt: "When you introduce yourself, notice: what existed before this label?",
    microPractice: "List 5 identities you carry. Set each down for 1 minute. Notice what remains.",
  },
  {
    categoryId: "trust_in_unfolding",
    title: "Let It Unfold",
    description: "Not everything needs to be controlled to turn out well. Today, in one place, let the future arrive on its own timing.",
    affirmation: "I can trust what I cannot yet see.",
    focusAreas: ["Trust", "Surrender", "Unknowing"],
    microPrompt: "When the mind reaches to control the future, whisper: 'not yet — and that's okay.'",
    microPractice: "Pick one open question in your life. Do not force resolution today. Sit with it for 5 minutes.",
  },
  {
    categoryId: "effortless_action",
    title: "Wu Wei — Action Without Strain",
    description: "Effortlessness is not laziness — it's right timing and right alignment. Today, find one task you can do without pushing.",
    affirmation: "I can act fully without forcing.",
    focusAreas: ["Effortless Action", "Wu Wei", "Flow"],
    microPrompt: "Where am I pushing where I could be flowing?",
    microPractice: "Do one task today at 80% effort instead of 110%. Notice the quality.",
  },
  {
    categoryId: "impermanence_awareness",
    title: "Everything Is Moving",
    description: "Nothing you grip stays the same. Today, notice impermanence as freedom, not loss — what arises also passes.",
    affirmation: "All things move; I can move with them.",
    focusAreas: ["Impermanence", "Non-Clinging", "Anicca"],
    microPrompt: "Watch one sensation rise and pass without intervening.",
    microPractice: "List 3 things you were certain about a year ago that have changed. Bow to the change.",
  },
  // ─── New seeds: Source / Non-dual (B7–B8) ────────────────────────
  {
    categoryId: "non_dual_seeing",
    title: "No Inside, No Outside",
    description: "The line between self and world is thinner than the mind insists. Today, in moments of quiet, notice awareness with no edges.",
    affirmation: "Awareness is the field in which all this appears.",
    focusAreas: ["Non-Duality", "Open Awareness", "Recognition"],
    microPrompt: "Look at something. Then notice: is the seeing inside you, or are you inside the seeing?",
    microPractice: "Sit for 10 minutes. Do not meditate on anything. Rest as the awareness in which everything is appearing.",
  },
  {
    categoryId: "silence_as_teacher",
    title: "Let Silence Speak",
    description: "Silence is not the absence of sound — it is the ground from which sound arises. Today, let silence be your teacher.",
    affirmation: "Silence is teaching me what words cannot.",
    focusAreas: ["Silence", "Inner Quiet", "Listening"],
    microPrompt: "Notice the silence between two sounds.",
    microPractice: "Spend 20 minutes in complete silence. Do not seek anything. Just be available.",
  },
  {
    categoryId: "paradox_holding",
    title: "Hold the Both",
    description: "Truth often arrives as two things that should not coexist — but do. Today, practice holding paradox without collapsing it.",
    affirmation: "I can hold both without choosing.",
    focusAreas: ["Paradox", "Non-Dual Logic", "Wholeness"],
    microPrompt: "Find one place where two opposites are both true in your life.",
    microPractice: "Write: 'I am ___ and I am also ___' five times with honest contradictions. Sit with the both.",
  },
  {
    categoryId: "death_contemplation",
    title: "Maraṇasati — Death Awareness",
    description: "Remembering death sharpens life. Not morbid — clarifying. Today, let mortality strip away what is not essential.",
    affirmation: "Knowing I will die makes today luminous.",
    focusAreas: ["Death Contemplation", "Maraṇasati", "Essentialism"],
    microPrompt: "Ask: if this were my last day, would I still be doing this?",
    microPractice: "Spend 10 minutes contemplating: 'one day, this body will stop.' Notice what becomes urgent and what falls away.",
  },
  // ─── New seeds: Low-band gentle entries (B1–B2) ──────────────────
  {
    categoryId: "sensory_arrival",
    title: "Land in the Senses",
    description: "When the mind is too loud, the senses are the doorway back. Today, return to the body through what you can see, hear, and feel.",
    affirmation: "I am here, in this body, right now.",
    focusAreas: ["Sensory Arrival", "Embodiment", "Grounding"],
    microPrompt: "Notice 5 things you can see in detail you've never noticed before.",
    microPractice: "Do one ordinary thing — drinking water, washing hands — with full sensory attention.",
  },
  {
    categoryId: "micro_joy",
    title: "Catch a Small Joy",
    description: "Joy doesn't have to be earned or large. Today, catch one tiny moment of pleasure before it slips past unnoticed.",
    affirmation: "Joy is available in small doses, all day long.",
    focusAreas: ["Micro Joy", "Savoring", "Presence"],
    microPrompt: "When something feels even slightly good, pause for 3 seconds and stay with it.",
    microPractice: "Note 3 micro-joys today — a sip, a sound, a glance. Write them down before sleep.",
  },
];

const DEFAULT_THEME_SEED: StructuredThemeSeed = {
  categoryId: "awareness_of_awareness",
  title: "Return to Awareness",
  description: "Today, let awareness lead every action. Keep returning to the present moment with simplicity.",
  affirmation: "I return to awareness with every breath.",
  focusAreas: ["Awareness", "Presence", "Observation"],
  microPrompt: "Pause and notice what is here now.",
  microPractice: "Take 3 conscious breaths before each task-switch.",
};

function normalizeForCompare(value?: string | null): string {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickDeterministic<T>(items: T[], seedInput: string): T {
  if (items.length === 0) throw new Error("Cannot pick from empty array");
  let hash = 0;
  for (let i = 0; i < seedInput.length; i++) {
    hash = (hash * 31 + seedInput.charCodeAt(i)) >>> 0;
  }
  return items[hash % items.length];
}

function getWeakestDimension(profile: any): ThemeDimension {
  const dims = profile?.dimension_bands || {};
  const ordered = ([
    { key: "thought" as ThemeDimension, value: Number(dims.thought ?? 0) },
    { key: "emotion" as ThemeDimension, value: Number(dims.emotion ?? 0) },
    { key: "body" as ThemeDimension, value: Number(dims.body ?? 0) },
    { key: "awareness" as ThemeDimension, value: Number(dims.awareness ?? 0) },
  ] as Array<{ key: ThemeDimension; value: number }>).sort((a, b) => a.value - b.value);
  return ordered[0]?.key || "awareness";
}

function pickStructuredCategory(profile: any, loops: any[]): StructuredThemeCategory {
  const weakest = getWeakestDimension(profile);
  const activeLoopIds = (loops || [])
    .filter((l: any) => l?.status === "active" || l?.status === "surfacing")
    .map((l: any) => String(l?.loop_id || "").toLowerCase());

  const byDimension = STRUCTURED_THEME_CATEGORIES.filter((c) => c.dimensionTargets.includes(weakest));
  const byLoops = byDimension.filter((c) => c.loopHints.some((hint) => activeLoopIds.some((id) => id.includes(hint))));

  if (byLoops.length > 0) return byLoops[0];
  if (byDimension.length > 0) return byDimension[0];
  return STRUCTURED_THEME_CATEGORIES[0];
}

function isRepeatedTheme(candidate: { title?: string; affirmation?: string }, recentThemes: any[]): boolean {
  const title = normalizeForCompare(candidate.title);
  const affirmation = normalizeForCompare(candidate.affirmation);
  if (!title && !affirmation) return false;

  return (recentThemes || []).some((t: any) => {
    const titleMatch = title && normalizeForCompare(t?.title) === title;
    const affirmationMatch = affirmation && normalizeForCompare(t?.affirmation) === affirmation;
    return Boolean(titleMatch || (titleMatch && affirmationMatch) || affirmationMatch);
  });
}

function buildStructuredFallbackTheme(input: {
  userId: string;
  date: string;
  profile: any;
  loops: any[];
  recentThemes: any[];
}): StructuredThemeSeed {
  const category = pickStructuredCategory(input.profile, input.loops);
  const candidates = STRUCTURED_THEME_SEEDS.filter((s) => s.categoryId === category.id);
  const seededPick = (candidates.length > 0 ? pickDeterministic(candidates, `${input.userId}-${input.date}-${category.id}`) : DEFAULT_THEME_SEED);

  if (!isRepeatedTheme(seededPick, input.recentThemes)) {
    return seededPick;
  }

  const nonRepeated = STRUCTURED_THEME_SEEDS.filter((s) => !isRepeatedTheme(s, input.recentThemes));
  if (nonRepeated.length > 0) {
    return pickDeterministic(nonRepeated, `${input.userId}-${input.date}-nonrepeat`);
  }

  return DEFAULT_THEME_SEED;
}

// ═══════════════════════════════════════════
// BUILD DEEP PERSONALIZATION CONTEXT
// ═══════════════════════════════════════════
function buildContext(data: {
  profile: any;
  psyche: any;
  memories: any[];
  journals: any[];
  reflections: any[];
  sessionCount: number;
  loops: any[];
  obsTasks: any[];
  yesterdayTasks: any[];
  recentSignals: any[];
  samskaras: any[];
  recentThemes: any[];
}) {
  const { profile, psyche, memories, journals, reflections, sessionCount, loops, obsTasks, yesterdayTasks, recentSignals, samskaras, recentThemes } = data;
  const parts: string[] = [];

  // ── V-LEVEL & BAND ──
  if (profile) {
    const dims = profile.dimension_bands || {};
    const dimEntries = Object.entries(dims).filter(([_, v]) => typeof v === "number") as [string, number][];
    const sorted = [...dimEntries].sort((a, b) => a[1] - b[1]);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];
    const bandInfo = getBandInfo(profile.overall_band || 0);

    parts.push(`═══ V-LEVEL ═══`);
    parts.push(`Band: ${bandInfo.name} (${bandInfo.archetype}) — V-Level ${profile.overall_band?.toFixed(2)} [${bandInfo.phase} sub-phase]. Baseline: ${profile.v_level_baseline?.toFixed(2)}, Peak: ${profile.v_level_peak?.toFixed(2)}, Current: ${profile.v_level_current?.toFixed(2)}.`);
    parts.push(`Journey: Day ${profile.journey_day} (${profile.journey_phase} phase). State: ${profile.state}. Chitta Vritti: ${profile.chitta_vritti}.`);
    parts.push(`Theme tone must be: ${bandInfo.tone}. Focus area: ${bandInfo.focus}.`);

    parts.push(`\n═══ 4 DIMENSIONS ═══`);
    parts.push(`Thought=${dims.thought?.toFixed(1)}, Emotion=${dims.emotion?.toFixed(1)}, Body=${dims.body?.toFixed(1)}, Awareness=${dims.awareness?.toFixed(1)}.`);
    parts.push(`WEAKEST: ${weakest?.[0]} (${weakest?.[1]?.toFixed(1)}) — theme SHOULD address this. STRONGEST: ${strongest?.[0]} (${strongest?.[1]?.toFixed(1)}).`);

    parts.push(`\n═══ WITNESS QUALITY ═══`);
    parts.push(`Gap=${profile.witness_gap?.toFixed(2)}, Stability=${profile.witness_stability?.toFixed(2)}, Depth=${profile.witness_depth?.toFixed(2)}. Integration=${profile.integration_score?.toFixed(2)}. Bypassing risk=${profile.bypassing_risk?.toFixed(2)}.`);

    // ── H-CAPACITIES ──
    const hCaps = profile.h_capacities || {};
    const hEntries = Object.entries(hCaps).filter(([_, v]) => typeof v === "number") as [string, number][];
    if (hEntries.length > 0) {
      const weakH = [...hEntries].sort((a, b) => a[1] - b[1]).slice(0, 3);
      const strongH = [...hEntries].sort((a, b) => b[1] - a[1]).slice(0, 3);
      parts.push(`\n═══ H-CAPACITIES (Human Capacities) ═══`);
      parts.push(`Weakest: ${weakH.map(([k, v]) => `${k}=${v.toFixed(1)}`).join(", ")}. Strongest: ${strongH.map(([k, v]) => `${k}=${v.toFixed(1)}`).join(", ")}.`);
    }

    // ── YOGA PATHS ──
    const yoga = profile.yoga_path_affinity || {};
    const yogaEntries = Object.entries(yoga).filter(([_, v]) => typeof v === "number") as [string, number][];
    if (yogaEntries.length > 0) {
      const dominant = [...yogaEntries].sort((a, b) => b[1] - a[1])[0];
      parts.push(`\n═══ YOGA PATH AFFINITY ═══`);
      parts.push(`Raja=${yoga.raja?.toFixed(1)}, Jnana=${yoga.jnana?.toFixed(1)}, Karma=${yoga.karma?.toFixed(1)}, Bhakti=${yoga.bhakti?.toFixed(1)}. Dominant: ${dominant?.[0]} (${dominant?.[1]?.toFixed(1)}).`);
      if (profile.dominant_path) parts.push(`Confirmed dominant path: ${profile.dominant_path}.`);
    }

    parts.push(`\nStreak: ${profile.streak_current} days (longest: ${profile.streak_longest}). Total sessions: ${profile.total_sessions}. Journal entries: ${profile.total_journal_entries}.`);
  }

  // ── CHAKRA ENERGY (from recent engine plans) ──
  // We derive chakra hints from the profile's samskara clusters and dimension imbalances
  if (profile) {
    const dims = profile.dimension_bands || {};
    parts.push(`\n═══ CHAKRA INSIGHTS ═══`);
    const chakraHints: string[] = [];
    if (dims.body < 3) chakraHints.push(`${CHAKRA_NAMES.root} — needs grounding (body dim low)`);
    if (dims.emotion < 3) chakraHints.push(`${CHAKRA_NAMES.heart} — needs emotional opening (emotion dim low)`);
    if (dims.thought < 3) chakraHints.push(`${CHAKRA_NAMES.third_eye} — needs clarity (thought dim low)`);
    if (dims.awareness < 3) chakraHints.push(`${CHAKRA_NAMES.crown} — needs expanded awareness`);
    if (profile.bypassing_risk > 0.5) chakraHints.push(`${CHAKRA_NAMES.solar} — power center may be bypassed`);
    if (chakraHints.length > 0) parts.push(`Chakras needing attention: ${chakraHints.join("; ")}.`);
    else parts.push(`Chakra system relatively balanced — can work with any energy center.`);
  }

  // ── 3-LENS ANALYSIS (Gut, Heart, Head) ──
  if (recentSignals.length > 0) {
    parts.push(`\n═══ 3-LENS SIGNALS (Recent) ═══`);
    const latest = recentSignals[0];
    const gut = latest.gut_signals || {};
    const heart = latest.heart_signals || {};
    const head = latest.head_signals || {};
    if (Object.keys(gut).length > 0) parts.push(`GUT (Instinct/Body): ${JSON.stringify(gut).slice(0, 200)}`);
    if (Object.keys(heart).length > 0) parts.push(`HEART (Emotion/Relational): ${JSON.stringify(heart).slice(0, 200)}`);
    if (Object.keys(head).length > 0) parts.push(`HEAD (Cognitive/Meaning): ${JSON.stringify(head).slice(0, 200)}`);
    if (latest.chitta_vritti) parts.push(`Chitta Vritti state from analysis: ${latest.chitta_vritti}`);
  }

  // ── SAMSKARAS (Deep Patterns) ──
  if (samskaras.length > 0) {
    parts.push(`\n═══ SAMSKARA CLUSTERS ═══`);
    samskaras.slice(0, 3).forEach((s: any) => {
      parts.push(`Root wound: "${s.root_wound}" (depth=${s.depth?.toFixed(1)}, awareness=${s.awareness?.toFixed(1)}). Chakra correlations: ${JSON.stringify(s.chakra_correlations)}.`);
    });
  }

  // ── PSYCHE PROFILE ──
  if (psyche) {
    parts.push(`\n═══ PSYCHE PROFILE ═══`);
    const arch = psyche.archetypes || {};
    if (arch.dominant) parts.push(`Dominant archetype: ${arch.dominant}. Shadow: ${arch.shadow || "unknown"}.`);
    const emo = psyche.emotional_signatures || {};
    if (emo.baseline_state) parts.push(`Emotional baseline: ${emo.baseline_state}. Range: ${emo.emotional_range?.toFixed(1)}. Maturity: ${emo.emotional_maturity?.toFixed(1)}.`);
    if (emo.suppressed_emotions?.length > 0) parts.push(`Suppressed emotions: ${emo.suppressed_emotions.join(", ")}.`);
    const att = psyche.attachment || {};
    if (att.primary_style) parts.push(`Attachment style: ${att.primary_style}. Secure%: ${att.secure_percentage}.`);
    const shadow = psyche.shadow || {};
    if (shadow.disowned_parts?.length > 0) parts.push(`Shadow/disowned parts: ${shadow.disowned_parts.slice(0, 3).join(", ")}.`);
    const beliefs = psyche.beliefs || {};
    if (beliefs.limiting_beliefs?.length > 0) parts.push(`Limiting beliefs: ${beliefs.limiting_beliefs.slice(0, 3).join("; ")}.`);
  }

  // ── ACTIVE LOOPS ──
  if (loops.length > 0) {
    const activeLoops = loops.filter((l: any) => l.status === "active" || l.status === "surfacing");
    if (activeLoops.length > 0) {
      parts.push(`\n═══ ACTIVE LOOPS ═══`);
      parts.push(activeLoops.map((l: any) => `${l.loop_id} (severity: ${l.severity}, awareness: ${l.awareness_score?.toFixed(1)})`).join("; ") + ".");
    }
  }

  // ── MEMORIES ──
  if (memories.length > 0) {
    const milestones = memories.filter((m: any) => m.category === "milestone" || m.category === "breakthrough");
    const patterns = memories.filter((m: any) => m.category === "pattern" || m.category === "struggle");
    parts.push(`\n═══ MEMORY LAYER ═══`);
    if (milestones.length > 0) parts.push(`Milestones: ${milestones.slice(0, 3).map((m: any) => m.content).join("; ")}.`);
    if (patterns.length > 0) parts.push(`Patterns: ${patterns.slice(0, 3).map((m: any) => m.content).join("; ")}.`);
  }

  // ── JOURNALS & REFLECTIONS ──
  if (journals.length > 0) {
    const moods = journals.filter((j: any) => j.mood).map((j: any) => j.mood);
    parts.push(`\n═══ RECENT JOURNALS ═══`);
    if (moods.length > 0) parts.push(`Moods: ${moods.join(", ")}.`);
    const lastEntry = journals[0];
    if (lastEntry?.content) parts.push(`Last entry: "${lastEntry.content.slice(0, 150)}..."`);
  }

  if (reflections.length > 0) {
    const last = reflections[0];
    parts.push(`\n═══ EVENING REFLECTIONS ═══`);
    parts.push(`Last: mood=${last.mood}/10, energy=${last.energy}/10.${last.challenges ? ` Challenge: "${last.challenges.slice(0, 100)}"` : ""}${last.lessons ? ` Lesson: "${last.lessons.slice(0, 100)}"` : ""}`);
  }

  // ── TASKS & SESSIONS ──
  if (obsTasks.length > 0) {
    const active = obsTasks.find((t: any) => t.status === "active");
    if (active) parts.push(`\nCURRENT OBSERVATION TASK: "${active.title}" (chain step ${active.chain_order}).`);
  }

  if (yesterdayTasks.length > 0) {
    const completed = yesterdayTasks.filter((t: any) => t.status === "completed").length;
    parts.push(`YESTERDAY: ${completed}/${yesterdayTasks.length} tasks completed.`);
  }

  if (recentThemes.length > 0) {
    parts.push(`\n═══ RECENT THEMES (AVOID REPETITION) ═══`);
    parts.push(recentThemes.slice(0, 5).map((t: any) => `${t.theme_date}: ${t.title}`).join("; "));
  }

  parts.push(`Sessions last 7 days: ${sessionCount}.`);

  return parts.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("generate-theme: started");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("generate-theme: auth error", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let requestBody: Record<string, any> = {};
    try {
      requestBody = await req.json();
    } catch {
      requestBody = {};
    }
    const forceRegenerate = requestBody?.forceRegenerate === true;
    const foundationCurriculum = requestBody?.foundationCurriculum || null;
    const guruProgramCurriculum = requestBody?.guruProgramCurriculum || null;
    const isFoundationMode = !!foundationCurriculum;
    const isGuruProgramMode = !!guruProgramCurriculum && !isFoundationMode;
    // Optional: spawn the next theme of the day at a higher sequence_no
    // (used by evolve-theme when current theme exhausts its max_depth).
    const requestedSequenceNo = Math.max(1, Number(requestBody?.sequenceNo) || 0) || null;
    const isAutoNextTheme = requestBody?.autoNextTheme === true;

    const admin = createClient(supabaseUrl, serviceKey);

    // ─── Atomic Credit Pre-Check ───
    const { data: creditCheck } = await admin.rpc("check_credit_balance", { p_user_id: user.id, p_min_balance: 50 });
    if (!creditCheck?.sufficient) {
      return new Response(JSON.stringify({ error: "insufficient_credits", message: "Not enough credits." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

    // ═══════════════════════════════════════════
    // FETCH USER LANGUAGE PREFERENCE
    // ═══════════════════════════════════════════
    let userLanguage = "en";
    try {
      const { data: profileData } = await admin
        .from("profiles")
        .select("bio")
        .eq("user_id", user.id)
        .single();
      if (profileData?.bio) {
        try {
          const prefs = JSON.parse(profileData.bio);
          if (prefs.language) userLanguage = prefs.language;
        } catch { /* bio is plain text */ }
      }
    } catch { /* ignore */ }
    console.log("generate-theme: user language:", userLanguage);

    const { data: recentThemesRaw } = await admin
      .from("daily_themes")
      .select("id,theme_date,title,description,affirmation,focus_areas")
      .eq("user_id", user.id)
      .order("theme_date", { ascending: false })
      .limit(8);

    const recentThemes = recentThemesRaw || [];
    const recentBeforeToday = recentThemes.filter((t: any) => t.theme_date !== today);
    const yesterdayTheme = recentThemes.find((t: any) => t.theme_date === yesterday);

    // ═══════════════════════════════════════════
    // RE-ENTRY / GAP DETECTION
    // If the user hasn't engaged in 2+ days, the prior theme is stale.
    // We re-derive a fresh theme but seed continuity from the last one
    // (loop target / focus areas) so the thread isn't lost.
    // ═══════════════════════════════════════════
    let gapDays = 0;
    let previousFocus: string[] = [];
    let previousTitle: string | null = null;
    let recalibrationNote: string | null = null;
    try {
      const lastTheme = recentBeforeToday[0];
      if (lastTheme?.theme_date) {
        const lastMs = new Date(lastTheme.theme_date + "T00:00:00Z").getTime();
        const todayMs = new Date(today + "T00:00:00Z").getTime();
        gapDays = Math.max(0, Math.round((todayMs - lastMs) / 86400000));
        previousFocus = Array.isArray(lastTheme.focus_areas) ? lastTheme.focus_areas.slice(0, 4) : [];
        previousTitle = lastTheme.title || null;
      }
      // Also check last session — if they engaged elsewhere but no theme was generated
      const { data: lastSessionRow } = await admin
        .from("sessions")
        .select("session_date")
        .eq("user_id", user.id)
        .order("session_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastSessionRow?.session_date) {
        const sMs = new Date(lastSessionRow.session_date + "T00:00:00Z").getTime();
        const todayMs = new Date(today + "T00:00:00Z").getTime();
        const sessionGap = Math.max(0, Math.round((todayMs - sMs) / 86400000));
        // Use the smaller of the two gaps (most recent engagement)
        if (sessionGap < gapDays || gapDays === 0) gapDays = sessionGap;
      }
      if (gapDays >= 2 && gapDays <= 3) {
        recalibrationNote = `Recalibrating — picking up where you left off ${gapDays} days ago.`;
      } else if (gapDays >= 4) {
        recalibrationNote = `Welcome back. It's been ${gapDays} days — starting gently.`;
      }
      console.log("generate-theme: gap detection", { gapDays, previousTitle, recalibrationNote });
    } catch (gapErr: any) {
      console.warn("generate-theme: gap detection failed:", gapErr?.message);
    }

    // ═══════════════════════════════════════════
    // CHECK EXISTING PERSONALIZED THEME (latest sequence for today)
    // ═══════════════════════════════════════════
    let { data: theme } = await admin
      .from("daily_themes")
      .select("*")
      .eq("theme_date", today)
      .eq("user_id", user.id)
      .order("sequence_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Determine sequence_no to write. If caller asked for next theme, bump to max+1.
    const todaysExistingMaxSeq = (theme as any)?.sequence_no ?? 0;
    const targetSequenceNo = requestedSequenceNo
      || (isAutoNextTheme ? todaysExistingMaxSeq + 1 : 1);

    if (theme && (forceRegenerate || isAutoNextTheme || (yesterdayTheme && isRepeatedTheme(theme as any, [yesterdayTheme])))) {
      if (isAutoNextTheme || (requestedSequenceNo && requestedSequenceNo > todaysExistingMaxSeq)) {
        // Spawning a NEW theme alongside the existing one — don't delete.
        console.log("generate-theme: spawning next-sequence theme, seq=", targetSequenceNo);
        theme = null;
      } else {
        console.log("generate-theme: regenerating existing theme due to force/duplicate");
        await admin.from("daily_themes").delete().eq("id", (theme as any).id);
        theme = null;
      }
    }

    console.log("generate-theme: existing theme check done, theme:", !!theme);

    if (!theme) {
      console.log("generate-theme: fetching data sources...");
      // ═══════════════════════════════════════════
      // PARALLEL FETCH ALL 11 DATA SOURCES
      // ═══════════════════════════════════════════
      let profileRes, psycheRes, memoriesRes, journalsRes, reflectionsRes, sessionsCountRes, loopsRes, obsTasksRes, yesterdayTasksRes, signalsRes, samskarasRes;
      try {
        [
          profileRes,
          psycheRes,
          memoriesRes,
          journalsRes,
          reflectionsRes,
          sessionsCountRes,
          loopsRes,
          obsTasksRes,
          yesterdayTasksRes,
          signalsRes,
          samskarasRes,
        ] = await Promise.all([
          admin.from("user_consciousness_profile").select("*").eq("user_id", user.id).single(),
          admin.from("user_psyche_profile").select("*").eq("user_id", user.id).single(),
          admin.rpc("search_memories", {
            p_user_id: user.id,
            p_query: "",
            p_category: null,
            p_dimension: null,
            p_limit: 10,
            p_days: 30,
          }),
          admin.from("journal_entries").select("content,mood,tags,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
          admin.from("evening_reflections").select("mood,energy,gratitudes,challenges,lessons,reflection_date").eq("user_id", user.id).order("reflection_date", { ascending: false }).limit(3),
          admin.from("sessions").select("id").eq("user_id", user.id).gte("session_date", weekAgo),
          admin.from("user_loops").select("loop_id,severity,status,awareness_score").eq("user_id", user.id),
          admin.from("observation_tasks").select("title,status,chain_order,domain").eq("user_id", user.id).order("chain_order"),
          admin.from("daily_tasks").select("status").eq("user_id", user.id).eq("task_date", yesterday),
          admin.from("consciousness_signals").select("gut_signals,heart_signals,head_signals,chitta_vritti,dimension_updates,witness_signals,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
          admin.from("user_samskaras").select("root_wound,depth,awareness,chakra_correlations").eq("user_id", user.id).order("depth", { ascending: false }).limit(5),
        ]);
        // Per-practice levels + spiritual DNA + life domains + arc history — drives v4 engine
        try {
          const [levelsRes, dnaRes, domainsRes, arcRes, activeArcRes, specialtyRes] = await Promise.all([
            admin.from("user_practice_levels").select("practice_type,current_level,sessions_at_level,emotional_healing,loop_dissolution").eq("user_id", user.id),
            admin.from("spiritual_dna_assessments").select("path_bhakti,path_karma,path_jnana,path_raja,brain_head,brain_heart,brain_gut,chitta_vritti_level,primary_loops").eq("user_id", user.id).maybeSingle(),
            admin.from("life_domain_scores").select("domain,score,trend,stressors").eq("user_id", user.id),
            admin.from("arc_history").select("arc_type,spiral_depth,is_completed,journey_day,overall_band").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
            admin.from("theme_arcs").select("*").eq("user_id", user.id).eq("status", "active").order("started_at", { ascending: false }).limit(1).maybeSingle(),
            admin.from("specialty_activations").select("practice_type,is_active,conditions_met,conditions_required").eq("user_id", user.id),
          ]);
          (profileRes as any)._practiceLevels = levelsRes.data || [];
          (profileRes as any)._spiritualDNA = dnaRes.data || null;
          (profileRes as any)._lifeDomains = domainsRes.data || [];
          (profileRes as any)._arc = arcRes.data || null;
          (profileRes as any)._activeArc = activeArcRes.data || null;
          (profileRes as any)._specialties = specialtyRes.data || [];

          // ── Master Curriculum Director: lazily assign arc if none active
          if (!activeArcRes.data) {
            try {
              const directorRes = await fetch(`${supabaseUrl}/functions/v1/assign-curriculum-arc`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${serviceKey}`,
                },
                body: JSON.stringify({ user_id: user.id }),
              });
              if (directorRes.ok) {
                const dj = await directorRes.json();
                if (dj?.arc) {
                  (profileRes as any)._activeArc = dj.arc;
                  activeArcRes.data = dj.arc;
                  console.log("generate-theme: curriculum director assigned arc", dj.arc.title);
                }
              }
            } catch (e: any) {
              console.warn("generate-theme: curriculum director call failed:", e?.message);
            }
          }

          // Load template + recent chapters for the active arc
          if (activeArcRes.data) {
            const arcId = activeArcRes.data.id;
            const tplId = activeArcRes.data.template_id;
            const [tplRes, chapRes] = await Promise.all([
              tplId ? admin.from("arc_templates").select("*").eq("id", tplId).maybeSingle() : Promise.resolve({ data: null }),
              admin.from("arc_chapters").select("day_number,phase,marker,user_reflection,quality_score,chapter_summary").eq("arc_id", arcId).order("day_number", { ascending: false }).limit(7),
            ]);
            (profileRes as any)._arcTemplate = (tplRes as any).data || null;
            (profileRes as any)._arcChapters = chapRes.data || [];
          }
        } catch (_) { /* non-fatal */ }
        console.log("generate-theme: all data sources fetched successfully");
      } catch (fetchErr: any) {
        console.error("generate-theme: data fetch failed:", fetchErr?.message || fetchErr);
        profileRes = { data: null };
        psycheRes = { data: null };
        memoriesRes = { data: [] };
        journalsRes = { data: [] };
        reflectionsRes = { data: [] };
        sessionsCountRes = { data: [] };
        loopsRes = { data: [] };
        obsTasksRes = { data: [] };
        yesterdayTasksRes = { data: [] };
        signalsRes = { data: [] };
        samskarasRes = { data: [] };
      }

      const profileData = profileRes.data || null;
      const loopsData = loopsRes.data || [];

      const fallbackSeed = buildStructuredFallbackTheme({
        userId: user.id,
        date: today,
        profile: profileData,
        loops: loopsData,
        recentThemes: recentBeforeToday,
      });

      const selectedCategory = STRUCTURED_THEME_CATEGORIES.find((c) => c.id === fallbackSeed.categoryId) || STRUCTURED_THEME_CATEGORIES[0];
      const allowedCategories = STRUCTURED_THEME_CATEGORIES.map((c) => `${c.id} (${c.label})`).join(", ");

      const userContext = buildContext({
        profile: profileData,
        psyche: psycheRes.data,
        memories: memoriesRes.data || [],
        journals: journalsRes.data || [],
        reflections: reflectionsRes.data || [],
        sessionCount: sessionsCountRes.data?.length || 0,
        loops: loopsData,
        obsTasks: obsTasksRes.data || [],
        yesterdayTasks: yesterdayTasksRes.data || [],
        recentSignals: signalsRes.data || [],
        samskaras: samskarasRes.data || [],
        recentThemes: recentBeforeToday,
      });

      const identityBand = profileData?.identity_band ?? 0;
      const bandInfo = getBandInfo(profileData?.overall_band || 0);
      const identityBandInfo = getBandInfo(identityBand);

      const identityContext = identityBand > 0 && identityBand !== Math.floor(profileData?.overall_band || 0)
        ? `\n═══ IDENTITY VS DYNAMIC ═══\nUser self-identifies as Band ${identityBand} (${identityBandInfo.name}). Their dynamic V-Level is ${(profileData?.overall_band || 0).toFixed(2)}. Emotional dimension may be lower than cognitive — address both levels in the theme.`
        : "";

      // ═══ PRACTICE LEVELS CONTEXT (Layer 1/2/3 — drives lifetime depth) ═══
      const practiceLevels: any[] = (profileRes as any)._practiceLevels || [];
      const dna: any = (profileRes as any)._spiritualDNA || null;
      let practiceLevelContext = "";
      if (practiceLevels.length > 0 || dna) {
        const lvlMap: Record<string, number> = {};
        practiceLevels.forEach((r: any) => { lvlMap[r.practice_type] = r.current_level; });
        const core = ["observation","self_inquiry","breath","witnessing","body"];
        const path = ["bhakti","karma","jnana","raja"];
        const coreStr = core.map(p => `${p}=L${lvlMap[p] ?? 1}`).join(", ");
        const pathStr = path.map(p => `${p}=L${lvlMap[p] ?? 1}`).join(", ");
        let dnaStr = "";
        let anchor = "", growth = "";
        if (dna) {
          const paths = [["bhakti", dna.path_bhakti],["karma", dna.path_karma],["jnana", dna.path_jnana],["raja", dna.path_raja]];
          paths.sort((a: any, b: any) => (b[1] ?? 0) - (a[1] ?? 0));
          anchor = String(paths[0][0]); growth = String(paths[paths.length - 1][0]);
          dnaStr = `\nSpiritual DNA paths: Bhakti=${dna.path_bhakti}, Karma=${dna.path_karma}, Jnana=${dna.path_jnana}, Raja=${dna.path_raja}. Brain: head=${dna.brain_head}, heart=${dna.brain_heart}, gut=${dna.brain_gut}. Chitta Vritti: ${dna.chitta_vritti_level}.`;
          dnaStr += `\nANCHOR PATH (strength → confidence builder): ${anchor}. GROWTH PATH (weakness → challenge): ${growth}.`;
        }
        // Pick weakest core to recommend
        const weakestCore = core.reduce((a, b) => (lvlMap[a] ?? 1) <= (lvlMap[b] ?? 1) ? a : b);
        const recLevel = (lvlMap[weakestCore] ?? 1);
        practiceLevelContext = `\n═══ PRACTICE LEVELS (3-Layer Framework) ═══\nCORE: ${coreStr}\nPATH: ${pathStr}${dnaStr}\nENGINE RECOMMENDATION: Today's practice should anchor on ${weakestCore} L${recLevel} (weakest core). If anchor path "${anchor || 'unknown'}" is strong, weave it for confidence. Address growth path "${growth || 'unknown'}" subtly.\nCRITICAL: Honor the user's existing levels. Do NOT teach a Bhakti L1 lesson if they are at L4. Speak AT their current level + 0.5 (one step deeper, never patronizing). Use the level's specific name (e.g., "Surrender Practice" for Bhakti L3, "Tattvamasi" for Jnana L4) so practice feels alive and progressive across years.`;
      }


      // ═══════════════════════════════════════════
      // V4 LIVING THEME SIGNALS (Practice Matrix + Chakra + T-Shape)
      // ═══════════════════════════════════════════
      let v4PracticeBlock = "";
      let v4ChakraBlock = "";
      let v4TShapeBlock = "";
      let v4Meta: any = null;
      try {
        const matrixRows: PracticeRow[] = ((profileRes as any)._practiceLevels || []) as PracticeRow[];
        const specialtyRows = ((profileRes as any)._specialties || []) as any[];
        const domainRows = ((profileRes as any)._lifeDomains || []) as any[];
        const matrix = buildPracticeMatrixSignal(matrixRows, specialtyRows, domainRows);
        v4PracticeBlock = `\n\n${matrix.promptBlock}`;

        // Stressed life domain → highest stress score
        const domains: any[] = (profileRes as any)._lifeDomains || [];
        const stressed = [...domains].sort((a: any, b: any) => (a.score ?? 5) - (b.score ?? 5))[0];
        const stressedDomain = stressed && (stressed.score ?? 5) < 5 ? String(stressed.domain) : null;

        // Top loop
        const activeLoops = (loopsData || []).filter((l: any) => l.status === "active" || l.status === "surfacing");
        const topLoop = [...activeLoops].sort((a: any, b: any) => (b.severity ?? 0) - (a.severity ?? 0))[0];

        // Samskara chakra hints
        const samskaraChakras: string[] = [];
        for (const s of (samskarasRes.data || []) as any[]) {
          const corrs = s?.chakra_correlations || {};
          for (const [k, v] of Object.entries(corrs)) {
            if (typeof v === "number" && v > 0.5) samskaraChakras.push(k);
          }
        }

        const dimsObj = profileData?.dimension_bands || {};
        const dimSorted = (Object.entries(dimsObj) as [string, number][])
          .filter(([_, v]) => typeof v === "number")
          .sort((a, b) => a[1] - b[1]);
        const weakestDim = dimSorted[0]?.[0] || "awareness";

        const chakra = detectBlockedChakra({
          weakestDimension: weakestDim,
          topLoopId: topLoop?.loop_id || null,
          stressedDomain,
          samskaraChakras,
          bypassingRisk: profileData?.bypassing_risk || 0,
        });
        v4ChakraBlock = `\n\n${chakra.promptBlock}`;

        // T-Shape decision
        const arc = (profileRes as any)._arc || null;
        const tasksLast7Local = (yesterdayTasksRes.data || []) as any[];
        const completionRate7d = tasksLast7Local.length === 0
          ? 0.5
          : tasksLast7Local.filter((t: any) => t.status === "completed").length / tasksLast7Local.length;

        const tShape = decideTShape({
          overallBand: profileData?.overall_band ?? 0,
          arcType: arc?.arc_type || null,
          spiralDepth: arc?.spiral_depth || 0,
          matrix,
          completionRate7d,
          recentlyRegressed: (profileData?.bypassing_risk ?? 0) > 0.6,
          recentlyBreakthrough: false,
        });
        v4TShapeBlock = `\n\n${tShape.promptDirective}`;

        v4Meta = {
          weakestPractice: matrix.weakestPractice,
          dominantPath: matrix.dominantPath,
          microAnchor: matrix.microAnchor,
          spread: matrix.spread,
          plateauedPractice: matrix.plateauedPractice,
          chakra: { id: chakra.primary.id, sanskrit: chakra.primary.sanskrit, english: chakra.primary.english, theme: chakra.primary.theme, openingPractice: chakra.primary.openingPractice, reason: chakra.reason },
          tShapeMode: tShape.mode,
          tShapeReason: tShape.reason,
          anchorPractice: tShape.anchorPractice,
          spiralDepth: arc?.spiral_depth || 0,
          arcType: arc?.arc_type || null,
          activeSpecialties: matrix.specialties.active,
          lockedSpecialties: matrix.specialties.locked,
          mostStressedDomain: matrix.mostStressedDomain,
        };
        console.log("generate-theme v4: matrix+chakra+tShape built", { mode: tShape.mode, chakra: chakra.primary.id, activeSpecs: matrix.specialties.active.length, stressedDomain: matrix.mostStressedDomain });
      } catch (v4Err: any) {
        console.error("generate-theme v4: signal build failed (non-blocking):", v4Err?.message);
      }


      const modeLabel = isFoundationMode ? "(foundation mode)" : isGuruProgramMode ? `(guru program: ${guruProgramCurriculum?.guruName})` : "(adaptive mode)";
      console.log("generate-theme: calling AI for theme generation...", modeLabel);

      // ═══════════════════════════════════════════
      // BUILD SYSTEM & USER PROMPTS
      // ═══════════════════════════════════════════
      let systemPrompt: string;
      let userPrompt: string;

      if (isFoundationMode && foundationCurriculum) {
        // ─── FOUNDATION COURSE MODE ───
        // Theme is driven by the 118-day curriculum. AI personalizes it using user data.
        const fc = foundationCurriculum;
        systemPrompt = `You are the HOPE Guru — a deeply wise consciousness teacher guiding a student through a 118-day Foundation Course.

TODAY IS DAY ${fc.day} of the course.
PHASE: ${fc.phase} — "${fc.phaseSubtitle}"
TODAY'S LESSON: "${fc.title}" — ${fc.subtitle}
DIMENSION FOCUS: ${fc.dimension}
RELATED CONCEPTS: ${(fc.relatedConcepts || []).join(', ')}

MORNING TEACHING CONTENT:
- Type: ${fc.morningTeaching?.type}
- Core Concept: ${fc.morningTeaching?.concept}
- Key Points: ${(fc.morningTeaching?.keyPoints || []).map((p: string, i: number) => `${i + 1}. ${p}`).join('; ')}
${fc.morningTeaching?.metaphor ? `- Metaphor: "${fc.morningTeaching.metaphor}"` : ''}
${fc.morningTeaching?.scienceNote ? `- Science: ${fc.morningTeaching.scienceNote}` : ''}

DAY PRACTICE:
- Type: ${fc.dayPractice?.type}
- Instruction: ${fc.dayPractice?.instruction}
- Duration: ${fc.dayPractice?.duration}
- Checkpoints: ${(fc.dayPractice?.checkpoints || []).join('; ')}

EVENING INTEGRATION:
- Type: ${fc.eveningIntegration?.type}
- Reflection: "${fc.eveningIntegration?.prompt}"
- Deeper: "${fc.eveningIntegration?.deeperPrompt}"
- Closing Wisdom: "${fc.eveningIntegration?.closingWisdom}"

CRITICAL RULES:
1. The theme TITLE must be "${fc.title}" — do NOT change it.
2. The description must introduce today's core concept ("${fc.morningTeaching?.concept}") in a way that inspires the student.
3. Focus areas must align with the curriculum dimension (${fc.dimension}) and related concepts.
4. The affirmation must be relevant to today's teaching, not generic.
5. Daily intentions must include the practice instruction.
6. Action items must reference the checkpoints.
7. Theme rationale should explain why this lesson matters at Day ${fc.day} of the journey.
8. Learning focus must summarize the core concept clearly.
9. Match vocabulary to identity band tone (${identityBandInfo.tone}).
10. PERSONALIZE using the student's actual data below — reference their specific patterns, loops, or dimensions.

${userLanguage !== "en" ? `CRITICAL LANGUAGE INSTRUCTION: Generate ALL content in "${userLanguage}".` : "Generate all content in English."}`;

        userPrompt = `Generate today's Foundation Course theme for Day ${fc.day} (${today}).

STUDENT DATA:
${userContext}${identityContext}${practiceLevelContext}

Remember: The title MUST be "${fc.title}". Personalize the description, rationale, and intentions to THIS student's actual journey data.`;

      } else if (isGuruProgramMode && guruProgramCurriculum) {
        // ─── GURU PROGRAM MODE ───
        const gp = guruProgramCurriculum;
        systemPrompt = `You are ${gp.guruName} — the master consciousness teacher. A student is on Day ${gp.day} of ${gp.totalDays} in your program "${gp.programTitle}".

PROGRAM: "${gp.programTitle}" — ${gp.programDescription}
FOCUS: ${gp.programFocus}
DAILY OVERVIEW: ${gp.dailyOverview}
DAY: ${gp.day} of ${gp.totalDays}

YOUR TEACHING STYLE: You speak as ${gp.guruName} would. Your signature philosophy, metaphors, and approach must shine through every word.
${gp.guruQuote ? `Your famous quote: "${gp.guruQuote}"` : ''}

CRITICAL RULES:
1. Theme title MUST reflect Day ${gp.day}'s teaching in ${gp.guruName}'s unique voice
2. Description must feel like ${gp.guruName} personally speaking to this student
3. Focus areas must align with the program's focus (${gp.programFocus})
4. Include a specific practice assignment for the 8-hour daytime period
5. Include an evening integration reflection prompt
6. Affirmation must be in ${gp.guruName}'s philosophical style
7. Match vocabulary to identity band tone (${identityBandInfo.tone})
8. PERSONALIZE using the student's actual data below
9. The program should feel like progressive chapters — Day ${gp.day} builds on what came before

${userLanguage !== "en" ? `CRITICAL LANGUAGE INSTRUCTION: Generate ALL content in "${userLanguage}".` : "Generate all content in English."}`;

        userPrompt = `Generate Day ${gp.day}'s theme for the guru program "${gp.programTitle}" with ${gp.guruName} (${today}).

STUDENT DATA:
${userContext}${identityContext}${practiceLevelContext}

Create a theme that feels like ${gp.guruName} personally designed this day's teaching. Include morning wisdom, daytime practice, and evening reflection.`;

      } else {
        // ─── ADAPTIVE MODE ───
        const journeyDay = profileData?.journey_day || 1;

        // ═══════════════════════════════════════════
        // DAY 1 — UNIVERSAL CALIBRATION (no AI call)
        // ═══════════════════════════════════════════
        if (journeyDay === 1) {
          console.log("generate-theme: Day 1 calibration — generating personalized theme via AI");

          // Build onboarding-aware anchor path summary
          let anchorPath = "observation";
          let growthPath = "self_inquiry";
          if (dna) {
            const paths: [string, number][] = [
              ["bhakti", dna.path_bhakti ?? 0],
              ["karma", dna.path_karma ?? 0],
              ["jnana", dna.path_jnana ?? 0],
              ["raja", dna.path_raja ?? 0],
            ];
            paths.sort((a, b) => b[1] - a[1]);
            anchorPath = paths[0][0];
            growthPath = paths[paths.length - 1][0];
          }

          const day1System = `You are the HOPE Inner Companion generating a NEW user's very first daily theme (Day 1).

═══ DAY 1 PURPOSE ═══
This is a CALIBRATION day — the user is meeting the practice for the first time. The theme must:
1. Feel personally authored for THIS user (not generic)
2. Anchor in something simple, embodied, and doable today
3. Use the user's anchor path (${anchorPath}) language naturally — never name the path explicitly
4. Plant a seed for the spiral journey ahead, without overwhelming
5. Be inviting, warm, grounded — never preachy, never abstract
6. Match the user's identity band tone: ${identityBandInfo.tone}
7. Use vocabulary appropriate to band ${identityBand}: ${
            identityBand <= 1 ? "Energy, Clarity, Focus, Habits — avoid Spiritual/Awakening." :
            identityBand <= 2 ? "Self-discovery, Curiosity, Meaning, Inner exploration." :
            identityBand <= 3 ? "Awareness, Presence, Witness, Observation, Mindfulness." :
            identityBand <= 4 ? "Transformation, Pattern Recognition, Loop Breaking, Alchemy." :
            identityBand <= 5 ? "Mastery, Conscious Action, Sovereignty, Choice." :
            identityBand <= 6 ? "Inner Authority, Creation, Alignment, Design." :
            identityBand <= 7 ? "Surrender, Flow, Grace, Channel." :
            "Being, Liberation, Wholeness, Source."
          }

═══ ANCHOR PATH FLAVOR (${anchorPath}) ═══
${anchorPath === "bhakti" ? "Heart-first language. Touch, devotion, opening, softening. The doorway is feeling, not analysis." :
  anchorPath === "karma" ? "Action-first language. Doing, contact, the next honest step. The doorway is movement, not stillness." :
  anchorPath === "jnana" ? "Inquiry-first language. Who notices? What is the thinker? The doorway is the question, not the answer." :
  "Discipline-first language. Posture, breath, structure. The doorway is the practice itself, repeated."}

═══ DAY 1 CONSTRAINTS ═══
- Title: 3-6 evocative words, NOT "Feet-Down Witness Practice" (too generic) — make it personal to this user's profile.
- Description: 2-3 sentences. Reference what we sense about them from onboarding (their anchor path, their starting band, their stated practice years).
- Micro-practice: ONE concrete embodied act doable in under 60 seconds, repeatable through the day.
- Theme rationale: explicitly says this is Day 1 calibration, frames the ${anchorPath} doorway, and promises the engine will learn from today's signals.
- Daily intentions: 3 simple acts. At least one is somatic (body), at least one is awareness-based.
- Learning focus: 1-2 sentences. The seed teaching of their entire journey.
- Action items: 3 concrete things — morning, midday, evening.

${userLanguage !== "en" ? `CRITICAL LANGUAGE: Generate ALL content in "${userLanguage}".` : "Generate all content in English."}`;

          const day1User = `Generate this user's very first personalized theme for Day 1 (${today}).

USER ONBOARDING CONTEXT:
${userContext}${identityContext}${practiceLevelContext}

ANCHOR PATH (strongest from onboarding): ${anchorPath}
GROWTH PATH (weakest from onboarding): ${growthPath}
IDENTITY BAND: ${identityBand} — ${identityBandInfo.name} (${identityBandInfo.archetype})

Make this theme feel like it was written specifically for this person — referencing their actual anchor path, their stated experience level, and their identity band. NOT a generic Day 1 template.`;

          let calibrationPayload: any = null;
          try {
            const day1Resp = await aiGatewayFetchWithLang(req, {
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: day1System },
                { role: "user", content: day1User },
              ],
              tools: [{
                type: "function",
                function: {
                  name: "create_day1_theme",
                  description: "Create a personalized Day 1 calibration theme for a new user",
                  parameters: {
                    type: "object",
                    properties: {
                      category: { type: "string", description: "One of: body_awareness, awareness_of_awareness, witness_consciousness, grounding, self_compassion, inner_stillness, purpose_alignment" },
                      title: { type: "string", description: "Personalized title (3-6 words) — NOT 'Feet-Down Witness Practice'" },
                      description: { type: "string", description: "2-3 sentences personalized to this user's onboarding profile" },
                      focus_areas: { type: "array", items: { type: "string" }, description: "3-5 focus areas tied to their anchor path" },
                      affirmation: { type: "string", description: "Powerful Day 1 affirmation in their band's vocabulary" },
                      micro_prompt: { type: "string", description: "One in-the-moment awareness prompt" },
                      micro_practice: { type: "string", description: "One <60s embodied practice repeatable through the day" },
                      theme_rationale: { type: "string", description: "Why this theme for THIS user on Day 1 — references calibration & their anchor path" },
                      daily_intentions: { type: "array", items: { type: "string" }, description: "3 simple acts (somatic + awareness mix)" },
                      learning_focus: { type: "string", description: "1-2 sentence seed teaching" },
                      action_items: { type: "array", items: { type: "string" }, description: "3 concrete acts: morning, midday, evening" },
                    },
                    required: ["category", "title", "description", "focus_areas", "affirmation", "micro_prompt", "micro_practice", "theme_rationale", "daily_intentions", "learning_focus", "action_items"],
                  },
                },
              }],
              tool_choice: { type: "function", function: { name: "create_day1_theme" } },
            });

            if (day1Resp.ok) {
              const day1Json = await day1Resp.json();
              const toolCall = day1Json?.choices?.[0]?.message?.tool_calls?.[0];
              if (toolCall?.function?.arguments) {
                calibrationPayload = JSON.parse(toolCall.function.arguments);
                console.log("generate-theme: Day 1 AI theme generated:", calibrationPayload.title);
              }
            } else {
              console.error("generate-theme: Day 1 AI call failed:", day1Resp.status);
            }
          } catch (day1Err: any) {
            console.error("generate-theme: Day 1 AI generation error (will fallback):", day1Err?.message);
          }

          // Fallback to a path-flavored static theme if AI failed
          if (!calibrationPayload) {
            const flavorTitle = anchorPath === "bhakti" ? "Touching the Earth Beloved"
              : anchorPath === "karma" ? "The Ground Before Action"
              : anchorPath === "jnana" ? "Who Stands Here?"
              : "First Posture, First Breath";
            calibrationPayload = {
              category: "body_awareness",
              title: flavorTitle,
              description: `Your first day begins with the simplest doorway — contact with the ground, and the quiet awareness behind it. Today the engine watches gently to learn how you move, feel, and notice.`,
              focus_areas: ["Grounding", "Body Awareness", "Witness Consciousness", "Present Moment"],
              affirmation: anchorPath === "bhakti" ? "I touch the earth and the earth touches me." : anchorPath === "karma" ? "I am here. I begin." : anchorPath === "jnana" ? "I am the one who notices." : "My ground is steady. My breath is mine.",
              micro_prompt: "Right now — can you feel both feet touching the ground?",
              micro_practice: "Several times today, pause and feel your feet for 10 seconds. Notice who is feeling.",
              theme_rationale: `Day 1 is calibration. The engine learns your patterns from today's signals. We anchor in ${anchorPath} — your strongest doorway from onboarding — so practice feels native, not foreign.`,
              daily_intentions: [
                "Feel your feet on the ground 3 times today — fully, not in passing",
                "Once today, pause mid-action and notice the one who is acting",
                "End the day with one honest sentence about what you noticed"
              ],
              learning_focus: "Two foundations: contact (body grounded) and witness (awareness behind experience). Everything else builds from these.",
              action_items: [
                "Morning: do the grounding practice with the Guide and share what you noticed",
                "Midday: every time you unlock your phone, feel your feet for 5 seconds first",
                "Evening: journal one line — 'When I felt my feet today, I noticed ___'"
              ],
            };
          }

          // Insert theme without AI call
          const { data: calTheme, error: calErr } = await admin
            .from("daily_themes")
            .insert({
              theme_date: today,
              user_id: user.id,
              title: calibrationPayload.title,
              description: calibrationPayload.description,
              focus_areas: calibrationPayload.focus_areas,
              affirmation: calibrationPayload.affirmation,
              sequence_no: targetSequenceNo,
              max_depth: 3,
            })
            .select()
            .single();

          if (calErr) console.error("generate-theme: calibration theme insert error:", calErr.message);

          // Mark this as calibration day in daily_dimension_summary
          await admin.from("daily_dimension_summary").upsert({
            user_id: user.id,
            summary_date: today,
            is_calibration_day: true,
            calibration_data: { journey_day: 1, identity_band: identityBand },
          }, { onConflict: "user_id,summary_date" });

          // Create calibration-specific tasks
          const calTasks = [
            { time_slot: "morning", title: "Calibration: Know Your Starting Point", description: "Start a Guide session. Answer honestly — how are you feeling? What's on your mind? The AI will gently explore your thought patterns, emotional state, and body awareness to establish your baseline.", domain: "awareness" },
            { time_slot: "midday", title: "Notice Your Breath", description: "Pause for 2 minutes. Feel your breath without changing it. Is it shallow or deep? Fast or slow? Where do you feel it most — chest, belly, nose? Just notice.", domain: "body" },
            { time_slot: "evening", title: "Evening: What Surfaced Today?", description: "Start an evening Guide session. Share what you noticed about yourself today — any reactions, patterns, or surprises. This completes your Day 1 calibration.", domain: "reflection" },
            { time_slot: "night", title: "Journal: 3 Honest Things", description: "Write 3 honest observations about yourself today. Not judgments — just facts. Example: 'I noticed I check my phone when I'm bored.' This is pure data for your journey.", domain: "gratitude" },
          ];

          const taskRows = calTasks.map(t => ({ user_id: user.id, task_date: today, ...t }));
          const { data: insertedCalTasks } = await admin.from("daily_tasks").insert(taskRows).select();

          // Create calibration observation task
          const { data: calObs } = await admin.from("observation_tasks").insert({
            user_id: user.id,
            chain_order: 0,
            status: "active",
            title: "Observe: Your Default Mode",
            description: "Today, notice your 'default mode' — what does your mind do when it has nothing to do? Does it worry, plan, daydream, criticize, or go blank? Just catch it once. No judgment needed.",
            domain: "awareness",
            task_date: today,
            theme_id: calTheme?.id,
          }).select();

          if (calTheme) {
            theme = {
              ...calTheme,
              ...calibrationPayload,
            };
          }

          // Skip the AI call entirely — jump to response
          if (theme) {
            const { data: todaySessions } = await admin
              .from("sessions").select("*")
              .eq("user_id", user.id).eq("session_date", today)
              .order("started_at");

            return new Response(
              JSON.stringify({
                theme,
                dailyTasks: insertedCalTasks || [],
                observationTasks: calObs || [],
                sessions: todaySessions || [],
                isCalibrationDay: true,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        // ═══════════════════════════════════════════
        // DAY 2+ — ADAPTIVE AI-GENERATED THEME
        // ═══════════════════════════════════════════
        
        // Build yesterday's theme continuity context
        let yesterdayContext = "";
        if (yesterdayTheme) {
          yesterdayContext = `\n═══ LAST SESSION'S THEME (BUILD ON THIS) ═══
Last session: "${yesterdayTheme.title}"
Description: "${yesterdayTheme.description}"
Focus areas: ${Array.isArray(yesterdayTheme.focus_areas) ? (yesterdayTheme.focus_areas as string[]).join(', ') : 'N/A'}
${yesterdayTheme.affirmation ? `Affirmation: "${yesterdayTheme.affirmation}"` : ''}

THIS SESSION'S THEME MUST PROGRESS from the last session. If the last session was about noticing thoughts, this one should deepen that (e.g., "the gap between thoughts" or "who notices?"). If the last session was body awareness, this one could be "listening to the body's emotional language." Create a sense of FORWARD MOVEMENT. NEVER use the words "yesterday", "today" or any time-of-day framing — this app is session-based, not day-based. Always say "last session" / "this session" / "next session".`;
        }
        
        // Build recent theme arc for multi-day continuity
        let themeArc = "";
        if (recentBeforeToday.length >= 2) {
          const last3 = recentBeforeToday.slice(0, 3);
          themeArc = `\n═══ RECENT THEME ARC ═══
${last3.map((t: any, i: number) => `${i === 0 ? 'Last session' : i === 1 ? '2 sessions ago' : '3 sessions ago'}: "${t.title}"`).join('\n')}
IMPORTANT: This session's theme should be the NEXT STEP in this progression. The user should feel like they're on a journey that builds session by session within their band. NEVER use "yesterday/today" — always speak in sessions ("last session", "this session", "next session").`;
        }

        // Build Day 1 calibration context if available
        let calibrationContext = "";
        try {
          const { data: calSummary } = await admin
            .from("daily_dimension_summary")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_calibration_day", true)
            .order("summary_date", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (calSummary) {
            calibrationContext = `\n═══ CALIBRATION BASELINE (Day 1 data) ═══
Thought baseline: ${calSummary.thought_score}, Emotion: ${calSummary.emotion_score}, Body: ${calSummary.body_score}, Awareness: ${calSummary.awareness_score}
Signals collected: ${calSummary.signal_count}, Avg confidence: ${calSummary.confidence_avg}
Today is Day ${journeyDay} — personalize based on how far user has come since calibration.`;
          }
        } catch {} 

        systemPrompt = `You are the HOPE Inner Companion — a deeply aware, wise guide (not a teacher, not a robot). Your job is to generate ONE deeply personalized daily theme that helps the user break unconscious patterns and grow in awareness.

═══ CORE PHILOSOPHY ═══
The product is a LOOP INTERRUPTION SYSTEM. Every theme must run this internal cycle:
   AWARENESS → INTERRUPTION → SHIFT → INTEGRATION

Blend 2–4 of these yoga paths NATURALLY based on the user's dominant loop (NEVER name them in output):
- Jnana (self-inquiry) → break illusion, dissolve identity
- Raja (meditation/witness) → slow mind, create space
- Bhakti (surrender/devotion) → soften, release control
- Karma (conscious action) → break inaction, embody insight

═══ LOOP → YOGA BLEND MAP (use this internally) ═══
- Overthinking loop → Jnana + Raja + Bhakti  ("not every thought deserves your attention")
- Emotional reactivity loop → Bhakti + Raja + Jnana  ("feel fully, react slowly")
- Procrastination / inaction loop → Karma + Raja + Bhakti  ("do it without waiting to feel ready")
- Ego / identity loop → Jnana + Bhakti + Raja  ("you are not your story")
- Repetitive life pattern loop → Jnana + Karma + Raja  ("break the pattern consciously")

═══ PROGRESSIVE JOURNEY ═══
- This is DAY ${journeyDay} of the user's consciousness journey.
- Today's theme MUST feel like the NEXT STEP — chapters in a book, not random.
- Use phrases like "building on yesterday's…" or "now that you've begun to…" when appropriate.

═══ DUAL-LAYER ARCHITECTURE ═══
- IDENTITY BAND (fixed at onboarding): ${identityBandInfo.name} (Band ${identityBand}). Sets vocabulary tone.
- DYNAMIC V-LEVEL (measured): ${bandInfo.name} (Band ${Math.floor(profileData?.overall_band || 0)}). Address each dimension at its OWN level — Thought can be Band 3 while Emotion is Band 0.

═══ BAND-SPECIFIC LANGUAGE ═══
${identityBand <= 1 ? '- Use: Energy, Clarity, Performance, Focus, Habits. AVOID: Consciousness, Spiritual, Awakening, Non-dual.' :
  identityBand <= 2 ? '- Use: Self-discovery, Curiosity, Meaning, Growth, Inner exploration.' :
  identityBand <= 3 ? '- Use: Awareness, Presence, Witness, Observation, Mindfulness.' :
  identityBand <= 4 ? '- Use: Transformation, Shadow Work, Loop Breaking, Pattern Recognition, Alchemy.' :
  identityBand <= 5 ? '- Use: Mastery, Freedom, Conscious Action, Response Choice, Navigation.' :
  identityBand <= 6 ? '- Use: Inner Authority, Creation, Alignment, Design, Architecture.' :
  identityBand <= 7 ? '- Use: Surrender, Flow, Grace, Intuition, Channel.' :
  '- Use: Being, Liberation, Wholeness, Recognition, Source.'}

═══ DEPTH BY V-LEVEL ═══
- Low band (0–2) → simple awareness, body anchors, no abstract spirituality
- Mid band (3–5) → add inquiry, pattern naming, conscious response
- High band (6–8) → identity dissolution, paradox, non-dual pointing

═══ THEMATIC FAMILIES (inspiration only — NEVER copy verbatim) ═══
Awareness & Observation · Self-Inquiry · Release & Detachment · Emotional Intelligence · Body Awareness ·
Discipline & Conscious Action · Surrender & Trust · Patterns & Shadow Work · Stillness & Presence · Integration & Purpose

═══ THEME GENERATION RULES ═══
1. PRIORITIZE the user's weakest dimension and most active loop.
2. Match vocabulary to identity band tone (${identityBandInfo.tone}).
3. Keep continuity with active observation tasks and yesterday's theme.
4. If bypassing risk > 0.3, ground in body/emotion (no abstract talk).
5. NEVER repeat yesterday's title or affirmation — but BUILD on its direction.
6. Choose category from allowed list only: ${allowedCategories}.
7. Preferred category: ${selectedCategory.id} (${selectedCategory.label}) unless data strongly indicates another.
8. Speak as a wise companion — warm, grounded, real-life. NEVER sound like a teacher or app.
9. Output MUST contain: a powerful one-sentence theme, why-this, real-life trigger, micro-practice, inner inquiry, resistance warning, integration, engagement question. ALL fields are required and must feel alive.
10. The theme_rationale MUST reference Day ${journeyDay} progression and what was explored yesterday.

${userLanguage !== "en" ? `CRITICAL LANGUAGE INSTRUCTION: User's preferred language is "${userLanguage}". Generate ALL content in "${userLanguage}".` : "Generate all content in English."}`;

        // ═══ THEME ORCHESTRATOR (Plan §12 — Lifetime Phase + Repetition + Length + Combination) ═══
        let orchestratorDirective = "";
        let orchestratorMeta: any = null;
        try {
          const tasksLast7 = (yesterdayTasksRes.data || []) as any[];
          const completionRate = tasksLast7.length === 0
            ? 0.5
            : tasksLast7.filter((t: any) => t.status === "completed").length / tasksLast7.length;
          const lastReflection = (reflectionsRes.data || [])[0] as any;
          const maxLoopSeverity = (loopsData || []).reduce((m: number, l: any) => Math.max(m, Number(l.severity) || 0), 0);

          const recentForOrchestrator: ThemeMemoryRow[] = (recentBeforeToday || []).map((t: any) => ({
            theme_date: t.theme_date,
            title: t.title,
            description: t.description,
            affirmation: t.affirmation,
            focus_areas: t.focus_areas,
            quality: null,        // future: derive from session quality_score
            completed: null,      // future: derive from daily_tasks completion that day
          }));

          // Practice-level summaries already computed earlier
          const practiceLevelsLocal: any[] = (profileRes as any)._practiceLevels || [];
          const lvlMap: Record<string, number> = {};
          practiceLevelsLocal.forEach((r: any) => { lvlMap[r.practice_type] = r.current_level; });
          const dnaLocal: any = (profileRes as any)._spiritualDNA || null;
          let anchor: string | null = null;
          let growth: string | null = null;
          if (dnaLocal) {
            const paths = [["bhakti", dnaLocal.path_bhakti], ["karma", dnaLocal.path_karma], ["jnana", dnaLocal.path_jnana], ["raja", dnaLocal.path_raja]] as [string, number][];
            paths.sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
            anchor = paths[0][0];
            growth = paths[paths.length - 1][0];
          }
          const coreList = ["observation", "self_inquiry", "breath", "witnessing", "body"];
          const weakestCorePractice = coreList.reduce((a, b) => (lvlMap[a] ?? 1) <= (lvlMap[b] ?? 1) ? a : b);

          const directive = buildThemeDirective({
            today,
            journeyDay,
            overallBand: profileData?.overall_band ?? 0,
            recentThemes: recentForOrchestrator,
            recentSessionsCount7d: sessionsCountRes.data?.length || 0,
            recentTaskCompletionRate7d: completionRate,
            yesterdayMood: lastReflection?.mood ?? null,
            yesterdayEnergy: lastReflection?.energy ?? null,
            regressionDetected: (profileData?.bypassing_risk ?? 0) > 0.6,
            breakthroughDetected: false, // hooked in later when breakthrough engine reports it
            activeLoopSeverity: maxLoopSeverity,
            practiceLevels: lvlMap,
            anchorPath: anchor,
            growthPath: growth,
            weakestCorePractice,
          });
          orchestratorDirective = `\n\n${directive.promptDirective}`;
          orchestratorMeta = {
            phase: directive.phase,
            phaseLabel: directive.phaseLabel,
            action: directive.action,
            reason: directive.reason,
            lengthDays: directive.lengthDays,
            maxCombinations: directive.maxCombinations,
            spiralDepth: directive.spiralDepth,
            cycleBackTitle: directive.cycleBackTheme?.title || null,
          };
          console.log("generate-theme: orchestrator decided", orchestratorMeta);
        } catch (orchErr: any) {
          console.error("generate-theme: orchestrator failed (non-blocking):", orchErr?.message);
        }

        // ═══ ARC DIRECTIVE (multi-day journey continuity) ═══
        let arcDirectiveBlock = "";
        let arcDirectiveMeta: any = null;
        try {
          const activeArc = (profileRes as any)._activeArc as ArcRow | null;
          if (activeArc) {
            const arcTpl = (profileRes as any)._arcTemplate as ArcTemplateRow | null;
            const arcChaps = ((profileRes as any)._arcChapters || []) as ArcChapterRow[];
            const lastReflectionLocal = (reflectionsRes.data || [])[0] as any;
            const dnaPaths: string[] = [];
            if (dna) {
              if ((dna.path_bhakti ?? 0) >= 6) dnaPaths.push("bhakti");
              if ((dna.path_jnana ?? 0) >= 6) dnaPaths.push("jnana");
              if ((dna.path_karma ?? 0) >= 6) dnaPaths.push("karma");
              if ((dna.path_raja ?? 0) >= 6) dnaPaths.push("raja");
            }
            const arcDir = buildArcDirective({
              arc: activeArc,
              template: arcTpl,
              recentChapters: arcChaps,
              yesterdayMood: lastReflectionLocal?.mood ?? null,
              yesterdayEnergy: lastReflectionLocal?.energy ?? null,
              regressionDetected: (profileData?.bypassing_risk ?? 0) > 0.6,
              breakthroughDetected: false,
              todayISO: today,
              spiritualDnaPaths: dnaPaths,
            });
            arcDirectiveBlock = `\n\n${arcDir.promptDirective}`;
            arcDirectiveMeta = arcDir.metadata;
            (globalThis as any).__activeArc = activeArc;
            (globalThis as any).__arcDirective = arcDir;
            console.log("generate-theme: arc directive built", { arc: activeArc.title, day: activeArc.current_day, total: activeArc.duration_days });
          }
        } catch (arcErr: any) {
          console.error("generate-theme: arc directive failed (non-blocking):", arcErr?.message);
        }

        userPrompt = `Generate this session's personalized theme — SESSION ${journeyDay} of the journey.\n\n${userContext}${identityContext}${practiceLevelContext}${v4PracticeBlock}${v4ChakraBlock}${v4TShapeBlock}${yesterdayContext}${themeArc}${calibrationContext}${orchestratorDirective}${arcDirectiveBlock}\n\n═══ GLOBAL LANGUAGE RULE (HARD CONSTRAINT) ═══\nThis app is SESSION-BASED, not day-based. In EVERY field you generate, NEVER use the words "yesterday", "today", "tomorrow", "this morning", "tonight", "this evening" or any clock/day framing. Always speak in sessions: "last session", "this session", "next session", "between sessions".\n\n═══ V4 OUTPUT REQUIREMENTS ═══\nYou MUST also produce these transformational fields (do NOT skip):\n• felt_sense_opener: a 10-second SOMATIC cue the user does BEFORE reading the theme (e.g. "Hand on chest. Three breaths. Now read."). Tied to the chakra above.\n• forbidden_thing: ONE specific behavior the user is asked NOT to do in this session (a fast from a pattern). Tied to the active loop.\n• evening_close: a single closing question for the session-close reflection that closes THIS SESSION's specific theme loop (not generic).\n• tradition_lens: pick one short citation (e.g. Yoga Sutra, Gita verse, Upanishad line). Provide { sanskrit, translation, why_today } — why_today references their actual data (do not literally say "today").\n• chakra_focus: { sanskrit, english, opening_practice } — use the chakra detected above.\n• spiral_marker: if spiral_depth > 0, write "This is your Nth time meeting this teaching — last time you saw X, this time can you see Y?". If 0, leave empty string.\n• yesterday_bridge: ONE sentence that explicitly references the LAST SESSION's theme/loop and bridges to THIS SESSION. NEVER use "yesterday/today" — phrase it as "Last session you … — this session we …". If no prior session data, write "" empty.`;
        // expose meta for response
        (globalThis as any).__themeOrchestratorMeta = orchestratorMeta;
        (globalThis as any).__arcDirectiveMeta = arcDirectiveMeta;
        (globalThis as any).__v4Meta = v4Meta;
      }

      // ═══ RE-ENTRY CONTINUITY (gap >= 2 days) ═══
      if (gapDays >= 2) {
        const continuityBlock = `

═══ RE-ENTRY CONTEXT (CRITICAL) ═══
The user has been away for ${gapDays} day(s). Their last theme was: "${previousTitle ?? "—"}"${previousFocus.length ? ` (focus: ${previousFocus.join(", ")})` : ""}.
- DO NOT pretend they were practicing daily. Acknowledge the gap gently, without guilt or judgment.
- ${gapDays <= 3 ? "Seed continuity from the previous focus — extend the thread, don't restart." : "Treat this as a soft re-entry. Keep it light, embodied, and present-moment. No abstract depth."}
- Open with a tone of welcome / return, not a new chapter announcement.
- The affirmation should feel like coming home, not pushing forward.`;
        systemPrompt = systemPrompt + continuityBlock;
      }

      const aiResp = await aiGatewayFetchWithLang(req, {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_theme",
                description: "Create a personalized daily consciousness theme with Category → Theme → Prompt → Practice structure",
                parameters: {
                  type: "object",
                  properties: {
                    category: { type: "string", description: "One category from the allowed category list" },
                    title: { type: "string", description: "Short, evocative theme title (3-6 words)" },
                    description: { type: "string", description: "2-3 sentence inspiring description personalized to current edge" },
                    focus_areas: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 focus areas targeting weakest dimension and patterns",
                    },
                    affirmation: { type: "string", description: "Powerful affirmation matching band vocabulary" },
                    micro_prompt: { type: "string", description: "One short in-the-moment prompt for awareness" },
                    micro_practice: { type: "string", description: "One concrete micro-practice for today" },
                    theme_rationale: { type: "string", description: "2-3 sentences on why this theme fits today" },
                    daily_intentions: {
                      type: "array",
                      items: { type: "string" },
                      description: "3 specific intentions for today",
                    },
                    learning_focus: { type: "string", description: "One key insight in 1-2 sentences" },
                    action_items: {
                      type: "array",
                      items: { type: "string" },
                      description: "2-3 concrete micro-actions for today",
                    },
                    real_life_trigger: { type: "string", description: "When this loop will likely show up today (a specific real-life situation in 1-2 sentences)" },
                    inner_inquiry: { type: "string", description: "ONE deep self-inquiry question the user can sit with today" },
                    resistance_warning: { type: "string", description: "How the user's mind will try to escape, dismiss, or postpone this practice today" },
                    integration: { type: "string", description: "How today's awareness should change one concrete behavior (1-2 sentences)" },
                    engagement_question: { type: "string", description: "A reflective question to ask the user at the end of the day" },
                    yoga_blend: {
                      type: "array",
                      items: { type: "string", enum: ["jnana", "raja", "bhakti", "karma"] },
                      description: "2-4 yoga paths blended internally for this theme (do NOT mention these names in user-facing text)",
                    },
                    loop_target: {
                      type: "string",
                      enum: ["overthinking", "emotional_reactivity", "procrastination", "ego_identity", "repetitive_pattern", "none"],
                      description: "The dominant loop archetype this theme is designed to interrupt",
                    },
                    felt_sense_opener: { type: "string", description: "10-second SOMATIC cue done BEFORE reading the theme. Tied to chakra. e.g. 'Hand on chest. Three breaths. Now read.'" },
                    forbidden_thing: { type: "string", description: "ONE specific behavior the user is asked NOT to do today (fasting from a pattern). Tied to active loop." },
                    evening_close: { type: "string", description: "Single closing question for evening reflection that closes today's SPECIFIC theme loop." },
                    tradition_lens: {
                      type: "object",
                      properties: {
                        sanskrit: { type: "string", description: "Short Sanskrit citation (Sutra/Gita/Upanishad)" },
                        translation: { type: "string", description: "English translation" },
                        why_today: { type: "string", description: "Why this lens for THIS user TODAY — reference their actual data" },
                      },
                      required: ["sanskrit", "translation", "why_today"],
                      additionalProperties: false,
                    },
                    chakra_focus: {
                      type: "object",
                      properties: {
                        sanskrit: { type: "string" },
                        english: { type: "string" },
                        opening_practice: { type: "string" },
                      },
                      required: ["sanskrit", "english", "opening_practice"],
                      additionalProperties: false,
                    },
                    spiral_marker: { type: "string", description: "If spiral_depth > 0, marker text. Otherwise empty string." },
                    yesterday_bridge: { type: "string", description: "One sentence bridging yesterday's theme to today. Empty if no yesterday data." },
                    max_depth: { type: "integer", minimum: 3, maximum: 7, description: "How many micro-shifts (depth steps) this theme can sustain before it should naturally close. Pick 3 for simple/concrete themes, 5 for standard, 7 for deep/archetypal/shadow themes." },
                  },
                  required: ["category", "title", "description", "focus_areas", "affirmation", "micro_prompt", "micro_practice", "theme_rationale", "daily_intentions", "learning_focus", "action_items", "real_life_trigger", "inner_inquiry", "resistance_warning", "integration", "engagement_question", "yoga_blend", "loop_target", "felt_sense_opener", "forbidden_thing", "evening_close", "tradition_lens", "chakra_focus", "spiral_marker", "yesterday_bridge", "max_depth"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "create_theme" } },
        });

      console.log("generate-theme: AI response received, status:", aiResp.status);

      // ─── Credit Deduction & Usage Logging ───
      let themePayload: any = null;
      if (aiResp.ok) {
        let aiData: any = null;
        try {
          aiData = await aiResp.json();
        } catch (parseErr: any) {
          console.error("generate-theme: failed to parse AI JSON:", parseErr?.message);
        }

        // Calculate and charge credits
        const usage = aiData?.usage || {};
        const inputTokens = usage.prompt_tokens || 500;
        const outputTokens = usage.completion_tokens || 300;
        const totalTokens = inputTokens + outputTokens;
        const __billingModel = "tier:main";
        const __charge = computeChargedPaise(__billingModel, inputTokens, outputTokens);

        const chargedPaise = __charge.chargedPaise;

        const inputCost = __charge.estimatedCostPaise; // legacy alias

        const outputCost = 0; // folded into estimatedCostPaise

        await admin.rpc("check_and_deduct_credits", { p_user_id: user.id, p_amount: chargedPaise, p_description: `Daily theme generation (${totalTokens} tokens)` });
        await admin.from("ai_usage_log").insert({
          user_id: user.id, function_name: "generate-theme", model: "llama-3.1-8b-instant",
          input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: totalTokens,
          estimated_cost_paise: inputCost + outputCost, charged_paise: chargedPaise, status: "success",
        });

        try {
          const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall?.function?.arguments) {
            themePayload = JSON.parse(toolCall.function.arguments);
          } else {
            const content = aiData?.choices?.[0]?.message?.content || "";
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) themePayload = JSON.parse(jsonMatch[0]);
          }
        } catch (toolErr: any) {
          console.error("generate-theme: tool_call parse error:", toolErr?.message);
        }
      } else {
        console.error("AI theme error:", await aiResp.text());
      }

      const fallbackPayload = {
        category: selectedCategory.label,
        title: fallbackSeed.title,
        description: fallbackSeed.description,
        focus_areas: fallbackSeed.focusAreas,
        affirmation: fallbackSeed.affirmation,
        micro_prompt: fallbackSeed.microPrompt,
        micro_practice: fallbackSeed.microPractice,
        theme_rationale: "This theme is selected from your structured category map to match your current edge and avoid repetition.",
        daily_intentions: [
          fallbackSeed.microPrompt,
          `Stay with ${selectedCategory.label.toLowerCase()} in one real moment today.`,
          "Choose awareness before reaction once today.",
        ],
        learning_focus: `Your current growth edge is ${selectedCategory.label}. Small repeated awareness creates stable change.`,
        action_items: [fallbackSeed.microPractice, "Pause for 10 seconds before one important response.", "Journal one pattern you noticed today."],
        real_life_trigger: `Today, this will likely show up in a moment of ${selectedCategory.label.toLowerCase()} — a small situation where the old pattern wants to run on autopilot.`,
        inner_inquiry: "Who is the one noticing this right now?",
        resistance_warning: "Your mind will try to tell you this is too small to matter, or that you'll do it later. Don't believe that voice immediately.",
        integration: "Catch one moment today where awareness changes a single response — that is the whole practice.",
        engagement_question: "Where did you notice your old pattern pulling you today?",
        yoga_blend: ["raja", "jnana"],
        loop_target: "none",
        felt_sense_opener: "Place a hand on your chest. Take three slow breaths. Then read.",
        forbidden_thing: "Do not explain yourself today. When the urge comes, just notice it.",
        evening_close: "Where today did you catch the old pattern before it ran the show?",
        tradition_lens: {
          sanskrit: "योगश्चित्तवृत्तिनिरोधः",
          translation: "Yoga is the cessation of mental modifications.",
          why_today: "Your mind has been spinning the same loop — today we soften the spin, not the thinker.",
        },
        chakra_focus: ((): any => {
          const c = (globalThis as any).__v4Meta?.chakra;
          return c
            ? { sanskrit: c.sanskrit, english: c.english, opening_practice: c.openingPractice }
            : { sanskrit: "Anahata", english: "Heart", opening_practice: "Hand on heart. Three breaths. Send one wish of well-being to yourself." };
        })(),
        spiral_marker: "",
        yesterday_bridge: "",
      } as any;

      let finalPayload = themePayload && themePayload.title ? { ...fallbackPayload, ...themePayload } : fallbackPayload;

      const finalCandidateForRepeatCheck = {
        title: finalPayload.title,
        affirmation: finalPayload.affirmation,
      };

      if (isRepeatedTheme(finalCandidateForRepeatCheck, recentBeforeToday)) {
        const rotatedSeed = buildStructuredFallbackTheme({
          userId: user.id,
          date: `${today}-rotate`,
          profile: profileData,
          loops: loopsData,
          recentThemes: recentBeforeToday,
        });
        finalPayload = {
          ...finalPayload,
          category: STRUCTURED_THEME_CATEGORIES.find((c) => c.id === rotatedSeed.categoryId)?.label || selectedCategory.label,
          title: rotatedSeed.title,
          description: rotatedSeed.description,
          affirmation: rotatedSeed.affirmation,
          micro_prompt: rotatedSeed.microPrompt,
          micro_practice: rotatedSeed.microPractice,
          focus_areas: rotatedSeed.focusAreas,
        };
      }

      const finalFocusAreas = Array.from(new Set([
        finalPayload.category,
        ...(Array.isArray(finalPayload.focus_areas) ? finalPayload.focus_areas : []),
      ].filter(Boolean))).slice(0, 5);

      const { data: newTheme, error: insertErr } = await admin
        .from("daily_themes")
        .insert({
          theme_date: today,
          user_id: user.id,
          title: finalPayload.title,
          description: finalPayload.description || "A day of conscious awareness.",
          focus_areas: finalFocusAreas.length > 0 ? finalFocusAreas : ["Awareness", "Presence"],
          affirmation: finalPayload.affirmation || "I am present.",
          sequence_no: targetSequenceNo,
          max_depth: Math.min(7, Math.max(3, Number(finalPayload.max_depth) || 5)),
        })
        .select()
        .single();

      if (insertErr) {
        console.error("generate-theme: theme insert error:", insertErr.message);
      }

      if (newTheme) {
        theme = {
          ...newTheme,
          category: finalPayload.category,
          micro_prompt: finalPayload.micro_prompt,
          micro_practice: finalPayload.micro_practice,
          theme_rationale: finalPayload.theme_rationale || "",
          daily_intentions: Array.isArray(finalPayload.daily_intentions) ? finalPayload.daily_intentions : [],
          learning_focus: finalPayload.learning_focus || "",
          action_items: Array.isArray(finalPayload.action_items) ? finalPayload.action_items : [],
          // ── v4 transformational fields ──
          felt_sense_opener: finalPayload.felt_sense_opener || "",
          forbidden_thing: finalPayload.forbidden_thing || "",
          evening_close: finalPayload.evening_close || "",
          tradition_lens: finalPayload.tradition_lens || null,
          chakra_focus: finalPayload.chakra_focus || null,
          spiral_marker: finalPayload.spiral_marker || "",
          yesterday_bridge: finalPayload.yesterday_bridge || "",
          inner_inquiry: finalPayload.inner_inquiry || "",
          real_life_trigger: finalPayload.real_life_trigger || "",
          resistance_warning: finalPayload.resistance_warning || "",
          integration: finalPayload.integration || "",
          engagement_question: finalPayload.engagement_question || "",
          v4: (globalThis as any).__v4Meta || null,
          arc: (globalThis as any).__arcDirectiveMeta || null,
        };

        // ═══ ARC CHAPTER PERSISTENCE + DAY ADVANCE + HARVEST/ECHOES ═══
        try {
          const activeArc = (globalThis as any).__activeArc as ArcRow | null;
          const arcDir = (globalThis as any).__arcDirective as any;
          if (activeArc && arcDir) {
            const marker = arcDir.isHarvestDay
              ? "harvest"
              : arcDir.isRestChapter
              ? "rest"
              : arcDir.shouldFastForward
              ? "breakthrough"
              : "normal";

            // Upsert today's chapter
            await admin.from("arc_chapters").upsert({
              arc_id: activeArc.id,
              user_id: user.id,
              day_number: activeArc.current_day,
              chapter_date: today,
              theme_id: newTheme.id,
              phase: arcDir.phaseSlug,
              marker,
              chapter_title: finalPayload.title,
              chapter_summary: (finalPayload.description || "").slice(0, 500),
              metadata: arcDir.metadata || {},
            }, { onConflict: "arc_id,day_number" });

            if (arcDir.isHarvestDay) {
              // Mark arc complete + schedule echoes
              await admin.from("theme_arcs").update({
                status: "completed",
                completed_at: new Date().toISOString(),
                current_phase: "harvested",
              }).eq("id", activeArc.id);

              try {
                const { nextEchoDates } = await import("../_shared/arcEngine.ts");
                const echoes = nextEchoDates(new Date().toISOString());
                const echoRows = echoes.map((e) => ({
                  arc_id: activeArc.id,
                  user_id: user.id,
                  echo_type: e.type,
                  scheduled_for: e.date,
                  message_seed: `Remember "${activeArc.title}"? You walked through it ${e.type === "30d" ? "30 days" : e.type === "90d" ? "3 months" : "a year"} ago.`,
                  metadata: { arc_title: activeArc.title, completed_on: today },
                }));
                if (echoRows.length > 0) {
                  await admin.from("arc_echoes").insert(echoRows);
                }
              } catch (echoErr: any) {
                console.error("generate-theme: echo scheduling failed:", echoErr?.message);
              }
            } else {
              // Advance day counter (skip advance on rest chapter — they get an extra day)
              const advance = arcDir.isRestChapter ? 0 : 1;
              if (advance > 0) {
                await admin.from("theme_arcs").update({
                  current_day: activeArc.current_day + 1,
                  current_phase: arcDir.phaseSlug,
                }).eq("id", activeArc.id);
              }
            }
            console.log("generate-theme: arc chapter persisted", { arc: activeArc.title, day: activeArc.current_day, marker });
          }
        } catch (chapErr: any) {
          console.error("generate-theme: arc chapter persistence failed (non-blocking):", chapErr?.message);
        }
      }
    }

    if (!theme) {
      const seed = buildStructuredFallbackTheme({
        userId: user.id,
        date: `${today}-hard-fallback`,
        profile: null,
        loops: [],
        recentThemes: recentBeforeToday,
      });
      const { data: fallback } = await admin
        .from("daily_themes")
        .insert({
          theme_date: today,
          user_id: user.id,
          title: seed.title,
          description: seed.description,
          focus_areas: seed.focusAreas,
          affirmation: seed.affirmation,
          sequence_no: targetSequenceNo,
          max_depth: 5,
        })
        .select()
        .single();
      theme = fallback
        ? {
            ...fallback,
            category: seed.categoryId,
            micro_prompt: seed.microPrompt,
            micro_practice: seed.microPractice,
          }
        : null;
    }

    if (!theme) {
      return new Response(JSON.stringify({ error: "Failed to create theme" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══════════════════════════════════════════
    // GENERATE TASKS (best-effort, don't block response)
    // ═══════════════════════════════════════════

    // ─── Determine effective topic (theme vs user's custom choice) ───
    let effectiveTopic = theme.title;
    let userChosenTopic: string | null = null;
    try {
      const { data: morningSession } = await admin
        .from("sessions")
        .select("user_chosen_topic")
        .eq("user_id", user.id)
        .eq("session_date", today)
        .eq("time_slot", "morning")
        .not("user_chosen_topic", "is", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (morningSession?.user_chosen_topic) {
        userChosenTopic = morningSession.user_chosen_topic;
        effectiveTopic = userChosenTopic;
        console.log("generate-theme: user chose custom topic:", effectiveTopic);
      }
    } catch (topicErr: any) {
      console.error("generate-theme: topic fetch failed:", topicErr?.message);
    }

    let dailyTasks: any[] = [];
    let obsTasks: any[] = [];

    try {
      // Check existing tasks
      const { data: existingTasks } = await admin
        .from("daily_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("task_date", today)
        .order("time_slot");

      if (existingTasks && existingTasks.length > 0) {
        dailyTasks = existingTasks;

        const morningTask = existingTasks.find((t: any) => t.time_slot === "morning");
        const expectedMorningTitle = `Morning: ${effectiveTopic}`;
        if (morningTask && morningTask.title !== expectedMorningTitle) {
          const { data: updatedMorning } = await admin
            .from("daily_tasks")
            .update({
              title: expectedMorningTitle,
              description: userChosenTopic
                ? `Focus on your chosen topic: ${userChosenTopic}`
                : `Set your intention around today's theme: ${theme.description?.slice(0, 80)}`,
            })
            .eq("id", morningTask.id)
            .select()
            .single();

          if (updatedMorning) {
            dailyTasks = existingTasks.map((t: any) => (t.id === morningTask.id ? updatedMorning : t));
          }
        }
      } else {
        // Generate tasks from template
        console.log("generate-theme: generating daily tasks from template...", isFoundationMode ? "(foundation)" : "(adaptive)");
        
        let templateTasks: Array<{ time_slot: string; title: string; description: string; domain: string }>;
        
        if (isFoundationMode && foundationCurriculum) {
          // Foundation mode: tasks are curriculum-driven
          const fc = foundationCurriculum;
          templateTasks = [
            { time_slot: "morning", title: `Day ${fc.day}: ${fc.title}`, description: `Today's teaching: ${fc.morningTeaching?.concept}. ${(fc.morningTeaching?.keyPoints || []).slice(0, 2).join('. ')}.`, domain: fc.dimension || "awareness" },
            { time_slot: "midday", title: `Practice: ${fc.dayPractice?.type || 'observation'}`, description: fc.dayPractice?.instruction || `Practice "${fc.title}" in your daily life.`, domain: fc.dimension || "awareness" },
            { time_slot: "evening", title: "Evening Integration", description: fc.eveningIntegration?.prompt || `Reflect on today's lesson: "${fc.title}".`, domain: "reflection" },
            { time_slot: "night", title: "Closing Wisdom", description: fc.eveningIntegration?.closingWisdom || "Let today's learning settle as you rest.", domain: "gratitude" },
          ];
        } else if (isGuruProgramMode && guruProgramCurriculum) {
          // Guru program mode: master-driven daily tasks
          const gp = guruProgramCurriculum;
          templateTasks = [
            { time_slot: "morning", title: `${gp.guruName}: Day ${gp.day}`, description: `Morning wisdom from ${gp.guruName}. Today's focus: ${theme.title || gp.programFocus}.`, domain: gp.programFocus || "awareness" },
            { time_slot: "midday", title: `${gp.guruName}'s Practice`, description: `Practice the master's teaching in your daily life. ${gp.dailyOverview || ''}`, domain: gp.programFocus || "awareness" },
            { time_slot: "evening", title: `Evening with ${gp.guruName}`, description: `Reflect on today's teaching. What did ${gp.guruName}'s wisdom reveal to you?`, domain: "reflection" },
            { time_slot: "night", title: "Master's Closing", description: `Let ${gp.guruName}'s teaching settle as you rest. ${gp.guruQuote || ''}`, domain: "gratitude" },
          ];
        } else {
          // Adaptive mode: original template
          const topicDescription = userChosenTopic
            ? `Focus on your chosen topic: ${userChosenTopic}`
            : `Set your intention around today's theme: ${theme.description?.slice(0, 80)}`;
          templateTasks = [
            { time_slot: "morning", title: `Morning: ${effectiveTopic}`, description: topicDescription, domain: "awareness" },
            { time_slot: "midday", title: "Midday Presence Check", description: `Pause for 2 minutes. Notice your breath, body, and how "${effectiveTopic}" is showing up in your day.`, domain: "presence" },
            { time_slot: "evening", title: "Evening Reflection", description: `Review your day through the lens of "${effectiveTopic}". What did you notice? What surprised you?`, domain: "reflection" },
            { time_slot: "night", title: "Night Gratitude", description: "Name 3 things from today you're grateful for. Let them settle into your body as you prepare for sleep.", domain: "gratitude" },
          ];
        }

        const rows = templateTasks.map((t) => ({ user_id: user.id, task_date: today, ...t }));
        const { data: insertedTasks } = await admin.from("daily_tasks").insert(rows).select();
        dailyTasks = insertedTasks || [];
        console.log("generate-theme: daily tasks done, count:", dailyTasks.length);
      }
    } catch (taskErr: any) {
      console.error("generate-theme: task generation failed (non-blocking):", taskErr?.message);
    }

    // Check/create observation task (day-scoped)
    try {
      const { data: existingObs } = await admin
        .from("observation_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("task_date", today)
        .order("chain_order");

      if (existingObs && existingObs.length > 0) {
        obsTasks = existingObs;
      } else {
        // Create observation task
        let obsTitle: string;
        let obsDescription: string;
        
        if (isFoundationMode && foundationCurriculum) {
          const fc = foundationCurriculum;
          obsTitle = fc.dayPractice?.instruction ? `Day ${fc.day}: ${fc.dayPractice.type || 'Observe'}` : "Notice Your First Reaction";
          obsDescription = fc.dayPractice?.instruction || "Today, catch the very first reaction you have to any event — before the story begins. Just notice it.";
        } else if (isGuruProgramMode && guruProgramCurriculum) {
          const gp = guruProgramCurriculum;
          obsTitle = `${gp.guruName}: Day ${gp.day} Observation`;
          obsDescription = `Observe through ${gp.guruName}'s lens today. Focus on ${gp.programFocus}. Notice how the master's teaching shows up in your real life.`;
        } else {
          obsTitle = userChosenTopic ? `Observe: ${userChosenTopic}` : "Notice Your First Reaction";
          obsDescription = userChosenTopic
            ? `Today, pay close attention to how "${userChosenTopic}" shows up in your real life. Notice the first moment it appears — the sensation, the thought, the emotion.`
            : "Today, catch the very first reaction you have to any event — before the story begins. Just notice it.";
        }

        const { data: newObs } = await admin
          .from("observation_tasks")
          .insert({
            user_id: user.id,
            chain_order: 0,
            status: "active",
            title: obsTitle,
            description: obsDescription,
            domain: foundationCurriculum?.dimension || "awareness",
            task_date: today,
            theme_id: theme.id,
            user_topic: userChosenTopic,
          })
          .select();
        obsTasks = newObs || [];
      }
    } catch (obsErr: any) {
      console.error("generate-theme: obs task failed:", obsErr?.message);
    }

    // Fetch sessions for today
    const { data: todaySessions } = await admin
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("session_date", today)
      .order("started_at");

    console.log("generate-theme: complete, returning response");
    return new Response(
      JSON.stringify({
        theme,
        dailyTasks,
        observationTasks: obsTasks,
        sessions: todaySessions || [],
        themeOrchestrator: (globalThis as any).__themeOrchestratorMeta || null,
        gap_days: gapDays,
        recalibration_note: recalibrationNote,
        previous_focus: previousFocus,
        previous_title: previousTitle,
        ...(isFoundationMode && foundationCurriculum ? { foundationCurriculum } : {}),
        ...(isGuruProgramMode && guruProgramCurriculum ? { guruProgramCurriculum } : {}),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("generate-theme error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
