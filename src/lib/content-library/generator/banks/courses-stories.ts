/**
 * COURSES + STORIES BANKS — compact archetypes with real content.
 */

import type { WisdomArchetype } from "./types";

export type CourseArchetype = WisdomArchetype & { courseType: string };
export type StoryArchetype = WisdomArchetype & { storyType: string };

function C(type: string, concept: string, explanation: string, application: string, tags: string[], difficulty: "beginner" | "intermediate" | "advanced" = "beginner", minutes = 30): CourseArchetype {
  return { concept, tradition: "Courses", source: "ConsciousOS original course", explanation, application, questions: ["What is the learning objective?", "What is the course's structure?"], references: ["ConsciousOS original course"], excerpt: undefined, evidence: "original", dimensions: ["thought", "learning"], paths: ["raja", "jnana"], domains: ["learning", "growth"], tags, difficulty, minutes, courseType: type } as CourseArchetype;
}

export const COURSES: CourseArchetype[] = [
  C("foundation", "Foundation of Awareness", "A foundation course: the basics of awareness — observation, breath, body, mind. The course is the practice's groundwork.", "Use as an 8-week course. The foundation is the practice's base.", ["course", "foundation", "awareness", "basics", "observation", "breath", "body", "mind"], "beginner", 30),
  C("advanced", "Advanced Practices", "An advanced course: the advanced practices — samadhi, kundalini, nada. The course is the practice's deepening.", "Use as an 8-week course. The advanced is the practice's deepening.", ["course", "advanced", "samadhi", "kundalini", "nada", "deepening"], "advanced", 45),
  C("specialty", "Specialty Topics", "A specialty course: specialized topics — trauma, anxiety, sleep. The course is the practice's specialization.", "Use as a 4-week course. The specialty is the practice's focus.", ["course", "specialty", "trauma", "anxiety", "sleep", "focus"], "intermediate", 30),
  C("certification", "Certification Programs", "A certification course: certified training — teacher training, advanced practice. The course is the practice's credential.", "Use as a 12-week course. The certification is the practice's credential.", ["course", "certification", "teacher_training", "advanced", "credential"], "advanced", 60),
  C("workshop", "Workshops", "A workshop: single-topic deep dive — one weekend, one topic. The workshop is the practice's intensive.", "Use as a weekend course. The workshop is the practice's intensive.", ["course", "workshop", "single_topic", "intensive", "weekend"], "intermediate", 120),
  C("masterclass", "Masterclasses", "A masterclass: expert-led deep dive — one topic, one expert. The masterclass is the practice's mastery.", "Use as a 4-week course. The masterclass is the practice's mastery.", ["course", "masterclass", "expert", "deep_dive", "mastery"], "advanced", 45),
  C("series", "Series", "A series: multi-part series — one topic, many parts. The series is the practice's exploration.", "Use as an 8-week course. The series is the practice's exploration.", ["course", "series", "multi_part", "exploration"], "intermediate", 30),
  C("module", "Modules", "A module: standalone module — one topic, one module. The module is the practice's unit.", "Use as a 2-week course. The module is the practice's unit.", ["course", "module", "standalone", "unit"], "beginner", 20),
  C("path", "Learning Paths", "A learning path: curated path — many courses, one path. The path is the practice's journey.", "Use as a 12-week course. The path is the practice's journey.", ["course", "path", "curated", "journey"], "intermediate", 30),
  C("elective", "Electives", "An elective: optional elective — one topic, one choice. The elective is the practice's option.", "Use as a 2-week course. The elective is the practice's option.", ["course", "elective", "optional", "choice"], "beginner", 20),
];

function St(type: string, concept: string, explanation: string, application: string, tags: string[], difficulty: "beginner" | "intermediate" | "advanced" = "beginner", minutes = 8): StoryArchetype {
  return { concept, tradition: "Stories", source: "ConsciousOS original story", explanation, application, questions: ["What is the story's teaching?", "What is the story's moral?"], references: ["ConsciousOS original story"], excerpt: undefined, evidence: "original", dimensions: ["thought", "spirit"], paths: ["raja", "jnana"], domains: ["growth", "learning"], tags, difficulty, minutes, storyType: type } as StoryArchetype;
}

export const STORIES: StoryArchetype[] = [
  St("indian", "The Seeker and the Master", "An Indian story: the seeker and the master — the seeker asks, the master points. The story is the teaching's form; the pointing is the teaching's content.", "Use as a teaching story. The seeker-master is the tradition's form.", ["story", "indian", "seeker", "master", "pointing", "teaching"], "beginner", 8),
  St("zen", "The Empty Cup", "A Zen story: the empty cup — Nan-in pours tea until it overflows. The story is the teaching's form; the overflow is the teaching's content.", "Use as a teaching story. The empty cup is the tradition's form.", ["story", "zen", "empty_cup", "nan_in", "overflow", "teaching"], "beginner", 5),
  St("sufi", "The Guest House", "A Sufi story: the guest house — Rumi's poem. The story is the teaching's form; the welcome is the teaching's content.", "Use as a teaching story. The guest house is the tradition's form.", ["story", "sufi", "guest_house", "rumi", "welcome", "teaching"], "beginner", 5),
  St("taoist", "The Butterfly Dream", "A Taoist story: the butterfly dream — Zhuangzi's dream. The story is the teaching's form; the dream is the teaching's content.", "Use as a teaching story. The butterfly dream is the tradition's form.", ["story", "taoist", "butterfly", "dream", "zhuangzi", "teaching"], "intermediate", 7),
  St("modern", "The Modern Seeker", "A modern story: the modern seeker — the contemporary practitioner. The story is the teaching's form; the seeking is the teaching's content.", "Use as a teaching story. The modern seeker is the tradition's form.", ["story", "modern", "seeker", "contemporary", "practice", "teaching"], "beginner", 8),
  St("personal", "The Personal Anecdote", "A personal story: the personal anecdote — the practitioner's experience. The story is the teaching's form; the experience is the teaching's content.", "Use as a teaching story. The personal anecdote is the tradition's form.", ["story", "personal", "anecdote", "experience", "teaching"], "beginner", 6),
  St("mythological", "The Mythic Tale", "A mythological story: the mythic tale — the archetype's story. The story is the teaching's form; the archetype is the teaching's content.", "Use as a teaching story. The mythic tale is the tradition's form.", ["story", "mythological", "myth", "archetype", "teaching"], "intermediate", 10),
  St("historical", "The Historical Figure", "A historical story: the historical figure — the master's life. The story is the teaching's form; the life is the teaching's content.", "Use as a teaching story. The historical figure is the tradition's form.", ["story", "historical", "figure", "master", "life", "teaching"], "intermediate", 10),
  St("fictional", "The Fictional Tale", "A fictional story: the fictional tale — the created narrative. The story is the teaching's form; the narrative is the teaching's content.", "Use as a teaching story. The fictional tale is the tradition's form.", ["story", "fictional", "narrative", "created", "teaching"], "beginner", 8),
  St("biographical", "The Master's Life", "A biographical story: the master's life — the teacher's biography. The story is the teaching's form; the life is the teaching's content.", "Use as a teaching story. The master's life is the tradition's form.", ["story", "biographical", "master", "life", "teacher", "teaching"], "intermediate", 10),
];
