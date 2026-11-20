"use client";

/**
 * Ritual Markers — AI Emits, UI Renders
 * Guru-Shishya 5-Act Protocol
 * 
 * Act 1: Pranam (Arrival)
 * Act 2: Grounding (Presence)
 * Act 3: Upadesha (Guidance)
 * Act 4: Sadhana (Practice)
 * Act 5: Prasad (Integration)
 */

// ============================================
// MARKER CONSTANTS
// ============================================

export const RitualMarkers = {
  // Act 1: Pranam
  DURATION_PICK: '[DURATION_PICK]' as const,
  
  // Act 2: Grounding
  GROUNDING_QUESTION: '[GROUNDING_QUESTION]' as const,
  
  // Act 3: Upadesha
  REFLECT_PAUSE: (seconds: number) => `[REFLECT_PAUSE: ${seconds}]` as const,
  SHISHYA_VOICE: '[SHISHYA_VOICE]' as const,
  
  // Act 4: Sadhana
  INTENSITY_PICK: '[INTENSITY_PICK]' as const,
  POSTURE_CHECK: '[POSTURE_CHECK]' as const,
  PRACTICE_GUIDE: (name: string, rounds: number, secPerPhase: number) => 
    `[PRACTICE_GUIDE: ${name} | ${rounds} | ${secPerPhase}]` as const,
  PRACTICE: (title: string, minutes: number, cues?: string[]) => 
    `[PRACTICE: ${title} | ${minutes}${cues ? ` | ${cues.join(';')}` : ''}]` as const,
  PRECAUTION: (note: string) => `[PRECAUTION: ${note}]` as const,
  
  // Act 5: Prasad
  SANKALPA: (prompt: string) => `[SANKALPA: ${prompt}]` as const,
  HARVEST: (insight: string) => `[HARVEST: ${insight}]` as const,
  BLESSING_BOW: '[BLESSING_BOW]' as const,
};

// ============================================
// MARKER TYPES
// ============================================

export type RitualMarkerType = 
  | 'DURATION_PICK'
  | 'GROUNDING_QUESTION'
  | 'REFLECT_PAUSE'
  | 'SHISHYA_VOICE'
  | 'INTENSITY_PICK'
  | 'POSTURE_CHECK'
  | 'PRACTICE_GUIDE'
  | 'PRACTICE'
  | 'PRECAUTION'
  | 'SANKALPA'
  | 'HARVEST'
  | 'BLESSING_BOW';

export interface ParsedMarker {
  type: RitualMarkerType;
  raw: string;
  payload: Record<string, any>;
}

// ============================================
// PARSER — Extract markers from AI response
// ============================================

const MARKER_REGEX = /\[([A-Z_]+)(?:\s*:\s*([^\]]+))?\]/g;

export function parseRitualMarkers(text: string): { cleanText: string; markers: ParsedMarker[] } {
  const markers: ParsedMarker[] = [];
  let cleanText = text;
  
  // Find all markers
  const matches = text.matchAll(MARKER_REGEX);
  
  for (const match of matches) {
    const [fullMatch, type, payload] = match;
    const markerType = type as RitualMarkerType;
    
    let parsedPayload: Record<string, any> = {};
    
    if (payload) {
      // Parse payload based on marker type
      switch (markerType) {
        case 'REFLECT_PAUSE':
          parsedPayload.seconds = parseInt(payload.trim(), 10) || 30;
          break;
        case 'PRACTICE_GUIDE': {
          const [name, rounds, secPerPhase] = payload.split('|').map(s => s.trim());
          parsedPayload = { name, rounds: parseInt(rounds, 10) || 1, secPerPhase: parseInt(secPerPhase, 10) || 4 };
          break;
        }
        case 'PRACTICE': {
          const [pTitle, pMinutes, ...pCues] = payload.split('|').map(s => s.trim());
          parsedPayload = { title: pTitle, minutes: parseInt(pMinutes, 10) || 10, cues: pCues };
          break;
        }
        case 'PRECAUTION':
          parsedPayload = { note: payload.trim() };
          break;
        case 'SANKALPA':
          parsedPayload = { prompt: payload.trim() };
          break;
        case 'HARVEST':
          parsedPayload = { insight: payload.trim() };
          break;
        default:
          parsedPayload = { raw: payload.trim() };
      }
    }
    
    markers.push({
      type: markerType,
      raw: fullMatch,
      payload: parsedPayload,
    });
  }
  
  // Remove markers from text
  cleanText = text.replace(MARKER_REGEX, '').trim();
  
  return { cleanText, markers };
}

// ============================================
// STRIP MARKERS — For display without parsing
// ============================================

export function stripRitualMarkers(text: string): string {
  return text.replace(MARKER_REGEX, '').trim();
}

// ============================================
// HELPER — Check if text contains markers
// ============================================

export function hasRitualMarkers(text: string): boolean {
  return MARKER_REGEX.test(text);
}

// ============================================
// ACT DEFINITIONS — For UI orchestration
// ============================================

export interface RitualAct {
  number: number;
  name: string;
  sanskrit: string;
  markers: RitualMarkerType[];
  description: string;
}

export const RITUAL_ACTS: RitualAct[] = [
  {
    number: 1,
    name: 'Pranam',
    sanskrit: 'प्रणाम',
    markers: ['DURATION_PICK'],
    description: 'Arrival — choose your time container',
  },
  {
    number: 2,
    name: 'Grounding',
    sanskrit: 'आवाहन',
    markers: ['GROUNDING_QUESTION'],
    description: 'Presence — arrive in the body',
  },
  {
    number: 3,
    name: 'Upadesha',
    sanskrit: 'उपदेश',
    markers: ['REFLECT_PAUSE', 'SHISHYA_VOICE'],
    description: 'Guidance — receive the teaching',
  },
  {
    number: 4,
    name: 'Sadhana',
    sanskrit: 'साधना',
    markers: ['INTENSITY_PICK', 'POSTURE_CHECK', 'PRACTICE_GUIDE', 'PRACTICE', 'PRECAUTION'],
    description: 'Practice — embody the teaching',
  },
  {
    number: 5,
    name: 'Prasad',
    sanskrit: 'प्रसाद',
    markers: ['SANKALPA', 'HARVEST', 'BLESSING_BOW'],
    description: 'Integration — harvest the fruit',
  },
];

// ============================================
// DEFAULT OPTIONS FOR INTERACTIVE MARKERS
// ============================================

export const RITUAL_DEFAULTS = {
  DURATION_PICK: {
    options: [
      { value: 5, label: '5 min', description: 'A brief pause' },
      { value: 15, label: '15 min', description: 'A short session' },
      { value: 30, label: '30 min', description: 'A full practice' },
    ],
  },
  INTENSITY_PICK: {
    options: [
      { value: 'gentle', label: 'Gentle', description: 'Soft, restorative' },
      { value: 'standard', label: 'Standard', description: 'Balanced intensity' },
      { value: 'deep', label: 'Deep', description: 'Intense, transformative' },
    ],
  },
  SHISHYA_VOICE: {
    options: [
      { value: 'feel', label: 'I feel this', description: 'Resonance, openness' },
      { value: 'resist', label: 'I resist this', description: 'Contraction, defense' },
      { value: 'more', label: 'Tell me more', description: 'Curiosity, depth' },
    ],
  },
  REFLECT_PAUSE: {
    patterns: [
      { value: '4-7-8', label: '4-7-8 Breath', inhale: 4, hold: 7, exhale: 8 },
      { value: 'box', label: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, holdOut: 4 },
      { value: 'coherent', label: 'Coherent Breathing', inhale: 5.5, exhale: 5.5 },
    ],
  },
};