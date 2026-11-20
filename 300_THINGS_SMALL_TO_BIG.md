# 300 Things To Do On This App — Small To Big

Ordered backlog for SATYUG / HOPE / ConsciousOS. Items ascend from 1-line fixes to multi-month platform bets. Each tier is roughly the effort of one item, not the whole tier.

- Tier 1: Micro (15 min – 2 h) — items 1–75
- Tier 2: Small (half day) — items 76–150
- Tier 3: Medium (1–3 days) — items 151–225
- Tier 4: Large (1–2 weeks) — items 226–275
- Tier 5: Epic (1–3 months) — items 276–300

Existing companions: `1000_FEATURE_IDEAS.md` (app-domain ideas), `AUDIT_1000_THINGS.md` (engineering audit). This file is the execution-ordered subset.

---

## Tier 1 — Micro (items 1–75)

1. Delete or relocate root build artifacts (`b3.log`–`b15.log`, `build*.log`, `tsc*.txt`, `tmp-*.mjs`) so the root is navigable.
2. Add `logs/`, `dist2/`, `dist3/`, `media-cache/` to `.gitignore`.
3. Fix README quickstart so dev/build/test commands match `package.json`.
4. Add an npm `clean` script that removes `dist*` and log files.
5. Add missing alt text to landing hero and section images.
6. Add `focus-visible` rings to every icon-only button.
7. Raise mobile nav hit areas to 44x44 px minimum.
8. Guard the orb pulse animation behind `prefers-reduced-motion`.
9. Show keyboard shortcut hints inside the cmdk command palette.
10. Add "copy link" to knowledge essay pages.
11. Show estimated reading time on knowledge essay headers.
12. Add an empty state with a first-entry CTA to Journal.
13. Add an empty state to Loops when filters match nothing.
14. Add a "clear filters" button to the Loops filter bar.
15. Persist Loops filter state in the URL query string.
16. Add skeleton loaders to the Knowledge category grid.
17. Add a retry button when a session composer request fails.
18. Toast when an action needs network while offline.
19. Show app version and build hash in the Settings footer.
20. Show a "last synced" timestamp in the Memory Vault.
21. Add copy-to-clipboard on guide chat messages.
22. Add a "new conversation" reset button to Guide.
23. Autosize the Journal textarea as the user types.
24. Show a character count on Journal entries.
25. Add a "draft saved" indicator to the Journal editor.
26. Add "mark all read" to nudges/notifications.
27. Add an unread count badge to the nudges nav item.
28. Add an `aria-live` region announcing session phase changes.
29. Add a skip-to-content link in the app shell.
30. Set `<html lang>` from `LanguageContext`.
31. Add tooltips and labels to orb control buttons.
32. Persist sound volume across reloads.
33. Mute session audio when the tab loses focus (setting-gated).
34. Add 5/10/20 minute quick-start chips to Practice.
35. Add a "resume last session" card to Home.
36. Use date-fns relative timestamps on journal entries.
37. Add newest/oldest sorting to the journal list.
38. Add search to the Handbook/glossary.
39. Add anchor links to Handbook section headings.
40. Add a print stylesheet for Handbook pages.
41. Add an Open Graph fallback image for blog posts.
42. Add canonical URL tags for blog and knowledge routes.
43. Add blog and knowledge entries to the sitemap.
44. Add `noindex` robots meta for authenticated `/app/*` routes.
45. Make the 404 page suggest Home, Explore, and search.
46. Wrap the orb canvas in an error boundary with a 2D fallback.
47. Replace blank Suspense fallbacks with background-matched placeholders.
48. Route console output through a dev-only logger guard.
49. Run `npm run lint:strict` and fix warnings in touched files.
50. Record canonical commands (typecheck, lint, test, build) in AGENTS.md.
51. Add a PR template with typecheck/lint/test checkboxes.
52. Add a GitHub issue template for bug reports.
53. Add a Dependabot config for weekly npm updates.
54. Pin the Node version in `engines` and add `.nvmrc`.
55. Add a pre-commit hook running lint-staged.
56. Document the commit message convention used in this repo.
57. Add CI step running `npm test`.
58. Cache dependencies in the CI workflow.
59. Add a bundle-size budget check to CI.
60. Add a `build:analyze` script using a rollup visualizer.
61. Configure Playwright trace retention for failed runs.
62. Verify the orb screenshot baseline is committed and current.
63. Unit test streak grace-period logic.
64. Unit test V-Level progression thresholds.
65. Unit test the loop filter reducer.
66. Add a smoke test that every route renders without crashing.
67. Add a mock Supabase client fixture for tests.
68. Add an ElevenLabs mock so guide tests never hit the network.
69. Add `aria-label` to canvas and video elements.
70. Raise muted text contrast to pass 4.5:1.
71. Check dark/light parity for every new component.
72. Add a "reduce data usage" toggle that hides ambient video.
73. Lazy-load Explore card images.
74. Set width/height on media to stop layout shift.
75. Add a `prefers-reduced-transparency` fallback for glass panels.

## Tier 2 — Small (items 76–150)

76. Add a session-length filter to Explore.
77. Add multi-select tag chips to Explore.
78. Replace page pagination with virtualized infinite scroll.
79. Switch Explore queries to cursor-based pagination.
80. Build global search across knowledge, loops, practices, and programs.
81. Wire the command palette to real actions (start session, open journal, jump to a loop).
82. Add roving-tabindex keyboard navigation to the loop grid.
83. Add "related loops" to loop detail pages.
84. Deep-link loop detail pages to matching practices.
85. Generate a privacy-safe shareable loop card image on canvas.
86. Add a Journal template picker (gratitude, inquiry, mirror).
87. Build Journal tag management UI.
88. Add full-text search over journal entries.
89. Add Markdown export for a single journal entry.
90. Add a mood/energy quick check-in widget to Home.
91. Include the check-in in the composer context snapshot payload.
92. Add a "why this session" explainer panel before starting.
93. Collect per-ingredient thumbs feedback during sessions.
94. Add a three-field post-session reflection prompt.
95. Show a session summary card (duration, loop touched, insight).
96. Add "bookmark this moment" during a session.
97. Persist session pause/resume state across reloads.
98. Build an ambient sound mixer with per-layer volume.
99. Add guide voice previews and a favorites list.
100. Add playback speed control for guide TTS audio.
101. Add captions/subtitles to guide audio.
102. Add a post-session transcript view with copy.
103. Cache the last three sessions for offline replay.
104. Show the PWA install prompt after the second session.
105. Add an app icon badge for daily practice (Capacitor).
106. Add a local notification schedule in Settings.
107. Add quiet hours for notifications.
108. Build the streak-freeze UI and explain its rules.
109. Add a weekly practice-minutes goal editor.
110. Add a calendar heatmap of practice days.
111. Add an H-Level radar chart to YourSelf.
112. Add a V-Level milestone timeline with dates.
113. Add a Gates readiness explainer with a next-action CTA.
114. Show Kosha Scanner result history.
115. Save and revisit Dharma Oracle readings.
116. Add note capture to Council sessions.
117. Build Master profile pages with sample teachings.
118. Add a compare view for masters (tradition, tone, depth).
119. Add a First Eleven progress checklist.
120. Add Foundation Course resume and per-lesson notes.
121. Add prev/next day navigation with persisted progress in programs.
122. Generate a program completion certificate PDF.
123. Track game score history and personal bests.
124. Add game difficulty presets.
125. Add a first-play tutorial overlay to games.
126. Pause games and sessions on tab visibility change.
127. Emit analytics events for session start/complete/abandon.
128. Build the activation funnel dashboard (signup → first session → week 1).
129. Add client error tracking (Sentry or a Supabase table).
130. Log composer decisions in a structured, queryable format.
131. Add a feature-flag table and client hook.
132. Add an A/B wrapper for Home layout experiments.
133. Add rate limiting to edge functions.
134. Validate every edge endpoint payload with zod.
135. Centralize user-facing error message mapping.
136. Handle auth token refresh and redirect on expiry.
137. Add route guards for `/app/*` with `returnTo`.
138. Gate `/app/ops` and admin routes by role.
139. Write an RLS test checklist for each table.
140. Add `supabase db diff` drift checking to CI.
141. Add a demo-user seed with loops, journal, and sessions.
142. Add Ladle or Storybook for design-system components.
143. Add visual regression tests for five critical components.
144. Document design tokens (color, type, spacing, motion).
145. Add motion duration tokens and apply them to framer transitions.
146. Audit lucide imports and dedupe icon usage.
147. Split three.js and recharts into separate chunks.
148. Prefetch top routes on link hover.
149. Add route-level loading skeletons.
150. Document the loading/empty/error state matrix per page.

## Tier 3 — Medium (items 151–225)

151. Build a unified Explore search index (client + edge).
152. Rank Explore by active loops and V-Level.
153. Add knowledge learning paths with progress tracking.
154. Add a knowledge-graph edge editor in admin.
155. Add spaced-repetition review for knowledge cards.
156. Build a "daily card" widget fed by the SR queue.
157. Add a local rules-based composer fallback for edge outages.
158. Build a composer dry-run/debug panel in Ops.
159. Add ingredient library CRUD in admin.
160. Track ingredient usage and effectiveness scores.
161. Build a mirror live-detection tuning dashboard.
162. Add fixture-driven tests for the loop-signal pipeline.
163. Add a weekly pattern-memory consolidation job.
164. Build a memory browser with layer filters and delete.
165. Add GDPR-style memory export as JSON.
166. Build account deletion with a grace period.
167. Add granular consent for mic, camera, and sensors.
168. Surface the data retention policy in Settings.
169. Encrypt the local journal cache (idb-keyval + WebCrypto).
170. Handle multi-device journal sync conflicts.
171. Add optimistic updates for journal and settings mutations.
172. Add a background sync queue for offline writes.
173. Cache the full app shell offline with a version banner.
174. Add an update-available toast with skip-waiting.
175. Use native share sheets on mobile for share cards.
176. Wrap haptics with a graceful web no-op.
177. Handle iOS safe areas across all screens.
178. Handle the Android hardware back button.
179. Add deep links to sessions (`/s/:id`).
180. Configure universal links for iOS and Android.
181. Automate app icon and splash generation.
182. Set up Android release signing and a Play internal track.
183. Write the iOS TestFlight pipeline doc.
184. Evaluate and scaffold a Tauri desktop build.
185. Produce an i18n coverage report per locale.
186. Fix RTL layout for ar/he/ur.
187. Use locale-aware date and number formatting.
188. Write the translation contribution guide and fallback rules.
189. Document the voice/TTS language support matrix.
190. Run an axe accessibility audit on the top 10 routes.
191. Script and test screen-reader flow through a session.
192. Add captions to all cinematic landing videos.
193. Provide a color-blind-safe chart palette.
194. Add font subsetting, preload, and swap strategy.
195. Add a CDN image transform helper (width/format params).
196. Add media-manifest diff checking to CI.
197. Add an orphaned-asset report script.
198. Add Lighthouse CI budgets for performance, a11y, and SEO.
199. Instrument orb first-frame performance marks.
200. Add a dev-flag React profiler capture mode.
201. Check for memory leaks on session unmount.
202. Cancel in-flight fetches on route change.
203. Tune React Query persistence (`maxAge`, buster, partialize).
204. Add retry/backoff policy for Supabase queries.
205. Animate gate unlocking optimistically.
206. Allow streak repair through a micro-session.
207. Build the weekly digest email.
208. Build a three-touch re-engagement email sequence.
209. Add referral codes and an attribution table.
210. Generate shareable milestone cards.
211. Add post-milestone testimonial collection.
212. Build the pricing page with plan comparison.
213. Add a paywall component and entitlement checks.
214. Add Stripe checkout plus a webhook edge function.
215. Link to the Stripe customer portal for billing.
216. Enforce free-tier limits with graceful upgrade UX.
217. Build the gift subscription flow.
218. Add coupon support.
219. Provide invoice and receipt access.
220. Build an admin revenue dashboard.
221. Add an in-app support inbox backed by Supabase.
222. Build a searchable help center.
223. Add a changelog page with RSS.
224. Add a status page for edge functions.
225. Write the incident response runbook.

## Tier 4 — Large (items 226–275)

226. Rebuild Home as a user-arrangeable widget grid.
227. Build a "Today" orchestration service returning the full day plan in one call.
228. Build session recording and a replayable "practice film" export.
229. Build a cinematic journey editor (timeline, cues, audio).
230. Build the temple scene pipeline (GLB ingest, LODs, lighting presets).
231. Build an orb shader system with presets and runtime parameters.
232. Add a WebGPU renderer path with WebGL fallback.
233. Build a layered ambient audio engine with ducking and spatialization.
234. Build the guide voice pipeline (ElevenLabs, cache, fallback TTS).
235. Build real-time voice conversation (Deepgram STT + streaming TTS).
236. Build the mirror live-signal engine (typing, pauses, sentiment).
237. Build and evaluate the loop-detection service.
238. Build personalization engine v2 (bandit over ingredients).
239. Build a "practice DNA" profile editor.
240. Build the progress analytics suite (trends, correlations, exports).
241. Build a goal system with outcomes, milestones, and reviews.
242. Build coach mode with a weekly review ritual.
243. Build cohort programs (groups, schedules, shared sessions).
244. Build community circles with moderation tooling.
245. Build the enterprise tenant model (orgs, seats, SSO).
246. Add SAML SSO and SCIM provisioning.
247. Build an audit log for enterprise admins.
248. Build a CMS for programs, days, and atoms.
249. Build a content review workflow with approvals.
250. Build the localization pipeline (TMS sync, QA states).
251. Build an offline-first sync engine with conflict resolution.
252. Add multi-profile support (family or partner).
253. Integrate HealthKit and Health Connect.
254. Recommend sessions from sleep and HRV signals.
255. Build the journal-to-insight weekly summarizer.
256. Add embedding-based memory consolidation and retrieval.
257. Add semantic search over personal memory.
258. Build "ask your journal" Q&A with citations.
259. Build a privacy dashboard (what is stored, why, how to delete).
260. Add an on-device inference path for sensitive signals.
261. Add end-to-end encryption for journal and memory.
262. Build full-account export and import archives.
263. Build subscription analytics with churn cohorts.
264. Build an experimentation platform (flags, metrics, guardrails).
265. Build design system v2 with tokens, docs, and codegen.
266. Add automated visual regression across breakpoints.
267. Build RUM observability with traces and alerts.
268. Build the release pipeline (versioning, changelog, staged rollout).
269. Automate native releases with Fastlane.
270. Load-test composer and session APIs.
271. Run disaster-recovery drills and verify backups.
272. Establish a security program (threat model, pen test).
273. Complete a WCAG 2.2 AA accessibility certification pass.
274. Build the SEO/content engine with schema and programmatic pages.
275. Build the growth loop (invites, streaks, share cards) with metrics.

## Tier 5 — Epic (items 276–300)

276. Launch web beta with a waitlist and full funnel instrumentation.
277. Ship v1 iOS and Android with a parity matrix.
278. Launch the persistent "Living Temple" 3D world with presence.
279. Build WebXR/VR temple practice mode.
280. Build an AI guide marketplace with teacher licensing and revenue share.
281. Build a certified facilitator program and B2B licensing.
282. Build a multi-tenant white-label platform.
283. Build real-time group practice rooms (audio/video, synced sessions).
284. Build a multi-year adaptive curriculum engine across V-Level arcs.
285. Integrate clinical/wellbeing partners with referral and measurement.
286. Run an outcome research program using validated instruments.
287. Build a personal model that learns your practice style over years.
288. Build cross-device continuity (start on phone, finish on desktop/TV).
289. Build a TV/console ambient practice app.
290. Build a fully hands-free voice-first journey mode.
291. Build a generative music engine tied to session phase.
292. Build generative visual art export from sessions.
293. Build a "digital twin" of practice history for simulations.
294. Build an agentic companion that schedules practice autonomously (with consent).
295. Build an open API and SDK for third-party practices.
296. Build a plugin system for community-created session atoms.
297. Build an anonymized benchmark dataset and research dashboard.
298. Localize fully into 30 languages with native voice talent.
299. Build the "designed for obsolescence" graduation flow and alumni community.
300. Build the 10-year archival vault: an exportable life practice record.
