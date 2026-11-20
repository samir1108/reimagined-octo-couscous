# 2. Loops IP — The Behavioral Pattern Library

**Core files:** `src/lib/loopLibraryCatalog.ts`, `src/data/handbook/loopFamilies.ts`, `src/data/workplaceLoops.ts`, `src/data/loopBlogPosts.ts`, `src/data/loops.ts`, `src/pages/Loops.tsx`, `src/pages/LoopDetail.tsx`

### 2.1 What a "Loop" Is

A **loop** is ConsciousOS's atomic unit for a recurring behavioral/psychological/spiritual pattern — e.g. "People-Pleasing," "Doom Scrolling," "Spiritual Bypassing," "Awakening Addiction." The canonical library lives in `src/data/loops.ts` (600+ entries per in-code comments: "the 600+ loops in `src/data/loops.ts`"), while `loopLibraryCatalog.ts` is described in its own header as a "surface-friendly catalog... sourced from the 400+ loop library," used specifically to power the Mirror app's "Loop Mapping" questionnaire — i.e. the catalog is a curated, plain-English subset (≈90 entries observed) of a much larger underlying dataset for use in fast, user-facing selection UI.

Each `LoopCatalogEntry` has: `id` (structured code, e.g. `VAL001`), `name`, `category` (a 3-letter taxonomy code), and `hint` (a punchy, <70-character plain-English description written for a general audience, e.g. *"Hard to say no; afraid to disappoint"* for People-Pleasing).

### 2.2 The 20-Category Taxonomy

`LOOP_CATEGORIES` defines 20 top-level pattern families, each with a key, label, emoji, and blurb:

| Key | Label | Theme |
|---|---|---|
| VAL | Validation & Worth | Approval, worth, perfectionism |
| CTL | Control & Worry | Controlling the uncontrollable |
| AVD | Avoidance | Pushing away what wants to be felt |
| SRV | Survival | Fight/flight/freeze, hypervigilance |
| BOD | Body | Tension, fatigue, somatic anxiety |
| ENR | Energy | Burnout, depletion, stimulants |
| EMO | Emotional | Guilt, shame, jealousy, loneliness |
| MEN | Mental | Rumination, overthinking, imposter syndrome |
| BHV | Behavioral | Procrastination, avoidance behaviors |
| HAB | Habits | Doom-scrolling, comfort eating |
| SOC | Social | Masking, social anxiety, FOMO |
| REL | Relationships | Attachment, codependency, distancing |
| IDN | Identity | Fixed roles you've locked into |
| EGO | Ego | Defensiveness, need to be right |
| BLF | Core Beliefs | "I'm not enough," "I don't deserve..." |
| PUR | Purpose | Meaning, existential dread |
| SPR | Spiritual | Bypassing, awakening addiction |
| PRD | Productivity | Busy-ness as identity |
| COG | Cognitive Bias | Negativity bias, emotional reasoning |
| MOT | Motivation | Waiting for motivation/perfect conditions |

The catalog also defines **12 standard triggers** (`LOOP_TRIGGERS`) used for onboarding questionnaires — work/deadlines, family, romantic relationship, money, mornings, evenings/before sleep, social media, conflict, being alone, tiredness/low sleep, body sensations, news/world events — and a 5-point **intensity scale** (`INTENSITY_LABELS`) from "Whisper" (dormant, awareness 0.2) through "Running my life" (dominant, awareness 0.9), which converts a user's self-reported severity into both a qualitative label and a numeric "awareness" weight used elsewhere in the engine.

### 2.3 Loop Families — The Explainer Layer

`src/data/handbook/loopFamilies.ts` sits one level of abstraction above the raw taxonomy: it defines **12 Loop Families** as a narrative/explainer layer over the 400+/600+ loop library, intended for the Stage Handbook / educational content rather than the tagging system. Each family includes:

- `feels` — first-person phenomenology ("Refreshing notifications. Re-reading sent messages...")
- `neuroscience` — a cited brain-science hook (e.g. "Dopaminergic mesolimbic pathway hijacked by intermittent reinforcement — same circuit as slot machines," citing Lembke's *Dopamine Nation*)
- `exampleIds` — pointers into the raw loop IDs
- `origin` — likely developmental root
- `wayOut` — a single concrete micro-practice
- `pairedPath` — which spiritual path(s) (Karma, Bhakti, Jnana, Tantra, Raja, Kriya) is prescribed as the antidote

Families observed: Validation, Avoidance, Control, Performance, Comparison, Rumination, Spiritual Bypass, Scarcity, Savior, Victim, Addictive, and at least one more beyond the truncated view. This is a genuinely distinctive piece of IP: it fuses pop-neuroscience citations, developmental-origin theory, and classical yogic path prescriptions (Karma/Bhakti/Jnana/Tantra/Raja/Kriya) into a single, consistently-structured explainer schema — a proprietary synthesis rather than a repackage of any single existing framework.

### 2.4 Workplace Loops — Enterprise-Specific Taxonomy

`src/data/workplaceLoops.ts` is a parallel, smaller taxonomy purpose-built for the Enterprise product line, with its own 7-category schema (`identity`, `social`, `time`, `energy`, `decision`, `transition`, `boundary`) and workplace-specific patterns like `WRK_IMPOSTOR` (Impostor Syndrome), `WRK_MEETING_FATIGUE`, `WRK_SUNDAY_DREAD`, `WRK_SLACK_ANXIETY`, `WRK_RTO_RESENT` (return-to-office resentment), `WRK_LAYOFF_TRAUMA`, `WRK_PROMO_PARALYSIS`, `WRK_PERFECTIONISM`, `WRK_PEOPLE_PLEASING`, and more. Each entry ships a 60–90 second in-the-moment micropractice, matching the consumer loop library's format but tuned for corporate life. IDs are stable and namespaced (`WRK_*`) explicitly to support **org-level epidemiology** — i.e. aggregating which loops are most common across an organization's employees, which is core to the Enterprise analytics/reports surfaces (Section 6).

### 2.5 Loop Blog Generation — SEO/Content Leverage

`src/data/loopBlogPosts.ts` is a programmatic content generator: it doesn't hand-author blog posts, it **derives one blog post per loop** directly from the canonical `LOOPS` array, templating sections like "What this loop actually is," "How it shows up in daily life" (bulleted from `manifestations`), and "What sets it off" (bulleted from `triggers`). This means the loop library itself directly and automatically powers hundreds of SEO-indexable blog pages without additional authoring — the taxonomy is simultaneously a clinical/coaching dataset and a content-marketing engine.

### 2.6 Detection & Surfacing

- **User-facing browsing** (`src/pages/Loops.tsx`): a searchable, filterable directory over the full `LOOPS` array, filterable by `LoopCategory` and free-text (matches `name` or `keywords`). Ships its own JSON-LD `CollectionPage` schema for SEO, dynamically stating the live loop count.
- **Detail page** (`src/pages/LoopDetail.tsx`): presumably resolves a loop by slug and renders its full definition (triggers, manifestations, awareness markers, dissolution path — as referenced in the page's SEO description).
- **Conversational detection**: the "Mirror" questionnaire experience uses `loopLibraryCatalog.ts`'s curated catalog as pickable options; the AI/master-matching layer (`masterMatching.ts`, Section 4) also scans free-text chat for loop-adjacent keywords (e.g. crisis keywords, category keywords) to decide which guide/master should respond and which loop-specific content to surface.
- **Cross-linking to practice**: each Loop Family's `pairedPath` and `wayOut` fields connect a detected loop directly to a prescribed practice/path, closing the loop (pun intended) between "what pattern is running" and "what to actually do about it."

---
