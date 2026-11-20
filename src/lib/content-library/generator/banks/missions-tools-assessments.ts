/**
 * MISSIONS + TOOLS + ASSESSMENTS BANKS — compact archetypes.
 */

import type { WisdomArchetype } from "./types";

export type MissionArchetype = WisdomArchetype & { missionType: string };
export type ToolArchetype = WisdomArchetype & { toolType: string };
export type AssessmentArchetype = WisdomArchetype & { assessmentType: string };

function M(type: string, concept: string, explanation: string, application: string, tags: string[], difficulty: "beginner" | "intermediate" | "advanced" = "beginner", minutes = 5): MissionArchetype {
  return { concept, tradition: "Daily Missions", source: "ConsciousOS original mission", explanation, application, questions: ["What is the mission's task?", "What is the mission's completion?"], references: ["ConsciousOS original mission"], excerpt: undefined, evidence: "original", dimensions: ["action", "thought"], paths: ["karma", "raja"], domains: ["growth", "work"], tags, difficulty, minutes, missionType: type } as MissionArchetype;
}

export const MISSIONS: MissionArchetype[] = [
  M("awareness", "Awareness Mission", "An awareness mission: notice one specific thing today. The mission is the noticing; the awareness is the byproduct.", "Use as a daily mission. The awareness mission is the day's attention.", ["mission", "awareness", "notice", "daily", "attention"], "beginner", 5),
  M("action", "Action Mission", "An action mission: do one intentional thing today. The mission is the action; the intention is the byproduct.", "Use as a daily mission. The action mission is the day's will.", ["mission", "action", "intentional", "daily", "will"], "beginner", 5),
  M("reflection", "Reflection Mission", "A reflection mission: reflect on one thing today. The mission is the reflection; the insight is the byproduct.", "Use as a daily mission. The reflection mission is the day's wisdom.", ["mission", "reflection", "insight", "daily", "wisdom"], "beginner", 5),
  M("connection", "Connection Mission", "A connection mission: connect with one person today. The mission is the connection; the relationship is the byproduct.", "Use as a daily mission. The connection mission is the day's relationship.", ["mission", "connection", "person", "daily", "relationship"], "beginner", 5),
  M("creativity", "Creativity Mission", "A creativity mission: create one thing today. The mission is the creation; the expression is the byproduct.", "Use as a daily mission. The creativity mission is the day's expression.", ["mission", "creativity", "create", "daily", "expression"], "beginner", 10),
  M("service", "Service Mission", "A service mission: help one person today. The mission is the service; the karma is the byproduct.", "Use as a daily mission. The service mission is the day's karma.", ["mission", "service", "help", "daily", "karma"], "beginner", 10),
  M("learning", "Learning Mission", "A learning mission: learn one thing today. The mission is the learning; the knowledge is the byproduct.", "Use as a daily mission. The learning mission is the day's knowledge.", ["mission", "learning", "learn", "daily", "knowledge"], "beginner", 10),
  M("health", "Health Mission", "A health mission: do one health thing today. The mission is the health action; the vitality is the byproduct.", "Use as a daily mission. The health mission is the day's vitality.", ["mission", "health", "action", "daily", "vitality"], "beginner", 5),
  M("rest", "Rest Mission", "A rest mission: rest for 10 minutes today. The mission is the rest; the recovery is the byproduct.", "Use as a daily mission. The rest mission is the day's recovery.", ["mission", "rest", "10_minutes", "daily", "recovery"], "beginner", 10),
  M("growth", "Growth Mission", "A growth mission: grow in one way today. The mission is the growth; the development is the byproduct.", "Use as a daily mission. The growth mission is the day's development.", ["mission", "growth", "develop", "daily", "development"], "beginner", 5),
];

function T(type: string, concept: string, explanation: string, application: string, tags: string[], difficulty: "beginner" | "intermediate" | "advanced" = "beginner", minutes = 5): ToolArchetype {
  return { concept, tradition: "Tools", source: "ConsciousOS original tool", explanation, application, questions: ["What is the tool's function?", "What is the tool's output?"], references: ["ConsciousOS original tool"], excerpt: undefined, evidence: "original", dimensions: ["action", "thought"], paths: ["raja", "karma"], domains: ["work", "growth"], tags, difficulty, minutes, toolType: type } as ToolArchetype;
}

export const TOOLS: ToolArchetype[] = [
  T("timer", "Meditation Timer", "A meditation timer: set the duration, sit, the timer ends the session. The timer is the practice's boundary.", "Use as a daily tool. The timer is the practice's container.", ["tool", "timer", "meditation", "duration", "boundary", "container"], "beginner", 5),
  T("breath_pacer", "Breath Pacer", "A breath pacer: visual pacing for the breath. The pacer is the breath's guide.", "Use as a daily tool. The pacer is the breath's guide.", ["tool", "breath_pacer", "visual", "pacing", "guide"], "beginner", 5),
  T("mood_tracker", "Mood Tracker", "A mood tracker: log the mood, track the pattern. The tracker is the mood's record.", "Use as a daily tool. The tracker is the mood's record.", ["tool", "mood_tracker", "log", "pattern", "record"], "beginner", 5),
  T("journal", "Digital Journal", "A digital journal: write, save, review. The journal is the mind's record.", "Use as a daily tool. The journal is the mind's record.", ["tool", "journal", "write", "save", "review", "mind"], "beginner", 5),
  T("habit_tracker", "Habit Tracker", "A habit tracker: track the habit, build the streak. The tracker is the habit's record.", "Use as a daily tool. The tracker is the habit's record.", ["tool", "habit_tracker", "track", "streak", "record"], "beginner", 5),
  T("progress_chart", "Progress Chart", "A progress chart: visualize the progress. The chart is the progress's display.", "Use as a daily tool. The chart is the progress's display.", ["tool", "progress_chart", "visualize", "progress", "display"], "beginner", 5),
  T("sound_mixer", "Sound Mixer", "A sound mixer: mix ambient sounds. The mixer is the soundscape's creator.", "Use as a daily tool. The mixer is the soundscape's creator.", ["tool", "sound_mixer", "ambient", "sounds", "soundscape", "creator"], "beginner", 5),
  T("visualization", "Visualization Tool", "A visualization tool: guided visualization. The tool is the mind's canvas.", "Use as a daily tool. The tool is the mind's canvas.", ["tool", "visualization", "guided", "canvas", "mind"], "beginner", 5),
  T("assessment", "Assessment Tool", "An assessment tool: self-assessment questionnaire. The tool is the self's measure.", "Use as a weekly tool. The tool is the self's measure.", ["tool", "assessment", "questionnaire", "self", "measure"], "beginner", 10),
  T("planner", "Daily Planner", "A daily planner: plan the day, track the tasks. The planner is the day's structure.", "Use as a daily tool. The planner is the day's structure.", ["tool", "planner", "plan", "tasks", "structure"], "beginner", 5),
];

function A(type: string, concept: string, explanation: string, application: string, tags: string[], difficulty: "beginner" | "intermediate" | "advanced" = "beginner", minutes = 10): AssessmentArchetype {
  return { concept, tradition: "Assessments", source: "ConsciousOS original assessment", explanation, application, questions: ["What is the assessment's dimension?", "What is the assessment's result?"], references: ["ConsciousOS original assessment"], excerpt: undefined, evidence: "original", dimensions: ["thought", "emotion"], paths: ["raja", "jnana"], domains: ["growth", "learning"], tags, difficulty, minutes, assessmentType: type } as AssessmentArchetype;
}

export const ASSESSMENTS: AssessmentArchetype[] = [
  A("personality", "Personality Assessment", "A personality assessment: identify the personality type. The assessment is the self's map.", "Use as a one-time assessment. The assessment is the self's map.", ["assessment", "personality", "type", "map", "self"], "beginner", 15),
  A("consciousness", "Consciousness Assessment", "A consciousness assessment: identify the consciousness level. The assessment is the awareness's measure.", "Use as a monthly assessment. The assessment is the awareness's measure.", ["assessment", "consciousness", "level", "measure", "awareness"], "beginner", 15),
  A("emotion", "Emotion Assessment", "An emotion assessment: identify the emotional intelligence. The assessment is the emotion's measure.", "Use as a monthly assessment. The assessment is the emotion's measure.", ["assessment", "emotion", "intelligence", "measure", "emotional"], "beginner", 15),
  A("cognition", "Cognition Assessment", "A cognition assessment: identify the cognitive style. The assessment is the thinking's measure.", "Use as a monthly assessment. The assessment is the thinking's measure.", ["assessment", "cognition", "style", "measure", "thinking"], "beginner", 15),
  A("stress", "Stress Assessment", "A stress assessment: identify the stress level. The assessment is the stress's measure.", "Use as a weekly assessment. The assessment is the stress's measure.", ["assessment", "stress", "level", "measure"], "beginner", 10),
  A("wellbeing", "Wellbeing Assessment", "A wellbeing assessment: identify the wellbeing level. The assessment is the wellbeing's measure.", "Use as a monthly assessment. The assessment is the wellbeing's measure.", ["assessment", "wellbeing", "level", "measure"], "beginner", 15),
  A("relationship", "Relationship Assessment", "A relationship assessment: identify the relationship pattern. The assessment is the relationship's measure.", "Use as a monthly assessment. The assessment is the relationship's measure.", ["assessment", "relationship", "pattern", "measure"], "beginner", 15),
  A("purpose", "Purpose Assessment", "A purpose assessment: identify the purpose level. The assessment is the purpose's measure.", "Use as a monthly assessment. The assessment is the purpose's measure.", ["assessment", "purpose", "level", "measure"], "beginner", 15),
  A("values", "Values Assessment", "A values assessment: identify the core values. The assessment is the values' measure.", "Use as a one-time assessment. The assessment is the values' measure.", ["assessment", "values", "core", "measure"], "beginner", 15),
  A("growth", "Growth Assessment", "A growth assessment: identify the growth level. The assessment is the growth's measure.", "Use as a monthly assessment. The assessment is the growth's measure.", ["assessment", "growth", "level", "measure"], "beginner", 15),
];
