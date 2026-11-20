# PRODUCTION PIPELINE — Markdown → Final MP4/JPG

Every piece in this library is a **production-ready brief**, not a finished video.
This document is the exact tool stack and step-by-step workflow for converting any markdown brief into the final asset ready to post.

You (or an editor / VA) follow these steps. No creative decisions required at the production stage — every decision is already baked into the brief.

---

## TOOL STACK (locked)

| Stage | Tool | Account / Plan |
|---|---|---|
| Voiceover | **ElevenLabs** | Creator $22/mo |
| Background video (Look A, C, D) | **Sora 2** (via OpenAI) | ChatGPT Pro $200/mo |
| Background video (Look B, kinetic) | **Runway Gen-4 Turbo** | Standard $35/mo |
| Image-to-video (texture inserts) | **Kling 2.1 Master** | Pro $35/mo |
| Music | **Suno v4.5** | Pro $10/mo |
| Stills / Carousels base | **Midjourney v7** | Standard $30/mo |
| Voice cloning (Samir's real voice) | **ElevenLabs Professional Voice Clone** | One-time setup |
| Video editing / final compose | **CapCut Pro** (mobile-friendly) OR **DaVinci Resolve** (desktop, free) | — |
| Carousel design | **Figma** (template provided) | Free |
| Subtitles / captions | **CapCut auto-captions** + manual fix | — |
| Scheduling | **Later** or **Buffer** | $25/mo |

**Total monthly software cost: ~$355 (~₹30,000)**
**Output: 415 Hollywood-tier pieces.**
**Per-piece cost: ~₹70.**

---

## WORKFLOW A — VOICE POST (60s, single image or slow video background)

**Input:** A markdown brief from `content/instagram-v2/01-VOICE-POSTS/`
**Output:** One 60-second MP4 in 9:16 (1080×1920) ready for IG Reels

### Steps

1. **Open the brief.** It contains: voice (V1-V7), script with pause map, background video prompt, music prompt, caption.

2. **Generate voiceover** (3 minutes)
   - If V1 (Samir): record yourself per protocol in `04-VOICE-DIRECTION.md`
   - If V2-V7: use ElevenLabs UI or API. Paste script. Apply voice settings from brief.
   - Download as MP3.

3. **Generate background video** (8 minutes)
   - Open Sora 2 (or Runway).
   - Paste the brief's "Background Video Prompt" exactly.
   - Settings: 9:16 vertical, 60 seconds (or two 30s clips stitched), cinematic style.
   - Generate 2-3 variations. Pick the strongest.

4. **Generate music** (3 minutes)
   - Open Suno v4.5.
   - Paste brief's "Music Prompt."
   - Generate 2 versions. Pick. Download as MP3.

5. **Compose in CapCut** (10 minutes)
   - Drop background video as base layer
   - Drop voiceover as audio track 1 (volume 100%)
   - Drop music as audio track 2 (volume 25%)
   - Add subtitles via Auto Captions (CapCut). Adjust to brief's pause map.
   - Add the brief's "Hook Text" overlay at 0:00-0:03 in Fraunces font, 64pt, gold (#FFB547)
   - Add the brief's "Closing Text" overlay at the (silence — 5s) moment
   - Apply LUT: warm cinematic (CapCut "Cinematic Warm" or custom from brief)

6. **Export** at 1080×1920, 30fps, MP4 H.264, high quality

7. **Post.** Use the brief's caption verbatim + hashtags + first comment.

**Total time per voice post: ~24 minutes**
**For 250 posts: ~100 hours of editor time across 8 weeks. One editor part-time.**

---

## WORKFLOW B — REEL (60s cinematic, multi-shot)

**Input:** A markdown brief from `content/instagram-v2/02-REELS/`
**Output:** One 60-second MP4 in 9:16, multi-shot, Pixar-tier

### Steps

1. **Open the brief.** It contains: 8-shot storyboard, per-shot Sora/Runway prompts, voiceover script, music brief.

2. **Generate all 8 shots in parallel** (15 minutes — they queue)
   - For each shot, paste its prompt into Sora 2 (or per the brief's tool assignment)
   - Use the brief's specified duration per shot (usually 5-12 seconds)
   - Generate 2 variations per shot

3. **Generate voiceover** (5 minutes) — same as Workflow A step 2

4. **Generate music** (5 minutes) — same as Workflow A step 4

5. **Storyboard assembly in DaVinci Resolve** (30 minutes)
   - Import all 8 shots in order
   - Trim each to brief's specified duration
   - Apply transitions per brief (usually: hard cuts, except 2-3 cinematic dissolves)
   - Add voiceover and music tracks
   - Apply unified color grade (LUT in brief)
   - Add the brief's "Title Card" at frame 0
   - Add the brief's "End Card" at final frame with @consciousos handle

6. **Add subtitles** with proper timing per script

7. **Export** at 1080×1920, 30fps, ProRes 422 → transcode to H.264 MP4

8. **Post.** Use brief's caption + hashtags.

**Total time per reel: ~60 minutes**
**For 100 reels: ~100 hours across 6-8 weeks. Same editor.**

---

## WORKFLOW C — CAROUSEL (10 slides)

**Input:** A markdown brief from `content/instagram-v2/03-CAROUSELS/`
**Output:** 10 PNG slides in 1080×1350 (4:5 IG carousel format)

### Steps

1. **Open the brief.** Each slide has: hook line, body copy, visual instruction, design notes.

2. **Open the master Figma template** (`content/instagram-v2/00-FOUNDATION/CAROUSEL-TEMPLATE.fig`)
   - Pre-set with grid, fonts (Fraunces + Inter), color tokens, gold particle layer

3. **Generate any required imagery** (10 minutes)
   - For carousels needing illustration: Midjourney v7 with brief's prompt
   - Reference style: "Pixar Soul × Coco color palette, cinematic, gold particles"

4. **Compose 10 slides** (40 minutes)
   - Slide 1: Hook (biggest type, single line, the screenshot moment)
   - Slides 2-9: Progression per brief
   - Slide 10: CTA + handle

5. **Export** as 10 PNGs from Figma at 2x resolution

6. **Post.** Use brief's caption verbatim.

**Total time per carousel: ~50 minutes**
**For 50 carousels: ~42 hours across 4 weeks.**

---

## TOTAL PRODUCTION TIMELINE

| Asset Type | Count | Hours/piece | Total Hours |
|---|---|---|---|
| Voice posts | 250 | 0.4h | 100h |
| Reels | 100 | 1h | 100h |
| Carousels | 50 | 0.85h | 42h |
| **TOTAL** | **400** | — | **~242 hours** |

**With one part-time editor (5 hours/day, 6 days/week) = ~10 weeks to ship the entire library.**
**With two editors in parallel = ~5 weeks.**

---

## QUALITY GATES (before posting)

Every single piece must pass these checks:

### For Voice Posts:
- [ ] Voice has at least one `(....)` 2.5s pause
- [ ] One `(silence — 5s)` moment with just breath/music
- [ ] Hook text visible in first 3 seconds
- [ ] Background video doesn't compete with voice (it supports)
- [ ] Caption matches the on-screen Closing Text
- [ ] Tested on phone screen with sound OFF (subtitles readable?)
- [ ] Tested on phone screen with sound ON (does the silence land?)

### For Reels:
- [ ] First shot is the hook frame from the brief (no logo, no title, immediate moment)
- [ ] Voiceover ends 1-2 seconds before video ends
- [ ] End card visible for at least 3 seconds
- [ ] Music ducks under voice (-12dB during VO, full during silence)
- [ ] One specific protagonist named or shown (per brief)
- [ ] At least one specific number, hour, or name (specificity test)

### For Carousels:
- [ ] Slide 1 is screenshot-able alone (the hook stands without context)
- [ ] Slide 10 has the @consciousos handle and a specific CTA
- [ ] Type hierarchy: one big idea per slide, not crammed
- [ ] Gold particle layer present on every slide
- [ ] Tested on phone (text not too small at 1080×1350)

---

## POSTING SCHEDULE (suggested rhythm)

**Daily for 100 days:**
- 3 voice posts (one per peak time: 7:30 AM, 1 PM, 11:30 PM IST)
- 1 reel (8 PM IST — peak engagement)
- 1 carousel (10 AM IST — Tuesday/Thursday/Saturday)

= 5 pieces per day = 100 days × 5 = 500 pieces (we have 400, gives ~80 days of content)

**Distribution channels:**
- Primary: Instagram (@consciousos)
- Cross-post voice posts as YouTube Shorts
- Cross-post reels as YouTube Shorts + LinkedIn (the founder origin reels especially)
- Carousels as static posts on LinkedIn + Twitter image threads

---

**Production pipeline locked. The library can be executed by any decent editor following this document. Zero creative judgement required.**
