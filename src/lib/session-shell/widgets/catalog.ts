import {
  FAMILY_META,
  type StepWidgetDefinition,
  type WidgetConfig,
  type WidgetEngine,
  type WidgetFamily,
} from "./types";

type Intensity = 1 | 2 | 3 | 4 | 5;

interface Row {
  id: string;
  label: string;
  family: WidgetFamily;
  engine: WidgetEngine;
  seconds: number;
  intensity: Intensity;
  description: string;
  config?: WidgetConfig;
  tags?: string[];
  note?: string;
}

const rows: Row[] = [
  // ── Stillness ────────────────────────────────────────────────────────────
  { id: "open_awareness", label: "Open Awareness", family: "stillness", engine: "observation", seconds: 300, intensity: 2, description: "Rest as the space in which thoughts come and go.", config: { focus: "open", allowLogging: true, showTimer: true, showCounter: true } },
  { id: "thought_watch", label: "Thought Watching", family: "stillness", engine: "observation", seconds: 180, intensity: 2, description: "Notice each thought without following it.", config: { focus: "thoughts", allowLogging: true, categories: ["planning", "memory", "worry", "judgement", "fantasy"] } },
  { id: "ten_minute_sit", label: "Ten-Minute Sit", family: "stillness", engine: "timer", seconds: 600, intensity: 2, description: "One bell, one posture, no agenda.", config: { showOrb: true, gentleBell: true, showPhase: false } },
  { id: "gap_noticing", label: "Gap Noticing", family: "stillness", engine: "observation", seconds: 240, intensity: 3, description: "Catch the silent gap between two thoughts.", config: { focus: "open", showCounter: false } },
  { id: "just_sitting", label: "Just Sitting", family: "stillness", engine: "timer", seconds: 300, intensity: 1, description: "Shikantaza: sit and ask nothing of the sit.", config: { showOrb: true, gentleBell: true } },
  { id: "inner_silence", label: "Inner Silence", family: "stillness", engine: "timer", seconds: 420, intensity: 3, description: "Follow the silence underneath the sound.", config: { showOrb: true, gentleBell: true, intervalSeconds: 120 } },
  { id: "witness_count", label: "Witness Count", family: "stillness", engine: "observation", seconds: 300, intensity: 2, description: "Count each noticed thought, then let it go.", config: { focus: "thoughts", allowLogging: true, showCounter: true } },
  { id: "do_nothing", label: "Do Nothing", family: "stillness", engine: "timer", seconds: 180, intensity: 1, description: "For three minutes, nothing needs doing.", config: { showOrb: false, gentleBell: true } },

  // ── Breath ───────────────────────────────────────────────────────────────
  { id: "coherent_breath", label: "Coherent Breath", family: "breath", engine: "breath", seconds: 300, intensity: 1, description: "Five in, five out, until the heart rate follows.", config: { pattern: "coherent", showPhaseText: true, showOrb: true } },
  { id: "box_breath", label: "Box Breath", family: "breath", engine: "breath", seconds: 240, intensity: 2, description: "Four counts in, hold, out, hold.", config: { pattern: "box", showPhaseText: true } },
  { id: "breath_478", label: "4-7-8 Breath", family: "breath", engine: "breath", seconds: 240, intensity: 2, description: "The down-regulating breath for a loud mind.", config: { pattern: "4-7-8", showPhaseText: true } },
  { id: "sigh_release", label: "Physiological Sigh", family: "breath", engine: "breath_hold", seconds: 120, intensity: 1, description: "Two inhales, one long exhale, five times.", config: { rounds: 5, inhaleSeconds: 3, holdSeconds: 1, exhaleSeconds: 8, restSeconds: 2 } },
  { id: "breath_counting", label: "Breath Counting", family: "breath", engine: "guided", seconds: 300, intensity: 2, description: "Count ten breaths, then begin again at one.", config: { phases: [ { label: "Count 1–10", seconds: 150, cue: "Inhale: one. Exhale: two. Lose count, start at one." }, { label: "Let the count drop", seconds: 150, cue: "Stop counting and follow only the sensation." } ] } },
  { id: "extended_exhale", label: "Extended Exhale", family: "breath", engine: "breath", seconds: 240, intensity: 1, description: "Inhale four, exhale eight — the brake pedal.", config: { pattern: "natural", inhaleSeconds: 4, holdSeconds: 0, exhaleSeconds: 8 } },
  { id: "breath_pause", label: "Breath Pause", family: "breath", engine: "breath_hold", seconds: 180, intensity: 3, description: "Short holds after the exhale, with full rest.", config: { rounds: 6, inhaleSeconds: 4, holdSeconds: 0, exhaleSeconds: 4, restSeconds: 4 } },
  { id: "bellows_breath", label: "Bellows Breath", family: "breath", engine: "breath_hold", seconds: 180, intensity: 4, description: "Active pumping breaths followed by stillness.", config: { rounds: 3, inhaleSeconds: 1, holdSeconds: 0, exhaleSeconds: 1, restSeconds: 20 }, note: "Skip if pregnant, or if you feel dizzy or lightheaded." },
  { id: "ocean_breath", label: "Ocean Breath", family: "breath", engine: "guided", seconds: 300, intensity: 2, description: "Ujjayi: a soft sound at the back of the throat.", config: { phases: [ { label: "Find the sound", seconds: 120, cue: "Whisper the breath against the back of the throat." }, { label: "Ride the wave", seconds: 180, cue: "Keep the sound steady as the breath lengthens." } ] } },

  // ── Body ─────────────────────────────────────────────────────────────────
  { id: "body_scan_full", label: "Full Body Scan", family: "body", engine: "body_map", seconds: 480, intensity: 2, description: "Travel from crown to soles, one region at a time.", config: { showLabels: true, interactive: true } },
  { id: "tension_release", label: "Tension Release", family: "body", engine: "guided", seconds: 300, intensity: 1, description: "Tense for five, release for ten, repeat.", config: { phases: [ { label: "Hands and jaw", seconds: 100, cue: "Clench for five seconds. Release for ten." }, { label: "Shoulders and belly", seconds: 100, cue: "Lift the shoulders. Drop them on the exhale." }, { label: "Legs and feet", seconds: 100, cue: "Press the feet down. Let the legs go heavy." } ] } },
  { id: "progressive_relaxation", label: "Progressive Relaxation", family: "body", engine: "guided", seconds: 600, intensity: 1, description: "The classic tense-and-release sequence.", config: { phases: [ { label: "Arms", seconds: 150 }, { label: "Face", seconds: 150 }, { label: "Torso", seconds: 150 }, { label: "Legs", seconds: 150 } ] } },
  { id: "hands_on_heart", label: "Hands on Heart", family: "body", engine: "guided", seconds: 120, intensity: 1, description: "Let the palms tell the body it is safe.", config: { phases: [ { label: "Place the hands", seconds: 60, cue: "One palm on the chest, one on the belly." }, { label: "Feel the warmth", seconds: 60, cue: "Let the warmth spread without doing anything." } ] } },
  { id: "grounding_54321", label: "5-4-3-2-1 Grounding", family: "body", engine: "checklist", seconds: 180, intensity: 1, description: "Five things seen, four heard, three touched.", config: { items: ["Name five things you can see", "Name four things you can hear", "Name three things you can touch", "Name two things you can smell", "Name one thing you can taste"], minSelections: 5 } },
  { id: "posture_scan", label: "Posture Scan", family: "body", engine: "body_map", seconds: 180, intensity: 1, description: "Find where the body is holding the day.", config: { interactive: true, showLabels: true } },
  { id: "jaw_shoulders", label: "Jaw & Shoulders", family: "body", engine: "guided", seconds: 120, intensity: 1, description: "The two places stress moves into first.", config: { phases: [ { label: "Unclench the jaw", seconds: 60, cue: "Let the tongue rest low. Part the teeth." }, { label: "Drop the shoulders", seconds: 60, cue: "Move them up on the inhale, down on the exhale." } ] } },
  { id: "feet_to_earth", label: "Feet to Earth", family: "body", engine: "timer", seconds: 180, intensity: 1, description: "Feel the floor hold your whole weight.", config: { showOrb: false, gentleBell: true } },
  { id: "body_gratitude", label: "Body Gratitude", family: "body", engine: "body_map", seconds: 240, intensity: 1, description: "Thank each region for carrying you.", config: { interactive: true } },

  // ── Heart ────────────────────────────────────────────────────────────────
  { id: "gratitude_three", label: "Three Good Things", family: "heart", engine: "writing", seconds: 240, intensity: 1, description: "Name three things that went right today.", config: { prompts: ["One small thing that went right", "One person who helped", "One thing about yourself"], minChars: 30 } },
  { id: "gratitude_letter", label: "Gratitude Letter", family: "heart", engine: "writing", seconds: 480, intensity: 2, description: "Write to someone who never heard your thanks.", config: { prompts: ["Dear…", "What they did", "What it changed in you"], minChars: 80 } },
  { id: "metta_self", label: "Loving Kindness: Self", family: "heart", engine: "guided", seconds: 420, intensity: 1, description: "Offer yourself the phrases you offer others.", config: { phases: [ { label: "Settle", seconds: 60, cue: "Feel the chest rise and fall." }, { label: "Offer phrases", seconds: 240, cue: "May I be safe. May I be well. May I be at ease." }, { label: "Rest", seconds: 120, cue: "Let the phrases dissolve. Just sit." } ] } },
  { id: "metta_circle", label: "Loving Kindness: Circle", family: "heart", engine: "guided", seconds: 600, intensity: 2, description: "Self, loved one, stranger, difficult person.", config: { phases: [ { label: "Yourself", seconds: 120 }, { label: "Someone you love", seconds: 120 }, { label: "A stranger", seconds: 120 }, { label: "Someone difficult", seconds: 120 }, { label: "All beings", seconds: 120 } ] } },
  { id: "forgiveness_self", label: "Forgiveness: Self", family: "heart", engine: "writing", seconds: 480, intensity: 3, description: "Say the thing you have not forgiven yourself for.", config: { prompts: ["What I did", "What I was trying to protect", "What I can offer myself now"], minChars: 60 }, note: "This can surface strong feeling. Stop and ground if it becomes too much." },
  { id: "forgiveness_other", label: "Forgiveness: Other", family: "heart", engine: "writing", seconds: 480, intensity: 3, description: "Release the debt without excusing the act.", config: { prompts: ["What happened", "What it cost me", "What I am ready to set down"], minChars: 60 }, note: "Forgiveness is not reconciliation. You can release without returning." },
  { id: "compassion_touch", label: "Compassion Touch", family: "heart", engine: "guided", seconds: 180, intensity: 1, description: "Hand on heart, hand on belly, three breaths.", config: { phases: [ { label: "Place the hands", seconds: 60 }, { label: "Warm the chest", seconds: 60 }, { label: "Soften the belly", seconds: 60 } ] } },
  { id: "appreciation_walk", label: "Appreciation Walk", family: "heart", engine: "timer", seconds: 600, intensity: 1, description: "Walk slowly and name what is beautiful.", config: { showOrb: false, gentleBell: false } },
  { id: "heart_breath", label: "Heart Breathing", family: "heart", engine: "breath", seconds: 300, intensity: 1, description: "Breathe as if through the center of the chest.", config: { pattern: "coherent", showPhaseText: true } },

  // ── Mind ─────────────────────────────────────────────────────────────────
  { id: "who_am_i", label: "Who Am I?", family: "mind", engine: "inquiry", seconds: 420, intensity: 3, description: "Ramana's question, held without an answer.", config: { question: "Who am I, really — beneath the name and the story?" } },
  { id: "neti_neti", label: "Neti Neti", family: "mind", engine: "inquiry", seconds: 360, intensity: 3, description: "Not this, not this — until only the seer remains.", config: { question: "If I am not the body, not the thoughts, not the feelings — what remains?" } },
  { id: "one_line_truth", label: "One-Line Truth", family: "mind", engine: "writing", seconds: 180, intensity: 2, description: "The sentence you have been avoiding, in one line.", config: { prompts: ["The truth I keep postponing is…"], minChars: 15 } },
  { id: "thought_labeling", label: "Thought Labeling", family: "mind", engine: "observation", seconds: 240, intensity: 2, description: "Label: planning, memory, judgement, worry.", config: { focus: "thoughts", allowLogging: true, categories: ["planning", "memory", "judgement", "worry"] } },
  { id: "belief_probe", label: "Belief Probe", family: "mind", engine: "inquiry", seconds: 480, intensity: 3, description: "Is it true? Can you absolutely know it is true?", config: { question: "What is the belief underneath this feeling — and is it actually true?" } },
  { id: "worry_window", label: "Worry Window", family: "mind", engine: "writing", seconds: 300, intensity: 2, description: "Give worry a time and a page, then close it.", config: { prompts: ["What I am afraid will happen", "What I can actually control", "When I will think about this next"], minChars: 40 } },
  { id: "clarity_question", label: "Clarity Question", family: "mind", engine: "inquiry", seconds: 240, intensity: 2, description: "What is actually being asked of me here?", config: { question: "If I stopped performing, what would I do next?" } },
  { id: "mental_noting", label: "Mental Noting", family: "mind", engine: "observation", seconds: 300, intensity: 2, description: "Note seeing, hearing, thinking, feeling.", config: { focus: "open", categories: ["seeing", "hearing", "thinking", "feeling"] } },
  { id: "assumption_check", label: "Assumption Check", family: "mind", engine: "checklist", seconds: 240, intensity: 2, description: "Separate what happened from what you assumed.", config: { items: ["I stated the facts without interpretation", "I named my assumption", "I asked instead of concluding", "I checked the evidence", "I left room to be wrong"], minSelections: 4 } },
  { id: "open_question", label: "Open Question", family: "mind", engine: "writing", seconds: 240, intensity: 1, description: "Ask one real question and follow the pen.", config: { prompts: ["The question I cannot stop asking is…", "If I answered honestly…"], minChars: 30 } },

  // ── Shadow ───────────────────────────────────────────────────────────────
  { id: "trigger_trace", label: "Trigger Trace", family: "shadow", engine: "writing", seconds: 420, intensity: 3, description: "Trace the reaction back to the wound.", config: { prompts: ["What happened", "What it reminded me of", "What I needed then", "What I need now"], minChars: 60 }, note: "Go slowly. You can stop at any point." },
  { id: "inner_critic", label: "Inner Critic", family: "shadow", engine: "inquiry", seconds: 360, intensity: 3, description: "Who is speaking when the voice says you are not enough?", config: { question: "Whose voice is this — and what were they afraid of?" } },
  { id: "projection_check", label: "Projection Check", family: "shadow", engine: "checklist", seconds: 240, intensity: 3, description: "What I judge in them may be what I refuse in me.", config: { items: ["I named the judgment", "I asked what it protects", "I found the same seed in myself", "I can hold it without acting"], minSelections: 3 } },
  { id: "fear_inventory", label: "Fear Inventory", family: "shadow", engine: "writing", seconds: 360, intensity: 3, description: "List the fears and what they are guarding.", config: { prompts: ["What I am afraid of", "What it protects", "What it costs me"], minChars: 50 } },
  { id: "younger_self", label: "Younger Self", family: "shadow", engine: "guided", seconds: 480, intensity: 3, description: "Meet the version of you who needed someone.", config: { phases: [ { label: "Arrive", seconds: 120 }, { label: "Meet them", seconds: 180 }, { label: "Say what was missing", seconds: 120 }, { label: "Return", seconds: 60 } ] }, note: "This can be tender. Have water and a quiet room." },
  { id: "shadow_dialogue", label: "Shadow Dialogue", family: "shadow", engine: "writing", seconds: 420, intensity: 3, description: "Write both sides of the conversation.", config: { prompts: ["What the shadow says", "What I say back", "What we can agree on"], minChars: 60 } },
  { id: "shame_metabolize", label: "Shame Metabolize", family: "shadow", engine: "guided", seconds: 300, intensity: 3, description: "Name it, feel it in the body, let it move.", config: { phases: [ { label: "Name it", seconds: 60 }, { label: "Locate it", seconds: 120 }, { label: "Breathe around it", seconds: 120 } ] } },
  { id: "anger_channel", label: "Anger Channel", family: "shadow", engine: "guided", seconds: 240, intensity: 3, description: "Let anger move without aiming it at anyone.", config: { phases: [ { label: "Feel the heat", seconds: 60 }, { label: "Press and release", seconds: 120 }, { label: "Settle", seconds: 60 } ] } },

  // ── Devotion ─────────────────────────────────────────────────────────────
  { id: "japa_108", label: "Japa 108", family: "devotion", engine: "jap", seconds: 600, intensity: 2, description: "One full mala, counted without hurry.", config: { targetCount: 108, mantra: "Om", showMala: true, showProgress: true } },
  { id: "japa_54", label: "Japa 54", family: "devotion", engine: "jap", seconds: 300, intensity: 1, description: "A half mala for a busy morning.", config: { targetCount: 54, mantra: "Om", showMala: true } },
  { id: "affirmation_loop", label: "Affirmation Loop", family: "devotion", engine: "jap", seconds: 180, intensity: 1, description: "Repeat one true sentence until the body believes it.", config: { targetCount: 21, mantra: "I am here, and that is enough.", showMala: false } },
  { id: "sankalpa", label: "Sankalpa", family: "devotion", engine: "intention", seconds: 180, intensity: 1, description: "Set one resolve for the day, in the present tense.", config: { prompt: "What is your sankalpa for today?", placeholder: "I am…", maxLength: 160 } },
  { id: "prayer_surrender", label: "Prayer of Surrender", family: "devotion", engine: "writing", seconds: 240, intensity: 2, description: "Hand over what you cannot carry.", config: { prompts: ["What I am carrying", "What I hand over", "What I ask for"], minChars: 40 } },
  { id: "lectio_divina", label: "Lectio Divina", family: "devotion", engine: "writing", seconds: 480, intensity: 2, description: "Read slowly, then answer the line that caught you.", config: { prompts: ["The line that caught me", "What it asks of me", "My response"], minChars: 40 } },
  { id: "nama_kirtan", label: "Nama Kirtan", family: "devotion", engine: "jap", seconds: 420, intensity: 2, description: "Call the name until the caller dissolves.", config: { targetCount: 108, mantra: "Ram", showMala: true } },
  { id: "deity_visualization", label: "Deity Visualization", family: "devotion", engine: "visualization", seconds: 480, intensity: 3, description: "Build the image slowly, then let it look back.", config: { background: "guru-bg", showTimer: true } },
  { id: "offering_fire", label: "Offering to Fire", family: "devotion", engine: "guided", seconds: 300, intensity: 2, description: "Offer each burden into the flame.", config: { phases: [ { label: "Light the fire", seconds: 60 }, { label: "Offer", seconds: 180 }, { label: "Watch it turn to ash", seconds: 60 } ] } },
  { id: "gratitude_prayer", label: "Gratitude Prayer", family: "devotion", engine: "writing", seconds: 180, intensity: 1, description: "Thank the day before it ends.", config: { prompts: ["Thank you for…", "Please help me with…"], minChars: 20 } },

  // ── Sound ────────────────────────────────────────────────────────────────
  { id: "sound_bath_10", label: "Ten-Minute Sound Bath", family: "sound", engine: "ambient", seconds: 600, intensity: 1, description: "A slow bowl drone to lie down inside.", config: { tone: "bowl", volume: 0.35 } },
  { id: "nada_yoga", label: "Nada Yoga", family: "sound", engine: "observation", seconds: 300, intensity: 2, description: "Follow the quietest sound in the room.", config: { focus: "sounds", allowLogging: false, showCounter: false } },
  { id: "binaural_focus", label: "Binaural Focus", family: "sound", engine: "ambient", seconds: 900, intensity: 1, description: "40 Hz difference tone for sustained attention.", config: { tone: "binaural", volume: 0.25, carrierHz: 200, beatHz: 10 } },
  { id: "singing_bowl", label: "Singing Bowl", family: "sound", engine: "ambient", seconds: 300, intensity: 1, description: "Listen to the bowl until the sound disappears.", config: { tone: "bowl", volume: 0.4 } },
  { id: "om_chant", label: "Om Chant", family: "sound", engine: "jap", seconds: 300, intensity: 2, description: "Chant and count; let the sound lead.", config: { targetCount: 27, mantra: "Om", showMala: false } },
  { id: "hum_breath", label: "Humming Breath", family: "sound", engine: "breath", seconds: 240, intensity: 1, description: "Hum on the exhale and feel the skull vibrate.", config: { pattern: "natural", exhaleSeconds: 8, showPhaseText: true } },
  { id: "sound_map", label: "Sound Map", family: "sound", engine: "observation", seconds: 240, intensity: 1, description: "Map far, near, and inside sounds.", config: { focus: "sounds", categories: ["far", "near", "inside"] } },
  { id: "silence_after_sound", label: "Silence After Sound", family: "sound", engine: "timer", seconds: 240, intensity: 1, description: "Let the last bell carry you into silence.", config: { showOrb: true, gentleBell: true } },

  // ── Movement ─────────────────────────────────────────────────────────────
  { id: "sun_salutation", label: "Sun Salutation", family: "movement", engine: "guided", seconds: 480, intensity: 3, description: "Five rounds, breath leading the body.", config: { phases: [ { label: "Round 1–2", seconds: 180, cue: "Move on the breath, not the count." }, { label: "Round 3–4", seconds: 180 }, { label: "Round 5", seconds: 120, cue: "Slow down and close." } ] } },
  { id: "gentle_stretch", label: "Gentle Stretch", family: "movement", engine: "guided", seconds: 300, intensity: 1, description: "Neck, shoulders, spine, hips — no strain.", config: { phases: [ { label: "Neck", seconds: 60 }, { label: "Shoulders", seconds: 60 }, { label: "Spine", seconds: 90 }, { label: "Hips", seconds: 90 } ] } },
  { id: "walking_meditation", label: "Walking Meditation", family: "movement", engine: "guided", seconds: 600, intensity: 1, description: "Walk slower than feels natural.", config: { phases: [ { label: "Feel the feet", seconds: 180 }, { label: "Slow the pace", seconds: 240 }, { label: "Stop and stand", seconds: 180 } ] } },
  { id: "tai_chi_flow", label: "Tai Chi Flow", family: "movement", engine: "guided", seconds: 420, intensity: 2, description: "Weight shifts and slow circles.", config: { phases: [ { label: "Stand and root", seconds: 60 }, { label: "Weight shifts", seconds: 180 }, { label: "Cloud hands", seconds: 180 } ] } },
  { id: "yoga_hips", label: "Hip Openers", family: "movement", engine: "guided", seconds: 420, intensity: 2, description: "Where the body stores the sitting.", config: { phases: [ { label: "Butterfly", seconds: 120 }, { label: "Low lunge", seconds: 120 }, { label: "Pigeon", seconds: 120 } ] } },
  { id: "dance_release", label: "Dance Release", family: "movement", engine: "timer", seconds: 300, intensity: 2, description: "Move however the body wants, eyes closed.", config: { showOrb: false, gentleBell: true } },
  { id: "shake_and_settle", label: "Shake & Settle", family: "movement", engine: "guided", seconds: 180, intensity: 2, description: "Shake for two minutes, then be still.", config: { phases: [ { label: "Shake", seconds: 120, cue: "Let everything loose — hands, jaw, legs." }, { label: "Settle", seconds: 60, cue: "Stand still and feel the vibration fade." } ] } },
  { id: "balance_tree", label: "Tree Balance", family: "movement", engine: "timer", seconds: 180, intensity: 1, description: "Stand on one leg and watch the wobble.", config: { showOrb: false, gentleBell: false } },
  { id: "neck_rolls", label: "Neck Rolls", family: "movement", engine: "guided", seconds: 120, intensity: 1, description: "Slow half-circles, no forcing.", config: { phases: [ { label: "Left side", seconds: 40 }, { label: "Right side", seconds: 40 }, { label: "Center", seconds: 40 } ] } },
  { id: "mindful_steps", label: "Ten Mindful Steps", family: "movement", engine: "guided", seconds: 180, intensity: 1, description: "Ten steps, each one felt completely.", config: { phases: [ { label: "Steps 1–5", seconds: 90 }, { label: "Steps 6–10", seconds: 90 } ] } },

  // ── Energy ───────────────────────────────────────────────────────────────
  { id: "ujjayi", label: "Ujjayi Breath", family: "energy", engine: "breath", seconds: 300, intensity: 2, description: "The victorious breath that builds heat.", config: { pattern: "coherent", showPhaseText: true } },
  { id: "kapalabhati", label: "Kapalabhati", family: "energy", engine: "guided", seconds: 180, intensity: 4, description: "Short, sharp exhales; passive inhales.", config: { phases: [ { label: "Round 1", seconds: 60 }, { label: "Rest", seconds: 30 }, { label: "Round 2", seconds: 60 }, { label: "Rest", seconds: 30 } ] }, note: "Skip if pregnant or if you have high blood pressure." },
  { id: "bandha_intro", label: "Bandha Intro", family: "energy", engine: "guided", seconds: 240, intensity: 3, description: "Mula and uddiyana, learned gently.", config: { phases: [ { label: "Root lock", seconds: 120 }, { label: "Upward lock", seconds: 120 } ] }, note: "Learn this with a teacher before practicing daily." },
  { id: "kundalini_rise", label: "Kundalini Rise", family: "energy", engine: "visualization", seconds: 600, intensity: 3, description: "Follow the current from root to crown.", config: { background: "starfield", showTimer: true } },
  { id: "chakra_scan", label: "Chakra Scan", family: "energy", engine: "guided", seconds: 480, intensity: 2, description: "Seven centers, one breath each.", config: { phases: [ { label: "Root", seconds: 60 }, { label: "Sacral", seconds: 60 }, { label: "Solar plexus", seconds: 60 }, { label: "Heart", seconds: 60 }, { label: "Throat", seconds: 60 }, { label: "Third eye", seconds: 60 }, { label: "Crown", seconds: 60 } ] } },
  { id: "nadi_shodhana", label: "Nadi Shodhana", family: "energy", engine: "guided", seconds: 300, intensity: 2, description: "Alternate nostril, left then right.", config: { phases: [ { label: "Left inhale", seconds: 60 }, { label: "Right inhale", seconds: 60 }, { label: "Both sides", seconds: 180 } ] } },
  { id: "energy_body", label: "Energy Body", family: "energy", engine: "body_map", seconds: 300, intensity: 2, description: "Map where energy feels bright or blocked.", config: { interactive: true } },
  { id: "vitality_breath", label: "Vitality Breath", family: "energy", engine: "breath", seconds: 240, intensity: 3, description: "Energizing breath for the mid-day dip.", config: { pattern: "box", showPhaseText: true } },

  // ── Nature ───────────────────────────────────────────────────────────────
  { id: "earth_grounding", label: "Earth Grounding", family: "nature", engine: "guided", seconds: 240, intensity: 1, description: "Borrow the steadiness of the ground.", config: { phases: [ { label: "Stand", seconds: 60 }, { label: "Feel the support", seconds: 120 }, { label: "Let go", seconds: 60 } ] } },
  { id: "sky_gazing", label: "Sky Gazing", family: "nature", engine: "timer", seconds: 300, intensity: 1, description: "Let the sky be wider than the problem.", config: { showOrb: false, gentleBell: false } },
  { id: "water_flow", label: "Water Flow", family: "nature", engine: "visualization", seconds: 420, intensity: 1, description: "Follow a river until the mind runs clear.", config: { background: "gradient", showTimer: true } },
  { id: "fire_gaze", label: "Fire Gaze", family: "nature", engine: "timer", seconds: 240, intensity: 1, description: "Watch a flame and let the eyes rest.", config: { showOrb: false, gentleBell: false } },
  { id: "forest_bath", label: "Forest Bath", family: "nature", engine: "observation", seconds: 600, intensity: 1, description: "Listen to everything green and living.", config: { focus: "sounds", allowLogging: false } },
  { id: "moon_rest", label: "Moon Rest", family: "nature", engine: "timer", seconds: 300, intensity: 1, description: "Cool, quiet, and unhurried.", config: { showOrb: true, gentleBell: true } },
  { id: "season_reflection", label: "Season Reflection", family: "nature", engine: "writing", seconds: 300, intensity: 1, description: "What season are you actually in?", config: { prompts: ["The season I am in is…", "What is ending", "What is beginning"], minChars: 30 } },
  { id: "nature_gratitude", label: "Nature Gratitude", family: "nature", engine: "writing", seconds: 180, intensity: 1, description: "Thank one living thing you noticed today.", config: { prompts: ["One living thing I noticed…"], minChars: 15 } },

  // ── Focus ────────────────────────────────────────────────────────────────
  { id: "single_point", label: "Single Point", family: "focus", engine: "timer", seconds: 300, intensity: 2, description: "One object, one breath, no wandering.", config: { showOrb: true, gentleBell: true } },
  { id: "candle_gaze", label: "Candle Gaze", family: "focus", engine: "timer", seconds: 240, intensity: 2, description: "Trataka: steady eyes, steady mind.", config: { showOrb: false, gentleBell: true } },
  { id: "counting_mala", label: "Counting Mala", family: "focus", engine: "jap", seconds: 300, intensity: 1, description: "Count each breath as one bead.", config: { targetCount: 54, mantra: "One", showMala: true } },
  { id: "attention_shift", label: "Attention Shift", family: "focus", engine: "guided", seconds: 300, intensity: 2, description: "Move attention deliberately, then hold it.", config: { phases: [ { label: "Breath", seconds: 100 }, { label: "Hands", seconds: 100 }, { label: "Whole field", seconds: 100 } ] } },
  { id: "distraction_log", label: "Distraction Log", family: "focus", engine: "observation", seconds: 240, intensity: 2, description: "Log every departure, return without judgement.", config: { focus: "thoughts", allowLogging: true, showCounter: true } },
  { id: "deep_work_prep", label: "Deep Work Prep", family: "focus", engine: "intention", seconds: 180, intensity: 1, description: "One task, one reason, one distraction removed.", config: { prompt: "What is the one thing this next hour is for?", placeholder: "This hour is for…" } },
  { id: "focus_rating", label: "Focus Rating", family: "focus", engine: "rating", seconds: 60, intensity: 1, description: "Rate the quality of attention right now.", config: { min: 1, max: 10, labels: { 1: "Scattered", 5: "Wavering", 10: "Laser" } } },
  { id: "flow_trigger", label: "Flow Trigger", family: "focus", engine: "checklist", seconds: 120, intensity: 1, description: "Set the conditions for absorption.", config: { items: ["Phone away", "One clear task", "Water nearby", "Timer set", "Notification off"], minSelections: 4 } },

  // ── Sleep ────────────────────────────────────────────────────────────────
  { id: "yoga_nidra", label: "Yoga Nidra", family: "sleep", engine: "guided", seconds: 900, intensity: 1, description: "The long lying-down practice for deep rest.", config: { phases: [ { label: "Settle", seconds: 120 }, { label: "Rotation of consciousness", seconds: 300 }, { label: "Breath awareness", seconds: 240 }, { label: "Opposites", seconds: 120 }, { label: "Return", seconds: 120 } ] } },
  { id: "body_melt", label: "Body Melt", family: "sleep", engine: "guided", seconds: 600, intensity: 1, description: "Let each region get heavier than the last.", config: { phases: [ { label: "Feet and legs", seconds: 150 }, { label: "Hips and belly", seconds: 150 }, { label: "Chest and arms", seconds: 150 }, { label: "Face and head", seconds: 150 } ] } },
  { id: "sleep_sankalpa", label: "Sleep Sankalpa", family: "sleep", engine: "intention", seconds: 120, intensity: 1, description: "One sentence for the sleeping mind.", config: { prompt: "What should the sleeping mind carry?", placeholder: "Tonight I release…", maxLength: 120 } },
  { id: "four_seven_eight_sleep", label: "4-7-8 for Sleep", family: "sleep", engine: "breath", seconds: 300, intensity: 1, description: "The wind-down breath, done slowly.", config: { pattern: "4-7-8", showPhaseText: true, showOrb: true } },
  { id: "night_release", label: "Night Release", family: "sleep", engine: "writing", seconds: 240, intensity: 1, description: "Put the day down on paper so the mind can drop it.", config: { prompts: ["What I am still holding", "What can wait until morning"], minChars: 30 } },
  { id: "dream_seed", label: "Dream Seed", family: "sleep", engine: "visualization", seconds: 300, intensity: 1, description: "Plant one image for the night.", config: { background: "black", showTimer: false } },
  { id: "rest_timer", label: "Rest Timer", family: "sleep", engine: "timer", seconds: 1200, intensity: 1, description: "Twenty minutes of nothing at all.", config: { showOrb: true, gentleBell: true } },
  { id: "tension_drop", label: "Tension Drop", family: "sleep", engine: "guided", seconds: 300, intensity: 1, description: "Release the last three places you are gripping.", config: { phases: [ { label: "Eyes", seconds: 100 }, { label: "Jaw", seconds: 100 }, { label: "Hands", seconds: 100 } ] } },

  // ── Integration ──────────────────────────────────────────────────────────
  { id: "session_review", label: "Session Review", family: "integration", engine: "reflection", seconds: 300, intensity: 1, description: "What actually happened in this sitting?", config: { guidedQuestions: ["What shifted?", "What stayed the same?", "What will you carry?"] } },
  { id: "one_next_step", label: "One Next Step", family: "integration", engine: "intention", seconds: 120, intensity: 1, description: "One concrete action before the day ends.", config: { prompt: "What is the one next step?", placeholder: "Before tonight, I will…" } },
  { id: "insight_to_action", label: "Insight to Action", family: "integration", engine: "writing", seconds: 240, intensity: 2, description: "Name what you saw and what it asks of you.", config: { prompts: ["What I saw clearly", "What it asks of me", "When I will do it"], minChars: 40 } },
  { id: "carry_forward", label: "Carry Forward", family: "integration", engine: "checklist", seconds: 120, intensity: 1, description: "Choose what survives the session.", config: { items: ["One insight to remember", "One feeling to keep", "One action to take", "One thing to release"], minSelections: 3 } },
  { id: "micro_commitment", label: "Micro Commitment", family: "integration", engine: "intention", seconds: 90, intensity: 1, description: "Small enough that you will actually do it.", config: { prompt: "What is a 2-minute commitment?", placeholder: "I will…" } },
  { id: "integration_journal", label: "Integration Journal", family: "integration", engine: "writing", seconds: 300, intensity: 1, description: "The page that seals the insight.", config: { prompts: ["What I do not want to forget", "How I will remember it"], minChars: 40 } },
  { id: "gratitude_close", label: "Gratitude Close", family: "integration", engine: "writing", seconds: 120, intensity: 1, description: "Close the sitting with thanks.", config: { prompts: ["Thank you for…"], minChars: 10 } },
  { id: "progress_check", label: "Progress Check", family: "integration", engine: "rating", seconds: 60, intensity: 1, description: "Rate the distance travelled.", config: { min: 1, max: 10, labels: { 1: "Same place", 5: "Small shift", 10: "Transformed" } } },

  // ── Relational ───────────────────────────────────────────────────────────
  { id: "empathic_listening", label: "Empathic Listening", family: "relational", engine: "guided", seconds: 300, intensity: 2, description: "Listen without preparing your reply.", config: { phases: [ { label: "Set the rule", seconds: 60, cue: "No advice, no fixing, no story about yourself." }, { label: "Listen", seconds: 180 }, { label: "Reflect back", seconds: 60 } ] } },
  { id: "connection_call", label: "Connection Call", family: "relational", engine: "intention", seconds: 120, intensity: 1, description: "One person, one honest sentence today.", config: { prompt: "Who will you reach out to, and what will you say?", placeholder: "I will call…" } },
  { id: "repair_practice", label: "Repair Practice", family: "relational", engine: "writing", seconds: 360, intensity: 3, description: "What needs repairing, and what is yours to own?", config: { prompts: ["What happened", "My part", "What I will say", "What I will not demand"], minChars: 60 } },
  { id: "boundary_check", label: "Boundary Check", family: "relational", engine: "checklist", seconds: 180, intensity: 2, description: "Name the yes that should have been a no.", config: { items: ["I named the resentment", "I found the missing boundary", "I wrote the sentence", "I chose a moment to say it"], minSelections: 3 } },
  { id: "appreciation_text", label: "Appreciation Text", family: "relational", engine: "writing", seconds: 180, intensity: 1, description: "Send one specific thank-you, not a generic one.", config: { prompts: ["What they did", "What it meant to me"], minChars: 20 } },
  { id: "conflict_pause", label: "Conflict Pause", family: "relational", engine: "breath", seconds: 180, intensity: 2, description: "Three breaths before the next sentence.", config: { pattern: "coherent", showPhaseText: true } },

  // ── Challenge ────────────────────────────────────────────────────────────
  { id: "cold_exposure_prep", label: "Cold Exposure Prep", family: "challenge", engine: "breath", seconds: 180, intensity: 3, description: "Steady the breath before the cold.", config: { pattern: "box", showPhaseText: true }, note: "Never practice breath holds in water." },
  { id: "urge_surfing", label: "Urge Surfing", family: "challenge", engine: "guided", seconds: 300, intensity: 3, description: "Ride the urge without obeying it.", config: { phases: [ { label: "Notice", seconds: 60 }, { label: "Locate it", seconds: 120 }, { label: "Watch it peak and fall", seconds: 120 } ] } },
  { id: "discomfort_tolerance", label: "Discomfort Tolerance", family: "challenge", engine: "timer", seconds: 300, intensity: 3, description: "Stay with mild discomfort and do nothing.", config: { showOrb: true, gentleBell: true } },
  { id: "fear_ladder", label: "Fear Ladder", family: "challenge", engine: "checklist", seconds: 240, intensity: 3, description: "Break the fear into steps small enough to take.", config: { items: ["Named the fear", "Found step one", "Found step two", "Booked step one", "Chose a reward"], minSelections: 4 } },
  { id: "hundred_breaths", label: "100 Breaths", family: "challenge", engine: "breath", seconds: 600, intensity: 3, description: "One hundred natural breaths, counted.", config: { pattern: "natural", showPhaseText: false, showOrb: true } },
  { id: "long_sit_20", label: "Twenty-Minute Sit", family: "challenge", engine: "timer", seconds: 1200, intensity: 4, description: "Longer than comfortable. That is the point.", config: { showOrb: true, gentleBell: true, intervalSeconds: 300 } },

  // ── Generic step widgets ─────────────────────────────────────────────────
  // One per step kind that has no bespoke renderer, so every step in a
  // sitting can be completed by a widget instead of a read-only card.
  { id: "inner_imagery", label: "Guided Imagery", family: "focus", engine: "visualization", seconds: 300, intensity: 1, description: "See it clearly before you live it.", config: { background: "gradient", showTimer: true } },
  { id: "contemplation_sit", label: "Contemplation", family: "stillness", engine: "timer", seconds: 420, intensity: 2, description: "Hold one question and let it answer you.", config: { showOrb: true, gentleBell: true, showPhase: false } },
  { id: "free_page", label: "Free Page", family: "mind", engine: "writing", seconds: 300, intensity: 1, description: "Write without stopping until the page empties.", config: { prompts: ["Keep the pen moving - what wants to be said?"], minChars: 0, placeholder: "No editing, no stopping..." } },
  { id: "daily_plan", label: "Daily Plan", family: "integration", engine: "writing", seconds: 240, intensity: 1, description: "Name the one thing today asks of you.", config: { prompts: ["The one thing that matters today", "The first step", "What I will let go"], minChars: 20 } },
  { id: "scripture_lectio", label: "Sacred Reading", family: "devotion", engine: "reflection", seconds: 300, intensity: 1, description: "Read slowly; let one line stay.", config: { guidedQuestions: ["Which line stayed with you?", "What does it ask of you now?"] } },
];

function toDefinition(row: Row): StepWidgetDefinition {
  const family = FAMILY_META[row.family];
  return {
    id: row.id,
    label: row.label,
    family: row.family,
    engine: row.engine,
    description: row.description,
    durationSeconds: row.seconds,
    intensity: row.intensity,
    tags: row.tags ?? [row.family, row.engine, family.label.toLowerCase()],
    config: row.config ?? {},
    note: row.note,
  };
}

export const STEP_WIDGETS: StepWidgetDefinition[] = rows.map(toDefinition);

const byId = new Map(STEP_WIDGETS.map((definition) => [definition.id, definition]));

export function getStepWidget(id: string | null | undefined): StepWidgetDefinition | undefined {
  if (!id) return undefined;
  return byId.get(id);
}

export function widgetsByFamily(family: WidgetFamily): StepWidgetDefinition[] {
  return STEP_WIDGETS.filter((definition) => definition.family === family);
}

export const WIDGET_FAMILIES = Array.from(
  new Set(STEP_WIDGETS.map((definition) => definition.family)),
);

export function searchStepWidgets(query: string): StepWidgetDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return STEP_WIDGETS;
  return STEP_WIDGETS.filter((definition) =>
    [definition.id, definition.label, definition.description, definition.family, definition.engine, ...definition.tags]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}
