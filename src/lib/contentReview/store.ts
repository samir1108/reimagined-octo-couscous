/**
 * CONTENT REVIEW — sample, approve, flag.
 * Local first: the review queue is a tool, not user data.
 */

export type ReviewStatus = "approved" | "flagged";

const KEY = "satyug:content-review:v1";

export function loadReviews(): Record<string, ReviewStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, ReviewStatus>) : {};
  } catch {
    return {};
  }
}

export function setReview(id: string, status: ReviewStatus): Record<string, ReviewStatus> {
  const next = { ...loadReviews(), [id]: status };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

export function reviewStats(reviews: Record<string, ReviewStatus>): {
  approved: number;
  flagged: number;
} {
  const values = Object.values(reviews);
  return {
    approved: values.filter((value) => value === "approved").length,
    flagged: values.filter((value) => value === "flagged").length,
  };
}
