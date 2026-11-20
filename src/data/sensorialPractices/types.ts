// Sensorial Practice Manifest — declarative spec for a fully multimodal
// guided session (TTS voiceover, STT replies, camera presence, mic breath,
// ambient video, image stills). The SensorialPracticeSession engine reads
// these manifests and lights up only the sensors each step requires.

export type StepModality =
  | "narrate"          // TTS only, hold for `holdMs` or until tap
  | "breath"           // mic breath meter + visual orb
  | "gaze"             // front camera, soft eye-presence ring
  | "voice_reply"      // STT — user answers a prompt aloud
  | "silence"          // pure stillness, optional ambient sound
  | "mantra"           // mic + repeating prompt overlay
  | "reflect_text";    // typed reflection (fallback, no sensors)

export interface SensorialStep {
  id: string;
  modality: StepModality;
  /** What the master says aloud during this step (TTS). */
  narration: string;
  /** Optional caption shown on screen while narration plays. */
  caption?: string;
  /** Image overlay (mudra, yantra, posture diagram). */
  imageUrl?: string;
  /** Auto-advance delay in ms after narration ends. If omitted, user taps. */
  holdMs?: number;
  /** For voice_reply: the question shown above the listening UI. */
  prompt?: string;
  /** For voice_reply: hard cap on listening, ms. */
  maxListenMs?: number;
}

export interface SensorialManifest {
  /** Stable key, e.g. "ramana:who-am-i" — used to look up by guru+practice. */
  key: string;
  guruId: string;
  /** Match against GuruPractice.name (case-insensitive substring ok). */
  practiceMatch: string;
  /** Display title (overrides practice name in the cinematic header). */
  title: string;
  /** Voice ID — ElevenLabs cloned/curated master voice. Falls back to default. */
  voiceId?: string;
  /** Ambient backdrop video URL (optional). */
  videoUrl?: string;
  /** Fallback backdrop image (always provided). */
  backdropImage: string;
  /** Sensors required across the whole session. */
  sensors: { mic?: boolean; camera?: boolean };
  /** Estimated total minutes for the closing screen. */
  totalMinutes: number;
  steps: SensorialStep[];
  /** Closing line spoken by the master. */
  closing: string;
}
