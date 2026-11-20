# 🌌 CONTENT UNIVERSE — 500 REELS PLAYBOOK
**Mission:** Raise human consciousness, one reel at a time.
**Bar:** Every reel must feel like *"this is about me"* — a mirror, not a megaphone.
**Source of Truth:** This file + `00-MASTER-PLAYBOOK.md` (production spec) + `03-PROTAGONISTS.md` (characters).

---

## 0. THE NORTH STAR

> *"We are not making content. We are building a 500-piece mirror — so that 1 billion humans can see themselves clearly, recognize the loops they live in, and remember they are not the loop."*

**3 Promises to the viewer (every reel must keep at least one):**
1. **RECOGNITION** — "Holy shit, that's me."
2. **RELIEF** — "Wait, I'm not broken / not alone."
3. **REMEMBRANCE** — "There's a way out, and humans have known it for 5000 years."

**The 5 Laws (locked from Master Playbook):**
1. ONE feeling per reel (not two).
2. SPECIFIC protagonist + specific time + specific object.
3. Word-by-word kinetic captions, Anton 140pt, Gold (#FFD700) highlight, 52% from top.
4. Mandatory silence ≥1.5s before the turn.
5. Loop ID from the canonical `loopLibraryCatalog.ts` — never invented.

---

## 1. THE 8 PILLARS (500 reels total)

| # | Pillar | Count | Purpose | Audience State |
|---|--------|-------|---------|----------------|
| **P1** | **The Loops You Live In** | **150** | Mirror — recognize unconscious patterns | Asleep / Curious |
| **P2** | **The 11 Bands of Consciousness** | **110** | Map — show the journey terrain | Awakening |
| **P3** | **The Practices** (Observation, Self-Inquiry, Breath, Karma, Bhakti, Jnana, Raja, Kriya, Tantra) | **90** | Tools — actual practice content | Practicing |
| **P4** | **Ancient × Modern** (Sanskrit + Neuroscience) | **45** | Authority — 5000 years meets 5 years of fMRI | Skeptical |
| **P5** | **What Is Consciousness?** (Big Questions) | **30** | Wonder — open the cosmic doorway | Philosophical |
| **P6** | **The Problems You'll Face** (on the path) | **30** | Companion — normalize the dark night | On the path |
| **P7** | **Inside ConsciousOS** (App, Engines, IP) | **30** | Product — the anti-app reveal | Convinced |
| **P8** | **The 13 Gurus / Founders Journal** | **15** | Soul — voice of the maker | Loyal |

**Total: 500.** Distribution honors the funnel: most viewers are asleep, so P1 is the largest gate.

---

## 2. PILLAR-BY-PILLAR BLUEPRINT

### 🪞 P1 — THE LOOPS YOU LIVE IN (150 reels)

**Source:** `src/data/loopLibraryCatalog.ts` (84 canonical loops). We pick the **top 100 by relatability**, then write 1–2 reels per loop = 150.

**Categories (with target counts):**
| Category | Loops | Reels |
|---|---|---|
| Achievement & Validation | AC001–AC012 | 22 |
| Comparison & Social Media | CMP001–CMP010 | 18 |
| Caregiver / People-Pleasing | CAR001–CAR012 | 18 |
| Fear & Anxiety | FEAR001–FEAR010 | 16 |
| Ego & Identity | EGO001–EGO010 | 14 |
| Attachment & Loss | ATT001–ATT008 | 12 |
| Value & Worth | VAL001–VAL008 | 12 |
| Romantic / Intimacy | ROM001–ROM006 | 10 |
| Money & Scarcity | MON001–MON006 | 10 |
| Spiritual Bypass | SB001–SB005 | 8 |
| Phone / Dopamine / Doom | DOP001–DOP006 | 10 |

**Reel formula (60s):**
```
0–3s   HOOK     specific image + 3-line screenshotable caption
3–10s  TRIGGER  the moment the loop fires
10–25s SPIRAL   the unconscious mechanic (show, don't tell)
25–35s COST     what this loop is taking from your life
35–40s SILENCE  ≥1.5s — let it land
40–55s TURN     the 1 awareness that breaks it (loop name reveal)
55–60s CTA      "Your loop ID: ___ — meet it in ConsciousOS"
```

**Protagonists rotation (4 → expanding to 8):**
- Existing 4: **Samir** (founder, 28), **Arjun** (employee, 26), **Priya** (mom, 34), **Diya** (student, 21)
- **NEW 4 to add:**
  - **Vikram** — 42, divorced dad, finance director, midlife
  - **Meera** — 38, freelance creative, single, comparison loop expert
  - **Rohan** — 19, college dropout, gaming/dopamine loops
  - **Anjali** — 55, empty-nester, identity dissolution

→ 8 protagonists × ~19 reels each = balanced library.

---

### 🌀 P2 — THE 11 BANDS OF CONSCIOUSNESS (110 reels)

**Source:** `src/types/consciousness.ts` — Bands 0–10 with micro-levels (entering/deepening/mastery).

**Structure: 10 reels per band (Bands 0–6 = human journey, deeper coverage) + 4 reels per band (7–10 = transcendent, lighter coverage):**

| Band | Name | Reels | Series |
|---|---|---|---|
| 0 | The Sleeper | **20** | "Are you asleep?" diagnostic series |
| 1 | The Questioner | 12 | "The first crack" |
| 2 | The Observer | 12 | "Catching yourself" |
| 3 | The Alchemist | 12 | "Pain as teacher" |
| 4 | The Navigator | 10 | "Choosing for the first time" |
| 5 | The Architect | 10 | "Building reality" |
| 6 | The Channel | 10 | "Life lives me" |
| 7 | The Rishi | 6 | "What awakening actually feels like" |
| 8 | The Jagadguru | 6 | "Universal compassion" |
| 9 | The Avatar | 6 | "Cosmic consciousness — not metaphor" |
| 10 | The Absolute | 6 | "Shunya — only ONE exists" |

**Per-band reel template:**
- Reel 1: "Signs you are at this band" (diagnostic)
- Reel 2: "What this band feels like from the inside" (POV)
- Reel 3: "The trap of this band" (stuck-point)
- Reel 4: "The graduation moment" (next band glimpse)
- Reel 5–10: real protagonist stories at that band

**Sleeper deep series (20 reels):** Because 80% of audience starts here.
- "5 signs you're a sleeper" / "Sleeper at work" / "Sleeper in love" / "Sleeper as a parent" / etc.

---

### 🧘 P3 — THE PRACTICES (90 reels)

**Source:** `src/types/practices.ts` — 18 practices across Core/Path/Specialty.

| Practice | Levels | Reels | Series Title |
|---|---|---|---|
| Observation | 7 | 12 | "Levels of seeing" |
| Self-Inquiry | 6 | 10 | "Who is asking?" |
| Breath | 5 | 8 | "Before thought, breath" |
| Witnessing | 5 | 6 | "Sakshi Bhav" |
| Body Awareness | 5 | 6 | "The body knows first" |
| Bhakti | 5 | 8 | "Love as path" |
| Karma Yoga | 5 | 8 | "Action without owner" |
| Jnana | 6 | 8 | "Neti Neti — not this, not this" |
| Raja Yoga | 8 | 8 | "8 limbs, 8 reels" |
| Kriya | 7 | 4 | "The forbidden technique" |
| Tantra | 5 | 4 | "Tantra is NOT what you think" |

**Per-practice reel template:**
- "What is [practice]" (60s explainer, cinematic)
- "Level 1 → Level 7 in 60 seconds" (progression visual)
- 1 reel per level (POV demonstration)
- "The trap of [practice]" (failure mode)
- "Why I gave up [practice] for 3 years" (vulnerable founder POV)

---

### 📜 P4 — ANCIENT × MODERN (45 reels)

**Source:** `content/pillar-03-ancient-x-neuroscience.md`

**Format:** Split-screen — left: ancient text in Sanskrit/Devanagari + translation. Right: modern fMRI / neuroscience finding. Voice ties them together.

Examples:
- "Patanjali knew about the Default Mode Network 2300 years ago"
- "Vagus nerve = Sushumna nadi"
- "Polyvagal theory = 3-Gunas (Sattva/Rajas/Tamas)"
- "Neuroplasticity = Samskara"
- "Buddha's 'craving' = dopamine prediction error"

**45 = 9 themes × 5 reels each.**

---

### ❓ P5 — WHAT IS CONSCIOUSNESS? (30 reels)

The **wonder** pillar. Big questions, no answers — just openings.

Series:
- "What is awareness, really?" (5)
- "Are you the thinker or the watcher?" (5)
- "What dies when you die?" (5)
- "Is the universe conscious?" (5)
- "Why does anything exist?" (5)
- "The hard problem of consciousness" (5)

**Style:** Slower. Cosmic. Less protagonist, more visual poetry. Use Krishna / Adiyogi / Ramana voice.

---

### 🌑 P6 — THE PROBLEMS YOU'LL FACE (30 reels)

The **dark-night companion** pillar. Normalizes regression, plateau, dark night.

- "Why awareness made things WORSE before better" (3)
- "The plateau that lasts 6 months" (3)
- "Spiritual bypass — you're using awareness to escape" (3)
- "Friends will leave you" (3)
- "You'll feel fake for 90 days" (3)
- "The dark night of the soul" (5)
- "Regression — you'll go backwards. That's the point." (3)
- "Loneliness of waking up" (3)
- "When meditation gives panic attacks" (2)
- "Why your old life will fall apart" (2)

**Tone:** Big-brother honest. Not scary — relieving.

---

### 🛠️ P7 — INSIDE CONSCIOUSOS (30 reels)

**Source:** `documentation/02-product/HOW_CONSCIOUSOS_WORKS.md`, blueprint memories.

The **product reveal** pillar. Show, don't pitch.

| Sub-series | Count |
|---|---|
| The Anti-App philosophy | 4 |
| The 11-Band Spiral Engine (visualized) | 4 |
| The 4-Gates Daily Flow | 4 |
| The Temple (13 Gurus) | 4 |
| The Loop Library (400+) | 3 |
| The Witness Practice (Thought Counter) | 3 |
| Living Theme Engine | 2 |
| Adaptive Level System (no race) | 2 |
| The Mirror (Analytics) | 2 |
| Founder talking-head: "Why I built this" | 2 |

**Format:** Real screen recordings + protagonist POV. Never marketing copy.

---

### 🕉️ P8 — 13 GURUS / FOUNDERS JOURNAL (15 reels)

- 13 reels: 1 per guru — voice, philosophy, who they're for (Krishna, Buddha, Shiva, Ramana, Nisargadatta, Lao Tzu, Patanjali, Adi Shankara, Mahavira, Kabir, Rumi, Mira, Modern Guru)
- 2 reels: Founder Samir's vulnerable journal entries

---

## 3. THE 8 PROTAGONISTS (CHARACTER BIBLE)

Locked specifics for 100% consistency:

| ID | Name | Age | Role | Loop home | Visual signature |
|---|---|---|---|---|---|
| P1 | **Samir** | 28 | Founder, ConsciousOS | Achievement (AC003) | Hoodie, MacBook, 1BHK Bangalore, 2AM lighting |
| P2 | **Arjun** | 26 | Mid-tier employee | Validation (AC012), Comparison (CMP008) | Office shirt, open laptop, Slack tab visible |
| P3 | **Priya** | 34 | Mom of 2, ex-marketing | Caregiver dissolution (CAR012) | Kurta, kitchen counter, kids' toys in frame |
| P4 | **Diya** | 21 | Engineering student | Comparison (CMP001), FOMO (DOP004) | Hostel bed, fairy lights, phone glow on face |
| P5 | **Vikram** | 42 | Divorced dad, finance | Identity (EGO007), Money (MON003) | Suit-no-tie, car, evening highway |
| P6 | **Meera** | 38 | Freelance creative | Comparison (CMP005), Worth (VAL001) | Café, sketchbook, Instagram open |
| P7 | **Rohan** | 19 | College dropout, gamer | Dopamine (DOP001), Avoidance (FEAR007) | Dark room, RGB keyboard, headphones |
| P8 | **Anjali** | 55 | Empty-nester | Caregiver (CAR008), Attachment (ATT004) | Sari, empty kid's room, evening light |

**Distribution rule:** No protagonist appears in more than 22% of reels. Aim for ~19 reels each in P1, balanced across other pillars.

---

## 4. CONSISTENCY ENGINE (the world-class bar)

**Every reel must pass these 10 gates before render:**

1. ✅ **Loop ID gate** — exact ID from catalog (e.g., AC003), human-name resolved
2. ✅ **Protagonist gate** — name, age, location, object specified
3. ✅ **Time gate** — specific hour stated (2:14 AM, not "late night")
4. ✅ **Object gate** — one specific object anchors the reel (the cold chai, the unread Slack, the daughter's drawing)
5. ✅ **Silence gate** — ≥1.5s of pure silence before the turn
6. ✅ **Caption gate** — Anton 140pt, ALL CAPS, Gold #FFD700 word-highlight, 52% from top
7. ✅ **Voice gate** — ElevenLabs voice mapped to protagonist (locked per character)
8. ✅ **Hook gate** — first 3s = screenshotable single sentence
9. ✅ **Turn gate** — the awareness shift is *shown*, not narrated
10. ✅ **CTA gate** — soft, never salesy — "Your loop: ___" or single word like "Notice."

---

## 5. PRODUCTION WAVES (500 reels in 10 waves of 50)

| Wave | Pillar Focus | Reels | Goal |
|---|---|---|---|
| W1 (R001–R050) | P1 Loops (Achievement + Validation) | 50 | Establish mirror |
| W2 (R051–R100) | P1 Loops (Comparison + Caregiver) | 50 | Cover relational loops |
| W3 (R101–R150) | P1 Loops (Fear + Ego + Money + Dopamine) | 50 | Complete loop library |
| W4 (R151–R220) | P2 Bands 0–6 | 70 | The journey map |
| W5 (R221–R260) | P2 Bands 7–10 + P5 Wonder | 40 | Cosmic doorway |
| W6 (R261–R350) | P3 Practices (all 18) | 90 | The toolbox |
| W7 (R351–R395) | P4 Ancient × Modern | 45 | Authority layer |
| W8 (R396–R425) | P6 Problems on path | 30 | Dark-night companion |
| W9 (R426–R455) | P7 Inside ConsciousOS | 30 | Product reveal |
| W10 (R456–R500) | P8 Gurus + Founders Journal + buffer | 45 | Soul layer |

**Cadence target:** 5 reels/day × 100 days = 500. Posting cadence: 2/day = 250 days of feed.

---

## 6. WORKFLOW (per reel — locked)

```
1. BRIEF        (1 min)  — fill schema below, write to /content/wave{N}/R{NNN}/brief.json
2. SCRIPT       (3 min)  — Groq llama-3.3-70b, schema-locked JSON output
3. KEYFRAMES    (5 min)  — 5–6 stills via imagegen, protagonist-locked
4. CLIPS        (10 min) — videogen, image-to-video, 5–10s each
5. VOICE        (3 min)  — ElevenLabs, protagonist-mapped voice
6. CAPTIONS     (5 min)  — Whisper word-timestamps → ASS → ffmpeg burn
7. COMPOSITE    (5 min)  — ffmpeg concat + audio + caption overlay
8. QA           (2 min)  — convert to frames, eyeball every 10th frame
9. SHIP         (1 min)  — write to /mnt/documents/R{NNN}-{slug}.mp4
```

**Per-reel time:** ~35 min. **5 reels/day** = 3 hours of focused production.

### Brief Schema (the source of truth — never skip a field)

```json
{
  "id": "R005",
  "pillar": "P1",
  "title": "the 2am slack i couldn't stop checking",
  "protagonist": "Arjun",
  "loop_id": "AC012",
  "loop_name": "Validation Refresh Loop",
  "band": 0,
  "micro_level": "deepening",
  "specific_time": "2:14 AM",
  "specific_object": "iPhone 13, Slack notification badge: 1",
  "hook_3s": "i refreshed slack 47 times. nothing came.",
  "moment": "Arjun keeps refreshing Slack at 2 AM waiting for his manager's reply to a message sent 6 hours ago.",
  "vo_script_60s": "...",
  "storyboard": [
    { "t": "0–10s", "shot": "..." }
  ],
  "silence_at": "37s",
  "turn_line": "you weren't waiting for a message. you were waiting to feel real.",
  "cta": "Your loop: AC012",
  "music_mood": "low piano, single note repeating",
  "hashtags": ["#ConsciousOS", "#TheWatcher", "#LoopAC012"],
  "voice_id_elevenlabs": "TX3LPaxmHKxFdv7VOQHJ"
}
```

---

## 7. THE BATCH GENERATION STRATEGY

To stay world-class across 500 reels without drift, we **batch-write briefs in groups of 25** before any rendering:

1. **Pre-assign all 500 protagonist × loop × band combos** in a master CSV (`content/instagram-v2/00-FOUNDATION/500-MASTER-INDEX.csv`).
2. **Batch-write 25 briefs at a time** via Groq with schema-locked JSON output.
3. **Founder review pass** on the 25 briefs (≤15 min) — kill any that feel generic.
4. **Render the approved 25** in parallel (5/day for 5 days).
5. **Ship + measure** — track which loop IDs get the most "this is me" comments → double down.

---

## 8. THE 1-BILLION-HUMAN VISION

If 1% of the audience watches the right reel for them → recognizes their loop → opens ConsciousOS → meets a guru → does a 4-minute Witness practice → catches one thought tomorrow…

**That is the entire product.** Each reel is the doorway. The 500 are 500 doorways. Different loops, different bands, different gurus — but every door opens into the same room: *you are not the loop.*

---

## 9. NEXT IMMEDIATE STEPS

1. ✅ Lock this playbook (you're reading it).
2. ⏭️ Build `500-MASTER-INDEX.csv` — every reel pre-assigned (protagonist, loop, band, pillar, wave).
3. ⏭️ Add 4 new protagonist character sheets to `03-PROTAGONISTS.md` (Vikram, Meera, Rohan, Anjali).
4. ⏭️ Generate keyframes for the 4 new protagonists (locked reference images).
5. ⏭️ Batch-write briefs for **R005–R029** (Wave 1 continuation, P1 Achievement loops).
6. ⏭️ Render in production order. Ship 5/day.

---

**This is the playbook. Every reel from R005 onwards must trace back to a row in the master index, and every row must satisfy the 10 consistency gates. No exceptions. No drift. World-class or not at all.**
