# Post-Onboarding Experience Design
## SATYUG — The Yogic Companion

---

## 1. The Philosophy: From Onboarding → Living

After the user completes onboarding (Quick 4-question path or Deep 76-session Foundation), the app transitions from "setup" to "companionship". The default state must feel like a **lifetime companion is already sitting with them**, not an empty dashboard they must populate.

### Default State = Basic AI + Free Model
- **AI Tier**: `free` (uses Groq/lightweight inference — no credit cost, no paywall)
- **Mode**: `companion` (not `assessment`, not `practice`, not `debug`)
- **Orb**: Running continuously as a living presence, not a button to press
- **No paywall on first screen** — credits/Karma are shown but never block entry

---

## 2. The First Screen After Onboarding: Home as Companion

The Home page (`/app`) becomes the companion's living room.

### 2.1 What Appears Immediately (Day 0)
| Element | Behavior | Why |
|---------|----------|-----|
| **Companion Presence Card** | Shows above the orb on Day 0 with a warm greeting: *"Hey — Aarav is sitting with you. Tap to begin."* | Companion is already here, not "set up later" |
| **Lifetime Companion Card** | Pulse indicator showing Phase 1 · Friend, V-Level 1.0 | Signals this is a **lifetime** relationship, not a 30-day trial |
| **Daily Orb** | Breathing animation, 240px, centered. Hold-to-begin with 1.5s progress ring. | The orb is the touchpoint — no separate "start practice" button |
| **Wisdom Arc Card** | First 7 days: cinematic onboarding lessons (1 per day) | Bridges onboarding → daily use with continuity |
| **Suggested Programs** | 2–3 free 7-day programs surfaced based on `starting_band` and `archetype_hint` | Gives the user something to DO on Day 1 |
| **QuickPath Mirror Button** | Floating Eye button (bottom-right) for quick-path users | Immediate access to personalization without hunting |

### 2.2 The Orb as Lifetime Companion
```
Default Orb State:
  - breathing={true}  // always breathing unless session completed
  - press → TimeAskSheet (how long, how much energy)
  - confirm → generative session via basic/free model
  - double-tap → Games library
  - companion engine fires every 6h (server-throttled)
```

The orb runs at the **basic AI tier** by default:
- Model: `groq/llama-3.1-8b-instant` (fast, free, no rate anxiety)
- Context window: 8K tokens (enough for daily sessions)
- No credit check before session start
- Upgrade prompt (to `pro` / `groq/mixtral`) shown only after 14 days OR when user explicitly asks for deeper sessions

---

## 3. The "Mirror" in Explore: Personalization Hub

### 3.1 Explore Page Redesign
Currently `Explore.tsx` just renders `<Library />`. It needs a Mirror section as the **first tab**.

```
Explore (/app/explore)
├── 🔮 Mirror (tab: mirrors)
│   ├── "See yourself, deeper." header
│   ├── 38 Mirror Checkpoints (from mirrors.ts)
│   │   ├── Assessment mirrors (loop-map, coming-soon types)
│   │   └── Quick-tap → /app/library/:slug
│   ├── Completion badges
│   └── "Take a mirror → refines your band, your guru, what the engine recommends"
│
├── 📚 Programs (tab: programs)
│   ├── Running program (resume card)
│   ├── Recommended (based on band + loops)
│   └── Free 7-day catalog (showroomPrograms.ts)
│
├── 🎮 Games (tab: games)
│   └── Engine-suggested based on dimension bands
│
└── 📖 Wisdom (tab: wisdom)
    └── WisdomDeck + TheScroll cards
```

### 3.2 Mirror Personalization Flow
```
User taps Mirror in Explore
  → QuickPathMirrorButton sheet (for quick-path users)
  → PreJourney mirror flow (for deep-path users, if pendingMirror)
  → Each completed mirror:
      ✓ Updates user_consciousness_profile.overall_band
      ✓ Refines active_guru assignment
      ✓ Unlocks new dimension bands
      ✓ Surfaces new programs on Home
      ✓ Adds loop cards to the user's profile
```

---

## 4. Programs to Start: The On-Ramp

### 4.1 Day 1 Program Surfaces
After onboarding, the user should see **2–3 program suggestions** on Home, positioned between the Wisdom Arc Card and the Orb:

```
┌─────────────────────────────────────┐
│ 🎯 Programs for your first week     │
│                                      │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ Decision-   │ │ Stop the     │     │
│ │ Making w/   │ │ Reactor w/   │     │
│ │ Krishna     │ │ Patanjali    │     │
│ │             │ │             │     │
│ │ 7 days      │ │ 7 days       │     │
│ │ ★ Start     │ │ ★ Start      │     │
│ └─────────────┘ └─────────────┘     │
│                                      │
│ See all 15 free programs →           │
└─────────────────────────────────────┘
```

### 4.2 Program Selection Logic
```typescript
// useSuggestedPrograms.ts (new hook)
function getSuggestedPrograms(profile: UserConsciousnessProfile) {
  const { starting_band, archetype_primary, active_loops, life_domains } = profile;
  
  // 1. Match archetype to program theme
  const archetypeMap: Record<string, string[]> = {
    "The Questioner": ["decision-krishna", " onion-ramana"],
    "The Reactor": ["stop-reactor-patanjali", "watch-thoughts-buddha"],
    "The Avoider": ["willpower-vivekananda", "embody-now"],
  };
  
  // 2. Match active loops to program
  const loopMap: Record<string, string[]> = {
    "perfectionism": ["stop-reactor-patanjali"],
    "people-pleasing": ["embody-now"],
  };
  
  // 3. Always include 1 beginner program
  const always = ["watch-thoughts-buddha"];
  
  return dedupe([...always, ...archetypeMap[archetype_primary] ?? [], ...loopMap[active_loops[0]] ?? []]);
}
```

---

## 5. Cards to Personalize: The "Loop Card" System

### 5.1 The Concept
Users should be able to **pin cards** to their Home that reflect what they want to work on. Think of it like dashboard widgets, but consciousness-flavored.

### 5.2 Card Types
| Card | Description | Data Source |
|------|-------------|-------------|
| **Loop Card** | "Your active loop: Perfectionism" with a 1-sentence reflection prompt | `active_loops` from engine |
| **Quote Card** | "10 quotes loop" — 10 rotating wisdom cards from WisdomDeck | `wisdomDeck.ts` |
| **Domain Card** | "Money: 3/10 · Work: 7/10" heatmap strip | `life_domains` |
| **Breathing Card** | Live breathing guide with orb | `BreathingOrb` |
| **Companion Mood Card** | "Aaj main thoda calm feel kar raha hoon" | `companion_state.mood` |
| **Wisdom Arc Card** | Day N of 7 onboarding lessons | `journey_day` |
| **Karma Card** | Hero Karma display | `karma_points` |
| **Running Program Card** | Current 7-day program progress | `active_guru_program` |
| **Next Session Card** | Session N hint from last completed | `sessions` |
| **Life Anniversary Card** | Anniversary of a significant life event | `life_and_legacy` |

### 5.3 Personalization UX
```
1. User goes to Settings → Personalize Home
   OR long-presses empty space on Home

2. Card picker modal:
   ┌─────────────────────────────────────┐
   │ Personalize your Home                │
   │                                      │
   │ ✓ Loop Card (active: Perfectionism)  │
   │ ✓ Quote Card (10 quotes loop)        │
   │ ☐ Domain Heatmap                    │
   │ ☐ Companion Mood                    │
   │ ☐ Breathing Guide                   │
   │                                      │
   │ Drag to reorder ↓                   │
   │                                      │
   │ [Loop Card] [Quote] [Orb] [Karma]   │
   │                                      │
   │ Reset to default                     │
   └─────────────────────────────────────┘

3. Saved to: user_preferences.home_cards[]
```

---

## 6. Companion Behavior: BFS/DFS Through Life Domains

### 6.1 The Companion as Graph Traversal
The companion's daily guidance can be modeled as **traversing a graph** where:
- **Nodes** = consciousness states / loops / life domain moments
- **Edges** = practice-to-practice transitions
- **BFS** = breadth-first exploration (survey all domains equally)
- **DFS** = depth-first immersion (dive deep into one loop/domain)

### 6.2 Companion Phase Engine
```
Phase 1: Friend (Days 0–14)
  → BFS mode: sample all 12 life domains lightly
  → "Let's see what's alive for you today"

Phase 2: Confidant (Days 15–60)
  → Switch to DFS on the 2–3 highest-impact domains
  → "We've been going deep into Relationships. Want to stay there?"

Phase 3: Long Companion (Days 61–365)
  → Adaptive: BFS on new domains, DFS on known ones
  → Remembers patterns, anticipates needs

Phase 4: Soul Companion (Year 2+)
  → Silent companionship — fewer prompts, more presence
  → Karma-level interventions only
```

### 6.3 Life Domain Breadth-First Scan
```typescript
// useCompanionEngine.ts — weekly BFS scan
const LIFE_DOMAINS = [
  "relationships", "money", "body", "work", "identity",
  "family", "sexuality", "time", "health", "solitude",
  "performance", "meaning"
];

function weeklyBreadthScan(profile: UserConsciousnessProfile) {
  const scores = profile.life_domains;
  const weakest = Object.entries(scores)
    .sort(([,a], [,b]) => a - b)
    .slice(0, 3)
    .map(([domain]) => domain);
  
  return {
    mode: "BFS",
    focus: weakest,
    companionLine: `I noticed ${weakest[0]} and ${weakest[1]} are tender spots. Want to sit with them this week?`,
    suggestedGames: recommendGamesForDomains(weakest),
    suggestedMirrors: mirrorsForDomains(weakest),
  };
}
```

### 6.4 Loop Depth-First Immersion
```typescript
function depthFirstImmersion(activeLoop: Loop) {
  return {
    mode: "DFS",
    loop: activeLoop,
    sessionPlan: {
      steps: [
        "Name the loop (witness it)",
        "Find the earliest memory of this pattern",
        "Feel the body sensation",
        "Ask: what is this loop protecting you from?",
        "One small act of freedom today",
      ],
      estimatedMinutes: 20,
    },
    companionLine: `We're going deep into ${activeLoop.name} today. No rush — just you and the pattern.`,
  };
}
```

---

## 7. Post-Onboarding Sequence: Day-by-Day

### Day 0 (Onboarding Complete → First Home Load)
1. AppEntry renders `<AppLayout />` → `/app` → Home
2. CompanionPresence shows: *"Hey — Aarav is sitting with you. Tap to begin."*
3. LifetimeCompanionCard shows: Phase 1 · Friend, V-Level 1.0
4. WisdomArcCard shows: Day 1 lesson
5. 2 program suggestions appear below the orb
6. **No foundation banner** — user is not forced into 76-session course
7. QuickPathMirrorButton visible for quick-path users

### Day 1–3: On-Ramp
- Companion greets by name
- Suggested programs persist until user starts one
- Mirror button pulses gently if no mirrors taken yet
- Orb breathing is slightly faster (excited energy)

### Day 4–7: Rhythm Establishing
- Wisdom Arc completes
- Companion transitions from "stranger" → "friend" phase
- First "lifetime companion" toast: *"7 days. I'm starting to know your patterns."*
- Suggested games appear if no games played yet

### Day 8–14: Personalization Invitation
- Home shows: *"Want to personalize your experience? → Explore → Mirror"*
- Card picker available in Settings
- BFS scan completes — 3 weakest life domains identified
- First domain-specific mirror suggested

### Day 15+: Deepening
- Companion phase → "confidant"
- DFS mode activates on 1–2 domains
- Programs become more targeted
- Lifetime companion card shows relationship depth

---

## 8. Free Model Defaults

### Model Tier: `free`
```typescript
const FREE_MODEL_CONFIG = {
  tier: "free",
  provider: "groq",
  model: "llama-3.1-8b-instant",
  maxTokens: 4096,
  contextWindow: 8192,
  costPerSession: 0,
  rateLimitRpm: 30,
  features: {
    streaming: true,
    multiTurn: true,
    voice: false,        // ElevenLabs costs money
    vision: false,        // Gemini costs money
    longContext: false,   // >8K tokens
  },
  upgradeTriggers: [
    "day > 14 && sessionCount > 20",   // engaged user
    "user requested deeper session",    // explicit intent
    "voice mode activated",             // feature request
  ],
};
```

### When Free Model Shows Upgrade Prompt
```
"Your sessions are going deep. Want to unlock:
  - Voice conversations with your guide
  - 128K context for longer journeys
  - Multi-modal insight (images, documents)
  
  [Stay Free]  [Upgrade to Pro →]"
```

The prompt appears **once per 7 days** and never blocks usage.

---

## 9. Key Components to Build/Modify

### New Components
| Component | Path | Purpose |
|-----------|------|---------|
| `HomeProgramSuggestions.tsx` | `components/home/` | 2–3 program cards below orb on Day 0–7 |
| `HomeCardPersonalizer.tsx` | `components/home/` | Card picker modal for home layout |
| `PostOnboardingNudge.tsx` | `components/home/` | "Go to Explore → Mirror to personalize" nudge |
| `SuggestedProgramsCard.tsx` | `components/home/` | Individual program suggestion card |

### Modified Components
| Component | Change |
|-----------|--------|
| `Home.tsx` | Add `<HomeProgramSuggestions />`, `<PostOnboardingNudge />` |
| `Explore.tsx` | Restructure with Mirror as first tab |
| `QuickPathMirrorButton.tsx` | Move from floating button to Explore tab |
| `CompanionPresence.tsx` | Ensure Day 0 stranger greeting shows |
| `appEntryMachine.ts` | Add `post_onboarding` state for Day 0–7 nudge |
| `useSuggestedPrograms.ts` | New hook for program recommendations |

---

## 10. Open Questions for Implementation

1. **Should quick-path users see the Foundation banner?** Currently removed — keep it removed for quick path, show only for deep path.

2. **Should Mirror be mandatory?** No — the design treats it as "gentle invitation", not a gate.

3. **Where does the "10 quotes loop card" live?** As a customizable home card in the card picker, pulling from `wisdomDeck.ts` (50 cards, rotate 10 at a time).

4. **BFS/DFS — real algorithm or metaphor?** Start as metaphor in companion copy. Real graph traversal can be added later when the consciousness map has enough nodes.

5. **Free model session limits?** Unlimited daily sessions at free tier. Rate limit is 30 RPM which is more than enough for one user.

---

## 11. Implementation Priority

```
Phase 1 (This Sprint)
  ✅ HomeProgramSuggestions — surface 2–3 programs on Day 0
  ✅ PostOnboardingNudge — "Go to Explore → Mirror"
  ✅ Explore restructure — Mirror as first tab
  ✅ CompanionPresence Day 0 greeting fix

Phase 2 (Next Sprint)
  🔲 HomeCardPersonalizer — card picker modal
  🔲 Loop Card component (pin to home)
  🔲 useSuggestedPrograms hook
  🔲 Domain heatmap card

Phase 3 (Future)
  🔲 Real BFS/DFS traversal engine
  🔲 Card drag-and-drop reorder
  🔲 Weekly companion insight report
  🔲 Voice mode for free tier (experiment)
```
