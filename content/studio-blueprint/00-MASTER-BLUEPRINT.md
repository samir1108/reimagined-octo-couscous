# THE STUDIO — Master Blueprint v1
**Four pillars of world-class consciousness content for Conscious OS**
Pillars: 🎮 Games · 🎙 Podcasts · 🎵 Music · 🎬 Visuals
Surface: New top-level tab `/studio` (peer of Temple, Guide, Journal)
Production model: **Pre-produced curated library** (you + me hand-craft flagships, exactly like the Instagram reels pipeline)
Status: Plan only. No code in this pass.

---

## 0. NORTH STAR

> "If Headspace, Calm, Pixar, Studio Ghibli, Naval's podcast, and Hans Zimmer's film score division had a single child — that's the Studio."

Three rules everything obeys:
1. **Every asset moves a Dimension Band.** No content for content's sake. A game tunes Attention. A podcast tunes Insight. A music piece tunes Nervous-System. A visual tunes Identity-Recognition.
2. **Pre-produced, not generated-on-the-fly.** Each piece is a flagship — scripted, voiced, mixed, color-graded, QA'd. The engine *picks*; it does not *generate*.
3. **Loop-tagged.** Every asset is tagged with the exact Loop Library IDs (VAL001, EGO001, etc.) it heals. The Consciousness Engine matches asset → user state.

---

## 1. THE NEW TAB — `/studio`

### Information Architecture
```
/studio
├── Hero strip            (today's curated 1 game + 1 podcast + 1 track + 1 visual)
├── 🎮 Games              → /studio/games
├── 🎙 Podcasts           → /studio/podcasts
├── 🎵 Music              → /studio/music
└── 🎬 Visuals            → /studio/visuals
```

### Tab Personality
- **NOT** the Temple (Temple = guru-led practice).
- **NOT** the Guide (Guide = AI conversation).
- Studio = **"the consciousness museum + arcade + concert hall + cinema"** — a place to *consume* world-class crafted artifacts between practice sessions.
- Visual language: warmer than Temple. Black bg + brass/copper accents (not Temple's gold). Slightly more "Apple TV+ catalogue" feel. Cards with motion-poster previews.

### Engine hook
- Studio respects `engine_signals`. The Hero strip is curated by `suggest-studio-pick` (new edge fn) using V-Level + active loops + slot of day + last 3 sessions.
- Every play/listen/view writes to `consciousness_signals` so the engine learns what the user actually finishes.

---

## 2. PILLAR 1 — 🎮 GAMES (Consciousness Mini-Games)

### Philosophy
Games here are **diagnostic instruments disguised as play.** Every interaction produces a measurable signal. No leaderboards, no XP. One game = one inner faculty trained.

### The Launch Slate (12 flagship games)

| # | Game | Faculty Trained | Loops Healed | Session Length | Mechanic |
|---|------|----------------|--------------|----------------|----------|
| G01 | **Witness Tap** | Sakshi Bhav (Witnessing) | VAL003, ATT002 | 60s | Tap when a thought arises. Heat-map output. |
| G02 | **Breath Orb** | Pranayama / Co-regulation | NER001, ANX002 | 3 min | Inhale → orb expands. Hold → orb glows. Exhale → petals fall. Webcam optional HRV. |
| G03 | **Loop Catcher** | Pattern recognition | EGO001, COG004 | 90s | Thoughts float past as bubbles. Tap your *own* recurring loop, ignore decoys. |
| G04 | **The Mirror Match** | Identity dis-identification | ID001, ID003 | 2 min | Card pairs: "I am X" vs "I notice X". Match the *witness* card. |
| G05 | **Mantra Rhythm** | Japa concentration | ATT003, DEV001 | 5 min | Tap the lotus on each Om. Tempo drifts; you stay steady. |
| G06 | **Shadow Tetris** | Shadow integration | SHA001-003 | 4 min | Falling shadow pieces (anger, envy, fear). You don't destroy — you *fit* them in. |
| G07 | **Yantra Trace** | Focused attention | ATT001 | 90s | Trace the Sri Yantra without lifting finger. Heart-rate sway visualized. |
| G08 | **The 4 Paths Quiz-Game** | Path self-knowledge | DNA001 | 7 min | Branching scenarios → Karma/Bhakti/Jnana/Raja affinity scores. |
| G09 | **Koan Doors** | Non-dual cognition | JNA001-004 | 3 min | Walk through a door only when you *stop* trying to answer the koan. Eye-tracking via webcam. |
| G10 | **Heart Coherence Garden** | HRV / Heart-brain | HRT001 | 6 min | Garden grows when breath is coherent. Wilts when erratic. Pure biofeedback. |
| G11 | **Ego Inventory** | Self-honesty | EGO001-005 | 5 min | Drag-drop your ego defenses into glass jars labeled by name. AI commentary. |
| G12 | **Silence Speedrun** | Inner stillness | VAL003 | 60s–10min | The longer you stay literally still + silent, the higher the score. Webcam motion + mic silence detection. |

### Game Production Spec (per game)
Each game ships with:
- **Design doc** (mechanic + win condition + signal output)
- **Art bible** (one consistent illustrator's style — see Visual Pillar)
- **Sound design pack** (4–8 SFX, 1 ambient bed — see Music Pillar)
- **Voice intro** (15s ElevenLabs narration by Modern Guru)
- **Engine adapter** — writes `studio_game_sessions` row with `signals: {attention_score, completion, loop_evidence[]}`
- **Loop tags** (mandatory)

### Tech Stack (later)
- Canvas/WebGL for G01, G02, G07, G10
- React + Framer Motion for G03–G06, G08, G11
- MediaPipe (in-browser, no server) for webcam-based G02, G09, G12

---

## 3. PILLAR 2 — 🎙 PODCASTS (Guru Audio Series)

### Philosophy
This is **Naval × Tim Ferriss × the Bhagavad Gita** — but every voice is one of our 118 masters, every episode is loop-targeted, every listen is logged as a Dimension event.

### The Launch Slate (5 series, 60 episodes)

#### Series 1 — **"Nightcap with the Sage"** (10 × 8min)
Modern Guru sits with a different classical master each episode for a "last conversation before sleep." Played in the Evening gate.
- Ep1: with Ramana — *"Who is the one who fears tomorrow?"*
- Ep2: with Krishnamurti — *"Why your day is not finished even now"*
- Ep3: with Aaji — *"Eat. Bathe. Forgive. Sleep."*
- … (10 total)

#### Series 2 — **"The 4 Paths, Decoded"** (4 × 15min)
One deep-dive per path. For users in onboarding & path-confusion.
- Karma · Bhakti · Jnana · Raja

#### Series 3 — **"Loop of the Week"** (12 × 6min)
One Loop-ID per episode. Anatomy → trigger → exit ramp → micro-practice. Targets the user's most active loop from `consciousness_signals`.
- Pilot 12 cover the top 12 loops by global frequency: VAL001, EGO001, ATT002, ANX002, NER001, ID001, SHA001, COG004, HRT001, DEV001, JNA001, DNA001.

#### Series 4 — **"60-Second Biographies"** (30 × 60s)
The 100+ masters, in pocket form. Auto-played as a "between-practice" interstitial. Same format as the Instagram reels — reusable.

#### Series 5 — **"Field Reports"** (4 × 12min)
Real recorded ambiences + narration. Banaras Ghats at 4am, Tiruvannamalai pradakshina, Himalayan cave, Bangalore monsoon kitchen with Aaji. Used as Yoga Nidra-style closings.

### Episode Production Spec
Every episode ships with:
- **Script (.md)** — stitched, with `[VO]`, `[SFX]`, `[MUSIC IN]`, `[BEAT]` markers
- **Voice cast** — ElevenLabs voice IDs from our master roster (already cloned)
- **Music bed** — pulled from Music Pillar's `beds/` library
- **Cover art** — square 1080×1080 + circular podcast-style
- **Transcript .vtt** — for accessibility + semantic search
- **Loop tags + Dimension targets**
- **Final master MP3** at -16 LUFS (podcast standard)

---

## 4. PILLAR 3 — 🎵 MUSIC (Sacred Soundscapes)

### Philosophy
Not "spa music." This is **scored, scene-aware, V-Level-aware audio** — closer to Hans Zimmer + Nils Frahm + Hariprasad Chaurasia. Every track has a *function*.

### The Launch Library (60 tracks)

| Bucket | Count | Purpose | Length | Example |
|--------|-------|---------|--------|---------|
| **Beds** (under-narration) | 16 | For podcasts, sessions, guide | 3-min loopable | "Brass Drone in F" / "Bansuri Dawn" |
| **Practice Tracks** | 12 | Pranayama, Japa, Kriya | 5/10/20 min | "108 Breaths in C minor" |
| **Witness Tracks** | 6 | Sakshi Bhav practice | 10–25 min | "Black Lake (silent except every 4min)" |
| **Mantras** | 8 | Devotional / Bhakti | 3–7 min | "Om Namah Shivaya — Aaji voice" |
| **Sleep / Yoga Nidra** | 6 | Evening close | 20–45 min | "Monsoon Body Scan" |
| **Ragas (full)** | 6 | Time-of-day correctness | 8–15 min | Bhairav (dawn) · Yaman (dusk) |
| **Soundscapes** | 6 | Pure ambience, no instruments | 30 min | "Banaras 4am" · "Himalayan cave" |

### Composition Rules
- **Key + V-Level pairing**: F-minor & D-minor for V0–3 (heavy loops). C-major / Lydian for V4–6 (clarity). Drone-only for V7+ (formless).
- **Tempo + Slot pairing**: Morning 60–80 BPM. Evening 40–55 BPM. Witness 0 BPM (drone).
- **Instrumentation rotation**: bansuri, tanpura, esraj, Tibetan bowl, felt piano, brass drone, sub-bass, koel/owl/rain field-recordings.
- **Loudness**: -23 LUFS for sleep, -18 for practice, -16 for podcast beds. Locked in MANIFEST.

### Production Pipeline
1. Compose / source via Suno v4.5 + ElevenLabs Music + handpicked stems (already in our pipeline)
2. Mix in ffmpeg with our loudness ladder
3. Tag in `studio_music` table: `{key, bpm, vlevel_range, slot, length_s, instruments[], loops_supported[]}`
4. The engine queries this table — never generates on the fly.

---

## 5. PILLAR 4 — 🎬 VISUALS (Cinematic Library)

### Philosophy
Pixar-grade animated artifacts that the user doesn't *watch* like Netflix — they *sit with* like a yantra. Every visual is a **meditation object**.

### The Launch Library (40 visuals)

| Bucket | Count | Format | Purpose |
|--------|-------|--------|---------|
| **Master Portraits** (animated) | 12 | 1080×1920, 10s loop | The 12 active gurus, breathing, eyes blinking. Used in Temple chat headers. |
| **Animated Yantras** | 8 | 1080×1080, 30s loop | Sri Yantra, Kalachakra, etc. Slowly rotating, particle-fed. For G07 + visualizations. |
| **Loop Visualizations** | 12 | 1080×1920, 60s | Each abstract animation = one loop family. Played on loop-detection. |
| **Hero Films** | 4 | 1080×1920, 60–90s | The 4 Paths, cinematic. Used on Studio hero strip + landing page. |
| **Mood Films** (no narration) | 4 | 1080×1920, 3min | "Banaras Dawn", "Himalayan Cave", "Aaji's Kitchen", "Modern Guru's Balcony" |

### Style Bible (locked)
- **Look D — Spirited Away × Soul** (already locked in Instagram reels MANIFEST). All visuals share this universe.
- Color: deep indigo/obsidian backgrounds, marigold-gold particles, brass/copper highlights.
- Camera: always `camera_fixed: true` unless film calls for a single dolly.
- Aspect: 9:16 default (mobile-first), 1:1 for yantras, 16:9 only for hero films on desktop.

### Production Pipeline (mirrors current Reels pipeline)
1. Keyframes via `imagegen--generate_image` (Look D prompt template)
2. Animate via `videogen--generate_video` (10s clips, stitched in ffmpeg)
3. Soundtrack pulled from Music Pillar
4. Manifest entry: `{loop_tags[], vlevel_range, slot, master_id?}`

---

## 6. SHARED INFRASTRUCTURE

### 6.1 Database (4 new tables)
- `studio_assets` — universal: `id, pillar('game'|'podcast'|'music'|'visual'), title, loops_tags[], vlevel_min, vlevel_max, slot, length_s, file_url, manifest_json`
- `studio_plays` — `user_id, asset_id, started_at, completed_at, signals jsonb`
- `studio_game_sessions` — game-specific signals
- `studio_picks` — daily curated pick per user (cached)

### 6.2 New Edge Function
- `suggest-studio-pick` — given user_id + slot, returns 4 asset IDs (one per pillar). Reads `engine_signals`, `consciousness_signals`, `studio_assets`. Pure SQL + lightweight Groq re-rank.

### 6.3 Reused Infrastructure
- ElevenLabs TTS edge fn (already deployed)
- ElevenLabs Music + SFX
- imagegen + videogen
- Razorpay credits (Studio = free for daily pick, premium archive = credit-gated)

### 6.4 Folder Layout (under `content/studio/`)
```
content/studio/
├── MANIFEST.json
├── games/
│   └── G01-witness-tap/
│       ├── design.md
│       ├── art/
│       └── sfx/
├── podcasts/
│   └── series-1-nightcap/
│       ├── ep01-ramana/
│       │   ├── script.md
│       │   ├── voice-master.mp3
│       │   ├── final-master.mp3
│       │   └── cover.png
├── music/
│   ├── beds/
│   ├── practice/
│   └── …
└── visuals/
    ├── portraits/
    ├── yantras/
    └── films/
```

---

## 7. CURATION ENGINE (how the user actually meets this content)

```
Time of day → Slot
Active loops → Loop tags
V-Level band → vlevel_range filter
Last 3 plays → diversity filter (don't repeat pillar)
                ↓
       suggest-studio-pick
                ↓
   { game, podcast, music, visual }
                ↓
   /studio Hero strip + push to Temple Quick Actions
```

Plus: every Temple session-end screen offers ONE relevant Studio pick ("After this practice, sit with this 6-min track.").

---

## 8. MVP CUT (what ships first if budget = 1)

If we must launch with the smallest credible set:
- **3 games**: G01 Witness Tap, G02 Breath Orb, G03 Loop Catcher
- **1 podcast series**: Series 4 "60-Second Biographies" × 12 episodes (cheapest, reuses Reels pipeline 1:1)
- **12 music tracks**: 6 beds + 3 practice + 3 witness
- **8 visuals**: 4 master portraits + 4 yantras
- **1 edge function**: `suggest-studio-pick`
- **1 new tab + 4 sub-routes**

This MVP alone is ~4–6 weeks of curated production at our current pipeline speed.

---

## 9. PRODUCTION ORDER (recommended sequence per chat)

We work the same way as the Reels: **one asset per chat**, fully shipped to disk.

Round 1 — Foundation
1. `studio/MANIFEST.json` + folder skeleton + `/studio` tab scaffold (UI shell only, no engine)
2. DB migration: 4 tables + RLS

Round 2 — Music (build the library first; everything else needs it)
3. 6 Beds
4. 3 Practice Tracks
5. 3 Witness Tracks

Round 3 — Visuals
6. 4 Master Portraits (animated)
7. 4 Yantras

Round 4 — Podcasts
8–12. 60-Second Biographies × 12 (5 chats, 2-3 per chat)

Round 5 — Games
13. G01 Witness Tap
14. G02 Breath Orb
15. G03 Loop Catcher

Round 6 — Engine
16. `suggest-studio-pick` edge fn + Hero strip wiring
17. Temple session-end → Studio handoff

---

## 10. WHAT MAKES THIS WORLD-CLASS (the bar)

Each pillar has a single comparable to beat:
- **Games** beat: *Alto's Odyssey* (feel) × *Headspace SOS* (function)
- **Podcasts** beat: *On Being* (depth) × *Naval* (density) × *Calm Sleep Stories* (production)
- **Music** beat: *Nils Frahm — All Melody* × *Hans Zimmer — Dune* × *Hariprasad Chaurasia — Call of the Valley*
- **Visuals** beat: *Spirited Away* (style) × *Soul* (color) × *Studio Ghibli short films* (silence)

If a piece doesn't measurably approach its comparable, it doesn't ship. Period.

---

## 11. OPEN DECISIONS (need your call before we start Round 1)

1. **Tab name**: "Studio" / "Library" / "Sanctum" / "The Hall" — your pick.
2. **Free vs paid split**: daily curated 4-pick free, full archive credit-gated? Or all free, credits only for "AI-personalized version" of a track/episode?
3. **First pillar to actually start producing** after this blueprint: I recommend **Music** (everything else depends on it). Confirm?
4. **Voice cast lock-in**: are we OK using the existing 13 cloned ElevenLabs voices for podcasts, or do you want me to spec 5 new voices (Sage, classical-master generic, narrator, child-voice, elder-male)?

---

*End of Master Blueprint v1. Next chat: confirm the 4 open decisions, then we begin Round 1.*
