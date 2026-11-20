const a=`/**\r
 * Local Loop & Source Detection Engine\r
 * Keyword-based pattern matching against the 400+ loop library.\r
 * Runs client-side — ZERO AI cost, ZERO latency.\r
 * Returns confidence scores; if too low/ambiguous, caller can fall back to AI.\r
 */\r
\r
import type { DetectedLoop, DetectedSource } from "@/hooks/useLiveDetection";\r
\r
// ─── LOOP KEYWORD MAP ──────────────────────────────────────────────\r
// Each entry: [loopId, loopName, keywords[], category]\r
// Keywords are lowercase phrases/words that strongly signal the pattern.\r
\r
interface LoopEntry {\r
  id: string;\r
  name: string;\r
  keywords: string[];\r
  phrases: string[]; // longer phrases = higher confidence\r
}\r
\r
const LOOP_ENTRIES: LoopEntry[] = [\r
  // VALIDATION\r
  { id: "VAL001", name: "People-Pleasing", keywords: ["please", "approve", "everyone happy", "saying no", "disappoint", "upset them", "make them happy"], phrases: ["i don't want to upset", "i can't say no", "what will they think", "i need them to like me", "i always put others first"] },\r
  { id: "VAL002", name: "Perfectionism", keywords: ["perfect", "flawless", "mistake", "not good enough", "imperfect", "standards"], phrases: ["it has to be perfect", "i can't make mistakes", "not good enough", "my standards are", "if it's not perfect"] },\r
  { id: "VAL003", name: "External Validation Addiction", keywords: ["validate", "recognition", "noticed", "appreciated", "acknowledge", "likes", "followers"], phrases: ["nobody notices", "need recognition", "want to be seen", "need appreciation", "want acknowledgment"] },\r
  { id: "VAL004", name: "Achievement Treadmill", keywords: ["achieve", "accomplish", "next goal", "never enough", "keep pushing", "milestone"], phrases: ["never feel satisfied", "always chasing", "need to achieve more", "what's the point of achieving"] },\r
  { id: "VAL008", name: "Productivity Guilt", keywords: ["unproductive", "wasting time", "lazy", "should be doing", "guilty for resting"], phrases: ["i feel guilty when i rest", "i should be productive", "wasting my time", "i'm being lazy"] },\r
  { id: "VAL009", name: "Spiritual Bypassing", keywords: ["everything happens for a reason", "just let go", "stay positive", "it's all divine"], phrases: ["it's all part of the plan", "i should just accept", "good vibes only", "i've transcended that"] },\r
  { id: "VAL014", name: "Loyalty Testing", keywords: ["test", "loyalty", "prove", "loyal", "betray"], phrases: ["testing if they care", "prove their loyalty", "will they stay"] },\r
  { id: "VAL025", name: "Comparison Shopping", keywords: ["compare", "better than", "worse than", "ahead of me", "behind"], phrases: ["everyone is ahead", "compared to them", "they're better", "i'm falling behind"] },\r
  { id: "VAL026", name: "Apology Reflex", keywords: ["sorry", "apologize", "my fault", "i'm sorry"], phrases: ["i keep apologizing", "sorry for everything", "always say sorry"] },\r
  { id: "VAL028", name: "Identity Through Suffering", keywords: ["suffering", "pain defines", "struggle", "been through a lot"], phrases: ["my pain defines me", "i've suffered so much", "struggle is who i am"] },\r
  { id: "VAL031", name: "Reassurance Seeking", keywords: ["reassure", "sure", "right thing", "confirm", "okay"], phrases: ["am i doing the right thing", "tell me it's okay", "i need to know", "is this normal"] },\r
  { id: "VAL035", name: "Overgiving", keywords: ["give too much", "always giving", "sacrifice", "selfless"], phrases: ["i give and give", "always putting others first", "sacrificing myself"] },\r
  { id: "VAL036", name: "Productivity Identity", keywords: ["productive", "worth", "doing enough", "busy"], phrases: ["my worth is in what i produce", "i am what i do", "if i'm not productive"] },\r
  { id: "VAL040", name: "Empathy Overwhelm", keywords: ["feel everything", "absorb", "other people's emotions", "too sensitive"], phrases: ["i feel everyone's pain", "too sensitive", "absorbing their energy"] },\r
  { id: "VAL042", name: "Woundedness Identity", keywords: ["broken", "damaged", "wounded", "trauma defines"], phrases: ["i'm broken", "too damaged", "my trauma defines me"] },\r
\r
  // CONTROL\r
  { id: "CTL001", name: "Micromanaging", keywords: ["control", "manage", "can't delegate", "my way", "trust others"], phrases: ["i need to control", "can't trust anyone", "do it myself", "no one does it right"] },\r
  { id: "CTL002", name: "Catastrophizing", keywords: ["worst case", "disaster", "terrible", "everything will fail", "ruin"], phrases: ["everything will go wrong", "it's going to be a disaster", "what if everything falls apart"] },\r
  { id: "CTL003", name: "Overthinking", keywords: ["overthink", "think too much", "can't stop thinking", "spiral", "head won't stop"], phrases: ["i can't stop thinking", "my mind won't shut up", "overthinking everything", "going in circles"] },\r
\r
  // AVOIDANCE\r
  { id: "AVD001", name: "Emotional Avoidance", keywords: ["avoid", "don't want to feel", "push down", "numb", "ignore feelings"], phrases: ["i don't want to feel", "pushing it down", "rather not think about it", "i'll deal with it later"] },\r
  { id: "AVD002", name: "Procrastination", keywords: ["procrastinate", "put off", "later", "delay", "tomorrow"], phrases: ["i'll do it tomorrow", "keep putting it off", "can't start", "always delaying"] },\r
  { id: "AVD003", name: "Deflection", keywords: ["deflect", "change subject", "avoid topic", "joke about it"], phrases: ["let's not talk about", "it's not a big deal", "changing the subject"] },\r
\r
  // SURVIVAL\r
  { id: "SRV001", name: "Hypervigilance", keywords: ["alert", "danger", "watch out", "on guard", "threat", "safe"], phrases: ["always on guard", "can't relax", "watching for danger", "something bad will happen"] },\r
  { id: "SRV002", name: "Fight Response", keywords: ["angry", "fight", "attack", "defend", "aggressive", "rage"], phrases: ["i want to fight", "ready to attack", "so angry", "defensive"] },\r
  { id: "SRV303", name: "Freeze Response", keywords: ["freeze", "stuck", "paralyzed", "can't move", "shutdown", "frozen"], phrases: ["i'm frozen", "can't move", "completely stuck", "shutting down", "i just freeze"] },\r
\r
  // BODY\r
  { id: "BOD001", name: "Tension Hoarding", keywords: ["tension", "tight", "tense", "shoulders", "neck"], phrases: ["holding tension", "body is tense", "shoulders are tight"] },\r
  { id: "BOD005", name: "Somatic Anxiety", keywords: ["stomach", "heart racing", "sweating", "shaking", "chest tight"], phrases: ["my heart is racing", "stomach is churning", "chest feels tight", "can't breathe"] },\r
  { id: "BOD009", name: "Restless Body", keywords: ["restless", "fidget", "can't sit still", "agitated"], phrases: ["can't sit still", "body is restless", "need to move"] },\r
  { id: "BOD010", name: "Chronic Fatigue Pattern", keywords: ["exhausted", "tired", "fatigue", "no energy", "drained"], phrases: ["always tired", "no energy left", "completely drained", "exhausted all the time"] },\r
  { id: "BOD011", name: "Body Disconnection", keywords: ["disconnected", "numb body", "don't feel my body", "out of body"], phrases: ["disconnected from my body", "can't feel anything", "floating above"] },\r
\r
  // ENERGY\r
  { id: "ENR001", name: "Burnout Cycle", keywords: ["burnout", "burned out", "exhausted", "can't keep going"], phrases: ["i'm burned out", "running on empty", "can't keep going like this"] },\r
  { id: "ENR003", name: "Depletion-Caffeine Loop", keywords: ["coffee", "caffeine", "energy drink", "need coffee"], phrases: ["need more coffee", "can't function without caffeine"] },\r
\r
  // EMOTIONAL\r
  { id: "EMO001", name: "Emotional Flooding", keywords: ["overwhelmed", "too much", "flooded", "can't handle", "drowning"], phrases: ["completely overwhelmed", "too many emotions", "drowning in feelings", "can't handle this"] },\r
  { id: "EMO002", name: "Guilt Recycling", keywords: ["guilty", "guilt", "should have", "my fault"], phrases: ["i feel so guilty", "it's all my fault", "should have done differently", "can't forgive myself"] },\r
  { id: "EMO003", name: "Joy Sabotage", keywords: ["too good", "don't deserve", "waiting for bad", "happy but scared"], phrases: ["too good to be true", "something bad will happen", "don't deserve this happiness"] },\r
  { id: "EMO005", name: "Shame Spiral", keywords: ["shame", "ashamed", "embarrassed", "humiliated", "worthless"], phrases: ["so ashamed", "i'm worthless", "want to disappear", "feel so small"] },\r
  { id: "EMO008", name: "Jealousy Poison", keywords: ["jealous", "envy", "unfair", "why them", "they have"], phrases: ["why do they have", "it's not fair", "so jealous", "they don't deserve it"] },\r
  { id: "EMO009", name: "Anxiety-About-Anxiety", keywords: ["anxious about being anxious", "worry about worrying", "meta anxiety"], phrases: ["anxious about being anxious", "worried about my anxiety", "anxiety about anxiety"] },\r
  { id: "EMO010", name: "Loneliness Loop", keywords: ["lonely", "alone", "no one", "isolated", "nobody cares"], phrases: ["so lonely", "nobody understands", "all alone", "no one cares"] },\r
  { id: "EMO015", name: "Toxic Positivity Loop", keywords: ["stay positive", "good vibes", "don't be negative", "be grateful"], phrases: ["just be positive", "good vibes only", "shouldn't feel this way"] },\r
\r
  // MENTAL\r
  { id: "MEN001", name: "Rumination Spiral", keywords: ["ruminate", "keep thinking", "can't let go", "replay", "over and over"], phrases: ["keep replaying", "can't stop thinking about", "going over and over", "stuck in my head"] },\r
  { id: "MEN002", name: "Future Catastrophizing", keywords: ["what if", "future", "worried about", "might happen", "dread"], phrases: ["what if it goes wrong", "worried about the future", "something terrible might", "dreading tomorrow"] },\r
  { id: "MEN003", name: "Analysis Paralysis", keywords: ["analyze", "can't decide", "too many options", "weighing", "stuck deciding"], phrases: ["can't make a decision", "analyzing too much", "too many options", "going back and forth"] },\r
  { id: "MEN006", name: "Inner Monologue Tyranny", keywords: ["inner critic", "voice in my head", "telling myself", "self-talk"], phrases: ["voice in my head says", "keep telling myself", "inner critic won't stop"] },\r
  { id: "MEN008", name: "Black-and-White Thinking", keywords: ["always", "never", "everything", "nothing", "all or nothing"], phrases: ["it's always like this", "nothing ever works", "everything is terrible", "i never get it right"] },\r
  { id: "MEN012", name: "Should Tyranny", keywords: ["should", "must", "have to", "supposed to", "ought to"], phrases: ["i should be", "i must do", "i'm supposed to", "i have to"] },\r
  { id: "MEN014", name: "Imposter Syndrome", keywords: ["imposter", "fraud", "found out", "don't belong", "faking"], phrases: ["they'll find out", "i'm a fraud", "don't belong here", "faking it"] },\r
  { id: "MEN015", name: "Regret Loop", keywords: ["regret", "wish i had", "if only", "should have"], phrases: ["i regret", "wish i had done", "if only i had", "should have known"] },\r
\r
  // BEHAVIORAL\r
  { id: "BHV001", name: "Procrastination Cycle", keywords: ["procrastinate", "avoiding", "delay", "distract", "put off"], phrases: ["keep avoiding", "can't get started", "distracting myself"] },\r
  { id: "BHV002", name: "Revenge Bedtime Procrastination", keywords: ["stay up late", "can't sleep", "scrolling at night", "bedtime"], phrases: ["staying up too late", "can't put phone down at night", "revenge bedtime"] },\r
  { id: "BHV005", name: "Conflict Avoidance Dance", keywords: ["avoid conflict", "confrontation", "argument", "keep peace"], phrases: ["avoid confrontation", "don't want to argue", "keeping the peace", "scared of conflict"] },\r
  { id: "BHV007", name: "Social Media Reflex", keywords: ["social media", "scrolling", "instagram", "twitter", "phone", "notifications"], phrases: ["keep checking my phone", "scrolling endlessly", "addicted to social media"] },\r
  { id: "BHV012", name: "Comfort Zone Fortress", keywords: ["comfort zone", "safe", "risk", "try new things", "scared to"], phrases: ["scared to try", "staying in my comfort zone", "afraid of change"] },\r
\r
  // HABIT\r
  { id: "HAB001", name: "Doom Scrolling", keywords: ["doom scroll", "scrolling", "news", "bad news", "can't stop reading"], phrases: ["doom scrolling", "can't stop scrolling", "reading bad news"] },\r
  { id: "HAB002", name: "Comfort Eating", keywords: ["eat feelings", "comfort food", "emotional eating", "stress eat"], phrases: ["eating my feelings", "stress eating", "reaching for food when"] },\r
  { id: "HAB008", name: "Screen Before Sleep", keywords: ["screen", "phone in bed", "blue light", "can't sleep"], phrases: ["looking at phone in bed", "screen before sleep"] },\r
\r
  // SOCIAL\r
  { id: "SOC001", name: "Social Chameleon", keywords: ["different person", "change myself", "fit in", "adapt", "mask"], phrases: ["become a different person", "change who i am", "wearing a mask", "adapting to fit in"] },\r
  { id: "SOC002", name: "Social Anxiety Avoidance", keywords: ["social anxiety", "avoid people", "gathering", "party", "crowd"], phrases: ["avoid social situations", "scared of people", "don't want to go out"] },\r
  { id: "SOC005", name: "FOMO Loop", keywords: ["fomo", "missing out", "everyone else", "left out", "excluded"], phrases: ["fear of missing out", "everyone else is", "feeling left out"] },\r
\r
  // RELATIONSHIP\r
  { id: "REL001", name: "Pursuer-Distancer", keywords: ["chase", "pull away", "pursue", "distance", "closer they run"], phrases: ["the more i chase", "they pull away", "when i pull back they come closer"] },\r
  { id: "REL004", name: "Codependency Loop", keywords: ["codependent", "need them", "can't be alone", "depend on", "without them"], phrases: ["can't function without them", "need them to be okay", "lost without them"] },\r
  { id: "REL006", name: "Trust Testing", keywords: ["trust", "test them", "prove love", "will they stay"], phrases: ["testing if they love me", "pushing them to see if they stay"] },\r
  { id: "REL009", name: "Boundary Collapse", keywords: ["boundary", "boundaries", "say no", "limits", "invaded"], phrases: ["can't set boundaries", "my boundaries keep getting", "let people walk over me"] },\r
  { id: "REL014", name: "Anxious Attachment Spiral", keywords: ["attached", "clingy", "text back", "abandoned", "left"], phrases: ["why aren't they texting", "feel abandoned", "too clingy", "scared they'll leave"] },\r
  { id: "REL015", name: "Avoidant Escape", keywords: ["pull away", "need space", "too close", "suffocated"], phrases: ["need space", "feeling suffocated", "getting too close", "want to run"] },\r
\r
  // IDENTITY\r
  { id: "IDN001", name: "Fixed Identity Lock", keywords: ["that's just who i am", "i've always been", "can't change", "this is me"], phrases: ["that's just who i am", "i've always been this way", "i can't change"] },\r
  { id: "IDN005", name: "Strong Person Trap", keywords: ["strong", "can't be weak", "hold it together", "can't cry"], phrases: ["have to be strong", "can't show weakness", "holding it together"] },\r
  { id: "IDN010", name: "Victim Identity", keywords: ["victim", "always happens to me", "unfair", "powerless"], phrases: ["why does this always happen to me", "the world is against me", "i'm always the victim"] },\r
  { id: "IDN014", name: "Success Identity Trap", keywords: ["success defines", "failure means", "if i fail", "status"], phrases: ["my success defines me", "if i fail i'm nothing", "i am my achievements"] },\r
\r
  // EGO\r
  { id: "EGO002", name: "Need to Be Right", keywords: ["right", "wrong", "correct", "prove", "argue"], phrases: ["i know i'm right", "need to prove", "can't be wrong", "have to win this argument"] },\r
  { id: "EGO009", name: "Defensiveness Reflex", keywords: ["defensive", "attack", "criticism", "defend myself", "offended"], phrases: ["getting defensive", "can't handle criticism", "feeling attacked"] },\r
\r
  // BELIEF\r
  { id: "BLF001", name: "I'm Not Enough", keywords: ["not enough", "inadequate", "lacking", "insufficient"], phrases: ["i'm not enough", "never enough", "i'm inadequate", "not worthy"] },\r
  { id: "BLF003", name: "I Don't Deserve Love", keywords: ["don't deserve", "unlovable", "unworthy of love"], phrases: ["don't deserve love", "i'm unlovable", "no one could love me"] },\r
  { id: "BLF005", name: "I Must Earn Rest", keywords: ["earn rest", "deserve break", "lazy if i rest"], phrases: ["haven't earned rest", "don't deserve a break", "lazy if i stop"] },\r
  { id: "BLF006", name: "Vulnerability Is Weakness", keywords: ["vulnerable", "weak", "exposed", "guard up"], phrases: ["being vulnerable is weak", "can't let my guard down"] },\r
  { id: "BLF007", name: "People Always Leave", keywords: ["always leave", "abandoned", "left alone", "everyone leaves"], phrases: ["everyone leaves", "they'll leave eventually", "always end up alone"] },\r
  { id: "BLF012", name: "Asking Is Burdening", keywords: ["burden", "bother", "ask for help", "bothering"], phrases: ["don't want to be a burden", "can't ask for help", "bothering them"] },\r
  { id: "BLF015", name: "Time Is Running Out", keywords: ["running out of time", "too late", "behind schedule", "wasted years"], phrases: ["time is running out", "it's too late", "wasted so many years"] },\r
\r
  // PURPOSE\r
  { id: "PUR001", name: "Purpose Paralysis", keywords: ["purpose", "meaning", "what's the point", "meaningless", "why am i"], phrases: ["what's my purpose", "life feels meaningless", "why am i here"] },\r
  { id: "PUR005", name: "Existential Dread Loop", keywords: ["existential", "existence", "pointless", "nothing matters", "void"], phrases: ["nothing matters", "what's the point", "existential crisis", "meaningless existence"] },\r
\r
  // SPIRITUAL\r
  { id: "SPR001", name: "Awakening Addiction", keywords: ["awakening", "enlightenment", "peak experience", "bliss"], phrases: ["chasing awakening", "need that bliss again", "want another peak experience"] },\r
  { id: "SPR005", name: "Guru Dependency", keywords: ["guru", "teacher", "master", "need guidance", "can't do it alone"], phrases: ["need my teacher to tell me", "waiting for the guru", "can't progress without guidance"] },\r
\r
  // PRODUCTIVITY\r
  { id: "PRD001", name: "Busy-ness Addiction", keywords: ["busy", "so much to do", "never stop", "always doing"], phrases: ["always busy", "can't stop doing", "need to stay busy", "being idle scares me"] },\r
  { id: "PRD003", name: "Productive Procrastination", keywords: ["organize", "prepare", "planning instead", "rearranging"], phrases: ["organizing instead of doing", "preparing to prepare", "planning but not acting"] },\r
  { id: "PRD015", name: "Rest Guilt Loop", keywords: ["guilt resting", "should be working", "waste of time"], phrases: ["feel guilty for resting", "should be working instead", "resting feels wrong"] },\r
\r
  // COGNITIVE BIAS\r
  { id: "COG003", name: "Negativity Bias", keywords: ["negative", "bad things", "focus on wrong", "ignore good"], phrases: ["only see the negative", "focus on what went wrong", "ignoring the good things"] },\r
  { id: "COG015", name: "Emotional Reasoning", keywords: ["feel it so it must be true", "feels true", "emotions = truth"], phrases: ["i feel it so it must be true", "feels like the truth"] },\r
\r
  // MOTIVATION\r
  { id: "MOT001", name: "Motivation-Dependent Action", keywords: ["not motivated", "no motivation", "don't feel like it", "waiting for motivation"], phrases: ["don't feel motivated", "waiting for motivation", "can't do it without motivation"] },\r
  { id: "MOT011", name: "Waiting for Perfect Conditions", keywords: ["perfect time", "right moment", "when things are", "conditions"], phrases: ["waiting for the right time", "when conditions are perfect", "not the right moment"] },\r
];\r
\r
// ─── SOURCE KEYWORD MAP ──────────────────────────────────────────────\r
\r
interface SourceKeywords {\r
  type: "mind" | "heart" | "gut" | "body" | "identity" | "fear" | "witness";\r
  keywords: string[];\r
  phrases: string[];\r
}\r
\r
const SOURCE_ENTRIES: SourceKeywords[] = [\r
  {\r
    type: "mind",\r
    keywords: ["think", "thought", "analyze", "logic", "reason", "understand", "figure out", "make sense", "rationalize", "plan", "strategy", "idea", "concept", "intellectually", "theoretically", "perspective", "argument", "explain", "consider", "evaluate"],\r
    phrases: ["i think that", "it makes sense", "logically speaking", "i've been thinking", "trying to figure out", "analyzing this", "my mind keeps", "can't stop thinking", "rationally i know"],\r
  },\r
  {\r
    type: "heart",\r
    keywords: ["feel", "emotion", "love", "grief", "sad", "happy", "joy", "hurt", "pain", "longing", "miss", "care", "compassion", "tender", "vulnerable", "cry", "tears", "touched", "moved", "warm"],\r
    phrases: ["i feel", "my heart", "it hurts", "i miss", "breaks my heart", "feeling so", "emotionally", "deeply touched", "it pains me", "with all my heart"],\r
  },\r
  {\r
    type: "gut",\r
    keywords: ["instinct", "impulse", "react", "urge", "gut feeling", "survival", "fight", "flee", "rage", "furious", "explosive", "snap", "trigger", "reflex", "visceral"],\r
    phrases: ["my gut tells", "something feels off", "i just reacted", "instinctively", "fight or flight", "visceral reaction", "an urge to", "gut feeling"],\r
  },\r
  {\r
    type: "body",\r
    keywords: ["body", "tension", "tight", "relax", "breathe", "physical", "sensation", "muscle", "stomach", "chest", "shoulder", "jaw", "fatigue", "energy", "tired", "exhausted", "restless", "nauseous", "shaking", "sweating", "heartbeat"],\r
    phrases: ["my body feels", "physically i", "tension in my", "can feel it in my", "body is telling", "somatic", "physical sensation", "my shoulders are"],\r
  },\r
  {\r
    type: "identity",\r
    keywords: ["i am", "i'm a", "that's me", "who i am", "my identity", "defines me", "i've always been", "that's just how", "type of person"],\r
    phrases: ["that's just who i am", "i've always been", "i'm the kind of", "as a person i", "my identity is", "i define myself", "this is me"],\r
  },\r
  {\r
    type: "fear",\r
    keywords: ["afraid", "scared", "fear", "worry", "anxious", "terrified", "dread", "panic", "nervous", "threat", "danger", "risk", "worst case"],\r
    phrases: ["i'm afraid", "i'm scared", "what if", "i worry", "i'm anxious", "terrified of", "dreading", "fills me with dread", "scared that"],\r
  },\r
  {\r
    type: "witness",\r
    keywords: ["observe", "notice", "aware", "watching", "seeing", "present", "conscious", "mindful", "witnessing", "detached", "space", "clarity", "stillness", "recognize"],\r
    phrases: ["i notice that", "i'm observing", "i can see", "watching myself", "part of me sees", "with awareness", "i'm present to", "stepping back i see", "i recognize that"],\r
  },\r
];\r
\r
// ─── DETECTION ENGINE ──────────────────────────────────────────────\r
\r
function normalizeText(text: string): string {\r
  return text.toLowerCase().replace(/['']/g, "'").replace(/[""]/g, '"').replace(/\\s+/g, " ").trim();\r
}\r
\r
function scoreLoop(entry: LoopEntry, text: string): { confidence: number; evidence: string } {\r
  const normalized = normalizeText(text);\r
  let score = 0;\r
  let bestEvidence = "";\r
  let bestEvidenceLen = 0;\r
\r
  // Check phrases (higher weight — 0.25 each, max contribute 0.75)\r
  for (const phrase of entry.phrases) {\r
    if (normalized.includes(phrase)) {\r
      score += 0.25;\r
      if (phrase.length > bestEvidenceLen) {\r
        bestEvidenceLen = phrase.length;\r
        // Extract surrounding context\r
        const idx = normalized.indexOf(phrase);\r
        const start = Math.max(0, idx - 20);\r
        const end = Math.min(text.length, idx + phrase.length + 20);\r
        bestEvidence = text.slice(start, end).trim();\r
      }\r
    }\r
  }\r
\r
  // Check keywords (lower weight — 0.1 each, max contribute 0.4)\r
  let kwMatches = 0;\r
  for (const kw of entry.keywords) {\r
    if (normalized.includes(kw)) {\r
      kwMatches++;\r
      if (!bestEvidence && kw.length > bestEvidenceLen) {\r
        bestEvidenceLen = kw.length;\r
        const idx = normalized.indexOf(kw);\r
        const start = Math.max(0, idx - 25);\r
        const end = Math.min(text.length, idx + kw.length + 25);\r
        bestEvidence = text.slice(start, end).trim();\r
      }\r
    }\r
  }\r
  score += Math.min(0.4, kwMatches * 0.1);\r
\r
  return { confidence: Math.min(0.95, score), evidence: bestEvidence };\r
}\r
\r
function scoreSource(entry: SourceKeywords, text: string): { strength: number; evidence: string } {\r
  const normalized = normalizeText(text);\r
  let score = 0;\r
  let bestEvidence = "";\r
\r
  for (const phrase of entry.phrases) {\r
    if (normalized.includes(phrase)) {\r
      score += 0.2;\r
      if (!bestEvidence) {\r
        const idx = normalized.indexOf(phrase);\r
        const start = Math.max(0, idx - 15);\r
        const end = Math.min(text.length, idx + phrase.length + 15);\r
        bestEvidence = text.slice(start, end).trim();\r
      }\r
    }\r
  }\r
\r
  let kwCount = 0;\r
  for (const kw of entry.keywords) {\r
    if (normalized.includes(kw)) kwCount++;\r
  }\r
  score += Math.min(0.4, kwCount * 0.08);\r
\r
  return { strength: Math.min(0.95, score), evidence: bestEvidence };\r
}\r
\r
// Why explanations for top categories\r
const LOOP_WHY: Record<string, string> = {\r
  VAL: "This validation-seeking pattern often stems from early experiences where love felt conditional on performance or pleasing others.",\r
  CTL: "Control patterns typically emerge when uncertainty feels threatening — the mind tries to manage what it fears it can't handle.",\r
  AVD: "Avoidance is a protective strategy that worked in the past but now keeps you from fully engaging with life.",\r
  SRV: "Survival responses are hardwired — your nervous system is activating ancient protective mechanisms.",\r
  BOD: "Your body is storing emotional energy that hasn't been fully processed or released.",\r
  ENR: "Energy depletion patterns reveal where your life force is being unconsciously drained.",\r
  EMO: "Emotional loops indicate feelings that are cycling without being fully felt or integrated.",\r
  MEN: "Mental loops show the mind trying to solve something that thinking alone cannot resolve.",\r
  BHV: "Behavioral patterns are automated responses — the body repeating what's been wired through repetition.",\r
  HAB: "Habits operate below conscious awareness — recognizing them is the first step to freedom.",\r
  SOC: "Social patterns reveal where your authentic self gets hidden behind protective social masks.",\r
  REL: "Relationship loops often mirror our earliest attachment experiences, repeating until seen clearly.",\r
  IDN: "Identity loops keep you locked into a fixed story about who you are, limiting your growth.",\r
  EGO: "Ego patterns protect a fragile self-image — they dissolve when observed with compassion.",\r
  BLF: "Core beliefs were formed early and feel like absolute truths, but they are learned interpretations.",\r
  COG: "Cognitive biases are mental shortcuts that distort reality — awareness alone begins to loosen them.",\r
  ATT: "Attention patterns determine what reality you inhabit — where attention goes, energy flows.",\r
  MOT: "Motivation loops reveal a misunderstanding about how action and energy actually work.",\r
  DEC: "Decision patterns expose the fear underneath — usually fear of loss, regret, or commitment.",\r
  LRN: "Learning loops often mask a deeper fear of truly applying and being seen in your competence.",\r
  PRD: "Productivity loops confuse doing with being — your worth isn't measured in output.",\r
  CRE: "Creative blocks are almost always emotional — the art is blocked by fear, not lack of skill.",\r
  PUR: "Purpose anxiety reveals a deep longing for meaning that's actually already present in your being.",\r
  SPR: "Spiritual loops are some of the most subtle — using awakening to avoid being fully human.",\r
};\r
\r
const SOURCE_INSIGHTS: Record<string, string> = {\r
  mind: "Your analytical mind is leading — it's trying to solve or understand, but some truths require feeling, not thinking.",\r
  heart: "Your heart is speaking — this is emotional intelligence arising. Honor these feelings without needing to fix them.",\r
  gut: "Your instinctual center is activated — trust this primal knowing, it often perceives what the mind misses.",\r
  body: "Your body is communicating — it holds wisdom and memory that words can't capture. Listen to its signals.",\r
  identity: "You're speaking from a fixed self-concept — notice how 'I am...' statements create invisible walls.",\r
  fear: "Fear is driving this expression — acknowledge it without letting it steer. Fear seen clearly loses its grip.",\r
  witness: "Beautiful — the witness is active. This observing awareness is your deepest nature, beyond all patterns.",\r
};\r
\r
export interface LocalDetectionResult {\r
  loops: DetectedLoop[];\r
  sources: DetectedSource[];\r
  overall_insight?: string;\r
  isAmbiguous: boolean; // true = low confidence, should call AI\r
}\r
\r
/**\r
 * Run local keyword-based loop and source detection.\r
 * @param messages Recent conversation messages\r
 * @returns Detection result + ambiguity flag\r
 */\r
export function detectLocally(\r
  messages: Array<{ role: string; content: string }>\r
): LocalDetectionResult {\r
  // Combine last few user messages for analysis\r
  const userMessages = messages\r
    .filter((m) => m.role === "user")\r
    .slice(-5)\r
    .map((m) => m.content);\r
\r
  if (userMessages.length === 0) {\r
    return { loops: [], sources: [], isAmbiguous: false };\r
  }\r
\r
  const combinedText = userMessages.join(" ");\r
\r
  // Score all loops\r
  const loopScores = LOOP_ENTRIES.map((entry) => {\r
    const { confidence, evidence } = scoreLoop(entry, combinedText);\r
    const category = entry.id.replace(/\\d+/g, "");\r
    return {\r
      id: entry.id,\r
      name: entry.name,\r
      confidence,\r
      evidence,\r
      why: LOOP_WHY[category] || "This pattern is operating below conscious awareness — recognition is the first step.",\r
    };\r
  })\r
    .filter((l) => l.confidence >= 0.3) // lower threshold than AI — we're less accurate\r
    .sort((a, b) => b.confidence - a.confidence)\r
    .slice(0, 3);\r
\r
  // Score sources\r
  const sourceScores = SOURCE_ENTRIES.map((entry) => {\r
    const { strength, evidence } = scoreSource(entry, combinedText);\r
    return {\r
      type: entry.type,\r
      strength,\r
      evidence,\r
      insight: SOURCE_INSIGHTS[entry.type],\r
    };\r
  })\r
    .filter((s) => s.strength >= 0.15)\r
    .sort((a, b) => b.strength - a.strength)\r
    .slice(0, 3) as DetectedSource[];\r
\r
  // Determine ambiguity\r
  const topLoopConfidence = loopScores[0]?.confidence || 0;\r
  const totalLoops = loopScores.length;\r
  // Ambiguous if: no strong match, or very close scores (hard to distinguish)\r
  const isAmbiguous =\r
    (totalLoops === 0 && userMessages.join("").length > 100) || // Long text but no matches\r
    (topLoopConfidence > 0 && topLoopConfidence < 0.4); // Weak match\r
\r
  // Generate overall insight\r
  let overall_insight: string | undefined;\r
  if (loopScores.length > 0 && sourceScores.length > 0) {\r
    const topLoop = loopScores[0].name;\r
    const topSource = sourceScores[0].type;\r
    overall_insight = \`A \${topLoop} pattern appears to be active, primarily expressed through your \${topSource}. Notice this with curiosity rather than judgment.\`;\r
  }\r
\r
  return {\r
    loops: loopScores as DetectedLoop[],\r
    sources: sourceScores,\r
    overall_insight,\r
    isAmbiguous,\r
  };\r
}\r
`,i=(()=>{const e={},t=/id:\s*"([A-Z]+[0-9]+)",\s*name:\s*"([^"]+)"/g;let r;for(;(r=t.exec(a))!==null;)e[r[1]]=r[2];return e})(),n={MEN:"Mind",COG:"Cognitive",ATT:"Attention",EMO:"Emotion",REL:"Relational",VAL:"Value",IDN:"Identity",BHV:"Behavior",BOD:"Body",EGO:"Ego",FEAR:"Fear",CMP:"Comparison",CTL:"Control",REC:"Recovery",WRK:"Work",BUR:"Burnout",RES:"Restlessness",BIO:"Biological",AVD:"Avoidance",SHM:"Shame",SLF:"Self",PRC:"Perception"};function d(e){return e.replace(/[-_]+/g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean).map(t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase()).join(" ")}function c(e){if(!e)return"";if(i[e])return i[e];const t=e.replace(/[-_\s]?loops?$/i,"").replace(/^([A-Z]{2,5})[-_]/,(h,s)=>{const o=n[s.toUpperCase()];return o?`${o} `:""}),r=e.replace(/[-_\s]?loops?$/i,"").toUpperCase();return n[r]?`${n[r]} Patterns`:/^[A-Z]{2,5}\d{2,4}$/.test(t)?t:d(t)||e}export{c as g};
