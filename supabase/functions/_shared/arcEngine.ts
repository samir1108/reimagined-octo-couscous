/**
 * ARC ENGINE — Multi-Day Theme Arcs (7/21/49-day journeys)
 *
 * Pure functions consumed by generate-theme. Given an active arc + today's
 * journey signals, produce:
 *   • a chapter directive that biases the AI toward Day-N-of-M continuity
 *   • adaptive intelligence (skip/breakthrough/regression handling, harvest)
 *   • lunar/seasonal flavor
 */

export type ArcStatus = "active" | "completed" | "paused" | "abandoned" | "harvested";
export type ArcMarker = "normal" | "breakthrough" | "skip" | "rest" | "pivot" | "harvest";

export interface ArcRow {
  id: string;
  title: string;
  intention?: string | null;
  duration_days: number;
  current_day: number;
  current_phase: string;
  status: ArcStatus;
  source: string;
  voice_style: string;
  primary_path?: string | null;
  primary_practice?: string | null;
  primary_chakra?: string | null;
  assigned_guru?: string | null;
  spirit?: any;
  template_id?: string | null;
  started_at: string;
  expected_end_date?: string | null;
}

export interface ArcTemplateRow {
  id: string;
  slug: string;
  title: string;
  sanskrit_title?: string | null;
  modern_title?: string | null;
  duration_days: number;
  voice_style: string;
  primary_path?: string | null;
  primary_practice?: string | null;
  primary_chakra?: string | null;
  assigned_guru?: string | null;
  tradition?: string | null;
  phase_structure: any[];
  harvest_template: any;
  difficulty: string;
}

export interface ArcChapterRow {
  day_number: number;
  phase?: string | null;
  marker?: ArcMarker | null;
  user_reflection?: string | null;
  quality_score?: number | null;
  chapter_summary?: string | null;
}

export interface ArcDirectiveInput {
  arc: ArcRow;
  template?: ArcTemplateRow | null;
  recentChapters: ArcChapterRow[]; // newest first, ≤7
  yesterdayMood?: number | null;
  yesterdayEnergy?: number | null;
  breakthroughDetected?: boolean;
  regressionDetected?: boolean;
  todayISO: string;
  spiritualDnaPaths?: string[]; // for adaptive voice
}

export interface ArcDirective {
  isHarvestDay: boolean;
  isRestChapter: boolean;
  shouldFastForward: boolean;
  effectiveDay: number;       // adjusted day if skip/rest happened
  totalDays: number;
  phaseLabel: string;
  phaseSlug: string;
  chapterLabel: string;       // "Chapter 4 of 21"
  voiceMode: "sanskrit" | "modern" | "blend";
  promptDirective: string;    // ready to inject into AI prompt
  metadata: Record<string, any>;
}

// ─── Phase resolution ────────────────────────────────────

export function resolvePhase(arc: ArcRow, template?: ArcTemplateRow | null): { phase: string; label: string } {
  const day = arc.current_day;
  const struct = template?.phase_structure ?? arc.spirit?.phase_structure ?? [];
  if (!Array.isArray(struct) || struct.length === 0) {
    // Fallback: ground/deepen/integrate thirds
    const total = arc.duration_days;
    if (day <= total / 3) return { phase: "ground", label: "Grounding" };
    if (day <= (total * 2) / 3) return { phase: "deepen", label: "Deepening" };
    return { phase: "integrate", label: "Integration" };
  }
  for (const block of struct) {
    const range = String(block.day_range || "");
    const [a, b] = range.split("-").map((n) => parseInt(n, 10));
    const lo = isNaN(a) ? 1 : a;
    const hi = isNaN(b) ? lo : b;
    if (day >= lo && day <= hi) {
      return { phase: String(block.phase || "ground"), label: String(block.label || "Phase") };
    }
  }
  return { phase: String(struct[struct.length - 1].phase || "integrate"), label: String(struct[struct.length - 1].label || "Integration") };
}

// ─── Voice resolution ────────────────────────────────────

export function resolveVoice(
  arcVoice: string,
  templateVoice: string | undefined,
  dnaPaths?: string[],
): "sanskrit" | "modern" | "blend" {
  const v = (templateVoice || arcVoice || "adaptive").toLowerCase();
  if (v === "sanskrit") return "sanskrit";
  if (v === "modern") return "modern";
  // adaptive: lean Sanskrit if user is Bhakti/Jnana, modern if not
  const sanskritLeaning = ["bhakti", "jnana", "raja", "kriya", "tantra"];
  const hit = (dnaPaths || []).some((p) => sanskritLeaning.includes(String(p).toLowerCase()));
  return hit ? "blend" : "modern";
}

// ─── Lunar / seasonal flavor ─────────────────────────────

export function lunarFlavor(todayISO: string): { phase: string; nudge: string } | null {
  // Cheap synodic-month approximation. New moon at 2000-01-06.
  const refNew = Date.UTC(2000, 0, 6);
  const today = new Date(todayISO).getTime();
  const synodic = 29.530588853 * 86400000;
  const age = ((today - refNew) % synodic + synodic) % synodic;
  const dayInCycle = age / 86400000;
  if (dayInCycle < 2) return { phase: "new_moon", nudge: "New moon — release, plant intention, begin." };
  if (dayInCycle > 13.5 && dayInCycle < 15.5) return { phase: "full_moon", nudge: "Full moon — reveal, integrate, harvest insight." };
  if (dayInCycle < 7) return { phase: "waxing_crescent", nudge: "Waxing — build, expand, take small action." };
  if (dayInCycle < 13.5) return { phase: "waxing_gibbous", nudge: "Waxing gibbous — refine, near completion." };
  if (dayInCycle < 22) return { phase: "waning_gibbous", nudge: "Waning gibbous — share, distribute, give." };
  return { phase: "waning_crescent", nudge: "Waning crescent — rest, release, prepare for the new." };
}

export function seasonalFlavor(todayISO: string): { season: string; nudge: string } {
  const month = new Date(todayISO).getUTCMonth(); // 0..11
  if ([2, 3, 4].includes(month)) return { season: "spring", nudge: "Spring — expansion, new beginnings, opening." };
  if ([5, 6, 7].includes(month)) return { season: "summer", nudge: "Summer — fullness, action, embodiment." };
  if ([8, 9, 10].includes(month)) return { season: "autumn", nudge: "Autumn — release, gratitude, letting fall what is done." };
  return { season: "winter", nudge: "Winter — retreat, silence, deep restoration." };
}

// ─── Adaptive intelligence ───────────────────────────────

function recentSkipsOrRests(chapters: ArcChapterRow[]): number {
  let n = 0;
  for (const c of chapters) {
    if (c.marker === "skip" || c.marker === "rest") n++;
    else break;
  }
  return n;
}

function recentBreakthroughs(chapters: ArcChapterRow[]): number {
  return chapters.slice(0, 5).filter((c) => c.marker === "breakthrough").length;
}

// ─── Build directive ─────────────────────────────────────

export function buildArcDirective(input: ArcDirectiveInput): ArcDirective {
  const { arc, template, recentChapters } = input;
  const { phase, label } = resolvePhase(arc, template);
  const voice = resolveVoice(arc.voice_style, template?.voice_style, input.spiritualDnaPaths);

  const isHarvestDay = arc.current_day >= arc.duration_days;
  const recentSkips = recentSkipsOrRests(recentChapters);
  const recentBreaks = recentBreakthroughs(recentChapters);

  // Rest chapter conditions: regression OR mood+energy floor OR 2+ recent skips
  const lowMoodEnergy =
    (input.yesterdayMood ?? 5) <= 2 && (input.yesterdayEnergy ?? 5) <= 2;
  const isRestChapter = !isHarvestDay && (input.regressionDetected || lowMoodEnergy || recentSkips >= 2);

  // Fast-forward if 2+ breakthroughs in last 5 chapters and >5 days remain
  const daysRemaining = arc.duration_days - arc.current_day;
  const shouldFastForward = !isHarvestDay && recentBreaks >= 2 && daysRemaining > 5;

  const lunar = lunarFlavor(input.todayISO);
  const season = seasonalFlavor(input.todayISO);

  const lines: string[] = [];
  lines.push(`═══ ACTIVE ARC DIRECTIVE — obey this ABOVE the daily orchestrator ═══`);
  lines.push(`Arc: "${arc.title}" — Day ${arc.current_day} of ${arc.duration_days}`);
  if (arc.intention) lines.push(`User's intention: "${arc.intention}"`);
  lines.push(`Current phase: ${label} (${phase})`);
  lines.push(`Voice mode: ${voice} — ${voice === "sanskrit" ? "lean into Sanskrit terms with subtle English glosses" : voice === "modern" ? "plain English, occasional Sanskrit only when essential" : "blend Sanskrit and modern English naturally"}.`);

  if (arc.assigned_guru) {
    lines.push(`Assigned guru voice: ${arc.assigned_guru} — channel their tradition's tone, not their words verbatim.`);
  }
  if (arc.primary_path) lines.push(`Primary path for this arc: ${arc.primary_path}.`);
  if (arc.primary_practice) lines.push(`Primary practice anchor: ${arc.primary_practice}.`);
  if (arc.primary_chakra) lines.push(`Primary chakra throughout: ${arc.primary_chakra}.`);

  // Continuity from yesterday
  const yesterday = recentChapters[0];
  if (yesterday) {
    const reflectBit = yesterday.user_reflection ? ` They reflected: "${yesterday.user_reflection.slice(0, 140)}"` : "";
    lines.push(`Yesterday (Day ${yesterday.day_number}): marker=${yesterday.marker || "normal"}.${reflectBit}`);
    lines.push(`This chapter MUST feel like the next page, not a fresh start. Open with a thread that picks up where Day ${yesterday.day_number} left off.`);
  } else {
    lines.push(`This is Day 1 — open the arc. Set the soul of the journey. Make them feel chosen by it.`);
  }

  // Adaptive modes
  if (isHarvestDay) {
    const harvestPrompt = template?.harvest_template?.prompt || "What changed in you across these days?";
    const harvestTitle = template?.harvest_template?.title || "Harvest Day";
    lines.push(`★ HARVEST DAY ★ — This is the FINAL chapter. Title direction: "${harvestTitle}". Reflection seed: "${harvestPrompt}".`);
    lines.push(`Tone: ceremonial, complete, honoring. Surface what they walked through. Mark the closing. No new teaching — only integration.`);
  } else if (isRestChapter) {
    lines.push(`★ REST CHAPTER ★ — The arc PAUSES today without breaking. The whole theme is permission to rest inside the arc. 1-2 short sentences. The arc resumes naturally tomorrow.`);
  } else if (shouldFastForward) {
    lines.push(`★ FAST-FORWARD ★ — Multiple breakthroughs detected. Skip ahead in the arc — do not labor what they've already crossed. Move them toward the integration phase.`);
  }

  // Phase-specific guidance
  switch (phase) {
    case "ground":
      lines.push(`Phase guidance: Establish the soil. Small, embodied, unambitious. Build the foundation the later phases will stand on.`);
      break;
    case "deepen":
      lines.push(`Phase guidance: Go beneath the surface. The same territory as grounding, but one layer down. Friction is welcome here.`);
      break;
    case "integrate":
      lines.push(`Phase guidance: The arc is becoming part of them. Less new content, more "what does this look like in your actual life." Bring it home.`);
      break;
    default:
      lines.push(`Phase guidance: Honor the named phase "${label}" — let the day's chapter live inside its intention.`);
  }

  // Cosmic flavor (subtle, never overpowering)
  if (lunar) lines.push(`Cosmic background (subtle, weave gently): ${lunar.nudge}`);
  lines.push(`Seasonal background (subtle): ${season.nudge}`);

  // Output requirements specific to arc
  lines.push(`Required output additions for arc continuity:`);
  lines.push(`  • title MUST hint at "Chapter ${arc.current_day} of ${arc.duration_days}" feel (not literal numbering — use phase language)`);
  lines.push(`  • yesterday_bridge MUST explicitly thread from yesterday's chapter`);
  lines.push(`  • spiral_marker MUST acknowledge this is part of the larger arc, not a one-off day`);

  return {
    isHarvestDay,
    isRestChapter,
    shouldFastForward,
    effectiveDay: arc.current_day,
    totalDays: arc.duration_days,
    phaseLabel: label,
    phaseSlug: phase,
    chapterLabel: `Chapter ${arc.current_day} of ${arc.duration_days}`,
    voiceMode: voice,
    promptDirective: lines.join("\n"),
    metadata: {
      arc_id: arc.id,
      arc_title: arc.title,
      day: arc.current_day,
      total: arc.duration_days,
      phase,
      phase_label: label,
      voice,
      is_harvest: isHarvestDay,
      is_rest: isRestChapter,
      fast_forward: shouldFastForward,
      lunar: lunar?.phase,
      season: season.season,
      assigned_guru: arc.assigned_guru,
    },
  };
}

// ─── Loop → arc-template suggestion mapping ──────────────

export function suggestArcSlugForLoop(loopId: string): string | null {
  const id = (loopId || "").toLowerCase();
  if (/(anxiety|control|overthink|worry)/.test(id)) return "seven-surrender";
  if (/(anger|reactivity|irritation)/.test(id)) return "twentyone-witness-mastery";
  if (/(perfection|achievement|workaholism)/.test(id)) return "twentyone-karma";
  if (/(people.?pleas|overcommit|resent)/.test(id)) return "twentyone-boundaries";
  if (/(grief|heartbreak|loss|breakup)/.test(id)) return "twentyone-heart-healing";
  if (/(shame|self.?judg|projection)/.test(id)) return "twentyone-shadow";
  if (/(addict|avoid|escape|numbing)/.test(id)) return "fortynine-samskara";
  if (/(scarcity|negativity|cynic)/.test(id)) return "seven-gratitude";
  return null;
}

// ─── Echo scheduling helpers ─────────────────────────────

export function nextEchoDates(completedAtISO: string): { type: "30d" | "90d" | "365d"; date: string }[] {
  const base = new Date(completedAtISO).getTime();
  const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  return [
    { type: "30d", date: fmt(base + 30 * 86400000) },
    { type: "90d", date: fmt(base + 90 * 86400000) },
    { type: "365d", date: fmt(base + 365 * 86400000) },
  ];
}
