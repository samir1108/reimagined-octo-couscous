# 10000% Personalized Session System — Complete Architecture

## The Vision
Every session feels like it was designed *for this exact moment* by a master who knows your entire history, current state, and deepest intention — because it was.

---

## Layer 0: The Wizard (Done) — *User declares intent*
17 screens → writes to profile tables → engine reads.

---

## Layer 1: Engine Patches (5) — *Engine honors intent*

| # | Patch | File | Change |
|---|-------|------|--------|
| 1 | **Extended Archetype** | `composer/archetypes.ts` | New `extended` archetype: 60-480 min, 8-12 slots, multi-phase |
| 2 | **Chakra Filter** | `sessionOrchestrator.ts` | `chakra_focus` → filters `PRACTICE_TEMPLATES` by `primaryChakra` |
| 3 | **V-Stretch Gate** | `sessionOrchestrator.ts` | `v_stretch` → `maxLevel = currentV + v_stretch` in capability selection |
| 4 | **Modality Priority** | `sessionOrchestrator.ts` | `modality_preference` order → `CAPABILITY_TO_MODALITY` priority |
| 5 | **Retreat Composer** | `composer/composer.ts` | Multi-session plan: stitches 3-7 sessions across days with arc |

---

## Layer 2: Real-Time Context Injection — *Session adapts to NOW*

### Pre-Session (milliseconds before start)
```typescript
interface RealTimeContext {
  // Biometric (if available)
  hrv?: number;                    // → energy adjustment
  sleepQuality?: number;           // → depth ceiling
  stressMarker?: 'low'|'med'|'high'; // → loop_approach override
  
  // Environmental
  ambientNoise?: number;           // → guided vs silent
  locationType?: 'home'|'office'|'nature'|'transit'; // → practice modality
  
  // Calendar
  nextEventMinutes?: number;       // → hard time ceiling
  meetingDensity?: number;         // → stress domain weight
  
  // Recent digital behavior
  screenTimeLastHour?: number;     // → attention stability practice
  notificationCount?: number;      // → witness priority
}
```
**Integration:** `buildLocalOrchestratorContext` merges this into `OrchestratorContext` before `orchestrateSession`.

---

## Layer 3: Micro-Adaptation During Session — *Session breathes with you*

| Moment | Signal | Adaptation |
|--------|--------|------------|
| **0:00-2:00** | Settling speed (breath regularity) | Extend/shorten settle slot |
| **First practice** | Completion rate, quality self-report | Next practice difficulty ±1 level |
| **Mid-session** | HRV trend (if wearable) | Shift to calming/energizing |
| **Post-practice** | Reflection depth (word count, sentiment) | Adjust closing prompt depth |
| **Abandonment** | Exit point + reason | Logs to `loop_approach` learning |

**Implementation:** `GenerativeSession` runtime emits `session_signal` events → `orchestrateSession` can be re-called for remaining time (hot-swap).

---

## Layer 4: Long-Term Evolution Engine — *System learns you across months*

### A. Preference Learning (implicit)
```typescript
interface LearnedPreference {
  // What you actually complete
  completionByPractice: Record<Practice, { attempts: number; rate: number }>;
  completionByArchetype: Record<ArchetypeId, { attempts: number; rate: number }>;
  completionByDuration: Record<'micro'|'short'|'medium'|'deep', number>;
  
  // What you rate highly
  qualityByPractice: Record<Practice, number>;
  qualityByVoice: Record<'head'|'heart'|'gut', number>;
  qualityByGuru: Record<string, number>;
  
  // Time patterns
  bestGate: GateId;
  bestDuration: number;
  energyPattern: Record<GateId, 'low'|'med'|'high'>;
}
```
**Writes to:** `profiles.learned_preferences` (JSONB) nightly batch job.

### B. Loop Mastery Tracking
```typescript
interface LoopMastery {
  loopId: string;
  totalEncounters: number;
  dissolutionEvents: number;
  lastDissolutionAt: string;
  currentSeverity: number;
  effectivePractices: Practice[];  // what actually worked
  ineffectivePractices: Practice[];
}
```
**Used by:** `pickPracticeKind` → prioritizes `effectivePractices` for active loops.

### C. V-Level Calibration
```typescript
interface VLevelCalibration {
  currentV: number;
  confidence: number;        // 0-1, how sure we are
  practiceLevelsAtV: Record<Practice, number>;
  nextVRequirements: Practice[];  // what's missing for V+1
  regressionRisk: number;    // 0-1, based on streak/quality drops
}
```
**Used by:** `v_level_ceiling` auto-adjust, stretch recommendations.

---

## Layer 5: Cross-Context Intelligence — *One brain, many surfaces*

| Surface | Reads | Writes |
|---------|-------|--------|
| **Mobile app (sessions)** | All profile tables | Session outcomes, quality, reflections |
| **Watch/wearable** | HRV, HR, sleep | Real-time context for Layer 2 |
| **Desktop/web** | Full wizard, deep analytics | Goal updates, domain weights |
| **Notifications** | `loop_approach`, `rhythm_type` | Timing, tone, content |
| **Email digests** | Weekly patterns | Insights, next week preview |
| **AI Guide chat** | Full `UserContext` + `learned_preferences` | Conversation memory, suggestions |

**Unified identity:** All surfaces share `userId` + `sessionId` correlation.

---

## Layer 6: Generative Personalization — *AI composes the uncomposable*

### When rules aren't enough, LLM synthesizes:
```typescript
// Called by compose-session-v3 for edge cases
interface GenerativePersonalizationPrompt {
  userContext: UserContext;           // Full brain
  realTimeContext: RealTimeContext;   // Layer 2
  learnedPreferences: LearnedPreference; // Layer 4A
  loopMastery: LoopMastery[];         // Layer 4B
  vCalibration: VLevelCalibration;    // Layer 4C
  constraints: {
    timeBudgetMin: number;
    gate: GateId;
    hardConstraints: string[];        // "no journaling", "guided only"
  };
  intent: string;                     // User's stated need
}
```
**Output:** Complete session plan with *whyForYou* for every step referencing specific signals.

**Fallback:** If LLM fails → deterministic orchestrator (never broken).

---

## Layer 7: Social/Field Resonance — *Personalization beyond self*

| Feature | Personalization Lever |
|---------|----------------------|
| **Sangha sync** | "Your sangha is doing heart-opening today" → optional alignment |
| **Teacher transmission** | Live guru session → inherits guru's `yoga_path_affinity` for 24h |
| **Collective field** | Global stress map (anonymous) → adjusts `stressedDomains` weight |
| **Lineage calendar** | Guru purnima, solstices, tradition dates → auto-theme |

---

## The 10000% Stack Summary

| Layer | What It Does | Status |
|-------|--------------|--------|
| 0: Wizard | User declares 50+ preferences | ✅ Spec done |
| 1: Engine Patches | Engine reads all preferences | ⏳ 5 patches |
| 2: Real-Time Context | Biometric/environment/calendar | 🔮 Design needed |
| 3: Micro-Adaptation | Session hot-swaps mid-flow | 🔮 Design needed |
| 4: Long-Term Learning | Implicit preference engine | 🔮 Batch jobs |
| 5: Cross-Context | Unified brain across surfaces | 🔮 Architecture |
| 6: Generative AI | LLM for edge cases | ✅ compose-session-v3 |
| 7: Field Resonance | Social/tradition alignment | 🔮 Future |

---

## Implementation Priority

| Sprint | Deliverable |
|--------|-------------|
| 1 | Wizard + 5 engine patches (Layers 0-1) |
| 2 | Real-time context API + wearable integration (Layer 2) |
| 3 | Micro-adaptation runtime + telemetry (Layer 3) |
| 4 | Nightly learning jobs + V-calibration (Layer 4) |
| 5 | Cross-context sync + unified identity (Layer 5) |
| 6+ | Generative refinement + field resonance (Layers 6-7) |

---

## The Test: "Is it 10000%?"

A user with:
- 10 min, morning, high stress, V2, Raja path, focus profile
- Wears Oura ring (poor sleep, low HRV)
- Has meeting in 15 min
- Active avoidance loop + work domain stress
- Prefers gut voice, guided audio, no journaling
- Last 3 sessions: completed breath, skipped inquiry

**Gets:** 10-min `micro` archetype, `breath` practice (pranayama), guided audio only, 1-sentence closing, "Your sleep was rough — this breath reset steadies you for the meeting" whyForYou.

**Another user same time:**
- 90 min, evening, calm, V5, Jnana path, self-inquiry profile
- Good sleep, high HRV
- No meetings
- Active inquiry loop + purpose domain
- Prefers head voice, silent practice
- Last 3 sessions: deep inquiry, high quality

**Gets:** 90-min `extended` archetype, `inquiry` → `jnana` → `witness` chain, silent with minimal guidance, 10-min reflection, "Your inquiry loop is ripe — this session takes it to the edge" whyForYou.

**Same engine. Completely different sessions. That's 10000%.**