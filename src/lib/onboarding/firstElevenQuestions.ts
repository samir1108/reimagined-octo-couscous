/**
 * firstElevenQuestions — the adaptive question bank (105 questions).
 * ─────────────────────────────────
 * Every question belongs to one of the eleven sittings and one question
 * role (open / deepen / body / mirror / choice). At runtime the selector
 * (firstElevenEngine) picks one question per spine slot per user, so the
 * eleven sittings ask different questions to different people — drawn from
 * a bank of more than one hundred.
 *
 * Every option carries a band (0–10) signal, a dimension, and optional loop
 * ids — the raw material of the post-eleven mapping.
 */
import type { SEQuestion } from "./firstElevenTypes";

export const FIRST_ELEVEN_QUESTIONS: SEQuestion[] = [
  // ═══ 1. THE STOLEN MIND ═══════════════════════════════════════════
  {
    id: "s01_open_a", sessionId: "stolen_mind", role: "open", kind: "choice",
    title: "How many times did you unlock your phone today without deciding to?",
    subtitle: "The honest number, not the impressive one.",
    options: [
      { id: "lost", label: "Lost count before noon", band: 1, dimension: "thought", loops: ["BHV007"] },
      { id: "few", label: "A few — mostly when notified", band: 4, dimension: "thought", loops: ["BHV007"] },
      { id: "decide", label: "I decide before I touch it", band: 7, dimension: "awareness" },
      { id: "stopped", label: "Barely at all anymore", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s01_open_b", sessionId: "stolen_mind", role: "open", kind: "choice",
    title: "When did you last finish one thing before starting the next?",
    options: [
      { id: "never", label: "Can't remember", band: 2, dimension: "thought", loops: ["PRD001"] },
      { id: "some", label: "Some days", band: 5, dimension: "thought", loops: ["MOT001"] },
      { id: "most", label: "Most things", band: 7, dimension: "awareness" },
      { id: "always", label: "It's just how I live now", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s01_deepen_a", sessionId: "stolen_mind", role: "deepen", kind: "choice",
    title: "What is the phone actually for, most days?",
    options: [
      { id: "numb", label: "Numbing — something to not feel", band: 1, dimension: "body", loops: ["AVD001", "HAB001"] },
      { id: "escape", label: "Escape from boredom", band: 3, dimension: "thought", loops: ["BHV007"] },
      { id: "tool", label: "A tool I put down", band: 7, dimension: "awareness" },
      { id: "neither", label: "Neither needed nor missed", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s01_deepen_b", sessionId: "stolen_mind", role: "deepen", kind: "choice",
    title: "When something is left unfinished, what happens to it?",
    options: [
      { id: "nags", label: "It nags until I return to it", band: 3, dimension: "thought", loops: ["CTL003"] },
      { id: "background", label: "It quietly runs in the background for days", band: 1, dimension: "thought", loops: ["MEN001"] },
      { id: "finish", label: "I finish it or consciously park it", band: 5, dimension: "thought" },
      { id: "gone", label: "I close it and it's gone", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s01_body_a", sessionId: "stolen_mind", role: "body", kind: "scale",
    title: "How present is your body while you scroll?",
    minLabel: "Nowhere to be found", maxLabel: "I can feel it the whole time",
    lowBand: 1, highBand: 9, dimension: "body", loops: ["BOD011"],
  },
  {
    id: "s01_mirror_a", sessionId: "stolen_mind", role: "mirror", kind: "text",
    title: "Finish this sentence: the thing I reach for when I don't want to be alone with myself is ______",
    placeholder: "One or two words is enough. The phone counts as an answer only if it's true.",
    maxLength: 80,
    dimension: "emotion", bandHint: 3, loops: ["AVD001", "EMO010"],
  },
  {
    id: "s01_mirror_b", sessionId: "stolen_mind", role: "mirror", kind: "choice",
    title: "If every feed went dark for one week, what would surface in you first?",
    options: [
      { id: "panic", label: "Panic — I'd be cut off from people", band: 2, dimension: "emotion", loops: ["EMO010", "REL014"] },
      { id: "boredom", label: "A flat, restless boredom", band: 4, dimension: "body", loops: ["BOD009"] },
      { id: "relief", label: "Relief — like setting down a weight", band: 8, dimension: "awareness" },
      { id: "curiosity", label: "Curiosity — what would I do instead?", band: 7, dimension: "thought" },
    ],
  },
  {
    id: "s01_choice_a", sessionId: "stolen_mind", role: "choice", kind: "choice",
    title: "The hour you'd take back first is:",
    options: [
      { id: "night", label: "The last hour of the night", band: 4, dimension: "body", loops: ["BHV002", "HAB008"] },
      { id: "morning", label: "The first hour of the morning", band: 5, dimension: "body" },
      { id: "gaps", label: "The dead gaps between tasks", band: 6, dimension: "thought", loops: ["PRD001"] },
      { id: "all", label: "All of them. I want them all back.", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s01_body_b", sessionId: "stolen_mind", role: "body", kind: "choice",
    title: "When you finally put the phone down, what does the body do?",
    options: [
      { id: "reaches", label: "It reaches again within minutes", band: 1, dimension: "body", loops: ["BHV007"] },
      { id: "buzzing", label: "It buzzes — restless, half-still here", band: 4, dimension: "body", loops: ["BOD009"] },
      { id: "settles", label: "It settles, and I notice the room", band: 7, dimension: "body" },
      { id: "relief", label: "It exhales — real relief", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s01_choice_b", sessionId: "stolen_mind", role: "choice", kind: "choice",
    title: "The first door you'd walk through tomorrow is:",
    options: [
      { id: "phone_away", label: "One hour, phone in another room", band: 6, dimension: "body" },
      { id: "no_feed", label: "One full day without the feed", band: 8, dimension: "body", loops: ["HAB001"] },
      { id: "observe", label: "Just watching the reach — no rules", band: 7, dimension: "awareness" },
      { id: "all", label: "All of it — I'm done being managed", band: 9, dimension: "awareness" },
    ],
  },

  // ═══ 2. THE COMPARISON MACHINE ════════════════════════════════════
  {
    id: "s02_open_a", sessionId: "comparison_machine", role: "open", kind: "choice",
    title: "When did you last measure yourself against someone you've never met?",
    subtitle: "A face on a screen counts.",
    options: [
      { id: "today", label: "Today — probably in the last hour", band: 2, dimension: "emotion", loops: ["VAL025", "SOC005"] },
      { id: "week", label: "This week, a few times", band: 4, dimension: "emotion", loops: ["VAL025"] },
      { id: "rare", label: "Rarely, and I catch it fast", band: 7, dimension: "awareness" },
      { id: "never", label: "I don't think in those terms anymore", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s02_open_b", sessionId: "comparison_machine", role: "open", kind: "choice",
    title: "Which comparison hits hardest?",
    options: [
      { id: "success", label: "Their success, my stagnation", band: 2, dimension: "emotion", loops: ["VAL004", "IDN014"] },
      { id: "body", label: "Their body, their ease in it", band: 2, dimension: "body", loops: ["VAL025"] },
      { id: "peace", label: "Their peace, my inner noise", band: 3, dimension: "emotion", loops: ["CTL003"] },
      { id: "love", label: "Their love, my aloneness", band: 3, dimension: "emotion", loops: ["EMO010", "REL014"] },
    ],
  },
  {
    id: "s02_deepen_a", sessionId: "comparison_machine", role: "deepen", kind: "choice",
    title: "Whose voice is the comparator, really?",
    subtitle: "The one that says 'look what they have'.",
    options: [
      { id: "dontknow", label: "I've never asked that", band: 3, dimension: "thought" },
      { id: "parents", label: "A parent's, or a caregiver's", band: 4, dimension: "emotion", loops: ["VAL001"] },
      { id: "peers", label: "The kids at school, still echoing", band: 4, dimension: "emotion", loops: ["SOC001"] },
      { id: "mine", label: "I know it well — and it's mine now", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s02_deepen_b", sessionId: "comparison_machine", role: "deepen", kind: "choice",
    title: "After you compare and come up smaller, what do you usually do next?",
    options: [
      { id: "scroll", label: "Keep scrolling — it numbs it", band: 1, dimension: "body", loops: ["HAB001", "AVD001"] },
      { id: "promise", label: "Promise myself I'll change — tonight", band: 3, dimension: "thought", loops: ["MOT011"] },
      { id: "critic", label: "Turn the contempt inward", band: 2, dimension: "emotion", loops: ["MEN006", "EMO005"] },
      { id: "see", label: "See the whole mechanism, and let it pass", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s02_body_a", sessionId: "comparison_machine", role: "body", kind: "scale",
    title: "Where does comparison land in the body?",
    minLabel: "I don't feel a thing", maxLabel: "A precise, familiar place",
    lowBand: 2, highBand: 9, dimension: "body", loops: ["BOD005"],
  },
  {
    id: "s02_mirror_a", sessionId: "comparison_machine", role: "mirror", kind: "text",
    title: "The person you measured yourself against this week was secretly living a life without ______",
    placeholder: "The thing you believe they have and you don't.",
    maxLength: 80,
    dimension: "emotion", bandHint: 3, loops: ["VAL025"],
  },
  {
    id: "s02_mirror_b", sessionId: "comparison_machine", role: "mirror", kind: "choice",
    title: "If you could never compare again — starting tomorrow — what would you lose?",
    options: [
      { id: "drive", label: "My drive. Comparison is my fuel.", band: 2, dimension: "emotion", loops: ["VAL004"] },
      { id: "direction", label: "My sense of direction", band: 4, dimension: "thought", loops: ["VAL025"] },
      { id: "map", label: "A map I'd learn to replace", band: 6, dimension: "thought" },
      { id: "nothing", label: "Nothing I'd miss", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s02_choice_a", sessionId: "comparison_machine", role: "choice", kind: "choice",
    title: "Tomorrow's small act: you'd most easily —",
    options: [
      { id: "mute", label: "Mute the one account that shrinks you", band: 5, dimension: "emotion" },
      { id: "delay", label: "Delay the first scroll by ten minutes", band: 4, dimension: "body" },
      { id: "gratitude", label: "Write one true thing about your own life", band: 6, dimension: "emotion" },
      { id: "none", label: "None of these — I need a different door", band: 3, dimension: "thought", loops: ["MEN003"] },
    ],
  },
  {
    id: "s02_body_b", sessionId: "comparison_machine", role: "body", kind: "choice",
    title: "When the drop after comparing arrives, where does it land first?",
    options: [
      { id: "chest", label: "The chest — a small, familiar sink", band: 4, dimension: "body", loops: ["BOD005"] },
      { id: "stomach", label: "The stomach — something goes hollow", band: 3, dimension: "body", loops: ["SRV001"] },
      { id: "jaw", label: "The jaw or shoulders — I tighten", band: 3, dimension: "body", loops: ["BOD001"] },
      { id: "nowhere", label: "Nowhere — I catch it as a thought", band: 8, dimension: "body" },
    ],
  },
  {
    id: "s02_choice_b", sessionId: "comparison_machine", role: "choice", kind: "choice",
    title: "The comparison that costs you most energy right now is:",
    options: [
      { id: "career", label: "Career — who's ahead, who's behind", band: 3, dimension: "emotion", loops: ["VAL004"] },
      { id: "relationships", label: "Relationships — who's loved, who's alone", band: 3, dimension: "emotion", loops: ["EMO010"] },
      { id: "inner", label: "Inner peace — who's calm, who's not", band: 4, dimension: "emotion", loops: ["CTL003"] },
      { id: "none", label: "None — the ledger closed", band: 9, dimension: "awareness" },
    ],
  },

  // ═══ 3. DESIRE AND THE MORE ═══════════════════════════════════════
  {
    id: "s03_open_a", sessionId: "desire_more", role: "open", kind: "choice",
    title: "The last thing you wanted badly — how long did getting it quiet the wanting?",
    options: [
      { id: "days", label: "A few days, then the next want", band: 3, dimension: "emotion", loops: ["VAL004"] },
      { id: "hours", label: "Hours. Sometimes minutes.", band: 2, dimension: "emotion", loops: ["VAL004"] },
      { id: "still", label: "It hasn't, yet", band: 4, dimension: "emotion" },
      { id: "longer", label: "Longer than it used to", band: 7, dimension: "awareness" },
    ],
  },
  {
    id: "s03_open_b", sessionId: "desire_more", role: "open", kind: "choice",
    title: "What does 'enough' look like to you right now?",
    options: [
      { id: "number", label: "A number — an amount", band: 2, dimension: "thought", loops: ["BLF001"] },
      { id: "state", label: "A state — calm, safety, arrival", band: 4, dimension: "emotion" },
      { id: "movable", label: "Something that keeps moving when I get close", band: 3, dimension: "thought", loops: ["VAL004"] },
      { id: "practice", label: "Not a thing — a practice", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s03_deepen_a", sessionId: "desire_more", role: "deepen", kind: "choice",
    title: "What does the wanting promise, in its exact words?",
    subtitle: "Finish the promise: 'when I get this, I will finally ______'",
    options: [
      { id: "safe", label: "…finally be safe", band: 2, dimension: "body", loops: ["SRV001"] },
      { id: "enough", label: "…finally be enough", band: 2, dimension: "emotion", loops: ["BLF001"] },
      { id: "free", label: "…finally be free", band: 4, dimension: "emotion" },
      { id: "none", label: "…I hear the promise and don't believe it", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s03_deepen_b", sessionId: "desire_more", role: "deepen", kind: "choice",
    title: "Your default response to an uncomfortable feeling is to consume something. What?",
    options: [
      { id: "content", label: "Content — feeds, videos, news", band: 1, dimension: "body", loops: ["HAB001"] },
      { id: "food", label: "Food — something sweet or heavy", band: 2, dimension: "body", loops: ["HAB002"] },
      { id: "buy", label: "Buy — something small that arrives tomorrow", band: 2, dimension: "body", loops: ["VAL004"] },
      { id: "sit", label: "These days I mostly just sit with it", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s03_body_a", sessionId: "desire_more", role: "body", kind: "scale",
    title: "How precisely can you feel desire in the body before it becomes a purchase?",
    minLabel: "No idea — it's all in the head", maxLabel: "I feel the exact itch and where it sits",
    lowBand: 2, highBand: 9, dimension: "body", loops: ["BOD005"],
  },
  {
    id: "s03_mirror_a", sessionId: "desire_more", role: "mirror", kind: "text",
    title: "The thing you own that you thought would change how you feel about yourself — and didn't:",
    placeholder: "The gadget, the bag, the car, the place. Name the real one.",
    maxLength: 90,
    dimension: "emotion", bandHint: 4, loops: ["VAL003", "VAL004"],
  },
  {
    id: "s03_mirror_b", sessionId: "desire_more", role: "mirror", kind: "choice",
    title: "If wanting stopped entirely for one day, what would you do with the silence?",
    options: [
      { id: "panic", label: "Panic — what is there without wanting?", band: 2, dimension: "emotion" },
      { id: "bored", label: "Be quietly bored until it returns", band: 4, dimension: "body", loops: ["BOD009"] },
      { id: "create", label: "Make something — wanting was the block", band: 7, dimension: "thought" },
      { id: "rest", label: "Rest. Just rest.", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s03_choice_a", sessionId: "desire_more", role: "choice", kind: "choice",
    title: "The pause you'd actually keep tomorrow is:",
    options: [
      { id: "cart", label: "Three seconds before the buy", band: 5, dimension: "body" },
      { id: "app", label: "Ten minutes before the app", band: 4, dimension: "body" },
      { id: "morning", label: "One morning without the first input", band: 6, dimension: "body" },
      { id: "all", label: "All three — I want this", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s03_body_b", sessionId: "desire_more", role: "body", kind: "choice",
    title: "Where does the wanting live in the body before it reaches the hand?",
    options: [
      { id: "chest", label: "The chest — leaning forward", band: 4, dimension: "body", loops: ["BOD005"] },
      { id: "hands", label: "The hands — already reaching", band: 3, dimension: "body", loops: ["BOD009"] },
      { id: "throat", label: "The throat — a swallow, a dryness", band: 3, dimension: "body" },
      { id: "visible", label: "I see it clearly before it moves", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s03_choice_b", sessionId: "desire_more", role: "choice", kind: "choice",
    title: "The one 'more' you'd be willing to question tomorrow is:",
    options: [
      { id: "more_time", label: "More time — one more hour of it", band: 4, dimension: "emotion", loops: ["BLF015"] },
      { id: "more_money", label: "More money — enough never arrives", band: 4, dimension: "emotion", loops: ["VAL004"] },
      { id: "more_me", label: "More me — a better version, finally", band: 3, dimension: "emotion", loops: ["BLF001"] },
      { id: "none", label: "None — the wanting is quiet", band: 9, dimension: "awareness" },
    ],
  },

  // ═══ 4. THE FEAR ENGINE ═══════════════════════════════════════════
  {
    id: "s04_open_a", sessionId: "fear_engine", role: "open", kind: "choice",
    title: "How much of your attention did fear take this week?",
    subtitle: "Worry, dread, hypervigilance — all of it counts.",
    options: [
      { id: "most", label: "Most of it", band: 2, dimension: "emotion", loops: ["SRV001", "MEN002"] },
      { id: "some", label: "A meaningful slice", band: 4, dimension: "emotion", loops: ["CTL002"] },
      { id: "little", label: "A little — I catch it early", band: 6, dimension: "emotion" },
      { id: "almost_none", label: "Almost none — the floor feels steadier", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s04_open_b", sessionId: "fear_engine", role: "open", kind: "choice",
    title: "What is the fear most often about?",
    options: [
      { id: "survival", label: "Money, health, survival — the basics", band: 2, dimension: "body", loops: ["SRV001"] },
      { id: "others", label: "What people think, losing standing", band: 3, dimension: "emotion", loops: ["VAL003", "EGO009"] },
      { id: "future", label: "The future — everything that could go wrong", band: 3, dimension: "thought", loops: ["MEN002"] },
      { id: "loss", label: "Losing someone I love", band: 4, dimension: "emotion", loops: ["BLF007"] },
    ],
  },
  {
    id: "s04_deepen_a", sessionId: "fear_engine", role: "deepen", kind: "choice",
    title: "When the fear arrives, what is your reflex?",
    options: [
      { id: "check", label: "Check — news, phone, someone's opinion", band: 2, dimension: "body", loops: ["HAB001", "VAL031"] },
      { id: "control", label: "Control — plan, fix, rehearse", band: 3, dimension: "thought", loops: ["CTL001", "CTL003"] },
      { id: "avoid", label: "Avoid — look away, get busy", band: 2, dimension: "body", loops: ["AVD001"] },
      { id: "feel", label: "Feel it — let it move through", band: 8, dimension: "body" },
    ],
  },
  {
    id: "s04_deepen_b", sessionId: "fear_engine", role: "deepen", kind: "choice",
    title: "How much of what you feared this week actually happened?",
    options: [
      { id: "most", label: "Most of it — the fear was accurate", band: 3, dimension: "thought" },
      { id: "some", label: "Some of it", band: 4, dimension: "thought" },
      { id: "little", label: "Very little — and not as feared", band: 7, dimension: "awareness" },
      { id: "none", label: "Almost none, as usual — and I know that now", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s04_body_a", sessionId: "fear_engine", role: "body", kind: "scale",
    title: "How clearly can you feel fear as sensation, before it becomes a story?",
    minLabel: "It's all story, no sensation", maxLabel: "I catch the sensation at the door",
    lowBand: 2, highBand: 9, dimension: "body", loops: ["BOD005", "SRV001"],
  },
  {
    id: "s04_mirror_a", sessionId: "fear_engine", role: "mirror", kind: "text",
    title: "The fear I've carried longest — the old one underneath the current ones — is",
    placeholder: "Go under the surface fear. The old one is usually simpler and quieter.",
    maxLength: 100,
    dimension: "emotion", bandHint: 4, loops: ["BLF001", "BLF007"],
  },
  {
    id: "s04_mirror_b", sessionId: "fear_engine", role: "mirror", kind: "choice",
    title: "If the fear were a person protecting you, what would it be protecting?",
    options: [
      { id: "dontknow", label: "I've never separated them", band: 3, dimension: "thought" },
      { id: "heart", label: "My heart — from hoping again", band: 4, dimension: "emotion", loops: ["EMO003"] },
      { id: "self", label: "The self I built — fear keeps it safe", band: 5, dimension: "emotion", loops: ["IDN005"] },
      { id: "life", label: "My life — literally, from danger", band: 4, dimension: "body", loops: ["SRV001"] },
    ],
  },
  {
    id: "s04_choice_a", sessionId: "fear_engine", role: "choice", kind: "choice",
    title: "Tomorrow's regulation experiment is:",
    options: [
      { id: "evidence", label: "Write the fear against the facts", band: 5, dimension: "thought" },
      { id: "breath", label: "Long exhales when it spikes", band: 6, dimension: "body" },
      { id: "tell", label: "Tell one person the fear out loud", band: 5, dimension: "emotion" },
      { id: "news", label: "One day without news entirely", band: 8, dimension: "body", loops: ["HAB001"] },
    ],
  },
  {
    id: "s04_choice_b", sessionId: "fear_engine", role: "choice", kind: "choice",
    title: "The oldest thing fear has protected you from is:",
    options: [
      { id: "harmed", label: "Being harmed again", band: 3, dimension: "body", loops: ["SRV001"] },
      { id: "seen", label: "Being truly seen", band: 4, dimension: "emotion", loops: ["BLF006"] },
      { id: "small", label: "Being small — useless, forgettable", band: 2, dimension: "emotion", loops: ["BLF001"] },
      { id: "none", label: "Nothing anymore — it lost its job", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s04_body_b", sessionId: "fear_engine", role: "body", kind: "choice",
    title: "When fear peaks, what does the body most reliably do?",
    options: [
      { id: "racing", label: "Heart races, chest tightens", band: 3, dimension: "body", loops: ["BOD005"] },
      { id: "shuts", label: "It shuts down — numb, far away", band: 2, dimension: "body", loops: ["SRV303", "AVD001"] },
      { id: "stomach", label: "The stomach drops or knots", band: 3, dimension: "body" },
      { id: "watch", label: "I can watch the whole flood pass", band: 9, dimension: "body" },
    ],
  },

  // ═══ 5. THE STORY OF ME ═══════════════════════════════════════════
  {
    id: "s05_open_a", sessionId: "story_of_me", role: "open", kind: "choice",
    title: "When someone asks who you are, what does the mind answer first?",
    options: [
      { id: "work", label: "What I do — my work", band: 3, dimension: "thought", loops: ["IDN014"] },
      { id: "past", label: "What happened to me — my story", band: 3, dimension: "emotion", loops: ["VAL028"] },
      { id: "roles", label: "My roles — parent, partner, child", band: 4, dimension: "emotion" },
      { id: "less", label: "Less and less, these days", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s05_open_b", sessionId: "story_of_me", role: "open", kind: "choice",
    title: "Which 'I am' have you never questioned?",
    subtitle: "The one that runs the show.",
    options: [
      { id: "notgood", label: "I'm not good at this / not enough", band: 2, dimension: "emotion", loops: ["BLF001", "MEN006"] },
      { id: "strong", label: "I'm the strong one — the reliable one", band: 3, dimension: "emotion", loops: ["IDN005"] },
      { id: "behind", label: "I'm behind — late to my own life", band: 2, dimension: "emotion", loops: ["BLF015", "MEN015"] },
      { id: "questioning", label: "I question all of them now", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s05_deepen_a", sessionId: "story_of_me", role: "deepen", kind: "choice",
    title: "Who benefits from you staying this story?",
    subtitle: "The story you tell about yourself — whose comfort does it serve?",
    options: [
      { id: "dontknow", label: "Never asked", band: 3, dimension: "thought" },
      { id: "me", label: "Me — it's safe, familiar, known", band: 4, dimension: "emotion" },
      { id: "others", label: "Others — they need me to be this", band: 3, dimension: "emotion", loops: ["VAL001", "SOC001"] },
      { id: "nobody", label: "Nobody — I can see it wearing thin", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s05_deepen_b", sessionId: "story_of_me", role: "deepen", kind: "choice",
    title: "When the story of you is challenged, what happens first?",
    options: [
      { id: "defend", label: "Defend it — evidence, arguments", band: 3, dimension: "emotion", loops: ["EGO009"] },
      { id: "collapse", label: "Collapse — the ground goes", band: 2, dimension: "emotion", loops: ["EMO005"] },
      { id: "laugh", label: "Deflect — joke, change subject", band: 3, dimension: "emotion", loops: ["AVD003"] },
      { id: "curious", label: "Curiosity — interesting, let me look", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s05_body_a", sessionId: "story_of_me", role: "body", kind: "scale",
    title: "How much of your identity can you feel as body sensation rather than thought?",
    minLabel: "None — it's all narrative", maxLabel: "I can feel the weight of the labels",
    lowBand: 2, highBand: 9, dimension: "body", loops: ["BOD011"],
  },
  {
    id: "s05_mirror_a", sessionId: "story_of_me", role: "mirror", kind: "text",
    title: "The label you'd grieve if you lost it — the one that would feel like dying — is",
    placeholder: "Be honest. This is the label that holds the most.",
    maxLength: 80,
    dimension: "emotion", bandHint: 3, loops: ["IDN014", "VAL028"],
  },
  {
    id: "s05_mirror_b", sessionId: "story_of_me", role: "mirror", kind: "choice",
    title: "If every label dropped for one day, who would show up?",
    options: [
      { id: "nothing", label: "Nobody — it would be terrifying", band: 2, dimension: "emotion" },
      { id: "tired", label: "Someone very tired of performing", band: 4, dimension: "emotion", loops: ["IDN005"] },
      { id: "younger", label: "Someone younger than I remember", band: 6, dimension: "emotion" },
      { id: "clear", label: "Just awareness — clear and already home", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s05_choice_a", sessionId: "story_of_me", role: "choice", kind: "choice",
    title: "The label you'll leave unworn tomorrow is:",
    options: [
      { id: "productive", label: "The productive one", band: 5, dimension: "thought" },
      { id: "strong", label: "The strong one", band: 4, dimension: "emotion", loops: ["IDN005"] },
      { id: "behind", label: "The behind one", band: 4, dimension: "emotion", loops: ["BLF015"] },
      { id: "all", label: "All of them — one day, no labels", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s05_choice_b", sessionId: "story_of_me", role: "choice", kind: "choice",
    title: "Your story is mostly written in the tense of:",
    options: [
      { id: "past", label: "The past — what was done to me, what I lost", band: 2, dimension: "emotion", loops: ["MEN015"] },
      { id: "future", label: "The future — what I'll finally become", band: 3, dimension: "thought", loops: ["MEN002"] },
      { id: "present", label: "The present — what's actually here", band: 8, dimension: "awareness" },
      { id: "notexts", label: "There's no story when I look", band: 10, dimension: "awareness" },
    ],
  },
  {
    id: "s05_body_b", sessionId: "story_of_me", role: "body", kind: "choice",
    title: "When you say 'I am', what does the body do with it?",
    options: [
      { id: "armor", label: "It armors — shoulders up, jaw set", band: 3, dimension: "body", loops: ["BOD001", "IDN005"] },
      { id: "shrink", label: "It shrinks — smaller, quieter", band: 2, dimension: "body", loops: ["EMO005"] },
      { id: "nothing", label: "Nothing much — it's all in the head", band: 4, dimension: "body", loops: ["BOD011"] },
      { id: "lightens", label: "It lightens — the label just falls", band: 9, dimension: "body" },
    ],
  },

  // ═══ 6. THE MIRROR OF OTHERS ══════════════════════════════════════
  {
    id: "s06_open_a", sessionId: "mirror_others", role: "open", kind: "choice",
    title: "What are you most often asking of other people?",
    subtitle: "The unspoken request.",
    options: [
      { id: "approve", label: "Appval — tell me I'm okay", band: 2, dimension: "emotion", loops: ["VAL003", "VAL031"] },
      { id: "stay", label: "Stay — don't leave, don't go quiet", band: 3, dimension: "emotion", loops: ["REL014", "BLF007"] },
      { id: "see", label: "See — the real me, not the managed one", band: 4, dimension: "emotion", loops: ["BLF003"] },
      { id: "nothing", label: "Less and less, these days", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s06_open_b", sessionId: "mirror_others", role: "open", kind: "choice",
    title: "When you're alone for a full evening, what actually happens?",
    options: [
      { id: "fill", label: "Fill it — noise, people, content", band: 2, dimension: "body", loops: ["EMO010", "HAB001"] },
      { id: "flat", label: "A flat, low sadness", band: 3, dimension: "emotion", loops: ["EMO010"] },
      { id: "okay", label: "Okay — some restlessness, some peace", band: 6, dimension: "body" },
      { id: "rich", label: "Rich — it's where I meet myself", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s06_deepen_a", sessionId: "mirror_others", role: "deepen", kind: "choice",
    title: "Your closest relationship is mostly held together by:",
    options: [
      { id: "fear", label: "Fear — of losing them, or of being alone", band: 2, dimension: "emotion", loops: ["REL004", "BLF007"] },
      { id: "roles", label: "Roles — who we each agreed to be", band: 4, dimension: "thought" },
      { id: "history", label: "History — everything we've been through", band: 4, dimension: "emotion" },
      { id: "choice", label: "Choice — renewed, not automatic", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s06_deepen_b", sessionId: "mirror_others", role: "deepen", kind: "choice",
    title: "When someone you love is struggling, your reflex is to:",
    options: [
      { id: "fix", label: "Fix it — solutions, plans, action", band: 3, dimension: "thought", loops: ["CTL001"] },
      { id: "absorb", label: "Absorb it — carry it so they don't have to", band: 2, dimension: "emotion", loops: ["VAL035", "REL009"] },
      { id: "distance", label: "Distance — it's too much, I go quiet", band: 3, dimension: "body", loops: ["REL015", "AVD001"] },
      { id: "sit", label: "Sit with them — no fixing needed", band: 8, dimension: "body" },
    ],
  },
  {
    id: "s06_body_a", sessionId: "mirror_others", role: "body", kind: "scale",
    title: "Can you feel your own boundaries as body sensation?",
    minLabel: "Boundaries are a concept, not a feeling", maxLabel: "I feel yes and no in the body",
    lowBand: 2, highBand: 9, dimension: "body", loops: ["REL009"],
  },
  {
    id: "s06_mirror_a", sessionId: "mirror_others", role: "mirror", kind: "text",
    title: "What I most need from them, that I have not yet given myself, is",
    placeholder: "One sentence. It will sting a little. That's the right one.",
    maxLength: 90,
    dimension: "emotion", bandHint: 4, loops: ["BLF003", "VAL001"],
  },
  {
    id: "s06_mirror_b", sessionId: "mirror_others", role: "mirror", kind: "choice",
    title: "If they saw the unmanaged you — completely — what would happen?",
    options: [
      { id: "leave", label: "They'd leave, or pull away", band: 2, dimension: "emotion", loops: ["BLF007"] },
      { id: "uncomfortable", label: "It would be uncomfortable, then fine", band: 4, dimension: "emotion", loops: ["BLF006"] },
      { id: "closer", label: "We'd get closer", band: 7, dimension: "emotion" },
      { id: "answered", label: "Nothing — the question has dissolved", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s06_choice_a", sessionId: "mirror_others", role: "choice", kind: "choice",
    title: "The honest notch tomorrow is:",
    options: [
      { id: "one_sentence", label: "One true sentence to someone safe", band: 5, dimension: "emotion" },
      { id: "one_no", label: "One small, clean no", band: 6, dimension: "emotion", loops: ["REL009"] },
      { id: "one_ask", label: "One direct ask, without apology", band: 6, dimension: "emotion", loops: ["BLF012", "VAL001"] },
      { id: "all", label: "Whichever arises in the moment", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s06_choice_b", sessionId: "mirror_others", role: "choice", kind: "choice",
    title: "The relationship that most needs one honest sentence is with:",
    options: [
      { id: "partner", label: "A partner or a lover", band: 4, dimension: "emotion" },
      { id: "parent", label: "A parent, or a child", band: 4, dimension: "emotion" },
      { id: "friend", label: "A friend — the old kind", band: 5, dimension: "emotion" },
      { id: "self", label: "Myself — that's the real one", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s06_body_b", sessionId: "mirror_others", role: "body", kind: "choice",
    title: "When you need someone, what does the body do first?",
    options: [
      { id: "hide", label: "Hides the need — becomes 'fine'", band: 2, dimension: "body", loops: ["AVD001", "BLF012"] },
      { id: "perform", label: "Performs — earns it before asking", band: 3, dimension: "body", loops: ["VAL001"] },
      { id: "apologizes", label: "Apologizes for needing at all", band: 2, dimension: "body", loops: ["VAL026"] },
      { id: "asks", label: "Asks — plainly, without the armor", band: 9, dimension: "body" },
    ],
  },

  // ═══ 7. MONEY AND ENOUGH ══════════════════════════════════════════
  {
    id: "s07_open_a", sessionId: "money_enough", role: "open", kind: "choice",
    title: "What does money mean to you, most days?",
    options: [
      { id: "survival", label: "Survival — oxygen, safety", band: 2, dimension: "body", loops: ["SRV001"] },
      { id: "score", label: "A scoreboard — how I'm doing", band: 3, dimension: "emotion", loops: ["IDN014", "VAL003"] },
      { id: "freedom", label: "Freedom — options, time", band: 5, dimension: "thought" },
      { id: "energy", label: "Just energy moving through", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s07_open_b", sessionId: "money_enough", role: "open", kind: "choice",
    title: "How often does the thought of money arrive uninvited?",
    options: [
      { id: "constant", label: "Constantly — it's the background hum", band: 2, dimension: "thought", loops: ["CTL003", "SRV001"] },
      { id: "weekly", label: "Weekly waves", band: 4, dimension: "thought" },
      { id: "moments", label: "At real moments, not phantom ones", band: 6, dimension: "thought" },
      { id: "rare", label: "Rarely — it's handled", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s07_deepen_a", sessionId: "money_enough", role: "deepen", kind: "choice",
    title: "When you spend to feel better, what are you actually buying?",
    subtitle: "The thing underneath the object.",
    options: [
      { id: "dontknow", label: "I don't know", band: 3, dimension: "emotion" },
      { id: "status", label: "Status — proof I've arrived", band: 3, dimension: "emotion", loops: ["VAL003", "SOC005"] },
      { id: "comfort", label: "Comfort — a moment of not-feeling", band: 4, dimension: "body", loops: ["HAB002"] },
      { id: "nothing", label: "Nothing — I mostly don't do this", band: 8, dimension: "awareness" },
    ],
  },
  {
    id: "s07_deepen_b", sessionId: "money_enough", role: "deepen", kind: "choice",
    title: "The 'enough' number you hold — when you approach it, it:",
    options: [
      { id: "moves", label: "Moves — it was never a number", band: 3, dimension: "thought", loops: ["VAL004"] },
      { id: "unknown", label: "I don't have a number", band: 4, dimension: "thought" },
      { id: "holds", label: "Holds — I can feel arrival", band: 7, dimension: "body" },
      { id: "no_number", label: "I don't think in numbers anymore", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s07_body_a", sessionId: "money_enough", role: "body", kind: "scale",
    title: "How present is scarcity in your body — even when the account is fine?",
    minLabel: "It sits in the stomach, always", maxLabel: "The body knows it's provided for",
    lowBand: 2, highBand: 9, dimension: "body", loops: ["SRV001", "BOD005"],
  },
  {
    id: "s07_mirror_a", sessionId: "money_enough", role: "mirror", kind: "text",
    title: "What I believe money would protect me from, that money has never actually protected anyone from, is",
    placeholder: "The honest one. Write it plainly.",
    maxLength: 90,
    dimension: "emotion", bandHint: 4, loops: ["SRV001"],
  },
  {
    id: "s07_mirror_b", sessionId: "money_enough", role: "mirror", kind: "choice",
    title: "If money stopped being a scoreboard tomorrow, what would you do differently?",
    options: [
      { id: "nothing", label: "Nothing — the score is most of my drive", band: 2, dimension: "emotion", loops: ["VAL004"] },
      { id: "unsure", label: "I genuinely don't know", band: 4, dimension: "thought" },
      { id: "less_more", label: "Work less. Want less. Live more.", band: 7, dimension: "emotion" },
      { id: "already", label: "Nothing — that's already how it is", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s07_choice_a", sessionId: "money_enough", role: "choice", kind: "choice",
    title: "The exposure you'll allow tomorrow:",
    options: [
      { id: "look", label: "Look at the real numbers", band: 5, dimension: "thought" },
      { id: "one_need", label: "Buy only what I need for one day", band: 6, dimension: "body" },
      { id: "give", label: "Give something away, small and real", band: 7, dimension: "emotion" },
      { id: "feel", label: "Feel the scarcity without acting on it", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s07_body_b", sessionId: "money_enough", role: "body", kind: "choice",
    title: "When the thought of money arrives, where does the body register it?",
    options: [
      { id: "stomach", label: "The stomach — a drop or a knot", band: 3, dimension: "body", loops: ["SRV001", "BOD005"] },
      { id: "shoulders", label: "The shoulders and neck — bracing", band: 3, dimension: "body", loops: ["BOD001"] },
      { id: "mind_only", label: "Mostly in the head, as calculation", band: 4, dimension: "body", loops: ["BOD011"] },
      { id: "neutral", label: "Neutrally — it's just information", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s07_choice_b", sessionId: "money_enough", role: "choice", kind: "choice",
    title: "The belief you'd test tomorrow is:",
    options: [
      { id: "not_safe", label: "I'm not safe unless there's more", band: 3, dimension: "emotion", loops: ["SRV001"] },
      { id: "score", label: "My number is my rank", band: 3, dimension: "emotion", loops: ["IDN014"] },
      { id: "earning", label: "Rest must be earned first", band: 4, dimension: "emotion", loops: ["BLF005"] },
      { id: "none", label: "None — these beliefs have loosened", band: 9, dimension: "awareness" },
    ],
  },

  // ═══ 8. WORK AND WORTH ════════════════════════════════════════════
  {
    id: "s08_open_a", sessionId: "work_worth", role: "open", kind: "choice",
    title: "How much of your worth is currently mortgaged to your output?",
    options: [
      { id: "all", label: "All of it — I am what I produce", band: 2, dimension: "emotion", loops: ["IDN014", "PRD001"] },
      { id: "most", label: "Most of it", band: 3, dimension: "emotion", loops: ["PRD001"] },
      { id: "some", label: "Some — I can feel the difference", band: 6, dimension: "emotion" },
      { id: "none", label: "None — the work is something I do, not what I am", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s08_open_b", sessionId: "work_worth", role: "open", kind: "choice",
    title: "What happens in you when you rest without earning it?",
    options: [
      { id: "guilt", label: "Guilt — loud and immediate", band: 2, dimension: "body", loops: ["BLF005", "PRD015"] },
      { id: "restless", label: "Restless — I start planning", band: 3, dimension: "thought", loops: ["PRD001"] },
      { id: "delay", label: "I can rest, after one more task", band: 4, dimension: "body", loops: ["VAL008"] },
      { id: "rest", label: "I rest. It's allowed.", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s08_deepen_a", sessionId: "work_worth", role: "deepen", kind: "choice",
    title: "The treadmill runs on a fear. Which one?",
    options: [
      { id: "irrelevant", label: "That I'll become irrelevant", band: 2, dimension: "emotion", loops: ["IDN014"] },
      { id: "notenough", label: "That I'm not enough as I am", band: 2, dimension: "emotion", loops: ["BLF001"] },
      { id: "loss", label: "That I'll lose what I've built", band: 3, dimension: "body", loops: ["SRV001"] },
      { id: "none", label: "None anymore — I work from choice", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s08_deepen_b", sessionId: "work_worth", role: "deepen", kind: "choice",
    title: "Your relationship with idle time is:",
    options: [
      { id: "unsafe", label: "Unsafe — idle means something's wrong", band: 2, dimension: "body", loops: ["PRD001"] },
      { id: "guilty", label: "Guilty but possible", band: 4, dimension: "body", loops: ["PRD015"] },
      { id: "rare", label: "Rare — I protect it when I can", band: 6, dimension: "body" },
      { id: "home", label: "Home — where the real work happens", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s08_body_a", sessionId: "work_worth", role: "body", kind: "scale",
    title: "How present is your body while you work?",
    minLabel: "Gone — I live above the neck", maxLabel: "It's with me, breath and all",
    lowBand: 2, highBand: 9, dimension: "body", loops: ["BOD011", "BOD001"],
  },
  {
    id: "s08_mirror_a", sessionId: "work_worth", role: "mirror", kind: "text",
    title: "The task I'm avoiding is actually avoiding a feeling, and the feeling is",
    placeholder: "Name the feeling, not the task.",
    maxLength: 80,
    dimension: "emotion", bandHint: 3, loops: ["AVD001"],
  },
  {
    id: "s08_mirror_b", sessionId: "work_worth", role: "mirror", kind: "choice",
    title: "If your output stopped being visible to everyone tomorrow, would you still do it?",
    options: [
      { id: "no", label: "No — visibility is most of the point", band: 2, dimension: "emotion", loops: ["VAL003"] },
      { id: "struggle", label: "I'd struggle, then find my way back", band: 5, dimension: "emotion" },
      { id: "yes", label: "Yes — the work is its own fuel", band: 8, dimension: "awareness" },
      { id: "already", label: "It already is — that's why I do it", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s08_choice_a", sessionId: "work_worth", role: "choice", kind: "choice",
    title: "The unearned rest you'll take tomorrow:",
    options: [
      { id: "fifteen", label: "Fifteen minutes, no justification", band: 6, dimension: "body" },
      { id: "one_thing", label: "One task left undone, on purpose", band: 7, dimension: "thought", loops: ["PRD003"] },
      { id: "phone", label: "Evening without the second shift", band: 6, dimension: "body", loops: ["BHV002"] },
      { id: "all", label: "A full stop — a day off the treadmill", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s08_body_b", sessionId: "work_worth", role: "body", kind: "choice",
    title: "At the end of a work day, the body is:",
    options: [
      { id: "wired", label: "Wired — tired but still buzzing", band: 2, dimension: "body", loops: ["ENR001"] },
      { id: "flat", label: "Flat — nothing left, nothing wanted", band: 2, dimension: "body", loops: ["ENR001", "BOD010"] },
      { id: "carryover", label: "Carrying tomorrow's tension already", band: 3, dimension: "body", loops: ["BOD001"] },
      { id: "done", label: "Done — work ended, body knows it", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s08_choice_b", sessionId: "work_worth", role: "choice", kind: "choice",
    title: "The question you'll carry into tomorrow's work is:",
    options: [
      { id: "avoiding", label: "What am I avoiding with all this doing?", band: 6, dimension: "emotion" },
      { id: "whose", label: "Whose ambition is this, actually?", band: 7, dimension: "emotion" },
      { id: "enough", label: "What would 'enough done' feel like today?", band: 6, dimension: "body" },
      { id: "who", label: "Who is working, right now, as I read this?", band: 9, dimension: "awareness" },
    ],
  },

  // ═══ 9. TIME AND DEATH ════════════════════════════════════════════
  {
    id: "s09_open_a", sessionId: "time_death", role: "open", kind: "choice",
    title: "How often does the fact of your own death enter your awareness?",
    subtitle: "Not the fear. The fact.",
    options: [
      { id: "never", label: "Never — I keep it far away", band: 3, dimension: "thought" },
      { id: "crisis", label: "In crises, or at 3am", band: 4, dimension: "emotion" },
      { id: "sometimes", label: "Sometimes — and it clarifies things", band: 6, dimension: "emotion" },
      { id: "daily", label: "It's part of how I see — daily, quietly", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s09_open_b", sessionId: "time_death", role: "open", kind: "choice",
    title: "Your relationship with time is mostly:",
    options: [
      { id: "threat", label: "A threat — never enough, always late", band: 2, dimension: "body", loops: ["BLF015"] },
      { id: "resource", label: "A resource — to optimize", band: 3, dimension: "thought", loops: ["PRD001"] },
      { id: "flow", label: "A flow I mostly move with", band: 7, dimension: "body" },
      { id: "now", label: "Mostly now — the rest is a story", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s09_deepen_a", sessionId: "time_death", role: "deepen", kind: "choice",
    title: "What would you stop doing if this were your last year?",
    options: [
      { id: "dontknow", label: "I've never let myself answer", band: 3, dimension: "thought" },
      { id: "small", label: "The small stuff — honestly, not much changes", band: 4, dimension: "emotion" },
      { id: "work", label: "The work that isn't mine", band: 5, dimension: "emotion" },
      { id: "already", label: "I'm already living close to that answer", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s09_deepen_b", sessionId: "time_death", role: "deepen", kind: "choice",
    title: "The regret you carry is mostly about:",
    options: [
      { id: "unlived", label: "A life I didn't live", band: 3, dimension: "emotion", loops: ["MEN015"] },
      { id: "unsaid", label: "Words I didn't say to someone", band: 4, dimension: "emotion" },
      { id: "unnamed", label: "Time given to things that didn't matter", band: 4, dimension: "emotion" },
      { id: "none", label: "Nothing I'd call regret anymore", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s09_body_a", sessionId: "time_death", role: "body", kind: "scale",
    title: "Can your body hold the fact of ending without the story of panic?",
    minLabel: "The body floods immediately", maxLabel: "The body can be with it, steadily",
    lowBand: 2, highBand: 9, dimension: "body", loops: ["SRV001", "BOD005"],
  },
  {
    id: "s09_mirror_a", sessionId: "time_death", role: "mirror", kind: "text",
    title: "If this life were a sentence, the unfinished clause I most need to finish is",
    placeholder: "The honesty of this one matters more than its beauty.",
    maxLength: 100,
    dimension: "emotion", bandHint: 4, loops: ["MEN015"],
  },
  {
    id: "s09_mirror_b", sessionId: "time_death", role: "mirror", kind: "choice",
    title: "One year left. The first thing you'd tell the people you love is:",
    options: [
      { id: "dontknow", label: "I don't know — that itself is the answer", band: 4, dimension: "emotion" },
      { id: "sorry", label: "The apology I've been postponing", band: 4, dimension: "emotion", loops: ["EMO002"] },
      { id: "truth", label: "The truth I've been managing", band: 5, dimension: "emotion" },
      { id: "love", label: "I love you. Just that. All day.", band: 9, dimension: "emotion" },
    ],
  },
  {
    id: "s09_choice_a", sessionId: "time_death", role: "choice", kind: "choice",
    title: "The filter you'll run tomorrow:",
    options: [
      { id: "lastyear", label: "Last-year filter on the day's tasks", band: 5, dimension: "thought" },
      { id: "one_person", label: "One message to someone who matters", band: 6, dimension: "emotion" },
      { id: "small_death", label: "One small death — end something cleanly", band: 7, dimension: "emotion" },
      { id: "all", label: "All of them — this sitting changed something", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s09_body_b", sessionId: "time_death", role: "body", kind: "choice",
    title: "When your own ending is held in awareness, the body:",
    options: [
      { id: "floods", label: "Floods — panic, cold, racing", band: 2, dimension: "body", loops: ["SRV001", "BOD005"] },
      { id: "escapes", label: "Escapes — I jump to a task", band: 3, dimension: "body", loops: ["AVD001", "PRD001"] },
      { id: "heavy", label: "Goes heavy — sad, slow, honest", band: 5, dimension: "body" },
      { id: "steady", label: "Stays steady — it can be with it", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s09_choice_b", sessionId: "time_death", role: "choice", kind: "choice",
    title: "The thing you'd stop, if this were the last year, is:",
    options: [
      { id: "scrolling", label: "The scrolling — all of it", band: 5, dimension: "body", loops: ["HAB001"] },
      { id: "performing", label: "The performance of being fine", band: 6, dimension: "emotion" },
      { id: "waiting", label: "The waiting — for the right moment", band: 6, dimension: "emotion", loops: ["MOT011"] },
      { id: "nothing", label: "Nothing — I'd live closer to how I am now", band: 9, dimension: "awareness" },
    ],
  },

  // ═══ 10. THE CONDITIONED HEART ════════════════════════════════════
  {
    id: "s10_open_a", sessionId: "conditioned_heart", role: "open", kind: "choice",
    title: "What did you decide, long ago, was unsafe to feel?",
    subtitle: "The first honest answer is usually the right one.",
    options: [
      { id: "anger", label: "Anger — it wasn't allowed", band: 3, dimension: "emotion", loops: ["SRV002", "EMO001"] },
      { id: "need", label: "Needing anyone — it cost too much", band: 3, dimension: "emotion", loops: ["BLF012", "AVD001"] },
      { id: "grief", label: "Grief — it would never end", band: 3, dimension: "emotion", loops: ["EMO001"] },
      { id: "nothing", label: "Nothing — I can feel all of it now", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s10_open_b", sessionId: "conditioned_heart", role: "open", kind: "choice",
    title: "When a strong feeling arrives now, what happens first?",
    options: [
      { id: "numb", label: "I go numb — it just shuts off", band: 2, dimension: "body", loops: ["AVD001", "SRV303"] },
      { id: "story", label: "I turn it into a story and analyze it", band: 3, dimension: "thought", loops: ["CTL003"] },
      { id: "act", label: "I act on it — quickly, to discharge it", band: 3, dimension: "body", loops: ["EMO001"] },
      { id: "feel", label: "I feel it — right here, as sensation", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s10_deepen_a", sessionId: "conditioned_heart", role: "deepen", kind: "choice",
    title: "What did the numbing cost you, looking back?",
    subtitle: "The bill arrives for the whole mechanism, not one feeling.",
    options: [
      { id: "everything", label: "Everything — the joy went too", band: 3, dimension: "emotion", loops: ["EMO003"] },
      { id: "some", label: "Some — the highs got quieter", band: 4, dimension: "emotion" },
      { id: "learning", label: "I'm letting feeling back, slowly", band: 7, dimension: "body" },
      { id: "none", label: "Nothing — it's fully thawed", band: 10, dimension: "body" },
    ],
  },
  {
    id: "s10_deepen_b", sessionId: "conditioned_heart", role: "deepen", kind: "choice",
    title: "The feeling you'd most like to feel again is:",
    options: [
      { id: "wonder", label: "Wonder — unfiltered, childlike", band: 4, dimension: "emotion" },
      { id: "desire", label: "Desire — for life, for a body, for more", band: 4, dimension: "body" },
      { id: "grief", label: "Clean grief — not managed, just felt", band: 5, dimension: "emotion" },
      { id: "all", label: "All of them — I'm not choosing anymore", band: 9, dimension: "emotion" },
    ],
  },
  {
    id: "s10_body_a", sessionId: "conditioned_heart", role: "body", kind: "scale",
    title: "How much of your emotional life can you feel as body sensation?",
    minLabel: "It's all in the head, labelled late", maxLabel: "It arrives as sensation first",
    lowBand: 2, highBand: 9, dimension: "body", loops: ["BOD011"],
  },
  {
    id: "s10_mirror_a", sessionId: "conditioned_heart", role: "mirror", kind: "text",
    title: "The feeling I've been calling 'fine' — and what it actually is — is",
    placeholder: "'Fine' is the mask. Take it off here.",
    maxLength: 90,
    dimension: "emotion", bandHint: 3, loops: ["AVD001", "EMO015"],
  },
  {
    id: "s10_mirror_b", sessionId: "conditioned_heart", role: "mirror", kind: "choice",
    title: "If your heart were allowed one thing tomorrow, it would ask for:",
    options: [
      { id: "rest", label: "Rest — to stop performing fine", band: 4, dimension: "body" },
      { id: "truth", label: "To say the true thing to one person", band: 5, dimension: "emotion" },
      { id: "grief", label: "To cry about something real", band: 6, dimension: "emotion" },
      { id: "nothing", label: "Nothing — it is already allowed", band: 10, dimension: "body" },
    ],
  },
  {
    id: "s10_choice_a", sessionId: "conditioned_heart", role: "choice", kind: "choice",
    title: "The thawing you'll attempt tomorrow:",
    options: [
      { id: "name", label: "Name one feeling precisely", band: 5, dimension: "emotion" },
      { id: "music", label: "One song that used to move me, fully", band: 6, dimension: "body" },
      { id: "hand", label: "Hand on heart, three breaths, no task", band: 7, dimension: "body" },
      { id: "all", label: "All of them — I want the thaw", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s10_body_b", sessionId: "conditioned_heart", role: "body", kind: "choice",
    title: "The feeling you avoid most lives in the body as:",
    options: [
      { id: "throat", label: "The throat — words that won't come", band: 3, dimension: "body" },
      { id: "chest", label: "The chest — held, not breathed", band: 3, dimension: "body", loops: ["BOD001"] },
      { id: "stomach", label: "The stomach — swallowed whole", band: 3, dimension: "body" },
      { id: "named", label: "I can name it as pure sensation now", band: 9, dimension: "body" },
    ],
  },
  {
    id: "s10_choice_b", sessionId: "conditioned_heart", role: "choice", kind: "choice",
    title: "The first feeling you'd make room for again is:",
    options: [
      { id: "anger", label: "Anger — clean, without damage", band: 5, dimension: "emotion", loops: ["SRV002"] },
      { id: "grief", label: "Grief — the one I postponed", band: 6, dimension: "emotion" },
      { id: "tenderness", label: "Tenderness — toward myself first", band: 7, dimension: "emotion" },
      { id: "all", label: "Whatever comes — none refused", band: 10, dimension: "body" },
    ],
  },

  // ═══ 11. WHO IS ASKING? ═══════════════════════════════════════════
  {
    id: "s11_open_a", sessionId: "who_is_asking", role: "open", kind: "choice",
    title: "After ten sittings of looking at the mind — what do you notice about the one who has been looking?",
    options: [
      { id: "tired", label: "They're tired — of looking, of everything", band: 4, dimension: "emotion" },
      { id: "curious", label: "They're curious — genuinely, for the first time", band: 6, dimension: "emotion" },
      { id: "quiet", label: "They're quieter than when we started", band: 8, dimension: "awareness" },
      { id: "absent", label: "There's less 'they' here than before", band: 10, dimension: "awareness" },
    ],
  },
  {
    id: "s11_open_b", sessionId: "who_is_asking", role: "open", kind: "choice",
    title: "When you ask 'who am I?', the mind answers with:",
    options: [
      { id: "resists", label: "Resistance — the question itself is uncomfortable", band: 3, dimension: "emotion" },
      { id: "biography", label: "The biography, automatically", band: 4, dimension: "thought" },
      { id: "emptiness", label: "A blank, then something under it", band: 7, dimension: "awareness" },
      { id: "nothing", label: "Less and less — the answer runs out", band: 10, dimension: "awareness" },
    ],
  },
  {
    id: "s11_deepen_a", sessionId: "who_is_asking", role: "deepen", kind: "choice",
    title: "Has the witness ever changed?",
    subtitle: "The one who watched every mood, every year, every heartbreak.",
    options: [
      { id: "dontknow", label: "I've never looked this directly", band: 4, dimension: "thought" },
      { id: "maybe", label: "It feels unchanged — same watcher, new scenes", band: 6, dimension: "awareness" },
      { id: "yes", label: "Yes — it's the only thing that hasn't", band: 8, dimension: "awareness" },
      { id: "beyond", label: "The question itself dissolves now", band: 10, dimension: "awareness" },
    ],
  },
  {
    id: "s11_deepen_b", sessionId: "who_is_asking", role: "deepen", kind: "choice",
    title: "In stillness, what does the mind do when nobody is asking it anything?",
    options: [
      { id: "panic", label: "Panics — fills the space immediately", band: 3, dimension: "thought", loops: ["CTL003"] },
      { id: "drifts", label: "Drifts — plans, replays, fantasizes", band: 5, dimension: "thought", loops: ["MEN001"] },
      { id: "settles", label: "Settles — thin, then thinner", band: 8, dimension: "awareness" },
      { id: "still", label: "It goes still, and I don't disappear", band: 10, dimension: "awareness" },
    ],
  },
  {
    id: "s11_body_a", sessionId: "who_is_asking", role: "body", kind: "scale",
    title: "Can the body sit with 'I don't know who I am' without flinching?",
    minLabel: "It flinches — it needs the story", maxLabel: "It rests in not-knowing",
    lowBand: 3, highBand: 10, dimension: "body", loops: ["SRV001"],
  },
  {
    id: "s11_mirror_a", sessionId: "who_is_asking", role: "mirror", kind: "text",
    title: "What remains when the answer to 'who am I?' has been exhausted?",
    placeholder: "Whatever words come — or write 'no words', if that's true.",
    maxLength: 120,
    dimension: "awareness", bandHint: 6,
  },
  {
    id: "s11_mirror_b", sessionId: "who_is_asking", role: "mirror", kind: "choice",
    title: "Eleven sittings in, the one thing you know now that you didn't know before is:",
    options: [
      { id: "nothing", label: "I know less — and it's lighter", band: 7, dimension: "awareness" },
      { id: "watching", label: "That watching changes the thing watched", band: 8, dimension: "awareness" },
      { id: "seeker", label: "That the seeker was the sought", band: 9, dimension: "awareness" },
      { id: "done", label: "That no words come — and none are needed", band: 10, dimension: "awareness" },
    ],
  },
  {
    id: "s11_choice_a", sessionId: "who_is_asking", role: "choice", kind: "choice",
    title: "The door you want to walk through next is:",
    options: [
      { id: "deeper", label: "Deeper into this — the inquiry isn't done", band: 8, dimension: "awareness" },
      { id: "body", label: "Back through the body — I've lived in my head", band: 5, dimension: "body" },
      { id: "life", label: "Into ordinary life — this was never about escaping it", band: 8, dimension: "emotion" },
      { id: "trust", label: "I trust wherever the next sitting points", band: 9, dimension: "awareness" },
    ],
  },
  {
    id: "s11_choice_b", sessionId: "who_is_asking", role: "choice", kind: "choice",
    title: "The question you'd ask if you could ask only one, ever again, is:",
    options: [
      { id: "who", label: "Who am I?", band: 9, dimension: "awareness" },
      { id: "what", label: "What is this — this experience, right now?", band: 8, dimension: "awareness" },
      { id: "how", label: "How do I love — truly, finally?", band: 7, dimension: "emotion" },
      { id: "none", label: "None. The questions have done their work.", band: 10, dimension: "awareness" },
    ],
  },
  {
    id: "s11_body_b", sessionId: "who_is_asking", role: "body", kind: "choice",
    title: "When the question 'who am I?' is held, the body:",
    options: [
      { id: "resists", label: "Resists — restlessness, escape plans", band: 4, dimension: "body", loops: ["BOD009"] },
      { id: "waits", label: "Waits — alert, uncertain, open", band: 6, dimension: "body" },
      { id: "stills", label: "Stills — breath slows on its own", band: 9, dimension: "body" },
      { id: "absent", label: "Disappears into the question itself", band: 10, dimension: "body" },
    ],
  },
];

export const FIRST_ELEVEN_QUESTIONS_BY_SESSION = (sessionId: string): SEQuestion[] =>
  FIRST_ELEVEN_QUESTIONS.filter((q) => q.sessionId === sessionId);

export const FIRST_ELEVEN_QUESTION_COUNT = FIRST_ELEVEN_QUESTIONS.length;
