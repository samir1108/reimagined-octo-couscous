# Conscious Games — Master Design Document

> 46 games. Each one a single-screen consciousness instrument.
> The games are the surface. The **signal pipeline** is the moat.

---

## 0. Design Philosophy

Every game in this catalog must satisfy **all five rules**:

1. **One screen, one mechanic.** No menus, no tutorials beyond a single sentence.
2. **The win condition reads consciousness, not skill.** You don't "get better at the game" — the game gets a clearer read on *you*.
3. **Failure is feedback, never punishment.** Karma, not score.
4. **Signals captured silently.** Nothing the user does is "wasted" — every tap, breath, idle moment, scroll feeds the engine.
5. **Under 5 minutes by default.** Sessions can extend (Silent Mountain, Real-World Quest), but the *floor* is always quick.

### Tech stack we are committing to (no HRV, no wearables)

| Capability | Tool | Cost | Notes |
|---|---|---|---|
| Mic input | Web Audio API + `useMicLevel` (already shipped) | Free | Breath, sigh, voice, ambient |
| Speech-to-text | **Deepgram** (streaming) | $0.0043/min | Mirror Realm, Apology, voice journals |
| Text-to-speech | ElevenLabs (already wired) | Per-char | Master voices, narrative beats |
| LLM | Groq llama-3.3-70b (already wired) | Free tier generous | NPC chat, reflections |
| Video assets | Pre-rendered hero loops | One-time gen | Flagship games only |
| Webcam | `getUserMedia` + face-api.js (later) | Free | Two Mirrors, gaze stability |
| Typing biometrics | Custom event capture | Free | Already shipped |
| Idle / tab-blur | DOM events | Free | Already shipped |
| 3D/WebGL | Three.js (flagship games only) | ~500KB | Breath Temple, Non-Dual Door |

**No HRV, no chest straps, no Apple Watch, no Oura.** Mic-derived breath rate gives us 80% of HRV's nervous-system inference with zero hardware friction.

---

## 1. Universal Signal Schema

Every game writes to a single table: `game_sessions` with a JSONB `signals` blob.

```ts
type GameSignal = {
  game_id: string;             // 'breath_temple', 'mirror_realm', etc.
  user_id: uuid;
  started_at: timestamp;
  duration_s: number;
  completion: 'finished' | 'abandoned' | 'timeout';
  
  signals: {
    // Universal (every game captures)
    tap_count?: number;
    tap_latency_avg_ms?: number;
    tap_latency_variance?: number;
    tab_blur_events?: number;
    cursor_leave_events?: number;
    scroll_distance?: number;
    
    // Per-game custom
    [key: string]: any;
  };
  
  // Engine outputs (computed post-session)
  consciousness_signals?: {
    attention_quality?: number;       // 0-1
    nervous_system_state?: 'calm' | 'activated' | 'shutdown' | 'coherent';
    reactivity_score?: number;        // 0-1
    witness_capacity?: number;        // 0-1
    impulse_control?: number;         // 0-1
    detected_loops?: string[];        // ['REA001', 'AVD003']
  };
  
  reflection_text?: string;           // AI-generated, 2-3 sentences
};
```

This schema is the **moat**. Every game pours into it. The Consciousness Engine reads from it.

---

## 2. The 46 Games — Deep Design

Each entry contains: **Concept · Mechanic · Inputs · Signals captured · Win/Fail · Visual & audio · AI usage · Build complexity (S/M/L/XL) · Engine output**.

---

### TIER A — FLAGSHIP (build world-class, ~1 month each)

---

#### 🔱 1. Breath Temple — *flagship #1*

**Concept.** A lotus floats in dark space. It blooms with your breath. Your nervous system, made visible.

**Mechanic.**
- 5-minute session.
- Mic captures breath cadence (rolling 30s window).
- Lotus petals open on inhale, close on exhale, *exactly* matching mic amplitude curve.
- At 5.5 breaths/min sustained for 90s → "coherence state" → lotus glows gold, ambient drone tunes to 432Hz.
- Erratic breath (>14 bpm or jagged amplitude) → petals fold, void darkens.
- Final 30s: a sentence appears letter-by-letter timed to the user's *actual* exhale: *"You breathed yourself into the room."*

**Inputs.** Mic only.

**Signals captured.**
- `breath_rate_bpm` (rolling avg)
- `breath_coherence_score` (0-1, % of session within 5-7 bpm)
- `breath_amplitude_variance` (jitter = stress proxy)
- `time_to_first_coherence_s`
- `coherence_sustained_max_s`

**Win.** 90s sustained coherence → final blessing screen + saved waveform shareable as image.
**Fail.** No fail. Erratic breath just means lotus stays small.

**Visual.** Three.js lotus, 12 petals, real-time vertex displacement driven by mic FFT. Particle "breath mist" emitted on each exhale.
**Audio.** Generative drone (Web Audio): 3 oscillators detuned slightly, low-pass filter cutoff = breath amplitude. Optional ElevenLabs whisper at end.

**AI usage.** Post-session: Groq generates 2-sentence reflection from breath stats.

**Complexity.** **L** (Three.js + breath detection + audio synth)

**Engine output.** Updates `nervous_system_state`, contributes to Witness dimension.

---

#### 🪞 2. Mirror Realm — *flagship #2*

**Concept.** An NPC speaks to you — sometimes praising, sometimes provoking. You respond by typing or speaking. The realm reads how you react, not what you say.

**Mechanic.**
- 6-minute session, ~8 exchanges.
- NPC opens with neutral statement, then escalates: praise → criticism → false accusation → silence.
- User responds via Deepgram STT (voice) or typing.
- Engine measures:
  - Time to start typing/speaking (latency)
  - Typing rhythm shifts (key-press intervals)
  - Voice pitch & speed delta from baseline
  - Word-level sentiment via Groq
- After session, NPC dissolves and reflects back: *"When I praised you, you typed 40% faster. When I accused you, you went silent for 8 seconds. Which one was you?"*

**Inputs.** Mic (Deepgram STT) + keyboard.

**Signals captured.**
- `response_latency_per_provocation_ms[]`
- `typing_kpm_baseline_vs_provoked`
- `voice_pitch_delta_hz`
- `voice_speed_wpm_delta`
- `sentiment_trajectory` (-1..+1 per response)
- `silence_events` (>5s no response)
- `walked_away` (tab-blur during provocation)

**Win.** Complete all 8 exchanges with reflection accepted.
**Fail.** No fail. Walking away = also a signal.

**Visual.** Single NPC face (one of 3 archetypes — Sage, Shadow, Mirror) rendered as stylized 3D portrait. Background shifts color with NPC's "mood": gold (praise), red (provocation), grey (silence).
**Audio.** ElevenLabs voice for NPC. User responses transcribed silently.

**AI usage.** Heavy. Groq for NPC dialogue generation, sentiment analysis, final reflection. Deepgram for STT.

**Complexity.** **XL** (NPC engine + dialogue tree + voice + biometrics)

**Engine output.** Reactivity score, ego activation patterns, detected loops (REA001 reactivity, VAL001 validation-seeking).

---

#### 📱 3. The Scroll — *flagship #3 (most viral)*

**Concept.** A fake social feed designed to provoke. Your job: just notice. The feed reads you back.

**Mechanic.**
- 4-minute session.
- Infinite-scroll feed of mixed content: outrage headlines, beautiful images, humblebrags, sad news, mundane updates.
- All AI-generated, never the same twice.
- Hidden mechanics:
  - Scroll velocity (fast = activated)
  - Dwell time per post (>3s = caught)
  - Tap interactions (like/share = engaged ego)
  - Mic ambient (sigh, laugh, mutter)
  - Heart rate proxy via tap rhythm if user taps to "like"
- After 4 min, feed freezes. One sentence appears: *"You spent 47 seconds on the post about your friend's promotion. What did you feel?"*
- User responds in journal field.

**Inputs.** Touch/scroll + mic ambient + optional typing.

**Signals captured.**
- `scroll_velocity_avg`, `scroll_velocity_peak`
- `dwell_time_per_post_ms[]` (categorized by post type)
- `engagement_taps` (likes, shares)
- `mic_events` (sighs, laughs)
- `most_dwelled_category` ('outrage'|'envy'|'beauty'|'mundane')
- `composite_stress_index` (0-1, derived)

**Win.** Complete 4 min + journal one sentence.
**Fail.** None.

**Visual.** Hyper-realistic mock social feed. Tailwind + good typography.
**Audio.** Subtle UI sounds. Mic listening silently.

**AI usage.** Groq generates feed content per session (cached for re-use). Groq analyzes journal + signals for final reflection.

**Complexity.** **XL** (feed gen + signal fusion + visual fidelity)

**Engine output.** Detected loops (envy, outrage attachment, doom-scroll), nervous system activation profile.

---

### TIER B — STRONG (build solid, ~1-2 weeks each)

---

#### 4. Bell in the Wind ✅ *(already shipped, upgrade path)*
**Concept.** Distant bell rings every 8-22s in black void. Don't look away.
**Upgrade for world-class.** Binaural bells (left/right ear shifts), drift detection map at end showing exactly when attention faltered, optional 20-min monastic mode.
**Inputs.** Tab-blur, cursor leave, scroll, optional mic for sigh detection.
**Signals.** `attention_breaks[]` with timestamps, `longest_continuous_attention_s`.
**Complexity.** **M** (already shipped, polish to L for flagship feel)

#### 5. Thought Watcher ✅ *(already shipped)*
**Concept.** Words drift up screen. Tap = "I saw it." Over-tap or under-tap both fail.
**Mechanic.** 2-min, 30 thoughts drift. Calibration: ~70% tap rate is "witness mode"; 100% is "grasping"; <30% is "drifted".
**Signals.** `tap_rate`, `tap_rhythm_variance`, `category_bias` (which thought-types they tap most).
**Complexity.** **S**

#### 6. Body Scanner ✅ *(already shipped)*
**Concept.** 12 body zones. Tap only where you feel sensation.
**Upgrade.** Add "honesty check" — too-rhythmic tapping = fakery; pause and ask user to truly feel.
**Signals.** `zones_with_sensation[]`, `tap_rhythm` (for fakery detection), `interoception_score`.
**Complexity.** **S**

#### 7. The Pause ✅ *(already shipped)*
**Concept.** Button pulses "Press me." Survive 90s without pressing.
**Signals.** `presses`, `time_to_first_press_s`, `near_press_events` (cursor hover).
**Complexity.** **S**

#### 8. Silent Mountain ✅ *(already shipped)*
**Concept.** Long-form stillness. Black screen. Just be.
**Upgrade.** Mic ambient capture during session → post-session "soundscape" played back showing what *was* in the silence.
**Signals.** `duration`, `tab_blur_events`, `mic_event_density`, `device_motion_events`.
**Complexity.** **M**

#### 9. Non-Dual Door ✅ *(already shipped)*
**Concept.** Tap = door stays closed. 3 min idle = door opens to "Already".
**Signals.** `taps`, `longest_idle_streak_s`, `completion`.
**Complexity.** **S**

#### 10. The Sigh
**Concept.** A landscape. Don't try anything. The mic listens for spontaneous sighs (involuntary parasympathetic releases).
**Mechanic.** 5 min. Each detected sigh → a particle releases from your chest in the visual, and a single soft chime plays.
**Detection.** Mic FFT pattern: sharp inhale + long exhale + voicing. Custom classifier (rule-based first, ML later).
**Signals.** `sigh_count`, `time_to_first_sigh_s`, `sigh_intervals_ms[]`.
**Complexity.** **M** (sigh detection is the hard part)

#### 11. Two Mirrors *(needs webcam — defer to v2)*
**Concept.** Webcam shows you your own face. Look at it without looking away. No filters.
**Mechanic.** 3 min. face-api.js tracks gaze direction. Each look-away resets a "presence" meter.
**Signals.** `gaze_stability_pct`, `look_away_count`, `micro_expression_events`.
**Complexity.** **L** (webcam permission flow + face tracking)

#### 12. Emotional Resonance ✅ *(already shipped)*
**Concept.** Character speaks slowly-revealing text every 6-10s. Mic interruption = story resets.
**Upgrade.** Generative story per session via Groq.
**Signals.** `interruption_count`, `silence_held_s`.
**Complexity.** **M**

---

### TIER C — QUICK WINS (3-7 days each)

---

#### 13. Candle in the Storm
**Concept.** Hold device steady. Tilt jitter blows out the flame.
**Mechanic.** Device motion API (`DeviceOrientationEvent`). Flame opacity = inverse of motion variance.
**Signals.** `motion_variance`, `time_steady_s`.
**Complexity.** **S**

#### 14. Two Hands
**Concept.** Tap left/right alternating to a target rhythm. Measures bilateral attention.
**Signals.** `rhythm_accuracy`, `hand_drift` (which side falls off first).
**Complexity.** **S**

#### 15. Floor Beneath the Floor
**Concept.** Static scene. Subtle elements change every 8-15s. Tap when you notice.
**Signals.** `change_detection_latency[]`, `false_positives`.
**Complexity.** **M** (need scene composition system)

#### 16. Listen for the Bird
**Concept.** Ambient forest sound. Bird call hidden inside. Tap the instant you hear it.
**Signals.** `auditory_latency_ms`, `false_positive_taps`.
**Complexity.** **S**

#### 17. Cold Water
**Concept.** Imagine plunging into ice water. Hold breath while a counter ticks. Mic verifies you're not breathing.
**Signals.** `held_breath_s`, `breath_recovery_pattern`.
**Complexity.** **M**

#### 18. The Yawn Loop
**Concept.** Tap when you feel a yawn coming, not when it happens. Trains interoception.
**Signals.** `predicted_yawns`, `actual_yawns` (mic detected), `prediction_accuracy`.
**Complexity.** **M**

#### 19. Sound Microscope ✅ *(already shipped)*
**Concept.** Drone with sub-tones shifting 1Hz/30s. Tap on shift.
**Signals.** `shift_detection_latency_ms`.
**Complexity.** **S**

#### 20. Who Is Thinking? ✅ *(already shipped)*
**Concept.** One thought, three buttons. Dwell time = world shift.
**Signals.** `dwell_time_ms`, `choice_pattern`.
**Complexity.** **S**

#### 21. The Compliment Trap
**Concept.** AI gives you a compliment. You choose: accept / deflect / inquire. Latency reveals self-worth pattern.
**Signals.** `choice`, `latency_ms`, `pattern_over_sessions`.
**Complexity.** **S**

#### 22. Whose Voice?
**Concept.** A statement appears: *"You should be more careful."* Three buttons: Mom / Dad / Mine. Pattern over sessions reveals inherited voices.
**Signals.** `attribution_pattern`, `latency_ms`.
**Complexity.** **S**

#### 23. The Apology
**Concept.** Type an apology to someone. Typing biometrics reveal emotional load.
**Signals.** `typing_kpm`, `pause_count`, `backspace_count`, `dwell_per_word_ms`.
**Complexity.** **S** (typing capture already exists)

#### 24. The Other Side
**Concept.** Two opposing views on a topic. Dwell time on each measured. Cross-pollination training.
**Signals.** `dwell_balance`, `final_choice`.
**Complexity.** **S**

#### 25. The Grieving Room
**Concept.** A name or phrase the user enters earlier appears. The room is silent. The only correct response is silence.
**Signals.** `silence_held_s`, `mic_events`, `tab_blur`.
**Complexity.** **S**

#### 26. The Stranger's Song
**Concept.** Audio in an unfamiliar language. User rates emotion they detect. Pre-verbal empathy.
**Signals.** `emotion_guess`, `confidence`, `accuracy_vs_truth`.
**Complexity.** **M** (need audio library)

#### 27. Subtract Yourself
**Concept.** 8 identity cards (mother, engineer, brother...). Drag to remove in order. Order reveals attachment hierarchy.
**Signals.** `removal_order`, `pause_per_removal_ms`.
**Complexity.** **S**

#### 28. The Question Behind the Question
**Concept.** User types a question. AI asks: "What's the question behind that?" Repeat 5x. Final root revealed.
**Signals.** `depth_reached`, `semantic_drift_score`.
**Complexity.** **S** (Groq-driven)

#### 29. The Question with No Answer
**Concept.** A koan appears. User must sit with it for N min without typing. Mic + idle measured.
**Signals.** `tolerance_s`, `mic_mutter_events`.
**Complexity.** **S**

#### 30. The Slow Tap
**Concept.** No clock. Tap the button at exactly 60s. Trains time perception.
**Signals.** `actual_time_ms`, `error_ms`, `pattern_over_sessions`.
**Complexity.** **S**

#### 31. The 30-Second Mind
**Concept.** Tap whenever your mind wanders. After 3 min, AI shows the wander map.
**Signals.** `wander_taps`, `wander_intervals_ms[]`.
**Complexity.** **S**

#### 32. The Red Door
**Concept.** A door. A button: "Open." Pressing does nothing for a random 30-180s. Patience training.
**Signals.** `presses_during_wait`, `gave_up`.
**Complexity.** **S**

#### 33. The Two Chairs
**Concept.** Two equally valid choices. Toggle between them. Oscillation pattern measured.
**Signals.** `toggle_count`, `final_dwell_ratio`, `final_choice_latency_ms`.
**Complexity.** **S**

#### 34. Real-World Quest ✅ *(already shipped)*
**Concept.** App locks N minutes: *"Sit in a park. Return when done."* Reflection on return.
**Signals.** `away_duration_s`, `reflection_text`.
**Complexity.** **S**

#### 35. Death Practice
**Concept.** Stoic memento mori. *"You have 7 days to live. Write what matters."* Timed reflection.
**Signals.** `word_count`, `typing_pause_pattern`, `themes_detected` (Groq).
**Complexity.** **S**

---

### TIER D — DEEP IP / EXPERIMENTAL (build later when validated)

---

#### 36. Breath Ladder
4-7-8 guided breath, mic verifies actual exhale length matches target.
**Complexity.** **M**

#### 37. The Witness Wall
60s of nothing. Measures urge-to-do via micro-movements (touchstart, scroll attempts, tab-blur).
**Complexity.** **S**

#### 38. Inner Weather
"Name your state in one word." AI rephrases until user says "yes, that's it." Trains emotional granularity.
**Complexity.** **S**

#### 39. The Loop Mirror
User types a sentence. AI plays it back (TTS) in altered tone (loving / cold / mocking). Reaction measured.
**Complexity.** **M** (ElevenLabs voice modulation)

#### 40. One Word
Each session: write one word for how you are. Tracked over 90 days. Visualized as river.
**Complexity.** **S**

#### 41. The Listening Tree
Mic records 60s ambient. AI describes "what it heard about you." Pure poetry output.
**Complexity.** **M** (Deepgram + Groq)

#### 42. Permission Slip
*"Write what you'd do if no one was watching."* Sealed for 30 days. Returns as notification.
**Complexity.** **S**

#### 43. The Future Letter
Game-form Future Self letter. Arrives at random moment via push notification.
**Complexity.** **M** (notification scheduling)

#### 44. Council of Three
3 master archetypes argue your dilemma in real time. ElevenLabs voices, Groq dialogue.
**Complexity.** **L**

#### 45. The Empty Room
No UI. Black screen. Your breath. Ends only when user says "enough" (mic).
**Complexity.** **M**

#### 46. Heart Coherence Bridge — *REPLACED*
~~Original: webcam HRV.~~ **New version:** Mic-based 5.5 bpm coherence game. Orb expands/contracts at target rate. Mic detects actual breath. Bridge stabilizes with coherence. Same neuroscience claim, zero hardware.
**Complexity.** **M** (overlaps with Breath Temple — could be a Breath Temple variant)

---

## 3. Build Phasing

### Phase 1 — Foundation (Week 1-2)
- Define `game_sessions` schema + `signals` JSONB
- Build shared `useMicLevel` ✅ done
- Build shared `useTypingBiometrics` hook
- Build shared `useIdleTracker` hook
- Deepgram edge function (single-use token)
- ElevenLabs TTS edge function ✅ done

### Phase 2 — Polish existing 9 to "good" (Week 3)
Games 4-9, 12, 19, 20, 34 — already shipped, raise to "solid" tier.

### Phase 3 — Ship Tier C quick wins (Week 4-5)
Games 13, 14, 16, 21, 22, 23, 25, 27, 30, 31, 32, 33, 35 — all S complexity, all use existing primitives.

### Phase 4 — Build flagship #1: Breath Temple (Week 6-9)
World-class. Three.js lotus, generative audio, mic breath detection, shareable waveform.

### Phase 5 — Build flagship #2: The Scroll (Week 10-13)
Generative feed, hidden mechanics, journal close. Most viral candidate.

### Phase 6 — Build flagship #3: Mirror Realm (Week 14-17)
NPC engine, Deepgram STT, voice biometrics, dialogue tree.

### Phase 7 — Tier B remaining (Week 18-22)
The Sigh, Cold Water, Floor Beneath the Floor, The Yawn Loop, Listening Tree.

### Phase 8 — Webcam tier (when iOS Safari pain accepted)
Two Mirrors. Defer until v2.

---

## 4. The Real Question — Should we be a games company?

**No. We are a consciousness-engine company that ships games as the most addictive surface.**

Calm/Headspace = passive content. Lumosity = dopamine. Nothing on Earth reads consciousness signals as the win condition. **That's the moat.** The games are a Trojan horse for the data layer.

Defensibility = **(unique signal pipeline) × (Consciousness Engine learning from millions of micro-sessions) × (Temple/Master integration nobody else has)**.

Build 3 world-class flagships + 30 quick wins. Let the engine compound. Patent the pipeline (sound-reactive witness, voice-prosody nervous-system, mic-coherence detection, typing-biometric ego activation).

---

## 5. What I need from you to start building

Pick one:
- **A. Build Phase 1 foundation now** (schema + Deepgram + shared hooks) so every future game plugs in cleanly
- **B. Build flagship #1 (Breath Temple) end-to-end** as the proof-of-concept for "world-class"
- **C. Polish all 9 already-shipped games to Tier B quality first**

My vote: **A → B → C.** Foundation before flagship before polish.
