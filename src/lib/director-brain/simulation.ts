// ─────────────────────────────────────────────────────────────────────────────
// DIRECTOR BRAIN — Simulation Engine
// Predicts what happens when you change a creative decision
// "What if we changed this from wide shot to close-up?"
// ─────────────────────────────────────────────────────────────────────────────

import type {
  SimulationRequest, SimulationResult, SimulationChange,
  ShotPrediction, PredictionDifference, AudienceImpact,
  Shot, ShotTechnical, EmotionState
} from './types';
import { getShotById } from './data/titanic';
import type { Emotion } from './types';
import { getRuleByTechnique } from './film-grammar';

export function simulateChange(request: SimulationRequest): SimulationResult {
  const shot = getShotById('film-titanic-1997', request.shotId);
  if (!shot) {
    return {
      original: { emotionalEffect: { primary: 'unknown' as Emotion, intensity: 0, valence: 'neutral' }, narrativeEffect: 'Unknown', audienceExperience: 'Unknown', visualImpact: 'Unknown' },
      modified: { emotionalEffect: { primary: 'unknown' as Emotion, intensity: 0, valence: 'neutral' }, narrativeEffect: 'Unknown', audienceExperience: 'Unknown', visualImpact: 'Unknown' },
      differences: [],
      audienceImpact: { attentionChange: 0, emotionalEngagementChange: 0, comprehensionChange: 0, memorabilityChange: 0 }
    };
  }

  const original = predictShotEffect(shot);
  const modifiedShot = applyChanges(shot, request.changes);
  const modified = predictShotEffect(modifiedShot);

  const differences = calculateDifferences(original, modified, request.changes);
  const audienceImpact = calculateAudienceImpact(original, modified, request.changes);

  return { original, modified, differences, audienceImpact };
}

function predictShotEffect(shot: Shot): ShotPrediction {
  const emotion = shot.emotion;
  const tech = shot.technical;

  const visualImpact = `${tech.shotSize} framing with ${tech.cameraMovement} movement creates ${tech.composition} composition. ${tech.lighting} lighting produces ${emotion.valence} atmosphere.`;

  const audienceExperience = `${emotion.primary} at ${emotion.intensity}% intensity. ${shot.audienceEffect}`;

  return {
    emotionalEffect: emotion,
    narrativeEffect: shot.narrativePurpose,
    audienceExperience,
    visualImpact
  };
}

function applyChanges(shot: Shot, changes: SimulationChange[]): Shot {
  const modified: Shot = JSON.parse(JSON.stringify(shot));

  for (const change of changes) {
    const key = change.parameter;
    if (key in modified.technical) {
      (modified.technical as unknown as Record<string, unknown>)[key] = change.to;
    }
    // Update derived properties based on change
    if (key === 'shotSize') {
      updateEmotionForShotSize(modified, change.to as string);
    }
    if (key === 'cameraMovement') {
      updateEmotionForMovement(modified, change.to as string);
    }
    if (key === 'lighting') {
      updateEmotionForLighting(modified, change.to as string);
    }
  }

  return modified;
}

function updateEmotionForShotSize(shot: Shot, newSize: string): void {
  const wideSizes = ['extreme-wide', 'wide', 'full'];
  const closeSizes = ['close-up', 'extreme-close-up'];

  if (wideSizes.includes(newSize)) {
    if (shot.emotion.primary === 'intimacy' || shot.emotion.primary === 'vulnerability') {
      shot.emotion.primary = 'wonder';
      shot.emotion.intensity = Math.min(100, shot.emotion.intensity + 10);
      shot.emotion.valence = 'positive';
    }
  } else if (closeSizes.includes(newSize)) {
    if (shot.emotion.primary === 'wonder' || shot.emotion.primary === 'liberation') {
      shot.emotion.primary = 'intimacy';
      shot.emotion.intensity = Math.min(100, shot.emotion.intensity + 15);
      shot.emotion.valence = 'positive';
    }
  }
}

function updateEmotionForMovement(shot: Shot, newMovement: string): void {
  if (newMovement === 'static') {
    shot.emotion.intensity = Math.max(0, shot.emotion.intensity - 10);
  } else if (newMovement === 'handheld') {
    if (shot.emotion.primary === 'tension' || shot.emotion.primary === 'fear') {
      shot.emotion.intensity = Math.min(100, shot.emotion.intensity + 20);
    }
  } else if (newMovement === 'dolly-in') {
    shot.emotion.intensity = Math.min(100, shot.emotion.intensity + 10);
  }
}

function updateEmotionForLighting(shot: Shot, newLighting: string): void {
  if (newLighting === 'low-key' || newLighting === 'chiaroscuro') {
    if (shot.emotion.valence === 'positive') {
      shot.emotion.valence = 'mixed';
    }
    shot.emotion.intensity = Math.min(100, shot.emotion.intensity + 10);
  } else if (newLighting === 'high-key') {
    shot.emotion.valence = 'positive';
  }
}

function calculateDifferences(original: ShotPrediction, modified: ShotPrediction, changes: SimulationChange[]): PredictionDifference[] {
  const diffs: PredictionDifference[] = [];

  for (const change of changes) {
    const key = change.parameter;

    if (key === 'shotSize') {
      const fromWide = isWideShot(String(change.from));
      const toWide = isWideShot(String(change.to));
      if (fromWide !== toWide) {
        diffs.push({
          aspect: 'Emotional Distance',
          before: fromWide ? 'Environmental scale, freedom, or isolation' : 'Psychological intimacy, vulnerability',
          after: toWide ? 'Environmental scale, freedom, or isolation' : 'Psychological intimacy, vulnerability',
          magnitude: 'dramatic'
        });
        diffs.push({
          aspect: 'Audience Relationship',
          before: fromWide ? 'Observer — watching from outside' : 'Participant — inside the character\'s experience',
          after: toWide ? 'Observer — watching from outside' : 'Participant — inside the character\'s experience',
          magnitude: 'dramatic'
        });
      }
    }

    if (key === 'cameraMovement') {
      diffs.push({
        aspect: 'Visual Energy',
        before: getMovementEnergy(String(change.from)),
        after: getMovementEnergy(String(change.to)),
        magnitude: 'moderate'
      });
    }

    if (key === 'lighting') {
      diffs.push({
        aspect: 'Emotional Tone',
        before: getLightingTone(String(change.from)),
        after: getLightingTone(String(change.to)),
        magnitude: 'moderate'
      });
    }

    if (key === 'duration' || key === 'shotDuration') {
      const fromDur = Number(change.from);
      const toDur = Number(change.to);
      diffs.push({
        aspect: 'Temporal Experience',
        before: fromDur > 8 ? 'Contemplative — time to feel' : fromDur > 4 ? 'Standard — balanced' : 'Urgent — rapid pace',
        after: toDur > 8 ? 'Contemplative — time to feel' : toDur > 4 ? 'Standard — balanced' : 'Urgent — rapid pace',
        magnitude: Math.abs(fromDur - toDur) > 5 ? 'dramatic' : 'moderate'
      });
    }
  }

  // Add emotion difference if changed
  if (original.emotionalEffect.primary !== modified.emotionalEffect.primary) {
    diffs.push({
      aspect: 'Primary Emotion',
      before: `${original.emotionalEffect.primary} (${original.emotionalEffect.intensity}%)`,
      after: `${modified.emotionalEffect.primary} (${modified.emotionalEffect.intensity}%)`,
      magnitude: 'dramatic'
    });
  }

  return diffs;
}

function calculateAudienceImpact(original: ShotPrediction, modified: ShotPrediction, changes: SimulationChange[]): AudienceImpact {
  let attention = 0, emotional = 0, comprehension = 0, memorability = 0;

  for (const change of changes) {
    if (change.parameter === 'shotSize') {
      const fromClose = isCloseShot(String(change.from));
      const toClose = isCloseShot(String(change.to));
      if (!fromClose && toClose) {
        emotional += 25;
        attention += 15;
        memorability += 10;
        comprehension -= 5; // lose environmental context
      } else if (fromClose && !toClose) {
        emotional -= 10;
        attention -= 5;
        comprehension += 20; // gain environmental context
        memorability += 15; // wide shots more iconic
      }
    }
    if (change.parameter === 'cameraMovement') {
      if (change.to === 'handheld') { attention += 20; emotional += 15; }
      if (change.to === 'static') { attention -= 10; emotional -= 5; comprehension += 10; }
      if (change.to === 'dolly-in') { attention += 15; emotional += 20; }
    }
    if (change.parameter === 'lighting') {
      if (change.to === 'low-key' || change.to === 'chiaroscuro') { emotional += 15; memorability += 10; }
      if (change.to === 'high-key') { emotional -= 5; comprehension += 10; }
    }
  }

  return {
    attentionChange: clamp(attention, -100, 100),
    emotionalEngagementChange: clamp(emotional, -100, 100),
    comprehensionChange: clamp(comprehension, -100, 100),
    memorabilityChange: clamp(memorability, -100, 100)
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function isWideShot(size: string): boolean {
  return ['extreme-wide', 'wide', 'full'].includes(size);
}
function isCloseShot(size: string): boolean {
  return ['close-up', 'extreme-close-up'].includes(size);
}
function getMovementEnergy(movement: string): string {
  const map: Record<string, string> = {
    static: 'Stillness — observational, contemplative',
    'dolly-in': 'Approaching — building tension or intimacy',
    'dolly-out': 'Retreating — revealing context or ending',
    tracking: 'Following — maintaining connection',
    handheld: 'Chaos — visceral, immediate, unstable',
    crane: 'Ascending — epic, god-like perspective',
    steadicam: 'Floating — smooth, dreamlike',
    pan: 'Scanning — revealing space'
  };
  return map[movement] || movement;
}
function getLightingTone(lighting: string): string {
  const map: Record<string, string> = {
    'high-key': 'Open, safe, optimistic',
    'low-key': 'Mysterious, dangerous, morally complex',
    chiaroscuro: 'Dramatic, high contrast, film noir',
    natural: 'Realistic, grounded, authentic',
    practical: 'Intimate, warm, diegetic',
    silhouette: 'Mythic, anonymous, universal',
    'backlit': 'Romantic, ethereal, halo effect'
  };
  return map[lighting] || lighting;
}
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// ── Quick Simulation Presets ────────────────────────────────────────────────

export function simulateWideToCloseUp(shotId: string): SimulationResult {
  return simulateChange({
    shotId,
    changes: [{ parameter: 'shotSize', from: 'wide', to: 'close-up' }]
  });
}

export function simulateCloseUpToWide(shotId: string): SimulationResult {
  return simulateChange({
    shotId,
    changes: [{ parameter: 'shotSize', from: 'close-up', to: 'wide' }]
  });
}

export function simulateStaticToHandheld(shotId: string): SimulationResult {
  return simulateChange({
    shotId,
    changes: [{ parameter: 'cameraMovement', from: 'static', to: 'handheld' }]
  });
}

export function simulateAddTension(shotId: string): SimulationResult {
  return simulateChange({
    shotId,
    changes: [
      { parameter: 'shotSize', from: 'wide', to: 'medium-close' },
      { parameter: 'cameraMovement', from: 'static', to: 'dolly-in' },
      { parameter: 'lighting', from: 'high-key', to: 'low-key' }
    ]
  });
}
