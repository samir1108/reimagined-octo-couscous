/**
 * Local-timezone date key (YYYY-MM-DD).
 *
 * Gate records and daily rows must roll over at the user's local midnight, not
 * UTC midnight. `new Date().toISOString()` shifts the day for anyone east of
 * UTC (e.g. IST rolls at 05:30 local), which put late-night sessions on the
 * wrong day.
 */
export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
