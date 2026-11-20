/**
 * MICRO-TECHNIQUES — Sub-practice level techniques
 * ─────────────────────────────────────────────────
 * Each practice has techniques at specific levels.
 * Users can target specific techniques within a practice.
 */

import type { PracticeId } from '@/types/practices';
import type { MicroTechnique } from '@/types/session-config';

export const MICRO_TECHNIQUES: MicroTechnique[] = [
  // ─── OBSERVATION ───
  { id: 'obs:sensory', practiceId: 'observation', level: 1, label: 'Five Senses', description: 'Observe through 5 senses without labeling', durationSec: 120, tags: ['sensory', 'grounding', 'beginner'] },
  { id: 'obs:thought-label', practiceId: 'observation', level: 2, label: 'Thought Labeling', description: 'Label thoughts: "thinking", "planning", "worrying"', durationSec: 180, tags: ['cognitive', 'labeling'] },
  { id: 'obs:emotion-track', practiceId: 'observation', level: 3, label: 'Emotion Tracking', description: 'Feel emotions without reacting, note intensity 1-10', durationSec: 300, tags: ['emotional', 'tracking'] },
  { id: 'obs:body-scan', practiceId: 'observation', level: 4, label: 'Body Scanning', description: 'Somatic awareness scan from head to toe', durationSec: 300, tags: ['somatic', 'body'] },
  { id: 'obs:gap', practiceId: 'observation', level: 5, label: 'Gap Awareness', description: 'Notice space between thoughts', durationSec: 600, tags: ['advanced', 'witness'] },
  { id: 'obs:witness', practiceId: 'observation', level: 6, label: 'Witness Consciousness', description: 'The observer who observes', durationSec: 900, tags: ['advanced', 'witness'] },
  { id: 'obs:nondual', practiceId: 'observation', level: 7, label: 'Non-dual Observation', description: 'Observer dissolves into observed', durationSec: 1200, tags: ['transpersonal', 'nondual'] },

  // ─── BREATH ───
  { id: 'breath:natural', practiceId: 'breath', level: 1, label: 'Natural Breath', description: 'Observe breath without changing it', durationSec: 120, tags: ['beginner', 'observation'] },
  { id: 'breath:counted', practiceId: 'breath', level: 2, label: 'Counted Breath', description: 'Count 1-10, restart if lose count', durationSec: 180, tags: ['counting', 'focus'] },
  { id: 'breath:box', practiceId: 'breath', level: 3, label: 'Box Breathing', description: '4-4-4-4: inhale-hold-exhale-hold', durationSec: 300, tags: ['box', 'regulation', 'stress'] },
  { id: 'breath:478', practiceId: 'breath', level: 3, label: '4-7-8 Breath', description: 'Inhale 4, hold 7, exhale 8', durationSec: 300, tags: ['sleep', 'calming', 'anxiety'] },
  { id: 'breath:extended', practiceId: 'breath', level: 3, label: 'Extended Exhale', description: 'Exhale twice as long as inhale (1:2)', durationSec: 300, tags: ['calming', 'parasympathetic'] },
  { id: 'breath:energy', practiceId: 'breath', level: 4, label: 'Energy Breath', description: 'Spinal/prana awareness — feel energy move', durationSec: 600, tags: ['energy', 'prana', 'advanced'] },
  { id: 'breath:nadi', practiceId: 'breath', level: 4, label: 'Nadi Shodhana', description: 'Alternate nostril breathing', durationSec: 600, tags: ['nadi', 'balance', 'kriya'] },
  { id: 'breath:spontaneous', practiceId: 'breath', level: 5, label: 'Spontaneous Breath', description: 'Breath breathes itself — just witness', durationSec: 900, tags: ['advanced', 'witness'] },

  // ─── SELF-INQUIRY ───
  { id: 'inquiry:emotion', practiceId: 'self-inquiry', level: 1, label: 'Emotional Inquiry', description: 'What am I feeling right now?', durationSec: 180, tags: ['beginner', 'emotion'] },
  { id: 'inquiry:thought-source', practiceId: 'self-inquiry', level: 2, label: 'Thought Source', description: 'Where does this thought come from?', durationSec: 300, tags: ['cognitive', 'source'] },
  { id: 'inquiry:belief', practiceId: 'self-inquiry', level: 3, label: 'Belief Inquiry', description: 'Is this belief actually true?', durationSec: 300, tags: ['belief', 'truth'] },
  { id: 'inquiry:identity', practiceId: 'self-inquiry', level: 4, label: 'Identity Inquiry', description: 'Who is the one asking?', durationSec: 600, tags: ['identity', 'self'] },
  { id: 'inquiry:who-am-i', practiceId: 'self-inquiry', level: 5, label: 'Who Am I', description: "Ramana Maharshi's direct method", durationSec: 900, tags: ['direct', 'ramana', 'who-am-i'] },
  { id: 'inquiry:silent', practiceId: 'self-inquiry', level: 6, label: 'Silent Inquiry', description: 'Question dissolves into silence', durationSec: 1200, tags: ['silent', 'advanced'] },

  // ─── WITNESSING ───
  { id: 'witness:event', practiceId: 'witnessing', level: 1, label: 'Event Witnessing', description: 'Watch daily events without judgment', durationSec: 120, tags: ['beginner', 'daily'] },
  { id: 'witness:reaction', practiceId: 'witnessing', level: 2, label: 'Reaction Witnessing', description: 'Catch reactions in real-time', durationSec: 180, tags: ['reaction', 'realtime'] },
  { id: 'witness:pattern', practiceId: 'witnessing', level: 3, label: 'Pattern Witnessing', description: 'See loops as they arise', durationSec: 300, tags: ['pattern', 'loop'] },
  { id: 'witness:sakshi', practiceId: 'witnessing', level: 4, label: 'Sakshi Bhav', description: 'Sustained witness consciousness', durationSec: 600, tags: ['sakshi', 'sustained'] },
  { id: 'witness:turiya', practiceId: 'witnessing', level: 5, label: 'Turiya Witness', description: 'Witnessing even deep sleep', durationSec: 1200, tags: ['turiya', 'advanced'] },

  // ─── BODY ───
  { id: 'body:scan', practiceId: 'body', level: 1, label: 'Body Scan', description: 'Progressive relaxation scan head to toe', durationSec: 300, tags: ['scan', 'relaxation'] },
  { id: 'body:sensation', practiceId: 'body', level: 2, label: 'Sensation Mapping', description: 'Where do I feel this emotion?', durationSec: 180, tags: ['emotion', 'sensation'] },
  { id: 'body:energy', practiceId: 'body', level: 3, label: 'Energy Awareness', description: 'Prana flow perception', durationSec: 300, tags: ['energy', 'prana'] },
  { id: 'body:temple', practiceId: 'body', level: 4, label: 'Body as Temple', description: 'Sacred somatics — body as divine', durationSec: 600, tags: ['sacred', 'somatics'] },
  { id: 'body:dissolving', practiceId: 'body', level: 5, label: 'Dissolving Boundary', description: 'Energy body awareness', durationSec: 900, tags: ['dissolving', 'advanced'] },

  // ─── BHAKTI ───
  { id: 'bhakti:gratitude', practiceId: 'bhakti', level: 1, label: 'Gratitude Practice', description: 'Daily thankfulness — 3 things', durationSec: 120, tags: ['gratitude', 'beginner'] },
  { id: 'bhakti:kirtan', practiceId: 'bhakti', level: 2, label: 'Devotional Singing', description: 'Kirtan, bhajan — heart opening', durationSec: 300, tags: ['singing', 'kirtan', 'heart'] },
  { id: 'bhakti:surrender', practiceId: 'bhakti', level: 3, label: 'Surrender Practice', description: 'Letting go of control — "not my will"', durationSec: 300, tags: ['surrender', 'letting-go'] },
  { id: 'bhakti:divine-love', practiceId: 'bhakti', level: 4, label: 'Divine Love Meditation', description: 'Heart opening — feel divine love', durationSec: 600, tags: ['divine', 'love', 'heart'] },
  { id: 'bhakti:para', practiceId: 'bhakti', level: 5, label: 'Para Bhakti', description: 'Love without object — objectless devotion', durationSec: 900, tags: ['para', 'objectless', 'advanced'] },

  // ─── KARMA ───
  { id: 'karma:selfless', practiceId: 'karma', level: 1, label: 'Selfless Action', description: 'Act without reward expectation', durationSec: 120, tags: ['selfless', 'action'] },
  { id: 'karma:skill', practiceId: 'karma', level: 2, label: 'Skill in Action', description: 'Excellence as offering', durationSec: 180, tags: ['skill', 'excellence'] },
  { id: 'karma:non-attachment', practiceId: 'karma', level: 3, label: 'Non-attachment to Results', description: "Gita's core teaching — act without clinging", durationSec: 300, tags: ['non-attachment', 'gita'] },
  { id: 'karma:service', practiceId: 'karma', level: 4, label: 'Service Meditation', description: 'Seeing divine in all — seva as meditation', durationSec: 600, tags: ['service', 'seva', 'divine'] },
  { id: 'karma:nishkama', practiceId: 'karma', level: 5, label: 'Nishkama Karma', description: 'Action from stillness — no doer', durationSec: 900, tags: ['nishkama', 'stillness', 'advanced'] },

  // ─── JNANA ───
  { id: 'jnana:discrimination', practiceId: 'jnana', level: 1, label: 'Discrimination', description: 'Real vs unreal — viveka', durationSec: 180, tags: ['discrimination', 'viveka'] },
  { id: 'jnana:neti-physical', practiceId: 'jnana', level: 2, label: 'Neti-Neti (Physical)', description: 'Not this — physical identity', durationSec: 300, tags: ['neti-neti', 'physical'] },
  { id: 'jnana:neti-mental', practiceId: 'jnana', level: 3, label: 'Neti-Neti (Mental)', description: 'Not this — mental/emotional identity', durationSec: 300, tags: ['neti-neti', 'mental'] },
  { id: 'jnana:tattvamasi', practiceId: 'jnana', level: 4, label: 'Tattvamasi', description: '"I am That" contemplation', durationSec: 600, tags: ['tattvamasi', 'contemplation'] },
  { id: 'jnana:viveka', practiceId: 'jnana', level: 5, label: 'Viveka', description: 'Discrimination in daily life', durationSec: 300, tags: ['viveka', 'daily'] },
  { id: 'jnana:direct-seeing', practiceId: 'jnana', level: 6, label: 'Direct Seeing', description: 'Truth without mediator', durationSec: 900, tags: ['direct', 'seeing', 'advanced'] },

  // ─── RAJA ───
  { id: 'raja:yama', practiceId: 'raja', level: 1, label: 'Yama', description: 'Ethical foundation — non-violence, truth', durationSec: 120, tags: ['yama', 'ethics'] },
  { id: 'raja:niyama', practiceId: 'raja', level: 2, label: 'Niyama', description: 'Self-discipline — contentment, study', durationSec: 120, tags: ['niyama', 'discipline'] },
  { id: 'raja:asana', practiceId: 'raja', level: 3, label: 'Asana', description: 'Steady, comfortable posture', durationSec: 300, tags: ['asana', 'posture'] },
  { id: 'raja:pranayama', practiceId: 'raja', level: 4, label: 'Pranayama', description: 'Breath regulation', durationSec: 600, tags: ['pranayama', 'breath'] },
  { id: 'raja:pratyahara', practiceId: 'raja', level: 5, label: 'Pratyahara', description: 'Sense withdrawal', durationSec: 300, tags: ['pratyahara', 'senses'] },
  { id: 'raja:dharana', practiceId: 'raja', level: 6, label: 'Dharana', description: 'Concentration', durationSec: 600, tags: ['dharana', 'concentration'] },
  { id: 'raja:dhyana', practiceId: 'raja', level: 7, label: 'Dhyana', description: 'Meditation', durationSec: 900, tags: ['dhyana', 'meditation'] },
  { id: 'raja:samadhi', practiceId: 'raja', level: 8, label: 'Samadhi', description: 'Absorption', durationSec: 1200, tags: ['samadhi', 'absorption'] },

  // ─── KRIYA ───
  { id: 'kriya:basic', practiceId: 'kriya', level: 1, label: 'Basic Pranayama', description: 'Foundation breathing', durationSec: 300, tags: ['basic', 'foundation'] },
  { id: 'kriya:nadi', practiceId: 'kriya', level: 2, label: 'Nadi Shodhana', description: 'Alternate nostril breathing', durationSec: 600, tags: ['nadi', 'shodhana'] },
  { id: 'kriya:kapalbhati', practiceId: 'kriya', level: 3, label: 'Kapalbhati + Bandhas', description: 'Skull-shining breath with locks', durationSec: 300, tags: ['kapalbhati', 'bandhas'] },
  { id: 'kriya:spinal', practiceId: 'kriya', level: 4, label: 'Spinal Breathing', description: 'Sushumna channel awareness', durationSec: 600, tags: ['spinal', 'sushumna'] },
  { id: 'kriya:proper', practiceId: 'kriya', level: 5, label: 'Kriya Proper', description: 'Classical kriya technique', durationSec: 900, tags: ['classical', 'kriya'] },
  { id: 'kriya:advanced', practiceId: 'kriya', level: 6, label: 'Advanced Kriya', description: 'Higher kriyas', durationSec: 1200, tags: ['advanced', 'higher'] },
  { id: 'kriya:spontaneous', practiceId: 'kriya', level: 7, label: 'Spontaneous Prana', description: 'Prana moves itself', durationSec: 1200, tags: ['spontaneous', 'prana'] },

  // ─── TANTRA ───
  { id: 'tantra:sacred-perception', practiceId: 'tantra', level: 1, label: 'Sacred Perception', description: 'Seeing divinity in ordinary', durationSec: 300, tags: ['sacred', 'perception'] },
  { id: 'tantra:energy-map', practiceId: 'tantra', level: 2, label: 'Energy Mapping', description: 'Chakra/nadi awareness', durationSec: 300, tags: ['chakra', 'nadi', 'mapping'] },
  { id: 'tantra:polarity', practiceId: 'tantra', level: 3, label: 'Polarity Integration', description: 'Shiva-Shakti balance', durationSec: 600, tags: ['polarity', 'shiva-shakti'] },
  { id: 'tantra:ritual', practiceId: 'tantra', level: 4, label: 'Ritual Awareness', description: 'Conscious ceremony', durationSec: 600, tags: ['ritual', 'ceremony'] },
  { id: 'tantra:nondual', practiceId: 'tantra', level: 5, label: 'Non-dual Embodiment', description: 'Form as formless', durationSec: 900, tags: ['nondual', 'embodiment'] },

  // ─── EMOTIONAL HEALING ───
  { id: 'heal:naming', practiceId: 'emotional-healing', level: 1, label: 'Naming', description: 'Identify and name the emotion', durationSec: 180, tags: ['naming', 'identification'] },
  { id: 'heal:somatic', practiceId: 'emotional-healing', level: 2, label: 'Somatic Locating', description: 'Find it in the body', durationSec: 300, tags: ['somatic', 'body'] },
  { id: 'heal:origin', practiceId: 'emotional-healing', level: 3, label: 'Origin Tracing', description: 'When did this start?', durationSec: 300, tags: ['origin', 'tracing'] },
  { id: 'heal:transmutation', practiceId: 'emotional-healing', level: 4, label: 'Transmutation', description: 'Transform the energy', durationSec: 600, tags: ['transmutation', 'transform'] },
  { id: 'heal:integration', practiceId: 'emotional-healing', level: 5, label: 'Integration', description: 'Emotion becomes wisdom', durationSec: 600, tags: ['integration', 'wisdom'] },

  // ─── LOOP DISSOLUTION ───
  { id: 'loop:id', practiceId: 'loop-dissolution', level: 1, label: 'Identification', description: 'See the loop clearly', durationSec: 180, tags: ['identification', 'seeing'] },
  { id: 'loop:trigger', practiceId: 'loop-dissolution', level: 2, label: 'Trigger Mapping', description: 'What starts this pattern?', durationSec: 300, tags: ['trigger', 'mapping'] },
  { id: 'loop:pause', practiceId: 'loop-dissolution', level: 3, label: 'Pause', description: 'Insert space before reaction', durationSec: 300, tags: ['pause', 'space'] },
  { id: 'loop:root', practiceId: 'loop-dissolution', level: 4, label: 'Root Inquiry', description: 'What is this loop protecting?', durationSec: 600, tags: ['root', 'inquiry'] },
  { id: 'loop:dissolution', practiceId: 'loop-dissolution', level: 5, label: 'Dissolution', description: 'Loop naturally releases', durationSec: 600, tags: ['dissolution', 'release'] },

  // ─── RELATIONSHIP ───
  { id: 'rel:mirror', practiceId: 'relationship', level: 1, label: 'Mirror Awareness', description: 'Others reflect me', durationSec: 180, tags: ['mirror', 'reflection'] },
  { id: 'rel:projection', practiceId: 'relationship', level: 2, label: 'Projection Recognition', description: 'What is mine vs theirs', durationSec: 300, tags: ['projection', 'boundaries'] },
  { id: 'rel:communication', practiceId: 'relationship', level: 3, label: 'Conscious Communication', description: 'Speak from awareness', durationSec: 300, tags: ['communication', 'awareness'] },
  { id: 'rel:boundary', practiceId: 'relationship', level: 4, label: 'Boundary Wisdom', description: 'Healthy limits from love', durationSec: 300, tags: ['boundary', 'love'] },
  { id: 'rel:sacred', practiceId: 'relationship', level: 5, label: 'Sacred Relating', description: 'Relationship as practice', durationSec: 600, tags: ['sacred', 'relating'] },

  // ─── WORK & CAREER ───
  { id: 'work:purpose', practiceId: 'work-career', level: 1, label: 'Purpose Inquiry', description: 'What is my dharma?', durationSec: 180, tags: ['purpose', 'dharma'] },
  { id: 'work:flow', practiceId: 'work-career', level: 2, label: 'Flow Mapping', description: 'When do I lose time?', durationSec: 180, tags: ['flow', 'mapping'] },
  { id: 'work:ambition', practiceId: 'work-career', level: 3, label: 'Conscious Ambition', description: 'Desire without attachment', durationSec: 300, tags: ['ambition', 'non-attachment'] },
  { id: 'work:leadership', practiceId: 'work-career', level: 4, label: 'Leadership Presence', description: 'Lead from awareness', durationSec: 300, tags: ['leadership', 'presence'] },
  { id: 'work:seva', practiceId: 'work-career', level: 5, label: 'Seva Integration', description: 'Work as service', durationSec: 600, tags: ['seva', 'service'] },

  // ─── FINANCE ───
  { id: 'finance:beliefs', practiceId: 'finance', level: 1, label: 'Money Beliefs', description: 'Uncover hidden money stories', durationSec: 300, tags: ['beliefs', 'money'] },
  { id: 'finance:abundance', practiceId: 'finance', level: 2, label: 'Abundance Inquiry', description: 'Scarcity vs sufficiency', durationSec: 300, tags: ['abundance', 'scarcity'] },
  { id: 'finance:spending', practiceId: 'finance', level: 3, label: 'Conscious Spending', description: 'Values-aligned finances', durationSec: 180, tags: ['spending', 'values'] },
  { id: 'finance:generosity', practiceId: 'finance', level: 4, label: 'Generosity Practice', description: 'Giving as receiving', durationSec: 300, tags: ['generosity', 'giving'] },

  // ─── HEALTH ───
  { id: 'health:listening', practiceId: 'health', level: 1, label: 'Body Listening', description: 'What is my body saying?', durationSec: 180, tags: ['listening', 'body'] },
  { id: 'health:habit', practiceId: 'health', level: 2, label: 'Habit Awareness', description: 'Unconscious health patterns', durationSec: 180, tags: ['habit', 'pattern'] },
  { id: 'health:intention', practiceId: 'health', level: 3, label: 'Healing Intention', description: 'Mind-body connection', durationSec: 300, tags: ['healing', 'intention'] },
  { id: 'health:wholeness', practiceId: 'health', level: 4, label: 'Wholeness', description: 'Health as awareness expression', durationSec: 300, tags: ['wholeness', 'expression'] },
];

export function getMicroTechniquesForPractice(practiceId: PracticeId): MicroTechnique[] {
  return MICRO_TECHNIQUES.filter(t => t.practiceId === practiceId);
}

export function getMicroTechniqueById(id: string): MicroTechnique | undefined {
  return MICRO_TECHNIQUES.find(t => t.id === id);
}

export function getMicroTechniquesByTag(tag: string): MicroTechnique[] {
  return MICRO_TECHNIQUES.filter(t => t.tags.includes(tag));
}

export function getMicroTechniquesByLevel(practiceId: PracticeId, level: number): MicroTechnique[] {
  return MICRO_TECHNIQUES.filter(t => t.practiceId === practiceId && t.level === level);
}