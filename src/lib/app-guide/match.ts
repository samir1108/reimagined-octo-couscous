/**
 * App Guide â€” intent matching.
 *
 * Pure functions, no React. A spoken question is normalized, command words are
 * stripped, and every topic is scored on alias phrases plus token overlap with
 * one-step typo tolerance. The highest score wins only if it clears a floor;
 * otherwise the guide admits it does not know and offers topics instead of
 * inventing an answer.
 */
import { GUIDE_TOPICS, type GuideTopic } from "./topics";

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "what", "whats", "how", "why", "who", "when", "where", "which", "does",
  "do", "did", "can", "could", "should", "would", "you", "your", "me", "my",
  "i", "we", "us", "it", "its", "this", "that", "these", "those", "of",
  "in", "on", "at", "to", "for", "with", "about", "and", "or", "but", "if",
  "please", "tell", "explain", "say", "give", "show", "want", "need",
  "kya", "ka", "ki", "ke", "ko", "hai", "hain", "ho", "hota", "hoti", "hote",
  "kaise", "kyu", "kyun", "kyaa", "matlab", "artha", "batao", "bata",
  "samjhao", "samjha", "suno", "mujhe", "mera", "meri", "mere", "yeh", "ye",
  "woh", "wo", "kaam", "karta", "karti", "karte", "hoti", "thoda", "zara",
  "app", "satyug", "please",
]);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((token) => token.length > 0);
}

function contentTokens(text: string): string[] {
  return tokenize(text).filter(
    (token) => token.length > 0 && !STOPWORDS.has(token),
  );
}

/** Levenshtein distance with an early exit once `limit` is exceeded. */
function distance(a: string, b: string, limit = 1): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
      current.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > limit) return limit + 1;
    previous = current;
  }
  return previous[b.length];
}

function tokenMatches(queryToken: string, targetToken: string): boolean {
  if (queryToken === targetToken) return true;
  if (queryToken.length < 4 || targetToken.length < 4) return false;
  if (Math.abs(queryToken.length - targetToken.length) > 1) return false;
  return distance(queryToken, targetToken, 1) <= 1;
}

export interface TopicMatch {
  topic: GuideTopic;
  score: number;
  /** True when the match cleared the confidence floor. */
  confident: boolean;
}

const CONFIDENCE_FLOOR = 3;

/** Score one topic against an already-normalized query. */
export function scoreTopic(topic: GuideTopic, normalizedQuery: string): number {
  if (!normalizedQuery) return 0;
  const queryTokens = contentTokens(normalizedQuery);
  let score = 0;

  const phrases = [topic.title, ...topic.aliases];
  for (const phrase of phrases) {
    const normalizedPhrase = normalize(phrase);
    if (!normalizedPhrase) continue;

    if (normalizedQuery === normalizedPhrase) {
      score += 12;
      continue;
    }

    const phraseTokens = contentTokens(normalizedPhrase);
    if (!phraseTokens.length) continue;

    const containCount = phraseTokens.filter((phraseToken) =>
      queryTokens.some((queryToken) => tokenMatches(queryToken, phraseToken)),
    ).length;

    // A fully present multi-word alias is a strong signal.
    if (containCount === phraseTokens.length) {
      score += 4 + phraseTokens.length * 2;
      continue;
    }

    if (containCount > 0) {
      score += (containCount / phraseTokens.length) * (1 + phraseTokens.length * 0.6);
    }
  }

  // Title tokens are the cheapest, most reliable signal.
  const titleTokens = contentTokens(topic.title);
  for (const titleToken of titleTokens) {
    if (queryTokens.some((queryToken) => tokenMatches(queryToken, titleToken))) {
      score += 2.5;
    }
  }

  return score;
}

export interface MatchOptions {
  /** Restrict to these topic ids (e.g. the current tour's neighbours). */
  only?: string[];
}

export function matchTopic(
  query: string,
  topics: GuideTopic[] = GUIDE_TOPICS,
  options: MatchOptions = {},
): TopicMatch | null {
  const normalized = normalize(query);
  if (!normalized) return null;

  const pool = options.only?.length
    ? topics.filter((topic) => options.only!.includes(topic.id))
    : topics;

  let best: TopicMatch | null = null;
  for (const topic of pool) {
    const score = scoreTopic(topic, normalized);
    if (!best || score > best.score) {
      best = { topic, score, confident: false };
    }
  }

  if (!best || best.score <= 0) return null;
  best.confident = best.score >= CONFIDENCE_FLOOR;
  return best;
}

export function rankTopics(
  query: string,
  topics: GuideTopic[] = GUIDE_TOPICS,
  limit = 3,
): TopicMatch[] {
  const normalized = normalize(query);
  if (!normalized) return [];
  return topics
    .map((topic) => {
      const score = scoreTopic(topic, normalized);
      return { topic, score, confident: score >= CONFIDENCE_FLOOR };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export type GuideCommand = "next" | "previous" | "repeat" | "stop" | "ask" | "tour";

const COMMAND_PATTERNS: { command: GuideCommand; patterns: string[] }[] = [
  { command: "stop", patterns: ["stop", "stop listening", "stop the voice", "ruko", "ruko ruko", "band", "band karo", "chup", "quiet", "mute", "pause"] },
  { command: "next", patterns: ["next", "next topic", "continue", "go on", "agla", "agle", "aage", "aur batao", "keep going"] },
  { command: "previous", patterns: ["previous", "back", "pichla", "peeche", "go back"] },
  { command: "repeat", patterns: ["repeat", "again", "one more time", "phir se", "dobara", "wapas bolo", "say that again"] },
  { command: "tour", patterns: ["tour", "start the tour", "begin the tour", "start tour", "shuru karo", "guide me"] },
  { command: "ask", patterns: ["ask", "question", "i have a question", "sawal", "pooch"] },
];

export function parseCommand(text: string): GuideCommand | null {
  const normalized = normalize(text);
  if (!normalized) return null;

  // Only treat short utterances as commands; long ones are content.
  const words = normalized.split(" ");
  if (words.length > 4) return null;

  for (const { command, patterns } of COMMAND_PATTERNS) {
    for (const pattern of patterns) {
      const normalizedPattern = normalize(pattern);
      if (!normalizedPattern) continue;
      if (normalized === normalizedPattern) return command;
      if (
        normalized.startsWith(`${normalizedPattern} `) ||
        normalized.endsWith(` ${normalizedPattern}`)
      ) {
        return command;
      }
    }
  }
  return null;
}

const QUESTION_MARKERS = [
  "what", "how", "why", "who", "when", "where", "which", "explain", "meaning", "tell",
  "difference", "kya", "kaise", "kyu", "kyun", "matlab", "batao", "samjhao",
];

export function looksLikeQuestion(text: string): boolean {
  const normalized = normalize(text);
  if (!normalized) return false;
  if (/[?]/.test(text)) return true;
  const words = normalized.split(" ");
  return QUESTION_MARKERS.some((marker) => words.includes(marker));
}



