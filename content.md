# content.md
## ConsciousOS — Instagram Channel Bible (v1, fresh)
**Purpose:** the single file ConsciousOS reads to render every reel exactly the way R001–R007 were rendered. Improved, consolidated, ship-ready.

---

## 0 · The One Law

> Every reel is a small bet that a stranger, alone with their phone at the worst hour of their day,
> will feel — for 60 seconds — that **someone, somewhere, finally saw them.**

If a reel does not do that → kill it. No LUT, music, or caption polish saves a reel that doesn't see the viewer.

---

## 1 · The Channel — what we're building

- **Handle:** `@consciousos`
- **Cadence:** 7 posts/week × 52 weeks (mix of reels, carousels, voice notes, quote tiles)
- **North star metric:** *saves per 1k impressions* (not likes, not follows). Saves = "someone sees themselves."
- **Forbidden:** influencer talking-head pieces-to-camera, Canva templates, generic "stay positive" content, AI-generated stock B-roll without our LUT.

---

## 2 · The Visual DNA (every single piece carries this)

### Color anchors (locked HEX)
| Token | Hex | Use |
|---|---|---|
| Diya Gold | `#FFB547` | particle warmth, caption highlight |
| 11:47 PM Blue | `#1A2540` | the lonely-but-alive blue |
| Cream Skin | `#F4E8D8` | warm Indian skin tone |
| Sangam Black | `#0A0E1A` | the cinema-where-nobody-watches black |
| Wound Red | `#C73E3A` | sparingly, only at recognition moments |

### Universal motifs (every frame should carry at least one)
1. Drifting gold particles (the "ancient is watching" layer)
2. Phone-screen glow on a face (the modern wound visualized)
3. One real held object (chai cup, Slack notification, sleeping child's hand)
4. One slow zoom into the eyes per reel
5. A visible time-stamp (clock, phone, watch) — we are obsessed with TIME

### LUT (locked, ffmpeg)
```
eq=contrast=1.08:brightness=-0.02:saturation=1.05,
colorbalance=rs=0.08:gs=0:bs=-0.05:rm=0.04:gm=0:bm=-0.03
```
Name: `warm-tungsten-cool-window`. **Do not change without approval.**

### Typography (locked)
- **Captions on reels:** Anton Bold, 140pt ALL CAPS, white #FFFFFF with gold #FFB547 highlight on the spoken word, 4px black stroke, MarginV = 18% (Y ≈ 82%), max 3 words per beat, 80ms scale-in.
- **Carousels / quote tiles:** Fraunces (display) + Inter (body) + Cormorant Garamond italic (Sanskrit/numbers). Never Helvetica/Arial/Times.

### Sound signature (every reel)
- Tanpura drone G3 under everything at -28dB (felt, not heard)
- Real-world ambience (footsteps, fan, traffic, chai pour) at -24dB
- Music bed at -22dB (full level only during silence beats)
- Voiceover at -3dB
- One bowl strike at the recognition frame

---

## 3 · The Cast — 8 locked protagonists

Every reel uses ONE of these. Voice IDs and lock-sheets are in `content/instagram-v2/00-FOUNDATION/MANIFEST.json`.

| Code | Who | Age | City | Loop home | ElevenLabs voice | Visual signature |
|---|---|---|---|---|---|---|
| **SAMIR** | Founder, you | 26 | Bangalore (1BHK Indiranagar) | AC003 / SB001 | Liam `TX3LPaxmHKxFdv7VOQHJ` | Black hoodie, MacBook glow, 2AM warm-yellow desk lamp, exposed brick |
| **ARJUN** | Mid-tier engineer | 26 | Gurgaon | AC012 / CMP008 | Charlie `IKne3meq5aSn9XLyUdCD` | Office shirt rolled, 2 monitors, Slack badge, cold chai |
| **PRIYA** | Mom of two | 34 | Pune | CAR012 / ATT004 | Sarah `EXAVITQu4vr4xnSDxMaL` | Cotton kurta, kitchen island, kids' crayons, hair tied back, 3pm window light |
| **DIYA** | Final-year student | 21 | Bangalore hostel | CMP001 / DOP004 | Lily `pFZP5JQG7iQjIQuC4Bku` | Hostel single bed, fairy lights, phone-glow on face, oversized t-shirt, messy bun |
| **VIKRAM** | Midlife director | 42 | Mumbai (Powai) | EGO007 / MON003 | Brian `nPczCjzI2devNBz1zQrb` | White shirt no tie, BMW driver seat at night, sodium lights, Apple Watch |
| **MEERA** | Illustrator, alone | 38 | Goa | CMP005 / VAL001 | Matilda `XrExE9yKIg1WjnnlVkGX` | Linen shirt, sketchbook, café window, iced coffee, bare feet |
| **ROHAN** | Streamer, dropout | 19 | Hyderabad | DOP001 / FEAR007 | Will `bIHbv24MWmeRgasZH58o` | RGB keyboard, blackout curtains, energy-drink cans, food wrappers |
| **ANJALI** | Empty-nester | 55 | Delhi | CAR008 / ATT004 | Alice `Xb7hH8MSUJpSbSDYk0k2` | Cotton sari, evening living room, son's empty childhood doorway, tea cup |

**Distribution rule:** no protagonist > 22% of reels. Target ~63 reels each.

**Consistency gate (every keyframe must contain):**
1. Named visual signature ✓
2. Named specific object ✓
3. Named lighting / time-of-day ✓
4. Named city marker (window view, accent, prop) ✓

Miss any one → **regenerate the keyframe**. No exceptions.

---

## 4 · The R001 Storytelling Recipe (8-shot template)

Every cinematic reel follows this 8-shot arc (proven on R001 "The Wednesday I Quit ₹42 Lakhs"):

| Shot | Time | Beat | What it does |
|---|---|---|---|
| 1 | 0:00–0:06 | **HOOK** | A specific number + a specific moment (e.g., "1:1 with CTO, 4PM Wednesday"). Slow push-in on one object. |
| 2 | 0:06–0:13 | **THE WORLD** | Establishing tracking shot. The world subtly shifts (fluorescent → diya, glass → temple stone). |
| 3 | 0:13–0:20 | **THE INCIDENT** | The real-world thing happens. Hands on object. We don't see the face yet. |
| 4 | 0:20–0:28 | **THE CINEMATIC PAUSE** | Time freezes. Gold marigold particles assemble into something/someone (grandfather, guru, future-self). 1.5s+ silence. |
| 5 | 0:28–0:36 | **THE WORDS** | Extreme close-up of mouth saying ONE sentence. Cut to other person frozen mid-reaction. |
| 6 | 0:36–0:44 | **WALKING OUT** | Movement. Phone in hand. Doesn't send the message. World transforms behind them. |
| 7 | 0:44–0:53 | **THE RESOLUTION ROOM** | Their real space (1BHK, kitchen, hostel bed). Specific numbers on screen (rent, bill, user count). Head in hands → looks up → sees the gold particles. |
| 8 | 0:53–0:60 | **THE END CARD** | Looks directly into camera for the first time. Half-lit. Ancient figure (Krishna/master) materializes from gold dust behind them. Whisper: "I see you, [name]." |

**Total:** 60s. **Voice:** protagonist's locked voice + 1 master whisper at end.

### Specificity rule (non-negotiable)
Every reel MUST contain at least 3 of these specificity anchors:
- exact time (11:47 PM, 2:14 AM, 4 PM Wednesday)
- exact number (₹42L, $11,407, 23 users, 47 refreshes, 14 months)
- named object (Slack window, OpenAI bill, calendar invite, son's doorway)
- named place (Indiranagar 1BHK, Gurgaon office, Pune kitchen)
- the loop in HUMAN words (NEVER the ID — "the 2 AM refresh" not "VAL004")

---

## 5 · The 7-Step Render Factory

```
STEP 1 — BRIEF       /content/instagram-v2/02-REELS/briefs/Rxxx-*.md (8-shot storyboard + VO + pause map)
STEP 2 — KEYFRAMES   imagegen × 6, lock-sheet ref, 9:16 1088×1920, "Pixar Soul aesthetic, warm tungsten + cool window light, 35mm grain, no text"
STEP 3 — CLIPS       videogen × 5, 1080p, 10s, 9:16, starting_frame = matching keyframe, camera_fixed=true (intimate) / false (hero pull-back)
STEP 4 — VOICEOVER   ElevenLabs eleven_turbo_v2_5, locked voice ID, every (....) = 2.5s silence
STEP 5 — MUSIC BED   ElevenLabs Sound-Gen, 60s, mood per brief, -22dB
STEP 6 — CAPTIONS    .ass file, Anton 140pt, gold word-highlight, MarginV=345
STEP 7 — FFMPEG      concat → LUT → caption burn → audio mix → 1080×1920 H.264 MP4
```

### Canonical ffmpeg compose
```bash
ffmpeg -y \
  -i clip1.mp4 -i clip2.mp4 -i clip3.mp4 -i clip4.mp4 -i clip5.mp4 \
  -i vo.wav -i music.mp3 \
  -filter_complex "
    [0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0[vc];
    [vc]eq=contrast=1.08:brightness=-0.02:saturation=1.05,
        colorbalance=rs=0.08:gs=0:bs=-0.05:rm=0.04:gm=0:bm=-0.03[vlut];
    [vlut]ass=captions.ass[vout];
    [6:a]volume=-22dB[bed];
    [5:a][bed]amix=inputs=2:duration=first:dropout_transition=0[aout]
  " \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 \
  -r 30 -s 1080x1920 -movflags +faststart \
  Rxxx-final.mp4
```

### File structure (locked — never deviate)
```
content/wave2/Rxxx/
├── brief.md
├── keyframes/k1.png … k6.png
├── clips/clip1.mp4 … clip5.mp4 (+ .asset.json each)
├── audio/vo.wav, music.mp3
├── captions/captions.ass
├── Rxxx-final.mp4
└── production-receipt.json
```

---

## 6 · The 11-Gate Ship/Kill Checklist (run after every render)

```
 1. Sound-OFF 3-second test — captions readable, hook visible?      no → KILL
 2. Protagonist code in filename?                                    no → KILL
 3. Specific moment + hour named?                                    no → KILL
 4. ≥ 3 specificity anchors visible?                                 no → KILL
 5. Captions Anton 140pt gold at Y≈82%?                              no → REBUILD CAPTIONS
 6. Loop named in HUMAN language only (no IDs spoken/visible)?       no → REBUILD CAPS/VO
 7. ≥ 1 silence ≥ 1.5s?                                              no → REBUILD AUDIO
 8. VO ducked clean (-22dB music)?                                   no → REMIX
 9. Closing = real human next move (no "follow for more")?           no → REWRITE
10. All 7 craft axes ≥ 8/10, average ≥ 9?                            no → BACK TO BENCH
11. "Send to one friend without flinching" test?                     no → BACK TO BENCH
                       ↓ all yes
                       SHIP
```

---

## 7 · Cost Per Reel (real, from R005/R006/R007 receipts)

| Tier | What | Credits |
|---|---|---|
| A — Cinematic reel (R001/R005-style, 6 keyframes + 5 clips + VO + music) | flagship | **~30** |
| B — Voice Note reel (1 still + VO + word-by-word caption + black bg) | confessional | **~3** |
| C — Carousel (10 typographic slides) | save-driver | **~5** |
| D — Quote tile (single Anton line) | filler | **~0.5** |
| E — Luma vignette (1 ambient AI clip, no VO) | brand luxury | **~6** |
| F — POV practice reel (1 keyframe + 2 clips + Modern Guru VO) | direct value | **~12** |

**1000 credits → ~516 mixed pieces** (33 cinematic + the rest in B/C/D fillers).

---

## 8 · The Series — what we ship over 12 months

1. **Phase 0 — Product Launch (10 cinematic reels, ~300cr)** — Samir + Modern Guru walk through Temple, Daily Cycle, Living Theme, Journal, Guide, Mirror, Engines, 11-Band Spiral, Frameworks, How-to-Begin. Luma-Afanets aesthetic.
2. **Phase 1 — Loop Diaries S1 (10 cinematic reels, ~300cr)** — One protagonist + one loop per reel using the 8-shot R001 template. Black-Mirror-of-consciousness tone.
3. **Phase 2 — Voice Notes from the Inside (60+ reels, ~180cr)** — Single voice on black, word-by-word Anton caption, one heartbeat. V001-V005 style.
4. **Phase 3 — Carousels of the Modern Sickness (20+ carousels, ~100cr)** — 10 slides each. Bhasma white type on Sangam black, Diya gold accent.
5. **Phase 4 — Master Speaks (36 reels, ~180cr)** — One reel per master. Static Padmasana portrait + cloned voice + one piercing line. 20–40s.
6. **Phase 5 — Mirror Quotes (200 tiles, ~100cr)** — Daily filler. One Anton line. Damaru gold on Sangam black.
7. **Phase 6 — Luma Vignettes (defer until Phase 0–4 are validated)** — 5–10s ambient AI video, no VO, one end caption.
8. **Phase 7 — 60-Second Practices (defer)** — POV. Modern Guru looks at camera. One micropractice in real time.

---

## 9 · The Ship Order (no parallel work — one phase at a time)

```
Week 1   →  Phase 0 reels P001–P003 (Temple, Daily Cycle, Living Theme)
Week 2   →  Phase 0 reels P004–P007 (Journal, Guide, Mirror, Engines)
Week 3   →  Phase 0 reels P008–P010 (Spiral, Frameworks, How-to-Begin)
Week 4   →  Phase 1 Loop Diaries R008–R012
Week 5   →  Phase 1 Loop Diaries R013–R017
Week 6+  →  Voice Notes drip + Master Speaks batch + Quotes daily
```

Validate ≥ 8/10 QA on the first 3 of any phase before ordering the rest.

---

## 10 · What I need from you to ship the next reel

Reply with one of:
- **`P001`** — render Phase 0 reel #1 ("What ConsciousOS actually is", Samir VO)
- **`R008`** — render the next Loop Diary (PRIYA × AVD133 "disappearing inside my own life")
- **`brief P001`** — write the 8-shot brief for P001 only, render later
- **`audit`** — show me what's already rendered in `/mnt/documents/` and `content/wave2/`

---

*v1 · 2026-05-10 · supersedes scattered playbooks · this file IS the spec*
