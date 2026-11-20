# ConsciousOS: Adaptive System User Flow Architecture
## Version 1.0 - World-Class UX Design for Consciousness Development
### A Billion-Dollar Founder's Approach to Personalized Awakening

---

# EXECUTIVE SUMMARY

The **Adaptive System** is a radically personalized consciousness development experience. Unlike the structured 21-level curriculum, Adaptive mode generates **unique daily packages** based on the user's:
- Current V-Level (invisible vertical development)
- H-Levels (12 horizontal capacities)
- 9 Life Domains (where patterns show up)
- 7 Active Loops (unconscious patterns)
- Real-time emotional/energy state

This document defines the optimal user flow across all 7 tabs for Adaptive users.

---

# THE GOLDEN RULE

> **"The App Adapts to You, Not You to the App."**

Every screen responds to the user's current state. No two days look the same.

---

# TAB ARCHITECTURE FOR ADAPTIVE MODE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      7-TAB ADAPTIVE MODE NAVIGATION                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   HOME        TASKS       EXPLORE     GURU       JOURNAL     JOURNEY    SETTINGS│
│   ────        ─────       ───────     ────       ───────     ───────    ────────│
│   Daily       Execute     Discover    Dialogue   Integrate   See        Configure│
│   Package     Blocks      Wisdom      with AI    Insights    Growth     System   │
│                                                                                  │
│   PURPOSE:    PURPOSE:    PURPOSE:    PURPOSE:   PURPOSE:    PURPOSE:   PURPOSE:│
│   "What's     "Do the     "Explore    "Ask       "Process    "Capacities "Make   │
│   alive       blocks"     traditions" anything"  & reflect"  & domains"  it mine"│
│   today?"                                                                        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**KEY DIFFERENCE:** Adaptive uses "Explore" tab instead of "Learn" tab.

---

# PART I: HOME TAB - THE ADAPTIVE COMMAND CENTER

## 1.1 Core Purpose
**HOME = "What's alive for me today?"**

Home is the **AI-generated daily experience**. Users receive a personalized "Day Package" based on their morning check-in.

## 1.2 The Adaptive Day Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ADAPTIVE DAY LIFECYCLE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   STATE 1: PRE-CHECK-IN                                                          │
│   ├── Shows: "Start Your Adaptive Day" card                                      │
│   ├── V-Level indicator (subtle)                                                 │
│   ├── Primary loop hint (if detected)                                            │
│   └── CTA: "Begin Morning Check-In"                                              │
│                                                                                  │
│   STATE 2: CHECK-IN MODAL (4 steps)                                              │
│   ├── Step 1: Mood (Great / Okay / Low)                                          │
│   ├── Step 2: Energy (1-3 scale)                                                 │
│   ├── Step 3: Time Available (15/30/60+ min)                                     │
│   ├── Step 4: Intention (free text + suggestions)                                │
│   └── Output: Generates personalized Day Package                                 │
│                                                                                  │
│   STATE 3: DAY PACKAGE ACTIVE                                                    │
│   ├── Today's Theme card                                                         │
│   ├── Day Package Blocks (practice, learn, reflect, etc.)                        │
│   ├── Primary Loop Focus (if active)                                             │
│   ├── Life Domains Grid (compact)                                                │
│   └── Progress indicator                                                         │
│                                                                                  │
│   STATE 4: AFTERNOON PING                                                        │
│   ├── Midday presence reminder                                                   │
│   ├── Quick 3-breath pause                                                       │
│   └── Energy/mood recalibration                                                  │
│                                                                                  │
│   STATE 5: EVENING PROMPT                                                        │
│   ├── "Complete your day's journey"                                              │
│   └── CTA: "Begin Evening Reflection" → Journal                                  │
│                                                                                  │
│   STATE 6: DAY COMPLETE                                                          │
│   ├── Tomorrow Glimpse card                                                      │
│   └── Summary of capacity changes                                                │
│                                                                                  │
│   STATE 7: NIGHT MODE (10pm-5am)                                                 │
│   ├── Grounding card only                                                        │
│   └── "Rest well. Tomorrow awaits."                                              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 1.3 Home Component Hierarchy (Adaptive)

```yaml
HOME_COMPONENT_STACK_ADAPTIVE:
  1_greeting_header:
    elements: [solar_orb, greeting, date, status_bar]
    purpose: "Ground user in present moment"
    
  2_adaptive_home_section:
    states:
      not_checked_in:
        - "Start Your Adaptive Day" card (hero)
        - V-Level badge (subtle)
        - Primary loop hint
        - "Begin Morning Check-In" button
        
      checked_in:
        - Today's Theme card with progress
        - Day Package Blocks (scrollable list)
        - Primary Loop Focus (if active)
        - Life Domains Grid (compact 3x3)
        
      afternoon:
        - Afternoon Ping card (if not dismissed)
        - Continue Day Package
        
      evening:
        - Evening Prompt card (if 50%+ complete)
        - Day Package with completion states
        
      completed:
        - Tomorrow Glimpse card
        - Day summary
        
      night:
        - Night Mode card only
        - "Rest well" message
        
  3_quick_actions:
    elements: [practice, guru, journal, journey - 2x2 grid]
    purpose: "Secondary navigation for exploration"
    always_visible: true
```

## 1.4 Morning Check-In UX

```
CHECK_IN_MODAL_DESIGN:
  modal_type: "Bottom sheet (mobile) / Centered dialog (desktop)"
  
  step_1_mood:
    question: "How are you feeling?"
    options:
      - Great (Smile icon, green)
      - Okay (Meh icon, yellow)
      - Low (Frown icon, gray)
    selection: Single choice, tap to select
    
  step_2_energy:
    question: "Energy level today?"
    options:
      - Low: "Need gentle guidance" (BatteryLow icon)
      - Medium: "Ready for balanced day" (Battery icon)
      - High: "Ready for challenges" (BatteryFull icon)
    selection: Single choice, vertical list
    
  step_3_time:
    question: "Time for practice today?"
    options:
      - 15 min: "Quick check-in"
      - 30 min: "Standard session"
      - 60+ min: "Deep work day"
    selection: Single choice, 3-column grid
    
  step_4_intention:
    question: "Set your intention"
    subtext: "What quality do you want to bring to today?"
    input: Textarea with placeholder "Today I intend to..."
    quick_suggestions: ["Be present", "Stay calm", "Notice patterns", "Practice patience"]
    
  progress_indicator: Animated dots (4 steps)
  navigation: Back button + Continue/Generate button
  skip_option: "Skip for now" (first step only)
```

## 1.5 Day Package Blocks

```yaml
DAY_PACKAGE_BLOCK_TYPES:
  practice:
    icon: Play
    color: primary
    navigates_to: /app/practice
    duration: varies
    
  learn:
    icon: BookOpen
    color: awareness
    navigates_to: /app/explore
    duration: varies
    
  reflect:
    icon: PenTool
    color: ethereal
    navigates_to: /app/journal
    duration: varies
    
  inquiry:
    icon: HelpCircle
    color: warning
    navigates_to: /app/master
    duration: varies
    
  embodiment:
    icon: Waves
    color: presence
    navigates_to: /app/practice
    duration: varies
    
  shadow_work:
    icon: Moon
    color: muted
    navigates_to: /app/master?session=shadow
    duration: varies

BLOCK_STATES:
  pending: Gray outline, "Start" button
  active: Primary border, pulsing indicator
  completed: Green checkmark, strikethrough title
  skipped: Muted, "Skipped" label
```

---

# PART II: TASKS TAB - BLOCK EXECUTION

## 2.1 Core Purpose
**TASKS = "Execute the day package blocks."**

In Adaptive mode, Tasks shows the **Day Package Blocks** in an actionable format.

## 2.2 Adaptive Tasks vs Level-Based Tasks

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    ADAPTIVE TASKS DIFFERENCES                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   LEVEL-BASED:                          ADAPTIVE:                                │
│   ├── Fixed curriculum tasks            ├── AI-generated daily blocks            │
│   ├── Day Chain (chained sequence)      ├── Day Package (flexible blocks)        │
│   ├── Time segments (morning/afternoon) ├── Energy-calibrated ordering           │
│   └── XP-focused completion             └── Capacity-growth focused              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2.3 Tasks Tab Structure (Adaptive)

```yaml
ADAPTIVE_TASKS_LAYOUT:
  header:
    title: "Today's Blocks"
    subtitle: date_string
    stats_row:
      - completed/total blocks
      - capacity_points_earned
      - progress_percent
      
  main_content:
    view_type: "Vertical block list"
    block_card_elements:
      - icon (by type)
      - title
      - duration
      - description
      - status indicator
      - action_button (Start / Complete / Skipped)
      
  empty_state:
    if_no_checkin: "Complete your morning check-in to receive today's blocks"
    cta: "Go to Home"
    
  evening_cta:
    trigger: "50%+ blocks completed"
    button: "Start Evening Reflection"
    navigates_to: /app/journal?mode=evening
```

---

# PART III: EXPLORE TAB - WISDOM DISCOVERY

## 3.1 Core Purpose
**EXPLORE = "Discover wisdom across traditions."**

The Explore tab replaces "Learn" for Adaptive users. Instead of a linear curriculum, users explore wisdom from various traditions.

## 3.2 Explore Tab Layout

```yaml
EXPLORE_LAYOUT:
  header:
    title: "Wisdom Explorer"
    subtitle: "Discover traditions & teachings"
    icon: Compass
    
  sections:
    1_daily_wisdom:
      type: "Hero card (GlassCard variant=glow)"
      content:
        - Quote icon badge
        - "Daily Wisdom" label
        - Wisdom title
        - Wisdom content
        - Author + tradition attribution
        
    2_wisdom_traditions:
      type: "2-column grid"
      traditions:
        - Vedanta / Advaita Vedanta
        - Buddhism
        - Taoism
        - Stoicism
        - Sufism
        - Zen
        - Yoga
        - Christian Mysticism
      card_elements:
        - Tradition icon
        - Name
        - Origin
        - Description (2-line clamp)
      interaction: Tap → /app/master?context=tradition&tradition={name}
      
    3_ask_guru_cta:
      type: "CTA card"
      title: "Ask Your Guru"
      description: "Have questions about any tradition or teaching?"
      button: "Start Conversation" → /app/master?session=guidance
```

## 3.3 Tradition Deep Dive Flow

```
USER TAPS TRADITION CARD
         │
         ▼
NAVIGATES TO: /app/master?context=tradition&tradition=Buddhism
         │
         ▼
GURU OPENS WITH: "You're exploring Buddhism. What aspect interests you?"
         │
         ▼
USER CAN:
├── Ask about core teachings
├── Request practices from this tradition
├── Explore connections to their loops
└── Integrate with current V-Level work
```

---

# PART IV: GURU TAB - AI COMPANION

## 4.1 Core Purpose
**GURU = "Dialogue with your awakening companion."**

In Adaptive mode, the Guru is more **conversational and exploratory** than in Level-based mode.

## 4.2 Adaptive Guru Differences

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     GURU BEHAVIOR: ADAPTIVE MODE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   CONTEXT AWARENESS:                                                             │
│   ├── Knows current V-Level (invisible to user)                                  │
│   ├── Knows active loops and their intensity                                     │
│   ├── Knows today's Day Package theme                                            │
│   ├── Knows capacity strengths/weaknesses                                        │
│   ├── Knows which life domains are active                                        │
│   └── Adapts tone based on all above                                             │
│                                                                                  │
│   TONE BY V-LEVEL:                                                               │
│   ├── V1 (Sleeper): Gentle, validating, uses concrete examples                   │
│   ├── V2 (Observer): Encouraging observation, pattern pointing                   │
│   ├── V3 (Inquirer): More Socratic, question-heavy                               │
│   ├── V4 (Interrupter): Direct, challenges automatic responses                   │
│   ├── V5 (Witness): Spacious, points to awareness itself                         │
│   ├── V6 (Dissolving): Minimal words, maximum silence                            │
│   └── V7 (Awakened): Reflects user's own wisdom back                             │
│                                                                                  │
│   SESSION TYPES:                                                                 │
│   ├── ?session=morning → Morning check-in guidance                               │
│   ├── ?session=evening → Evening reflection facilitation                         │
│   ├── ?session=shadow → Shadow work session (deep loop work)                     │
│   ├── ?session=guidance → Open exploration                                       │
│   ├── ?context=tradition&tradition=X → Tradition deep dive                       │
│   └── (default) → General adaptive chat                                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 4.3 Guru Memory System

```yaml
GURU_MEMORY_LAYERS:
  session_memory:
    scope: "Current conversation"
    contains: "All messages in this session"
    
  short_term_memory:
    scope: "Last 7 days"
    contains:
      - Recent insights
      - Patterns mentioned
      - Emotional states
      - Practice completions
      
  long_term_memory:
    scope: "All time"
    contains:
      - Core beliefs identified
      - Loop origins discovered
      - Breakthrough moments
      - Recurring themes
      
  pattern_memory:
    scope: "Derived insights"
    contains:
      - Detected loops
      - Capacity trends
      - Domain patterns
      - Transformation arcs
```

## 4.4 Shadow Work Sessions

```
SHADOW_WORK_FLOW:
  entry: User clicks "Work On It" from Loop card OR navigates manually
  
  session_structure:
    1_acknowledgment:
      - Guru acknowledges the loop type
      - Validates the user's experience
      
    2_inquiry:
      - "When do you notice this pattern most?"
      - "What's the earliest memory of this feeling?"
      - "What are you afraid would happen if you let it go?"
      
    3_embodiment:
      - "Where do you feel this in your body?"
      - "What does that sensation want?"
      
    4_integration:
      - "What would you say to your younger self?"
      - "How might you hold this differently?"
      
    5_closing:
      - Capacity marker detection
      - Loop intensity adjustment
      - Integration task suggestion
```

---

# PART V: JOURNAL TAB - INTEGRATION SPACE

## 5.1 Core Purpose
**JOURNAL = "Integrate insights through writing."**

The Journal is where **patterns become conscious** through reflection.

## 5.2 Adaptive Journal Features

```yaml
JOURNAL_ADAPTIVE_FEATURES:
  entry_types:
    free_write:
      - No prompts, pure expression
      - AI analyzes for patterns after save
      
    prompted_reflection:
      - AI generates prompts based on:
        - Today's Day Package theme
        - Active loops
        - Recent Guru conversations
        - Capacity growth areas
        
    evening_reflection:
      - Structured end-of-day review
      - Links to Day Package completion
      - Capacity change summary
      - Tomorrow preparation
      
    loop_journal:
      - Specific prompt for loop work
      - Tracks intensity changes
      - Links to shadow work sessions

  ai_analysis:
    after_save:
      - Pattern detection
      - Capacity marker extraction
      - Loop indicator scanning
      - Suggested tags
      
  integration_prompts:
    examples:
      - "What pattern did you notice today that you hadn't seen before?"
      - "How did your {primary_loop} show up today?"
      - "What capacity felt strongest today? What was weakest?"
      - "What would you tell yourself at the start of today?"
```

## 5.3 Evening Reflection Flow

```
EVENING_REFLECTION_STRUCTURE:
  trigger: User navigates to /app/journal?mode=evening
  
  steps:
    1_day_review:
      - "How was your day?" (mood selection)
      - "Which blocks did you complete?" (auto-populated)
      
    2_capacity_check:
      - "Rate your attention today (1-10)"
      - "Rate your presence today (1-10)"
      - (Varies based on Day Package focus)
      
    3_loop_review:
      - "Did your {primary_loop} show up today?"
      - "How intense was it? (1-5)"
      
    4_gratitude:
      - "What are you grateful for today?"
      
    5_tomorrow_intention:
      - "What would you like to bring to tomorrow?"
      
  output:
    - Updates adaptive_day with evening_reflection
    - Adjusts capacity scores
    - Updates loop intensity
    - Triggers Tomorrow Glimpse generation
```

---

# PART VI: JOURNEY TAB - GROWTH VISUALIZATION

## 6.1 Core Purpose
**JOURNEY = "See your capacities and domains."**

In Adaptive mode, Journey focuses on **H-Levels (Capacities)** and **Life Domains** rather than level progression.

## 6.2 Journey Tab Structure (Adaptive)

```yaml
JOURNEY_ADAPTIVE_LAYOUT:
  header:
    title: "Your Journey"
    subtitle: "Capacities & domains growing through awareness"
    # NO level indicator (de-emphasized in adaptive)
    
  tabs:
    capacities: # Default tab
      content: Capacity Radar (12 capacities)
      clusters:
        - Awareness (observation, attention, presence)
        - Inquiry (self_inquiry, pattern_recognition, disidentification)
        - Embodiment (body_awareness, emotional_mastery, surrender)
        - Integration (equanimity, shadow_integration, unification)
      interaction: Tap capacity for detail + growth history
      
    domains:
      content: Life Domains Grid (9 domains)
      domains:
        - Work & Career
        - Money & Finance
        - Health & Body
        - Intimate Relationship
        - Family
        - Social & Friends
        - Purpose & Meaning
        - Creativity & Play
        - Learning & Growth
      indicators:
        - Status (thriving/stable/struggling/crisis)
        - Last worked date
        - Patterns identified count
        - Breakthroughs count
      interaction: Tap domain for detail + pattern list
      
    loops:
      content: Loop Constellation + Deep Work Panel
      loop_types:
        - Origin Loop (family conditioning)
        - Worth Loop (shame core)
        - Safety Loop (survival patterns)
        - Power Loop (control dynamics)
        - Connection Loop (relationship patterns)
        - Identity Loop (work/money/role)
        - Shadow Loop (rejected self)
      states: [dormant, active, acknowledged, integrated]
      interaction: Tap loop → Shadow Work option
      
  v_level_indicator:
    visibility: "Very subtle, bottom of screen"
    shows: "{V-Level Name} · {Sublevel Name}"
    purpose: "Curious users can see it, but not prominent"
```

## 6.3 Capacity Radar Interaction

```
CAPACITY_RADAR_UX:
  display: 12-axis radar chart
  
  clusters_color_coded:
    awareness: primary (golden)
    inquiry: awareness (purple)
    embodiment: presence (teal)
    integration: ethereal (blue)
    
  interaction:
    tap_capacity: Opens bottom sheet with:
      - Capacity name + description
      - Current level (1-10)
      - Growth trend (last 30 days)
      - Related practices
      - "Do Practice" CTA
      
  animation:
    on_mount: Radar fills in from center
    on_change: Smooth interpolation to new values
```

## 6.4 Life Domains Grid

```yaml
LIFE_DOMAINS_GRID:
  layout: "3x3 grid"
  
  domain_card:
    elements:
      - Domain icon
      - Domain name
      - Status indicator (color dot)
      - Mini progress bar (patterns/breakthroughs)
      
  status_colors:
    thriving: green (success)
    stable: blue (primary)
    struggling: yellow (warning)
    crisis: red (destructive)
    
  interaction:
    tap_domain: Opens detail panel with:
      - Domain description
      - Current status + history
      - Identified patterns list
      - Breakthroughs list
      - Related loops
      - "Work on Domain" → Guru session
```

---

# PART VII: SETTINGS TAB - CONFIGURATION

## 7.1 Core Purpose
**SETTINGS = "Configure my adaptive experience."**

Settings for Adaptive users include additional options for the AI system.

## 7.2 Adaptive-Specific Settings

```yaml
ADAPTIVE_SETTINGS:
  standard_settings:
    - Profile (name, avatar)
    - Notifications
    - Appearance (theme)
    - Sounds
    - Data & Privacy
    
  adaptive_specific:
    ai_preferences:
      guru_tone:
        options: ["Gentle", "Balanced", "Direct"]
        description: "How should your Guru communicate?"
        
      check_in_time:
        type: "Time picker"
        description: "Preferred morning check-in reminder"
        
      afternoon_ping:
        type: "Toggle + time"
        description: "Enable midday presence reminder"
        
      evening_reminder:
        type: "Time picker"
        description: "Reminder for evening reflection"
        
    day_package_preferences:
      default_time:
        options: [15, 30, 60]
        description: "Default time available for practice"
        
      practice_types:
        type: "Multi-select"
        options: ["Meditation", "Breathwork", "Movement", "Journaling", "Inquiry"]
        description: "Preferred practice types"
        
      tradition_preferences:
        type: "Multi-select (from traditions)"
        description: "Wisdom traditions to emphasize"
        
    loop_settings:
      active_loops:
        type: "View only"
        description: "Currently tracked loops"
        action: "Manage loops" → Journey tab
        
    data_export:
      options:
        - Export journal entries
        - Export capacity history
        - Export loop progress
```

---

# PART VIII: CROSS-TAB NAVIGATION FLOWS

## 8.1 Primary User Journeys (Adaptive)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ADAPTIVE DAILY RHYTHM JOURNEY                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   MORNING FLOW                                                                   │
│   Home → "Begin Morning Check-In" → 4-step modal → Day Package generated        │
│                                                                                  │
│   EXECUTION FLOW                                                                 │
│   Home → Tap Block → Practice/Explore/Journal/Guru → Complete → Return Home     │
│                                                                                  │
│   EXPLORATION FLOW                                                               │
│   Home → Quick Actions → Explore → Tradition → Guru (context) → Home            │
│                                                                                  │
│   LOOP WORK FLOW                                                                 │
│   Home → Loop Card → "Work On It" → Guru (shadow session) → Journal → Home      │
│                                                                                  │
│   EVENING FLOW                                                                   │
│   Home → Evening Prompt → Journal (evening mode) → Tomorrow Glimpse → Home      │
│                                                                                  │
│   CAPACITY CHECK FLOW                                                            │
│   Home → Quick Actions → Journey → Capacities tab → Tap capacity → Practice     │
│                                                                                  │
│   DOMAIN WORK FLOW                                                               │
│   Home → Life Domains Grid → Tap domain → Journey (domains tab) → Guru session  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 8.2 Deep Links & Query Parameters

```yaml
ADAPTIVE_NAVIGATION_PATTERNS:
  home:
    - /app (default adaptive home)
    
  tasks:
    - /app/tasks (Day Package blocks view)
    
  explore:
    - /app/explore (wisdom traditions)
    
  guru:
    - /app/master (open chat)
    - /app/master?session=morning
    - /app/master?session=evening
    - /app/master?session=shadow
    - /app/master?session=guidance
    - /app/master?context=tradition&tradition={name}
    - /app/master?context=loop&loop={type}
    - /app/master?context=domain&domain={key}
    
  journal:
    - /app/journal (entry list)
    - /app/journal?mode=evening (evening reflection)
    - /app/journal?prompt={type} (prompted entry)
    
  journey:
    - /app/journey (default: capacities)
    - /app/journey?tab=capacities
    - /app/journey?tab=domains
    - /app/journey?tab=loops
    - /app/journey?domain={key} (opens domain detail)
```

---

# PART IX: V-LEVEL SYSTEM (INVISIBLE BACKBONE)

## 9.1 V-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         V-LEVEL SYSTEM (7 × 3 = 21 sublevels)                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   V1: SLEEPER                                                                    │
│   ├── 1.1 Introduction: "Something feels off about my life"                      │
│   ├── 1.2 Practice: Learning to notice patterns                                  │
│   └── 1.3 Integration: Patterns run my life                                      │
│                                                                                  │
│   V2: OBSERVER                                                                   │
│   ├── 2.1 Introduction: "I can step back and watch"                              │
│   ├── 2.2 Practice: Stabilizing the observer position                            │
│   └── 2.3 Integration: "The observer persists"                                   │
│                                                                                  │
│   V3: INQUIRER                                                                   │
│   ├── 3.1 Introduction: "The 'I' can be investigated"                            │
│   ├── 3.2 Practice: Deep questioning practice                                    │
│   └── 3.3 Integration: "Every answer reveals another question"                   │
│                                                                                  │
│   V4: INTERRUPTER                                                                │
│   ├── 4.1 Introduction: "There is a gap before reaction"                         │
│   ├── 4.2 Practice: Working with the choice point                                │
│   └── 4.3 Integration: "I can choose my response"                                │
│                                                                                  │
│   V5: WITNESS                                                                    │
│   ├── 5.1 Introduction: "Awareness is becoming my home"                          │
│   ├── 5.2 Practice: Resting as awareness                                         │
│   └── 5.3 Integration: "Even difficult states are witnessed"                     │
│                                                                                  │
│   V6: DISSOLVING                                                                 │
│   ├── 6.1 Introduction: "The separate self is a construction"                    │
│   ├── 6.2 Practice: Boundaries dissolving                                        │
│   └── 6.3 Integration: "There's less and less here"                              │
│                                                                                  │
│   V7: AWAKENED                                                                   │
│   ├── 7.1 Introduction: "Presence permeates action"                              │
│   ├── 7.2 Practice: Effortless action                                            │
│   └── 7.3 Integration: "This is it. Always has been."                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 9.2 V-Level Detection (Invisible)

```yaml
V_LEVEL_DETECTION:
  triggers:
    - Journal entry analysis
    - Guru conversation analysis
    - Task reflection analysis
    - Evening reflection responses
    
  markers_detected:
    progression_markers:
      - "I noticed a pattern" → V1 → V2
      - "I caught myself before reacting" → V3 → V4
      - "I watched it without getting involved" → V4 → V5
      
    regression_markers:
      - Extended reactivity
      - Spiritual bypassing detected
      - Crisis events
      
  progression_rules:
    - Minimum 7 days at sublevel
    - 3+ markers detected
    - No regression markers in last 48h
    
  user_visibility:
    - V-Level shown subtly in settings
    - Never displayed prominently
    - User doesn't "grind" for levels
```

---

# PART X: H-LEVEL SYSTEM (12 CAPACITIES)

## 10.1 Capacity Definitions

```yaml
CAPACITY_CLUSTERS:
  awareness:
    observation:
      description: "Ability to notice without reacting"
      grows_from: "Meditation, body scanning, pattern noticing"
      
    attention:
      description: "Ability to sustain focused awareness"
      grows_from: "Concentration practices, single-pointed focus"
      
    presence:
      description: "Ability to remain in the present moment"
      grows_from: "Grounding, sensory awareness, being practices"
      
  inquiry:
    self_inquiry:
      description: "Ability to investigate the nature of 'I'"
      grows_from: "Who am I questions, assumption challenging"
      
    pattern_recognition:
      description: "Ability to see recurring loops"
      grows_from: "Journaling, reflection, guru dialogue"
      
    disidentification:
      description: "Ability to separate self from thoughts/emotions"
      grows_from: "Labeling, witnessing, stepping back"
      
  embodiment:
    body_awareness:
      description: "Ability to feel sensations clearly"
      grows_from: "Body scan, movement, somatic practices"
      
    emotional_mastery:
      description: "Ability to feel without being overwhelmed"
      grows_from: "Emotion tracking, feeling fully, release"
      
    surrender:
      description: "Ability to let go of control"
      grows_from: "Acceptance practices, flow states, trust"
      
  integration:
    equanimity:
      description: "Ability to remain balanced in all states"
      grows_from: "Non-reactive awareness, accepting duality"
      
    shadow_integration:
      description: "Ability to embrace rejected parts"
      grows_from: "Shadow work, loop dissolution, wholeness"
      
    unification:
      description: "Ability to experience non-separation"
      grows_from: "Unity practices, interconnection, oneness"
```

## 10.2 Capacity Growth Mechanics

```
CAPACITY_GROWTH:
  sources:
    practice_completion: +0.1 to +0.3 (by type alignment)
    journal_entry: +0.05 to +0.2 (by content analysis)
    guru_insight: +0.1 to +0.5 (by breakthrough level)
    task_completion: +0.05 (general)
    evening_reflection: +0.1 (related capacities)
    
  decay:
    no_activity_7_days: -0.1 per capacity
    crisis_event: Variable reduction
    
  display:
    scale: 0-10 (stored as float, displayed as int)
    radar: Normalized to 0-100% for visualization
```

---

# PART XI: LOOP SYSTEM (7 CORE LOOPS)

## 11.1 Loop Definitions

```yaml
LOOP_TYPES:
  origin:
    name: "Origin Loop"
    description: "Patterns inherited from family of origin"
    domain_links: [family, intimate_relationship]
    typical_manifestations:
      - "I always do what my parents expected"
      - "I rebel against any authority"
      - "I can't trust anyone close to me"
      
  worth:
    name: "Worth Loop"
    description: "Core shame and worthiness patterns"
    domain_links: [work, purpose_meaning]
    typical_manifestations:
      - "I'm not good enough"
      - "I need to prove myself constantly"
      - "Success will finally make me worthy"
      
  safety:
    name: "Safety Loop"
    description: "Survival and security patterns"
    domain_links: [money, health]
    typical_manifestations:
      - "Something bad is about to happen"
      - "I need to be in control to be safe"
      - "The world is dangerous"
      
  power:
    name: "Power Loop"
    description: "Control and agency patterns"
    domain_links: [work, social]
    typical_manifestations:
      - "I must be in charge"
      - "I'm powerless to change"
      - "Others always have more power"
      
  connection:
    name: "Connection Loop"
    description: "Relationship and intimacy patterns"
    domain_links: [intimate_relationship, social, family]
    typical_manifestations:
      - "I'll be abandoned if I'm truly known"
      - "I need others to feel complete"
      - "Intimacy is dangerous"
      
  identity:
    name: "Identity Loop"
    description: "Self-definition through external markers"
    domain_links: [work, money, purpose_meaning]
    typical_manifestations:
      - "I am my job/role/status"
      - "Without this identity, I'm nothing"
      - "I need others to validate who I am"
      
  shadow:
    name: "Shadow Loop"
    description: "Rejected and disowned parts of self"
    domain_links: [all domains]
    typical_manifestations:
      - "I would never be like that"
      - "I hate people who..."
      - "That part of me is unacceptable"
```

## 11.2 Loop States & Progression

```
LOOP_LIFECYCLE:
  dormant:
    - Loop not yet detected
    - No conscious awareness
    
  detected:
    - AI has identified pattern
    - User may not be aware yet
    
  acknowledged:
    - User has seen and accepted the loop
    - Beginning to work with it
    
  active:
    - Currently in focus for dissolution
    - Shadow work sessions engaged
    
  integrating:
    - Pattern dissolving through awareness
    - Capacity growing in related areas
    
  integrated:
    - Loop no longer runs unconsciously
    - Pattern transformed into wisdom
```

---

# PART XII: SUCCESS METRICS (ADAPTIVE)

## 12.1 Engagement KPIs

```
ADAPTIVE_SUCCESS_METRICS:
  check_in_completion_rate: "% of days with morning check-in"
  block_completion_rate: "% of Day Package blocks completed"
  evening_reflection_rate: "% completing evening reflections"
  guru_session_frequency: "Average sessions per week"
  journal_frequency: "Entries per week"
  loop_work_engagement: "Shadow sessions per month"
```

## 12.2 Transformation KPIs

```
TRANSFORMATION_METRICS:
  v_level_progression: "Sublevels advanced per month"
  capacity_growth: "Average capacity increase per month"
  loop_integration_rate: "Loops moved to integrated per quarter"
  domain_improvement: "Domains moving from struggling to stable"
  breakthrough_frequency: "Breakthrough moments per month"
```

---

# APPENDIX A: ADAPTIVE COMPONENT CHECKLIST

```
HOME_COMPONENTS:
  ✓ AdaptiveHomeSection (orchestrator)
  ✓ AdaptiveMorningCheckIn (modal)
  ✓ DayPackageBlocks
  ✓ AfternoonPingCard
  ✓ LifeDomainsGrid (compact)
  ✓ LoopWorkCard
  ✓ NightModeCard
  ✓ TomorrowGlimpseCard
  ✓ QuickActionCard (2x2 grid)
  ✓ SolarOrb

JOURNEY_COMPONENTS:
  ✓ CapacityRadar
  ✓ CapacityRadarEnhanced
  ✓ LifeDomainsGrid (full)
  ✓ LoopConstellation
  ✓ DeepWorkPanel
  ✓ ShadowWorkSession

EXPLORE_COMPONENTS:
  ✓ Daily Wisdom Card
  ✓ Tradition Grid
  ✓ Ask Guru CTA
```

---

# APPENDIX B: ERROR STATES (ADAPTIVE)

```yaml
ERROR_HANDLING:
  no_check_in:
    message: "Start your day with a check-in"
    cta: "Begin Morning Check-In"
    
  day_package_failed:
    message: "Couldn't generate your day package"
    cta: "Try Again" / "Use Default Package"
    
  guru_unavailable:
    message: "Your Guru is momentarily unavailable"
    cta: "Retry" / "Journal Instead"
    
  capacity_sync_failed:
    message: "Couldn't sync your progress"
    cta: "Retry Sync"
    
  network_offline:
    message: "You're offline"
    behavior: "Queue actions, sync when online"
```

---

# VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-20 | Initial adaptive system user flow architecture |

---

*This document serves as the definitive guide for Adaptive mode user flow. All implementation decisions should reference this architecture.*
