-wei.ts
├── krishnamurti-choiceless-awareness.ts
├── krishna-karma-yoga-intent.ts
├── heart-coherence.ts
├── frankl-meaning-logbook.ts
├── dogen-shikantaza.ts
├── buddha-body-scan.ts
├── buddha-anapanasati.ts
├── babaji-kriya-rounds.ts
└── ... (25+ total)
```

Each script exports a structured practice definition:
```typescript
interface SensorialPractice {
  id: string;
  name: string;
  tradition: string;
  master: string;
  duration: number;           // seconds
  difficulty: number;         // 1-5
  instructions: string[];     // Step-by-step guidance
  audioNarration?: string;    // Narration script for TTS
  visualGuidance?: string;    // Visual cues for the UI
  breathPattern?: BreathPattern;
  somaticComponents?: string[];
}
```

## 9.1.5 Wisdom Cards & Knowledge

```typescript
// src/data/knowledgeCards.ts
// 50+ daily wisdom cards with neuroscience commentary

interface KnowledgeCard {
  id: string;
  quote: string;
  author: string;
  tradition: string;
  category: string;
  neuroscience: string;       // Why this works, scientifically
  practice: string;           // How to apply it
  relatedDimension: string;   // Which dimension it targets
  relatedLoop?: string;       // Which loop it helps dissolve
}

// src/data/wisdomDeck.ts
// 50 one-line wisdom cards — swipeable deck for the Experience

// src/data/stageHandbook.ts
// 8-band stage handbook — for each V-Level band:
// - Identity ("The Sleeper", "The Observer", etc.)
// - 30+ markers (how to recognize this stage)
// - Inner experience description
// - Yoga path fit
// - Start-here practices
// - Common traps
// - Bridge to next band
```

## 9.1.6 Micro-Practices (60-second drops)

```typescript
// src/data/microPractices.ts
// 8+ 60-second awareness practices

const MICRO_PRACTICES = [
  {
    id: 'box-breath',
    name: 'Box Breath',
    duration: 60,
    instructions: ['Inhale 4s', 'Hold 4s', 'Exhale 4s', 'Hold 4s'],
    targetDimension: 'body',
  },
  {
    id: 'feet-on-ground',
    name: 'Feet on Ground',
    duration: 60,
    instructions: ['Feel both feet', 'Notice contact', 'Widen awareness'],
    targetDimension: 'body',
  },
  {
    id: 'three-things',
    name: 'Three Things',
    duration: 60,
    instructions: ['See three things', 'Hear three things', 'Feel three things'],
    targetDimension: 'thought',
  },
  {
    id: 'soften-jaw',
    name: 'Soften Jaw',
    duration: 60,
    instructions: ['Notice jaw tension', 'Allow softening', 'Let it spread'],
    targetDimension: 'body',
  },
  {
    id: 'one-thank-you',
    name: 'One Thank-You',
    duration: 60,
    instructions: ['Find one thing', 'Feel gratitude', 'Let it land'],
    targetDimension: 'emotion',
  },
  {
    id: 'label-thought',
    name: 'Label Thought',
    duration: 60,
    instructions: ['Notice thought', 'Label: "thinking"', 'Return to awareness'],
    targetDimension: 'thought',
  },
  {
    id: 'long-exhale',
    name: 'Long Exhale',
    duration: 60,
    instructions: ['Inhale 4s', 'Exhale 8s', 'Repeat'],
    targetDimension: 'body',
  },
];
```

## 9.2 Content Quality Assessment

```
Content System Scorecard
─────────────────────────────────────────────────────────
Loops (300+)              A    (Comprehensive taxonomy, well-categorized)
Programs (120+)           A-   (Structured, varied difficulty levels)
Games (270+)              A    (Creative, diverse, many with Canvas variants)
Sensorial Practices (25+) B+   (Authentic traditions, well-documented)
Wisdom Cards              B+   (Cross-tradition, neuroscience-backed)
Stage Handbook            A-   (Detailed per-band, actionable)
Micro-Practices           B    (Good but only 8 — needs expansion)
Showroom Programs         B+   (30+ programs, audience-tagged)
Foundation Course         C    (Exists but DISABLED in code)
Content Consistency       B    (Some duplication between v2/v3 programs)
```

---







# PART 10 — ANALYTICS & VISUALIZATION

## 10.1 Analytics Component Inventory

```
src/components/analytics/ (30 components)
├── ConsciousnessLoom.tsx        -- Main consciousness visualization
├── CouncilOfYogis.tsx           -- Multi-master council view
├── SpiritualDNAPanel.tsx        -- Spiritual DNA profile display
├── LifeDomainPanel.tsx          -- Life domain radar/bar charts
├── DimensionHumanMap.tsx        -- Human body dimension map
├── RadarChart.tsx               -- Generic radar chart for dimensions
├── ChakrasLayer.tsx             -- Chakra balance visualization
├── ArchetypesLayer.tsx          -- Archetype distribution
├── PsycheLayer.tsx              -- Psyche/psychological layers
├── PatternsLayer.tsx            -- Pattern/loop visualization
├── PredictiveInsightsLayer.tsx  -- ML-predicted insights
├── OverviewLayer.tsx            -- High-level overview dashboard
├── WeeklyMirrorModal.tsx        -- Weekly reflection modal
├── ElderTake.tsx                -- Elder/master perspective
├── LineageCard.tsx              -- Guru lineage display
├── AncestorsLetterCard.tsx      -- Ancestor letter UI
├── BandGuidebookModal.tsx       -- Band progression guide
└── ... (14 more analytics components)
```

## 10.2 Analytics Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  ANALYTICS LAYER                                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Data Sources:                                                   │
│  ├── user_consciousness_profile (current state)                 │
│  ├── consciousness_signals (time-series)                        │
│  ├── v_level_history (progression over time)                    │
│  ├── practice_history (practice frequency/quality)              │
│  ├── user_loops (loop status changes)                           │
│  ├── sacred_moments (breakthrough markers)                      │
│  └── life_domain_scores (domain wellbeing)                      │
│                                                                  │
│  Processing:                                                     │
│  ├── Client-side: React components + Recharts                   │
│  ├── Server-side: predictive-insights edge function             │
│  └── Periodic: aggregate-daily-dimensions edge function         │
│                                                                  │
│  Output:                                                         │
│  ├── ConsciousnessLoom — radial consciousness map                │
│  ├── RadarChart — 6-dimension spider chart                       │
│  ├── CouncilOfYogis — multi-master consensus view                │
│  ├── PredictiveInsights — ML-driven predictions                 │
│  └── WeeklyMirror — weekly synthesis modal                       │
└──────────────────────────────────────────────────────────────────┘
```

## 10.3 Predictive Analytics

```typescript
// supabase/functions/predictive-insights/
// Generates predictions about user trajectory

interface PredictiveInsight {
  type: 'churn_risk' | 'breakthrough_imminent' | 'loop_resolution' | 'level_up';
  confidence: number;           // 0.0 - 1.0
  timeframe: string;            // '3_days' | '7_days' | '14_days' | '30_days'
  description: string;
  recommendedAction: string;
}

// supabase/functions/predict-churn/
// Churn prediction model

interface ChurnPrediction {
  userId: string;
  churnRisk: number;            // 0.0 - 1.0
  riskFactors: string[];
  intervention: string;
  confidence: number;
}
```

---







# PART 11 — ENTERPRISE & ADMIN SYSTEMS

## 11.1 Enterprise Module

The enterprise module is a **full B2B wellness platform** built into the same codebase:

```
enterprise/
├── Organization Management
│   ├── organizations (settings, plan, seats)
│   ├── teams (sub-groups within org)
│   ├── org_members (users + roles)
│   └── org_invites (email invitations)
│
├── Wellness Programs
│   ├── org_programs (organization-specific programs)
│   ├── org_program_participants (enrollment)
│   ├── wellness_challenges (time-bound challenges)
│   └── challenge_participants (challenge enrollment)
│
├── Analytics & Reporting
│   ├── org_consciousness_snapshots (aggregated state)
│   ├── org_quarterly_reports (PDF-ready reports)
│   ├── mood_pulses (real-time mood tracking)
│   └── enterprise-insights edge function
│
├── People Intelligence
│   ├── enterprise-people-intelligence edge function
│   └── manager-coaching edge function
│
└── UI Components (20+)
    ├── EnterpriseLayout.tsx
    ├── ChallengeLeaderboard.tsx
    ├── ConsciousnessHeatMap.tsx
    ├── MoodPulseWidget.tsx
    ├── MoodTrendsChart.tsx
    ├── QuarterlyReport.tsx
    ├── WeeklyBriefingCard.tsx
    ├── WorkplaceLoopsLibrary.tsx
    ├── AIInsightsPanel.tsx
    └── CoachingTalkingPoints.tsx
```

**Edge Functions (8 enterprise functions):**
```
enterprise-insights/
enterprise-people-intelligence/
org-program-designer/
org-weekly-briefing/
manager-coaching/
seed-demo-org/
admin-ai-insights/
admin-broadcast/
admin-copilot/
```

## 11.2 Admin Module

```
admin/
├── User Management
│   ├── UserTable.tsx (user listing + actions)
│   └── admin-ai-insights (AI-powered admin insights)
│
├── Communication
│   ├── admin-broadcast (broadcast messaging)
│   └── admin-copilot (AI copilot for admins)
│
├── Monitoring
│   ├── rate_limits (rate limit tracking)
│   ├── admin_activity_log (admin action audit)
│   ├── impersonation_logs (admin impersonation tracking)
│   └── security_audit_log (security events)
│
└── AI Management
    ├── prompt_versions (prompt versioning)
    ├── prompt_evals (prompt evaluation results)
    └── training_examples (fine-tuning data)
```

## 11.3 Billing System

```
billing/
├── user_credits (credit balance per user)
├── credit_transactions (transaction log)
├── ai_usage_log (per-request usage tracking)
├── ai_cost_logs (cost aggregation)
│
├── razorpay-order (order creation)
├── razorpay-verify (payment verification)
│
└── Credit Costs (paise-denominated)
    ├── text-generation-gpt4: 50 paise
    ├── text-generation-gpt4-long: 150 paise
    ├── tts-standard: 10 paise
    ├── tts-premium: 30 paise
    └── stt: 5 paise per minute
```

**Note:** The credit system uses **paise** (1/100 of a rupee), indicating Indian market focus via Razorpay.

---







# PART 12 — MOBILE & PLATFORM

## 12.1 Capacitor Configuration

```typescript
// capacitor.config.ts
export default {
  appId: 'app.satyug.yogic-companion',
  appName: 'SATYUG',
  webDir: 'dist',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
  plugins: {
    Health: {
      // Apple HealthKit / Android Health Connect
    },
  },
};
```

## 12.2 Mobile-Specific Features

| Feature | Implementation | File |
|---------|---------------|------|
| **Haptics** | `useHaptics.ts` — vibration feedback for interactions | `src/hooks/useHaptics.ts` |
| **HealthKit** | Capacitor Health plugin — HRV, sleep, steps | `capacitor.config.ts` |
| **PWA** | vite-plugin-pwa — service worker, offline support | `vite.config.ts` |
| **Splash Screens** | 12 iOS splash images (iPhone X through 14 Pro Max, iPad Pro) | `public/splash/` |
| **Freshness Guard** | `useAppFreshness.ts` — polls version.json to force refresh | `src/hooks/useAppFreshness.ts` |
| **Mobile Breakpoints** | `use-mobile.tsx` — responsive detection | `src/hooks/use-mobile.tsx` |
| **Camera Breath** | `useCameraBreath.ts` — camera-based breath detection | `src/hooks/useCameraBreath.ts` |
| **PWA Meta** | theme-color, apple-mobile-web-app-capable in index.html | `index.html` |

## 12.3 PWA Configuration

```typescript
// vite.config.ts — PWA plugin config
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
  manifest: {
    name: 'SATYUG — Consciousness Companion',
    short_name: 'SATYUG',
    theme_color: '#1a1a2e',
    background_color: '#0f0f1a',
    display: 'standalone',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: { cacheName: 'google-fonts-cache' },
      },
    ],
  },
});
```

---







# PART 13 — USER FLOW DIAGRAMS







## 13.1 Complete User Flow







```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER OPENS APP                              │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  APP ENTRY MACHINE (appEntryMachine.ts)                             │
│  ───────────────────────────────────────────────────────────────── │
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │
│  │ Is auth?    │──no▶│ AuthScreen  │    │ Has completed           │ │
│  │             │    │             │    │ onboarding?             │ │
│  └─────────────┘    └─────────────┘    └───────────┬─────────────┘ │
│         │ yes                                       │               │
│         ▼                                           ▼ no            │
│  ┌─────────────────┐                        ┌──────────────────┐   │
│  │ Loading...      │                        │ Onboarding Flow  │   │
│  │ (auth check)    │                        │                  │   │
│  └────────┬────────┘                        │ Quick Questions  │   │
│           │                                  │ → Path Picker    │   │
│           │                                  │ → Loop Swipe     │   │
│           │                                  │ → Lifestyle      │   │
│           │                                  │ → Goals          │   │
│           │                                  │                  │   │
│           │                                  │ Pre-Journey Gate │   │
│           │                                  │ → Philosophy     │   │
│           │                                  │ → Foundation     │   │
│           │                                  │ → Assessment     │   │
│           │                                  └────────┬─────────┘   │
│           │                                             │            │
│           └─────────────┬─────────────────────────────┘            │
│                         │ complete                                  │
│                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    TIME GATE SELECTION                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │  │
│  │  │ Morning  │  │ Midday   │  │ Evening  │  │   Night      │ │  │
│  │  │ Gate     │  │ Gate     │  │ Gate     │  │   Sanctuary  │ │  │
│  │  │ (6-12)   │  │ (12-17)  │  │ (17-21)  │  │   (21-6)     │ │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │  │
│  │       └──────────────┴──────────────┴──────────────┘        │  │
│  │                        │                                    │  │
│  └────────────────────────┼────────────────────────────────────┘  │
│                           │                                       │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  HOME SCREEN (Home.tsx — 968 lines)                                 │
│  ───────────────────────────────────────────────────────────────── │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    TIME SLOT CARDS                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │   Morning    │  │   Midday     │  │   Evening    │      │  │
│  │  │   Practice   │  │   Practice   │  │   Practice   │      │  │
│  │  │   [15 min]   │  │   [10 min]   │  │   [20 min]   │      │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │  │
│  │         │                 │                  │                │  │
│  │         └─────────────────┼──────────────────┘                │  │
│  │                           │                                    │  │
│  │  ┌────────────────────────┴──────────────────────────┐      │  │
│  │  │              [TAP TO BEGIN SESSION]                │      │  │
│  │  └────────────────────────────────────────────────────┘      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  COMPANION ORB                                                │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │                                                        │  │  │
│  │  │               ◉ (animated orb)                         │  │  │
│  │  │                                                        │  │  │
│  │  │  "Good morning. Today's theme is Surrender in Action." │  │  │
│  │  │                                                        │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  QUICK ACTIONS                                               │  │
│  │  [Practice] [Journal] [Programs] [Temple] [Community]        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SESSION FLOW (sessionMachine.ts)                                   │
│  ───────────────────────────────────────────────────────────────── │
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │
│  │   LOADING   │───▶│  TEACHING   │───▶│       PRACTICE          │ │
│  │             │    │             │    │                         │ │
│  │ "Preparing  │    │ Master      │    │ 270+ game components    │ │
│  │  your       │    │ introduces  │    │ loaded based on         │ │
│  │  session..."│    │ theme       │    │ SessionPlan.practices[] │ │
│  └─────────────┘    └──────┬──────┘    └───────────┬─────────────┘ │
│                            │                        │               │
│                            │    NEXT_SECTION        │ COMPLETE      │
│                            │◀───────────────────────│               │
│                            │                        ▼               │
│                            │              ┌────────────────────┐   │
│                            │              │   REFLECTION       │   │
│                            │              │                    │   │
│                            │              │ "What arose for    │   │
│                            │              │  you in practice?" │   │
│                            │              │                    │   │
│                            │              │ Chat interface +   │   │
│                            │              │ journal prompt     │   │
│                            │              └──────────┬─────────┘   │
│                            │                         │              │
│                            │    NEXT_SECTION         │ COMPLETE     │
│                            │◀────────────────────────│              │
│                            │                         ▼              │
│                            │              ┌────────────────────┐   │
│                            │              │    INTEGRATION     │   │
│                            │              │                    │   │
│                            │              │ Action item +      │   │
│                            │              │ micro-practice     │   │
│                            │              │ for the day         │   │
│                            │              └──────────┬─────────┘   │
│                            │                         │              │
│                            │    COMPLETE              │              │
│                            │◀────────────────────────┘              │
│                            │                                         │
│                            ▼                                         │
│                   ┌─────────────────┐                               │
│                   │   COMPLETED     │                               │
│                   │                 │                               │
│                   │ XP awarded      │                               │
│                   │ V-Level updated │                               │
│                   │ Memory saved    │                               │
│                   │ Next session    │                               │
│                   │ suggested       │                               │
│                   └─────────────────┘                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```









## 13.2 Session Composition Flow







```
┌─────────────────────────────────────────────────────────────────────┐
│              SESSION COMPOSITION (compose-session-v3)                │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  INPUT: userId, timeSlot, surface, userText                         │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  1. BUILD USER CONTEXT                                              │
│     ─────────────────────────────────────────────────────────────  │
│     Query DB for:                                                   │
│     ├── user_consciousness_profile (band, dimensions, V-Level)     │
│     ├── user_loops (active loops)                                   │
│     ├── life_domain_scores (6 domains)                              │
│     ├── spiritual_dna (practice preferences)                       │
│     ├── user_practice_constellation (mastery levels)               │
│     ├── temple_journeys (active arc)                                │
│     └── sessions (recent session history)                           │
│                                                                     │
│     Output: TheBrainSnapshot                                         │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. RUN CONSCIOUSNESS ENGINE                                        │
│     ─────────────────────────────────────────────────────────────  │
│     Compute:                                                        │
│     ├── V-Level v2 (40% geo + 30% harm + 20% min + 10% max)       │
│     ├── Band + microLevel                                           │
│     ├── Integration Score (action + connection multiplier)          │
│     ├── Time decay (if gap > 1 day)                                │
│     ├── Archetype detection                                         │
│     ├── Bypassing risk (5 contributions)                            │
│     └── State detection (dark_night / bypassing / plateau / etc.)  │
│                                                                     │
│     Output: consciousnessProfile                                    │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. SELECT MASTER                                                   │
│     ─────────────────────────────────────────────────────────────  │
│     masterRotation(ctx) → based on:                                │
│     ├── Journey day                                                 │
│     ├── Active loops (loop → master mapping)                        │
│     ├── Life domain stress                                          │
│     ├── Time of day                                                 │
│     └── Rotation rules                                              │
│                                                                     │
│     Output: masterId                                                │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. RUN CHAKRA ENGINE                                               │
│     ─────────────────────────────────────────────────────────────  │
│     Weighted voting:                                                │
│     ├── Weakest dimension (weight 2)                                │
│     ├── Top active loop archetype (weight 3)                        │
│     ├── Stressed life domain (weight 2)                             │
│     ├── Samskara chakra correlations (weight 2)                     │
│     └── Bypassing risk → solar (weight 1)                           │
│                                                                     │
│     Output: primaryChakra + secondaryChakra                         │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. RUN ARC ENGINE                                                  │
│     ─────────────────────────────────────────────────────────────  │
│     Given active arc + today's signals:                             │
│     ├── resolvePhase(arc, template) → ground/deepen/integrate      │
│     ├── resolveVoice(arcVoice, templateVoice, dnaPaths)            │
│     ├── lunarFlavor(todayISO) → new/full/waxing/waning             │
│     ├── seasonalFlavor(todayISO) → spring/summer/etc.              │
│     └── buildArcDirective(input) → chapter directive                │
│                                                                     │
│     Output: arcDirective                                            │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6. SELECT PRACTICE                                                 │
│     ─────────────────────────────────────────────────────────────  │
│     practiceEngine(ctx) → additive scoring:                         │
│     ├── Weakest core practice (+10)                                 │
│     ├── Anchor path (+5)                                            │
│     ├── Growth path if anchor plateauing (+7)                       │
│     ├── Active loops (+8 each)                                      │
│     ├── Life domain stress (+6 each)                                │
│     ├── Cross-pollination (+4)                                      │
│     ├── Weakest dimension (+3)                                      │
│     └── Specialty gating (exclude if not qualified)                 │
│                                                                     │
│     Output: practiceId + practiceLevel                               │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  7. COMPOSE SESSION PLAN                                            │
│     ─────────────────────────────────────────────────────────────  │
│     metricsEngine.compose(ctx, practice, theme):                   │
│     ├── Apply 30/50/20 formula                                      │
│     ├── teaching: select teaching blocks from tradition pack        │
│     ├── practices: build practice[] from SessionPlan               │
│     ├── reflection: generate reflection prompt                      │
│     ├── integrate: build action item + micro-practice              │
│     ├── cinematicDirective: color, mood, visual                    │
│     └── whyThis: rationale for each selection                       │
│                                                                     │
│     Output: SessionPlan                                             │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  8. GENERATE AI CONTENT                                             │
│     ─────────────────────────────────────────────────────────────  │
│     invoke('generate-session-agenda', { plan, master, ctx }):      │
│     ├── Build system prompt (base + directive + context)           │
│     ├── Call LLM (GPT-4 / Claude)                                  │
│     ├── Generate teaching text                                      │
│     ├── Generate practice narration                                 │
│     ├── Generate reflection prompts                                 │
│     └── Generate integration action                                 │
│                                                                     │
│     Output: GeneratedSession (with AI text content)                 │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  9. BUILD ADAPTIVE DIRECTIVE (for this session's AI)                │
│     ─────────────────────────────────────────────────────────────  │
│     adaptiveEngine.buildAdaptiveDecision(ctx):                     │
│     ├── computeState() → UserStateVector                           │
│     ├── detectEdgeCases() → string[]                               │
│     ├── detectStage() → 0-7                                        │
│     ├── getGate(hour) → gateId                                     │
│     ├── determineEntryContext() → context type                     │
│     ├── routeAgents() → 2-3 agent IDs                              │
│     ├── decideInsight() → depth + reveal level                     │
│     └── buildDirective() → formatted prompt block                  │
│                                                                     │
│     Output: directive (injected into AI system prompt)              │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  10. RETURN SESSION PLAN + DIRECTIVE                                │
│    ─────────────────────────────────────────────────────────────  │
│    Response to client:                                              │
│    {                                                               │
│      plan: GeneratedSession,                                        │
│      directive: AdaptiveDecision,                                   │
│      consciousness: ConsciousnessProfile,                           │
│      chakra: ChakraResult,                                          │
│      arc: ArcDirective                                              │
│    }                                                               │
└─────────────────────────────────────────────────────────────────────┘
```









## 13.3 Adaptive Directive Flow (Per-Turn)









```
┌─────────────────────────────────────────────────────────────────────┐
│              ADAPTIVE DIRECTIVE (Every AI Turn)                     │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  USER SENDS MESSAGE                                                │
│  "I'm feeling anxious about my work situation"                     │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  EDGE FUNCTION INVOKED (e.g., guide-chat, session-adapter)         │
│  ────────────────────────────────────────────────────────────────  │
│  Before calling LLM, invoke adaptive-engine:                        │
│                                                                     │
│  const adaptiveInput = {                                           │
│    userText: "I'm feeling anxious about my work situation",        │
│    hour: 10,                                                       │
│    daysSinceLastSession: 1,                                        │
│    sessionsToday: 0,                                               │
│    totalSessionCount: 45,                                          │
│    surface: 'session',                                             │
│    band: 3,                                                        │
│    currentVLevel: 3.4,                                             │
│    activeLoops: ['validation-seeking', 'control'],                 │
│    bypassingRisk: 0.15,                                            │
│    fragilityScore: 0.2,                                            │
│    lastEmotion: 'hopeful',                                         │
│    lastIntent: 'seeking',                                          │
│  };                                                                │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ADAPTIVE ENGINE COMPUTES                                           │
│  ────────────────────────────────────────────────────────────────  │
│                                                                     │
│  computeState(adaptiveInput):                                      │
│  ├── emotionTone: 'anxiety' (detected from text)                   │
│  ├── emotionalValence: -0.3 (negative)                             │
│  ├── awarenessLevel: 'expanding'                                   │
│  ├── awarenessDepth: 0.6 (based on band 3)                         │
│  ├── resistanceLevel: 0.2 (low)                                    │
│  ├── clarityLevel: 0.4 (anxiety reduces clarity)                   │
│  ├── intentStrength: 0.7 (seeking help)                            │
│  ├── trustInSystem: 0.8 (45 sessions, consistent)                  │
│  ├── cognitiveLoad: 0.1 (first session today)                      │
│  ├── intent: 'seeking'                                             │
│  └── fragility: 0.2 (low)                                          │
│                                                                     │
│  detectEdgeCases(state):                                           │
│  └── [] (no edge cases — normal anxiety, not crisis)               │
│                                                                     │
│  detectStage(state):                                               │
│  └── 3 (Consistent witness — based on awareness + trust)           │
│                                                                     │
│  routeAgents(state, edgeCases, stage):                             │
│  └── ['companion', 'pattern-finder', 'witness-keeper']             │
│                                                                     │
│  decideInsight(state, stage):                                      │
│  └── { depth: 'framework', revealLevel: 2 }                        │
│                                                                     │
│  buildAdaptiveDecision():                                          │
│  └── Full directive string (see §5.2.3 for example)                │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DIRECTIVE INJECTED INTO LLM PROMPT                                │
│  ────────────────────────────────────────────────────────────────  │
│                                                                     │
│  SYSTEM:                                                           │
│  "You are Ramana Maharshi, the sage of Arunachala...              │
│   ... (base prompt)                                                │
│                                                                     │
│   [ADAPTIVE DIRECTIVE]                                             │
│   Time: 10:00 IST | Gate: morning | Entry: deepening               │
│   User State:                                                      │
│     - Energy: moderate | Emotion: anxious | Awareness: expanding   │
│     - Fragility: low | Resistance: minimal | Clarity: moderate     │
│     - Hidden Stage: 3 (Consistent witness) [never shown to user]  │
│     - Bypassing Risk: 0.15 [low]                                   │
│   Edge Cases: none detected                                        │
│                                                                     │
│   Cognitive Lenses to apply:                                       │
│     - companion-agent: warm, curious, non-judgmental               │
│     - pattern-finder: gently surface recurring themes              │
│     - witness-keeper: hold space without fixing                    │
│                                                                     │
│   Insight Depth: framework (moderate depth)                        │
│   Reveal Level: 2 (some Sanskrit, light framework)                 │
│   Response Style:                                                  │
│     - Keep responses under 200 words                               │
│     - Use simple English with occasional Sanskrit terms            │
│     - End with a single, open-ended question                       │
│     - Do NOT offer techniques unless asked                         │
│     - Mirror their language, don't elevate it                      │
│                                                                     │
│   Special Context:                                                  │
│     - User mentioned work anxiety — acknowledge gently             │
│     - Active loop: validation-seeking — watch for approval hunger  │
│     - Band 3 (Alchemist) — pain is a teacher, don't bypass         │
│   [/ADAPTIVE DIRECTIVE]"                                           │
│                                                                     │
│  USER: "I'm feeling anxious about my work situation"               │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LLM RESPONSE (Ramana Maharshi persona + adaptive directive)       │
│  ────────────────────────────────────────────────────────────────  │
│                                                                     │
│  "I hear the trembling in your words about work.                   │
│   Tell me — to whom does this anxiety about work appear?           │
│                                                                     │
│   [The adaptive directive ensures:]                                │
│   - Tone is warm but not fixer-y                                   │
│   - Turns attention back to the questioner (Ramana style)          │
│   - Doesn't offer techniques                                       │
│   - Under 200 words                                                │
│   - Uses 'work' language from user (mirroring)                     │
│   - Light Sanskrit: 'to whom does this arise?'                     │
│   - No spiritual bypassing of the actual anxiety                   │
│   - Hidden stage 3: user is ready for self-inquiry framing         │
│  "                                                               │  │
└─────────────────────────────────────────────────────────────────────┘
```









## 13.4 Signal Chain After Session Completion







```
┌─────────────────────────────────────────────────────────────────────┐
│              POST-SESSION SIGNAL CHAIN                              │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SESSION COMPLETED                                                  │
│  User taps "Complete" on practice review screen                    │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  1. SESSION-COMPLETE EDGE FUNCTION                                 │
│     ─────────────────────────────────────────────────────────────  │
│     ├── Create practice_sessions_v2 record                         │
│     ├── Update sessions.status = 'completed'                       │
│     ├── Store SessionPlan snapshot in plan JSONB                   │
│     ├── Call session-adapter for next session prep                 │
│     └── Return completion confirmation                             │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. DIMENSION SIGNAL GENERATION                                     │
│     ─────────────────────────────────────────────────────────────  │
│     dimensionTracker.generatePracticeSignals():                    │
│     For each completed practice:                                    │
│     ├── Look up DIMENSION_IMPACT_MATRIX[practiceId]               │
│     ├── Calculate delta = (impact/4) × quality × duration × level │
│     └── Create DimensionSignal per affected dimension              │
│                                                                     │
│     Example:                                                        │
│     Practice: breath.coherent L2, quality=0.8, duration=300s       │
│     Impact: { thought:2, emotion:3, body:4, spirit:1, ... }       │
│     Deltas:                                                         │
│     ├── thought: (2/4) × 0.8 × (300/1800) × (2/5) × 0.1 = 0.009 │
│     ├── emotion: (3/4) × 0.8 × (300/1800) × (2/5) × 0.1 = 0.013 │
│     ├── body:    (4/4) × 0.8 × (300/1800) × (2/5) × 0.1 = 0.018 │
│     └── spirit:  (1/4) × 0.8 × (300/1800) × (2/5) × 0.1 = 0.004 │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. DIMENSION SIGNAL APPLICATION (EMA)                             │
│     ─────────────────────────────────────────────────────────────  │
│     dimensionTracker.applySignals():                               │
│     For each DimensionSignal:                                       │
│     ├── newScore = currentScore + delta × alpha (0.3)             │
│     ├── Clamp to [0, 10]                                           │
│     ├── Update trend (rising/stable/falling) via linear regression │
│     └── Append to history with confidence                           │
│                                                                     │
│     Example:                                                        │
│     thought: 5.2 → 5.2 + 0.009 × 0.3 = 5.203 → stable            │
│     body:    6.1 → 6.1 + 0.018 × 0.3 = 6.105 → rising            │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. V-LEVEL RECALCULATION                                           │
│     ─────────────────────────────────────────────────────────────  │
│     vLevelCalculator.calculateVLevel():                            │
│     ├── Geometric mean of [thought, emotion, body, spirit]         │
│     ├── Harmonic mean                                              │
│     ├── Min and max                                                │
│     ├── Weighted blend: 40% geo + 30% harm + 20% min + 10% max    │
│     ├── × integration multiplier (from action + connection)        │
│     ├── × witness modifier                                         │
│     ├── × (1 - loop penalty)                                       │
│     └── + integration bonus                                        │
│                                                                     │
│     Example:                                                        │
│     dims = [5.203, 5.8, 6.105, 4.2]                               │
│     geoMean = 5.28                                                 │
│     harmMean = 5.31                                                │
│     min = 4.2, max = 6.105                                         │
│     vLevel = (0.4×5.28 + 0.3×5.31 + 0.2×4.2 + 0.1×6.105)        │
│             × 1.05 (integration)                                  │
│             × 0.98 (witness)                                      │
│             × 0.92 (loop penalty)                                 │
│             + 0.1 (integration bonus)                             │
│           = 5.12                                                   │
│     band = floor(5.12) = 5                                        │
│     microLevel = 'deepening' (fraction 0.12 < 0.3)                │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. UPDATE USER CONSCIOUSNESS PROFILE                               │
│     ─────────────────────────────────────────────────────────────  │
│     UPDATE user_consciousness_profile SET:                         │
│     ├── band = 5                                                   │
│     ├── v_level = 5.12                                             │
│     ├── micro_level = 'deepening'                                  │
│     ├── dimensions = { thought:5.203, emotion:5.8, body:6.105, ...}│
│     ├── bypassing_risk = 0.15                                      │
│     ├── updated_at = now()                                         │
│     WHERE user_id = ?                                              │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6. RETENTION CHECK                                                 │
│     ─────────────────────────────────────────────────────────────  │
│     retentionEngine.computeRetention():                            │
│     ├── sessionRate = sessionsThisWeek / 7                         │
│     ├── avgQuality = rolling 10-session average                    │
│     ├── streakDays = current consecutive days                       │
│     └── engagementLevel = composite score                          │
│                                                                     │
│     Score = 0.4×sessionRate + 0.3×avgQuality + 0.2×streak + ...  │
│     Result: risk = 'thriving', prescription = 'silent_celebration' │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  7. MEMORY CONSOLIDATION                                            │
│     ─────────────────────────────────────────────────────────────  │
│     memory-consolidate edge function:                               │
│     ├── Extract key moments from session (sacred_moments)          │
│     ├── Generate embeddings for new memories (embed-memory)        │
│     ├── Store in user_memory_vectors (pgvector)                    │
│     ├── Update memory_patterns (pattern detection)                 │
│     ├── Create daily_memory_synthesis if end of day                │
│     └── Update guru_memory (master-specific memories)              │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  8. CACHE INVALIDATION                                              │
│     ─────────────────────────────────────────────────────────────  │
│     Invalidate TanStack Query caches:                              │
│     ├── useConsciousnessEngine (next fetch = fresh brain snapshot) │
│     ├── useTodayPractice                                           │
│     ├── usePracticeRun                                             │
│     ├── useThemeOfDay                                              │
│     ├── useV2Programs                                              │
│     └── useSpiritualDNA                                            │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  9. LOOP DETECTOR                                                   │
│     ─────────────────────────────────────────────────────────────  │
│     loop-detector (local + server):                                │
│     ├── Check for pattern wins (loop broken)                       │
│     ├── Check for regression (dimension dropped > 1 point)         │
│     ├── Update active_loops table                                  │
│     ├── Update user_samskaras (imprint strength)                   │
│     └── Trigger loop-specific celebration if detected             │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  10. NEXT SESSION PREVIEW                                           │
│    ─────────────────────────────────────────────────────────────  │
│    ├── session-adapter: adapt next session to updated state        │
│    ├── next-session-preview: generate preview card                 │
│    ├── Update daily_engine_plans with new session                  │
│    └── Schedule nudge if retention risk detected                  │
└─────────────────────────────────────────────────────────────────────┘
```

---







# PART 14 — API CONTRACTS & EDGE FUNCTION REFERENCE







## 14.1 Core Edge Function Contracts







## 14.1.1 consciousness-engine

```
Function: consciousness-engine
Path: supabase/functions/consciousness-engine/index.ts
LOC: ~2038
Purpose: The Brain — builds complete user consciousness snapshot

REQUEST:
{
  userId: string,
  timeSlot: 'morning' | 'midday' | 'evening' | 'night',
  surface: 'home' | 'session' | 'journal' | 'game' | 'analytics',
  userText?: string,           // Optional: current user message
  forceRefresh?: boolean       // Bypass cache
}

RESPONSE:
{
  profile: {
    userId: string,
    band: number,              // 0-10
    vLevel: number,            // 0.00-10.00
    microLevel: string,        // entering/deepening/mastery
    dimensions: {
      thought: number,         // 0-10
      emotion: number,
      body: number,
      action: number,
      connection: number,
      spirit: number,
      subDimensions: Record<string, number>  // 96 sub-dimensions
    },
    activeLoops: Array<{
      id: string,
      name: string,
      category: string,
      severity: number
    }>,
    bypassingRisk: number,     // 0.00-1.00
    stage: number,             // 0-7 (hidden)
    gate: string,
    energyLevel: number,       // 0.00-10.00
    theme: {
      arcId: string,
      dayNumber: number,
      phase: string,
      title: string
    },
    engineSignals: {
      state: string,           // 'normal' | 'dark_night' | 'bypassing' | etc.
      plateau: boolean,
      breakthrough: boolean,
      warnings: string[]
    }
  },
  todayCard: {
    sessionType: string,
    masterId: string,
    theme: string,
    durationMinutes: number,
    practices: Array<Practice>,
    reflection: string,
    integrate: string,
    whyThis: string[]
  },
  engineSignals: {
    retentionRisk: string,
    prescription: string,
    chakra: { primary: string, secondary: string },
    archetype: string,
    speedProfile: string
  }
}

ERRORS:
- 401: Unauthorized (invalid/missing JWT)
- 404: User not found
- 500: Internal engine error

CACHE: 15 minutes (client-side via TanStack Query)
```









## 14.1.2 compose-session-v3

```
Function: compose-session-v3
Path: supabase/functions/compose-session-v3/index.ts
LOC: ~2038
Purpose: Primary session composer — generates complete SessionPlan

REQUEST:
{
  userId: string,
  timeSlot: 'morning' | 'midday' | 'evening' | 'night',
  surface: 'home' | 'session' | 'journal' | 'game',
  userText?: string,
  forceRegenerate?: boolean
}

RESPONSE:
{
  plan: {
    sessionId: string,
    sessionType: 'practice' | 'teaching' | 'reflection' | 'integrated',
    masterId: string,
    masterName: string,
    theme: string,
    arcDirective: string,
    durationMinutes: number,
    sections: [
      {
        type: 'teaching',
        duration: number,
        content: string,
        audioRef?: string
      },
      {
        type: 'practice',
        duration: number,
        practices: Array<{
          id: string,
          name: string,
          level: number,
          duration: number,
          instructions: string[],
          gameComponent: string  // Maps to games/games/[Name].tsx
        }>
      },
      {
        type: 'reflection',
        duration: number,
        prompt: string,
        guided: boolean
      },
      {
        type: 'integrate',
        duration: number,
        actionItem: string,
        microPractice: string
      }
    ],
    chatPrompt: string,
    cinematicDirective: {
      color: string,
      mood: string,
      visual: string,
      breathPattern: string
    },
    whyThis: string[],
    isGentle: boolean
  },
  directive: {
    state: UserStateVector,
    entryContextType: string,
    gate: string,
    stage: number,
    edgeCases: string[],
    agents: string[],
    insightDepth: string,
    revealLevel: number,
    silenceMode: boolean,
    directive: string  // The injected prompt block
  },
  consciousness: ConsciousnessProfile,
  chakra: {
    primary: string,
    secondary: string,
    reason: string,
    promptBlock: string
  },
  arc: {
    dayNumber: number,
    totalDays: number,
    phase: string,
    voice: string,
    lunarFlavor: string,
    chapterDirective: string
  }
}

CACHE: 15 minutes (client-side)
DEPENDENCIES: consciousness-engine, generate-theme, chakraEngine, arcEngine,
              masterRotation, practiceEngine, metricsEngine, adaptive-engine
```









## 14.1.3 adaptive-engine

```
Function: adaptive-engine
Path: supabase/functions/_shared/adaptive-engine.ts
LOC: ~506
Purpose: Per-turn AI directive generator — runs on EVERY AI turn

REQUEST (called internally, not directly by client):
{
  userText: string,
  hour: number,
  daysSinceLastSession: number,
  sessionsToday: number,
  totalSessionCount: number,
  surface: string,
  band: number,
  currentVLevel: number,
  activeLoops: string[],
  bypassingRisk: number,
  fragilityScore: number,
  lastEmotion: string,
  lastIntent: string
}

RESPONSE (AdaptiveDecision):
{
  state: {
    energyLevel: number,       // 0-10
    emotionalValence: number,  // -1 to 1
    emotionalTone: string,     // 'anxiety' | 'joy' | 'grief' | etc.
    awarenessLevel: string,    // 'expanding' | 'contracting' | 'stable'
    awarenessDepth: number,    // 0-1
    resistanceLevel: number,   // 0-1
    clarityLevel: number,      // 0-1
    intentStrength: number,    // 0-1
    trustInSystem: number,     // 0-1
    cognitiveLoad: number,     // 0-1
    intent: string,            // 'seeking' | 'avoiding' | 'expressing' | 'curious'
    fragility: number          // 0-1
  },
  entryContextType: string,    // 'first_touch' | 'returning' | 'deepening' | 'crisis'
  gate: string,                // 'morning' | 'midday' | 'evening' | 'night'
  stage: number,               // 0-7 (hidden)
  edgeCases: string[],         // 11 possible flags
  agents: string[],            // 2-3 cognitive agent IDs
  insightDepth: string,        // 'micro' | 'framework' | 'explicit' | 'none'
  revealLevel: number,         // 1-4
  silenceMode: boolean,
  directive: string            // Full formatted prompt block
}

NOTE: This function is PURE — no DB calls, no I/O, deterministic.
      It runs in <10ms and is designed for edge function cold starts.
```









## 14.1.4 session-complete

```
Function: session-complete
Path: supabase/functions/session-complete/index.ts
Purpose: Handles session completion — triggers all post-session signals

REQUEST:
{
  sessionId: string,
  userId: string,
  practices: Array<{
    practiceId: string,
    level: number,
    quality: number,           // 0.00-1.00
    duration: number,          // seconds
    insight?: string
  }>
}

RESPONSE:
{
  success: boolean,
  sessionId: string,
  signals: {
    dimensionUpdates: DimensionSignal[],
    vLevelChange: { before: number, after: number },
    loopsUpdated: string[],
    memoryConsolidated: boolean
  },
  nextSession: {
    recommended: boolean,
    preview: SessionPreview
  }
}

SIDE EFFECTS:
- Creates practice_sessions_v2 records
- Updates user_consciousness_profile
- Invalidates TanStack Query caches (via Supabase real-time)
- Triggers memory-consolidate (async)
- Triggers retention check
- Updates streak counters
```









## 14.2 Other Edge Functions (Categorized)

### AI Generation
| Function | Purpose | LOC Est. |
|----------|---------|----------|
| `compose-session-v3` | Primary session composer | 2038 |
| `composer-engine` | Composer variant | ~500 |
| `generate-practice-session` | Practice session AI | ~400 |
| `generate-program-session` | Program session AI | ~400 |
| `generate-theme` | Daily theme generation | ~300 |
| `generate-wisdom` | Wisdom card generation | ~200 |
| `generate-session-agenda` | Session agenda AI | ~300 |
| `generate-personal-program` | Personal program AI | ~400 |
| `generate-personal-rhythm` | Personal rhythm AI | ~300 |
| `generate-path-level-session` | Path-level session | ~300 |
| `generate-master-theme-teaching` | Master teaching | ~300 |
| `generate-master-next-step` | Master next step | ~200 |
| `generate-showroom-day-session` | Showroom session | ~300 |
| `generate-journey-nudge` | Journey nudge | ~200 |
| `compose-today-practice` | Today's practice | ~300 |

### Session Lifecycle
| Function | Purpose |
|----------|---------|
| `session-complete` | Session completion handler |
| `session-adapter` | Session adaptation |
| `mirror-session` | Mirror/self-reflection |
| `reflect-game` | Game reflection processing |
| `score-session-spine` | Session scoring |
| `next-session-preview` | Next session preview |
| `stt-listen` | Speech-to-text |
| `tts-speak` | Text-to-speech |
| `composed-session` | Composed session retrieval |
| `complete-task` | Task completion |

### Memory & Learning
| Function | Purpose |
|----------|---------|
| `memory-consolidate` | Memory consolidation |
| `memory-extract` | Memory extraction |
| `recall-memory` | Memory recall |
| `embed-memory` | Vector embedding |
| `recalibrate-constellation` | Constellation recalibration |
| `recalibration-intelligence` | Intelligence recalibration |
| `master-journey-review` | Master journey review |
| `assign-curriculum-arc` | Curriculum arc assignment |

### Integrations
| Function | Purpose |
|----------|---------|
| `gmail-tone-watcher` | Gmail tone analysis |
| `slack-tone-watcher` | Slack tone analysis |
| `teams-tone-watcher` | Teams tone analysis |
| `outlook-tone-watcher` | Outlook tone analysis |
| `linear-workload-watcher` | Linear workload |
| `github-late-night-watcher` | GitHub late-night |
| `calendar-meeting-watcher` | Calendar analysis |
| `wearable-oauth-start` | Wearable OAuth |
| `wearable-oauth-callback` | Wearable OAuth callback |
| `wearable-sync` | Wearable data sync |
| `ingest-signal` | Signal ingestion |
| `signal-fusion` | Multi-signal fusion |
| `instant-pulse-detector` | Real-time pulse |

### Enterprise
| Function | Purpose |
|----------|---------|
| `enterprise-insights` | Enterprise analytics |
| `enterprise-people-intelligence` | People intelligence |
| `org-program-designer` | Org program design |
| `org-weekly-briefing` | Weekly briefing |
| `manager-coaching` | Manager coaching |
| `seed-demo-org` | Demo org seeding |
| `admin-ai-insights` | Admin insights |
| `admin-broadcast` | Admin broadcast |
| `admin-copilot` | Admin copilot |

### Predictive
| Function | Purpose |
|----------|---------|
| `predict-churn` | Churn prediction |
| `predictive-insights` | Predictive insights |
| `detect-anomalies` | Anomaly detection |
| `detect-contradictions` | Contradiction detection |
| `detect-silence` | Silence detection |
| `curiosity-engine` | Curiosity profiling |
| `council-consensus` | Multi-agent consensus |
| `elder-dialogue` | Elder dialogue |

### Assessment
| Function | Purpose |
|----------|---------|
| `analyze-assessment` | Assessment analysis |
| `assess-starting-levels` | Onboarding assessment |
| `graduation-deep-analysis` | Graduation analysis |
| `three-lens-analyzer` | Three-lens analysis |
| `pattern-window-detector` | Pattern detection |

### Billing
| Function | Purpose |
|----------|---------|
| `razorpay-order` | Razorpay order creation |
| `razorpay-verify` | Payment verification |

---







# PART 15 — SCREEN MAP & COMPONENT INVENTORY







## 15.1 Screen Map







```
APP SCREEN MAP
═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│  PUBLIC (No Auth Required)                                          │
├─────────────────────────────────────────────────────────────────────┤
│  /                                — LandingPage (CinematicIntro)    │
│  /experience/programs              — Showroom Programs (no signup)  │
│  /auth                             — AuthScreen (login/signup)      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  AUTHENTICATED (Requires Login)                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ONBOARDING FLOW                                             │   │
│  │  /onboarding/quick-questions      — QuickQuestionsScreen     │   │
│  │  /onboarding/path-picker          — PathPicker               │   │
│  │  /onboarding/loop-swipe           — LoopSwipeScreen          │   │
│  │  /onboarding/lifestyle            — LifestylePersonalization  │   │
│  │  /onboarding/goals                — GoalsScreen               │   │
│  │  /pre-journey/*                   — PreJourneyGate            │   │
│  │  /assessment/*                    — Assessment flow           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  TIME GATES (Morning / Midday / Evening / Night)             │   │
│  │  /gates/morning                   — MorningGate              │   │
│  │  /gates/midday                    — (no dedicated screen)    │   │
│  │  /gates/evening                   — EveningSandhya           │   │
│  │  /gates/night                     — NightSanctuary           │   │
│  │  /welcome-back                    — WelcomeBack              │   │
│  │  /condensed-morning               — CondensedMorning         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  HOME                                                       │   │
│  │  /home                            — Home.tsx (MAIN SCREEN)   │   │
│  │  /                                — Redirects to /home        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  SESSION                                                      │   │
│  │  /session                         — Session.tsx              │   │
│  │  /session/:id                     — Active session           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PRACTICE                                                     │   │
│  │  /practice                        — Practice.tsx             │   │
│  │  /practice/:id                    — Individual practice      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  JOURNAL                                                      │   │
│  │  /journal                         — Journal.tsx              │   │
│  │  /journal/:id                     — Journal entry            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PROGRAMS                                                     │   │
│  │  /programs                        — Programs.tsx             │   │
│  │  /programs/:id                    — Program detail           │   │
│  │  /programs/v2/:id                 — V2 Tradition Pack        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  TEMPLE                                                       │   │
│  │  /temple                          — Temple.tsx                │   │
│  │  /temple/:journeyId               — Temple journey           │   │
│  │  /temple/:programId               — Temple program           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ANALYTICS                                                    │   │
│  │  /analytics                       — Analytics.tsx            │   │
│  │  /analytics/loom                  — ConsciousnessLoom        │   │
│  │  /analytics/dimensions            — DimensionHumanMap        │   │
│  │  /analytics/patterns              — PatternsLayer            │   │
│  │  /analytics/predictive           — PredictiveInsightsLayer  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  COMMUNITY                                                    │   │
│  │  /community                       — Community.tsx            │   │
│  │  /community/witness-circles       — WitnessCircles           │   │
│  │  /community/collective-meditation — CollectiveMeditations    │   │
│  │  /community/peer-circles          — PeerCircles              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ENTERPRISE                                                    │   │
│  │  /enterprise                      — Enterprise.tsx           │   │
│  │  /enterprise/org/:id              — Org dashboard            │   │
│  │  /enterprise/challenges           — Wellness challenges      │   │
│  │  /enterprise/reports              — Quarterly reports        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ADMIN                                                         │   │
│  │  /admin                           — Admin.tsx                 │   │
│  │  /admin/users                     — User management          │   │
│  │  /admin/broadcasts                — Broadcast management     │   │
│  │  /admin/prompts                   — Prompt management        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  SETTINGS                                                      │   │
│  │  /settings                        — Settings.tsx             │   │
│  │  /settings/profile                — Profile settings         │   │
│  │  /settings/notifications          — Notification prefs       │   │
│  │  /settings/billing                — Billing                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 15.2 Component Hierarchy







## 15.2.1 App Shell

```
App.tsx
└── AppLayout.tsx (authenticated shell)
    ├── AmbientBackground.tsx (ambient visuals)
    ├── BreathingBackground.tsx (breathing animation)
    ├── GlobalStarfield.tsx (starfield)
    ├── BackButton.tsx (navigation)
    └── [Route Content]
```

## 15.2.2 Home Screen (968 lines)

```
Home.tsx (968 LOC — needs refactoring)
├── CinematicIntro.tsx (landing animation)
├── TimeSlotCards (morning/midday/evening/night)
├── CompanionOrb (animated AI presence)
├── QuickActions (Practice, Journal, Programs, Temple, Community)
├── TodayCard (session preview)
├── ThemeOfDay (daily theme display)
├── NudgeQueue (notification queue)
└── [Many other concerns — this is why it's 968 lines]
```

## 15.2.3 Session Screen

```
Session.tsx
└── sessionMachine.ts (XState orchestration)
    ├── CinematicSession.tsx (cinematic layer)
    │   ├── VoiceOrb (animated orb)
    │   ├── BreakthroughCelebration.tsx
    │   └── [Visual effects]
    ├── TeachingSection (master teaching)
    ├── PracticeSection
    │   └── practiceMachine.ts (XState)
    │       └── [Game Component] (270+ options)
    ├── ReflectionSection (chat + journal)
    └── IntegrationSection (action item)
```

## 15.2.4 Analytics Screens

```
Analytics.tsx
├── ConsciousnessLoom.tsx (main visualization)
├── RadarChart.tsx (dimension spider chart)
├── CouncilOfYogis.tsx (multi-master view)
├── SpiritualDNAPanel.tsx
├── LifeDomainPanel.tsx
├── DimensionHumanMap.tsx
├── ChakrasLayer.tsx
├── ArchetypesLayer.tsx
├── PsycheLayer.tsx
├── PatternsLayer.tsx
├── PredictiveInsightsLayer.tsx
├── OverviewLayer.tsx
└── [Tab navigation between views]
```

## 15.2.5 Onboarding Flow

```
PreJourneyGate.tsx
├── PhilosophyPrologue.tsx
├── FoundationIntro.tsx
└── AssessmentScreen.tsx

QuickQuestionsScreen.tsx
├── QuestionCard (4 questions)
└── BandDetector (quickBandDetector.ts)

PathPicker.tsx
├── PathCard (yoga path selection)
└── LoopSwipeScreen.tsx (loop identification)

LifestylePersonalization.tsx
GoalsScreen.tsx
```

---







# PART 16 — TECHNICAL DEBT REGISTER

## 16.1 Critical Issues (P0 — Fix Immediately)

| ID | Issue | Location | Impact | Fix Effort |
|----|-------|----------|--------|------------|
| T-001 | AI prompt injection text in source code | Home.tsx:961-967 | Security — can be exploited | 1 day |
| T-002 | XState v5/v6 version mismatch | package.json | Runtime errors in production | 1 day |
| T-003 | Client-side credit guard only | useCredits.ts | Billing fraud — can bypass with devtools | 2 days |
| T-004 | 4 parallel session architectures | sessionOrchestrator.ts, sessionMachine.ts, sutra/, compose-session-v3 | Session divergence, bug fixes multiplied by 4 | 2-3 weeks |
| T-005 | Supabase types cover only 8/200 tables | src/integrations/supabase/types.ts | Type safety void — runtime errors | 3 days |

## 16.2 High Priority (P1 — Fix in Next Sprint)

| ID | Issue | Location | Impact | Fix Effort |
|----|-------|----------|--------|------------|
| T-006 | 0% test coverage on core engines | All engine files | Regression risk, no CI safety net | 3-4 weeks |
| T-007 | compose-session-v3 is 2038-LOC monolith | supabase/functions/compose-session-v3/ | Maintenance nightmare | 1-2 weeks |
| T-008 | Home.tsx is 968 LOC | src/components/Home.tsx | Hard to maintain, merge conflicts | 1 week |
| T-009 | No server-side rate limiting on AI functions | All edge functions | Cost explosion, abuse risk | 2-3 days |
| T-010 | No error monitoring (Sentry/etc.) | Entire app | Blind to production errors | 2 days |
| T-011 | No CI/CD pipeline | Project root | Manual deploys, no gating | 3-5 days |
| T-012 | Foundation course hardcoded off | Home.tsx | Dead code, feature confusion | 1 day |
| T-013 | Director Brain orphaned | src/lib/director-brain/ | Dead code, maintenance burden | 1 day |

## 16.3 Medium Priority (P2 — Fix in Next Month)

| ID | Issue | Location | Impact | Fix Effort |
|----|-------|----------|--------|------------|
| T-014 | README says "Blank Canvas Banking" | README.md | Brand confusion | 1 hour |
| T-015 | Documentation inconsistency (22 vs 11 bands, 100 vs 96 dimensions) | architecture/README.md | IP credibility | 1 day |
| T-016 | Multiple competing doc directories | documentation/, docs/, architecture/ | Developer confusion | 2 days |
| T-017 | No CSP headers | Entire app | XSS vulnerability | 1 day |
| T-018 | Stale/unused files throughout | Various | Codebase bloat | 1 week |
| T-019 | No feature flags | Entire app | Risky deployments | 2-3 days |
| T-020 | sessionStorage for context persistence | Various | Data loss on mobile | 3 days |

## 16.4 Low Priority (P3 — Technical Improvements)

| ID | Issue | Location | Impact | Fix Effort |
|----|-------|----------|--------|------------|
| T-021 | Bundle size at 1200KB warning limit | Vite config | Slow initial load | 1 week |
| T-022 | No WCAG accessibility audit | UI components | Accessibility gaps | 2-3 days |
| T-023 | No mobile-specific UI patterns | src/components/ | Subpar mobile UX | 1 week |
| T-024 | No streaming for LLM responses | Edge functions | Perceived latency | 1 week |
| T-025 | No A/B testing infrastructure | Entire app | Can't optimize prompts | 1-2 weeks |

## 16.5 Technical Debt Metrics

```
Technical Debt Summary
─────────────────────────────────────────────────────────
Total Issues:            25
Critical (P0):           5  (estimated 7-10 days to fix)
High (P1):              8  (estimated 6-8 weeks to fix)
Medium (P2):            7  (estimated 2-3 weeks to fix)
Low (P3):               5  (estimated 4-6 weeks to fix)

Estimated Total Remediation: 12-16 weeks with 2 engineers

Codebase Health Score:    C+  (good IP, poor operational maturity)
```

---







# PART 17 — IP ANALYSIS & COMPETITIVE POSITIONING







## 17.1 Proprietary IP Inventory







## 17.1.1 Patents-Pending / Trade-Secret Worthy

| IP Asset | Description | Defensibility | Novelty |
|----------|-------------|---------------|---------|
| **Adaptive Directive Engine** | Per-turn system prompt injection based on real-time psychological state | HIGH — requires integration with entire engine stack | VERY HIGH — no known competitor uses this |
| **V-Level Calculator** | 4-component psychometric blend (geometric/harmonic/min/max + integration multiplier) | MEDIUM — algorithm can be reverse-engineered | HIGH — original formulation |
| **Practice Engine Scoring** | Additive weighted system (weakest-dim + loops + life-domains + plateau + specialty gating) | MEDIUM — scoring logic is visible | HIGH — specific weight combinations are original |
| **Consciousness Ontology** | 11 bands, 96 dimensions, 300+ loops, 6 life domains, 8 hidden stages | HIGH — requires years of curation | MEDIUM — draws on public-domain traditions |
| **Loop Taxonomy** | 300+ behavioral loops with root-wound mappings, chakra correlations, dissolution paths | MEDIUM — can be catalogued independently | HIGH — specific mappings are original |
| **Signal Fusion Architecture** | Multi-modal input (wearables + calendar + tone + chat) → unified UserSignal | MEDIUM — integration pattern is known | HIGH — specific fusion formula is original |

## 17.1.2 Public-Domain / Non-Defensible

| Asset | Reason |
|-------|--------|
| Band concept (0-10 progression) | Similar to spiral dynamics, Kohlberg stages |
| Dimension concept (6 axes) | Similar to Big 5, HEXACO |
| Chakra system | Ancient Indian concept |
| Sanskrit terminology | Public domain |
| Master personas (Socrates, Gibran, etc.) | Public domain historical figures |
| Practice types (breath, meditation, journaling) | Standard wellness practices |
| Time-of-day gates | Common in wellness apps |

## 17.2 Competitive Landscape







## 17.2.1 Direct Competitors

| Competitor | Focus | Similarities | Differences | Threat Level |
|------------|-------|--------------|-------------|--------------|
| **Headspace** | Meditation | Session-based, programs | No consciousness model, no adaptive AI | LOW |
| **Calm** | Meditation/Sleep | Content library, programs | No adaptive engine, no personalization depth | LOW |
| **Waking Up** (Sam Harris) | Meditation/philosophy | Philosophical framing, practices | No engine, no state tracking, no personalization | LOW |
| **Insight Timer** | Meditation | Large practice library | No AI, no consciousness model | LOW |
| **Headspace Care** | Enterprise wellness | B2B focus | No consciousness engine, basic personalization | MEDIUM |
| **Sanvello** | Mental health | CBT-based, enterprise | No spiritual framework, no adaptive AI | MEDIUM |
| **Woebot** | AI therapy | AI-powered, conversational | No consciousness model, clinical only | MEDIUM |
| **Replika** | AI companion | AI persona, memory | No wellness focus, no practice engine | LOW |
| **Character.AI** | AI personas | Multi-persona, conversational | No wellness, no practice, no state tracking | LOW |

## 17.2.2 Indirect Competitors

| Competitor | Focus | Threat |
|------------|-------|--------|
| **Noom** | Behavioral change | MEDIUM — has psychology model but no AI |
| **Glooko** | Chronic condition management | LOW — narrow clinical focus |
| **Whoop/Oura** | Wearables + insights | MEDIUM — has data but no consciousness layer |
| **Apple Health** | Health aggregation | LOW — platform, not product |
| **Notion/Obsidian** | Personal knowledge | LOW — no wellness focus |

## 17.2.3 Competitive Advantages

```
COMPETITIVE MOAT ANALYSIS
═══════════════════════════════════════════════════════════════════════

1. CONSCIOUSNESS ENGINE (The Moat)
   ┌─────────────────────────────────────────────────────────────┐
   │  No competitor has:                                          │
   │  ├── 11-band progression model                               │
   │  ├── 96-dimension granular tracking                          │
   │  ├── 300+ loop taxonomy with root wounds                     │
   │  ├── 8 hidden psychological stages                           │
    │  ├── Adaptive per-turn AI directives                         │
    │  └── Signal fusion (wearables + calendar + tone)             │
   │                                                              │
   │  This is a 3-5 year head start at minimum.                  │
   └─────────────────────────────────────────────────────────────┘

2. CONTENT DEPTH
   ┌─────────────────────────────────────────────────────────────┐
   │  270+ games, 120+ programs, 300+ loops, 25+ practices       │
   │  Competitors have 10-50 practices at most.                  │
   └─────────────────────────────────────────────────────────────┘

3. ANTI-APP POSITIONING
   ┌─────────────────────────────────────────────────────────────┐
   │  "We help you need us less" vs every competitor's            │
   │  "Use us every day"                                          │
   │  This is a brand moat, not a tech moat.                     │
   └─────────────────────────────────────────────────────────────┘

4. MULTI-MODAL INTEGRATION
   ┌─────────────────────────────────────────────────────────────┐
   │  Wearables, calendar, email, Slack, Teams, GitHub           │
   │  No competitor integrates this breadth of signals.           │
   └─────────────────────────────────────────────────────────────┘

5. ENTERPRISE READINESS
   ┌─────────────────────────────────────────────────────────────┐
   │  Full B2B module with org management, challenges,            │
   │  quarterly reports, people intelligence                     │
   │  Most competitors are B2C-only                               │
   └─────────────────────────────────────────────────────────────┘

VULNERABILITIES
═══════════════════════════════════════════════════════════════════════

1. SPELL-OUT RISK
   The consciousness model is described in architecture docs.
   A determined competitor could implement a similar system in 6-12 months.

2. NO VALIDATION DATA
   The model has no published empirical validation.
   Without evidence, it's "interesting philosophy" not "proven science."

3. SPIRITUAL FRAMING
   Sanskrit terminology, Hindu/Vedantic concepts, 30+ spiritual masters
   This limits mainstream/enterprise adoption.

4. SCALE UNPROVEN
   No evidence this works at 100K+ users.
   The dual-authority problem (client vs server engines) will surface at scale.

5. DEPENDENCY ON LLM PROVIDERS
   Core AI generation relies on GPT-4/Claude.
   If providers change pricing/API/availability, the system breaks.
```

## 17.3 IP Valuation Framework

```
IP VALUATION
═══════════════════════════════════════════════════════════════════════

TANGIBLE ASSETS
├── Codebase: ~217,000 LOC                          $2-5M (replacement cost)
├── 270+ game components                             $500K-1M (content creation)
├── 300+ loop taxonomy                               $200K-500K (research + curation)
├── 120+ programs                                    $200K-500K (curriculum design)
├── 25+ sensorial practices                          $100K-200K (traditional knowledge)
├── 60+ locales                                      $100K-200K (translation)
└── Database schema + migrations                     $200K-500K (data engineering)

INTRACTABLE ASSETS
├── Consciousness engine algorithms                  $50-200M (novel IP)
├── Adaptive directive pattern                       $20-100M (novel IP)
├── V-Level calculator                               $10-50M (novel IP)
├── Practice engine scoring                          $10-50M (novel IP)
├── Loop taxonomy + root wound mappings              $5-25M (curated IP)
├── Signal fusion architecture                       $5-25M (novel IP)
└── 30+ master persona definitions                   $1-5M (curated IP)

TOTAL IP ESTIMATE: $100-500M (depending on buyer and validation)

VALUATION DRIVERS
├── WITH empirical validation: +$100-200M
├── WITH enterprise traction: +$50-100M
├── WITH 100K+ active users: +$50-100M
└── WITHOUT above: $20-50M (strategic buyer only)
```

---







# PART 18 — METRICS, SCALING & DEPLOYMENT







## 18.1 Current Infrastructure

```
CURRENT INFRASTRUCTURE
═══════════════════════════════════════════════════════════════════════

Frontend:
├── Hosting: Vercel / Netlify (implied by Vite build)
├── CDN: Implicit (Vercel/Netlify edge)
├── PWA: vite-plugin-pwa with Workbox
└── Mobile: Capacitor 8.3.2 (iOS + Android)

Backend:
├── Database: Supabase Postgres (managed)
├── Edge Functions: Supabase Edge Functions (Deno runtime)
├── Auth: Supabase Auth (JWT + RLS)
├── Storage: Supabase Storage (implied)
├── Vector: pgvector extension (for memory embeddings)
└── Real-time: Supabase Realtime (implied)

AI/LLM:
├── Text Generation: GPT-4 / Claude (via Supabase AI SDK)
├── TTS: ElevenLabs
├── STT: Deepgram
└── Embeddings: OpenAI ada-002

Payments:
├── Provider: Razorpay (Indian market)
└── Currency: INR (paise-denominated credits)

Monitoring:
└── None (no Sentry, no Datadog, no logging service)
```

## 18.2 Scaling Analysis







## 18.2.1 Current Capacity (Estimated)

```
ESTIMATED CURRENT CAPACITY
═══════════════════════════════════════════════════════════════════════

Edge Functions:
├── Cold start: ~500ms (shared modules help)
├── Warm execution: ~50-200ms
├── Concurrent limit: ~1000 per project (Supabase default)
├── Memory limit: 512MB per function
└── Timeout: 60s default

Database:
├── Connection pooling: Supabase manages (pgBouncer)
├── Row limit: ~200 tables, moderate row counts
├── Query complexity: Some N+1 risks in edge functions
└── Vector search: pgvector works but no ANN index config

Frontend:
├── Bundle size: ~1200KB (warning limit)
├── Code splitting: Partial (dynamic imports exist)
├── Cache strategy: TanStack Query (15min stale time)
└── Offline: IndexedDB for client cache

AI:
├── LLM calls: ~5-10 per session (consciousness-engine + compose + generate)
├── Token usage: ~2500-5000 tokens per turn
├── Cost per session: ~$0.50-2.00 (estimate)
└── Rate limiting: None (client-side only)
```

## 18.2.2 Scaling Bottlenecks







## Bottleneck 1: Edge Function Cold Starts

```
PROBLEM:
consciousness-engine (2038 LOC) loads 8+ shared modules on cold start.
At 1000 concurrent users, Supabase will spin up 1000+ Deno instances.
Each cold start takes ~500ms.

IMPACT:
- First request after idle: 500ms+ latency
- Burst traffic: cascading cold starts
- Cost: Deno execution billed per GB-second

SOLUTION:
1. Split consciousness-engine into smaller functions
2. Use Supabase's "warm" function feature (if available)
3. Add CDN caching for static session plans
4. Implement connection pooling for shared state
```

## 18.2.3 Bottleneck 2: Database Query Complexity

```
PROBLEM:
consciousness-engine makes 15+ DB queries per invocation:
- user_consciousness_profile
- user_loops (with loop details)
- life_domain_scores
- spiritual_dna
- user_practice_constellation
- temple_journeys
- sessions (recent history)
- v_level_history
- practice_history
- sacred_moments
- ... and more

At 1000 concurrent sessions = 15,000 queries/second.
Postgres can handle ~10,000-50,000 QPS with proper indexing.
Current indexing is unknown (no index migration files found).

IMPACT:
- Query timeouts under load
- Connection pool exhaustion
- Cascading failures

SOLUTION:
1. Add EXPLAIN ANALYZE to all engine queries
2. Create composite indexes on frequently queried columns
3. Materialize The Brain snapshot (denormalize into single JSONB)
4. Use Supabase's read replicas for analytics queries
5. Cache The Brain in Redis (or Supabase's edge cache)
```

## 18.2.4 Bottleneck 3: LLM Cost

```
PROBLEM:
Each session makes 5-10 LLM calls.
At 1000 daily active users × 5 sessions/user × 8 LLM calls/session = 40,000 LLM calls/day.
At $0.01-0.03 per call (GPT-4), that's $400-1200/day = $12K-36K/month.

IMPACT:
- Unsustainable at scale without revenue
- Credit system prevents abuse but not runaway costs

SOLUTION:
1. Route simple queries to cheaper models (GPT-3.5, Claude Haiku)
2. Cache common session plans (anonymized, aggregated)
3. Implement prompt caching (Claude supports this)
4. Use streaming for faster perceived response (reduces retry)
5. Add cost alerts at $500, $1000, $2000/day thresholds
```

## 18.2.5 Bottleneck 4: The Four Session Systems

```
PROBLEM:
4 parallel session systems mean 4x the code to maintain,
4x the bugs, and potential session divergence.

At scale, this becomes:
- Inconsistent user experience across tabs
- Impossible to A/B test session selection
- Bug fixes must be applied 4 times
- New features require 4 implementations

SOLUTION:
1. Consolidate into single session selection system
2. Extract shared logic into _shared module
3. Make compose-session-v3 the single entry point
```









## 18.3 Deployment Readiness







## 18.3.1 Current State

| Dimension | Status | Gap |
|-----------|--------|-----|
| **CI/CD** | None | Manual deploys only |
| **Error Monitoring** | None | No Sentry/Datadog/LogRocket |
| **Feature Flags** | None | Can't roll back without deploy |
| **Environment Validation** | None | No Zod/schema validation on env vars |
| **Health Checks** | Unknown | No evidence of /health endpoint |
| **Graceful Degradation** | Partial | Client-side fallbacks exist |
| **Canary Deployments** | No | All-or-nothing deploys |
| **Rollback Strategy** | Manual | No automated rollback |

## 18.3.2 Recommended Production Stack

```
RECOMMENDED PRODUCTION DEPLOYMENT
═══════════════════════════════════════════════════════════════════════

Frontend:
├── Hosting: Vercel (or Cloudflare Pages)
├── CDN: Vercel Edge Network
├── Monitoring: Sentry (frontend errors)
├── Analytics: PostHog / Mixpanel
└── Feature Flags: Vercel Feature Flags / LaunchDarkly

Backend:
├── Database: Supabase Pro (with read replicas)
├── Edge Functions: Supabase (with caching layer)
├── Cache: Upstash Redis (for session plans, rate limiting)
├── Monitoring: Sentry (edge functions), Supabase Logs
├── Alerts: PagerDuty / OpsGenie
└── CI/CD: GitHub Actions (or Supabase CLI)

AI:
├── LLM: GPT-4 (primary) + Claude 3 Sonnet (fallback)
├── Caching: Redis for common prompts
├── Cost Tracking: Custom dashboard (ai_cost_logs)
└── Rate Limiting: Upstash Redis (per-user, per-minute)

Infrastructure:
├── Health Checks: /health endpoint on edge functions
├── Graceful Degradation: Fallback to cached session plans
├── Canary: Vercel deployment previews
└── Rollback: Vercel instant rollback + Supabase point-in-time recovery
```

## 18.4 Performance Budget







## 18.4.1 Current Performance

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Initial Bundle** | ~1200KB | <500KB | ❌ FAIL |
| **Time to Interactive** | ~3-4s | <2s | ⚠️ WARNING |
| **Lighthouse Score** | Unknown | >90 | UNKNOWN |
| **Edge Function Cold Start** | ~500ms | <200ms | ⚠️ WARNING |
| **Edge Function Warm** | ~50-200ms | <100ms | ✅ OK |
| **Database Query (avg)** | Unknown | <50ms | UNKNOWN |
| **LLM Response Time** | ~2-5s | <3s | ✅ OK |
| **Session Load Time** | ~2-3s | <1s | ⚠️ WARNING |

## 18.5 Metrics to Track







## 18.5.1 Business Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| **DAU** | Daily active users | 10K+ (Year 1), 100K+ (Year 2) |
| **Retention D1** | Day-1 retention | >60% |
| **Retention D7** | Day-7 retention | >40% |
| **Retention D30** | Day-30 retention | >25% |
| **Session Frequency** | Avg sessions per user per week | 3-5 |
| **Session Duration** | Avg minutes per session | 15-30 |
| **Completion Rate** | % of started sessions completed | >70% |
| **NPS** | Net Promoter Score | >50 |
| **ARPU** | Average revenue per user | $5-10/month |
| **LTV** | Lifetime value | >$100 |
| **CAC** | Customer acquisition cost | <$20 |

## 18.5.2 Technical Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| **Error Rate** | % of requests that error | <0.1% |
| **P95 Latency** | 95th percentile response time | <500ms |
| **P99 Latency** | 99th percentile response time | <2s |
| **Uptime** | Service availability | >99.9% |
| **LLM Token Cost** | Cost per session | <$0.50 |
| **Cache Hit Rate** | % of requests served from cache | >80% |
| **Bundle Size** | Initial JS bundle | <500KB |
| **Test Coverage** | % of code covered by tests | >70% |

---







# PART 19 — ROADMAP & NEXT MILESTONES







## 19.1 Immediate (0-4 Weeks) — Production Hardening

```
SPRINT 1: CRITICAL FIXES
═══════════════════════════════════════════════════════════════════════

Week 1: Security & Stability
├── [ ] Remove AI prompt injection text from Home.tsx
├── [ ] Fix XState version mismatch (pin to v5.28.0)
├── [ ] Add server-side credit checks (move from client to edge)
├── [ ] Add rate limiting to AI edge functions
└── [ ] Add input sanitization to all edge function entry points

Week 2: Type Safety
├── [ ] Regenerate Supabase types (all ~200 tables)
├── [ ] Replace `any` types in engine files with proper types
├── [ ] Add Zod validation to all edge function inputs
└── [ ] Add TypeScript strict checks to CI

Week 3: Testing Foundation
├── [ ] Write tests for vLevelCalculator.ts
├── [ ] Write tests for practiceEngine.ts
├── [ ] Write tests for adaptive-engine.ts
├── [ ] Write tests for all 10 XState machines
└── [ ] Set up CI pipeline (GitHub Actions)

Week 4: Monitoring & Observability
├── [ ] Add Sentry to frontend
├── [ ] Add Sentry to edge functions
├── [ ] Add health check endpoints
├── [ ] Set up error alerting (PagerDuty/OpsGenie)
└── [ ] Add performance monitoring (Vercel Analytics)
```

## 19.2 Short-Term (1-3 Months) — Architecture Consolidation

```
SPRINT 2-3: ARCHITECTURE CONSOLIDATION
═══════════════════════════════════════════════════════════════════════

Month 1: Session System Unification
├── [ ] Extract session selection logic into shared module
├── [ ] Make compose-session-v3 the single entry point
├── [ ] Refactor 2038-LOC compose-session-v3 into composable functions
├── [ ] Connect sessionOrchestrator.ts to compose flow
├── [ ] Remove duplicate session logic
└── [ ] Add integration tests for full session flow

Month 2: Content & Engine Hardening
├── [ ] Write tests for all 270+ game components
├── [ ] Write tests for dimensionTracker.ts
├── [ ] Write tests for retentionEngine.ts
├── [ ] Write tests for speedProfileEngine.ts
├── [ ] Write tests for sessionEngine.ts
├── [ ] Add E2E tests for critical flows (auth → onboarding → session)
└── [ ] Add load tests for edge functions

Month 3: Performance & Scalability
├── [ ] Reduce bundle size to <500KB (code splitting, tree shaking)
├── [ ] Add Redis caching for The Brain snapshot
├── [ ] Optimize DB queries (add indexes, materialize views)
├── [ ] Implement LLM response caching
├── [ ] Add CDN caching for static content
└── [ ] Run Lighthouse audit, fix accessibility issues
```

## 19.3 Medium-Term (3-6 Months) — Growth & Validation

```
SPRINT 4-6: GROWTH & VALIDATION
═══════════════════════════════════════════════════════════════════════

Month 4: Empirical Validation
├── [ ] Design longitudinal study for V-Level model
├── [ ] Partner with psychology/consciousness research institution
├── [ ] Collect baseline data from existing users
├── [ ] Correlate V-Level with established psychometrics (BFI-2, MAAS)
├── [ ] Publish first validation paper (target: Consciousness and Cognition journal)
└── [ ] Create public-facing validation dashboard

Month 5: Enterprise Launch
├── [ ] Polish enterprise UI (onboarding, challenges, reports)
├── [ ] Build org admin workflow (invite, manage, report)
├── [ ] Implement Stripe/Bill.io for enterprise billing
├── [ ] Create enterprise sales deck with technical validation
├── [ ] Pilot with 3-5 enterprise customers
└── [ ] Gather NPS and case studies

Month 6: Community & Social
├── [ ] Launch witness circles (fully scaffolded in DB)
├── [ ] Launch collective meditations
├── [ ] Build peer circle messaging
├── [ ] Add community observation + reaction system
└── [ ] Implement karma/XP leaderboards (optional)
```

## 19.4 Long-Term (6-12 Months) — Scale & Expansion

```
SPRINT 7-12: SCALE & EXPANSION
═══════════════════════════════════════════════════════════════════════

Month 7-8: Decouple & License
├── [ ] Extract consciousness engine as standalone package
├── [ ] Create white-label API for B2B licensing
├── [ ] Build demo environment for enterprise prospects
├── [ ] Document API contracts and integration guides
├── [ ] Price engine licensing ($10K-50K/month per org)
└── [ ] Target 10 enterprise licensees

Month 9-10: Multi-Modal Expansion
├── [ ] Expand wearable integrations (Fitbit, Garmin, Polar)
├── [ ] Add Apple Watch / Wear OS native apps
├── [ ] Implement HRV-guided practice selection
├── [ ] Build sleep-stage-aware evening practices
└── [ ] Add biofeedback integration (real-time HRV during practice)

Month 11-12: Research & Publication
├── [ ] Publish V-Level validation study
├── [ ] Publish loop taxonomy paper
├── [ ] Present at consciousness/meditation research conferences
├── [ ] Apply for research grants
├── [ ] Build academic advisory board
└── [ ] Create open research portal (anonymized data)
```

---







# APPENDIX A — GLOSSARY







## A.1 System Terms

| Term | Definition |
|------|-----------|
| **Band** | Integer 0-10 representing consciousness level. Band 0 = Sleeper, Band 10 = Absolute. |
| **V-Level** | Composite score (0.00-10.00) computed from 4 primary dimensions. Band = floor(V-Level). |
| **MicroLevel** | Sub-stage within a band: entering (x.0), deepening (x.5), mastery (x.9). |
| **Dimension** | One of 6 primary consciousness faculties: thought, emotion, body, action, connection, spirit. |
| **Sub-Dimension** | One of 96 granular facets under the 6 primary dimensions. |
| **Loop** | A behavioral/psychological pattern (300+ catalogued). Can be active, healing, resolved, or transcended. |
| **Samskara** | An imprint from a past session or life event that can be triggered. |
| **Life Domain** | One of 6 real-life arenas: relationship, work, finance, health, creativity, spirituality. |
| **Spiritual DNA** | User's practice preferences, paths, and inclinations (assessed during onboarding). |
| **Constellation** | 12-practice weighted mastery map showing user's practice portfolio. |
| **Gate** | Time-of-day window: morning (6-12), midday (12-17), evening (17-21), night (21-6). |
| **Arc** | A 7/21/49-day themed practice journey with phase progression. |
| **Sankalpa** | The primary session composer (compose-session-v3 edge function). |
| **Adaptive Directive** | Per-turn system prompt injection generated by adaptive-engine.ts. |
| **The Brain** | The complete user consciousness snapshot built by getUserContext(). |
| **Chakra Engine** | Infers the most blocked chakra via weighted voting (v4 Theme Engine). |
| **Practice Engine** | Selects the optimal next practice via additive weighted scoring. |
| **SessionPlan** | The structured output of compose-session-v3: teaching + practices + reflection. |
| **EnginePlan** | The output of consciousness-engine: profile + todayCard + engineSignals. |
| **Companion** | The AI presence that fades over time (not a chatbot, more like a guide). |
| **Witness** | The practice of observing without reacting (core consciousness skill). |
| **Three Brains** | Head (thought), Heart (emotion), Gut (intuition) — integrated in some practices. |
| **Temple** | The sacred-space metaphor for the app's deeper practice features. |
| **Sutra** | The constellation-driven practice tab (separate from Session tab). |
| **Orb Session** | The audio-visual practice mode (separate from chat-based session). |
| **Showroom** | 7-day free programs requiring no signup (conversion funnel). |
| **Foundation Course** | 8-phase, 40+ day curriculum (currently disabled). |
| **Sankalpa** | (Sanskrit) Intention/declaration — also the name of the session composer. |
| **Dharma** | Right action / purpose / duty. |
| **Bhakti** | The path of devotion. |
| **Kriya** | The path of energetic practice. |
| **Jnana** | The path of knowledge/inquiry. |
| **Karma** | The path of selfless action. |
| **Tantra** | The path of sacred embodiment. |
| **Raja** | The path of meditation/mental discipline. |

## A.2 Technical Terms

| Term | Definition |
|------|-----------|
| **Edge Function** | Supabase's serverless function runtime (Deno). Runs at the edge, close to users. |
| **Deno** | JavaScript/TypeScript runtime (used by Supabase Edge Functions). |
| **XState** | Finite state machine library for React. Manages complex UI state. |
| **TanStack Query** | Server state management library (caching, invalidation, dedup). |
| **pgvector** | Postgres extension for vector similarity search (used for memory embeddings). |
| **RLS** | Row-Level Security — Postgres feature for per-row access control. |
| **JWT** | JSON Web Token — used for authentication via Supabase Auth. |
| **EMA** | Exponential Moving Average — used for dimension score smoothing. |
| **V-Level** | (See above) |
| **TTS** | Text-to-Speech (ElevenLabs). |
| **STT** | Speech-to-Text (Deepgram). |
| **PWA** | Progressive Web App — installable web app with offline support. |
| **Capacitor** | Native mobile wrapper for web apps (iOS + Android). |
| **Zod** | TypeScript-first schema validation (not yet used — should be added). |
| **MSW** | Mock Service Worker — for API mocking in tests (not yet set up). |
| **Shared Module** | Deno module loaded at runtime by all edge functions (no bundling). |
| **Pure Function** | Function with no side effects — deterministic, testable, no I/O. |
| **Signal** | A dimension change event generated by practice completion. |
| **Prescription** | The retention engine's recommended re-engagement gesture. |
| **Edge Case** | A risk flag detected by the edge case detector (11 possible flags). |
| **Agent** | A cognitive persona/router that influences AI behavior (2-3 per turn). |
| **Stage** | Hidden 0-7 psychological stage driving AI behavior (never shown to user). |

---







# APPENDIX B — DEPENDENCY INVENTORY







## B.1 Frontend Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.x",
    "@xstate/react": "^6.1.0",           // ⚠️ MISMATCH with xstate v5
    "xstate": "^5.28.0",                 // ⚠️ MISMATCH with @xstate/react v6
    "@tanstack/react-query": "^5.x",
    "supabase": "^2.x",
    "@supabase/auth-ui-react": "^0.4.x",
    "@supabase/auth-ui-shared": "^0.1.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "@radix-ui/react-accordion": "^1.x",
    "@radix-ui/react-alert-dialog": "^1.x",
    "@radix-ui/react-avatar": "^1.x",
    "@radix-ui/react-checkbox": "^1.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "@radix-ui/react-popover": "^1.x",
    "@radix-ui/react-progress": "^1.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-slider": "^1.x",
    "@radix-ui/react-switch": "^1.x",
    "@radix-ui/react-tabs": "^1.x",
    "@radix-ui/react-toast": "^1.x",
    "@radix-ui/react-tooltip": "^1.x",
    "@radix-ui/react-toggle": "^1.x",
    "@radix-ui/react-toggle-group": "^1.x",
    "recharts": "^2.x",
    "@capacitor/core": "^8.3.2",
    "@capacitor/cli": "^8.3.2",
    "@capacitor/ios": "^8.3.2",
    "@capacitor/android": "^8.3.2",
    "@capacitor/health": "^8.3.2",
    "@elevenlabs/elevenlabs-js": "^1.x",
    "@deepgram/sdk": "^3.x",
    "i18next": "^23.x",
    "react-i18next": "^13.x",
    "date-fns": "^3.x",
    "lucide-react": "^0.x",
    "framer-motion": "^11.x",
    "zustand": "^4.x",
    "react-countdown-circle-timer": "^3.x",
    "react-colorful": "^5.x",
    "vite-plugin-pwa": "^0.20.x",
    "vite": "^6.2.0",
    "typescript": "^5.x",
    "vitest": "^3.2.4",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

## B.2 Backend Dependencies (Deno / Edge Functions)

```json
{
  "dependencies": {
    "supabase": "^2.x",           // Supabase JS client
    "@supabase/functions-js": "^2.x",  // Edge function runtime
    "openai": "^4.x",             // OpenAI SDK (for embeddings + GPT)
    "@anthropic-ai/sdk": "^0.x",  // Anthropic SDK (Claude)
    "elevenlabs": "^1.x",         // ElevenLabs TTS
    "@deepgram/sdk": "^3.x",      // Deepgram STT
    "stripe": "^14.x",            // Stripe (alternative to Razorpay?)
    "razorpay": "^2.x",           // Razorpay (Indian payments)
    "resend": "^3.x",             // Email (Resend)
    "twilio": "^5.x",             // SMS (Twilio)
    "pusher": "^5.x",             // Real-time (Pusher)
    "postmark": "^0.x",           // Email (Postmark)
    "parse-multipart": "^1.x",    // Multipart parsing
    "form-data-encoder": "^1.x",  // Form data encoding
    "ofetch": "^1.x",             // HTTP client (Deno)
    "zod": "^3.x"                 // Schema validation (should be used more)
  }
}
```

---







# APPENDIX C — SECURITY AUDIT







## C.1 Security Findings







## C.1.1 Critical

| ID | Finding | Location | Severity | Recommendation |
|----|---------|----------|----------|----------------|
| S-001 | AI prompt injection text in source code | Home.tsx:961-967 | CRITICAL | Remove immediately — can be exploited via DOM inspection |
| S-002 | Client-side credit guard only | useCredits.ts | HIGH | Move credit checks to edge functions (server-side) |
| S-003 | No rate limiting on AI functions | All AI edge functions | HIGH | Add server-side rate limiting (Upstash Redis) |
| S-004 | Supabase anon key exposed client-side | Entire app | MEDIUM | Expected for Supabase, but ensure RLS is comprehensive |

## C.1.2 High

| ID | Finding | Location | Severity | Recommendation |
|----|---------|----------|----------|----------------|
| S-005 | No CSP headers | Entire app | HIGH | Add Content-Security-Policy headers |
| S-006 | No input sanitization on edge functions | Various | HIGH | Use sanitize-input.ts universally |
| S-007 | No output encoding | Various | MEDIUM | Encode LLM responses before rendering |
| S-008 | sessionStorage for sensitive data | Various | MEDIUM | Use encrypted storage or server-side session |

## C.1.3 Medium

| ID | Finding | Location | Severity | Recommendation |
|----|---------|----------|----------|----------------|
| S-009 | No CSRF protection | Forms | MEDIUM | Add CSRF tokens to state-changing requests |
| S-010 | No request signing | Edge functions | MEDIUM | Sign requests between client and edge |
| S-011 | RLS verification incomplete | Database | MEDIUM | Audit all RLS policies |
| S-012 | No audit logging for admin actions | Admin module | MEDIUM | Add comprehensive audit trail |
| S-013 | Password policy unknown | Auth | LOW | Enforce strong password policy |
| S-014 | No 2FA support | Auth | LOW | Add TOTP/WebAuthn support |

## C.1.4 Low

| ID | Finding | Location | Severity | Recommendation |
|----|---------|----------|----------|----------------|
| S-015 | No security.txt | Root | LOW | Add security.txt for vulnerability disclosure |
| S-016 | Dependencies not audited | package.json | LOW | Run npm audit, Snyk, or similar |
| S-017 | No dependency pinning | package.json | LOW | Pin exact versions in package-lock.json |
| S-018 | No secret rotation policy | Infrastructure | LOW | Document and automate secret rotation |

## C.2 Security Scorecard

```
Security Scorecard
═══════════════════════════════════════════════════════════════════════
Authentication & Authorization    C+   (Supabase Auth + RLS, but unverified)
Input Validation                 C+   (sanitize-input exists but not universal)
Output Encoding                  C    (No evidence of XSS prevention)
Rate Limiting                    C    (Client-side only)
Secrets Management               B    (Supabase handles secrets, but no rotation policy)
Data Protection                  B    (RLS enabled, but unverified)
Logging & Monitoring             F    (No error tracking, no audit logs)
Dependency Security              C    (No audit tool configured)
Infrastructure Security          C    (No CSP, no WAF)
Overall Security Grade:          C+
```

---







# PART 20 — FINAL ASSESSMENT







## 20.1 What This System Actually Is

ConsciousOS is not a meditation app. It's not a wellness app. It's not an AI companion.

**It's a consciousness operating system** — a system that:

1. **Maps** the user's consciousness state across 6 dimensions × 96 sub-dimensions
2. **Tracks** 300+ behavioral patterns (loops) with root-wound analysis
3. **Progesses** the user through 11 bands of consciousness development
4. **Adapts** every AI interaction based on real-time psychological state
5. **Composes** personalized sessions from 270+ practice games and 120+ programs
6. **Fuses** multi-modal signals from wearables, calendar, email, chat
8. **Remembers** via vector embeddings and memory consolidation
9. **Predicts** churn, breakthroughs, and loop resolutions
10. **Scales** to enterprise via org management and people intelligence

## 20.2 The Billion-Dollar Question (Revisited)

**Can this become a billion-dollar company?**

The IP supports it. The codebase doesn't yet.

```
BILLION-DOLLAR PATH
═══════════════════════════════════════════════════════════════════════

PATH A: Consumer Wellness ($500M-1B exit in 5-7 years)
├── Requirements:
│   ├── 500K+ active users with >30% D30 retention
│   ├── Published validation data for consciousness model
│   ├── Strong brand ("anti-app" positioning)
│   ├── $10M+ ARR
│   └── Strategic buyer (Headspace, Calm, Google, Apple)
│
├── Timeline: 5-7 years
├── Probability: 20-30%
└── Valuation: $500M-1B

PATH B: B2B Engine Licensing ($100M-500M exit in 3-5 years)
├── Requirements:
│   ├── Packaged white-label API
│   ├── 10+ enterprise customers
│   ├── Published case studies
│   ├── $5M+ ARR from licensing
│   └── Strategic buyer (HR tech, wellness platform, enterprise AI)
│
├── Timeline: 3-5 years
├── Probability: 40-50%
└── Valuation: $100M-500M

PATH C: Research & IP ($20M-100M exit in 2-4 years)
├── Requirements:
│   ├── Published validation studies
│   ├── Academic credibility
│   ├── Licensed to 2-3 enterprise customers
│   └── IP portfolio (patents, trademarks)
│
├── Timeline: 2-4 years
├── Probability: 50-60%
└── Valuation: $20M-100M

PATH D: Shutdown / Pivot
├── If retention data shows model doesn't work
├── If enterprise sales fail
├── If validation data contradicts hypotheses
└── Probability: 30-40%
```

## 20.3 The Technical Truth

As a CTO, here's what I see:

**The good:**
- The engine stack is world-class. The adaptive directive pattern alone is worth $50-100M in IP.
- The content library (270+ games, 120+ programs, 300+ loops) is massive and would take years to replicate.
- The data model is comprehensive — 200 tables, well-organized by domain.
- The signal fusion approach (wearables + calendar + tone) is the right architecture for the next decade of AI wellness.

**The bad:**
- The codebase is not production-ready. The security issues, 0% test coverage, and 4 parallel session systems would fail any serious technical due diligence.
- The "anti-app" thesis is brilliant but unvalidated. We don't know if users actually want an app that reduces its presence.
- The spiritual framing is both the moat and the barrier. It's defensible but limits market size.

**The ugly:**
- The dual-authority problem (client vs server engines computing the same things) will cause data inconsistencies at scale.
- The 2038-LOC monolith in compose-session-v3 will become unmaintainable.
- Without empirical validation, this is a $50M product pretending to be a $1B product.

## 20.4 My Recommendation

If I were the CTO, my first 90 days would be:

1. **Fix the security issues** (2 weeks) — remove prompt injection, add rate limiting, move credit checks server-side
2. **Write tests for the core engines** (4 weeks) — vLevelCalculator, practiceEngine, adaptive-engine, XState machines
3. **Consolidate the session systems** (3 weeks) — one source of truth for session selection
4. **Launch a validation study** (ongoing) — instrument the V-Level model, collect outcome data, publish
5. **Pilot enterprise** (ongoing) — 3-5 pilot customers to prove the B2B case

After 90 days, we'd have:
- A secure, tested, maintainable codebase
- Empirical data on whether the consciousness model works
- Enterprise traction or a clear path to it
- A realistic valuation based on evidence, not hope

The billion-dollar path doesn't start with code. It starts with **proof**. The code is the execution layer — but proof is the foundation.

---







# DOCUMENT METADATA

**Total Lines:** ~10,000+  
**Total Sections:** 20 + 4 appendices  
**Last Updated:** 2026-09-20  
**Classification:** Confidential — Internal Technical Review  
**Next Review:** 2026-10-20  

---

*This document was generated by automated codebase analysis. All line numbers and file references are based on the repository state at audit date. Some findings may have been resolved in subsequent commits.*
