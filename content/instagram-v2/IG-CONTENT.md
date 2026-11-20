# IG-CONTENT.md — Production Bible (Locked v1)

> The single source of truth for every Reel after R006.
> Distilled from the only flagships that worked: **R001 (Samir), R005 (Anjali), R006 (Modern Guru), R007 (Meera)**.
> Every future reel obeys this file. If a draft violates it, the draft dies — not the rule.

---

## 0. NON-NEGOTIABLES (the "if any one of these breaks, kill it" list)

1. **One protagonist.** Real-named. One city. One specific minute. (Samir / Anjali / Meera / Arjun / Aaji.)
2. **One loop_id** from the library, not invented. (e.g. VAL004, CMP246, EGO001, AC003.)
3. **One feeling.** Pass the `the_one_feeling_test` or kill it.
4. **Look D — Spirited Away × Soul.** Watercolor texture on Pixar 3D. Indigo + cream + saffron + gold marigold. Same in every shot.
5. **Duration LOCKED.** 60.0s exact. No 58, no 62. Shots either 6×10s, 8×7-8s, or 12×5s.
6. **Title card** = Name. Time. Number. (`Anjali. 11:47 PM. 12 likes.`) Fraunces 80pt cream on black, 1.2s.
7. **The Pause.** Every reel has 1.5–2.5s of near-silence somewhere between 0:20 and 0:35. It is the cinematic turn. Music ducks to -inf, only ambient + heartbeat.
8. **Specifics or die.** Real numbers (₹52,000 rent, $11,407 bill, 12 likes, 14 months, 9:12 AM). Vague = dead.
9. **Brand reveal at 0:53+.** Never before. The product is the doorway, not the pitch.
10. **No UI screenshots in the cinematic body.** Only at the very end card. The film is the spell; UI breaks it.

---

## 1. THE FORMULA (every reel, no exception)

```
Title card  (1.2s)  →  Name. Time. Number.
HOOK        (5–6s)  →  Face / object / number close-up
WORLD       (7–8s)  →  Where they are. What they were doing.
THE PROBLEM (10–14s) →  Specific moment. Specific number.
THE PAUSE   (3–5s)  →  Silence. Stillness. The turn.
THE LINE    (5–6s)  →  One-sentence reframe (the screenshottable one).
THE ACTION  (5–7s)  →  Body changes. Phone face-down. Eyes close.
RELEASE     (4–5s)  →  Breath. Music swells. Light shifts.
END CARD    (5–7s)  →  Loop ID. App name. One sentence.
```

Total: 60.0s.

---

## 2. FRONTMATTER (copy this, fill it in, never deviate)

```yaml
---
series: <Loop family> (e.g., "Validation Loop (P1)", "Comparison (P2)")
reel_number: 0XX
loop_id_backstage: <LIBRARY_ID>      # MUST exist in loop library — VAL004, CMP246, AC003…
loop_human_name: "<one-line name>"   # "the 2 AM refresh"
protagonist: <NAME> (<age>, <role>, <city neighborhood>)
voice_primary: <Gemini voice>        # Charon / Kore / Puck / Aoede / Fenrir
voice_whisper: <Gemini voice or null>
look: D — Spirited Away × Soul (watercolor on Pixar 3D)
duration: 60.0s LOCKED
shots: <N> × <Ns> clips
posting_time: <HH:MM IST>            # match the protagonist's emotional hour
the_one_feeling_test: "<single sentence — anyone who has ever ___ will feel ___>"
---
```

---

## 3. SHOT BLOCK (every shot, no exception)

```
### SHOT N — 0:XX → 0:XX (Ns) — <ROLE>
**Visual:** <one sentence, camera + subject + light>
**VO (<voice>):** *"<line with (..) for short pauses, (...) for longer>"*
**SFX:** <ambient + music note>
**Videogen prompt:** *"9:16, <shot type>, <subject>, <lighting>, <camera move or hold>, Look D — Spirited Away × Soul, watercolor on Pixar 3D, indigo + cream + saffron palette."*
```

VO pause notation (locked):
- `(.)` = 0.4s
- `(..)` = 0.8s
- `(...)` = 1.4s
- `(....)` = 2.0s

---

## 4. THE 5 PROTAGONISTS (canon — do not invent new ones without approval)

| Name | Age | Role | City | Loop family they unlock |
|---|---|---|---|---|
| **Samir** | 26 | Founder | Bangalore Indiranagar 1BHK | Founder Origin (R001) |
| **Anjali** | 28 | Product designer | Bangalore Koramangala | Validation (R005) |
| **Modern Guru** | 26 | Bridge teacher | Anywhere | Spiritual Ego (R006) |
| **Meera** | 32 | Architect | Goa rented studio | Comparison / Identity (R007) |
| **Arjun** | 27 | Engineer | Bangalore Whitefield | Achievement (AC003) |
| **Aaji** | 71 | Grandmother | Pune | Memory / Surrender (future) |

**Rule:** A protagonist appears in **3 reels** (a trilogy) before being retired or rotated. Continuity > novelty.

---

## 5. VOICE — GEMINI TTS (free, replaces ElevenLabs)

API: Google AI Studio, model `gemini-2.5-flash-preview-tts`. Free tier. Key stored as `GEMINI_API_KEY`.

| Voice | Use for | Notes |
|---|---|---|
| **Charon** | Samir, narrator, founder voice | Deep, contemplative, slow |
| **Kore** | Anjali, Meera, female protagonists | Warm, intimate, breathy |
| **Puck** | Modern Guru (26), Arjun | Youthful, bridging |
| **Aoede** | Aaji whisper, ancestor lines | Soft, ancient |
| **Fenrir** | Krishna whisper, the closing line | Low, ethereal |

Post-process every VO: `atempo=0.94, lowpass=4000, volume=1.4`. Never raw.

---

## 6. MUSIC — FREE STACK (replaces Suno)

| Source | What for |
|---|---|
| **Pixabay Music** | Primary — search "cinematic piano emotional", "Indian flute meditation", 60–80 BPM |
| **YouTube Audio Library** | Backup — Hisaishi-style minimalist piano |
| **ffmpeg-synth pad** | Fallback — sine-wave drone in F minor + 60 BPM heartbeat |

Music rules:
- Always ducks to -inf during The Pause (0:20–0:35 zone)
- Single piano note re-enters under The Line
- Bansuri / shakuhachi flute reserved for the final 7 seconds only
- Keep music –22 dB under VO

---

## 7. LOOK D — VIDEOGEN PROMPT FORMULA (locked)

Every videogen prompt ends with:

> *"Look D — Spirited Away × Soul fusion, watercolor texture on Pixar 3D, indigo + cream + saffron + gold marigold palette, soft volumetric light, 9:16, film grain."*

Camera grammar:
- Open with **ECU** (extreme close-up — face, hand, screen)
- Pull to **wide** for The Pause
- Return to **ECU** for The Line
- End on **medium** with subject looking off-camera

Forbidden in prompts: "futuristic," "neon," "cyberpunk," "logo," "UI," "app screen" (those break the spell).

---

## 8. CAPTION FORMAT (locked)

```
<Title-card line, repeated.>

<Protagonist intro: name, age, city — 1 line.>
<The setup: 2–3 lines, no preamble.>

Not because <X>.
Not because <Y>.
Because <the real reason — one line, gut-level>.

This is <reel context — one line: "the founding story", "loop VAL004", "from the council">.
<App name + one differentiator line>.

<Founder/builder note — 1 line of vulnerability>.

Day <N> of soft launch. <Real number> users.
If you've ever felt the <specific feeling> — link in bio.

— <Signature>

#<5 niche tags> #<5 emotion tags> #<5 spiritual tags> #<5 brand tags> #<5 community tags>
```

30 hashtags exact. Mix: niche / emotion / spiritual / brand / community.

---

## 9. END CARD (final 3–5s)

```
Conscious OS
<one-line product line — never the same twice>
@consciousos · Day <N>
```

Examples:
- "The first app that sees you."
- "13 gurus. 400+ loops. One you, finally seen."
- "The temple in your pocket."

---

## 10. QUALITY CHECKLIST (every reel, before render)

- [ ] Title card = Name. Time. Number.
- [ ] Frontmatter complete; loop_id exists in library
- [ ] One protagonist, real, named
- [ ] At least 4 hard specifics (₹, time, count, brand)
- [ ] The Pause exists between 0:20 and 0:35 (≥1.5s near-silence)
- [ ] The Line is screenshottable in one frame
- [ ] Brand mention only after 0:53
- [ ] No UI in cinematic shots; only on end card
- [ ] All Sora/videogen prompts end with the Look D formula
- [ ] VO uses pause notation (`(.) (..) (...) (....)`) consistently
- [ ] Music ducks to -inf during The Pause
- [ ] Caption: 30 hashtags exactly, signed
- [ ] First comment = real receipt (date, number, name)

---

## 11. PRODUCTION PIPELINE (per reel)

```
1. Brief        →  /content/instagram-v2/02-REELS/briefs/R0XX-<loop>-<id>.md
2. Flagship     →  /content/instagram-v2/02-REELS/flagships/R0XX-<slug>.md
3. Clips        →  /content/wave<N>/R0XX/clips/clip{1..N}.mp4 + .asset.json
4. VO           →  Gemini TTS → /tmp/r0XX/vo-{1..N}.wav
5. Music        →  Pixabay download → /tmp/r0XX/score.mp3
6. Stitch       →  ffmpeg xfade + drawtext (title card + end card)
7. Master       →  /mnt/documents/R0XX-<slug>-FINAL-vN.mp4
8. Receipt      →  /content/wave<N>/R0XX/production-receipt.json
9. QA           →  10-frame screenshot pass before delivery
```

---

## 12. NEXT BUILD QUEUE (after this file is approved)

| Reel | Protagonist | Loop | Hook |
|---|---|---|---|
| R007 | Meera | CMP246 | "Quit pretending you like it" *(brief exists, needs flagship)* |
| R008 | Arjun | AC003 | "73 refreshes on a Sunday" |
| R009 | Anjali | VAL020 | "The post you almost deleted" |
| R010 | Samir | EGO007 | "I caught myself bragging about meditation" |
| R011 | Aaji + Meera | SRV314 | "The recipe she never wrote down" |
| R012 | Council | — | The launch film, recut to 60s for IG |

Build order: R007 → R008 → R009 (one protagonist per week, Tuesday post).

---

## 13. WHAT THIS FILE REPLACES

- ❌ `content/instagram/01-cinematic-reels.md` (old generic 30-reel plan — abandon)
- ❌ `content/instagram/06-app-cinematics.md` (UI-screen reels — break Look D)
- ❌ `docs/100-instagram-video-ideas.md` (template-y, no protagonists — abandon)
- ✅ `content/instagram-v2/00-FOUNDATION/*` stays as supporting context

---

**Locked by:** Vatsal + Samir, after R001–R006 shipped and proved the pattern.
**Voice provider:** Google AI Studio (Gemini TTS, free).
**Music provider:** Pixabay (free, royalty-free).
**Video provider:** videogen, Look D prompts only.
**No paid APIs required.**
