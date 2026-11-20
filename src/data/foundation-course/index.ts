import type { CourseDayCurriculum } from './types';
import { awakeningDays } from './days/phase1-awakening';
import { mindDays } from './days/phase2-mind';
import { heartDays } from './days/phase3-heart';
import { bodyDays } from './days/phase4-body';
import { patternDays } from './days/phase5-patterns';
import { inquiryDays } from './days/phase6-inquiry';
import { energyDays } from './days/phase7-energy';
import { integrationDays } from './days/phase8-integration';

export const FOUNDATION_CURRICULUM: CourseDayCurriculum[] = [
  ...awakeningDays,
  ...mindDays,
  ...heartDays,
  ...bodyDays,
  ...patternDays,
  ...inquiryDays,
  ...energyDays,
  ...integrationDays,
];

export function getCourseDay(day: number): CourseDayCurriculum | undefined {
  return FOUNDATION_CURRICULUM.find(d => d.day === day);
}

export { COURSE_PHASES, getPhaseForDay, getPhaseProgress, getOverallProgress } from './phases';
export type { CourseDayCurriculum, CoursePhase, CoursePhaseInfo, UserCourseProgress } from './types';
