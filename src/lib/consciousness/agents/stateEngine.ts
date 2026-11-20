/**
 * STATE ENGINE — Computes user's real-time psychological state
 * Every interaction starts with state computation.
 * State drives ALL downstream decisions (agent selection, mode, intensity).
 */

// ─── State Vector ───

export type EmotionalTone =
  | 'calm' | 'anxious' | 'angry' | 'sad' | 'numb'
  | 'open' | 'resistant' | 'curious' | 'joyful'
  | 'overwhelmed' | 'reactive' | 'peaceful' | 'confused';

export type UserIntent =
  | 'explore' | 'fix' | 'escape' | 'express'
  | 'learn' | 'transform' | 'vent' | 'connect'
  | 'seek_validation' | 'seek_truth' | 'unclear';

export type AwarenessDepth =
  | 'identified'       // Fully merged with thoughts/emotions
  | 'questioning'      // Starting to question
  | 'observing'        // Can observe thoughts/emotions
  | 'witnessing'       // Stable witness consciousness
  | 'transcendent';    // Beyond observer-observed duality

export interface UserStateVector {
  energyLevel: number;         // 0-100
  emotionalValence: number;    // -100 (very negative) to +100 (very positive)
  emotionalTone: EmotionalTone;
  awarenessLevel: number;      // 0-10
  awarenessDepth: AwarenessDepth;
  resistanceLevel: number;     // 0-10
  clarityLevel: number;        // 0-10
  intentStrength: number;      // 0-10
  trustInSystem: number;       // 0-10
  cognitiveLoad: number;       // 0-10
  intent: UserIntent;
  fragility: number;           // 0-10 — how careful we need to be
  /**
   * True when there was no user text to read. Callers must not treat the
   * neutral defaults as an observed calm state.
   */
  affectUnknown?: boolean;
}

export type DerivedState =
  | 'fragile'
  | 'breakthrough_ready'
  | 'avoidance_loop'
  | 'seeking_comfort'
  | 'ready_for_truth'
  | 'stable_growth'
  | 'crisis'
  | 'celebration'
  | 'neutral';

// ─── State Computation ───

export interface StateComputeInput {
  /** Current message text */
  message: string;
  /** Time of day */
  hour: number;
  /** Days since last session */
  daysSinceLastSession: number;
  /** Sessions completed today */
  sessionsToday: number;
  /** User's current consciousness band (0-10) */
  currentBand: number;
  /** Recent emotional trend from memory */
  recentEmotionalTrend?: string;
  /** Active loop IDs */
  activeLoopIds?: string[];
  /** Previous message emotional tone (for tracking shifts) */
  previousTone?: EmotionalTone;
  /** User's overall journey day */
  journeyDay?: number;
}

/**
 * Compute user state from available signals.
 * In production, this would be enhanced by the LLM classification step
 * in the edge function. This provides the rule-based baseline.
 */
export function computeState(input: StateComputeInput): UserStateVector {
  const { message, hour, daysSinceLastSession, currentBand, sessionsToday } = input;
  const lowerMsg = message.toLowerCase();

  // Emotional tone detection (rule-based baseline — LLM enhances this)
  const emotionalTone = detectEmotionalTone(lowerMsg);
  const emotionalValence = estimateValence(emotionalTone);

  // Intent detection
  const intent = detectIntent(lowerMsg);

  // Energy estimation (time-based + behavior-based)
  const energyLevel = estimateEnergy(hour, daysSinceLastSession, sessionsToday);

  // Awareness level (from consciousness band + message signals)
  const awarenessLevel = Math.min(10, currentBand + detectAwarenessSignals(lowerMsg));
  const awarenessDepth = bandToAwarenessDepth(currentBand);

  // Resistance detection
  const resistanceLevel = detectResistance(lowerMsg, daysSinceLastSession);

  // Fragility calculation
  const fragility = calculateFragility(emotionalTone, resistanceLevel, awarenessLevel, daysSinceLastSession);

  // Clarity
  const clarityLevel = estimateClarity(lowerMsg, emotionalTone);

  // Trust (increases with journey day)
  const trustInSystem = Math.min(10, Math.floor((input.journeyDay ?? 0) / 10) + 2);

  // Cognitive load
  const cognitiveLoad = estimateCognitiveLoad(lowerMsg, emotionalTone);

  // Intent strength
  const intentStrength = intent === 'unclear' ? 2 : intent === 'transform' ? 9 : 5;

  return {
    energyLevel,
    emotionalValence,
    emotionalTone,
    awarenessLevel,
    awarenessDepth,
    resistanceLevel,
    clarityLevel,
    intentStrength,
    trustInSystem,
    cognitiveLoad,
    intent,
    fragility,
    affectUnknown: lowerMsg.trim().length === 0,
  };
}

/**
 * Derive high-level state from vector
 */
export function deriveState(state: UserStateVector): DerivedState {
  if (state.fragility > 7) return 'crisis';
  if (state.emotionalTone === 'joyful' && state.emotionalValence > 60) return 'celebration';
  if (state.fragility > 5) return 'fragile';
  if (state.resistanceLevel > 6 && state.intent === 'escape') return 'avoidance_loop';
  if (state.awarenessLevel > 6 && state.resistanceLevel < 3 && state.intent === 'seek_truth') return 'ready_for_truth';
  if (state.awarenessLevel > 5 && state.clarityLevel > 5 && state.resistanceLevel < 4) return 'breakthrough_ready';
  if (state.intent === 'seek_validation' || state.emotionalTone === 'sad') return 'seeking_comfort';
  if (state.awarenessLevel > 3 && state.resistanceLevel < 5) return 'stable_growth';
  return 'neutral';
}

// ─── Internal Detection Functions ───

function detectEmotionalTone(msg: string): EmotionalTone {
  const crisisWords = ['suicide', 'kill myself', 'end it', 'cannot go on', 'no point', 'want to die'];
  if (crisisWords.some(w => msg.includes(w))) return 'overwhelmed';

  const anxiousWords = ['anxious', 'worried', 'panic', 'scared', 'nervous', 'restless', 'cannot sleep', 'racing'];
  if (anxiousWords.some(w => msg.includes(w))) return 'anxious';

  const angryWords = ['angry', 'furious', 'rage', 'hate', 'frustrated', 'annoyed', 'irritated'];
  if (angryWords.some(w => msg.includes(w))) return 'angry';

  const sadWords = ['sad', 'depressed', 'lonely', 'hopeless', 'empty', 'lost', 'grief', 'miss'];
  if (sadWords.some(w => msg.includes(w))) return 'sad';

  const numbWords = ['numb', 'nothing', 'flat', 'disconnected', 'dead inside', 'feel nothing'];
  if (numbWords.some(w => msg.includes(w))) return 'numb';

  const resistantWords = ['do not want to', 'this is pointless', 'why bother', 'waste of time', 'not working'];
  if (resistantWords.some(w => msg.includes(w))) return 'resistant';

  const confusedWords = ['confused', 'do not understand', 'lost', 'unclear', 'what should i'];
  if (confusedWords.some(w => msg.includes(w))) return 'confused';

  const openWords = ['ready', 'open', 'willing', 'curious', 'show me', 'teach me', 'want to learn'];
  if (openWords.some(w => msg.includes(w))) return 'open';

  const curiousWords = ['wonder', 'what if', 'interesting', 'curious', 'tell me', 'how does'];
  if (curiousWords.some(w => msg.includes(w))) return 'curious';

  const joyfulWords = ['happy', 'grateful', 'amazing', 'breakthrough', 'beautiful', 'love', 'peaceful', 'bliss'];
  if (joyfulWords.some(w => msg.includes(w))) return 'joyful';

  const peacefulWords = ['calm', 'still', 'peaceful', 'serene', 'quiet', 'centered'];
  if (peacefulWords.some(w => msg.includes(w))) return 'peaceful';

  return 'calm';
}

function estimateValence(tone: EmotionalTone): number {
  const map: Record<EmotionalTone, number> = {
    calm: 20, anxious: -40, angry: -50, sad: -60, numb: -30,
    open: 30, resistant: -20, curious: 40, joyful: 80,
    overwhelmed: -80, reactive: -30, peaceful: 60, confused: -10,
  };
  return map[tone] ?? 0;
}

function detectIntent(msg: string): UserIntent {
  if (/help me|fix|solve|how (do|can|should) i/.test(msg)) return 'fix';
  if (/want to understand|what (is|does)|explain|why/.test(msg)) return 'learn';
  if (/i want to change|transform|grow|become/.test(msg)) return 'transform';
  if (/just.*vent|need to talk|let me/.test(msg)) return 'vent';
  if (/am i.*right|do you think|is it.*okay/.test(msg)) return 'seek_validation';
  if (/tell me the truth|be honest|real talk/.test(msg)) return 'seek_truth';
  if (/lonely|miss|connect|talk to/.test(msg)) return 'connect';
  if (/escape|forget|distract|run away/.test(msg)) return 'escape';
  if (/curious|explore|wonder|what if/.test(msg)) return 'explore';
  if (/feel|feeling|i am/.test(msg)) return 'express';
  return 'unclear';
}

function estimateEnergy(hour: number, daysSinceLastSession: number, sessionsToday: number): number {
  let energy = 50;

  // Time of day
  if (hour >= 6 && hour < 10) energy += 20;
  else if (hour >= 10 && hour < 14) energy += 10;
  else if (hour >= 14 && hour < 17) energy -= 10;
  else if (hour >= 17 && hour < 21) energy += 5;
  else energy -= 20; // night

  // Gap penalty
  if (daysSinceLastSession > 7) energy -= 15;
  else if (daysSinceLastSession > 3) energy -= 10;

  // Session fatigue
  if (sessionsToday > 2) energy -= 15;

  return Math.max(0, Math.min(100, energy));
}

function detectAwarenessSignals(msg: string): number {
  let signals = 0;
  if (/i notice|i observe|watching|witnessing/.test(msg)) signals += 2;
  if (/separate from|not my thought|the observer/.test(msg)) signals += 3;
  if (/who am i|what is real|who is/.test(msg)) signals += 2;
  if (/awareness|consciousness|presence|being/.test(msg)) signals += 1;
  return Math.min(4, signals); // cap contribution
}

function bandToAwarenessDepth(band: number): AwarenessDepth {
  if (band >= 7) return 'transcendent';
  if (band >= 5) return 'witnessing';
  if (band >= 3) return 'observing';
  if (band >= 1) return 'questioning';
  return 'identified';
}

function detectResistance(msg: string, daysSinceLastSession: number): number {
  let resistance = 0;
  if (/pointless|waste|not working|do not believe|bored/.test(msg)) resistance += 4;
  if (/whatever|fine|okay|sure/.test(msg) && msg.length < 20) resistance += 3;
  if (daysSinceLastSession > 5) resistance += 2;
  return Math.min(10, resistance);
}

function calculateFragility(
  tone: EmotionalTone,
  resistance: number,
  awareness: number,
  daysSinceLastSession: number,
): number {
  let fragility = 0;

  if (tone === 'overwhelmed') fragility += 8;
  else if (tone === 'anxious' || tone === 'sad') fragility += 4;
  else if (tone === 'numb') fragility += 5;
  else if (tone === 'angry') fragility += 3;

  if (daysSinceLastSession > 7) fragility += 2;
  if (awareness < 2) fragility += 1;
  if (resistance > 6) fragility += 1;

  return Math.min(10, fragility);
}

function estimateClarity(msg: string, tone: EmotionalTone): number {
  let clarity = 5;
  if (msg.length > 200) clarity += 2; // detailed = clearer thinking
  if (/because|therefore|i realize|i see that/.test(msg)) clarity += 2;
  if (tone === 'confused') clarity -= 3;
  if (tone === 'overwhelmed') clarity -= 4;
  return Math.max(0, Math.min(10, clarity));
}

function estimateCognitiveLoad(msg: string, tone: EmotionalTone): number {
  let load = 3;
  if (msg.length > 300) load += 2;
  if (tone === 'overwhelmed' || tone === 'confused') load += 3;
  if (tone === 'anxious') load += 2;
  if (tone === 'calm' || tone === 'peaceful') load -= 2;
  return Math.max(0, Math.min(10, load));
}
