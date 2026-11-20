// Sentence/paragraph segmentation for long-form UI text.
// The runtime translator sends one string per item; a multi-thousand
// character paragraph would either be rejected or silently truncated by the
// model. Splitting at natural boundaries keeps every clause translatable and
// lets the caller reassemble the pieces into one complete translation.

/** Pieces up to this length are sent as a single item. */
export const SEGMENT_TARGET = 1200;
/** A natural piece longer than this is hard-split so no request is oversized. */
export const SEGMENT_MAX = 1800;

/**
 * Split `text` into pieces of at most SEGMENT_MAX characters, preferring
 * sentence, clause and blank-line boundaries. Concatenating the result always
 * reproduces the original string exactly (whitespace and punctuation are kept).
 */
export function segmentText(text: string): string[] {
  if (text.length <= SEGMENT_TARGET) return [text];

  const out: string[] = [];
  let buf = "";
  // Delimiters are captured so concatenating the pieces yields the original.
  const tokens = text.split(/(\n{2,}|[.!?।؟…;:]+[\s"'”’)\]]+)/);
  for (const tok of tokens) {
    if (!tok) continue;
    if (buf && buf.length + tok.length > SEGMENT_TARGET) {
      out.push(buf);
      buf = tok;
    } else {
      buf += tok;
    }
  }
  if (buf) out.push(buf);

  const safe: string[] = [];
  for (const seg of out) {
    if (seg.length <= SEGMENT_MAX) {
      safe.push(seg);
      continue;
    }
    for (let i = 0; i < seg.length; i += SEGMENT_TARGET) {
      safe.push(seg.slice(i, i + SEGMENT_TARGET));
    }
  }
  return safe.length ? safe : [text];
}

/** True when `text` had to be split into more than one translatable piece. */
export function needsSegmentation(text: string): boolean {
  return text.length > SEGMENT_TARGET;
}
