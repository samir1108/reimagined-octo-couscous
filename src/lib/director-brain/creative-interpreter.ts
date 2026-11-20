// ─────────────────────────────────────────────────────────────────────────────
// DIRECTOR BRAIN — Creative Interpreter
// Translates subjective creative feedback into technical parameters
// "It feels too safe" → specific technical causes
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CreativeFeedback, InterpretedFeedback, TechnicalCause, RecommendedChange,
  Shot, ShotTechnical
} from './types';
import { getShotById } from './data/titanic';

// ── Feedback Pattern Database ───────────────────────────────────────────────

interface FeedbackPattern {
  pattern: RegExp;
  keywords: string[];
  causes: TechnicalCause[];
  recommendations: Omit<RecommendedChange, 'current' | 'suggested'>[];
}

const feedbackPatterns: FeedbackPattern[] = [
  {
    pattern: /too safe|too boring|too predictable|feels flat|nothing happening|stale/i,
    keywords: ['safe', 'boring', 'predictable', 'flat', 'stale'],
    causes: [
      { category: 'Camera', specific: 'Camera too static', explanation: 'Static shots without movement can feel observational rather than participatory', likelihood: 85 },
      { category: 'Composition', specific: 'Composition too balanced', explanation: 'Perfect symmetry and centered framing can feel controlled and lifeless', likelihood: 80 },
      { category: 'Lighting', specific: 'Lighting too even', explanation: 'Even, flat lighting removes drama and visual tension', likelihood: 75 },
      { category: 'Performance', specific: 'Performance too controlled', explanation: 'Over-controlled acting reads as artificial', likelihood: 70 },
      { category: 'Editing', specific: 'Cutting too predictable', explanation: 'Predictable rhythm creates no surprise or discovery', likelihood: 78 },
      { category: 'Sound', specific: 'Sound design too clean', explanation: 'Overly polished sound lacks texture and reality', likelihood: 60 }
    ],
    recommendations: [
      { parameter: 'cameraMovement', expectedEffect: 'Add energy and unpredictability', priority: 'high' },
      { parameter: 'composition', expectedEffect: 'Create visual tension through asymmetry', priority: 'high' },
      { parameter: 'lighting', expectedEffect: 'Introduce contrast and shadow for drama', priority: 'medium' },
      { parameter: 'editRhythm', expectedEffect: 'Vary shot duration to create surprise', priority: 'medium' }
    ]
  },
  {
    pattern: /too chaotic|too fast|can't follow|confusing|disorienting|overwhelming/i,
    keywords: ['chaotic', 'fast', 'confusing', 'disorienting', 'overwhelming'],
    causes: [
      { category: 'Editing', specific: 'Cuts too rapid', explanation: 'Sub-second cuts prevent the brain from orienting', likelihood: 90 },
      { category: 'Camera', specific: 'Handheld too aggressive', explanation: 'Excessive camera movement creates physical discomfort', likelihood: 85 },
      { category: 'Composition', specific: 'No clear focal point', explanation: 'Busy compositions without hierarchy confuse the eye', likelihood: 80 },
      { category: 'Sound', specific: 'Too many audio layers', explanation: 'Competing sounds create cognitive overload', likelihood: 75 }
    ],
    recommendations: [
      { parameter: 'shotDuration', expectedEffect: 'Give the audience time to orient', priority: 'high' },
      { parameter: 'cameraStability', expectedEffect: 'Stabilize camera for grounding', priority: 'high' },
      { parameter: 'composition', expectedEffect: 'Simplify — establish clear focal point', priority: 'medium' },
      { parameter: 'soundLayers', expectedEffect: 'Reduce competing audio elements', priority: 'medium' }
    ]
  },
  {
    pattern: /not emotional enough|doesn't feel|no connection|cold|distant|detached/i,
    keywords: ['emotional', 'feel', 'connection', 'cold', 'distant', 'detached'],
    causes: [
      { category: 'Camera', specific: 'Too much distance', explanation: 'Wide shots maintain emotional distance from characters', likelihood: 88 },
      { category: 'Shot Size', specific: 'Not enough close-ups', explanation: 'Close-ups trigger mirror neurons for empathy', likelihood: 85 },
      { category: 'Performance', specific: 'Blocking too distant', explanation: 'Characters too far apart reduces intimacy', likelihood: 75 },
      { category: 'Sound', specific: 'Music too sparse or absent', explanation: 'Music is the most direct emotional signal', likelihood: 80 },
      { category: 'Lighting', specific: 'Lighting too clinical', explanation: 'Flat, even lighting lacks emotional color', likelihood: 70 }
    ],
    recommendations: [
      { parameter: 'shotSize', expectedEffect: 'Move closer to create intimacy', priority: 'high' },
      { parameter: 'music', expectedEffect: 'Add or strengthen musical cue', priority: 'high' },
      { parameter: 'closeUps', expectedEffect: 'Insert reaction shots for empathy', priority: 'medium' },
      { parameter: 'lighting', expectedEffect: 'Warm the lighting for emotional color', priority: 'medium' }
    ]
  },
  {
    pattern: /too slow|dragging|boring pace|nothing happens|long/i,
    keywords: ['slow', 'dragging', 'pace', 'boring', 'long'],
    causes: [
      { category: 'Editing', specific: 'Shot duration too long', explanation: 'Extended takes without internal momentum lose attention', likelihood: 88 },
      { category: 'Camera', specific: 'Camera too static', explanation: 'No movement = no visual energy', likelihood: 80 },
      { category: 'Narrative', specific: 'No narrative progression', explanation: 'Scenes without forward momentum feel static', likelihood: 85 },
      { category: 'Sound', specific: 'Pacing of dialogue too slow', explanation: 'Long pauses without purpose feel like dead air', likelihood: 70 }
    ],
    recommendations: [
      { parameter: 'shotDuration', expectedEffect: 'Shorten takes to increase pace', priority: 'high' },
      { parameter: 'cameraMovement', expectedEffect: 'Add movement for visual energy', priority: 'medium' },
      { parameter: 'editPoints', expectedEffect: 'Find earlier cut points', priority: 'high' }
    ]
  },
  {
    pattern: /too dark|can't see|too bright|blinding|exposure/i,
    keywords: ['dark', 'bright', 'see', 'exposure', 'blinding'],
    causes: [
      { category: 'Lighting', specific: 'Exposure too low or too high', explanation: 'Incorrect exposure removes visual information', likelihood: 92 },
      { category: 'Lighting', specific: 'Contrast too extreme', explanation: 'Crushed blacks or blown highlights lose detail', likelihood: 85 }
    ],
    recommendations: [
      { parameter: 'exposure', expectedEffect: 'Adjust to reveal subject detail', priority: 'high' },
      { parameter: 'contrast', expectedEffect: 'Reduce extreme contrast range', priority: 'high' }
    ]
  },
  {
    pattern: /claustrophobic|trapped|tight|suffocating|closed in/i,
    keywords: ['claustrophobic', 'trapped', 'tight', 'suffocating', 'closed'],
    causes: [
      { category: 'Shot Size', specific: 'Too many close-ups', explanation: 'Tight framing reduces visual escape routes', likelihood: 85 },
      { category: 'Composition', specific: 'No negative space', explanation: 'Filled frames create compression', likelihood: 80 },
      { category: 'Lens', specific: 'Focal length too long', explanation: 'Telephoto compresses space', likelihood: 75 },
      { category: 'Lighting', specific: 'No visual depth', explanation: 'Flat lighting removes spatial cues', likelihood: 70 }
    ],
    recommendations: [
      { parameter: 'shotSize', expectedEffect: 'Widen framing to release tension', priority: 'high' },
      { parameter: 'negativeSpace', expectedEffect: 'Add breathing room around subject', priority: 'high' },
      { parameter: 'lens', expectedEffect: 'Widen lens to expand space', priority: 'medium' }
    ]
  },
  {
    pattern: /want more tension|needs suspense|build tension|anticipation/i,
    keywords: ['tension', 'suspense', 'anticipation', 'build'],
    causes: [
      { category: 'Editing', specific: 'Pacing too even', explanation: 'Uniform rhythm creates no anticipation', likelihood: 80 },
      { category: 'Sound', specific: 'No sonic tension', explanation: 'Lack of dissonance or silence removes unease', likelihood: 85 },
      { category: 'Camera', specific: 'No movement toward subject', explanation: 'Dolly-in creates anticipation', likelihood: 75 },
      { category: 'Lighting', specific: 'Too much visibility', explanation: 'Shadows create uncertainty and dread', likelihood: 78 }
    ],
    recommendations: [
      { parameter: 'editRhythm', expectedEffect: 'Gradually shorten shots to build urgency', priority: 'high' },
      { parameter: 'soundDesign', expectedEffect: 'Add low frequencies or strategic silence', priority: 'high' },
      { parameter: 'cameraMovement', expectedEffect: 'Slow dolly-in to create unease', priority: 'medium' },
      { parameter: 'lighting', expectedEffect: 'Reduce fill light to add shadows', priority: 'medium' }
    ]
  }
];

// ── Main Interpreter ─────────────────────────────────────────────────────────

export function interpretFeedback(feedback: CreativeFeedback): InterpretedFeedback {
  const { feedback: text, context } = feedback;
  const shot = context.shotId ? getShotById(context.filmId || 'film-titanic-1997', context.shotId) : undefined;

  // Find matching patterns
  const matches = feedbackPatterns.filter(p => p.pattern.test(text));

  if (matches.length === 0) {
    return {
      originalFeedback: text,
      possibleCauses: [{
        category: 'General',
        specific: 'Feedback not recognized',
        likelihood: 50,
        explanation: 'Try phrases like "too safe", "too chaotic", "not emotional enough", "too slow", "too dark", "claustrophobic", or "needs more tension"'
      }],
      recommendedChanges: [],
      confidence: 30
    };
  }

  // Merge causes from all matching patterns
  const allCauses: TechnicalCause[] = [];
  const allRecommendations: RecommendedChange[] = [];

  for (const match of matches) {
    for (const cause of match.causes) {
      const existing = allCauses.find(c => c.specific === cause.specific);
      if (existing) {
        existing.likelihood = Math.min(100, existing.likelihood + 5);
      } else {
        allCauses.push({ ...cause });
      }
    }
    for (const rec of match.recommendations) {
      allRecommendations.push({
        ...rec,
        current: shot ? getTechnicalValue(shot, rec.parameter) : 'unknown',
        suggested: suggestChange(shot, rec.parameter)
      });
    }
  }

  // Sort by likelihood
  allCauses.sort((a, b) => b.likelihood - a.likelihood);
  allRecommendations.sort((a, b) => {
    const prio = { high: 3, medium: 2, low: 1 };
    return prio[b.priority] - prio[a.priority];
  });

  return {
    originalFeedback: text,
    possibleCauses: allCauses.slice(0, 6),
    recommendedChanges: allRecommendations.slice(0, 5),
    confidence: Math.min(95, 60 + matches.length * 15)
  };
}

function getTechnicalValue(shot: Shot, parameter: string): string {
  const tech = shot.technical;
  switch (parameter) {
    case 'cameraMovement': return tech.cameraMovement;
    case 'shotSize': return tech.shotSize;
    case 'composition': return tech.composition;
    case 'lighting': return tech.lighting;
    case 'shotDuration': return `${shot.duration}s`;
    case 'music': return tech.soundDesign.music;
    default: return String(tech[parameter as keyof ShotTechnical] || 'unknown');
  }
}

function suggestChange(shot: Shot, parameter: string): string {
  const suggestions: Record<string, Record<string, string>> = {
    cameraMovement: { static: 'dolly-in', 'dolly-in': 'handheld', handheld: 'steadicam', 'steadicam': 'crane' },
    shotSize: { 'extreme-wide': 'wide', wide: 'medium', medium: 'medium-close', 'medium-close': 'close-up', 'close-up': 'extreme-close-up' },
    composition: { 'center-frame': 'rule-of-thirds', 'rule-of-thirds': 'negative-space', 'symmetry': 'diagonals', 'negative-space': 'frame-within-frame' },
    lighting: { 'high-key': 'low-key', 'low-key': 'chiaroscuro', 'natural': 'motivated', 'practical': 'silhouette' },
    shotDuration: { '15': '8', '12': '6', '8': '5', '5': '3', '3': '2' }
  };

  const current = getTechnicalValue(shot, parameter);
  if (suggestions[parameter] && suggestions[parameter][current]) {
    return suggestions[parameter][current];
  }
  return 'adjust based on context';
}

// ── Emotion-to-Technical Mapping ────────────────────────────────────────────

export function emotionToTechnique(emotion: string): {
  camera: string;
  lens: string;
  composition: string;
  lighting: string;
  sound: string;
  editing: string;
} {
  const map: Record<string, ReturnType<typeof emotionToTechnique>> = {
    claustrophobia: {
      camera: 'Gradually reduce framing: wide → medium → close-up',
      lens: 'Controlled focal-length progression: wide → telephoto',
      composition: 'Reduce negative space, fill frame with constraints',
      lighting: 'Reduce visual escape routes, compress shadows',
      sound: 'Increase proximity, reduce ambience, add low frequencies',
      editing: 'Gradually shorten shot duration to increase pressure'
    },
    wonder: {
      camera: 'Wide to extreme-wide, crane up to reveal scale',
      lens: 'Wide or ultra-wide for environmental scale',
      composition: 'Negative space, subject small in vast frame',
      lighting: 'Natural golden hour, backlit for halo effect',
      sound: 'Rich ambience, building orchestral score',
      editing: 'Long duration to let awe build, slow transitions'
    },
    intimacy: {
      camera: 'Close-up, shallow depth of field',
      lens: 'Short telephoto (85mm) for natural perspective',
      composition: 'Center frame or tight rule-of-thirds',
      lighting: 'Warm practical sources, soft key',
      sound: 'Reduce ambience, emphasize breathing/dialogue',
      editing: 'Longer takes, fewer cuts, reaction shots'
    },
    tension: {
      camera: 'Slow dolly-in or static with long lens',
      lens: 'Telephoto to compress space',
      composition: 'Asymmetry, Dutch angle if extreme',
      lighting: 'Low-key, hard shadows, motivated sources',
      sound: 'Strategic silence, low drones, no music',
      editing: 'Gradually shorten shots, J-cuts for unease'
    },
    liberation: {
      camera: 'Crane up and wide, tracking with movement',
      lens: 'Wide for environmental context',
      composition: 'Negative space, subject free in frame',
      lighting: 'Natural golden/warm, high-key',
      sound: 'Full orchestral swell, rich ambience',
      editing: 'Long duration, match cuts for flow'
    }
  };

  return map[emotion.toLowerCase()] || {
    camera: 'Medium shot, eye-level',
    lens: 'Standard (50mm)',
    composition: 'Rule-of-thirds',
    lighting: 'Natural or motivated',
    sound: 'Balanced ambience and dialogue',
    editing: 'Standard continuity'
  };
}
