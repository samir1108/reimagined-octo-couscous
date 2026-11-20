# ConsciousOS AI System Documentation

## The Complete AI Architecture — Models, Memory, Consciousness Engine, and Prompt Systems

---

## Table of Contents

1. [AI Philosophy](#ai-philosophy)
2. [Model Architecture](#model-architecture)
3. [The Guru System](#the-guru-system)
4. [Guide Chat: Deep Dive](#guide-chat)
5. [Consciousness Engine: Deep Dive](#consciousness-engine)
6. [Memory System: Deep Dive](#memory-system)
7. [Journal Analysis System](#journal-analysis)
8. [Three-Lens Analyzer](#three-lens-analyzer)
9. [Predictive Insights](#predictive-insights)
10. [Task Generation and Completion](#task-system)
11. [Theme Generation](#theme-generation)
12. [Enterprise AI Features](#enterprise-ai)
13. [Voice AI (ElevenLabs)](#voice-ai)
14. [Prompt Engineering Guide](#prompt-engineering)
15. [AI Safety and Ethics](#ai-safety)
16. [Credit and Cost Management](#credits)
17. [AI Performance Optimization](#performance)
18. [Future AI Roadmap](#future)

---

## 1. AI Philosophy

### 1.1 The Role of AI in Consciousness Development

ConsciousOS uses AI not as a replacement for human wisdom but as a bridge — making the depth of ancient contemplative traditions accessible to modern seekers through personalized, adaptive guidance.

**Core AI Principles:**

1. **The AI is a mirror, not a guru**: It reflects the user's own patterns and insights back to them. It does not claim to have answers — it helps users discover their own.

2. **Memory creates depth**: Unlike stateless chatbots, the Guru remembers. This accumulated memory enables the kind of deep, longitudinal guidance that was previously only possible through years of relationship with a human teacher.

3. **Adaptive, not prescriptive**: The AI adapts to where the user is, not where it thinks they should be. If a user is in crisis, it provides grounding. If they're in flow, it provides space. If they're avoiding, it gently challenges.

4. **Multi-tradition wisdom synthesis**: The AI draws from multiple contemplative traditions, presenting wisdom in the framework that best serves each individual user's journey.

5. **Designed to decrease dependency**: As users develop their own witness consciousness and inner guidance, the AI's role naturally diminishes. This is success, not failure.

### 1.2 The Consciousness-Aware AI Difference

Standard AI assistants optimize for task completion. ConsciousOS's AI optimizes for consciousness development. This means:

| Standard AI | ConsciousOS AI |
|-------------|---------------|
| Solves problems directly | Helps users see the pattern beneath the problem |
| Provides information | Creates conditions for insight |
| Responds to content | Responds to consciousness level |
| Stateless interactions | Persistent memory across all interactions |
| Generic personality | Adapts communication to user's developmental stage |
| Success = task done | Success = user's awareness expanded |
| Encourages continued use | Encourages growing independence |

---

## 2. Model Architecture

### 2.1 Multi-Model Strategy

ConsciousOS employs different AI models for different purposes, optimizing for quality, speed, and cost:

```
┌─────────────────────────────────────────────────┐
│                  TASK ROUTING                     │
│                                                   │
│  Complex reasoning ──────► GPT-5 / Gemini Pro    │
│  Balanced tasks ─────────► Gemini Flash          │
│  Simple/fast tasks ──────► Gemini Flash Lite     │
│  Voice synthesis ────────► ElevenLabs            │
│  Voice recognition ──────► ElevenLabs Scribe     │
│                                                   │
│  Model selection based on:                        │
│  • Task complexity                                │
│  • Required nuance/empathy                        │
│  • Speed requirements                             │
│  • Cost constraints                               │
└─────────────────────────────────────────────────┘
```

### 2.2 Model Specifications

| Model | Use Cases | Strengths | Limitations |
|-------|-----------|-----------|-------------|
| **GPT-5** | Guide chat, deep analysis | Nuanced understanding, empathetic responses | Slower, more expensive |
| **GPT-5-mini** | General analysis | Good balance of quality/cost | Less nuance than full GPT-5 |
| **GPT-5-nano** | Simple processing | Fast, cost-effective | Limited complex reasoning |
| **Gemini 2.5 Pro** | Three-lens analysis, predictions | Strong reasoning, large context | Slower |
| **Gemini 2.5 Flash** | Engine plans, theme generation | Good speed/quality balance | Less precision on edge cases |
| **Gemini 2.5 Flash Lite** | Task completion, simple tasks | Fastest, cheapest | Weakest on nuance |

### 2.3 ConsciousOS AI Gateway

All AI calls route through the ConsciousOS AI Gateway, which provides:
- **No API keys required**: Users don't need their own AI accounts
- **Automatic model routing**: Based on function requirements
- **Cost tracking**: Per-call token and cost logging
- **Rate limiting**: Prevents abuse
- **Fallback handling**: If one model is unavailable, falls back to alternatives

---

## 3. The Guru System

### 3.1 System Architecture

The Guru is not a single component but a system of interconnected AI services:

```
┌─────────────────────────────────────────────────────────────┐
│                      GURU SYSTEM                              │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Guide Chat  │  │  Consciousness│  │  Memory System   │   │
│  │  (Frontend)  │  │  Engine       │  │                  │   │
│  │              │  │  (Backend)    │  │  • Extraction    │   │
│  │  • Chat UI   │  │              │  │  • Consolidation │   │
│  │  • Voice     │  │  • Day Plans │  │  • Retrieval     │   │
│  │  • Modes     │  │  • Signals   │  │  • Patterns      │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                  │                    │              │
│         └──────────────────┼────────────────────┘              │
│                            │                                   │
│                   ┌────────▼────────┐                          │
│                   │  User Profile   │                          │
│                   │  (Ground Truth) │                          │
│                   └─────────────────┘                          │
└───────────────────────────────────────────────────────────────┘
```

### 3.2 Guide Chat Flow

```
User Input
    │
    ▼
┌─────────────────┐
│ Context Assembly │
│                  │
│ 1. User profile  │
│ 2. Recent memories│
│ 3. Today's plan  │
│ 4. Session history│
│ 5. Current mode  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Prompt Assembly  │
│                  │
│ System + Context │
│ + Mode + Safety  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI Generation    │
│ (GPT-5/Gemini)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Post-Processing  │
│                  │
│ • Save message   │
│ • Extract memory │
│ • Update profile │
│ • Log usage      │
└────────┬────────┘
         │
         ▼
    Response to User
```

### 3.3 Guru Personality

The Guru's personality is carefully crafted through system prompts:

**Voice Characteristics:**
- Warm but not saccharine
- Direct but not harsh
- Wise but not preachy
- Curious but not intrusive
- Patient but not passive
- Challenging but not aggressive

**Communication Adjustments by V-Level:**

| V-Level Range | Communication Style |
|---------------|-------------------|
| 1-3 | Concrete, encouraging, explanatory. Uses metaphors and examples. |
| 4-6 | More nuanced, begins using contemplative language. Asks deeper questions. |
| 7-9 | Spare, poetic, pointing rather than explaining. Uses silence and space. |
| 10-12 | Minimal, koan-like. Often responds with questions or single sentences. |
| 13+ | Nearly silent. Holds space. May respond with "..." or a single word. |

---

## 4. Guide Chat: Deep Dive

### 4.1 Mode-Specific Prompting

Each Guide mode adjusts the system prompt to create a different therapeutic container:

#### General Mode
```
You are the Guru in general guidance mode. The user wants to talk openly.
Follow their lead while gently pointing toward awareness. Ask questions that
invite observation rather than analysis. Be warm, present, and attentive.
```

#### Therapy Mode
```
You are the Guru in therapeutic processing mode. The user is working through
emotional material. Your role is to:
- Create a safe, non-judgmental space
- Help them feel and name emotions
- Connect current emotions to body sensations
- Gently explore patterns without pushing
- Never diagnose or pathologize
- If they mention suicidal thoughts, provide crisis resources
```

#### Shadow Work Mode
```
You are the Guru in shadow work mode. The user is exploring hidden aspects
of themselves. Your role is to:
- Help them identify projections (what triggers them in others)
- Explore the "golden shadow" (unowned positive qualities)
- Work with dreams and symbolic content
- Use the "dialog with the shadow" technique
- Normalize shadow material without encouraging acting out
- Move at the user's pace — never force shadow encounters
```

#### Dream Analysis Mode
```
You are the Guru in dream analysis mode. The user wants to explore a dream.
Your role is to:
- Ask for sensory details (colors, textures, sounds, feelings)
- Explore emotional tone rather than symbolic meaning
- Connect dream themes to waking life patterns
- Draw from Jungian, Yogic, and phenomenological dream traditions
- Avoid rigid symbol dictionaries — each dream is personal
- Note recurring themes across previous dreams (check memory)
```

#### Somatic Mode
```
You are the Guru in somatic awareness mode. The user is working with body
sensations. Your role is to:
- Guide attention to specific body areas
- Help distinguish between physical sensation and emotional overlay
- Use body scan techniques appropriate to their level
- Connect body sensations to psychological patterns
- Draw from yoga, tai chi, and somatic experiencing traditions
- Never diagnose physical symptoms
```

#### Breathwork Mode
```
You are the Guru in breathwork mode. Guide the user through breathing practices:
- Begin with their current breathing pattern observation
- Offer techniques appropriate to their state and level
- Options: box breathing, 4-7-8, alternate nostril, breath of fire
- Always include grounding after intense practices
- Monitor for hyperventilation indicators
```

#### Inquiry Mode
```
You are the Guru in self-inquiry mode. This is the deepest mode.
- Use Ramana Maharshi's "Who am I?" method
- When the user describes an experience, ask "Who is experiencing this?"
- Don't explain — point
- Use silence
- Don't fill space with words when space serves better
- This mode is for V-Level 5+ users typically
```

### 4.2 Context Window Management

The Guide chat manages a rolling context window:

```
System Prompt (fixed, ~500 tokens)
├── Guru identity
├── Mode-specific instructions
├── Safety guidelines
│
User Context (~1500 tokens)
├── Profile summary (V-Level, dimensions, state)
├── Active loops
├── Recent memories (top 5-10 by relevance)
├── Today's plan and theme
│
Conversation History (rolling, ~3000 tokens)
├── Last 10-20 messages
├── Older messages summarized
│
Current Message
├── User's input
└── Any attached context (mood, image, etc.)
```

**Total context budget**: ~5000-6000 tokens per request

### 4.3 Memory Integration

During Guide conversations, the system:

1. **Retrieves** relevant memories before generating a response
2. **References** past conversations naturally ("Last week you mentioned...")
3. **Extracts** new memories after each response
4. **Updates** the consciousness profile based on observed patterns
5. **Logs** AI usage (tokens, cost, model, status)

---

## 5. Consciousness Engine: Deep Dive

### 5.1 Purpose

The Consciousness Engine generates personalized daily plans by analyzing the user's complete consciousness profile. It runs when:
- The user opens the app for the first time that day
- A specific time slot changes (morning → midday → evening)
- Manually triggered by an admin

### 5.2 Input Data Assembly

```typescript
const engineInput = {
  // Identity
  userId: string,
  displayName: string,
  journeyDay: number,
  
  // Consciousness state
  vLevel: {
    current: number,
    baseline: number,
    peak: number,
  },
  overallBand: number,
  dimensionBands: {
    thought: number,
    emotion: number,
    body: number,
    awareness: number,
  },
  
  // Loops
  activeLoops: string[],
  loopAwareness: Record<string, number>,
  loopSeverity: Record<string, number>,
  bypassingRisk: number,
  
  // Witness
  witnessDepth: number,
  witnessStability: number,
  witnessGap: number,
  
  // State
  state: 'normal' | 'dark_night' | 'breakthrough' | 'plateau' | 'regression',
  chittaVritti: 'scattered' | 'flickering' | 'gathering' | 'focused' | 'absorbed',
  journeyPhase: 'foundation' | 'deepening' | 'integration' | 'mastery',
  
  // Engagement
  streakCurrent: number,
  totalSessions: number,
  totalJournalEntries: number,
  
  // Recent context
  recentMemories: Memory[],
  previousPlan: Plan | null,
  previousCompletions: TaskCompletion[],
  
  // Time context
  currentTimeSlot: 'morning' | 'midday' | 'evening' | 'night',
  dayOfWeek: string,
  todaysTheme: Theme | null,
};
```

### 5.3 Engine Prompt

```
You are the ConsciousOS Consciousness Engine. Generate a personalized daily 
plan for this user based on their consciousness profile.

USER PROFILE:
[Full profile data]

RECENT MEMORIES:
[Top 10-20 memories by importance/recency]

GUIDELINES:
- Match task difficulty to the user's current energy and engagement level
- Focus on the dimension that needs most development
- Reference specific patterns from memories when relevant
- If the user is in a "dark_night" state, be gentler and more supportive
- If approaching a breakthrough, provide more challenging practices
- Generate 2-4 tasks, 2-3 journal prompts, 1 presence card, 2-3 evening questions
- Ensure variety — don't repeat yesterday's exact tasks
- Honor the day's theme in all generated content

OUTPUT FORMAT:
{
  "tasks": [...],
  "journalPrompts": [...],
  "presenceCard": {...},
  "eveningReflection": {...},
  "guideContext": {...},
  "suggestions": [...],
  "focusDimension": "emotion|thought|body|awareness",
  "bandIcon": "emoji",
  "band": number,
  "state": "string"
}
```

### 5.4 Plan Validation

After generation, the plan is validated:
- All required fields present
- Task count within bounds (2-6)
- No harmful or inappropriate content
- Dimension targets aligned with profile
- Difficulty appropriate for current state

### 5.5 Caching and Refresh

- Plans are cached per user per date per time slot
- Cached plans are served immediately on subsequent opens
- Plans can be regenerated if the user's state significantly changes
- Plans are stored in `daily_engine_plans` table

---

## 6. Memory System: Deep Dive

### 6.1 Memory Extraction (`memory-extract`)

When a conversation or journal entry occurs, the memory extraction function processes the raw text:

```
Input: Raw conversation text or journal content
│
▼
┌─────────────────────────────┐
│  AI Analysis                 │
│                              │
│  Extract:                    │
│  • Key insights              │
│  • Emotional patterns        │
│  • Loop manifestations       │
│  • Dimension-relevant data   │
│  • Behavioral observations   │
│  • Relationship patterns     │
│  • Body awareness notes      │
│  • Breakthrough indicators   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Memory Records Created      │
│                              │
│  For each extracted insight: │
│  • content: string           │
│  • category: string          │
│  • importance: 1-10          │
│  • emotional_tone: string    │
│  • dimension_relevant: string│
│  • linked_loops: string[]    │
│  • tags: string[]            │
└─────────────────────────────┘
```

**Extraction Prompt:**
```
Analyze the following conversation/journal entry and extract key consciousness 
insights. For each insight, provide:
1. A concise summary (1-2 sentences)
2. Category (pattern, insight, emotion, breakthrough, resistance, dream, body)
3. Importance (1-10, where 10 = life-changing insight, 1 = minor observation)
4. Emotional tone (peaceful, anxious, curious, sad, joyful, angry, neutral)
5. Relevant dimension (thought, emotion, body, awareness, or none)
6. Any loops detected (not_enough, control, approval, avoidance, victim, performance, separation)
7. Tags for searchability

Focus on:
- Recurring patterns the user may not see
- Connections to previous memories
- Shifts in awareness or perspective
- Body sensations correlated with emotions
- Loop manifestations in specific life domains
```

### 6.2 Memory Consolidation (`memory-consolidate`)

Periodically (daily or weekly), episodic memories are consolidated into semantic memories:

```
Episodic Memories (Many individual records)
│
▼
┌─────────────────────────────────┐
│  AI Consolidation               │
│                                  │
│  1. Group related memories       │
│  2. Identify emerging themes     │
│  3. Create higher-level summaries│
│  4. Update pattern records       │
│  5. Mark originals as consolidated│
└──────────────┬──────────────────┘
               │
               ▼
Semantic Memories (Fewer, richer records)
+ Updated Pattern Records
+ Updated User Profile
```

**Consolidation Prompt:**
```
Review these episodic memories from the user's recent sessions. Your task:

1. THEMES: Identify recurring themes across memories
2. PATTERNS: Note any patterns that appear across multiple memories
3. EVOLUTION: Track how the user's understanding has evolved
4. CONNECTIONS: Find connections between seemingly unrelated memories
5. CONSOLIDATE: Create 3-5 semantic memory summaries that capture the 
   essential insights from these episodic memories

For each consolidated memory:
- Provide a rich, synthesized summary
- Rate importance (1-10)
- Note dimensional relevance
- Link to relevant loops
- Suggest areas for future exploration

EPISODIC MEMORIES:
[List of recent episodic memories]
```

### 6.3 Memory Retrieval Strategy

When the Guide needs context for a response, memories are retrieved using a multi-factor scoring:

```sql
-- Simplified retrieval query
SELECT *
FROM guru_memory
WHERE user_id = $user_id
  AND is_consolidated = false
  AND memory_layer IN ('episodic', 'semantic')
ORDER BY
  (importance * decay_factor * 0.4)  -- Weight: importance
  + (CASE WHEN dimension_relevant = $current_dimension 
     THEN 3 ELSE 0 END)              -- Weight: dimensional relevance
  + (CASE WHEN $current_loops && linked_loops 
     THEN 2 ELSE 0 END)              -- Weight: loop relevance
  + (1.0 / (EXTRACT(EPOCH FROM now() - created_at) / 86400 + 1)) -- Weight: recency
DESC
LIMIT 15;
```

### 6.4 Memory Decay

Memories naturally decay over time to prevent information overload:

```
decay_factor = initial_importance * (0.95 ^ days_since_creation)

Each access (retrieval) boosts the decay factor:
decay_factor = min(original_importance, decay_factor * 1.1)
access_count += 1
last_accessed_at = now()
```

This creates a natural "forgetting curve" where unaccessed memories fade while frequently relevant memories remain strong.

### 6.5 Pattern Detection (`memory_patterns`)

The system detects recurring patterns by analyzing clusters of related memories:

```sql
-- memory_patterns table
CREATE TABLE memory_patterns (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_name TEXT NOT NULL,      -- "Avoiding conflict in relationships"
  description TEXT NOT NULL,       -- Detailed pattern description
  dimension TEXT,                  -- Which dimension this pattern affects
  linked_loops TEXT[],            -- Which Core Loops drive this pattern
  memory_ids TEXT[],              -- Source memories that formed this pattern
  frequency INTEGER DEFAULT 1,    -- How often this pattern appears
  significance TEXT DEFAULT 'emerging', -- emerging, established, dissolving
  emotional_trend TEXT,           -- The emotional quality of this pattern
  first_seen_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. Journal Analysis System

### 7.1 `journal-reflect` Edge Function

When a user saves a journal entry, the journal-reflect function:

1. **Analyzes** the content for consciousness signals
2. **Generates** a reflective response (if AI mode is enabled)
3. **Extracts** memories
4. **Updates** consciousness signals
5. **Detects** chitta vritti (mental fluctuation type)

### 7.2 Three-Brain Analysis

Journal entries are analyzed through the "three-brain" framework:

**Head Signals** (Cognitive):
- Thought patterns (rumination, analysis, planning, fantasizing)
- Belief statements (should/shouldn't, must/can't)
- Cognitive distortions (black-and-white thinking, catastrophizing)
- Intellectual insights

**Heart Signals** (Emotional):
- Named emotions
- Emotional intensity
- Emotional vocabulary richness
- Compassion/self-criticism ratio

**Gut Signals** (Somatic/Intuitive):
- Body sensations mentioned
- Intuitive statements
- Energy descriptions
- Physical-emotional correlations

**Witness Signals** (Meta-Awareness):
- Moments of observation ("I noticed that I...")
- Gap recognition (pause between stimulus and response)
- Pattern awareness ("This always happens when...")
- Non-identification ("The thought arose, but I wasn't consumed by it")

### 7.3 Consciousness Signal Output

```json
{
  "head_signals": {
    "dominant_pattern": "rumination",
    "belief_statements": ["I should have done better"],
    "cognitive_distortions": ["perfectionism"],
    "intellectual_insights": 1
  },
  "heart_signals": {
    "primary_emotion": "frustration",
    "intensity": 6,
    "vocabulary_richness": "moderate",
    "self_compassion_ratio": 0.3
  },
  "gut_signals": {
    "body_mentions": ["tension in shoulders", "tight stomach"],
    "energy_level": "depleted",
    "intuitive_statements": 0
  },
  "witness_signals": {
    "observation_moments": 2,
    "gap_recognition": true,
    "pattern_awareness": 1,
    "non_identification": false
  },
  "chitta_vritti": "flickering",
  "loops_detected": ["not_enough", "performance"],
  "dimension_updates": {
    "emotion": +0.2,
    "body": +0.1,
    "awareness": +0.3
  },
  "confidence": 0.75
}
```

---

## 8. Three-Lens Analyzer

### 8.1 Purpose

The Three-Lens Analyzer (`three-lens-analyzer` edge function) provides deep multi-dimensional analysis of user patterns:

**Lens 1: Psychological (Western)**
- Cognitive-behavioral patterns
- Attachment styles
- Defense mechanisms
- Developmental psychology

**Lens 2: Contemplative (Eastern)**
- Vedantic self-inquiry perspectives
- Buddhist mindfulness observations
- Yogic energy analysis
- Taoist flow assessment

**Lens 3: Somatic (Body)**
- Nervous system state (sympathetic/parasympathetic)
- Stress response patterns
- Body-held trauma indicators
- Energy distribution

### 8.2 Usage

The analyzer is invoked for deeper analysis during:
- Weekly consciousness reviews
- Breakthrough detection
- Regression analysis
- Admin-level user understanding

---

## 9. Predictive Insights

### 9.1 Purpose

The Predictive Insights system (`predictive-insights` edge function) uses pattern analysis to predict:

- **Upcoming breakthroughs**: Based on historical patterns before previous breakthroughs
- **Regression risk**: Based on factors that preceded past regressions
- **Optimal practices**: Based on what worked for similar states in the past
- **Loop activation**: Based on situational triggers identified in memory

### 9.2 Algorithm

```
Prediction = f(
  current_state,
  historical_trajectory,
  pattern_matches,
  seasonal_factors,
  engagement_trends
)
```

---

## 10. Task Generation and Completion

### 10.1 Task Generation (via Consciousness Engine)

Tasks are generated as part of the daily plan. Each task includes:

```json
{
  "title": "Notice your first emotional reaction of the day",
  "description": "When the first emotion arises today — frustration, joy, anxiety — pause for 3 seconds and name it silently.",
  "dimension_target": "emotion",
  "estimated_minutes": 5,
  "difficulty": "gentle",
  "domain": "awareness"
}
```

### 10.2 Task Completion (`complete-task`)

When a user completes a task:

```
Task completed with optional reflection text
│
▼
┌──────────────────────────────┐
│  complete-task Edge Function  │
│                               │
│  1. Update task status        │
│  2. If reflection provided:   │
│     a. Extract consciousness  │
│        signals                │
│     b. Create guru memories   │
│     c. Update dimensions      │
│  3. Generate chain task       │
│     (if applicable)           │
│  4. Log to ai_usage_log      │
└──────────────────────────────┘
```

### 10.3 Chain Tasks

Observation tasks can be chained — completing one generates the next:

```
Task 1: "Notice tension in your body right now"
  ↓ (completed)
Task 2: "Now breathe into that tension for 3 breaths"  
  ↓ (completed)
Task 3: "What changed? What stayed the same?"
```

Chain tasks increase in depth and reflective quality.

---

## 11. Theme Generation

### 11.1 `generate-theme` Edge Function

Each day, a unique theme is generated for each user:

**Input:**
- User's current consciousness state
- Active loops and patterns
- Previous themes (avoid repetition)
- Day of journey
- Current focus dimension

**Output:**
```json
{
  "title": "The Space Between Reactions",
  "description": "Today, notice the gap between stimulus and response. That gap — however tiny — is where freedom lives.",
  "affirmation": "In the pause, I find my power.",
  "focus_areas": ["emotional awareness", "response flexibility", "body signals"]
}
```

### 11.2 Theme Quality Guidelines

Themes must be:
- **Specific enough** to guide behavior (not "be mindful" but "notice your first reaction")
- **Universal enough** to apply across all life domains
- **Poetic enough** to inspire without being pretentious
- **Actionable** — the user should know what to observe/practice
- **Progressive** — building on previous themes without requiring linear progression

---

## 12. Enterprise AI Features

### 12.1 Enterprise Insights (`enterprise-insights`)

Generates organization-level consciousness insights:
- Team-level pattern analysis
- Engagement trend predictions
- Cultural health indicators
- Recommended interventions

### 12.2 Manager Coaching (`manager-coaching`)

Generates coaching talking points for manager 1-on-1 conversations:
- Based on anonymized team member consciousness data
- Conversation starters appropriate to the relationship dynamic
- Suggested check-in questions
- Development area highlights

### 12.3 Admin Copilot (`admin-copilot`)

AI assistant for platform administrators:
- Answer questions about platform health
- Generate reports
- Identify at-risk users
- Suggest platform improvements

### 12.4 Admin AI Insights (`admin-ai-insights`)

Platform-wide pattern analysis:
- User engagement trends
- Content effectiveness metrics
- Feature usage patterns
- Predictive user behavior modeling

---

## 13. Voice AI (ElevenLabs)

### 13.1 Text-to-Speech (`elevenlabs-tts`)

```
Response text → ElevenLabs API → Audio blob → Browser playback
```

**Configuration:**
- Model: Eleven Multilingual v2
- Voice: Selected to match Guru personality (warm, clear, calm)
- Speed: Slightly slower than normal speech (0.9x)
- Stability: High (0.75) for consistent delivery
- Similarity boost: Medium (0.5) for natural variation

### 13.2 Speech-to-Text (`elevenlabs-stt`)

```
Browser audio recording → Audio blob → ElevenLabs Scribe API → Transcribed text
```

**Configuration:**
- Model: Scribe v1
- Language detection: Automatic
- Punctuation: Enabled
- Speaker detection: Disabled (single speaker)

### 13.3 Scribe Token (`elevenlabs-scribe-token`)

For real-time transcription, generates temporary authentication tokens for the ElevenLabs Scribe WebSocket API.

---

## 14. Prompt Engineering Guide

### 14.1 Prompt Structure

All ConsciousOS prompts follow a consistent structure:

```
[IDENTITY]
Define who the AI is and its role

[CONTEXT]
Provide user-specific context (profile, memories, state)

[INSTRUCTIONS]
Specific task instructions for this interaction

[CONSTRAINTS]
What the AI should NOT do

[FORMAT]
Expected output format (JSON structure, response style)

[EXAMPLES]
One or two examples of ideal responses (when helpful)
```

### 14.2 Prompt Best Practices

1. **Be specific about the consciousness model**: Reference V-Levels, dimensions, loops explicitly
2. **Include user history**: Always provide recent memories and current state
3. **Set emotional boundaries**: Specify when to be gentle vs. challenging
4. **Define output format**: Use JSON schemas for structured outputs
5. **Include safety rails**: Always include crisis handling instructions
6. **Version prompts**: Track prompt versions for quality monitoring

### 14.3 Prompt Variables

Common variables used across prompts:

| Variable | Source | Example |
|----------|--------|---------|
| `{userName}` | profiles.display_name | "Arjun" |
| `{journeyDay}` | user_consciousness_profile.journey_day | 42 |
| `{vLevel}` | user_consciousness_profile.v_level_current | 5.3 |
| `{state}` | user_consciousness_profile.state | "normal" |
| `{activeLoops}` | user_consciousness_profile.active_loops | ["not_enough", "control"] |
| `{focusDimension}` | daily_engine_plans.focus_dimension | "emotion" |
| `{todayTheme}` | daily_themes.title | "The Space Between Reactions" |
| `{recentMemories}` | guru_memory (top N) | [Memory objects] |

---

## 15. AI Safety and Ethics

### 15.1 Safety Guidelines

All AI interactions follow these safety rules:

1. **Never diagnose**: The Guru is not a therapist and never provides clinical diagnoses
2. **Never prescribe**: No medication recommendations, no specific medical advice
3. **Crisis handling**: If suicidal ideation, self-harm, or abuse is detected:
   - Acknowledge the pain
   - Provide crisis hotline numbers
   - Suggest professional help
   - Do not attempt to "treat" the crisis
4. **No spiritual bypassing**: Don't use spiritual concepts to dismiss genuine emotional pain
5. **No manipulation**: Don't use persuasion techniques to increase app usage
6. **Age-appropriate**: Don't provide practices that could be harmful for minors
7. **Cultural sensitivity**: Don't misrepresent or trivialize sacred practices

### 15.2 Bypassing Detection

The system actively monitors for spiritual bypassing:

**Indicators:**
- Using spiritual language to avoid feeling emotions
- Premature "transcendence" claims
- Intellectualizing instead of experiencing
- Using practices to dissociate rather than integrate
- Dismissing relational problems as "illusion"

**Response:**
When bypassing is detected, the Guru gently redirects:
- "I notice you're moving into concept. Can we stay with the feeling?"
- "That's a beautiful understanding. And... what does your body say about it?"
- "Before we go further, let's check: is this insight or is it avoidance?"

### 15.3 Data Ethics

- All consciousness data belongs to the user
- Enterprise data is anonymized before manager access
- No data is sold to third parties
- Users can request data export and deletion
- AI training data is not extracted from individual users

---

## 16. Credit and Cost Management

### 16.1 Cost Per Interaction

| Function | Avg Tokens | Avg Cost (paise) |
|----------|-----------|------------------|
| Guide Chat (GPT-5) | 2000-4000 | 50-100 |
| Guide Chat (Gemini Flash) | 2000-4000 | 20-40 |
| Consciousness Engine | 3000-5000 | 30-60 |
| Journal Reflect | 1500-3000 | 15-30 |
| Memory Extract | 1000-2000 | 10-20 |
| Theme Generate | 1000-2000 | 10-20 |
| Task Complete | 500-1000 | 5-10 |
| TTS | N/A (per char) | 10-30 |
| STT | N/A (per second) | 5-15 |

### 16.2 Cost Tracking

Every AI call is logged:
```sql
INSERT INTO ai_usage_log (
  user_id,
  function_name,
  model,
  input_tokens,
  output_tokens,
  total_tokens,
  estimated_cost_paise,
  charged_paise,
  status,
  metadata
) VALUES (...);
```

### 16.3 Credit Gate

The `useCreditGate` hook checks credit balance before AI calls:
```typescript
const { hasCredits, deduct, balance } = useCreditGate();

if (!hasCredits(estimatedCost)) {
  // Show credit purchase prompt
  return;
}

// Proceed with AI call
const result = await callAI();
deduct(actualCost);
```

---

## 17. AI Performance Optimization

### 17.1 Caching

- Daily plans cached per user per date per time slot
- Theme generation cached per user per date
- Memory retrieval results cached for current session
- Consciousness profile cached with React Query

### 17.2 Batching

- Memory extraction batched after session ends (not per-message)
- Consciousness signal updates batched per journal entry
- Profile updates debounced to prevent excessive writes

### 17.3 Model Selection Optimization

- Use Flash Lite for simple tasks (task completion, basic extraction)
- Use Flash for balanced tasks (engine plans, themes, journal analysis)
- Reserve Pro/GPT-5 for high-value interactions (Guide chat, deep analysis)
- Fall back to cheaper models during high-load periods

### 17.4 Prompt Optimization

- Minimize system prompt length without sacrificing quality
- Use structured output formats to reduce response parsing
- Include few-shot examples only when needed
- Cache compiled prompts where possible

---

## 18. Future AI Roadmap

### 18.1 Near-Term (6 months)

- **Multimodal input**: Image-based journaling (draw what you feel)
- **Real-time voice Guide**: WebSocket-based conversational Guide with ElevenLabs
- **Pattern prediction alerts**: Proactive notifications when patterns are about to activate
- **Dream pattern correlation**: Cross-user dream theme analysis (anonymized)

### 18.2 Medium-Term (1 year)

- **3D Guru Avatar**: Unreal Engine-powered 3D avatar with lip sync
- **Wearable integration**: HRV, sleep, and movement data as consciousness signals
- **Group consciousness AI**: AI facilitation for group meditation and dialog
- **Custom AI voices**: User-selected Guru voice personality

### 18.3 Long-Term (2-3 years)

- **Consciousness API**: Third-party access to consciousness assessment AI
- **Research AI**: Tools for consciousness researchers to analyze patterns
- **Personalized tradition recommendation**: AI-guided tradition matching
- **Real-time biofeedback**: Integration with EEG and other consciousness measurement devices

---

*This document provides the complete AI system reference for ConsciousOS. The AI architecture is the heart of the platform — every interaction, every memory, every insight serves the user's journey toward greater awareness.*

*ConsciousOS — The journey inward to who you truly are.*
