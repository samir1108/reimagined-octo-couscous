import { z } from "zod";
import {
  FRAMEWORK_CATEGORY_IDS,
  SESSION_COMPONENT_IDS,
  SESSION_MODALITY_IDS,
  SESSION_STAGE_IDS,
  type FrameworkTechnique,
  type SessionFramework,
} from "./types";

const modalitySchema = z.enum([...SESSION_MODALITY_IDS]);
const categorySchema = z.enum([...FRAMEWORK_CATEGORY_IDS]);
const stageSchema = z.enum([...SESSION_STAGE_IDS]);
const componentSchema = z.enum([...SESSION_COMPONENT_IDS]);

export const frameworkOutcomeSchema = z.object({
  id: z.string().min(1),
  statement: z.string().min(1),
  evidence: z.enum(["reported", "observed", "behavioral", "completion"]),
});

export const frameworkTechniqueSchema: z.ZodType<FrameworkTechnique> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: categorySchema,
  description: z.string().min(1),
  compatibleModalities: z.array(modalitySchema).min(1),
  defaultDurationMinutes: z.number().positive(),
  contraindications: z.array(z.string().min(1)).optional(),
});

export const frameworkSchema: z.ZodType<SessionFramework> = z
  .object({
    id: z.string().min(1),
    version: z.string().min(1),
    name: z.string().min(1),
    category: categorySchema,
    tradition: z.string().min(1),
    primaryGoal: z.string().min(1),
    description: z.string().min(1),
    durationMinutes: z.object({
      min: z.number().positive(),
      default: z.number().positive(),
      max: z.number().positive(),
    }),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    deliveryModes: z.array(modalitySchema).min(1),
    compatibleTechniques: z.array(z.string().min(1)).min(1),
    stageSequence: z.array(stageSchema).min(1),
    componentSequence: z.array(componentSchema).min(1),
    outcomes: z.array(frameworkOutcomeSchema).min(1),
    adaptations: z.array(
      z.object({
        condition: z.enum([
          "tired",
          "distracted",
          "calm",
          "confused",
          "overwhelmed",
          "curious",
          "short_on_time",
          "wants_practical_help",
          "low_energy",
          "uncomfortable",
          "user_choice",
        ]),
        action: z.enum(["shorten", "simplify", "offer_stop", "ground_and_close", "branch"]),
        instruction: z.string().min(1),
      }),
    ),
    completionCriteria: z.array(
      z.object({
        id: z.string().min(1),
        type: z.enum(["stage_completed", "reflection_recorded", "mission_selected", "closure_shown"]),
        stageId: stageSchema.optional(),
      }),
    ),
    safety: z.object({
      notTreatment: z.literal(true),
      stopSignals: z.array(z.string().min(1)).min(1),
      avoidWhen: z.array(z.string().min(1)),
      professionalGuidanceRecommended: z.boolean(),
    }),
    accessibility: z.object({
      reducedMotionSupported: z.boolean(),
      captionsSupported: z.boolean(),
      screenReaderSupported: z.boolean(),
      alternatives: z.array(z.string().min(1)).min(1),
    }),
    provenance: z.object({
      sourceKind: z.enum(["internal_design", "research_informed", "tradition_inspired", "adaptive_integration"]),
      sourceLabel: z.string().min(1),
      reviewedAt: z.string().datetime(),
      notes: z.string().min(1),
    }),
  })
  .superRefine((framework, context) => {
    const { min, default: defaultDuration, max } = framework.durationMinutes;
    if (min > defaultDuration || defaultDuration > max) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationMinutes"],
        message: "Duration must satisfy min <= default <= max",
      });
    }
    if (new Set(framework.stageSequence).size !== framework.stageSequence.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stageSequence"],
        message: "Stage sequence must not contain duplicates",
      });
    }
    if (new Set(framework.compatibleTechniques).size !== framework.compatibleTechniques.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["compatibleTechniques"],
        message: "Compatible techniques must not contain duplicates",
      });
    }
  });

export const frameworkCatalogSchema = z
  .array(frameworkSchema)
  .min(1)
  .superRefine((catalog, context) => {
    const seen = new Set<string>();
    catalog.forEach((framework, index) => {
      if (seen.has(framework.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, "id"],
          message: `Duplicate framework id: ${framework.id}`,
        });
      }
      seen.add(framework.id);
    });
  });

export const techniqueCatalogSchema = z
  .array(frameworkTechniqueSchema)
  .min(1)
  .superRefine((catalog, context) => {
    const seen = new Set<string>();
    catalog.forEach((technique, index) => {
      if (seen.has(technique.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, "id"],
          message: `Duplicate technique id: ${technique.id}`,
        });
      }
      seen.add(technique.id);
    });
  });

export function validateFrameworkCatalog(catalog: SessionFramework[]): SessionFramework[] {
  return frameworkCatalogSchema.parse(catalog);
}

export function validateTechniqueCatalog(catalog: FrameworkTechnique[]): FrameworkTechnique[] {
  return techniqueCatalogSchema.parse(catalog);
}
