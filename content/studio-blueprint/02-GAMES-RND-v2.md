# THE STUDIO — GAMES R&D v2 (Original Mechanics)
**Why this exists:** v1 catalog (36 games) was generic — Tap, Trace, Tetris-with-shadows. Every meditation app has tried these. This doc proposes *only* mechanics nobody has shipped, that *only* Conscious OS could ship (because we own the loop library, V-Levels, 13 gurus, biometric typing, and the Consciousness Engine).

---

## 0. STATE OF THE ART (Dec 2025) — what's already taken

| Mechanic | Who owns it | Don't redo |
|---|---|---|
| Breath = game input (orb expands, ship flies) | PLAYNE, Flowborne VR, Zengence (DeepWell DTx), Hum of Harmonia | Yes |
| Webcam HRV / stress reshapes world | NeuroLabyrinth (OSS), MiM (Steam 2025) | Yes |
| Garden grows on coherence | PLAYNE, Calm Sleep Sounds | Yes |
| Anonymous co-presence as emotional payload | thatgamecompany *Journey* (2012, perfected) | Yes |
| Generative ambient adapts to state | Endel | Yes |
| Tap-when-thought-arises | Headspace's "Take 10", every mindfulness app since 2014 | Yes |
| Koan / Zen prompts | Waking Up, Insight Timer | Yes |

**Conclusion:** the visible category is saturated. Originality lives in mechanics that **span days, use the user's own past, weaponize silence, refuse to be played, or use inputs nobody touches.**

---

## 1. THE 7 WHITE SPACES (the only places worth building)

1. **Asynchronous / multi-day games.** Meditation games are all single-session. Nobody has shipped a game whose loop spans 30 days, with your actual life as the level.
2. **Your own data as antagonist.** Your past journal entries, your detected loops, your typing rhythm — replayed back as bosses, oracles, mirrors.
3. **Refusal mechanics.** Games that reward *not* playing, *not* answering, *not* opening. Headspace can't do this. We can.
4. **Real-world intrusion.** The notification IS the game. Mid-meeting. Mid-doomscroll. Mid-2am.
5. **Multi-sensory mudra-stacks.** Combine breath + gyro + voice + touch into one composed ritual nobody has assembled.
6. **Time/state-locked content.** Only playable at 2:47am, only on the day after a regression, only when biometrics say you're spiraling. Scarcity = sacredness.
7. **Asynchronous co-presence with strangers** (Journey-style) but for inner-work signals, not navigation.

---

## 2. THE 12 ORIGINAL MECHANICS

Each one obeys the v1 design laws (one faculty, signal out, loop-tagged, no XP, ≤7 min unless multi-day) AND occupies a white space above.

### 🌑 G-N01 — **The Loop Mirror Boss**
> *"Fight the version of yourself you were last Tuesday."*
- **Mechanic:** The game pulls your top 3 loops from `consciousness_signals` over the last 7 days, materializes them as 3 shadow opponents in a turn-based ritual battle. Each "boss" speaks in YOUR phrasing (pulled from your journal entries, run through Groq with safety layer). To "defeat" each boss you must complete a 30-second somatic counter-action assigned by the engine (e.g., one slow exhale + one written reframe).
- **White space:** Your past is the antagonist. Nobody has done this.
- **Inputs:** Tap + 1-line text + breath sensor.
- **Output signal:** `loops_resolved[], somatic_evidence{}, time_to_complete`.
- **Loops:** All EGO + COG + ID families.

### 🌒 G-N02 — **Don't Open** *(refusal game)*
> *"You earn points for the time you don't open the app."*
- **Mechanic:** Set a "Don't Open" duration (1h, 4h, 24h, 72h). The app sends notifications designed to bait you (e.g., "Aaji wants to talk to you", "Your loop resolved!"). Each notification you ignore = a petal grows on a lotus inside the closed app. Open the app early = lotus closes. The kicker: the notifications get progressively more interesting as you resist.
- **White space:** Refusal as a mechanic. Anti-gamification weaponized as gamification.
- **Inputs:** Notification taps (or non-taps), background timestamps.
- **Output signal:** `restraint_seconds, peak_temptation_intensity, loops_inferred[VAL/EGO/ATT]`.
- **Loops:** VAL003, ATT002, EGO007 (the bragging-about-meditation loop).

### 🌓 G-N03 — **The 2:47 AM Door** *(time-locked)*
> *"This game only exists between 2:00 and 4:00 AM local time."*
- **Mechanic:** Locked icon during the day. At 2 AM the icon glows. Tap → enters a 4-minute slow guided session: one koan, one breath, one sentence written on a candle that burns to ash. Cannot be replayed in the same night. After 7 nights you receive a hand-illustrated "night-keeper" badge (the only "reward" in the entire system).
- **White space:** Sacred scarcity. Nobody time-locks meditation content.
- **Inputs:** Local time, gyroscope (phone-down detection at end), 1-line text.
- **Output signal:** `nights_visited, first_words[], breath_coherence_avg`.
- **Loops:** EGO014 (Samir's R001 loop), VAL001, anxiety cluster.

### 🌔 G-N04 — **Echo** *(asynchronous strangers, Journey-style)*
> *"You are matched with one stranger. You will never see their name. Only their breath."*
- **Mechanic:** Once a day, you and one other live user are paired anonymously. You both see one shared visual (a single candle). When either of you breathes deeply, the candle brightens for both. No words, no chat, no avatar. 4 minutes. Then disconnect forever. Repeat tomorrow with someone new.
- **White space:** *Journey*'s emotional payload, applied to inner state instead of navigation.
- **Inputs:** Web Audio mic (breath envelope), nothing identifying.
- **Output signal:** `co_presence_minutes, mutual_coherence_peak, partner_user_id (hashed, one-way)`.
- **Loops:** HRT003, ID002, NER001.

### 🌕 G-N05 — **Typing Hailstorm** *(uses our biometric IP)*
> *"Type the sentence. We can tell what you're feeling from how you type it."*
- **Mechanic:** A neutral sentence appears. You type it. Our biometric typing engine (already built, see `mem://tech/ip/biometric-signals-v2-logic`) classifies your inter-key timing, error rate, and pressure pattern into a state vector → one of 8 V-Level bands. The game then plays back a 30s mirror animation of your detected state, scored by Modern Guru in voice. After 7 plays it becomes a longitudinal weather report of your inner climate.
- **White space:** Typing as a meditation input. Nobody else has the biometric layer.
- **Inputs:** Keyboard (timing, not content).
- **Output signal:** `vlevel_inferred, typing_arousal_index, longitudinal_band_drift`.
- **Loops:** Auto-detects any of 12 emotion-cluster loops.

### 🌖 G-N06 — **Bansuri Whisper** *(mic frequency, not amplitude)*
> *"Hum the note the bansuri is holding. The bee will appear only when you match."*
- **Mechanic:** A bansuri plays one sustained note (changes daily by raga rules: Bhairav at dawn, Yaman at dusk). You hum into the mic. FFT detects pitch match. When you hold within ±5 cents for 4s straight, a single Pixar bee emerges from the screen, circles your name, and dissolves into a mandala. Multiple bees compose a mandala over 21 days.
- **White space:** Pitch-matching, not amplitude. Combines raga theory + biometric + Pixar visual.
- **Inputs:** Mic FFT (Web Audio API).
- **Output signal:** `pitch_lock_seconds, mandala_progress, raga_alignment`.
- **Loops:** NER001, DEV001, BHA001.

### 🌗 G-N07 — **The Council** *(13 gurus as game)*
> *"Three of your 13 inner gurus will speak today. You vote on which one was right."*
- **Mechanic:** Three random gurus from your active 13 each give a 20-second take on one situation pulled from your last 24h (loops, journal, slot pattern). You drag a marigold to the one whose voice felt true. Over 30 days the engine learns your inner-guru affinity vector (Karma vs Bhakti vs Jnana vs Raja, mapped to all 13). Outcome: a personal council that auto-curates Temple chats.
- **White space:** Multi-perspective oracle game. The 13 gurus exist nowhere else.
- **Inputs:** 1 drag, 1 optional voice answer.
- **Output signal:** `guru_affinity_vector[13], path_drift, confidence_scores`.
- **Loops:** DNA001, JNA001, ID001.

### 🌘 G-N08 — **Cold Open** *(real-world intrusion)*
> *"A 90-second game arrives once, randomly, between 9am and 9pm. Today only."*
- **Mechanic:** Once per day, at an engine-chosen moment (slot of likely loop activation — e.g., for Samir, 11:47pm validation-check time), a notification fires: a 90-second card asking *exactly one* targeted question with three answer cards. The question is generated from your top active loop. Answer = signal. Don't answer in 5 minutes = also signal (avoidance).
- **White space:** The notification is the game. Mid-life intrusion. Engine-driven, not user-driven.
- **Inputs:** 1 tap or non-tap.
- **Output signal:** `responded_within_s, answer_choice, loop_activation_evidence`.
- **Loops:** Whatever the engine picks for you that day.

### 🌑 G-N09 — **The Confession that Burns** *(zero-storage trust play)*
> *"Type one true sentence. It dissolves into ash. No one — including us — sees it. We promise with code."*
- **Mechanic:** A textarea. You type. Hit "burn." Client-side only — text is never sent to server, only the *length* of what you typed and the *time you held the burn button* (3s long-press, like a real puja). On screen: your words turn to ash particles that drift up. The signal recorded: that you confessed something, not what.
- **White space:** A game built on demonstrable non-data. Privacy-as-mechanic.
- **Inputs:** Keyboard, long-press.
- **Output signal:** `confession_length, hold_duration, post_breath_change`.
- **Loops:** SHA002, VAL001, EGO001.

### 🌒 G-N10 — **30-Day Loop Funeral** *(asynchronous, multi-day)*
> *"Pick one loop. Catch it 21 times. On day 30 we bury it together."*
- **Mechanic:** Day 1: choose your loop. Days 1–21: every time you catch yourself in it (one tap from the home screen — that's the entire UI), the loop's "headstone" gains a stone. Day 21: a 4-minute closing ritual — write the eulogy, light the diya, drag the loop into a river. The loop is "buried" in your profile (visible as a tombstone in a small graveyard inside the app — the only persistent visualization in the whole product).
- **White space:** A game whose duration is 30 days. Most apps don't do this.
- **Inputs:** 1 tap/day max, 1 write event at day 21.
- **Output signal:** `catch_count, completion, eulogy_sentiment, post_funeral_recurrence_30d`.
- **Loops:** Any single user-chosen.

### 🌓 G-N11 — **Mudra Stack** *(multi-sensory composed ritual)*
> *"Compose a 4-step ritual using your senses. The engine grades the composition."*
- **Mechanic:** Drag-build a 60-second ritual from a palette: [breath pattern] → [hand mudra (gyroscope)] → [hummed syllable (mic)] → [closing tap]. The engine plays it back, scoring coherence and offering one micro-edit per session ("try a longer exhale"). Over time you compose your own mudra signature; the engine then injects YOUR mudra at moments of detected stress.
- **White space:** Compositional ritual game. Nobody has built ritual-as-LEGO.
- **Inputs:** Gyroscope, mic, breath, tap. All four.
- **Output signal:** `mudra_signature_hash, coherence_score, repeatability`.
- **Loops:** All NER + somatic + identity ritualization.

### 🌔 G-N12 — **The Witness Lottery** *(invisible, ambient)*
> *"5 random times today the screen will dim for 7 seconds. If you noticed without checking — you win."*
- **Mechanic:** Background service (PWA / Capacitor): at 5 random moments the phone screen pulses dim for 7 seconds (or with a tiny haptic on lock). At end of day a screen asks "How many did you notice?" The engine knows the truth. Honesty = signal. Awareness count = signal. The game runs while you're not in the game.
- **White space:** Ambient game. The play surface is your day, not the app.
- **Inputs:** Notification interaction events, end-of-day self-report.
- **Output signal:** `noticed_count, honesty_delta, attention_drift_curve`.
- **Loops:** ATT002, VAL003, ID001.

---

## 3. THE NEW LAWS (additions to v1)

To v1's 8 design laws, add:

9. **At least one game in the slate must require ≤1 tap per day.** (G-N02, G-N10, G-N12.)
10. **At least one game must reward refusal.** (G-N02.)
11. **At least one game must use the user's own data as content.** (G-N01, G-N05, G-N08.)
12. **At least one game must run while the app is closed.** (G-N12, G-N02.)
13. **No game in the slate may share its primary mechanic with a top-100 wellness app.** (Originality gate.)

---

## 4. RECOMMENDED ANCHOR SLATE (replaces v1's 6 anchors)

If we ship 6 — these 6, in this order:

| Order | Game | Why anchor | Build complexity |
|---|---|---|---|
| 1 | **G-N03 The 2:47 AM Door** | Embodies the brand (Samir's hour). Tiny build. Cinematic. Sharable. | Low |
| 2 | **G-N09 The Confession that Burns** | Trust-builder. Demonstrates "anti-app" values. ~1 day of code. | Low |
| 3 | **G-N12 The Witness Lottery** | Defines the "ambient game" genre nobody owns. Background notification + 1 form. | Low-Med |
| 4 | **G-N01 The Loop Mirror Boss** | Showcases our IP moat (loop library + journal + Groq). The "wow" demo for investors. | Med-High |
| 5 | **G-N04 Echo** | Journey-grade emotional payload. Goes viral if we land it. Needs realtime + matching. | High |
| 6 | **G-N05 Typing Hailstorm** | Activates our biometric IP. Uniquely defensible. | Medium |

This slate gives us: 1 cinematic anchor, 1 trust play, 1 ambient innovation, 1 IP showcase, 1 viral piece, 1 patent-class moat. Every single one occupies white space.

---

## 5. WHAT WE KEEP FROM v1

- All design laws 1–8 (those are correct).
- Shared infra (`<GameShell />`, `useGameSignals`, registry, route, signal table) — same Phase 0 plan.
- Look D art bible.
- Loop-tagging requirement.
- The signal-out architecture.

What we **drop** from v1: G01 (generic tap), G06 Shadow Tetris, G11 Ego Inventory, G14 Single Drop, G15 Counting to 10, G19 Cloud Watcher, G20 Two Chairs, G22 Pattern Solitaire, G29 Layer Peeler, G30 Neti Neti — every one of these is a known meditation-app mechanic. Move to a "v1 archive" file. We'll cherry-pick if we need filler later.

---

**Status:** R&D complete. Awaiting your call on slate before infra build.
