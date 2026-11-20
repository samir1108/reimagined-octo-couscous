export type Msg = { role: "user" | "assistant"; content: string };

export type MirrorPhase = "intro" | "questioning" | "loading-reveal" | "reveal" | "practices";

export interface LoopReveal {
  id: string;
  name: string;
  insight: string;
}

export interface Practice {
  title: string;
  time_of_day: string;
  duration: string;
  description: string;
  loop_target: string;
}

export interface RevealData {
  loops: LoopReveal[];
  v_band: number;
  band_name: string;
  witness_assessment: string;
  dimensions: {
    mind: number;
    emotion: number;
    body: number;
    awareness: number;
  };
  pattern_map: {
    mind: string;
    emotion: string;
    energy: string;
    body: string;
  };
  practices: Practice[];
}
