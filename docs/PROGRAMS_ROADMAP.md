# ConsciousOS Programs — 150+ Structured Journeys

## Architecture Decision

**All program content lives in frontend code** (`src/data/programs/`).
- Program definitions, curriculum, daily content → TypeScript files
- User progress (enrollment, day completion) → Supabase database
- This allows the user to use their own Supabase instance

## Data Model

### Frontend: Program Definition (TypeScript)

```typescript
interface Program {
  id: string; // unique slug e.g. "7day-awareness-kickstart"
  title: string;
  description: string;
  duration: 7 | 14 | 21 | 30 | 40 | 90;
  category: ProgramCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  coverGradient: string; // tailwind gradient classes
  icon: string; // lucide icon name
  tags: string[];
  curriculum: ProgramDay[];
}

interface ProgramDay {
  day: number;
  title: string;
  theme: string;
  knowledge: {
    title: string;
    content: string; // markdown
    readingTime: number; // minutes
  };
  practice: {
    title: string;
    description: string;
    durationMinutes: number;
    type: 'observation' | 'meditation' | 'breathwork' | 'body-scan' | 'journaling' | 'contemplation';
  };
  reflectionPrompt: string;
}

type ProgramCategory =
  | 'awareness'
  | 'mind'
  | 'emotional'
  | 'body'
  | 'meditation'
  | 'loops'
  | 'yoga-paths'
  | 'habits'
  | 'purpose'
  | 'relationships'
  | 'shadow'
  | 'chakras'
  | 'enterprise';
```

### Database: User Progress (Supabase)

```sql
-- program_enrollments: tracks which program a user is doing
CREATE TABLE program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  program_id TEXT NOT NULL, -- matches frontend Program.id
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active', -- active | paused | completed | abandoned
  completed_at TIMESTAMPTZ,
  grace_days_used INTEGER NOT NULL DEFAULT 0,
  last_completed_day_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- program_day_progress: per-day completion tracking
CREATE TABLE program_day_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES program_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  knowledge_read BOOLEAN NOT NULL DEFAULT false,
  practice_done BOOLEAN NOT NULL DEFAULT false,
  reflection_text TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id, day_number)
);
```

RLS:
- Enrollments: user_id = auth.uid() for all CRUD
- Day progress: user_id = auth.uid() for all CRUD
- Only 1 active enrollment at a time (enforced in frontend)

## App Behavior: Full Takeover Mode

When a user has an active program enrollment:
1. **Home page becomes Program Dashboard** — shows today's day, progress ring, streak
2. **Navigation minimized** — only Program, Journal, Settings visible
3. **Daily flow**: Learn → Practice → Reflect → Complete Day
4. **Exit Program** always available (with confirmation warning)
5. **Sequential unlock with grace** — must complete previous day, but 3 missed days allowed before auto-pause

## Phase Plan

### Phase 1: Foundation ✅ (Current)
- [x] Create roadmap doc
- [ ] Create `src/data/programs/types.ts` — TypeScript interfaces
- [ ] Create `src/data/programs/index.ts` — program registry
- [ ] Create first 3 programs (7-day, 21-day, 30-day) with full curriculum
- [ ] Database migration: program_enrollments + program_day_progress tables

### Phase 2: Core UI
- [ ] `src/pages/Programs.tsx` — browse & enroll
- [ ] `src/pages/ProgramDetail.tsx` — view curriculum, start/continue
- [ ] `src/pages/ProgramDay.tsx` — Learn/Practice/Reflect flow
- [ ] `src/hooks/usePrograms.ts` — enrollment & progress hooks
- [ ] Routes in App.tsx + nav item in AppLayout.tsx

### Phase 3: Full Takeover Mode
- [ ] When enrolled, Home becomes Program Dashboard
- [ ] Navigation adapts (minimal tabs)
- [ ] Daily unlock logic with grace period
- [ ] Program completion celebration + certificate

### Phase 4: AI Program Generator
- [ ] Edge function: `generate-program` — input topic/duration → output full curriculum
- [ ] Admin-style page to trigger generation
- [ ] Review + save generated programs to frontend code

### Phase 5: Scale to 150+ Programs
- [ ] Batch generate programs by category
- [ ] Program search & filter UI
- [ ] Difficulty progression recommendations
- [ ] "Recommended for you" based on consciousness profile

### Phase 6: Advanced Features
- [ ] Program ratings & reviews
- [ ] Community progress sharing
- [ ] Program streaks & badges
- [ ] Enterprise program assignments (managers assign to teams)
- [ ] Custom program builder (users create their own)

## 155 Programs Master List

### 🧘 Awareness & Observation (17)

#### 7-Day Programs (8)
1. 7-Day Awareness Kickstart — First taste of self-observation
2. 7-Day Sensory Awakening — Heightening 5 senses through observation
3. 7-Day Thought Watching — Observing mental patterns without attachment
4. 7-Day Present Moment — Anchoring in the now
5. 7-Day Inner Silence — Finding gaps between thoughts
6. 7-Day Body Awareness — Tuning into physical sensations
7. 7-Day Witness Consciousness — Developing the observer self
8. 7-Day Micro-Moments — Finding awareness in daily routines

#### 30-Day Programs (6)
9. 30-Day Deep Observation — Systematic self-study practice
10. 30-Day Awareness Mastery — Building unshakeable presence
11. 30-Day Consciousness Expansion — Widening perceptual field
12. 30-Day Silent Observer — Month-long witness practice
13. 30-Day Attention Training — Sharpening focus and awareness
14. 30-Day Mindful Living — Integrating awareness into every activity

#### 90-Day Programs (3)
15. 90-Day Consciousness Transformation — Complete awareness overhaul
16. 90-Day Witness Mastery — Deep witness consciousness development
17. 90-Day Awakening Journey — Systematic consciousness evolution

### 🧠 Mind & Thought Patterns (17)

#### 7-Day Programs (8)
18. 7-Day Thought Detox — Breaking mental rumination cycles
19. 7-Day Mental Clarity — Clearing cognitive fog
20. 7-Day Belief Audit — Examining hidden assumptions
21. 7-Day Cognitive Freedom — Releasing rigid thinking patterns
22. 7-Day Inner Narrative — Rewriting your mental stories
23. 7-Day Decision Clarity — Thinking clearly under pressure
24. 7-Day Mental Stillness — Quieting the mental chatter
25. 7-Day Pattern Recognition — Spotting repetitive thought loops

#### 30-Day Programs (6)
26. 30-Day Mind Mastery — Complete cognitive restructuring
27. 30-Day Thought Alchemy — Transforming negative patterns
28. 30-Day Mental Resilience — Building unshakeable mental strength
29. 30-Day Cognitive Flexibility — Expanding thinking capacity
30. 30-Day Inner Dialogue — Mastering self-talk
31. 30-Day Wisdom Cultivation — Developing discernment

#### 90-Day Programs (3)
32. 90-Day Mind Liberation — Complete mental freedom journey
33. 90-Day Cognitive Evolution — Systematic mind development
34. 90-Day Mental Mastery — Ultimate thought pattern transformation

### ❤️ Emotional Intelligence (15)

#### 7-Day Programs (7)
35. 7-Day Emotion Mapping — Understanding your emotional landscape
36. 7-Day Feelings First — Learning to feel fully
37. 7-Day Emotional Detox — Releasing stored emotions
38. 7-Day Heart Opening — Cultivating emotional vulnerability
39. 7-Day Anger Alchemy — Transforming anger into wisdom
40. 7-Day Anxiety Release — Calming the nervous system
41. 7-Day Grief Journey — Honoring loss with awareness

#### 30-Day Programs (5)
42. 30-Day Emotional Mastery — Complete emotional intelligence
43. 30-Day Self-Compassion — Deep self-love practice
44. 30-Day Emotional Resilience — Bouncing back from adversity
45. 30-Day Heart Intelligence — Listening to heart wisdom
46. 30-Day Emotional Freedom — Releasing lifelong patterns

#### 90-Day Programs (3)
47. 90-Day Emotional Transformation — Complete emotional overhaul
48. 90-Day Heart Awakening — Deep heart-centered journey
49. 90-Day Emotional Alchemy — Converting pain to wisdom

### 💪 Body & Somatic (14)

#### 7-Day Programs (7)
50. 7-Day Body Scan — Systematic body awareness
51. 7-Day Breathwork Basics — Foundation breathing practices
52. 7-Day Tension Release — Releasing stored physical stress
53. 7-Day Somatic Intelligence — Body wisdom activation
54. 7-Day Movement Meditation — Conscious movement practice
55. 7-Day Grounding — Earth connection practices
56. 7-Day Energy Awareness — Sensing subtle body energy

#### 30-Day Programs (5)
57. 30-Day Somatic Mastery — Complete body-mind integration
58. 30-Day Breathwork Journey — Advanced pranayama progression
59. 30-Day Body Liberation — Freeing the physical vessel
60. 30-Day Embodiment — Living fully in the body
61. 30-Day Nervous System Reset — Vagal tone optimization

#### 90-Day Programs (2)
62. 90-Day Somatic Transformation — Complete body awakening
63. 90-Day Embodied Consciousness — Deep body-spirit integration

### 🌙 Meditation & Stillness (15)

#### 7-Day Programs (7)
64. 7-Day Meditation Starter — First steps into stillness
65. 7-Day Morning Meditation — Building a dawn practice
66. 7-Day Evening Wind-Down — Peaceful night meditation
67. 7-Day Walking Meditation — Moving meditation practice
68. 7-Day Mantra Meditation — Sound-based meditation
69. 7-Day Visualization — Inner sight practices
70. 7-Day Loving-Kindness — Metta meditation basics

#### 30-Day Programs (5)
71. 30-Day Meditation Deep Dive — Deepening stillness practice
72. 30-Day Silence Journey — Progressive silence practice
73. 30-Day Dhyana Path — Classical meditation progression
74. 30-Day Concentration — Single-pointed focus mastery
75. 30-Day Meditation Mastery — Advanced meditation techniques

#### 90-Day Programs (3)
76. 90-Day Meditation Transformation — Complete meditation journey
77. 90-Day Deep Silence — Extended stillness practice
78. 90-Day Samadhi Path — Journey toward absorption states

### 🔄 Loop Breaking (14)

#### 7-Day Programs (6)
79. 7-Day Loop Awareness — Recognizing your patterns
80. 7-Day Procrastination Break — Ending delay patterns
81. 7-Day People-Pleasing Detox — Setting healthy boundaries
82. 7-Day Perfectionism Release — Letting go of impossible standards
83. 7-Day Comparison Cure — Stopping social comparison
84. 7-Day Overthinking Stop — Breaking analysis paralysis

#### 30-Day Programs (5)
85. 30-Day Loop Liberation — Systematic pattern breaking
86. 30-Day Addiction Awareness — Understanding compulsive behaviors
87. 30-Day Reactivity Reset — Moving from reaction to response
88. 30-Day Samskara Clearing — Deep impression dissolution
89. 30-Day Freedom from Fear — Dismantling fear-based patterns

#### 90-Day Programs (3)
90. 90-Day Loop Mastery — Complete pattern liberation
91. 90-Day Deep Samskara Work — Root-level impression clearing
92. 90-Day Behavioral Freedom — Total habit transformation

### 🕉️ Yoga Paths (18)

#### 7-Day Programs (8)
93. 7-Day Jnana Introduction — Path of knowledge basics
94. 7-Day Bhakti Awakening — Path of devotion basics
95. 7-Day Karma Yoga Starter — Path of selfless action
96. 7-Day Raja Yoga Intro — Royal path of meditation
97. 7-Day Niyama Practice — Personal observances
98. 7-Day Yama Ethics — Universal moral principles
99. 7-Day Pranayama Basics — Breath control foundation
100. 7-Day Pratyahara — Sense withdrawal practice

#### 30-Day Programs (6)
101. 30-Day Jnana Deep Dive — Self-inquiry mastery
102. 30-Day Bhakti Journey — Heart devotion practice
103. 30-Day Karma Path — Service and action practice
104. 30-Day Ashtanga Journey — 8-limbed yoga progression
105. 30-Day Kundalini Awakening — Energy ascension practice
106. 30-Day Dharana Mastery — Concentration and focus path

#### 90-Day Programs (4)
107. 90-Day Integral Yoga — All 4 paths combined
108. 90-Day Self-Realization — Jnana yoga deep journey
109. 90-Day Devotion Path — Complete bhakti immersion
110. 90-Day Raja Yoga Mastery — Complete royal path

### 🌅 Daily Rituals & Habits (14)

#### 7-Day Programs (7)
111. 7-Day Morning Ritual — Creating a sacred morning
112. 7-Day Evening Ritual — Conscious day closure
113. 7-Day Digital Detox — Reclaiming attention from screens
114. 7-Day Gratitude Practice — Daily appreciation ritual
115. 7-Day Journaling Habit — Building reflective writing
116. 7-Day Sleep Optimization — Conscious sleep practices
117. 7-Day Eating Awareness — Mindful nourishment

#### 30-Day Programs (5)
118. 30-Day Morning Mastery — Complete morning transformation
119. 30-Day Habit Architect — Building multiple keystone habits
120. 30-Day Conscious Living — Every moment as practice
121. 30-Day Simplicity — Minimalist living journey
122. 30-Day Energy Management — Optimizing daily vitality

#### 90-Day Programs (2)
123. 90-Day Life Design — Complete daily structure overhaul
124. 90-Day Ritual Mastery — Establishing lifelong practices

### 💼 Work & Purpose (11)

#### 7-Day Programs (5)
125. 7-Day Purpose Clarity — Finding your why
126. 7-Day Conscious Leadership — Leading with awareness
127. 7-Day Flow State — Accessing peak performance
128. 7-Day Creative Unblock — Releasing creative blocks
129. 7-Day Ikigai Discovery — Finding life intersection

#### 30-Day Programs (4)
130. 30-Day Purpose Path — Deep purpose exploration
131. 30-Day Conscious Career — Aligning work with values
132. 30-Day Creative Flow — Sustained creative practice
133. 30-Day Dharma Discovery — Finding your life mission

#### 90-Day Programs (2)
134. 90-Day Life Purpose — Complete purpose journey
135. 90-Day Conscious Entrepreneurship — Building with awareness

### 🤝 Relationships & Mirror Work (11)

#### 7-Day Programs (5)
136. 7-Day Mirror Work — Seeing yourself in others
137. 7-Day Conscious Communication — Speaking with awareness
138. 7-Day Boundary Setting — Healthy relationship boundaries
139. 7-Day Forgiveness — Releasing relationship wounds
140. 7-Day Connection Deepening — Authentic intimacy practice

#### 30-Day Programs (4)
141. 30-Day Relationship Mastery — Complete relational awareness
142. 30-Day Communication Alchemy — Transforming how you connect
143. 30-Day Inner Child Healing — Reparenting yourself
144. 30-Day Attachment Freedom — Secure attachment development

#### 90-Day Programs (2)
145. 90-Day Relational Consciousness — Complete relationship transformation
146. 90-Day Love & Freedom — Mastering love without attachment

### 🌑 Shadow Work (9)

#### 7-Day Programs (4)
147. 7-Day Shadow Introduction — Meeting your shadow self
148. 7-Day Dark Emotions — Embracing what you avoid
149. 7-Day Projection Awareness — Seeing your reflections
150. 7-Day Trigger Mapping — Understanding your reactive points

#### 30-Day Programs (3)
151. 30-Day Shadow Integration — Deep shadow work journey
152. 30-Day Dark Night Navigation — Handling spiritual crises
153. 30-Day Wholeness — Integrating all parts of self

#### 90-Day Programs (2)
154. 90-Day Shadow Mastery — Complete shadow integration
155. 90-Day Wholeness Journey — Ultimate self-integration path

---

**Total: 155 Programs**
- 7-Day: 72 programs
- 30-Day: 54 programs
- 90-Day: 29 programs

## File Structure

```
src/data/programs/
├── types.ts                    # TypeScript interfaces
├── index.ts                    # Program registry + lookup functions
├── categories.ts               # Category metadata
├── awareness/
│   ├── 7day-awareness-kickstart.ts
│   ├── 7day-sensory-awakening.ts
│   ├── ...
│   └── 90day-awakening-journey.ts
├── mind/
│   ├── 7day-thought-detox.ts
│   └── ...
├── emotional/
├── body/
├── meditation/
├── loops/
├── yoga-paths/
├── habits/
├── purpose/
├── relationships/
└── shadow/
```

Each program file exports a complete `Program` object with full curriculum for all days.
