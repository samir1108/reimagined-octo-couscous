# Personalization Wizard — Full Session System Tuning

## Vision
A 16-screen guided flow (collapsible to 3 via smart defaults) that lets any user tune **every lever** of the session engine — from "I have 10 minutes and want focus" to "I'm a V4 Raja yogi doing 2-hour tantra immersions on heart chakra."

---

## Screen Map (16 screens, 5 phases)

### Phase 1: Foundation (4 screens) — *Mandatory for engine to run*

| # | Screen ID | Title | Key Input | DB Target | Validation |
|---|-----------|-------|-----------|-----------|------------|
| 1 | `time_anchor` | "When does your day start?" | wake_time, sleep_time, timezone | `profiles.wake_time`, `sleep_time`, `country` | wake < sleep, timezone valid |
| 2 | `session_capacity` | "How much time can you give?" | default_min (5-120), daily_max (15-480) | `profiles.default_session_min`, `daily_time_budget_min` | daily_max ≥ default_min |
| 3 | `rhythm_style` | "What's your rhythm?" | enum: `morning`/`night`/`shift`/`irregular` | `profiles.rhythm_type` | — |
| 4 | `commitment_tier` | "How consistent can you be?" | enum: `daily`/`regular`/`flexible`/`immersion` | `profiles.commitment_tier` | — |

**Auto-advance:** After screen 4, engine can generate a valid session. User sees "Continue to personalize" or "Start with this."

---

### Phase 2: Orientation (4 screens) — *Primary composer levers*

| # | Screen ID | Title | Key Input | DB Target | Validation |
|---|-----------|-------|-----------|-----------|------------|
| 5 | `focus_orientation` | "What's your mental orientation?" | 8-profile picker (radio cards) | `profiles.focus_profile` | — |
| 6 | `yoga_path` | "Which path calls you?" | 4 sliders (Raja/Jnana/Bhakti/Karma) sum=20 | `user_consciousness_profile.yoga_path_affinity` | Sum = 20 |
| 7 | `depth_preference` | "How deep do you want to go?" | enum: `micro`/`short`/`medium`/`deep` | `profiles.preferred_depth` | Must allow `default_session_min` |
| 8 | `ai_voice` | "Which voice guides you?" | enum: `head`/`heart`/`gut`/`rotate` + AI mode toggle | `profiles.ai_voice_preference`, `ai_mode` | — |

**Smart default for 5-8:** 4-question diagnostic → fills all 4.

---

### Phase 3: Practice Identity (4 screens) — *Capability space*

| # | Screen ID | Title | Key Input | DB Target | Validation |
|---|-----------|-------|-----------|-----------|------------|
| 9 | `practice_constellation` | "Rank your practices" | Drag-drop: 3 primary, 3 secondary, 6 dormant | `user_practice_constellation` (weight, status, level) | Exactly 3 primary, 3 secondary |
| 10 | `modality_mix` | "How do you like to practice?" | 4 sliders (Game/Practice/Experiment/Reflection) sum=100 | `profiles.modality_preference` | Sum = 100 |
| 11 | `chakra_focus` | "Any energy centers to emphasize?" | Multi-select 7 chakras (optional) | `profiles.chakra_focus` | Max 3 |
| 12 | `loop_approach` | "How should we work with your patterns?" | enum: `target`/`gentle`/`surprise` | `profiles.loop_approach` | — |

**Smart default for 9:** CinematicJourney data if completed; else equal weights.

---

### Phase 4: Life Integration (3 screens) — *Context engine*

| # | Screen ID | Title | Key Input | DB Target | Validation |
|---|-----------|-------|-----------|-----------|------------|
| 13 | `life_domains` | "What matters in your world?" | 12 domains: importance (1-10) + stress (1-10) | `life_domain_scores` (12 rows) | — |
| 14 | `priority_goal` | "What's your one thing?" | Free text → auto-tag domain + practice | `user_goals` (priority, secondary, domain) | Non-empty |
| 15 | `v_level_gate` | "What's your edge?" | ceiling (current V to 10), stretch (0-3) | `profiles.v_level_ceiling`, `v_stretch` | ceiling ≥ current V |

**Smart default for 13:** All 5/5 if no data.

---

### Phase 5: Preview & Commit (2 screens)

| # | Screen ID | Title | Action |
|---|-----------|-------|--------|
| 16 | `session_preview` | "Here's your session" | Calls orchestrator 3×, shows cards. Buttons: Regenerate / Perfect |
| 17 | `commit` | "Your engine is ready" | Writes `personalization_completed_at`, shows summary |

---

## State Machine

```typescript
type Phase = 'foundation' | 'orientation' | 'practice' | 'life' | 'preview';
type ScreenId = 'time_anchor' | 'session_capacity' | ... | 'commit';

interface WizardState {
  currentPhase: Phase;
  currentScreen: ScreenId;
  completedScreens: ScreenId[];
  answers: Record<ScreenId, any>;
  previewSessions: SessionPlan[];  // populated at phase 5
  smartDefaultsApplied: boolean;
}
```

**Transitions:**
- `NEXT` → next screen in phase, or first screen of next phase
- `BACK` → previous screen
- `JUMP(phase, screen)` → from Settings re-entry
- `SKIP_PHASE` → if smart defaults fill entire phase
- `REGENERATE_PREVIEW` → re-call orchestrator with current answers

---

## Smart Defaults Engine

```typescript
function computeSmartDefaults(answers: Partial<Answers>): Partial<Answers> {
  const defaults = {
    // Phase 1
    rhythm_type: inferFromWakeSleep(answers.wake_time, answers.sleep_time),
    commitment_tier: inferFromDailyMax(answers.daily_time_budget_min),
    
    // Phase 2
    focus_profile: 'balanced',
    yoga_path_affinity: diagnosticToAffinities(answers.diagnostic_answers),
    preferred_depth: minToDepth(answers.default_session_min),
    ai_voice_preference: 'rotate',
    ai_mode: 'fast',
    
    // Phase 3
    modality_preference: { game: 10, practice: 60, experiment: 10, reflection: 20 },
    chakra_focus: [],
    loop_approach: 'target',
    
    // Phase 4
    life_domain_scores: Array(12).fill({ importance: 5, score: 5 }),
    v_level_ceiling: (answers.current_v_level ?? 0) + 1,
    v_stretch: 1,
  };
  return { ...defaults, ...answers }; // user answers override
}
```

**Diagnostic (4 questions → fills screens 5-8):**
1. "When your mind races, what helps?" → focus orientation
2. "What draws you more: understanding, devotion, discipline, action?" → yoga path
3. "Do you prefer short frequent or long rare sessions?" → depth
4. "Analytical, heart-centered, or body-first guidance?" → AI voice

---

## Preview Generation (Screen 16)

```typescript
async function generatePreview(answers: Answers): Promise<SessionPlan[]> {
  const ctx = await buildLocalOrchestratorContext({
    intent: answers.priority_goal,
    timeBudgetMin: answers.default_session_min,
    energy: inferEnergy(answers), // from rhythm + time of day
    gate: getCurrentGate(),
    focusProfileId: answers.focus_profile,
  });
  
  // Generate 3 variants by varying energy + intent slightly
  return [
    orchestrateSession({ ...ctx, energy: 'low' }),
    orchestrateSession({ ...ctx, energy: 'medium' }),
    orchestrateSession({ ...ctx, energy: 'high' }),
  ];
}
```

**Preview card shows:** Archetype, practice kind, duration, gate, why-for-you line.

---

## Settings Re-entry

```
Settings → Personalization Wizard
  ├─ Phase 1 ✓ (4/4)  [Edit]
  ├─ Phase 2 ✓ (4/4)  [Edit]
  ├─ Phase 3 ○ (2/4)  [Continue]
  ├─ Phase 4 ○ (0/3)  [Start]
  └─ Phase 5 —        [Locked until 1-4 complete]
```

Clicking "Edit" on a completed phase jumps to its first screen with answers pre-filled.

---

## DB Tables & Columns (All Exist)

| Table | Columns Written by Wizard |
|-------|---------------------------|
| `profiles` | `focus_profile`, `ai_mode`, `ai_voice_preference`, `wake_time`, `sleep_time`, `country`, `rhythm_type`, `commitment_tier`, `default_session_min`, `daily_time_budget_min`, `preferred_depth`, `modality_preference` (JSON), `chakra_focus` (text[]), `loop_approach`, `v_level_ceiling`, `v_stretch`, `personalization_completed_at` |
| `user_consciousness_profile` | `yoga_path_affinity` (JSON) |
| `user_practice_constellation` | `practice_weight`, `practice_status`, `practice_level` × 12 |
| `life_domain_scores` | `domain`, `importance`, `score` × 12 |
| `user_goals` | `priority_goal`, `secondary_goals`, `life_domain`, `status` |

---

## Component Architecture

```
PersonalizationWizard (page)
├─ WizardProgress (top bar: 5 phase pills, current screen highlighted)
├─ WizardStep (renders current screen component)
│   ├─ TimeAnchorScreen
│   ├─ SessionCapacityScreen
│   ├─ RhythmStyleScreen
│   ├─ CommitmentTierScreen
│   ├─ FocusOrientationScreen (radio cards with emoji)
│   ├─ YogaPathScreen (4 sliders with sum=20 constraint)
│   ├─ DepthPreferenceScreen
│   ├─ AIVoiceScreen (voice cards + AI mode toggle)
│   ├─ PracticeConstellationScreen (drag-drop ranker)
│   ├─ ModalityMixScreen (4 sliders)
│   ├─ ChakraFocusScreen (7 chips)
│   ├─ LoopApproachScreen
│   ├─ LifeDomainsScreen (12 rows, dual sliders)
│   ├─ PriorityGoalScreen (textarea + auto-tag)
│   ├─ VLevelGateScreen (dual slider)
│   ├─ SessionPreviewScreen (3 session cards, regenerate button)
│   └─ CommitScreen (summary + confetti)
├─ WizardNav (Back / Next / Skip phase)
└─ DiagnosticModal (triggered before Phase 2 if smart defaults off)
```

---

## API Contracts

### Read current personalization (for Settings entry)
```typescript
GET /api/personalization/status
→ {
  completedPhases: Phase[],
  currentScreen: ScreenId,
  answers: Partial<Answers>,
  previewSessions?: SessionPlan[],
  completedAt: string | null
}
```

### Write answer (per screen, debounced)
```typescript
POST /api/personalization/answer
{ screenId: 'focus_orientation', answer: 'pure-focus-100' }
→ { ok: true, nextScreen: 'yoga_path' }
```

### Generate preview (Phase 5 entry)
```typescript
POST /api/personalization/preview
{ answers: Answers }
→ { sessions: SessionPlan[3] }
```

### Commit (final)
```typescript
POST /api/personalization/commit
{ answers: Answers }
→ { ok: true, completedAt: string }
```

---

## Integration Points

| System | Reads From | Trigger |
|--------|------------|---------|
| `orchestrateSession` | `profiles.focus_profile`, `yoga_path_affinity`, `preferred_depth`, `modality_preference`, `loop_approach`, `v_level_ceiling` | Session start |
| `compose-session-v3` | `userCtx.identity.focusProfile`, `yoga_path_affinity`, `practiceLevels`, `modality_preference` | AI enrichment |
| `selectArchetype` | `yoga_path_affinity`, `preferred_depth` (via `timeBudgetMin`) | Composer |
| `pickPracticeKind` | `focus_profile`, `loop_approach`, `modality_preference` | Orchestrator |
| `getUserContext` | All profile tables | Every engine call |

---

## Telemetry Events

| Event | Properties |
|-------|------------|
| `wizard_started` | `entry_point: 'onboarding' \| 'settings'` |
| `screen_completed` | `screen_id`, `time_ms`, `used_smart_default: boolean` |
| `phase_completed` | `phase`, `screens_in_phase`, `total_time_ms` |
| `preview_generated` | `answers_hash`, `session_count` |
| `preview_regenerated` | `regeneration_count` |
| `wizard_committed` | `total_screens_answered`, `total_time_ms`, `smart_defaults_used` |
| `wizard_abandoned` | `last_screen`, `phase`, `time_in_wizard_ms` |

---

## Rollout Flags

| Flag | Purpose |
|------|---------|
| `personalization_wizard_v1` | Enable wizard route |
| `smart_defaults_v1` | Enable 4Q diagnostic + auto-fill |
| `preview_regeneration_v1` | Allow regenerate in screen 16 |
| `settings_reentry_v1` | Enable Settings → Wizard link |

---

## Success Metrics

- **Completion rate** per phase (target: 80% → 60% → 40% → 30% → 90%)
- **Preview regeneration rate** (target: < 2 avg)
- **Session quality score** post-wizard vs pre-wizard (target: +15%)
- **Re-entry rate** from Settings (target: 20% of users within 30 days)
- **Time to first session** after commit (target: < 5 min)

---

## Next Steps

1. Create `PERSONALIZATION_WIZARD_SPEC.md` (this doc)
2. Build `PersonalizationWizard` page + state machine
3. Implement 17 screen components
4. Add API endpoints (`/api/personalization/*`)
5. Wire Settings entry point
6. Add telemetry
7. Feature flag rollout