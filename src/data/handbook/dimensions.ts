/**
 * The 6 Dimensions the consciousness engine tracks.
 */

export interface DimensionEntry {
  slug: string;
  name: string;
  essence: string;
  lowMarkers: string[];
  highMarkers: string[];
  movesItBy: string[];
  pairedSkills: string[];
}

export const DIMENSIONS: DimensionEntry[] = [
  {
    slug: "body",
    name: "Body",
    essence: "Felt presence in the physical organism.",
    lowMarkers: ["Numb to sensation", "Sleep dysregulated", "Body = problem to manage"],
    highMarkers: ["Sensation available without effort", "Body signals are listened to", "Energy stable through day"],
    movesItBy: ["Kriya", "Breath", "Walking", "Cold exposure", "Bodywork"],
    pairedSkills: ["kriya", "breath"],
  },
  {
    slug: "mind",
    name: "Mind",
    essence: "Quality and steadiness of attention.",
    lowMarkers: ["Constant distraction", "Can't focus 5 min", "Reactive thinking"],
    highMarkers: ["Sustained single-pointed attention", "Thought serves you, not vice versa"],
    movesItBy: ["Stillness practice", "Dharana", "Single-tasking", "Sleep"],
    pairedSkills: ["observation", "stillness"],
  },
  {
    slug: "heart",
    name: "Heart",
    essence: "Capacity to feel, love, and be moved.",
    lowMarkers: ["Numb or armored", "Cynicism as default", "Tears feel threatening"],
    highMarkers: ["Available to grief and joy", "Love flows without object", "Other = self felt"],
    movesItBy: ["Devotion", "Tears", "Music", "Service"],
    pairedSkills: ["devotion", "service"],
  },
  {
    slug: "will",
    name: "Will",
    essence: "Capacity to act on what matters even when difficult.",
    lowMarkers: ["Promises broken to self", "Inertia rules", "Externally driven"],
    highMarkers: ["Commitments kept easily", "Action arises from clarity"],
    movesItBy: ["Karma yoga", "Yama", "Small consistent acts"],
    pairedSkills: ["surrender", "service"],
  },
  {
    slug: "witness",
    name: "Witness",
    essence: "Awareness behind experience.",
    lowMarkers: ["Fully merged with thought/emotion", "No gap"],
    highMarkers: ["Continuous observer present", "Identification softens"],
    movesItBy: ["Self-inquiry", "Sitting practice", "Sakshi bhav"],
    pairedSkills: ["witness", "self-inquiry"],
  },
  {
    slug: "identity",
    name: "Identity",
    essence: "What you take yourself to be.",
    lowMarkers: ["Identity is fixed, defended", "Roles = self"],
    highMarkers: ["Identity is light, useful, not ultimate", "Self-concept loosened"],
    movesItBy: ["Inquiry", "Long retreat", "Loss of role"],
    pairedSkills: ["self-inquiry", "witness"],
  },
];
