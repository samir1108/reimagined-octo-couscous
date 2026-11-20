# CONSCIOUSOS 10,000+ CONTENT LIBRARY — MASTER BUILD PROMPT

> Copy and paste this entire prompt into any AI coding assistant to build the ConsciousOS 10,000+ Consciousness Content Library. The AI should follow every section sequentially. All architecture files already exist in the codebase under `src/types/contentLibrary.ts`, `src/lib/content-library/`, `supabase/migrations/001_content_library.sql`, and `src/components/explore/ExplorePage.tsx`.

---

## SYSTEM CONTEXT

You are building the **ConsciousOS 10,000+ Consciousness Content Library** — the world's most interconnected personal consciousness exploration library. Think of it as Netflix (discover content) + Spotify (audio/podcasts) + Duolingo (interactive learning/games) + MasterClass (structured programs) + Wikipedia (interconnected wisdom) + RPG games (quests, progression) + a yogic university (practices, teachings, transformation).

**Objective:** Every user should have thousands of meaningful things to explore, learn, experience, and practice.

**Existing codebase:** React + TypeScript + Vite + Supabase + Tailwind CSS + shadcn/ui. The project is at `D:\final\sat-yug`. All foundational types are in `src/types/contentLibrary.ts`. Taxonomy in `src/lib/content-library/taxonomy.ts`. DB schema in `supabase/migrations/001_content_library.sql`.

---

## PHASE 1: CONTENT TAXONOMY & ARCHITECTURE (Stage 1)

### Task 1.1: Verify and extend type definitions
Read `src/types/contentLibrary.ts`. Ensure the `LibraryItem` interface matches the spec exactly:

```typescript
interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: "practice" | "game" | "program" | "wisdom" | "podcast" | "meditation" | "challenge" | "ritual" | "course" | "story" | "tool" | "micro_practice" | "journaling" | "self_inquiry" | "breathwork" | "somatic" | "assessment" | "life_experiment" | "psychological_pattern" | "emotional_experience" | "personality_exploration" | "archetype" | "chakra_knowledge" | "dream_exploration" | "relationship_exercise" | "karma_experiment" | "concentration_exercise" | "creative_awareness" | "nature_experience" | "reflection_question";
  category: string;
  subcategory: string;
  duration_minutes?: number;
  difficulty: "beginner" | "intermediate" | "advanced" | "all";
  consciousness_dimensions: string[];
  life_domains: string[];
  yoga_paths: string[];
  suitable_bands: string[];
  prerequisites: string[];
  tags: string[];
  related_items: string[];
  content: Record<string, unknown>;
  source: "original" | "licensed" | "public_domain" | "curated" | "ai_generated_reviewed";
  status: "draft" | "review" | "published";
}
```

### Task 1.2: Category targets
The main library has 18 categories with these targets:

| Category | Target |
|---|---|
| Yogic Practices | 1,800 |
| Micro Practices | 1,200 |
| Wisdom & Teachings | 1,200 |
| Guided Programs | 700 |
| Games & Interactive Experiences | 600 |
| Podcasts & Audio Experiences | 600 |
| Meditations | 500 |
| Journaling Experiences | 500 |
| Self-Inquiry Experiences | 450 |
| Challenges & Quests | 400 |
| Rituals & Ceremonies | 400 |
| Breathwork | 350 |
| Somatic Experiences | 350 |
| Courses & Learning Paths | 300 |
| Stories & Parables | 300 |
| Daily Missions | 300 |
| Tools & Interactive Widgets | 250 |
| Assessments | 150 |
| **TOTAL** | **10,350** |

Additional libraries (expansion targets, not in main count):

| Library | Target |
|---|---|
| Life Experiments | 300 |
| Psychological Patterns | 200 |
| Emotional Experiences | 200 |
| Personality Exploration | 100 |
| Archetype Library | 108 |
| Chakra Knowledge | 300 |
| Dream Exploration | 200 |
| Relationship Exercises | 250 |
| Karma & Action Experiments | 150 |
| Concentration Exercises | 200 |
| Creative Awareness | 150 |
| Nature Experiences | 150 |
| Reflection Questions | 1,000 |
| Stories & Wisdom Narratives | 300 |

### Task 1.3: Practice subcategories (26)
Organize practices into: Observation, Self-Inquiry, Witness Consciousness, Breath Awareness, Pranayama, Dharana, Dhyana, Yoga Nidra, Body Awareness, Chakra Practices, Mantra, Japa, Trataka, Mindfulness, Shadow Work, Emotional Regulation, Gratitude, Compassion, Detachment, Sensory Awareness, Energy Awareness, Nature Connection, Walking Meditation, Sleep Practices, Morning Practices, Evening Practices.

Each practice must have: Duration, Difficulty, Objective, Instructions, Session steps, Required widgets, Expected experience, Contraindications and safety notes, Relevant consciousness dimensions, Suitable user profiles.

### Task 1.4: Game subcategories (6)
1. Awareness Games: Find the Observer, Who Is Thinking?, The Silent Witness, Attention Tracker, Thought Catcher, Present Moment Challenge
2. Psychological Games: Emotion Detective, Identify Your Pattern, Trigger Explorer, Cognitive Bias Detective, Inner Conflict, The Ego Mirror
3. Memory Games: Memory Palace, Observation Recall, Mindful Memory, Pattern Recognition
4. Philosophical Games: Ship of Theseus, Who Am I?, The Identity Experiment, The Paradox Room, The Choice Simulator
5. Interactive Story Games: Journey of the Seeker, The Kingdom of the Mind, The Seven Gates, The Forest of Desires, The Cave of Ignorance
6. Attention Games: 60 Seconds of Stillness, Sound Awareness, Visual Focus, Distraction Resistance

Games should generate meaningful observations, not simply points.

### Task 1.5: Wisdom traditions
Indian: Bhagavad Gita, Upanishads, Yoga Sutras of Patanjali, Ashtavakra Gita, Vivekachudamani, Dhammapada, Hatha Yoga Pradipika, Bhagavata Purana, Advaita Vedanta, Samkhya Philosophy.
Other: Buddhism, Zen, Taoism, Stoicism, Sufism, Mysticism, Existential Philosophy.
Modern: Psychology, Cognitive Science, Neuroscience, Behavioral Science, Philosophy of Mind, Consciousness Studies.

Each wisdom entry: Original source, Author/tradition, Concept, Explanation, Practical application, Related practices, Related programs, Reflection questions, References. Keep traditional teachings, modern scientific evidence, and interpretations clearly distinguished.

### Task 1.6: Podcast categories (15)
Guided meditations, Yogic wisdom, Philosophical conversations, Self-inquiry audio, Sleep stories, Morning reflections, Evening reflections, Spiritual storytelling, Psychology explainers, Breathwork guidance, Sound experiences, Silence experiences, Mantra and chanting, Nature soundscapes, Guided journeys. Include both original productions and properly licensed external content.

### Task 1.7: Programs (15 examples)
| Program | Duration |
|---|---|
| Become the Witness | 21 days |
| Understand Your Mind | 30 days |
| Break Repetitive Patterns | 14 days |
| Emotional Mastery | 30 days |
| The Art of Detachment | 21 days |
| Deep Self-Inquiry | 40 days |
| Attention Mastery | 14 days |
| Conscious Relationships | 21 days |
| Discover Your Inner Patterns | 30 days |
| Silence and Stillness | 7 days |
| Sleep Transformation | 14 days |
| The Yogic Lifestyle | 90 days |
| Understanding Ego | 21 days |
| Develop Concentration | 30 days |
| Inner Discipline | 40 days |

Every program: daily sessions, practices, reflections, missions, progress tracking, assessments.

---

## PHASE 2: KNOWLEDGE GRAPH & SUPABASE SCHEMA (Stage 2)

### Task 2.1: Database schema
The schema is in `supabase/migrations/001_content_library.sql`. Apply it to Supabase. Key tables:

- `library_items` — All 10,000+ content records (common schema)
- `library_categories` — Main categories
- `library_subcategories` — Nested categorization
- `practices` — Practice-specific metadata
- `games` — Game mechanics
- `programs` — Structured programs
- `program_days` — Individual program days
- `wisdom_sources` — Original knowledge sources
- `wisdom_concepts` — Individual teachings
- `podcasts` — Audio metadata
- `sessions` — Session templates
- `session_steps` — Individual session steps
- `content_tags` — Searchable tags
- `content_relationships` — Connections between items (knowledge graph edges)
- `user_library_progress` — User progress
- `user_favorites` — Saved content
- `user_recommendations` — Personalized recommendations
- `content_versions` — Content versioning

### Task 2.2: Knowledge graph connections
Every library item must connect to the existing knowledge graph. A single concept should connect to:
- 10 practices
- 5 wisdom teachings
- 3 games
- 2 programs
- 5 podcasts
- 10 reflection questions
- 3 challenges

Use `content_relationships` table with `relationship_type` enum: related_to, prerequisite_of, part_of_program, part_of_course, teaches_concept, dissolves_loop, develops_skill, references_wisdom, pairs_with, alternative_to, deepens, simplifies, follows, precedes.

### Task 2.3: Integration with existing graph
The existing knowledge graph is in `src/lib/knowledge-graph/` and `src/lib/knowledgeGraph/`. Integrate library items as nodes using `src/lib/content-library/graph.ts`. The `libraryItemToKnowledgeNode()` function converts items. Auto-connect items sharing consciousness dimensions.

---

## PHASE 3: CONTENT CREATION & INGESTION PIPELINE (Stage 3)

### Task 3.1: Ingestion pipeline
Use `src/lib/content-library/ingestion.ts`. Key functions:
- `validateLibraryItem(item)` — validates required fields
- `scoreContentQuality(item)` — returns 0-1 quality score
- `findDuplicates(items)` — Jaccard similarity dedup
- `processIngestionBatch(items, source, category)` — batch import

### Task 3.2: Content quality standards
**NEVER generate 10,000 low-quality AI entries.** Use:
- Source-backed wisdom (cite original texts)
- Original practices (reviewed)
- Reviewed programs
- Interactive games with meaningful observations
- Licensed audio

Track: provenance, quality_score, review_status.

### Task 3.3: Content generation approach
For each category, create content in batches of 50-100 items. Each item must:
1. Have all required fields populated
2. Pass `validateLibraryItem()` with zero errors
3. Score >= 0.7 on `scoreContentQuality()`
4. Have at least 3 `related_items` links
5. Have provenance for wisdom items

### Task 3.4: Seed data generation
Create seed data files in `src/data/content-library/` organized by category:
- `practices.ts` — 1,800 practices
- `microPractices.ts` — 1,200 micro practices
- `wisdom.ts` — 1,200 wisdom entries
- `programs.ts` — 700 programs
- `games.ts` — 600 games
- etc.

Each file exports an array of `LibraryItem` objects. Use the ingestion pipeline to validate.

---

## PHASE 4: EXPLORE UI & DISCOVERY ENGINE (Stage 4)

### Task 4.1: Explore page
The Explore page is in `src/components/explore/ExplorePage.tsx`. It implements the spec UI:

```
┌──────────────────────────────────────┐
│  EXPLORE                             │
│  Discover something within yourself  │
│                                      │
│  [ Search anything...             ]  │
│                                      │
│  ── CONTINUE YOUR JOURNEY ──         │
│  [ Your ongoing program          → ] │
│                                      │
│  ── EXPLORE WORLDS ──                │
│  ◉ Practices       ◉ Games           │
│  ◉ Programs        ◉ Wisdom          │
│  ◉ Podcasts        ◉ Meditations     │
│  ◉ Challenges      ◉ Stories         │
│  ◉ Courses         ◉ Life Experiments│
│                                      │
│  ── FOR YOUR CURRENT STATE ──        │
│  Recommended experiences             │
│  [ Experience 1 ] [ Experience 2 ]   │
│                                      │
│  ── DISCOVER ──                      │
│  Popular this week                   │
│  Recently added                      │
│  Deep exploration                    │
│  Random discovery                    │
└──────────────────────────────────────┘
```

### Task 4.2: Search
Implement full-text search using Supabase `search_library_items()` RPC or client-side filtering. Search across title, description, tags, dimensions.

### Task 4.3: Discovery sections
- Continue Your Journey — ongoing program / recent items
- Explore Worlds — category grid with counts
- For Your Current State — personalized recommendations
- Discover — Popular this week, Recently added, Deep exploration, Random discovery

### Task 4.4: Item detail page
Create `src/components/explore/ItemDetailPage.tsx` that shows:
- Title, description, type, category
- Duration, difficulty
- Consciousness dimensions, life domains, yoga paths
- Related items (knowledge graph neighbors)
- Start/Continue button
- Favorite button
- Progress tracking

### Task 4.5: Bottom navigation
Add "Explore" to the bottom navigation bar. Route: `/app/explore`.

---

## PHASE 5: AI-POWERED RECOMMENDATION ENGINE (Stage 5)

### Task 5.1: Recommendation engine
Use `src/lib/content-library/recommendations.ts`. Key functions:
- `generateRecommendations(ctx, limit)` — scored recommendations
- `buildRecommendationContext(userId, overrides)` — auto-builds context from time/user state
- `generateDailyBundle(ctx)` — daily bundle (awareness game, body practice, wisdom, reflection)
- `enforceDiversity(recommendations)` — max 2 per category

### Task 5.2: Context signals
The engine should consider:
1. What the user has already experienced (completed_item_ids)
2. What practices they enjoy (favorited_item_ids, ratings)
3. Which consciousness dimensions need exploration (weak_dimensions)
4. Which programs they have completed (current_program_id)
5. Which patterns repeatedly appear (recent_emotions)
6. Current time and energy (time_of_day, energy_level, available_minutes)
7. Which experience would be most appropriate next (graph proximity)

### Task 5.3: Example scenario
User opens at 10 PM. Engine identifies:
- Evening context
- Recent emotional patterns
- Sleep schedule
- Previous sessions
- Current journey

Recommends:
- One 5-minute awareness game
- One 8-minute body-awareness practice
- One relevant wisdom teaching
- One 3-minute reflection

### Task 5.4: Supabase integration
Store recommendations in `user_recommendations` table. Cache for 1 hour. Invalidate on new completion/favorite.

---

## ARCHITECTURAL DECISIONS

1. **Don't generate 10,000 low-quality AI entries.** Use source-backed wisdom, original practices, reviewed programs, interactive games, licensed audio. Track provenance, quality, review status.

2. **Knowledge graph first.** Every item connects to 10+ other items. No disconnected records.

3. **Quality over quantity.** Each item must pass validation and score >= 0.7 quality. Status: draft → review → published.

4. **Progressive enhancement.** Start with 100 high-quality items per category, then scale to targets.

5. **User-centric.** The library powers personalized experiences, not just browsing.

---

## IMPLEMENTATION CHECKLIST

- [ ] Apply Supabase migration (`supabase/migrations/001_content_library.sql`)
- [ ] Verify types in `src/types/contentLibrary.ts`
- [ ] Create seed data for 100 items per category (start small)
- [ ] Implement Explore page route in router
- [ ] Add "Explore" to bottom navigation
- [ ] Implement item detail page
- [ ] Connect recommendation engine to user state
- [ ] Integrate knowledge graph (auto-connect items)
- [ ] Add quality scoring to admin panel
- [ ] Test search functionality
- [ ] Test recommendation flow
- [ ] Deploy and verify

---

## FILE REFERENCE

| File | Purpose |
|---|---|
| `src/types/contentLibrary.ts` | All type definitions |
| `src/lib/content-library/taxonomy.ts` | Category/subcategory taxonomy |
| `src/lib/content-library/index.ts` | Main module, discovery, search |
| `src/lib/content-library/graph.ts` | Knowledge graph integration |
| `src/lib/content-library/ingestion.ts` | Validation, quality scoring, dedup |
| `src/lib/content-library/recommendations.ts` | Recommendation engine |
| `src/components/explore/ExplorePage.tsx` | Explore UI page |
| `supabase/migrations/001_content_library.sql` | Database schema |

---

## CODING CONVENTIONS

- TypeScript strict mode, no `any` without justification
- React functional components with hooks
- Tailwind CSS for styling, shadcn/ui components
- Supabase client from `src/integrations/supabase/client`
- Import paths use `@/` alias
- No comments unless necessary
- Error handling: try/catch with user-friendly messages
- Loading states: skeleton components
- Responsive: mobile-first design

---

## AI INSTRUCTIONS

When implementing this library:

1. **Always read existing files first** before creating new ones
2. **Follow the established patterns** in the codebase
3. **Start small** — 100 items per category, then scale
4. **Validate everything** — use the ingestion pipeline
5. **Connect everything** — every item needs related_items
6. **Test as you go** — run typecheck and lint
7. **Don't break existing features** — the library is additive

When generating content:
- Use real, accurate information for wisdom entries
- Create original, creative practices and games
- Ensure programs have realistic daily structures
- Write clear, actionable instructions
- Include safety notes for physical practices
- Distinguish traditional teachings from modern science

---

## END OF MASTER PROMPT
