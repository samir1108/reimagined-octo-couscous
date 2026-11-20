# THE MASTER REEL BIBLE — 485 Reels, Disney-Tier, "This Is For Me"
**Version 1.0 · Locked · Read this before generating any reel**

This is the single source of truth that the AI follows to develop every reel.
If a reel cannot pass every gate in this bible, it is killed and re-rendered. No exceptions.

---

## 0. The North Star (read this every time before you render)

> A 19-year-old in a Pune hostel at 1:43 AM should pause her thumb mid-scroll and whisper *"this is literally me."* That is the only KPI.
> Disney/Pixar didn't beat the world by being expensive. They beat it by **specificity + restraint + one real emotion per minute.** We do the same.

---

## 1. The 485-Reel Pillar Map (locked)

| Pillar | Reels | Theme | Function | Hero protagonist(s) |
|---|---:|---|---|---|
| **P1 — Loops You Live In** | 150 | 100+ canonical loop IDs (VAL, EGO, AVD, CMP, ATT, CTL, IDN, SRV, HAB, BHV, MOT, SOC) | The mirror. Tag a friend. | All 12 |
| **P2 — 11 Bands of Consciousness** | 110 | Sleeper → Absolute (20 deep on Sleeper, 15 each on next 6, then tapering) | The map. Where am I? | Mostly Samir, Aaji, Sage |
| **P3 — Practices** | 90 | Observation, Self-Inquiry, Karma, Bhakti, Jnana, Raja, Kriya, Tantra | The tools | Per-practice teacher avatars |
| **P4 — Ancient × Modern** | 45 | Patanjali ↔ fMRI, Upanishads ↔ neuroplasticity | Authority | Modern Guru + Sage |
| **P5 — What is Consciousness** | 30 | The big questions | Wonder / hook | Sage, Aaji |
| **P6 — Problems on the Path** | 30 | Dark night, spiritual ego, bypassing, plateau | Companion | Vikram, Modern Guru |
| **P7 — Inside ConsciousOS** | 30 | Engines, IP, frameworks revealed | Product reveal | Founder POV (Samir) |
| **P8 — 13 Gurus + Founder's Journal** | — *(replaced)* | See P8' below | Lineage + behind-the-scenes | Modern Guru, Samir |
| **P8' (new) — 13 Gurus & Founder's Journal** | 30 | Each guru gets 2 reels (lineage); 4 founder vlogs | Brand depth | All gurus + Samir |
| **TOTAL** | **515 budgeted → 485 published** | 30 killed at QA gates | | |

> Why 485 and not exactly 300: you said "300+". 485 is the tight version of the original 415-piece plan converted to **reels-only** (per your last instruction). 300 is the floor; 485 is what we ship if every gate passes.

---

## 2. The Cast — 12 Locked Protagonists (8 Indian + 4 Global)

Real people the audience will recognize across hundreds of reels. Same face, same voice, same wardrobe — every time.

| # | Name | Age | Origin | Looks | Loop families | Lock-sheet status |
|---|---|---:|---|---|---|---|
| 1 | **Samir** | 26 | Bangalore (Indian) | Lean, hoodie, tired eyes | Validation, Avoidance | ✅ shipped |
| 2 | **Vikram** | 38 | Mumbai (Indian) | Salt-pepper hair, BMW | Ego, Control | ✅ shipped |
| 3 | **Anjali** | 28 | Bangalore (Indian) | Soft features, oversized tee | Validation, Social | ✅ via R005 |
| 4 | **Arjun** | 28 | Bangalore (Indian) | Glasses, kurta-tee | Comparison, Identity | ⏳ to build |
| 5 | **Priya** | 34 | Mumbai (Indian) | Working mother, kitchen | Attachment, Behavioral | ⏳ to build |
| 6 | **Diya** | 21 | Pune hostel (Indian) | Student, hoodie, laptop | Identity, Social | ⏳ to build |
| 7 | **Aaji** | 68 | Pune (Indian) | Grey braid, sari | Motivation, Wisdom | ⏳ to build |
| 8 | **Modern Guru** | 26 | Rishikesh (Indian) | Bridge avatar, beads + hoodie | Bypassing, integration | ⏳ to build |
| 9 | **Sage** | mythic | Himalayan archetype | White beard, Padmasana | P4, P5, P6 | ⏳ to build |
| 10 | **Maya** | 31 | London (NRI/global) | Therapist, blazer | Western seekers | ⏳ to build |
| 11 | **Daniel** | 35 | NYC (global, white) | Burnt-out PM | Engineer, Ego | ⏳ to build |
| 12 | **Yuki** | 24 | Tokyo (global, Japanese) | Designer, minimal | Identity, Comparison | ⏳ to build |

**Why mix global protagonists:** loops are universal, but a Bangalore audience cannot self-identify with *only* Bangalore stories. Maya, Daniel, Yuki widen the mirror without diluting Indian roots (8 of 12 are Indian).

**Action this week:** Generate 9 missing lock sheets in one batch (~27 cr, 1 evening). After that, no character ever drifts.

---

## 3. The Disney Spec — Non-Negotiable Per Reel

```text
PICTURE
  format       9:16  ·  1080×1920  ·  24fps
  length       60s LOCKED (58–62s acceptable, 60.0s target)
               structure: 12 clips × 5s = 60s, OR 6 clips × 10s = 60s
  LUT          warm-tungsten foreground + cool-window background (signature)
  lighting     Roger Deakins brief in every keyframe prompt
  reference    Lock sheet ALWAYS passed as image_paths (no drift)

SOUND  (this is the Disney layer everyone skips)
  VO           ElevenLabs Turbo v2.5 · stability 0.55 · style 0.4
               request-stitching across paragraphs for prosody
  music        ONE melodic stem (lo-fi piano / cello drone / sitar / koto)
  ambience     ONE environmental bed (rain, café, traffic, fan, temple bell)
  SFX          ONE punctuation hit on the "oh shit" beat
               (Tibetan bowl, clock click, breath, shutter)
  mix          VO -3dB · music -18dB ducked · ambience -24dB · SFX -6dB peak
  silence      EVERY reel earns ≥1.5s of dead air before the turn

CAPTIONS  ("captions below" — your spec)
  font         Anton 140pt, real TTF bundled into ffmpeg fontconfig
  color        white body, gold (#FFB800) on stressed word
  position     Y = 82% (below face, above safe zone)
  rhythm       2–3 words per card, kinetic pop-in (scale 0.85→1.0, 120ms)
  contrast     readable at 50% phone brightness in sunlight

CLOSING (signature handoff — never "follow for more")
  - Loop ID named ("That's EGO001")
  - One real next move ("Send to one person who gets it")
  - Handle bottom-right, last 6 frames only
```

---

## 4. The 11-Gate QA Checklist (every reel, no exceptions)

1. Hook screenshotable in first 3 frames
2. Specificity anchors ≥3 (time + place + object)
3. Loop named with exact library ID
4. ≥1.5s silence present
5. "Oh shit" beat lands by 0:24
6. Captions readable at 50% brightness
7. VO peaks never clip (-3dBFS)
8. Music ducks under VO automatically
9. Character matches lock sheet (eyeball test)
10. Closing gives real next move
11. **Send-to-one-friend test:** the writer must name the friend before shipping

≥9 of 11 pass at avg ≥9/10 → ship. Else → kill or re-render.

---

## 5. The "This Is For Me" Formula (the Pixar trick)

Every reel must contain **all four** of these or it is killed:

```text
1. TIME ANCHOR    — exact hour ("11:47 PM", "1:03 AM", "Tuesday 3:08 AM")
2. PLACE ANCHOR   — exact micro-location ("hostel bunk", "Eastern Express Highway", "kitchen counter, lights off")
3. OBJECT ANCHOR  — one tactile object the audience owns ("Apple Watch", "phone face-down", "cold chai")
4. INTERIOR LINE  — a thought no one says out loud ("If only they meditated like me")
```

Specificity is the trick. The *more* specific, the *more* universal it feels.

---

## 6. The "Oh Shit" Beat — Disney's Real Weapon

Every reel earns one line that **flips the meaning**.

| Loop family | Surface story | Oh shit beat |
|---|---|---|
| VAL004 (refresh) | "I check the post 14 times" | "I'm not checking likes. I'm checking if I exist." |
| EGO001 (spiritual ego) | "I do the work, they don't" | "Maybe the unconscious driver is the mirror I'm avoiding." |
| AVD133 (mother invisibility) | "Everyone needs me" | "I disappeared so well, I forgot to come back." |
| CMP008 (founder comparison) | "His Series A. My nothing." | "I'm not jealous of his round. I'm jealous of his peace." |
| IDN005 (student performance) | "I post the cool version" | "I'm rehearsing a person I haven't met yet." |

Without the flip, it's a vlog. With the flip, it's Pixar.

---

## 7. Production Pipeline (~7 min wall-clock per reel)

```text
brief.md
  ↓
6 keyframes  ──parallel──  edit_image w/ lock sheet (2 cr each)
  ↓
5 video clips ─parallel──  videogen 480p, image-to-video (~5 cr each)
  ↓
VO            ──parallel── ElevenLabs TTS, request-stitched
music + amb   ──parallel── ElevenLabs music + sfx
  ↓
ffmpeg assembly
  - concat clips
  - mix 4 audio stems with auto-ducking
  - burn captions (Anton TTF, gold-highlight)
  ↓
auto-QA (11-gate) → eyeball QA → ship
  ↓
content/wave{N}/R{NNN}/R{NNN}-final.mp4 + receipt.json
```

---

## 8. Credit Budget — 485 Reels

| Line item | Per reel | × 485 | Notes |
|---|---:|---:|---|
| Keyframes (6 × edit_image w/ lock) | 12 cr | 5,820 | 2 cr each via edit |
| Video clips (5 × 5s, 480p draft) | 10 cr | 4,850 | top 80 upscaled to 1080p (+800 cr) |
| VO (ElevenLabs Turbo) | 1 cr | 485 | |
| Music + ambience | 1 cr | 485 | |
| ffmpeg assembly | 0 | 0 | local |
| **Subtotal** | **24 cr** | **11,640** | |
| Lock sheets (9 × 3 cr, one-time) | — | 27 | amortized |
| 1080p hero upscales (top 80) | — | 800 | |
| Buffer (kills, re-renders) | — | 533 | 4.4% |
| **TOTAL** | | **~13,000 cr** | over 12 weeks |

> If 13,000 cr is too rich, the cheap version is **300 reels at ~24 cr = ~7,200 cr total**. Same spec, smaller volume.

---

## 9. Cadence — 12 Weeks, 5 Reels/Day

| Week | Reels | Focus |
|---|---:|---|
| 1 (now) | 10 | R005–R014 (Wave 2 hero — proves the spec) |
| 2 | 35 | P1 Loops batch 1 (Founder + Student domains) |
| 3 | 35 | P1 Loops batch 2 (Mother + Engineer domains) |
| 4 | 40 | P1 Loops batch 3 + first P2 Bands |
| 5 | 40 | P2 Bands (Sleeper deep — 20 reels) |
| 6 | 40 | P3 Practices wave 1 |
| 7 | 40 | P3 Practices wave 2 + P4 Ancient×Modern |
| 8 | 45 | P4 + P5 What is Consciousness |
| 9 | 45 | P6 Problems on the Path |
| 10 | 45 | P7 Inside ConsciousOS |
| 11 | 50 | P8' Gurus + Founder's Journal |
| 12 | 60 | Series finales + best-of compilations |

Daily post schedule (IST): **7:30 AM · 10 AM · 1 PM · 8 PM · 11:30 PM**

---

## 10. The Five Invisible Disciplines (why it'll feel A24, not AI slop)

1. **Same face every time** — character lock sheets passed as image_paths
2. **Same caption signature** — Anton 140pt gold-highlight at Y=82% across 485 reels
3. **Same breath** — every reel earns ≥1.5s silence before the turn
4. **Same LUT** — warm tungsten + cool window, baked into every keyframe prompt
5. **Same handoff** — loop ID named + real next move + handle, never "follow for more"

Audiences don't notice these consciously. They notice the *cumulative feeling* of "this studio knows what they're doing."

---

## 11. What I Need From You — One Decision

Pick the start path:

**A) Tonight (~75 cr):** Generate the 9 missing lock sheets + render R006 (Vikram, EGO001) as the new gold-standard reference using every upgrade in this bible. Validates the pipeline at full quality.

**B) This week (~250 cr):** Lock sheets + R006–R010 batch (5 reels across 4 domains). Proves the cadence works.

**C) Conservative (~7,200 cr total):** Drop to 300 reels total instead of 485. Same spec, smaller volume.

Reply with **A**, **B**, or **C** and I start.

---

## 12. NEW EDUCATIONAL EXPANSION (added on user request) — +220 reels

You wanted teaching reels too: Observation (Krishnamurti-style), 4 paths of yoga with levels, Self-Inquiry, and 60s biographies of 100+ masters. These slot into existing pillars and expand the total to **705 reels** (or stay at **485** by reducing P1 Loops).

### 12a. P3' — Observation (J. Krishnamurti lineage) — 15 reels
| # | Topic | Hero |
|---|---|---|
| 1 | What is Observation? (no observer/observed split — JK's core) | Modern Guru |
| 2 | Why thought cannot observe thought | Sage |
| 3 | Choiceless awareness — Level 0 | Modern Guru |
| 4 | Observing the body — Level 1 | Anjali |
| 5 | Observing emotion in real-time — Level 2 | Priya |
| 6 | Observing thought without naming — Level 3 | Arjun |
| 7 | Observing the observer — Level 4 (the JK trap) | Sage |
| 8 | The space between two thoughts — Level 5 | Modern Guru |
| 9 | Observation in conflict (a fight with your partner) | Vikram |
| 10 | Observation while scrolling | Diya |
| 11 | Observation while eating | Aaji |
| 12 | Observation in grief | Maya |
| 13 | Common mistakes (effort, suppression, dissociation) | Modern Guru |
| 14 | Observation vs meditation — the distinction nobody draws | Sage |
| 15 | Daily 5-min observation protocol | Modern Guru |

### 12b. P3'' — The 4 Paths of Yoga (with levels) — 32 reels (8 per path)
| Path | Reel arc |
|---|---|
| **Karma Yoga** (action) | What it is · L1 surrender of result · L2 action without doer · L3 work as worship · L4 burning seeds · L5 mastery (Gandhi/Vivekananda) · 1 modern story · 1 trap |
| **Bhakti Yoga** (devotion) | What it is · L1 ritual · L2 emotional surrender · L3 personal deity · L4 formless love · L5 union (Mirabai/Ramakrishna) · 1 modern story · 1 trap |
| **Jnana Yoga** (knowledge) | What it is · L1 study · L2 discrimination · L3 neti-neti · L4 self-inquiry · L5 abidance (Ramana/Nisargadatta) · 1 modern story · 1 trap |
| **Raja Yoga** (8 limbs) | What it is · L1 yama-niyama · L2 asana · L3 pranayama · L4 pratyahara · L5 dharana-dhyana-samadhi (Patanjali) · 1 modern story · 1 trap |

### 12c. P3''' — Self-Inquiry (Atma Vichara) — 12 reels
1. What is "Who am I?" (Ramana's method)
2. The wrong way (mental answers)
3. The right way (tracing the I-thought to source)
4. Self-inquiry vs affirmation
5. Self-inquiry vs witnessing
6. When the I-thought dissolves (the gap)
7. Returning thoughts and how to handle them
8. Self-inquiry in anger
9. Self-inquiry at 3 AM (insomnia version)
10. Self-inquiry vs Vipassana (key difference)
11. Common traps (intellectualizing, spiritual ego)
12. 21-day self-inquiry protocol

### 12d. P9 — 100+ Master Biographies (60s each) — 108 reels
A signature series. Each reel: master's face, one core teaching, one human moment, one "why they matter to you in 2026."

**Tier 1 — Foundational (24 masters)**
Patanjali · Adi Shankara · Buddha · Mahavira · Ramana Maharshi · Nisargadatta Maharaj · Ramakrishna · Vivekananda · J. Krishnamurti · Osho · Sri Aurobindo · The Mother · Yogananda · Sivananda · Vyasa · Kabir · Mirabai · Tulsidas · Guru Nanak · Lao Tzu · Zhuangzi · Bodhidharma · Dogen · Hui Neng

**Tier 2 — Tantra & Kashmir Shaivism (12)**
Abhinavagupta · Lalleshwari · Gorakhnath · Matsyendranath · Vasugupta · Utpaladeva · Kshemaraja · Daya Mata · Anandamayi Ma · Karunamayi · Amma · Ma Anandamayi

**Tier 3 — Tibetan & Zen (16)**
Padmasambhava · Milarepa · Tilopa · Naropa · Marpa · Dilgo Khyentse · Chögyam Trungpa · Dudjom Rinpoche · Hakuin · Bankei · Ikkyu · Suzuki Roshi · Thich Nhat Hanh · Dalai Lama · Pema Chödrön · Tara Brach

**Tier 4 — Sufi & Mystics (12)**
Rumi · Hafiz · Ibn Arabi · Al-Ghazali · Bulleh Shah · Bahauddin · Meher Baba · Hazrat Inayat Khan · Khwaja Moinuddin Chishti · Mansur al-Hallaj · Rabia · Shams of Tabriz

**Tier 5 — Modern Bridges (16)**
Eckhart Tolle · Adyashanti · Mooji · Rupert Spira · Sadhguru · Sri Sri Ravi Shankar · Deepak Chopra · Jon Kabat-Zinn · Sam Harris · Ken Wilber · Andrew Cohen · Jack Kornfield · Sharon Salzberg · Joseph Goldstein · Daniel Goleman · Robert Wright

**Tier 6 — Lesser-known but transformative (28)**
Sri Anandamayi · Neem Karoli Baba · Papaji · Robert Adams · Jean Klein · Francis Lucille · Wei Wu Wei · Douglas Harding · Bernadette Roberts · U.G. Krishnamurti · Krishna Prem · Swami Rama · Swami Satyananda · Acharya Rajneesh · Bhagwan Das · Ram Dass · Alan Watts · Aldous Huxley · Joseph Campbell · William James · Carl Jung · Stanislav Grof · John Welwood · A.H. Almaas · Hameed Ali · Reggie Ray · Judith Blackstone · Loch Kelly

> Format per master: 12s hook ("He sat in a cave for 17 years") · 30s teaching · 12s human moment · 6s "why this matters today" + handle.

### 12e. Updated totals

| Pillar | Reels |
|---|---:|
| P1 Loops | 150 |
| P2 Bands | 110 |
| P3 Practices (existing) | 90 |
| P3' Observation NEW | 15 |
| P3'' 4 Paths NEW | 32 |
| P3''' Self-Inquiry NEW | 12 |
| P4 Ancient × Modern | 45 |
| P5 What is Consciousness | 30 |
| P6 Problems on the Path | 30 |
| P7 Inside ConsciousOS | 30 |
| P8' Gurus + Founder | 30 |
| **P9 Master Biographies NEW** | **108** |
| **TOTAL** | **682 reels** |

### 12f. Updated budget (60s locked, 12 × 5s clips per reel)

| Volume | Per reel | Total credits |
|---|---:|---:|
| 682 reels (full) | ~38 cr | **~26,000 cr** |
| 485 reels (medium) | ~38 cr | ~18,500 cr |
| 300 reels (lean) | ~38 cr | ~11,500 cr |

> Master biographies are **cheaper than narrative reels** (~28 cr each) because they reuse one keyframe + 6 archival-style stills + simple Ken Burns motion. So 108 biographies cost ~3,000 cr, not 4,100.

### 12g. New cadence (16 weeks instead of 12)

- Weeks 1–3: Wave 2 + lock sheets (45 reels)
- Weeks 4–7: P1 Loops (150 reels — the mirror)
- Weeks 8–9: P3' + P3'' + P3''' (59 reels — the practices)
- Weeks 10–12: P9 Master Biographies (108 reels — the lineage)
- Weeks 13–14: P2 Bands + P4 Ancient×Modern (155 reels)
- Weeks 15–16: P5 + P6 + P7 + P8' (120 reels)
- Final week: best-of compilations + series finales

