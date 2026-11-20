/**
 * LIFE PLAN — day, season, decade.
 * ───────────────────────────────
 * Three horizons, one model. The plans are derived from the weakest and
 * strongest layers, not from a calendar of content. They are design artifacts:
 * the user can inspect, edit, and export them.
 */

export interface DayPlan {
  id: string;
  date: string;
  title: string;
  morning: string;
  midday: string;
  evening: string;
  carry: string;
  basis: string[];
}

export interface SeasonWeek {
  week: number;
  focus: string;
  sessions: number;
  review: string;
}

export interface SeasonPlan {
  id: string;
  title: string;
  startDate: string;
  days: number;
  theme: string;
  weeks: SeasonWeek[];
  gates: string[];
  basis: string[];
}

export interface DecadeYear {
  year: number;
  theme: string;
  practice: string;
  evidence: string;
}

export interface DecadeVision {
  id: string;
  title: string;
  createdAt: string;
  years: DecadeYear[];
  nonNegotiables: string[];
  basis: string[];
}

export interface LifePlanBundle {
  day: DayPlan;
  season: SeasonPlan;
  decade: DecadeVision;
  disclaimer: string;
}
