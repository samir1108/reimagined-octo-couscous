/**
 * SHADOW TARGETS — Wound/pattern targeting
 * ────────────────────────────────────────
 * Pre-defined shadow/wound targets mapped to practices.
 */

import type { ShadowTarget, PracticeId } from '@/types/session-config';

export const SHADOW_TARGETS: ShadowTarget[] = [
  {
    id: 'shadow:abandonment',
    name: 'Abandonment',
    description: 'Fear of being left, alone, or forgotten',
    linkedLoops: ['VAL001', 'VAL007'],
    linkedChakras: ['heart', 'root'],
    linkedDimensions: ['emotion', 'connection'],
    practiceTargets: {
      bhakti: { practiceId: 'bhakti', targetLevel: 3, priority: 'high', reason: 'surrender the wound' },
      relationship: { practiceId: 'relationship', targetLevel: 3, priority: 'high', reason: 'mirror work' },
      'emotional-healing': { practiceId: 'emotional-healing', targetLevel: 2, priority: 'required', reason: 'somatic release' },
      witnessing: { practiceId: 'witnessing', targetLevel: 3, priority: 'medium', reason: 'observe panic pattern' },
    },
    affirmations: ['I am safe even when alone', 'My worth does not depend on others staying'],
    inquiryQuestions: ['Who is afraid of being left?', 'What is the story I tell myself when alone?'],
    priority: 'core',
  },
  {
    id: 'shadow:control',
    name: 'Control Freak',
    description: 'Need to control everything — fear of chaos',
    linkedLoops: ['VAL003', 'VAL005'],
    linkedChakras: ['solar-plexus', 'root'],
    linkedDimensions: ['thought', 'action'],
    practiceTargets: {
      karma: { practiceId: 'karma', targetLevel: 3, priority: 'required', reason: 'non-attachment to results' },
      jnana: { practiceId: 'jnana', targetLevel: 3, priority: 'high', reason: 'neti-neti mental' },
      witnessing: { practiceId: 'witnessing', targetLevel: 3, priority: 'high', reason: 'observe control pattern' },
      breath: { practiceId: 'breath', targetLevel: 3, priority: 'medium', reason: 'let breath be uncontrolled' },
    },
    affirmations: ['I can let go and still be safe', 'Control is an illusion — trust is real'],
    inquiryQuestions: ['Who needs to control?', 'What am I afraid will happen if I let go?'],
    priority: 'core',
  },
  {
    id: 'shadow:unworthiness',
    name: 'Unworthiness',
    description: 'Deep belief that I am not enough',
    linkedLoops: ['VAL002', 'VAL004'],
    linkedChakras: ['heart', 'solar-plexus'],
    linkedDimensions: ['emotion', 'spirit'],
    practiceTargets: {
      bhakti: { practiceId: 'bhakti', targetLevel: 3, priority: 'high', reason: 'surrender self-judgment' },
      'self-inquiry': { practiceId: 'self-inquiry', targetLevel: 3, priority: 'required', reason: 'who is unworthy?' },
      'emotional-healing': { practiceId: 'emotional-healing', targetLevel: 3, priority: 'high', reason: 'transmute shame' },
      observation: { practiceId: 'observation', targetLevel: 3, priority: 'medium', reason: 'observe worthiness thought' },
    },
    affirmations: ['I am enough exactly as I am', 'My worth is inherent, not earned'],
    inquiryQuestions: ['Who is unworthy?', 'Is this belief actually true?', 'What would I be without this thought?'],
    priority: 'core',
  },
  {
    id: 'shadow:perfectionism',
    name: 'Perfectionism',
    description: 'Everything must be perfect — fear of imperfection',
    linkedLoops: ['VAL006', 'VAL008'],
    linkedChakras: ['throat', 'solar-plexus'],
    linkedDimensions: ['thought', 'action'],
    practiceTargets: {
      karma: { practiceId: 'karma', targetLevel: 3, priority: 'required', reason: 'action without perfection' },
      observation: { practiceId: 'observation', targetLevel: 2, priority: 'high', reason: 'observe perfection thought' },
      jnana: { practiceId: 'jnana', targetLevel: 2, priority: 'medium', reason: 'discriminate perfect vs real' },
      breath: { practiceId: 'breath', targetLevel: 2, priority: 'low', reason: 'accept imperfect breath' },
    },
    affirmations: ['Imperfection is where life lives', 'Good enough is perfect'],
    inquiryQuestions: ['Who needs perfection?', 'What happens if I do it imperfectly?'],
    priority: 'high',
  },
  {
    id: 'shadow:avoidance',
    name: 'Avoidance',
    description: 'Avoid difficult feelings, conversations, or situations',
    linkedLoops: ['VAL003', 'VAL009'],
    linkedChakras: ['root', 'solar-plexus'],
    linkedDimensions: ['emotion', 'action'],
    practiceTargets: {
      'self-inquiry': { practiceId: 'self-inquiry', targetLevel: 2, priority: 'required', reason: 'inquire into avoidance' },
      'loop-dissolution': { practiceId: 'loop-dissolution', targetLevel: 3, priority: 'high', reason: 'pause before avoiding' },
      karma: { practiceId: 'karma', targetLevel: 2, priority: 'high', reason: 'act despite discomfort' },
      'emotional-healing': { practiceId: 'emotional-healing', targetLevel: 2, priority: 'medium', reason: 'feel the avoided emotion' },
    },
    affirmations: ['I can face what I fear', 'Avoidance feeds the fear'],
    inquiryQuestions: ['What am I avoiding?', 'What happens if I stay with this feeling?'],
    priority: 'core',
  },
  {
    id: 'shadow:people-pleasing',
    name: 'People Pleasing',
    description: 'Say yes when I mean no, lose myself in others',
    linkedLoops: ['VAL010', 'VAL011'],
    linkedChakras: ['throat', 'solar-plexus'],
    linkedDimensions: ['connection', 'action'],
    practiceTargets: {
      relationship: { practiceId: 'relationship', targetLevel: 4, priority: 'required', reason: 'boundary wisdom' },
      karma: { practiceId: 'karma', targetLevel: 2, priority: 'high', reason: 'authentic action' },
      'self-inquiry': { practiceId: 'self-inquiry', targetLevel: 2, priority: 'medium', reason: 'who am I without others?' },
      breath: { practiceId: 'breath', targetLevel: 2, priority: 'low', reason: 'pause before yes' },
    },
    affirmations: ['My no is as sacred as my yes', 'I can love others without losing myself'],
    inquiryQuestions: ['Who am I trying to please?', 'What do I really want to say?'],
    priority: 'high',
  },
  {
    id: 'shadow:anger',
    name: 'Anger',
    description: 'Explosive or suppressed anger',
    linkedLoops: ['VAL012', 'VAL013'],
    linkedChakras: ['solar-plexus', 'root'],
    linkedDimensions: ['emotion', 'body'],
    practiceTargets: {
      'emotional-healing': { practiceId: 'emotional-healing', targetLevel: 3, priority: 'required', reason: 'transmute anger' },
      body: { practiceId: 'body', targetLevel: 3, priority: 'high', reason: 'feel anger in body' },
      witnessing: { practiceId: 'witnessing', targetLevel: 3, priority: 'high', reason: 'witness anger pattern' },
      breath: { practiceId: 'breath', targetLevel: 3, priority: 'medium', reason: 'extended exhale for anger' },
    },
    affirmations: ['Anger is energy — I can channel it', 'I can feel anger without being consumed'],
    inquiryQuestions: ['What is beneath the anger?', 'Who is angry?'],
    priority: 'core',
  },
  {
    id: 'shadow:grief',
    name: 'Grief',
    description: 'Unprocessed loss, sadness, longing',
    linkedLoops: ['VAL014', 'VAL015'],
    linkedChakras: ['heart', 'throat'],
    linkedDimensions: ['emotion', 'connection'],
    practiceTargets: {
      'emotional-healing': { practiceId: 'emotional-healing', targetLevel: 4, priority: 'required', reason: 'transmute grief' },
      bhakti: { practiceId: 'bhakti', targetLevel: 3, priority: 'high', reason: 'surrender to loss' },
      witnessing: { practiceId: 'witnessing', targetLevel: 2, priority: 'medium', reason: 'witness grief wave' },
      body: { practiceId: 'body', targetLevel: 2, priority: 'low', reason: 'hold grief in body' },
    },
    affirmations: ['Grief is love with nowhere to go', 'I can hold this loss without breaking'],
    inquiryQuestions: ['What am I grieving?', 'Who is grieving?'],
    priority: 'core',
  },
  {
    id: 'shadow:anxiety',
    name: 'Anxiety',
    description: 'Future-oriented fear, nervous system dysregulation',
    linkedLoops: ['VAL016', 'VAL017'],
    linkedChakras: ['root', 'throat'],
    linkedDimensions: ['body', 'thought'],
    practiceTargets: {
      breath: { practiceId: 'breath', targetLevel: 3, priority: 'required', reason: 'extended exhale' },
      body: { practiceId: 'body', targetLevel: 2, priority: 'high', reason: 'ground in body' },
      observation: { practiceId: 'observation', targetLevel: 2, priority: 'high', reason: 'observe worry thought' },
      witnessing: { practiceId: 'witnessing', targetLevel: 2, priority: 'medium', reason: 'witness anxiety pattern' },
    },
    affirmations: ['This moment is safe', 'Anxiety is a messenger, not a master'],
    inquiryQuestions: ['What am I afraid will happen?', 'Is this threat real or imagined?'],
    priority: 'core',
  },
];

export function getShadowTargetById(id: string): ShadowTarget | undefined {
  return SHADOW_TARGETS.find(t => t.id === id);
}

export function getShadowTargetsByPriority(priority: string): ShadowTarget[] {
  return SHADOW_TARGETS.filter(t => t.priority === priority);
}

export function getShadowTargetsForLoop(loopId: string): ShadowTarget[] {
  return SHADOW_TARGETS.filter(t => t.linkedLoops.includes(loopId as any));
}