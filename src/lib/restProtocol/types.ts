/**
 * REST PROTOCOL — sleep-first, never meditation-first.
 * ───────────────────────────────────────────────────
 * When the body is depleted, the practice is rest. These lines never sell
 * meditation to a sleeper; they give a body-rest instruction and a carry.
 */

export interface RestProtocol {
  id: string;
  title: string;
  forState: string;
  minutes: number;
  instruction: string;
  avoid: string;
  carry: string;
}

export interface RestLine {
  id: string;
  index: number;
  protocolId: string;
  text: string;
}

export interface RestValidation {
  ok: boolean;
  errors: string[];
}
