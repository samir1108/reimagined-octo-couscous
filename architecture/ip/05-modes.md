# 5. Modes — Silent, Cinematic, Temple, Adaptive vs. Structured

**Core files/dirs:** `src/contexts/CinematicSessionContext.tsx`, `src/components/SilentModeShell.tsx`, `src/pages/Temple.tsx`, `src/pages/temple/*`, `src/lib/sutra/modeRegistry.ts`, `src/contexts/SessionOrchestratorContext.tsx`

### 5.1 Cinematic Mode

`CinematicSessionContext` is a global, app-wide provider (mounted once in `AppLayout`) exposing a simple `play({ scriptId | practice, guruImage, guruName, onComplete, onExit })` API and an `isPlaying` flag. Any surface in the app — Guide chat, Practice pages, Witness sessions — can call `play()` to trigger a **full-screen immersive overlay** (`CinematicSession` component) rendering a specific `CinematicScript` resolved via `pickScript()` in `src/lib/cinematic/registry.ts`. Scripts can be resolved either by an explicit `scriptId` or by matching against a `Practice` from the practice constellation (Section 3.6), and the resolver is guide-aware (accepting `guruImage`/`guruName` so the cinematic layer can visually brand itself to whichever master is currently guiding the user). This is the technology underpinning the "Live Session" pages (`PranayamaLiveSession`, `NetiNetiLiveSession`, `SelfInquiryLiveSession`, `WitnessLiveSession`, `MantraLiveSession`, `PracticeLiveSession`) and likely the sensorial-practice scripts in Section 3.3 — a single reusable full-screen player driven by declarative script data rather than bespoke per-practice UI.

### 5.2 Silent Mode

`SilentModeShell.tsx` implements a distraction-free, minimal-chrome shell — the stripped-down opposite of the cinematic overlay: rather than rich visuals/audio, silent mode strips the UI down to essentials for practices where visual stimulation would undermine the state being cultivated (long sits, pure witness practice, etc.). It functions as an alternate "wrapper" a session can be rendered inside of, sitting alongside the cinematic overlay as one of the delivery modes registered in `modeRegistry.ts`.

### 5.3 Temple Mode

`Temple.tsx` is a large, cinematic marketing/onboarding experience (an "Awwwards register" walkthrough per its own code comment) structured as a phase machine: `vision → sam (branching) → grid → world (deep-dive)`. It uses a custom cursor (`CustomCursor.tsx`), particle effects (`EmberParticles.tsx`), a starfield background, an "ecosystem mandala" visualization (`EcosystemMandala.tsx`) mapping the product's different "worlds," and a `WorldDeepDive` component for exploring an individual world once selected. `worldData.ts` defines the catalog of `World` entries (`WORLDS`, `WORLDS_BY_ID`) that this phase machine navigates between — essentially a visual sitemap/hub for the whole product, framed as walking through a mystical temple rather than a conventional landing page. Supporting components under `src/components/temple/` (`TempleChat`, `TempleGuidance`, `TempleLibrary`, `TempleCalendar`, `TempleDiscover`, `TempleHistory`, `TempleVows`, `TempleEntrance`, `TempleError`) suggest Temple mode also anchors an ongoing in-app "sanctuary" hub distinct from the marketing walkthrough — chat, a content library, a calendar, personal history, and a "vows" (commitment/intention-setting) feature.

### 5.4 Adaptive vs. Structured Delivery

The band/dimension engine (Section 1) and the practice constellation (Section 3.6) together define an **adaptive mode**: content, pacing, and guide selection are computed dynamically per user from their current V-Level, dimension gaps, speed profile, and recent quality/consistency — this is the default, AI-orchestrated experience (`SessionOrchestratorContext.tsx`, `sessionGenerator.ts`, `dynamicGuruSelector.ts`).

Structured mode is represented by the fixed-curriculum surfaces — the Foundation Course (Section 3.4, a literal day-by-day fixed sequence) and the numbered Programs (Section 3.5, e.g. "21 Days of Self-Inquiry") — where the sequence and content are pre-authored and identical for every user who opts in, rather than computed live. In effect, ConsciousOS offers a spectrum: **fully adaptive** (the AI decides what's next every session, tuned to real-time dimension scores) at one end, and **fully structured** (fixed day-N content, same for everyone) at the other, with the guide/master rotation and cross-pollination mechanics providing the adaptive layer's texture even inside otherwise-structured programs.

---
