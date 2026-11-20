/**
 * Energy Markers — behavioral signatures of prana and nadi dominance.
 * ─────────────────────────────────────────────────────────────────
 * The graph has always known the pranas (5) and nadis (3) as vocabulary, but
 * nothing said what they LOOK like in a person's Tuesday. This module gives
 * each channel a behavioral signature, the loops its imbalance mimics, and the
 * practice that re-balances it — the ki-layer equivalent of the stage markers.
 *
 * Corpus sources: Foundation Course Days 100–101 (kundalini + nadis), the
 * prana definitions in the graph node builders, the pranayama ladder, and the
 * standard Hatha mapping of the five vayus.
 */

import type { DimensionId } from '@/types/consciousness';
import type { LoopCategory } from '@/data/loops';

export type EnergyChannel =
  | 'prana' | 'apana' | 'samana' | 'udana' | 'vyana'   // the five vayus
  | 'ida' | 'pingala' | 'sushumna';                    // the three nadis

export type ChannelFamily = 'prana' | 'nadi';

export interface EnergyMarker {
  id: string;
  channel: EnergyChannel;
  family: ChannelFamily;
  label: string;                    // "Prana dominant — the inward current"
  dominance: string;                // one line: what dominates
  signature: string;                // behavioral signature, observable
  feltSense: string;                // from the inside
  dimension: DimensionId;
  misreadAsFamilies: LoopCategory[]; // loop categories this mimics
  misreadAsLoops: string[];          // specific loop ids it is confused with
  balancedBy: string[];              // practice ids
  balancing: string;                 // the one-line re-balance
  source: string;
}

export const ENERGY_MARKERS: EnergyMarker[] = [
  // ─── The five pranas (vayus) ───
  {
    id: 'prana-dominant',
    channel: 'prana',
    family: 'prana',
    label: 'Prana dominant — the inward current',
    dominance: 'Upward/forward vital breath rules the system.',
    signature:
      'Chest-forward breathing, reaching for the next input, taking in more than can be digested — information, food, tasks, conversations. Restless hunger with no object.',
    feltSense: 'Like a vacuum pulled forward and up. Full at the throat, empty at the belly.',
    dimension: 'body',
    misreadAsFamilies: ['avoidance', 'habit'],
    misreadAsLoops: ['AVD147', 'ATT168'],
    balancedBy: ['breath'],
    balancing: 'Lengthen the exhale until it is longer than the inhale — prana moves down when the breath goes down.',
    source: 'Graph prana definitions (upward/forward vital breath); pranayama ladder foundations.',
  },
  {
    id: 'apana-dominant',
    channel: 'apana',
    family: 'prana',
    label: 'Apana dominant — the downward current',
    dominance: 'Downward/outward elimination breath rules the system.',
    signature:
      'Heaviness, difficulty starting, things not getting finished — elimination without intake, withdrawal, low mood that lifts with movement and sunlight.',
    feltSense: 'Wet cement in the limbs. The day happens somewhere below you.',
    dimension: 'body',
    misreadAsFamilies: ['emotional', 'avoidance'],
    misreadAsLoops: ['EMO009', 'PRD001'],
    balancedBy: ['breath', 'kriya'],
    balancing: 'Uplifting breath (kapalabhati, brisk walking) and finishing one small thing — apana needs upward movement, not more rest.',
    source: 'Graph prana definitions (downward/outward elimination breath); guna reading in the corpus (tamas needs activation).',
  },
  {
    id: 'samana-dominant',
    channel: 'samana',
    family: 'prana',
    label: 'Samana dominant — the central current',
    dominance: 'Central digestive/metabolic breath rules the system.',
    signature:
      'Digestion and assimilation working well — experiences are processed rather than stored, balance between taking in and letting go, steady warmth at the navel center.',
    feltSense: 'Even digestion of life. Nothing sticks too long; nothing is rejected too fast.',
    dimension: 'body',
    misreadAsFamilies: [],
    misreadAsLoops: [],
    balancedBy: ['breath', 'body'],
    balancing: 'Maintain: eat and breathe with pauses between inputs. Samana is the state most practices aim to restore.',
    source: 'Graph prana definitions (central digestive/metabolic breath).',
  },
  {
    id: 'udana-dominant',
    channel: 'udana',
    family: 'prana',
    label: 'Udana dominant — the upward thrust at the throat',
    dominance: 'Upward thrusting breath at the throat rules the system.',
    signature:
      'Speech, swallowing, and expression dominate — the need to say it, project it, be heard; growth that outruns grounding.',
    feltSense: 'Pressure behind the sternum. Words arrive before the thought finishes.',
    dimension: 'action',
    misreadAsFamilies: ['validation'],
    misreadAsLoops: ['VAL011', 'VAL007'],
    balancedBy: ['breath', 'karma'],
    balancing: 'Ground before speaking — feet, one slow exhale, then the sentence. Humming routes udana back into the vagal channel.',
    source: 'Graph prana definitions (upward thrusting breath at throat); bhramari grounding protocol.',
  },
  {
    id: 'vyana-dominant',
    channel: 'vyana',
    family: 'prana',
    label: 'Vyana dominant — the pervading current',
    dominance: 'All-pervading circulatory breath rules the system.',
    signature:
      'Coordinated, whole-body movement — posture, circulation, and gesture work together; presence distributed evenly rather than concentrated.',
    feltSense: 'The body moves as one piece. Attention is everywhere at once rather than somewhere.',
    dimension: 'body',
    misreadAsFamilies: [],
    misreadAsLoops: [],
    balancedBy: ['body', 'tantra'],
    balancing: 'Whole-body movement practice (walking, tai-chi-like flow) — vyana trains through coordination, not concentration.',
    source: 'Graph prana definitions (all-pervading circulatory breath).',
  },

  // ─── The three nadis ───
  {
    id: 'ida-dominant',
    channel: 'ida',
    family: 'nadi',
    label: 'Ida dominant — the lunar channel runs the show',
    dominance: 'Left/lunar channel (rest, intuition, parasympathetic) dominates.',
    signature:
      'Passive, dreamy, receptive, emotionally tidal — good at receiving and sensing, poor at starting and finishing. Sleep and withdrawal are easy; decisions are not.',
    feltSense: 'Soft edges. Cool skin. Time negotiable.',
    dimension: 'emotion',
    misreadAsFamilies: ['avoidance', 'emotional'],
    misreadAsLoops: ['AVD147', 'CTL087'],
    balancedBy: ['kriya', 'breath'],
    balancing: 'Nadi shodhana with emphasis on the right channel; warm, activating practice; one completion per day.',
    source: 'Foundation Course Day 101 — Ida governs rest, intuition, the parasympathetic system; imbalance reads as passive/dreamy.',
  },
  {
    id: 'pingala-dominant',
    channel: 'pingala',
    family: 'nadi',
    label: 'Pingala dominant — the solar channel runs the show',
    dominance: 'Right/solar channel (action, logic, heat, sympathetic) dominates.',
    signature:
      'Driven, hot, analytical, productive — good at execution and argument, poor at rest and reception. Achieves, then cannot stop.',
    feltSense: 'Engine idling high. Sleep is a task to complete.',
    dimension: 'action',
    misreadAsFamilies: ['productivity', 'control'],
    misreadAsLoops: ['PRD001', 'VAL036'],
    balancedBy: ['breath', 'emotional-healing'],
    balancing: 'Nadi shodhana with emphasis on the left channel; cooling practices; scheduled non-productive time, protected like a meeting.',
    source: 'Foundation Course Day 101 — Pingala governs action, logic, heat, the sympathetic system; imbalance reads as driven/hot.',
  },
  {
    id: 'sushumna-open',
    channel: 'sushumna',
    family: 'nadi',
    label: 'Sushumna accessible — the central channel is available',
    dominance: 'Central channel opens only when Ida and Pingala balance.',
    signature:
      'Both nostrils relatively open, breath settles toward stillness on its own, sits become deep quickly without effort — the sign that the system has a working middle.',
    feltSense: 'The spine becomes a place attention can rest, not just a structure.',
    dimension: 'spirit',
    misreadAsFamilies: [],
    misreadAsLoops: [],
    balancedBy: ['breath', 'raja'],
    balancing: 'Protect the balance: alternate-nostril breathing before long sits. Sushumna is a consequence of balance, not a target of force.',
    source: 'Foundation Course Day 101 — Sushumna activated only when Ida and Pingala are balanced; kundalini rises through it.',
  },
];
