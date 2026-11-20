# ConsciousOS: Level-Based System User Flow Architecture
## Version 1.0 - World-Class UX Design for Consciousness Development
### A Billion-Dollar Founder's Approach to Spiritual Growth Software

---

# EXECUTIVE SUMMARY

The Level-Based System (Curriculum Mode) provides a **structured 21-level journey** from "Sleeper Awakening" to "Full Embodiment." This document defines the optimal user flow across all 7 tabs to minimize cognitive load, maximize engagement, and create genuine transformation.

---

# THE GOLDEN RULE

> **"One Primary Action Per Screen. Everything Else Supports It."**

Every tab has ONE clear purpose. Users should never feel overwhelmed or confused about what to do next.

---

# TAB ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        7-TAB LEVEL-BASED NAVIGATION                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   HOME        TASKS       LEARN       GURU       JOURNAL     JOURNEY    SETTINGS│
│   ────        ─────       ─────       ────       ───────     ───────    ────────│
│   Daily       Do the      Consume     Get        Reflect     See        Adjust  │
│   Command     Work        Wisdom      Guidance   & Process   Progress   System  │
│   Center                                                                         │
│                                                                                  │
│   PURPOSE:    PURPOSE:    PURPOSE:    PURPOSE:   PURPOSE:    PURPOSE:   PURPOSE:│
│   "What's     "Execute    "Learn      "Ask the   "Process    "How far   "Make   │
│   my day?"    tasks"      teachings"  master"    feelings"   have I     it mine"│
│                                                              come?"              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# PART I: HOME TAB - THE DAILY COMMAND CENTER

## 1.1 Core Purpose
**HOME = "What should I do right now?"**

The Home tab is the **decision-making center**. Users land here and instantly know their ONE priority action.

## 1.2 Time-Based UI States

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           HOME: TIME-BASED HIERARCHY                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   MORNING (5am-12pm)                                                             │
│   ├── Primary Action: "Start Morning Session" (if not done)                      │
│   ├── Or: "Continue Today's Lesson" (if morning done)                            │
│   └── Secondary: Day Chain preview, intention setting                            │
│                                                                                  │
│   AFTERNOON (12pm-6pm)                                                           │
│   ├── Primary Action: Current Task OR "Continue Lesson"                          │
│   ├── Midday Presence Ping (subtle, not intrusive)                               │
│   └── Progress indicators for the day                                            │
│                                                                                  │
│   EVENING (6pm-10pm)                                                             │
│   ├── Primary Action: "Evening Reflection" (if 50%+ tasks done)                  │
│   ├── Or: Continue current work if not ready for evening                         │
│   └── Tomorrow glimpse card appears after reflection                             │
│                                                                                  │
│   NIGHT (10pm-5am)                                                               │
│   ├── Primary Action: Night Grounding Mode                                       │
│   ├── Gentle content only, no tasks                                              │
│   └── Sleep preparation support                                                  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 1.3 Component Hierarchy (Top to Bottom)

```yaml
HOME_COMPONENT_STACK:
  1_greeting_header:
    elements: [orb_indicator, greeting, date, status_bar]
    purpose: "Ground the user in time and identity"
    
  2_day_guide:
    elements: [primary_cta, session_status, progress_ring]
    purpose: "ONE CLEAR ACTION - The brain needs exactly one thing to focus on"
    behavior:
      morning_no_session: "Start Morning Session" button (dominant)
      morning_done: "Continue Lesson" button
      afternoon: Current task or lesson
      evening_ready: "Start Evening Reflection" button
      
  3_active_task_card:
    elements: [current_task, timer, quick_complete]
    purpose: "Micro-focus on the immediate next action"
    visibility: Only shows if tasks exist and session is started
    
  4_day_chain_preview:
    elements: [block_list, completed_count, xp_earned]
    purpose: "See the shape of the day at a glance"
    interaction: Tap blocks to navigate, tap "View All" → Tasks tab
    
  5_today_teaching_card:
    elements: [lesson_snippet, pillar_badge, continue_button]
    purpose: "Constant reminder of current lesson focus"
    
  6_quick_actions_grid:
    elements: [practice, guru, journal, journey - 2x2 grid]
    purpose: "Secondary navigation for exploration"
    design: Smaller, less prominent than primary CTAs
```

## 1.4 Cognitive Load Reduction

```
ANTI-PATTERNS TO AVOID:
├── ❌ Showing too many options at once
├── ❌ Equal visual weight for all actions
├── ❌ No clear primary action
├── ❌ Information overload in header
└── ❌ Competing CTAs

PATTERNS TO USE:
├── ✅ One dominant CTA per time context
├── ✅ Progressive disclosure (less → more)
├── ✅ Visual hierarchy through size/color
├── ✅ Time-aware content prioritization
└── ✅ Gentle transitions between states
```

---

# PART II: TASKS TAB - EXECUTION ZONE

## 2.1 Core Purpose
**TASKS = "Do the work."**

This is the **execution space**. Users come here to complete tasks, not to plan or explore.

## 2.2 Simplified Tab Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          TASKS: TWO-TAB SIMPLICITY                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   TAB 1: DAY CHAIN                    TAB 2: ALL TASKS                           │
│   ├── Visual timeline view            ├── List view of all tasks                 │
│   ├── Sequential blocks               ├── Grouped by time segment                │
│   ├── Current block highlighted       ├── Check off as you go                    │
│   └── XP accumulated                  └── Filter/sort options                    │
│                                                                                  │
│   DEFAULT: Day Chain (if chained tasks exist)                                    │
│   DEFAULT: All Tasks (if no chained tasks)                                       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2.3 Stats Row (Always Visible)

```yaml
STATS_ROW:
  layout: "3 equal columns, glass cards"
  stats:
    - icon: Target
      value: "{completed}/{total}"
      label: "Done"
      
    - icon: Zap
      value: "+{xp_today}"
      label: "XP"
      
    - icon: Flame
      value: "{percent}%"
      label: "Progress"
```

## 2.4 Evening Trigger

```
EVENING_REFLECTION_CTA:
  trigger: "completed >= 50% of tasks"
  desktop: Button in header actions
  mobile: Floating button at bottom
  label: "Start Evening Reflection"
  navigates_to: "/app/master?session=evening"
```

---

# PART III: LEARN TAB - KNOWLEDGE ABSORPTION

## 3.1 Core Purpose
**LEARN = "Absorb the teaching."**

The Learn tab is for **deep reading and understanding**. It's a sanctuary for focused learning.

## 3.2 Curriculum Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         LEARN: CURRICULUM NAVIGATION                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   4 MODULES → 4 LESSONS EACH = 16 TOTAL LESSONS                                  │
│                                                                                  │
│   MODULE 1: The Witness (Drishti) ─ AWARENESS PILLAR                             │
│   ├── Lesson 1: Introduction to awareness                                        │
│   ├── Lesson 2: Patterns run your life                                           │
│   ├── Lesson 3: The observer position                                            │
│   └── Lesson 4: Stabilizing awareness                                            │
│                                                                                  │
│   MODULE 2: Deep Inquiry (Vichara) ─ INQUIRY PILLAR                              │
│   ├── Lesson 1: Who is the observer?                                             │
│   ├── Lesson 2: No final answers                                                 │
│   ├── Lesson 3: Unconscious patterns revealed                                    │
│   └── Lesson 4: The choice point                                                 │
│                                                                                  │
│   MODULE 3: Present Living (Sakshi) ─ EMBODIMENT PILLAR                          │
│   ├── Lesson 1: Freedom in the gap                                               │
│   ├── Lesson 2: Taste of liberation                                              │
│   ├── Lesson 3: Resting as awareness                                             │
│   └── Lesson 4: Awareness in adversity                                           │
│                                                                                  │
│   MODULE 4: Integration (Yoga) ─ INTEGRATION PILLAR                              │
│   ├── Lesson 1: Ego softening                                                    │
│   ├── Lesson 2: Non-separation                                                   │
│   ├── Lesson 3: Conscious living                                                 │
│   └── Lesson 4: Full embodiment                                                  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 3.3 Lesson View Hierarchy

```yaml
LESSON_VIEW:
  header:
    - back_button (→ Home)
    - module_label ("Module 1 • Lesson 2 of 4")
    - lesson_title
    - progress_ring (module progress)
    - map_button (opens curriculum navigation sheet)
    
  pillar_badge:
    - icon (Eye, Brain, HelpCircle, X)
    - name + sanskrit
    - reading_progress_bar (for Teaching tab)
    
  tabs:
    teaching:
      - markdown_content (primary teaching)
      - reflection_prompts (end of content)
      
    practice:
      - duration_indicator
      - step_by_step_instructions
      - "Start Practice Timer" button → Practice tab
      
    tasks:
      - task_list with checkboxes
      - reflection input per task
      - task_count indicator in tab label
      
  complete_button:
    - "Complete Lesson & Continue"
    - XP reward indicator (+25 XP)
    - triggers celebration flow
```

## 3.4 Celebration Sequence

```
LESSON_COMPLETE → XP_POPUP → ACHIEVEMENT_BADGE (if module/graduation) → NAVIGATE_HOME
                     │
                     └── Confetti type varies:
                         • lesson → subtle confetti
                         • module → enhanced confetti + module badge
                         • graduation → full celebration + redirect to /graduation
```

---

# PART IV: GURU TAB (MASTER) - AI GUIDANCE

## 4.1 Core Purpose
**GURU = "Ask the master."**

The Guru tab is for **personalized wisdom**. Users come here when stuck, confused, or seeking deeper understanding.

## 4.2 Session Types

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          GURU: SESSION ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   MORNING SESSION (?session=morning)                                             │
│   ├── Triggered from: Home → "Start Morning Session"                             │
│   ├── Purpose: Set intention, assess mood/energy, generate day                   │
│   ├── Output: Creates daily_journey, generates tasks                             │
│   └── Tone: Warm, encouraging, curious                                           │
│                                                                                  │
│   OPEN CHAT (default)                                                            │
│   ├── Triggered from: Direct navigation, Quick Actions                           │
│   ├── Purpose: General guidance, lesson questions, life struggles                │
│   ├── Context-aware: Knows current lesson, level, patterns                       │
│   └── Tone: Adapts to user's V-Level and emotional state                         │
│                                                                                  │
│   EVENING SESSION (?session=evening)                                             │
│   ├── Triggered from: Tasks → "Evening Reflection" OR Home                       │
│   ├── Purpose: Reflect on day, harvest insights, set closure                     │
│   ├── Output: Updates journey status, stores reflections                         │
│   └── Tone: Gentle, reflective, integrating                                      │
│                                                                                  │
│   KNOWLEDGE SESSION (?session=knowledge)                                         │
│   ├── Triggered from: Learn tab questions                                        │
│   ├── Purpose: Deep dive on specific teaching                                    │
│   └── Tone: Teacher mode, Socratic inquiry                                       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 4.3 AI Personality by Phase

```yaml
GURU_TONE_BY_PHASE:
  phase_1_foundation: # Levels 1-15
    style: "Supportive teacher"
    behaviors:
      - "More explanations, less paradox"
      - "Concrete practices emphasized"
      - "Gamification elements acknowledged"
      - "Celebrates small wins genuinely"
      
  phase_2_deep_work: # Levels 16+
    style: "Challenging master"  
    behaviors:
      - "More inquiry, fewer answers"
      - "Challenges assumptions directly"
      - "Points to patterns in real-time"
      - "Holds space for discomfort"
      
  phase_3_integration: # Levels 16-21
    style: "Silent pointer"
    behaviors:
      - "Minimal words, maximum pointing"
      - "Reflects back user's own wisdom"
      - "Paradox and silence as teaching"
```

---

# PART V: JOURNAL TAB - PROCESSING SPACE

## 5.1 Core Purpose
**JOURNAL = "Process and integrate."**

The Journal is for **written reflection**. It's where insights become permanent, where patterns emerge from chaos.

## 5.2 Entry Types

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         JOURNAL: ENTRY ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   FREE WRITING                                                                   │
│   ├── No prompts, pure expression                                                │
│   ├── Word count tracked for XP                                                  │
│   └── AI can suggest tags after save                                             │
│                                                                                  │
│   PROMPTED REFLECTION                                                            │
│   ├── AI-generated prompts based on:                                             │
│   │   • Current lesson content                                                   │
│   │   • Recent patterns detected                                                 │
│   │   • Active loops needing attention                                           │
│   └── Guides user toward specific insights                                       │
│                                                                                  │
│   TASK REFLECTIONS                                                               │
│   ├── Short reflections attached to completed tasks                              │
│   ├── Consolidated into journal entries                                          │
│   └── Links tasks to deeper insights                                             │
│                                                                                  │
│   MOOD TRACKING                                                                  │
│   ├── Optional mood indicator per entry                                          │
│   ├── Creates emotional pattern data                                             │
│   └── Surfaces in analytics                                                      │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 5.3 View Modes

```yaml
JOURNAL_VIEWS:
  list_view: # Default
    - chronological entries
    - quick mood indicators
    - search and filter
    
  calendar_view:
    - monthly overview
    - streak visualization
    - tap date to see entries
    
  insights_view: # AI-powered
    - pattern summaries
    - emotional trends
    - keyword clusters
```

---

# PART VI: JOURNEY TAB - PROGRESS VISUALIZATION

## 6.1 Core Purpose
**JOURNEY = "See how far I've come."**

The Journey tab is for **perspective and motivation**. Users come here to feel progress, not to take action.

## 6.2 Phase-Aware Display

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        JOURNEY: PHASE-BASED CONTENT                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   PHASE 1 (Levels 1-15): FOUNDATION                                              │
│   ├── TAB: Journey Map (21 levels visual)                                        │
│   ├── TAB: Capacities (12 capacity radar)                                        │
│   └── Focus: "Building the witness"                                              │
│                                                                                  │
│   PHASE 2-3 (Levels 16-21): DEEP WORK & INTEGRATION                              │
│   ├── TAB: Journey Map                                                           │
│   ├── TAB: Capacities                                                            │
│   ├── TAB: Loops (constellation + deep work panel)                               │
│   └── Focus: "Dissolving patterns"                                               │
│                                                                                  │
│   PHASE 4 (Post-21): ULTIMATE                                                    │
│   ├── Completely different view: UltimateSpace component                         │
│   ├── No levels, no gamification                                                 │
│   └── Focus: "Being is doing"                                                    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 6.3 Progress Summary Card

```yaml
JOURNEY_HEADER:
  always_visible: true
  elements:
    level_indicator:
      icon: Target
      value: current_level
      label: "Level"
      
    xp_indicator:
      icon: Zap
      value: total_xp
      label: "XP"
      
    streak_indicator:
      icon: Flame
      value: streak_days
      label: "Streak"
      
    capacity_indicator:
      icon: Eye
      value: overall_capacity_percent
      label: "Capacity"
      
  xp_progress_bar:
    - shows progress to next level
    - percentage label
    - animated fill
```

## 6.4 Level Gate System

```
LEVEL_GATE_CARD:
  purpose: "Shows requirements to advance to next level"
  
  requirements_checked:
    - XP threshold met
    - Minimum days at level
    - Practice streak maintained
    - Capacity thresholds met (varies by level)
    
  states:
    all_met: Green "Attempt Level Up" button
    some_missing: Requirements list with ✓/✗ indicators
    just_leveled: Celebration state
```

## 6.5 Capacity Radar

```
CAPACITY_RADAR:
  clusters:
    awareness:
      capacities: [observation, attention, presence]
      color: primary
      
    inquiry:
      capacities: [self_inquiry, pattern_recognition, disidentification]
      color: awareness
      
    embodiment:
      capacities: [body_awareness, emotional_mastery, surrender]
      color: presence
      
    integration:
      capacities: [equanimity, shadow_integration, unification]
      color: ethereal
      
  visualization: Radar chart with 12 axes
  interaction: Hover/tap for capacity details
```

---

# PART VII: SETTINGS TAB - PERSONALIZATION

## 7.1 Core Purpose
**SETTINGS = "Make it mine."**

Settings is for **customization**. Users configure their experience here, then forget about it.

## 7.2 Settings Categories

```yaml
SETTINGS_SECTIONS:
  profile:
    - Display name
    - Avatar (if implemented)
    - Timezone
    
  notifications:
    - Morning reminder time
    - Evening reminder time
    - Push notifications toggle
    - Email notifications toggle
    
  appearance:
    - Theme (light/dark/system)
    - Reduce motion toggle
    - Sound effects toggle
    
  practice:
    - Default practice duration
    - Ambient sounds preference
    - Timer style
    
  data:
    - Export data
    - Clear cache
    - Privacy settings
    
  account:
    - Change email
    - Reset password
    - Delete account
```

---

# PART VIII: CROSS-TAB NAVIGATION FLOWS

## 8.1 Primary User Journeys

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DAILY RHYTHM USER JOURNEY                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   MORNING FLOW                                                                   │
│   Home → "Start Morning Session" → Guru (morning) → Home → Learn                 │
│                                                                                  │
│   MIDDAY FLOW                                                                    │
│   Home → Active Task → Tasks tab → Complete → Home → Presence Ping              │
│                                                                                  │
│   LEARNING FLOW                                                                  │
│   Home → "Continue Lesson" → Learn → Teaching → Practice → Tasks → Complete     │
│                                                                                  │
│   EVENING FLOW                                                                   │
│   Tasks → "Evening Reflection" → Guru (evening) → Home → Journal                │
│                                                                                  │
│   EXPLORATION FLOW                                                               │
│   Any Tab → Quick Actions → Practice/Guru/Journal/Journey → Back to Home        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 8.2 Deep Links & Query Parameters

```yaml
NAVIGATION_PATTERNS:
  guru_with_context:
    - /app/master?session=morning
    - /app/master?session=evening
    - /app/master?session=knowledge
    
  learn_with_lesson:
    - /app/learn (auto-loads current lesson)
    
  tasks_with_focus:
    - /app/tasks (defaults to chained/list based on data)
    
  journey_with_tab:
    - /app/journey (defaults to "map" tab)
```

---

# PART IX: GAMIFICATION INTEGRATION

## 9.1 XP Sources (Level-Based)

```
XP_REWARD_STRUCTURE:
  lesson_completion: +25 XP base
  module_completion: +100 XP bonus
  curriculum_graduation: +500 XP bonus
  
  task_completion: +5-25 XP (varies by task)
  practice_completion: +10-50 XP (by duration)
  journal_entry: +5-20 XP (by word count)
  
  morning_session: +15 XP
  evening_reflection: +20 XP
  streak_bonus: +5 XP per day maintained
```

## 9.2 Level Progression

```
LEVEL_THRESHOLDS:
  1: 0 XP      "Sleeper Awakening"
  2: 500 XP    "Pattern Glimpser"
  3: 1250 XP   "Curiosity Rising"
  ...
  21: 239750 XP "Full Embodiment"
  
PHASE_MAPPING:
  Phase 1 (Foundation): Levels 1-15
  Phase 2 (Deep Work): Level 16+
  Phase 3 (Integration): Levels 16-21
  Phase 4 (Ultimate): Post-21
```

## 9.3 Gamification Visibility Rules

```yaml
GAMIFICATION_VISIBILITY:
  phase_1: # Levels 1-15
    show_xp: true
    show_level: true
    show_streak: true
    show_achievements: true
    
  phase_2_3: # Levels 16-21
    show_xp: true (but de-emphasized)
    show_level: true
    show_streak: true
    show_achievements: subtle
    
  phase_4: # Post-21
    show_xp: false
    show_level: false
    show_streak: optional
    show_achievements: integrated
```

---

# PART X: MOBILE-FIRST DESIGN PRINCIPLES

## 10.1 Touch Targets

```
TOUCH_TARGET_MINIMUMS:
  buttons: 44px x 44px minimum
  list_items: 48px height minimum
  spacing: 8px between touch targets
```

## 10.2 Navigation Bar

```
BOTTOM_NAV:
  items: 7 (Home, Tasks, Learn, Guru, Journal, Journey, Settings)
  icons: Use lucide-react icons consistently
  labels: Always visible (not icon-only)
  active_state: Gradient highlight + icon fill
```

## 10.3 Gesture Support

```
GESTURES:
  swipe_left_right: Navigate between tabs (optional)
  pull_to_refresh: Refresh data on list views
  long_press: Reveal additional options (where applicable)
```

---

# PART XI: PERFORMANCE CONSIDERATIONS

## 11.1 Loading States

```yaml
LOADING_PATTERNS:
  initial_load:
    - Show SolarOrb animation
    - "Awakening consciousness..." text
    - Skeleton screens for content areas
    
  tab_transitions:
    - Instant navigation (no blocking)
    - Lazy load tab content
    - Cache recently visited tabs
    
  action_feedback:
    - Immediate visual feedback on tap
    - Optimistic UI updates
    - Error recovery with retry
```

## 11.2 Data Fetching Strategy

```
FETCH_STRATEGY:
  home:
    - Profile, journey, curriculum progress on mount
    - Parallel fetches for efficiency
    
  tasks:
    - Fetch tasks when journey.id available
    - Real-time updates for task completion
    
  learn:
    - Fetch module lessons on module change
    - Cache lesson content
    
  journey:
    - Capacities, loops fetched on mount
    - Gate status checked for level-up
```

---

# PART XII: SUCCESS METRICS

## 12.1 Engagement KPIs

```
USER_SUCCESS_METRICS:
  daily_active_rate: "% of users completing morning session"
  lesson_completion_rate: "% of started lessons completed"
  streak_retention: "Average streak length"
  level_progression: "Average days per level"
  evening_reflection_rate: "% completing evening sessions"
```

## 12.2 UX Quality Metrics

```
UX_METRICS:
  time_to_action: "Seconds from Home load to first action"
  navigation_efficiency: "Average taps to complete core flow"
  error_rate: "Failed actions per session"
  session_duration: "Minutes spent per day"
```

---

# APPENDIX A: COMPONENT CHECKLIST

```
HOME_COMPONENTS:
  ✓ StatusBar
  ✓ DayGuide (orchestrator)
  ✓ DayChainPreview
  ✓ ActiveTaskCard
  ✓ TodayTeachingCard
  ✓ PresencePingCard
  ✓ IntentionSetter
  ✓ NightModeCard
  ✓ TomorrowGlimpseCard
  ✓ TransformationTracker (Phase 2+)
  ✓ QuickActionCard (2x2 grid)
  ✓ SolarOrb (loading/identity)

TASKS_COMPONENTS:
  ✓ ChainedTab
  ✓ TaskListTab
  ✓ TimeSegmentSection
  ✓ StatCard (3x grid)

LEARN_COMPONENTS:
  ✓ ModuleProgressRing
  ✓ LessonNavigationMap
  ✓ ReadingProgressBar
  ✓ TaskCheckbox
  ✓ Confetti/XPPopup/AchievementBadge

JOURNEY_COMPONENTS:
  ✓ JourneyMap
  ✓ CapacityRadar
  ✓ LoopConstellation (Phase 2+)
  ✓ DeepWorkPanel (Phase 2+)
  ✓ LevelGateCard
  ✓ UltimateSpace (Phase 4)
```

---

# APPENDIX B: ERROR STATES

```yaml
ERROR_HANDLING:
  no_journey:
    message: "No journey found for today"
    action: "Create journey automatically"
    
  no_curriculum:
    message: "Curriculum not initialized"
    action: "Initialize on first Learn visit"
    
  network_error:
    message: "Connection lost"
    action: "Show retry button, queue offline actions"
    
  auth_expired:
    message: "Session expired"
    action: "Redirect to /auth with return URL"
```

---

# VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-20 | Initial level-based user flow architecture |

---

*This document serves as the definitive guide for level-based user flow. All implementation decisions should reference this architecture.*
