import type { ComponentProps } from "react";

export * from "./ritualMarkers";

import ReflectPause from "../../guide/ritual/ReflectPause";
import ShishyaVoiceChips from "../../guide/ritual/ShishyaVoiceChips";
import IntensityPick from "../../guide/ritual/IntensityPick";
import PostureCheck from "../../guide/ritual/PostureCheck";
import PracticeGuidePanel from "../../guide/ritual/PracticeGuidePanel";
import SankalpaInput from "../../guide/ritual/SankalpaInput";
import BlessingBow from "../../guide/ritual/BlessingBow";

export { default as ReflectPause } from "../../guide/ritual/ReflectPause";
export { default as ShishyaVoice } from "../../guide/ritual/ShishyaVoiceChips";
export { default as IntensityPick, type Intensity } from "../../guide/ritual/IntensityPick";
export { default as PostureCheck } from "../../guide/ritual/PostureCheck";
export { default as PracticeGuide } from "../../guide/ritual/PracticeGuidePanel";
export { default as SankalpaInput } from "../../guide/ritual/SankalpaInput";
export { default as BlessingBow } from "../../guide/ritual/BlessingBow";

export type ReflectPauseProps = ComponentProps<typeof ReflectPause>;
export type ShishyaVoiceProps = ComponentProps<typeof ShishyaVoiceChips>;
export type IntensityPickProps = ComponentProps<typeof IntensityPick>;
export type PostureCheckProps = ComponentProps<typeof PostureCheck>;
export type PracticeGuideProps = ComponentProps<typeof PracticeGuidePanel>;
export type SankalpaInputProps = ComponentProps<typeof SankalpaInput>;
export type BlessingBowProps = ComponentProps<typeof BlessingBow>;
