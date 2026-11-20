# THE REEL EXECUTION PLAYBOOK
### The exact, repeatable recipe used to build every world-class 60-second reel.

> Read this BEFORE touching imagegen, videogen, ElevenLabs, or ffmpeg.
> If a reel skips a step in this playbook — it does not ship. It goes back to the bench.
> This playbook sits on top of `00-MASTER-PLAYBOOK.md`. The Master Playbook is the *bar*.
> This document is the *factory*.

---

## 0. WHAT WE ARE BUILDING

**Format:** 60-second vertical reel, 1080×1920, H.264, 9:16, ~12–18 MB.
**Cadence:** 2 reels per render turn. 5 turns = 10 reels (R005 → R014).
**Budget per reel:** ~45 credits (6 keyframes + 5 video clips + VO + music + ffmpeg).
**Quality bar:** Pixar / *Soul* / A24 — every frame screenshotable, every silence earned.
**Caption position:** **Y = 82% (bottom-anchored, above IG UI bar).** Locked. No exceptions.

---

## 1. THE NON-NEGOTIABLES (cross-checked against Master Playbook)

Before any render:

- [ ] One protagonist code in filename + brief (SAMIR / ARJUN / PRIYA / DIYA)
- [ ] One real hour, one real place, one named loop (ID in brief, HUMAN name on screen)
- [ ] At least 3 specificity anchors (time / number / object / place / loop-name)
- [ ] At least one deliberate silence ≥ 1.5s mapped in the VO script
- [ ] Hook works as a still (sound OFF, frame 1 = save-worthy)
- [ ] Closing = a real human next move (never "follow for more")
- [ ] No item from the Forbidden List (`00-MASTER-PLAYBOOK.md §6`)

If any box is unchecked → **rebuild the brief, do not render.**

---

## 2. THE 7-STEP FACTORY (per reel, ~8 min wall-clock)

```
STEP 1 — BRIEF LOCK            (already exists in /02-REELS/briefs/)
STEP 2 — KEYFRAMES   × 6       imagegen, off Samir/Arjun/Priya/Diya lock sheet
STEP 3 — VIDEO CLIPS × 5       videogen, starting_frame = matching keyframe
STEP 4 — VOICEOVER             ElevenLabs, voice ID matched to protagonist
STEP 5 — MUSIC BED             ElevenLabs Sound-Gen, 60s, -22 dB
STEP 6 — CAPTIONS (.ass)       Anton 140pt, gold word-highlight, Y=82%
STEP 7 — FFMPEG COMPOSE        concat → duck → mix → burn → 1080×1920 MP4
```

Every reel writes a `production-receipt.json` listing: keyframes, voice ID, music seed, caption template version, ffmpeg command. Reproducibility is law.

---

## 3. STEP-BY-STEP — what AI runs, in order

### STEP 1 — Brief lock
- Open `/02-REELS/briefs/Rxxx-*.md`
- Confirm: protagonist, loop ID, 6-shot storyboard, VO script with `(....)` pause map, music mood, hook frame description.
- If brief is missing any of these → **author the brief first**, do not skip.

### STEP 2 — Keyframes (6 stills)
- Tool: `imagegen--generate_image`, model `standard` (or `premium` if frame contains text)
- **Character lock:** every Samir keyframe references `content/instagram-v2/00-FOUNDATION/portraits/SAMIR-lock-sheet-v1.png` in the prompt ("same face, same hoodie, same room as reference").
- Aspect: 9:16, 1088×1920.
- Style line appended to every prompt:
  > *"Pixar Soul aesthetic, cinematic LUT, warm tungsten + cool window light, soft skin SSS, 35mm grain, depth of field, no text, no logo."*
- Save to `content/wave2/Rxxx/keyframes/k1.png … k6.png`

### STEP 3 — Video clips (5 × 10s)
- Tool: `videogen--generate_video`, resolution `1080p`, duration `10`, aspect `9:16`.
- `starting_frame` = the matching keyframe (locks character + lighting continuity).
- Camera: `camera_fixed: true` for intimate shots, `false` only for the hero pull-back.
- Save to `content/wave2/Rxxx/clips/clip1.mp4 … clip5.mp4` (auto-emits `.asset.json`).

### STEP 4 — Voiceover
- Tool: ElevenLabs edge function (`eleven-tts`), pass voice ID from `04-VOICE-DIRECTION.md`.
  - SAMIR → `voice_samir_v1` (clone, stability 0.45, style 0.35)
  - ARJUN → `voice_arjun_v1` (stability 0.50, style 0.30)
  - PRIYA → `voice_priya_v1`
  - DIYA  → `voice_diya_v1`
- Pause map: every `(....)` in the script = 2.5s of silence inserted in the WAV.
- Output: `content/wave2/Rxxx/audio/vo.wav` (mono, 48kHz).

### STEP 5 — Music bed
- Tool: ElevenLabs Sound-Gen via edge function. 60s, mood per brief (lo-fi / Indo-jazz / ambient drone).
- Mix level: -22 dB under VO, full level only during the silence beats.
- Output: `content/wave2/Rxxx/audio/music.mp3`.

### STEP 6 — Captions (.ass subtitle file — NOT CapCut autoburn)
- Transcribe `vo.wav` via Groq Whisper to get word-level timestamps.
- Generate `.ass` subtitle with the **locked spec**:
  ```
  Font:        Anton Bold, 140pt
  Case:        ALL CAPS
  Fill:        #FFFFFF
  Highlight:   #FFD700 (current spoken word ONLY)
  Stroke:      4px #000000
  Shadow:      6px #000000 95% opacity
  Position:    Alignment=2 (bottom-center), MarginV = 18% of frame height
               → effective Y ≈ 82% from top
  MarginL/R:   96px
  MaxWords:    3 per beat (~0.6–1.0s each)
  Animation:   word reveal, 80ms ease-in scale 0.92→1.0
  Forbidden:   loop IDs in caption text
  ```
- Output: `content/wave2/Rxxx/captions/captions.ass`.

### STEP 7 — ffmpeg compose
One canonical command per reel (template):
```bash
ffmpeg -y \
  -i clip1.mp4 -i clip2.mp4 -i clip3.mp4 -i clip4.mp4 -i clip5.mp4 \
  -i vo.wav -i music.mp3 \
  -filter_complex "
    [0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0[vcat];
    [vcat]ass=captions.ass[vout];
    [6:a]volume=-22dB[bed];
    [5:a][bed]amix=inputs=2:duration=first:dropout_transition=0[aout]
  " \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 \
  -r 30 -s 1080x1920 -movflags +faststart \
  Rxxx-final.mp4
```
Output: `content/wave2/Rxxx/Rxxx-final.mp4` + `production-receipt.json`.

---

## 4. THE 11-GATE SHIP / KILL CHECKLIST (run after compose, before delivery)

Same gates as Master Playbook §11 — re-stated here so we never skip:

```
1.  3-second sound-off test passes?            no → KILL
2.  Protagonist code present in filename?      no → KILL
3.  Specific moment + hour named?              no → KILL
4.  ≥3 specificity anchors visible?            no → KILL
5.  Captions Anton 140pt gold at Y≈82%?        no → REBUILD CAPTIONS
6.  Loop named in HUMAN language only?         no → REBUILD CAPTIONS/VO
    (no IDs spoken or on screen)
7.  At least one ≥1.5s silence?                no → REBUILD AUDIO
8.  VO ducked clean (-22dB music)?             no → REMIX
9.  Closing = real human next move?            no → REWRITE CLOSING
10. All 7 craft axes ≥8/10, average ≥9?        no → BACK TO BENCH
11. Send-to-one-friend test passes?            no → BACK TO BENCH
                ↓ all yes
                SHIP
```

The AI runs gates 1–9 automatically (frame inspection + script parse + ffmpeg probe).
Gates 10–11 are reviewed by reading the receipt + watching the export once on phone speaker.

---

## 5. QA — three watches, different conditions

Every reel gets watched 3 times before delivery:

1. **Sound OFF, phone screen** — captions readable? hook visible? story still legible?
2. **Sound ON, headphones** — does the silence land? VO cuts through? music doesn't compete?
3. **Sound ON, phone speaker, 60% volume** — VO still intelligible in a noisy room?

Then the **send-to-one-friend test**: would Samir send this to his ex-CTO without flinching?
If no → it's not done.

---

## 6. THE ROSTER — R005 → R014 (the 10-reel batch)

| # | Protagonist | Loop ID | Human Name | Hour | Brief Path |
|---|-------------|---------|------------|------|------------|
| R005 | ANJALI*  | VAL004 | the 2 AM refresh        | 11:47 PM Bangalore | briefs/R005-anjali-2am-refresh.md |
| R006 | ARJUN    | EGO001 | smallest version of myself | 2:14 AM | briefs/R006-arjun-smallest-self.md |
| R007 | SAMIR    | CMP008 | the founder comparison wound | 1:03 AM | briefs/R007-samir-comparison.md |
| R008 | PRIYA    | AVD133 | disappearing inside my own life | 11:47 PM kitchen | briefs/R008-priya-kitchen-floor.md |
| R009 | DIYA     | AC003  | everyone seems to know | 1:30 AM hostel | briefs/R009-diya-pretending.md |
| R010 | ARJUN    | CAR012 | building something that doesn't matter | 3:08 AM | briefs/R010-arjun-doesnt-matter.md |
| R011 | SAMIR    | VAL004 | refresh refresh refresh | 11:47 PM | briefs/R011-samir-refresh.md |
| R012 | PRIYA    | EMO012 | the empty-room mother | 10:42 PM | briefs/R012-priya-empty-room.md |
| R013 | DIYA     | EGO005 | performing my own life | 12:55 AM | briefs/R013-diya-performing.md |
| R014 | SAMIR    | REC002 | the most important year | 11:47 PM | briefs/R014-samir-important-year.md |

\* ANJALI = Samir-adjacent secondary protagonist (uses Samir lock sheet base, different wardrobe + hair). Approved for R005 only as a pilot.

**Render order:** 2 reels per turn → R005+R006, R007+R008, R009+R010, R011+R012, R013+R014.
**Per turn budget:** ~90 credits, ~8 min wait.

---

## 7. FILE & FOLDER CONVENTION (locked)

```
content/wave2/Rxxx/
├── brief.md                  (copy of /02-REELS/briefs/Rxxx-*.md at render time)
├── keyframes/
│   └── k1.png … k6.png
├── clips/
│   ├── clip1.mp4 + clip1.mp4.asset.json
│   └── … clip5
├── audio/
│   ├── vo.wav
│   └── music.mp3
├── captions/
│   └── captions.ass
├── Rxxx-final.mp4
└── production-receipt.json
```

Never deviate. The folder structure IS the audit trail.

---

## 8. THE ONE LAW ABOVE ALL

> Every reel is a small bet that a stranger, alone with their phone at the worst hour of their day,
> will feel — for 60 seconds — that **someone, somewhere, finally saw them.**

If the reel doesn't do that, no amount of LUT, music, or caption polish saves it.
**Kill it. Start again.**

— Locked v1. Ship R005 + R006 next.
