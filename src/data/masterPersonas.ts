/**
 * MASTER PERSONAS — Guide personas for practices
 * ─────────────────────────────────────────────
 * 89+ masters from the roster, mapped to practices.
 */

import type { MasterPersona, MasterPersonas } from '@/types/session-config';

export const MASTER_PERSONAS: MasterPersona[] = [
  // ─── SELF-INQUIRY ───
  { id: 'ramana', name: 'Ramana Maharshi', tradition: 'Advaita Vedanta', practices: ['self-inquiry', 'witnessing', 'jnana'], style: 'silent', voiceProfile: { tone: 'silent', vocabulary: 'traditional', pacing: 'slow' }, signaturePractices: ['who-am-i', 'silent-inquiry'] },
  { id: 'krishnamurti', name: 'J. Krishnamurti', tradition: 'Post-traditional', practices: ['self-inquiry', 'observation', 'witnessing'], style: 'inquiry', voiceProfile: { tone: 'inquiry', vocabulary: 'modern', pacing: 'medium' }, signaturePractices: ['choiceless-awareness', 'thought-source'] },
  { id: 'nidargadatta', name: 'Nisargadatta Maharaj', tradition: 'Advaita Vedanta', practices: ['self-inquiry', 'jnana', 'witnessing'], style: 'direct', voiceProfile: { tone: 'direct', vocabulary: 'traditional', pacing: 'fast' }, signaturePractices: ['i-am-that', 'direct-seeing'] },
  { id: 'shankara', name: 'Adi Shankara', tradition: 'Advaita Vedanta', practices: ['jnana', 'self-inquiry'], style: 'direct', voiceProfile: { tone: 'direct', vocabulary: 'traditional', pacing: 'medium' }, signaturePractices: ['viveka-chudamani', 'neti-neti'] },

  // ─── BREATH/RAJA ───
  { id: 'patanjali', name: 'Patanjali', tradition: 'Raja Yoga', practices: ['breath', 'raja', 'kriya', 'body'], style: 'direct', voiceProfile: { tone: 'direct', vocabulary: 'traditional', pacing: 'slow' }, signaturePractices: ['ashtanga', 'pranayama', 'samadhi'] },
  { id: 'adiyogi', name: 'Adiyogi/Shiva', tradition: 'Shaivism', practices: ['kriya', 'tantra', 'kundalini', 'raja'], style: 'devotional', voiceProfile: { tone: 'devotional', vocabulary: 'traditional', pacing: 'medium' }, signaturePractices: ['kriya-yoga', 'spinal-breathing'] },
  { id: 'buddha', name: 'Buddha', tradition: 'Buddhism', practices: ['observation', 'witnessing', 'breath', 'body'], style: 'gentle', voiceProfile: { tone: 'gentle', vocabulary: 'simple', pacing: 'slow' }, signaturePractices: ['anapana', 'vipassana', 'four-foundations'] },
  { id: 'lao-tzu', name: 'Lao Tzu', tradition: 'Taoism', practices: ['witnessing', 'breath', 'body', 'observation'], style: 'silent', voiceProfile: { tone: 'silent', vocabulary: 'poetic', pacing: 'slow' }, signaturePractices: ['wu-wei', 'natural-breath'] },

  // ─── BHAKTI ───
  { id: 'rumi', name: 'Rumi', tradition: 'Sufism', practices: ['bhakti', 'witnessing', 'karma'], style: 'devotional', voiceProfile: { tone: 'devotional', vocabulary: 'poetic', pacing: 'medium' }, signaturePractices: ['sufi-whirling', 'heart-opening', 'divine-love'] },
  { id: 'meera', name: 'Meera Bai', tradition: 'Bhakti', practices: ['bhakti', 'karma'], style: 'devotional', voiceProfile: { tone: 'devotional', vocabulary: 'traditional', pacing: 'medium' }, signaturePractices: ['devotional-singing', 'surrender'] },
  { id: 'ramakrishna', name: 'Ramakrishna', tradition: 'Bhakti', practices: ['bhakti', 'witnessing', 'raja'], style: 'devotional', voiceProfile: { tone: 'devotional', vocabulary: 'simple', pacing: 'medium' }, signaturePractices: ['divine-mother', 'ecstatic-devotion'] },
  { id: 'hafiz', name: 'Hafiz', tradition: 'Sufism', practices: ['bhakti', 'creativity'], style: 'devotional', voiceProfile: { tone: 'devotional', vocabulary: 'poetic', pacing: 'medium' }, signaturePractices: ['poetic-devotion', 'joy'] },
  { id: 'kabir', name: 'Kabir', tradition: 'Bhakti', practices: ['bhakti', 'karma', 'jnana'], style: 'direct', voiceProfile: { tone: 'direct', vocabulary: 'simple', pacing: 'medium' }, signaturePractices: ['surrender', 'nondual-love'] },

  // ─── KARMA/ACTION ───
  { id: 'gita', name: 'Bhagavad Gita (Krishna)', tradition: 'Yoga', practices: ['karma', 'raja', 'bhakti', 'jnana'], style: 'direct', voiceProfile: { tone: 'direct', vocabulary: 'traditional', pacing: 'medium' }, signaturePractices: ['nishkama-karma', 'karma-yoga', 'non-attachment'] },
  { id: 'gandhi', name: 'Mahatma Gandhi', tradition: 'Satyagraha', practices: ['karma', 'relationship', 'health'], style: 'gentle', voiceProfile: { tone: 'gentle', vocabulary: 'simple', pacing: 'slow' }, signaturePractices: ['ahimsa', 'satyagraha', 'selfless-service'] },

  // ─── HEALING/SOMATIC ───
  { id: 'levine', name: 'Peter Levine', tradition: 'Somatic Experiencing', practices: ['emotional-healing', 'body', 'health'], style: 'gentle', voiceProfile: { tone: 'gentle', vocabulary: 'modern', pacing: 'slow' }, signaturePractices: ['somatic-tracking', 'vagus-regulation', 'titration'] },
  { id: 'van-der-kolk', name: 'Bessel van der Kolk', tradition: 'Trauma Healing', practices: ['emotional-healing', 'body', 'health'], style: 'direct', voiceProfile: { tone: 'direct', vocabulary: 'modern', pacing: 'medium' }, signaturePractices: ['body-awareness', 'trauma-release'] },
  { id: 'levine', name: 'Peter Levine', tradition: 'Somatic Experiencing', practices: ['emotional-healing', 'body', 'health'], style: 'gentle', voiceProfile: { tone: 'gentle', vocabulary: 'modern', pacing: 'slow' }, signaturePractices: ['somatic-tracking', 'vagus-regulation'] },

  // ─── TANTRA/ENERGY ───
  { id: 'abhinavagupta', name: 'Abhinavagupta', tradition: 'Kashmir Shaivism', practices: ['tantra', 'kundalini', 'raja'], style: 'devotional', voiceProfile: { tone: 'devotional', vocabulary: 'traditional', pacing: 'medium' }, signaturePractices: ['spanda', 'pratyabhijna', 'energy-mapping'] },
  { id: 'osho', name: 'Osho', tradition: 'Neo-Sannyas', practices: ['tantra', 'kundalini', 'meditation', 'creativity'], style: 'inquiry', voiceProfile: { tone: 'inquiry', vocabulary: 'modern', pacing: 'fast' }, signaturePractices: ['dynamic-meditation', 'kundalini-meditation', 'nataraj'] },

  // ─── RELATIONSHIP ───
  { id: 'hendricks', name: 'Gay Hendricks', tradition: 'Conscious Relationship', practices: ['relationship', 'karma', 'emotional-healing'], style: 'gentle', voiceProfile: { tone: 'gentle', vocabulary: 'modern', pacing: 'medium' }, signaturePractices: ['conscious-communication', 'upper-limit-problem'] },
  { id: 'gottman', name: 'John Gottman', tradition: 'Relationship Science', practices: ['relationship', 'emotional-healing'], style: 'direct', voiceProfile: { tone: 'direct', vocabulary: 'modern', pacing: 'medium' }, signaturePractices: ['four-horsemen', 'repair-attempts'] },

  // ─── WORK/CAREER ───
  { id: 'csikszentmihalyi', name: 'Mihaly Csikszentmihalyi', tradition: 'Flow Psychology', practices: ['work-career', 'creativity', 'karma'], style: 'direct', voiceProfile: { tone: 'direct', vocabulary: 'modern', pacing: 'medium' }, signaturePractices: ['flow-state', 'challenge-skill-balance'] },
  { id: 'frankl', name: 'Viktor Frankl', tradition: 'Logotherapy', practices: ['work-career', 'karma', 'healing'], style: 'direct', voiceProfile: { tone: 'direct', vocabulary: 'modern', pacing: 'slow' }, signaturePractices: ['meaning', 'attitude-choice'] },

  // ─── CREATIVITY ───
  { id: 'cameron', name: 'Julia Cameron', tradition: 'Creative Recovery', practices: ['creativity', 'bhakti', 'karma'], style: 'gentle', voiceProfile: { tone: 'gentle', vocabulary: 'modern', pacing: 'medium' }, signaturePractices: ['morning-pages', 'artist-date'] },
  { id: 'pressfield', name: 'Steven Pressfield', tradition: 'Creative Resistance', practices: ['creativity', 'karma', 'work-career'], style: 'direct', voiceProfile: { tone: 'direct', vocabulary: 'modern', pacing: 'fast' }, signaturePractices: ['resistance', 'turning-pro'] },

  // ─── FINANCE ───
  { id: 'kabat-zinn', name: 'Jon Kabat-Zinn', tradition: 'MBSR', practices: ['finance', 'observation', 'health', 'stress'], style: 'gentle', voiceProfile: { tone: 'gentle', vocabulary: 'modern', pacing: 'slow' }, signaturePractices: ['mindful-eating', 'body-scan', 'stress-reduction'] },

  // ─── SILENCE/MINIMAL ───
  { id: 'thich-nhat-hanh', name: 'Thich Nhat Hanh', tradition: 'Zen', practices: ['observation', 'breath', 'witnessing', 'walking'], style: 'gentle', voiceProfile: { tone: 'gentle', vocabulary: 'poetic', pacing: 'slow' }, signaturePractices: ['mindful-walking', 'bell-meditation', 'interbeing'] },
  { id: 'eckhart-tolle', name: 'Eckhart Tolle', tradition: 'Presence', practices: ['observation', 'witnessing', 'body'], style: 'gentle', voiceProfile: { tone: 'gentle', vocabulary: 'modern', pacing: 'slow' }, signaturePractices: ['power-of-now', 'pain-body', 'presence'] },
  { id: 'byron-katie', name: 'Byron Katie', tradition: 'The Work', practices: ['self-inquiry', 'jnana', 'emotional-healing'], style: 'direct', voiceProfile: { tone: 'direct', vocabulary: 'simple', pacing: 'medium' }, signaturePractices: ['the-work', 'four-questions', 'turnarounds'] },
];

export function getMasterForPractice(practiceId: string): MasterPersona | undefined {
  return MASTER_PERSONAS.find(m => m.practices.includes(practiceId as any));
}

export function getMastersForPractice(practiceId: string): MasterPersona[] {
  return MASTER_PERSONAS.filter(m => m.practices.includes(practiceId as any));
}

export function getMasterById(id: string): MasterPersona | undefined {
  return MASTER_PERSONAS.find(m => m.id === id);
}

export const DEFAULT_MASTER_PERSONAS: MasterPersonas = {
  'self-inquiry': 'ramana',
  'jnana': 'shankara',
  'breath': 'patanjali',
  'raja': 'patanjali',
  'kriya': 'adiyogi',
  'bhakti': 'rumi',
  'karma': 'gita',
  'tantra': 'abhinavagupta',
  'observation': 'buddha',
  'witnessing': 'lao-tzu',
  'body': 'levine',
  'emotional-healing': 'levine',
  'relationship': 'hendricks',
  'work-career': 'csikszentmihalyi',
  'creativity': 'cameron',
  'finance': 'kabat-zinn',
  'health': 'kabat-zinn',
  'loop-dissolution': 'krishnamurti',
};