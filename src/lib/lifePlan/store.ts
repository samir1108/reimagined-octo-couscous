/**
 * LIFE PLAN STORE — local artifacts, exportable.
 */

import type { LifePlanBundle } from "./types";

const KEY_PREFIX = "satyug:life-plan";

function key(userId: string): string {
  return `${KEY_PREFIX}:${userId}`;
}

export function loadLifePlan(userId: string | null | undefined): LifePlanBundle | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = window.localStorage.getItem(key(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LifePlanBundle;
    return parsed?.day && parsed?.season && parsed?.decade ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLifePlan(userId: string, bundle: LifePlanBundle): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(userId), JSON.stringify(bundle));
  } catch {
    /* private mode — artifact stays in memory */
  }
}

export function lifePlanToMarkdown(bundle: LifePlanBundle): string {
  const day = bundle.day;
  const season = bundle.season;
  const decade = bundle.decade;

  return [
    "# My practice plan",
    "",
    `## Day — ${day.date}`,
    `**${day.title}**`,
    `- Morning: ${day.morning}`,
    `- Midday: ${day.midday}`,
    `- Evening: ${day.evening}`,
    `- Carry: ${day.carry}`,
    `- Basis: ${day.basis.join("; ")}`,
    "",
    `## Season — ${season.theme}`,
    `Start: ${season.startDate} · ${season.days} days`,
    "",
    "| Week | Focus | Sessions | Review |",
    "|---|---|---|---|",
    ...season.weeks.map(
      (week) => `| ${week.week} | ${week.focus} | ${week.sessions} | ${week.review} |`,
    ),
    "",
    `Gates: ${season.gates.join("; ")}`,
    "",
    `## Decade — ${decade.title}`,
    "",
    "| Year | Theme | Practice | Evidence |",
    "|---|---|---|---|",
    ...decade.years.map(
      (year) =>
        `| ${year.year} | ${year.theme} | ${year.practice} | ${year.evidence} |`,
    ),
    "",
    "**Non-negotiables:**",
    ...decade.nonNegotiables.map((item) => `- ${item}`),
    "",
    `> ${bundle.disclaimer}`,
    "",
  ].join("\n");
}
