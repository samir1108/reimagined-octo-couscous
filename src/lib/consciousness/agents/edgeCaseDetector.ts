/**
 * EDGE-CASE DETECTOR — Identifies risky/special interaction patterns
 * Runs BEFORE agent routing. Returns flags that override default routing.
 */

export type EdgeCaseFlag =
  | 'spiritual_bypassing'
  | 'ego_inflation'
  | 'over_dependency'
  | 'emotional_collapse'
  | 'intellectual_loop'
  | 'masked_resistance'
  | 'silent_user'
  | 'topic_jumping'
  | 'highly_advanced'
  | 'low_awareness'
  | 'rapid_depth_risk';

export interface EdgeCaseDetection {
  flags: EdgeCaseFlag[];
  /** Highest-priority flag (drives routing override) */
  primary: EdgeCaseFlag | null;
  /** Confidence 0-1 */
  confidence: number;
  reason: string;
}

export interface EdgeCaseInput {
  message: string;
  awarenessLevel: number;       // 0-10
  fragility: number;            // 0-10
  resistanceLevel: number;      // 0-10
  recentMessageCount: number;   // last 5 turns
  recentTopics: string[];       // distinct topic strings from last 5 turns
  questionsAskedToAI: number;   // count of "should I / what do you think" in last N
  emptyOrShortReplies: number;  // last 3 turns: messages < 5 chars
  sessionsToday: number;
  awarenessGainLast7Days: number; // 0-10 delta
}

export function detectEdgeCases(input: EdgeCaseInput): EdgeCaseDetection {
  const flags: EdgeCaseFlag[] = [];
  const msg = input.message.toLowerCase();
  const reasons: string[] = [];

  // 1. Spiritual bypassing
  if (
    /everything is (illusion|maya)|nothing (really )?matters|why bother.*everything|all is one.*so/.test(msg) &&
    input.awarenessLevel < 7
  ) {
    flags.push('spiritual_bypassing');
    reasons.push('bypass language detected');
  }

  // 2. Ego inflation
  if (/i am more (aware|awake|conscious|enlightened)|others (don't|do not) understand|most people (are|cannot)/.test(msg)) {
    flags.push('ego_inflation');
    reasons.push('superiority language');
  }

  // 3. Over-dependency
  if (input.questionsAskedToAI >= 3 && /what should i|should i|do you think|tell me what/.test(msg)) {
    flags.push('over_dependency');
    reasons.push('repeated decision-seeking');
  }

  // 4. Emotional collapse
  if (
    input.fragility > 7 ||
    /can(no|')t handle|breaking down|falling apart|too much/.test(msg)
  ) {
    flags.push('emotional_collapse');
    reasons.push('collapse signals');
  }

  // 5. Intellectual loop (questions, no action over time)
  if (
    input.recentMessageCount > 5 &&
    input.awarenessLevel > 5 &&
    /why|what is|how does|explain/.test(msg) &&
    input.sessionsToday > 1
  ) {
    flags.push('intellectual_loop');
    reasons.push('repeated inquiry without action');
  }

  // 6. Masked resistance
  if (
    /i (just )?do(n't| not) think this works|not for me|pointless|waste/.test(msg) &&
    input.resistanceLevel > 4
  ) {
    flags.push('masked_resistance');
    reasons.push('resistance disguised as logic');
  }

  // 7. Silent user
  if (input.emptyOrShortReplies >= 2) {
    flags.push('silent_user');
    reasons.push('multiple short/empty replies');
  }

  // 8. Topic jumping
  if (input.recentTopics.length >= 4) {
    flags.push('topic_jumping');
    reasons.push(`${input.recentTopics.length} distinct topics in recent turns`);
  }

  // 9. Highly advanced
  if (input.awarenessLevel >= 8 && input.fragility < 3) {
    flags.push('highly_advanced');
    reasons.push('advanced user');
  }

  // 10. Low awareness
  if (input.awarenessLevel <= 2) {
    flags.push('low_awareness');
    reasons.push('beginner-level awareness');
  }

  // 11. Rapid depth risk
  if (input.awarenessGainLast7Days >= 4 && input.fragility >= 4) {
    flags.push('rapid_depth_risk');
    reasons.push('fast depth gain + fragility');
  }

  // Priority ordering — most safety-critical first
  const priority: EdgeCaseFlag[] = [
    'emotional_collapse',
    'rapid_depth_risk',
    'spiritual_bypassing',
    'ego_inflation',
    'over_dependency',
    'masked_resistance',
    'intellectual_loop',
    'topic_jumping',
    'silent_user',
    'highly_advanced',
    'low_awareness',
  ];

  const primary = priority.find(p => flags.includes(p)) ?? null;
  const confidence = Math.min(1, flags.length * 0.25);

  return { flags, primary, confidence, reason: reasons.join('; ') };
}

/**
 * Map edge-case flag → suggested agent IDs.
 * Used by the router as a routing override.
 */
export function getEdgeCaseAgents(flag: EdgeCaseFlag): string[] {
  switch (flag) {
    case 'spiritual_bypassing':
      return ['reality-checker', 'reality-anchor', 'spiritual-bypass-detector'];
    case 'ego_inflation':
      return ['ego-inflation-detector', 'ego-challenger', 'self-inquiry-master'];
    case 'over_dependency':
      return ['dependency-breaker', 'self-inquiry-master'];
    case 'emotional_collapse':
      return ['safe-space', 'witness', 'grounding-agent'];
    case 'intellectual_loop':
      return ['executor', 'micro-step-planner', 'reality-anchor'];
    case 'masked_resistance':
      return ['pattern-finder', 'pattern-disruptor'];
    case 'silent_user':
      return ['friend', 'silence-keeper'];
    case 'topic_jumping':
      return ['presence-stabilizer', 'confusion-simplifier'];
    case 'highly_advanced':
      return ['silence-teacher', 'paradox-generator', 'void'];
    case 'low_awareness':
      return ['friend', 'companion' as never, 'emotional-labeler'].filter(Boolean) as string[];
    case 'rapid_depth_risk':
      return ['depth-controller', 'grounding-agent', 'safe-space'];
  }
}
