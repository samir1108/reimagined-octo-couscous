/**
 * CinematicJourney — types shared across journey components.
 */

export interface JourneyAnswer {
  questionId: string;
  questionIndex: number;
  kind: "choice" | "scale" | "multi" | "text";
  value: string | number | string[];
  rawOptionId?: string;
  scoreTags: import("@/lib/journey/journeyQuestions").ScoreTag[];
  answeredAt: string;
}
