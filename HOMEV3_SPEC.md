# HOMEV3 — COMPLETE UI/UX SPECIFICATION
## ConsciousOS Daily Companion for 1 Billion Users

---

## 📋 DOCUMENT OVERVIEW

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Status** | Ready for Implementation |
| **Author** | Kilo (AI Engineer) |
| **Date** | 2026-11-07 |
| **Scope** | Complete Home tab redesign — Desktop + Mobile + Overlays + Interactions |
| **Dependencies** | AppLayout (header, footer, background), Consciousness Engine, Daily Gates, Session Orchestrator, Guide, Journal, Practice Engine, Analytics, Orb System |

---

## 🎯 DESIGN PHILOSOPHY

### Core Principle: "The App That Knows You"

> **Every pixel serves the relationship.** The orb is not a button — it's a living presence. Gates are not schedules — they're natural rhythms. Missions are not todos — they're meaningful invitations. Loops are not badges — they're visible growth.

### Seven Design Principles (from Product Docs)

1. **Depth Over Distraction** — No decorative elements; visual design creates space for awareness
2. **Adaptive Intelligence** — App adapts to user's time, energy, mood, developmental level
3. **Gentle Authority** — Guides without commanding; no guilt, urgency, or obligation
4. **Progressive Revelation** — Features reveal as user is ready (Day 1 vs Day 30)
5. **Cinematic Presence** — Deliberate animations, smooth transitions, reverent aesthetic
6. **Multi-Tradition Respect** — Universal language honoring source traditions
7. **Designed Obsolescence** — Ultimate success = users who no longer need the app

---

## 🧠 CONSCIOUSNESS MODEL INTEGRATION

### Three-Dimensional Model (from Consciousness Model Doc)

```
VERTICAL (V-Levels)     = HOW DEEP have you gone? (0-21)
HORIZONTAL (H-Capacities) = HOW BROAD are your skills? (12 capacities, 0-10)
CONTEXTUAL (Life Domains)  = WHERE does consciousness show up? (9 domains)
```

### Live Data Driving HomeV3

| Data Source | Hook | Updates |
|-------------|------|---------|
| V-Level | `useConsciousnessEngine` | Every session |
| Dimension Bands | `engineData.profile.dimension_bands` | Real-time |
| Active Loops | `engineData.activeLoopDetails` | Real-time |
| Bypassing Risk | `engineData.profile.bypassing_risk` | Real-time |
| Circadian Type | `userTimeProfile.circadianType` | Onboarding + updates |
| Guru Assignment | `useActiveGuruProgram` | Daily |
| Daily Theme | `useThemeOfDay` | Daily at midnight |
| Whisper | `useFutureWhisper` | Daily |
| Karma | `useKarma` | Real-time |
| Missions | `useDailyMissions` | Per gate |

---

## 🏗️ ARCHITECTURE

### Component Hierarchy

```
AppLayout (provides: header, footer, background, floating nav)
  └── HomeV3 (ScrollArea content only)
        ├── BackgroundSystem (gate-synced cosmic layers)
        ├── Section 1: ArrivalExperience + ConsciousnessOrb
        ├── Section 2: PresentJourney (theme + mission + CTA)
        ├── Section 3: DayArc (4 gates with missions)
        ├── Section 4: MomentEngine (3 recommendations)
        ├── Section 5: InnerExplorer (2 inquiry prompts)
        ├── Section 6: WisdomUniverse (whisper + guru insight)
        ├── Section 7: PersonalEvolution (stats + H-Capacities + loops)
        ├── Section 8: Constellation (discovery graph)
        ├── Section 9: LifeMap (9-domain radar)
        └── Overlays (portal-mounted):
            ├── SilentSpace
            ├── TimeAskSheet
            ├── TimeMomentSheet
            ├── GuideSessionOverlay
            ├── SessionIntroCard
            ├── OrbSession
            ├── ObserveOrbScreen
            ├── BreakthroughCelebration
            ├── MissionTimer (inline)
            └── MissionComplete (modal)
```

### Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Consciousness  │────▶│  Daily Missions  │────▶│   DayArc UI     │
│    Engine       │     │  (adaptive)      │     │  (gate progress)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  V-Level,       │     │  Mission per     │     │  Orb color/     │
│  Loops,         │     │  gate + loop     │     │  behavior per   │
│  Dimensions     │     │  antidotes       │     │  gate           │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## 🎨 VISUAL DESIGN LANGUAGE

### Color Tokens (from design-tokens.css)

```css
/* Backgrounds */
--color-bg-deep-obsidian: #090907
--color-bg-dark-charcoal: #11110E
--color-bg-elevated-surface: #15140F
--color-bg-secondary-surface: #1C1912

/* Gold Accents */
--color-gold-primary: #C6A15B
--color-gold-soft: #DFBD7B
--color-gold-champagne: #F2DCAE

/* Text Hierarchy */
--color-text-primary: #F4EFE4
--color-text-secondary: #B7AF9F
--color-text-muted: #827B6D

/* Semantic */
--color-calm: #9BAF94
--color-focus: #A5B7D1
--color-energy: #D8A76B
--color-reflection: #B6A2CF
--color-warning: #C98D70

/* Glass */
--glass-bg: rgba(21, 20, 15, 0.6)
--glass-border: rgba(198, 161, 91, 0.1)
--glass-blur: blur(20px)
```

### Typography Scale

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Greeting label | DM Sans | 9px | 600 | Primary/70 |
| Main heading | Playfair | 38px/64px | 300 | Foreground |
| Section label | DM Sans | 9px | 600 | Primary/65 |
| Section title | Playfair | 24px/32px | 300 | Foreground |
| Body text | DM Sans | 13px/15px | 400 | Foreground/70 |
| Micro/metadata | DM Sans | 9px/10px | 500 | Muted |

### Spacing (8pt base)

```css
--space-1: 4px  --space-5: 20px  --space-10: 40px
--space-2: 8px  --space-6: 24px  --space-12: 48px
--space-3: 12px --space-7: 28px  --space-16: 64px
--space-4: 16px --space-8: 32px  --space-20: 80px
```

### Motion

```css
--transition-fast: 180ms cubic-bezier(0.16, 1, 0.3, 1)
--transition-normal: 250ms cubic-bezier(0.16, 1, 0.3, 1)
--transition-slow: 350ms cubic-bezier(0.16, 1, 0.3, 1)
--transition-orb: 500ms cubic-bezier(0.16, 1, 0.3, 1)
--breathe-duration: 4s ease-in-out
```

---

## 🌅 GATE SYSTEM (4 Gates)

| Gate | Time | Theme | Energy | Max Duration | Practice Family | Orb Behavior |
|------|------|-------|--------|--------------|-----------------|--------------|
| **Morning** | 5-12 | Awakening | Awakening | 30 min | Energy | Gold particles rising, warm pulse |
| **Midday** | 12-17 | Presence | Active | 10 min | Focus | Sharp blue, focused pulse, responsive |
| **Evening** | 17-21 | Integration | Settling | 20 min | Healing | Warm amber, settling particles |
| **Night** | 21-5 | Sanctuary | Stillness | 10 min | Sleep | Deep indigo, minimal, surrender |

## 🧠 DAILY WISDOM SYSTEM — "आज का ज्ञान"

### Wisdom Categories (Generated Daily)

| Category | Hindi Key | Purpose | Source | Unlock Condition |
|----------|-----------|---------|--------|------------------|
| **Today's Theme** | आज का विषय | Core exploration thread | Consciousness Engine | Always |
| **Inner Inquiry** | आंतरिक जिज्ञासा | Deep question to sit with | Theme + V-Level | Always |
| **Future Whisper** | भविष्य की फुसफुसाहट | Temporal identity bridge | Mission completion (3/5) | 3 missions done |
| **Guru Insight** | गुरु का दृष्टिकोण | Tradition teaching for today | Active Guru Program | Always |
| **Today's Potholes** | आज के गड्ढे | Predictive challenge awareness | Loop detection + calendar | V-Level ≥ 3 |
| **Today's Challenges** | आज की चुनौतियाँ | Growth opportunities framed as challenges | Dimension gaps + loops | Always |
| **Today's Observations** | आज के अवलोकन | Micro-awareness prompts for the day | Active loops + weak dimensions | Always |
| **Shadow Signal** | छाया संकेत | Unconscious pattern alert | Bypassing risk + regression | Risk > 0.5 |
| **Integration Key** | समाकलन कुंजी | How to metabolize today's experience | Evening gate + completed sessions | After midday |
| **Evening Metabolization** | शाम का पाचन | End-of-day reflection frame | Journal + completed missions | Evening gate |

### Today's Potholes (Predictive Challenges)
```
Generated from: Active loops + calendar events + dimension weaknesses + circadian dip

Examples:
🕳️ "Meeting at 2 PM may trigger your Performance Loop — watch for 'I must prove myself'"
🕳️ "Low energy window 3-4 PM (your circadian dip) — Avoidance Loop may say 'skip practice'"
🕳️ "Evening comparison trap when scrolling social media — Comparison Loop active"
🕳️ "Financial decision today — Not-Enough Loop may drive scarcity thinking"
```

### Today's Challenges (Growth Opportunities)
```
Reframed from: Weakest dimension + active loops + gate energy

Format: "Challenge: [Specific] → Opportunity: [Growth framing]"

Examples:
🌱 "Challenge: Body awareness at 34 → Opportunity: Every sensation today is a doorway"
🌱 "Challenge: Perfectionism Loop (7/10) → Opportunity: Catch 'good enough' moments"
🌱 "Challenge: Finances domain (58) → Opportunity: One conscious money choice today"
🌱 "Challenge: Midday energy dip → Opportunity: Practice 60-second sensation anchor"
```

### Today's Observations (Micro-Awareness Prompts)
```
3-5 prompts per day, tailored to gate + loops + dimensions

Morning Gate (Awakening):
  👁️ "First sensation upon waking — where is it? What's its texture?"
  👁️ "Notice the transition: sleep → wake. Where does 'you' appear?"

Midday Gate (Presence):
  👁️ "Between each task: 3 sounds, feet on floor, one breath"
  👁️ "When urgency arises — is it real or a loop?"

Evening Gate (Integration):
  👁️ "One reactive moment today — trace it to body sensation"
  👁️ "What did you defend today? What were you protecting?"

Night Gate (Sanctuary):
  👁️ "Lay down today's identity. Who remains?"
  👁️ "Long exhale — what releases without effort?"
```

### Shadow Signal (Unconscious Pattern Alert)
```
Triggered when: Bypassing risk > 0.5 OR regression detected

Format: "⚠️ Shadow Signal: [Pattern] detected. [Gentle guidance]"

Examples:
⚠️ "Shadow Signal: Spiritual bypassing — using practice to avoid feeling. Try: 'What am I not feeling?'"
⚠️ "Shadow Signal: Regression pattern — old Victim Loop resurfacing. This is normal. Return to body."
⚠️ "Shadow Signal: High Control Loop — planning replaces presence. Notice: next 3 urges to plan."
```

### Integration Key (Evening)
```
Available after: Midday gate completion + at least 1 session

Format: "🔑 Integration Key: [How to metabolize today]"

Examples:
🔑 "Today's theme was 'Architecture of Attention'. Integration: Before sleep, review — where did attention collapse? Where did it hold?"
🔑 "You completed 2 missions and 1 session. Integration: Journal — 'What shifted in my witness capacity today?'"
🔑 "Perfectionism Loop interrupted 3x. Integration: Celebrate the catches. The loop weakens each time you see it."
```

### Evening Metabolization (Night Gate)
```
Night Gate exclusive — appears in Night Sanctuary

Format: "🌙 Evening Metabolization: [Release prompt]"

Examples:
🌙 "Write one line: 'Today I reacted when ____. The sensation was ____. I release it.'"
🌙 "Three gratitudes — not for what happened, but for what you noticed."
🌙 "Body scan for sleep: Where does the day live? Breathe there. Exhale = release."
```

---

## 🎯 DAILY MISSION SYSTEM

### Mission Types (8 types)

| Type | Icon | Duration | Karma | Gate Affinity |
|------|------|----------|-------|---------------|
| Micro-Practice | 🧘 | 2-5 min | 10-18 | All |
| Inquiry Prompt | ❓ | 2-8 min | 10-20 | Evening, Night |
| Somatic Anchor | 🫁 | 1-3 min | 8-15 | Morning, Midday |
| Pattern Interrupt | ⚡ | 5 min | 25 | Loop-based |
| Journal Spark | 📝 | 2-5 min | 10-15 | Evening |
| Micro-Karma | 🌱 | 3-5 min | 12-15 | Morning, Evening |
| Transition Ritual | 🔄 | 2-3 min | 10-12 | Midday, Evening |
| Silent Pause | 🤫 | 3-5 min | 10-12 | Night |

### Adaptive Selection Logic (Priority Order)

1. **Bypassing Risk > 0.7** → Grounding mission (streak protection)
2. **Active Loop** → Pattern interrupt with loop antidote
3. **Weakest Dimension** → Dimension-focused micro-practice
4. **Default** → Rotating pool (5 missions per gate, daily variety)

### Mission Rewards

```typescript
interface MissionReward {
  karmaPoints: 8-25
  streakProtection?: boolean      // Mission done = streak safe
  whisperUnlock?: boolean         // 3 missions → unlock whisper
  loopAntidoteProgress?: string   // Progress on specific loop
}
```

---

## 🔮 THE ORB — LIVING CENTERPIECE

### Technical Specs

- **Engine**: Raw WebGL2 (no Three.js) — 240,000 particles, 12 shaders
- **Performance**: 60fps on 5-year-old phone, <50KB gzipped, lazy-loaded
- **Size**: Mobile 280px, Tablet 320px, Desktop 360px, Large 400px

### Interactions (all <50ms response)

| Interaction | Trigger | Orb Response | Navigation |
|-------------|---------|--------------|------------|
| Tap | Single click | Pulse ripple (150ms) | None |
| Hold | 4.5 seconds | Progress ring → complete | Opens TimeAskSheet |
| Triple Tap | 3 taps <400ms | Strong pulse | → /app/practice |
| Double Tap | 2 taps <400ms | Gentle pulse | Opens Guide pre-session |

### Orb States (driven by consciousness engine)

| State | Color Palette | Animation | Gate |
|-------|---------------|-----------|------|
| Calm | Blue-green | Slow breathe | Morning/Evening |
| Focus | Blue-purple | Sharp pulse | Midday |
| Energy | Gold-amber | Expansive | Morning |
| Reflection | Purple-pink | Inward pull | Evening/Night |

### Accessibility

- Reduced motion = static beauty, same meaning
- Keyboard: Space/Enter = hold, Tab navigable
- Screen reader: "Living consciousness orb. Hold for 4.5 seconds to begin a session."

---

## 🖥️ DESKTOP (≥1024px) — COMPLETE WIREFRAME

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ APPLAYOUT HEADER (DesktopHeader - sticky top, z-50, glass-nav, glassmorphism)                                           │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │  🪷 ConsciousOS                                    [Breadcrumb: Home]                          [🔔 3] [🎨] [☀️] [⚙️] [⏻]   │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BACKGROUND (AppLayout home-background: base radial + gate-tinted atmosphere + grain)                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ HOMEV3 CONTENT (ScrollArea, max-w-6xl, mx-auto, px-8, pt-6, pb-8)                                                        │
│                                                                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ SECTION 1: ARRIVAL + ORB (lg:grid-cols-[1fr_0.92fr], gap-10, items-center, mt-8)                                  │   │
│ │ ┌─────────────────────────────────────────────────────┐  ┌─────────────────────────────────────────────────────┐   │   │
│ │ │ ARRIVAL EXPERIENCE (left, text-left)                │  │ CONSCIOUSNESS ORB (right, mx-auto, max-w-[430px])    │   │   │
│ │ │                                                     │  │                                                     │   │   │
│ │ │ "Take a moment"                                     │  │         ╭─────────────────────────╮                 │   │   │
│ │ │ (9px, uppercase, tracking-[0.3em], gold/70)         │  │        ╱  ◉  ◉  ◉  ◉  ◉  ◉  ◉  ╲                │   │   │
│ │ │                                                     │  │       ╱  ◉  ●  ●  ★  ●  ●  ◉  ╲   ← 360px WebGL   │   │   │
│ │ │ Return to                                           │  │      │  ●  ◉  ✦  ◉  ✦  ◉  ●  │   ← Canvas        │   │   │
│ │ │ yourself.                                           │  │      │  ◉  ●  ◉  ◉  ◉  ●  ◉  │   ← 240k particles│   │   │
│ │ │ (38px/64px, Playfair, light, tracking-[-0.025em])   │  │       ╲  ◉  ●  ●  ◉  ●  ◉  ╱                │   │   │
│ │ │                                                     │  │        ╲  ◉  ◉  ◉  ◉  ◉  ╱                 │   │   │
│ │ │ Today, make room for                                │  │         ╰─────────────────────────╯                 │   │   │
│ │ │ rewrite the old code.                               │  │                                                     │   │   │
│ │ │ (13px, DM Sans, muted/70, leading-7, max-w-md)      │  │  (Orb renders "Hold to begin" / progress ring)      │   │   │
│ │ └─────────────────────────────────────────────────────┘  └─────────────────────────────────────────────────────┘   │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ SECTION 2: PRESENT JOURNEY (grid sm:grid-cols-[1fr_auto], gap-6, border-t gold/10%, pt-7)                          │   │
│ │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
│ │ │ Your present journey · day 47                                                          [ Continue Journey → ]   │  │   │
│ │ │                                                                                                                   │  │   │
│ │ │ The Architecture of Attention                                                                                    │  │   │
│ │ │ (32px/40px, Playfair, light, foreground)                                                                         │  │   │
│ │ │                                                                                                                   │  │   │
│ │ │ A theme to explore through your own experience. No score or interpretation is assumed.                          │  │   │
│ │ │ (13px, DM Sans, foreground/70, leading-7, max-w-2xl)                                                            │  │   │
│ │ │                                                                                                                   │  │   │
│ │ │ 🕐  Breath Awareness · 12 min                                                                                   │  │   │
│ │ │ (11px, muted, Clock3 icon)                                                                                      │  │   │
│ │ │                                                                                                                   │  │   │
│ │ │ ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │  │   │
│ │ │ │  🎯 TODAY'S MISSION (Current Gate: Midday — Presence)                                                     │   │  │   │
│ │ │ │  ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐  │   │  │   │
│ │ │ │  │  60-Second Sensation Anchor                                                                        │  │   │  │   │
│ │ │ │  │  Between every task: feel feet on floor, hear 3 sounds, take 1 conscious breath                    │  │   │  │   │
│ │ │ │  │  ⏱ 1 min  •  💎 8 karma  •  🛡️ Streak protection                                                 │  │   │  │   │
│ │ │ │  │  [Begin Mission]                                                                                   │  │   │  │   │
│ │ │ │  └────────────────────────────────────────────────────────────────────────────────────────────────────┘  │   │  │   │
│ │ │ └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │  │   │
│ │ │                                                                                                                   │  │   │
│ │ │ ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │  │   │
│ │ │ │  🕳️ TODAY'S POTHOLES (Predictive — based on your loops & calendar)                                      │   │  │   │
│ │ │ │  │  🕳️ 2 PM meeting → Performance Loop: "I must prove myself"                                           │   │  │   │
│ │ │ │  │  🕳️ 3-4 PM energy dip → Avoidance Loop: "Skip practice"                                              │   │  │   │
│ │ │ │  │  🕳️ Evening scroll → Comparison Trap activates                                                       │   │  │   │
│ │ │ │  │  [View All Potholes]                                                                                  │   │  │   │
│ │ │ └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │  │   │
│ │ │                                                                                                                   │  │   │
│ │ │ ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │  │   │
│ │ │ │  🌱 TODAY'S CHALLENGES (Growth opportunities)                                                              │   │  │   │
│ │ │ │  │  Challenge: Body awareness at 34 → Opportunity: Every sensation is a doorway                          │   │  │   │
│ │ │ │  │  Challenge: Perfectionism Loop (7/10) → Opportunity: Catch "good enough" moments                      │   │  │   │
│ │ │ │  │  [Reframe All Challenges]                                                                              │   │  │   │
│ │ │ └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │  │   │
│ │ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ SECTION 3: DAY ARC — 4 GATES WITH MISSIONS & PROGRESS                                                                │   │
│ │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
│ │ │  DAILY RHYTHM · Today's Flow                                                                                    │  │   │
│ │ │  ┌──────────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────┐  │  │   │
│ │ │  │         🌅 DAWN (5–12)       │         ☀️ DAY (12–17)      │         🌇 DUSK (17–21)      │   🌙 NIGHT   │  │  │   │
│ │ │  │         Gate of Beginning    │    ● CURRENT ●              │         Gate of Integration  │  Gate of     │  │  │   │
│ │ │  │         Awakening            │    Gate of Presence         │         Settling             │  Sanctuary   │  │  │   │
│ │ │  │                              │    Active Energy            │                              │  Stillness   │  │  │   │
│ │ │  │  ┌────────────────────────┐  │  ┌────────────────────────┐  │  ┌────────────────────────┐  │              │  │  │   │
│ │ │  │  │ MISSION: ✓ DONE       │  │  │ MISSION: ● ACTIVE      │  │  │ MISSION: ○ PENDING     │  │              │  │  │   │
│ │ │  │  │ 3 Breaths Before      │  │  │ 60-Second Sensation    │  │  │ Trace Reactive Moment  │  │              │  │  │   │
│ │ │  │  │ Rising (2 min)        │  │  │ Anchor (1 min)         │  │  │ to Body (8 min)        │  │              │  │  │   │
│ │ │  │  │ 💎 +10  🛡️ +streak    │  │  │ 💎 +8  🛡️ +streak     │  │  │ 💎 +20  🛡️ +streak    │  │              │  │  │   │
│ │ │  │  │ [View Reflection]     │  │  │ [Begin Mission]        │  │  │ [Not Available Yet]    │  │              │  │  │   │
│ │ │  │  └────────────────────────┘  │  └────────────────────────┘  │  └────────────────────────┘  │              │  │  │   │
│ │ │  │                              │                              │                              │              │  │  │   │
│ │ │  │  Progress: ████████░░ 80%    │  Progress: ████████████ 100% │  Progress: ████░░░░░░░░ 30%  │              │  │  │   │
│ │ │  │  [Enter Gate]                │  [Enter Gate]                │  [Enter Gate]                │              │  │  │   │
│ │ │  └──────────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────┘  │  │   │
│ │ │                                                                                                                   │  │   │
│ │ │  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │  │   │
│ │ │  │  🔑 INTEGRATION KEY (Evening): Before sleep, review — where did attention collapse? Where did it hold?  │  │  │   │
│ │ │  └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │  │   │
│ │ │                                                                                                                   │  │   │
│ │ │  Timeline:  6AM ──●── 9AM ──●── 12PM ──●── 3PM ──●── 6PM ──●── 9PM ──●── 12AM ──●── 3AM ──●── 6AM            │  │   │
│ │ │                    ▲                                                                                              │  │   │
│ │ │                 NOW (12:47 PM)                                                                                    │  │   │
│ │ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ SECTION 4: MOMENT ENGINE — 3 CONTEXTUAL RECOMMENDATIONS (grid gap-4, lg:grid-cols-3)                               │   │
│ │ ┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌─────────────────────────────┐                     │   │
│ │ │ 📝 REFLECT                  │ │ 🧘 PRACTICE                 │ │ 🎯 EXPERIENCE               │                     │   │
│ │ │                             │ │                             │ │                             │                     │   │
│ │ │ Evening Review              │ │ Body Scan                   │ │ Inner Inquiry               │                     │   │
│ │ │ 10 min · Journal            │ │ 15 min · Practice           │ │ 8 min · Guide               │                     │   │
│ │ │                             │ │                             │ │                             │                     │   │
│ │ │ Why: Your reflection        │ │ Why: Body dimension         │ │ Why: Active perfectionism   │                     │   │
│ │ │ dimension is lowest (34)    │ │ is lowest (34) — somatic    │ │ loop — inquiry dissolves    │                     │   │
│ │ │                             │ │ grounding needed            │ │ mental spinning             │                     │   │
│ │ │ [Begin Reflection]          │ │ [Begin Practice]            │ │ [Begin Experience]          │                     │   │
│ │ └─────────────────────────────┘ └─────────────────────────────┘ └─────────────────────────────┘                     │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ SECTION 5: INNER EXPLORER — INQUIRY PROMPTS (grid gap-4, sm:grid-cols-2)                                           │   │
│ │ ┌──────────────────────────────────────────────────┐ ┌──────────────────────────────────────────────────┐         │   │
│ │ │ "Where in your body do you feel                  │ │ "What pattern is asking to be                    │         │   │
│ │ │  the weight of today's expectations?"             │ │  witnessed right now — not fixed, just seen?"   │         │   │
│ │ │                                                   │ │                                                   │         │   │
│ │ │ [Explore in Guide]  ← opens pre-session chat     │ │ [Explore in Guide]                               │         │   │
│ │ └──────────────────────────────────────────────────┘ └──────────────────────────────────────────────────┘         │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ SECTION 6: WISDOM UNIVERSE (glass card, gilt border, p-6)                                                          │   │
│ │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
│ │ │  ✦  "What would it mean to trust the silence between thoughts — to not fill every gap with knowing?"          │  │   │
│ │ │                                                                                                                  │  │   │
│ │ │  — Whisper from your future self (unlocked: 3/5 missions this week)                                           │  │   │
│ │ │                                                                                                                  │  │   │
│ │ │  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │  │   │
│ │ │  │  🧘 Guru Insight — Ramana Maharshi (Today's Guide)                                                     │   │  │   │
│ │ │  │  "The mind is a bundle of thoughts. The root of all thoughts is the 'I' thought.                        │   │  │   │
│ │ │  │  Who am I? This inquiry alone dissolves the false."                                                    │   │  │   │
│ │ │  │  [Listen in Guide]  [Read Teaching]                                                                    │   │  │   │
│ │ │  └────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │  │   │
│ │ │                                                                                                                  │  │   │
│ │ │  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │  │   │
│ │ │  │  🕳️ TODAY'S POTHOLES (Predictive Challenges)                                                          │   │  │   │
│ │ │  │  • 2 PM meeting → Performance Loop trigger: "I must prove myself"                                     │   │  │   │
│ │ │  │  • 3-4 PM circadian dip → Avoidance Loop: "Skip practice"                                             │   │  │   │
│ │ │  │  • Evening social media → Comparison Loop activation                                                  │   │  │   │
│ │ │  │  [View All Potholes →]                                                                                  │   │  │   │
│ │ │  └────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │  │   │
│ │ │                                                                                                                  │  │   │
│ │ │  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │  │   │
│ │ │  │  🌱 TODAY'S CHALLENGES (Growth Opportunities)                                                          │   │  │   │
│ │ │  │  • Body awareness (34) → Every sensation is a doorway                                                 │   │  │   │
│ │ │  │  • Perfectionism Loop (7/10) → Catch "good enough" moments                                            │   │  │   │
│ │ │  │  • Finances (58) → One conscious money choice today                                                   │   │  │   │
│ │ │  │  [View All Challenges →]                                                                                │   │  │   │
│ │ │  └────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │  │   │
│ │ │                                                                                                                  │  │   │
│ │ │  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │  │   │
│ │ │  │  👁️ TODAY'S OBSERVATIONS (Micro-Awareness Prompts)                                                   │   │  │   │
│ │ │  │  • Between tasks: 3 sounds, feet on floor, one breath                                                 │   │  │   │
│ │ │  │  • When urgency arises: real or loop?                                                                   │   │  │   │
│ │ │  │  • One reactive moment → trace to body sensation                                                        │   │  │   │
│ │ │  │  [Explore in Guide]                                                                                     │   │  │   │
│ │ │  └────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │  │   │
│ │ │                                                                                                                  │  │   │
│ │ │  ⚠️ SHADOW SIGNAL: Spiritual bypassing detected — using practice to avoid feeling. "What am I not feeling?" │  │   │
│ │ │                                                                                                                  │  │   │
│ │ │  🔑 INTEGRATION KEY: Before sleep, review — where did attention collapse? Where did it hold?                │  │   │
│ │ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ SECTION 7: PERSONAL EVOLUTION (grid gap-4, lg:grid-cols-[1fr_2fr])                                                │   │
│ │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  ┌─────────────────────────────────────────────────┐  │   │
│ │ │      47         │ │      128        │ │      47         │  │  ACTIVE PATTERNS & LOOPS                          │  │   │
│ │ │   Day Streak    │ │  Total Sessions │ │  Journey Day    │  │                                                   │  │   │
│ │ └─────────────────┘ └─────────────────┘ └─────────────────┘  │  🔄 Perfectionism Loop        Severity: 7/10    │  │   │
│ │                                                              │  Antidotes done: 3/7 this week  [Explore]        │  │   │
│ │  ┌──────────────────────────────────────────────────────┐    │  Last interrupted: 2 hours ago                    │  │   │
│ │  │ V-LEVEL: 4.2/7.0  (Awakening)                         │    │                                                   │  │   │
│ │  │ ████████░░░░░░░░░░░░░░░░░░░░ 42%                      │    │  🔄 Avoidance Loop            Severity: 5/10    │  │   │
│ │  │                                                      │    │  Antidotes done: 1/5 this week  [Explore]        │  │   │
│ │  │ H-CAPACITIES:                                        │    │                                                   │  │   │
│ │  │ Awareness: 6.2  Stillness: 4.1  Presence: 5.8       │    │  🔄 Comparison Trap           Severity: 4/10    │  │   │
│ │  │ Inquiry: 4.5  Equanimity: 3.9  Compassion: 4.3      │    │  Antidotes done: 2/3 this week  [Explore]        │  │   │
│ │  │ Embodiment: 3.7  Discernment: 4.0  Integration: 3.8 │    │                                                   │  │   │
│ │  │ Creativity: 5.1  Surrender: 3.5  Service: 2.8       │    │  [View All Loops →]                                  │  │   │
│ │  └──────────────────────────────────────────────────────┘    └─────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ SECTION 8: CONSTELLATION — DISCOVERY NODE GRAPH (canvas, 400px height, interactive pan/zoom)                       │   │
│ │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
│ │ │                                                                                                                  │  │   │
│ │ │     ●──────●──────●         RECENT THEMES (explored, gold)                                                      │  │   │
│ │ │      \     |     /                                                                                              │  │   │
│ │ │       ●────●────●          CURRENT FOCUS (active, pulsing gold)                                                 │  │   │
│ │ │      /     |     \                                                                                              │  │   │
│ │ │     ●      ●      ●         ACTIVE LOOPS (available, amber)                                                     │  │   │
│ │ │                                                                                                                  │  │   │
│ │ │  Legend:  ● Theme explored    ● Current focus    ● Loop available    ● Insight gained                          │  │   │
│ │ │  [Pan/zoom — click node to explore → opens Guide with context]                                                  │  │   │
│ │ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ SECTION 9: LIFE MAP — 9 DOMAIN RADAR (canvas, 350px height, hover for details)                                     │   │
│ │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
│ │ │                                                                                                                  │  │   │
│ │ │                           Work (78)        ◉                                                                    │  │   │
│ │ │                                    ◉                                                                          │  │   │
│ │ │                         Relationships (65)  ◉     ◉                                                            │  │   │
│ │ │                                    ◉         ◉                                                                  │  │   │
│ │ │                    Health (72)    ◉    ◉    ◉                                                                  │  │   │
│ │ │                              ◉        ◉                                                                      │  │   │
│ │ │                       Finances (58)  ◉      ◉        ◉   (current)                                            │  │   │
│ │ │                         ◉    ◉                                                                                  │  │   │
│ │ │                    Creativity (71)  ◉  ◉    ◉    ◉  (target)                                                  │  │   │
│ │ │                         ◉  ◉    ◉  ◉                                                                      │  │   │
│ │ │                    Inner Peace (69)    ◉    ◉  ◉                                                                │  │   │
│ │ │                                                                                                                  │  │   │
│ │ │  Weakest: Finances (58) → Today's missions prioritize practical grounding                                     │  │   │
│ │ │  [Interactive — hover domain for daily trend, click for Guide exploration]                                    │  │   │
│ │ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ FOOTER (border-t gold/10%, pt-5, flex flex-wrap items-center justify-between gap-4)                                │   │
│ │ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
│ │ │  A companion for the life you are already living.                                                              │  │   │
│ │ │                                                                                                                  │  │   │
│ │ │  [Karma: 1,247  •  Tier 3: Seeker  •  234 to next]                    [Explore Practice]  [⚙️ Settings]      │  │   │
│ │ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 MOBILE (<480px) — COMPLETE WIREFRAME

```
┌─────────────────────────────┐
│ APPLAYOUT MOBILE HEADER     │
│ ┌─────────────────────────┐ │
│ │ ← Brand  🔔  🎨  ☀️  ⚙️ │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ BACKGROUND (same 4 layers)  │
├─────────────────────────────┤
│ HOMEV3 CONTENT (ScrollArea) │
│                             │
│ ┌─────────────────────────┐ │
│ │ SECTION 1: ARRIVAL      │ │
│ │                         │ │
│ │ "Take a moment"         │ │
│ │                         │ │
│ │ Return to               │ │
│ │ yourself.               │ │
│ │                         │ │
│ │ Today, make room for    │ │
│ │ rewrite the old code.   │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ SECTION 1b: ORB         │ │
│ │      (280px diameter)   │ │
│ │                         │ │
│ │       ╭─────────╮       │ │
│ │      ╱  ◉ ◉ ◉ ◉  ╲      │ │
│ │     │  ◉ ● ★ ● ◉  │      │ │
│ │      ╲  ◉ ◉ ◉ ◉  ╱      │ │
│ │       ╰─────────╯       │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ SECTION 2: PRESENT      │ │
│ │ JOURNEY                 │ │
│ │                         │ │
│ │ Your journey · day 47   │ │
│ │                         │ │
│ │ The Architecture of     │ │
│ │ Attention               │ │
│ │                         │ │
│ │ A theme to explore      │ │
│ │ through your own        │ │
│ │ experience...           │ │
│ │                         │ │
│ │ 🕐 Breath Awareness     │ │
│ │    12 min               │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ 🎯 TODAY'S MISSION  │ │ │
│ │ │ 60-Second Sensation │ │ │
│ │ │ Anchor (1 min)      │ │ │
│ │ │ 💎 8  🛡️ streak     │ │ │
│ │ │ [Begin Mission]     │ │ │
│ │ └─────────────────────┘ │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ 🕳️ TODAY'S POTHOLES │ │ │
│ │ │ 2 PM meeting →      │ │ │
│ │ │ Performance Loop    │ │ │
│ │ │ 3-4 PM dip →        │ │ │
│ │ │ Avoidance Loop      │ │ │
│ │ │ Evening scroll →    │ │ │
│ │ │ Comparison Trap     │ │ │
│ │ │ [View All]          │ │ │
│ │ └─────────────────────┘ │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ 🌱 TODAY'S CHALLENGES│ │ │
│ │ │ Body (34) →         │ │ │
│ │ │ Every sensation     │ │ │
│ │ │ is a doorway        │ │ │
│ │ │ Perfectionism (7/10)│ │ │
│ │ │ → Catch "good       │ │ │
│ │ │ enough"             │ │ │
│ │ │ [Reframe All]       │ │ │
│ │ └─────────────────────┘ │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ Continue Journey →  │ │ │
│ │ └─────────────────────┘ │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ SECTION 3: DAY ARC      │ │
│ │ (horizontal scroll)     │ │
│ │                         │ │
│ │ [DAWN] [DAY●] [DUSK]    │ │  ← swipeable, DAY active
│ │ [NIGHT]                 │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ ☀️ DAY — Presence   │ │ │
│ │ │ 12–17 PM  Active    │ │ │
│ │ │                     │ │ │
│ │ │ MISSION: ACTIVE     │ │ │
│ │ │ 60-Second Sensation │ │ │
│ │ │ Anchor (1 min)      │ │ │
│ │ │ 💎 +8  🛡️ streak   │ │ │
│ │ │ [Begin Mission]     │ │ │
│ │ │                     │ │ │
│ │ │ Progress: ████████  │ │ │
│ │ │ 100%                │ │ │
│ │ │ [Enter Gate]        │ │ │
│ │ └─────────────────────┘ │ │
│ │                         │ │
│ │ Timeline: 6●9●12●3●6●9●12●3●6  ← scrollable
│ │              ▲ NOW        │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ SECTION 4: MOMENTS      │ │
│ │ (vertical stack)        │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ 📝 REFLECT          │ │ │
│ │ │ Evening Review      │ │ │
│ │ │ 10 min · Journal    │ │ │
│ │ │ Why: Reflection dim │ │ │
│ │ │ [Begin]             │ │ │
│ │ └─────────────────────┘ │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ 🧘 PRACTICE         │ │ │
│ │ │ Body Scan           │ │ │
│ │ │ 15 min · Practice   │ │ │
│ │ │ Why: Body dim low   │ │ │
│ │ │ [Begin]             │ │ │
│ │ └─────────────────────┘ │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ 🎯 EXPERIENCE       │ │ │
│ │ │ Inner Inquiry       │ │ │
│ │ │ 8 min · Guide       │ │ │
│ │ │ Why: Perfectionism  │ │ │
│ │ │ [Begin]             │ │ │
│ │ └─────────────────────┘ │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ SECTION 5: INNER        │ │
│ │ EXPLORER (stack)        │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ "Where in your body │ │ │
│ │ │  do you feel the    │ │ │
│ │ │  weight of today?"  │ │ │
│ │ │ [Explore in Guide]  │ │ │
│ │ └─────────────────────┘ │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ "What pattern is    │ │ │
│ │ │  asking to be       │ │ │
│ │ │  witnessed?"        │ │ │
│ │ │ [Explore in Guide]  │ │ │
│ │ └─────────────────────┘ │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ SECTION 6: WISDOM       │ │
│ │ UNIVERSE                │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ ✦ "What would it    │ │ │
│ │ │   mean to trust     │ │ │
│ │ │   the silence..."   │ │ │
│ │ │                     │ │ │
│ │ │ — Future self       │ │ │
│ │ │                     │ │ │
│ │ │ ┌─────────────────┐ │ │ │
│ │ │ │ 🧘 Ramana       │ │ │ │
│ │ │ │ "Who am I?..."  │ │ │ │
│ │ │ │ [Listen] [Read] │ │ │ │
│ │ │ └─────────────────┘ │ │ │
│ │ │                     │ │ │
│ │ │ 🕳️ POTHOLES: 2 PM meeting, 3-4 PM dip, evening scroll │ │ │
│ │ │ 🌱 CHALLENGES: Body→doorway, Perfectionism→catch, Finances→conscious choice │ │ │
│ │ │ 👁️ OBSERVATIONS: Between tasks, urgency check, reactive trace │ │ │
│ │ │ ⚠️ SHADOW: Spiritual bypassing detected │ │ │
│ │ │ 🔑 INTEGRATION: Where did attention collapse/hold? │ │ │
│ │ └─────────────────────┘ │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ SECTION 7: EVOLUTION    │ │
│ │                         │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ │ │
│ │ │ 47  │ │ 128 │ │ 47  │ │ │
│ │ │Streak│ │Sess │ │Day  │ │ │
│ │ └─────┘ └─────┘ └─────┘ │ │
│ │                         │ │
│ │ V-LEVEL: 4.2/7.0        │ │
│ │ ████████░░░░░░░░░░░░░░░░░░░░ 42% │ │
│ │                         │ │
│ │ H-CAPACITIES:           │ │
│ │ Awareness: 6.2  Stillness: 4.1  Presence: 5.8 │ │
│ │ Inquiry: 4.5  Equanimity: 3.9  Compassion: 4.3 │ │
│ │ Embodiment: 3.7  Discernment: 4.0  Integration: 3.8 │ │
│ │ Creativity: 5.1  Surrender: 3.5  Service: 2.8 │ │
│ │                         │ │
│ │ Active Loops:           │ │
│ │ 🔄 Perfectionism (7/10) │ │
│ │   3/7 antidotes done    │ │
│ │ 🔄 Avoidance (5/10)     │ │
│ │   1/5 antidotes done    │ │
│ │ 🔄 Comparison (4/10)    │ │
│ │   2/3 antidotes done    │ │
│ │ [View All →]            │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ SECTION 8: CONSTELLATION│ │
│ │ (canvas, touch pan/zoom)│ │
│ │                         │ │
│ │     ●────●────●         │ │
│ │      \  |  /            │ │
│ │       ●──●──●           │ │
│      /  |  \             │ │
│     ●   ●   ●             │ │
│ │                         │ │
│ │ [Tap node to explore]   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ SECTION 9: LIFE MAP     │ │
│ │ (radar chart, touch)    │ │
│ │                         │ │
│ │        ◉ Work           │ │
│ │      ◉   ◉ Relationships│ │
│ │    ◉   ◉ Health         │ │
│ │      ◉   ◉ Finances     │ │
│ │        ◉ Creativity     │ │
│ │        ◉ Inner Peace    │ │
│ │                         │ │
│ │ Weakest: Finances (58)  │ │
│ │ [Tap for details]       │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ FOOTER (AppLayout FloatingNav) │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🏠  🔥  📖  ✏️  📊  🧭  📚 │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

---

## 🔄 OVERLAYS (ALL PLATFORMS)

### Silent Space (Full-Screen)
```
┌─────────────────────────────────────┐
│  [× Close]                          │
│                                     │
│         ╭─────────────────────────╮ │
│        ╱  ◉  ◉  ◉  ◉  ◉  ◉  ◉  ╲   │
│       │  ●  ◉  ✦  ◉  ✦  ◉  ●  │    │ ← Full-screen orb
│        ╲  ◉  ◉  ◉  ◉  ◉  ◉  ◉  ╱   │
│         ╰─────────────────────────╯   │
│                                     │
│              "Hold to begin"        │
│                                     │
│         [Begin Session]  [Practice] │
└─────────────────────────────────────┘
```

### TimeAsk Sheet (Bottom Sheet)
```
┌─────────────────────────────────────┐
│  ╭───────────────────────────────╮  │
│  │  How long do you have?         │  │
│  │  Midday Gate — Presence        │  │
│  ╰───────────────────────────────╯  │
│                                     │
│  Duration:  [5] [10] [15] [20] min │
│                                     │
│  Energy:    [Low] [Medium●] [High]  │
│                                     │
│  Intent:    ______________________  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Begin Session           │   │
│  └─────────────────────────────┘   │
│                                     │
│  Talk to a guide first →          │
│                                     │
│  ✦ "Future self whispers..."      │
└─────────────────────────────────────┘
```

### TimeMoment Sheet (Gate Actions)
```
┌─────────────────────────────────────┐
│  ╭───────────────────────────────╮  │
│  │  🌇 DUSK — Gate of Integration │  │
│  │  5:00 PM – 9:00 PM             │  │
│  ╰───────────────────────────────╯  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🧘 Begin Session (15 min)   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📝 Open Journal             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎯 Explore Practice         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Mission: Trace Reactive Moment   │
│  (8 min)  💎 +20  [Begin Mission] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ╭───────────────────────────────╮  │
│  │  🌙 NIGHT — Gate of Sanctuary  │  │
│  │  9:00 PM – 5:00 AM             │  │
│  ╰───────────────────────────────╯  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🧘 Begin Session (10 min)   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🌙 Evening Metabolization   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📝 Three Gratitudes         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎯 Explore Practice         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Mission: Long Exhales Only       │
│  (5 min)  💎 +12  [Begin Mission] │
└─────────────────────────────────────┘
```

### Mission Timer (Inline)
```
┌─────────────────────────────────────┐
│ 🎯 60-Second Sensation Anchor       │
│                                     │
│ ⏱ 0:45 remaining                    │
│ ████████████░░░░ 75%               │
│                                     │
│ "Feel feet. Hear 3 sounds. Breathe."│
│                                     │
│ [Pause]  [Complete Early]           │
└─────────────────────────────────────┘
```

### Mission Complete (Modal)
```
┌─────────────────────────────────────┐
│ ✨ Mission Complete!                │
│                                     │
│ +8 Karma Points                     │
│ 🛡️ Streak protected today          │
│                                     │
│ "How did that feel?"                │
│ __________________________________  │
│                                     │
│ [Save & Continue]  [Skip]           │
└─────────────────────────────────────┘
```

### Evening Metabolization (Night Gate — Full-Screen Overlay)
```
┌─────────────────────────────────────┐
│  🌙 Evening Metabolization          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ "Write one line:            │   │
│  │  'Today I reacted when ____.│   │
│  │  The sensation was ____.    │   │
│  │  I release it.'"            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Three Gratitudes            │   │
│  │ Not for what happened,      │   │
│  │ but for what you noticed.   │   │
│  │ 1. _______________________  │   │
│  │ 2. _______________________  │   │
│  │ 3. _______________________  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Body Scan for Sleep         │   │
│  │ Where does the day live?    │   │
│  │ Breathe there. Exhale=release│  │
│  │ [Begin 8 min Scan]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Save & Sleep]  [Skip to Sleep]   │
└─────────────────────────────────────┘
```

### Shadow Signal (Toast/Inline Alert)
```
┌─────────────────────────────────────┐
│ ⚠️ Shadow Signal                    │
│                                     │
│ Spiritual bypassing detected —     │
│ using practice to avoid feeling.   │
│                                     │
│ "What am I not feeling right now?" │
│                                     │
│ [Explore in Guide]  [Dismiss]       │
└─────────────────────────────────────┘
```

### Whisper Unlock (Celebration Toast)
```
┌─────────────────────────────────────┐
│ ✨ Whisper Unlocked!                │
│                                     │
│ 3 missions complete — your future  │
│ self has a message for you.        │
│                                     │
│ [Read in Wisdom Universe]           │
└─────────────────────────────────────┘
```

---

## ⚡ KEY INTERACTIONS

| Interaction | Trigger | Feedback | Navigation |
|-------------|---------|----------|------------|
| Orb Tap | Click/tap | Pulse ripple (150ms) | None |
| Orb Hold | 4.5s hold | Progress ring → complete | Opens TimeAskSheet |
| Orb Triple Tap | 3 taps <400ms | Strong pulse | → /app/practice |
| Orb Double Tap | 2 taps <400ms | Gentle pulse | Opens Guide pre-session |
| Gate Tap | Click DayArc gate | Highlight + haptic | Opens TimeMomentSheet |
| Mission Begin | Tap [Begin Mission] | Button press + orb pulse | Opens MissionTimer inline |
| Mission Complete | Tap [Complete] | Celebration burst + karma anim | Shows MissionComplete modal |
| Silent Space | Tap 🌙 header | Smooth slide up | Full-screen orb |
| Constellation Node | Click/tap node | Node expands | Opens Guide with context |
| Life Map Domain | Hover/tap domain | Tooltip + highlight | Opens Guide exploration |
| Whisper Unlock | 3 missions done | Golden shimmer | Shows in Wisdom Universe |

---

## 📱 RESPONSIVE BEHAVIOR

| Component | Desktop (≥1024px) | Tablet (768–1023px) | Mobile (<768px) |
|-----------|-------------------|---------------------|-----------------|
| Arrival + Orb | Side-by-side (1fr / 0.92fr) | Stacked | Stacked |
| Orb Size | 360–400px | 320px | 280px |
| Day Arc | 4-col grid + timeline | 2×2 grid + mini timeline | Horizontal swipe cards |
| Moments | 3-col grid | 2-col grid | Vertical stack |
| Inner Explorer | 2-col grid | 2-col grid | Vertical stack |
| Personal Evolution | Stats left + Loops right | Stacked | Stacked |
| Constellation | 400px canvas, mouse | 350px canvas, touch | 300px canvas, touch |
| Life Map | 350px radar, hover | 300px radar, tap | 280px radar, tap |
| Header | AppLayout DesktopHeader | Condensed | Mobile header + FloatingNav |
| Footer | Custom footer | FloatingNav | FloatingNav |

---

## 🧩 IMPLEMENTATION FILES

### New Files Created
```
src/lib/consciousness/dailyMissions.ts      # Mission types, pools, generation
src/hooks/useDailyMissions.ts                # Data layer with mutations
src/components/home/BackgroundSystem.tsx     # 4-layer cosmic backgrounds
src/components/home/ConsciousnessOrb.tsx     # Orb wrapper with interactions
src/pages/HomeV3.tsx                         # Master orchestrator
```

### Existing Components Used
```
src/components/home/ArrivalExperience.tsx
src/components/home/PresentJourney.tsx
src/components/home/DayArc.tsx
src/components/home/MomentEngine.tsx
src/components/home/InnerExplorer.tsx
src/components/home/WisdomUniverse.tsx
src/components/home/PersonalEvolution.tsx
src/components/home/Constellation.tsx
src/components/home/LifeMap.tsx
src/components/home/KarmaIndicator.tsx
src/components/home/SilentSpace.tsx
src/components/home/TimeAskSheet.tsx
src/components/home/TimeMomentSheet.tsx
src/components/home/OrbSession.tsx
src/components/home/ObserveOrbScreen.tsx
src/components/guide/GuideSessionOverlay.tsx
src/components/sutra/SessionIntroCard.tsx
src/components/BreakthroughCelebration.tsx
src/components/orb/OversoulOrbPure.tsx
```

### Routing Updated
```
src/App.tsx: Home → HomeV3 (lazy import)
```

---

## 🎯 ADAPTIVE BEHAVIORS

### Arrival Greeting (by EntryContext)
```typescript
// From dailyGates.ts determineEntryContext()
'fresh_entry'       → "Good morning. A new day of awareness begins."
'continuation'      → "Welcome back. The thread continues."
'return_after_gap'  → "Welcome back. No guilt, no rush. Just presence."
'emotional_trigger' → "Something's stirring. Want to talk?"
'crisis'            → "You're here. That's enough."
'celebration'       → "Something shifted. Want to explore?"
```

### Orb Behavior by Gate + Circadian
```typescript
// Morning + Night Owl → softer pulse, dimmer gold, 10min max
// Midday + Early Bird → sharp focus, shorter duration
// Evening + High V-Level → deeper inquiry, longer duration
// Night → minimal, surrender mode
```

### Mission Selection Priority
```
1. Bypassing > 0.7     → Grounding (streak protection)
2. Active Loop         → Pattern Interrupt (loop antidote)
3. Weakest Dimension   → Dimension Practice
4. Default Pool        → Rotating variety
```

---

## 📊 SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Daily Active Relationship (DAR)** | >25% | Meaningful engagement (session + mission + reflection) |
| **Mission Completion Rate** | >60% | Missions completed / missions available |
| **Orb Interaction Rate** | >80% | Any orb interaction / daily sessions |
| **Guide Entry from Home** | >30% | Guide sessions originated from Home |
| **Streak Retention** | >70% | Day 30 streak / Day 1 users |
| **Whisper Unlock Rate** | >40% | Users completing 3+ missions/week |
| **Constellation Engagement** | >20% | Nodes clicked / daily active users |

---

## ♿ ACCESSIBILITY

- **Semantic HTML**: Proper heading hierarchy (h1→h2→h3), landmark regions
- **ARIA Labels**: All interactive elements have descriptive labels
- **Keyboard Navigation**: Full Tab support, Space/Enter for orb hold
- **Color Contrast**: Semantic tokens ensure WCAG AA in dark/light
- **Reduced Motion**: `prefers-reduced-motion` disables animations, keeps meaning
- **Screen Reader**: "Living consciousness orb. Hold for 4.5 seconds to begin a session."

---

## 🚀 LAUNCH SEQUENCE

| Phase | Users | Focus | Success Metric |
|-------|-------|-------|----------------|
| **Alpha** | 1,000 | Core loop: Orb → Session → Mission → Reflection | DAR > 40% |
| **Beta** | 10,000 | Personalization accuracy, orb performance | DAR > 35%, <2% crashes |
| **Gamma** | 100,000 | Content depth, guru variety, community | DAR > 30%, NPS > 50 |
| **Public** | 1M+ | Scale, localization, teacher marketplace | DAR > 25%, 4.8* app store |
| **Global** | 1B | Offline-first, low-bandwidth, accessibility | DAR > 20% globally |

---

## 📝 CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-11-07 | Initial specification — complete UI/UX with ASCII wireframes |

---

## 📎 APPENDICES

### A. Mission Pools (5 per Gate)
See `src/lib/consciousness/dailyMissions.ts:60-180`

### B. Gate Configurations
See `src/lib/consciousness/dailyGates.ts:42-83`

### C. Consciousness Model
See `docs2/05-CONSCIOUSNESS-MODEL.md`

### D. Product Documentation
See `docs2/02-PRODUCT.md`

### E. Session Flow Engines
See `docs/SESSION_FLOW_ENGINES_COMPREHENSIVE.md`

---

*This specification is the single source of truth for HomeV3 implementation. All design decisions reference the ConsciousOS consciousness model, product philosophy, and technical architecture.*