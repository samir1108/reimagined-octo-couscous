/* Landing theme — a thin skin over the app's own design system.
 *
 * Every tone here resolves to the same CSS tokens the app speaks
 * (index.css: warm temple void, divine Vishnu gold primary, bronze
 * hairlines, glass shadows). Change the app's palette and the landing
 * follows — one system, one truth. Nothing on this page carries its
 * own hex anymore.
 */

export const VOID = "hsl(var(--void))";
export const VOID_DEEP = "hsl(var(--void-deep))";
export const SURFACE = "hsl(var(--card))";
export const GOLD_LEAF = "hsl(var(--foreground))";
export const CHAMPAGNE = "hsl(var(--accent))";
export const GOLD = "hsl(var(--primary))";
export const GOLD_BODY = "hsl(var(--muted-foreground))";
export const GOLD_EMBER = "hsl(var(--gold-ember))";

export const HAIRLINE = "1px solid hsl(var(--border) / 0.55)";
export const GOLD_HAIRLINE = "1px solid hsl(var(--primary) / 0.32)";
export const AURA = "var(--shadow-card)";

/** Gold hairline at an arbitrary alpha — the app's border token. */
export const goldAlpha = (a: number) => `hsl(var(--primary) / ${a})`;
/** Border hairline at an arbitrary alpha. */
export const borderAlpha = (a: number) => `hsl(var(--border) / ${a})`;

/** The app's primary action — gold-leaf gradient pill, dark text, temple glow. */
export const CTA_PRIMARY_CLASS =
  "group inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-full px-10 py-4 " +
  "text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground " +
  "transition-all duration-300 hover:shadow-[0_0_34px_hsl(var(--primary)/0.45)]";

/** The app's quiet secondary action — hairline pill that fills on hover. */
export const CTA_SECONDARY_CLASS =
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-full border " +
  "border-primary/30 px-10 py-4 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] " +
  "text-foreground/90 transition-colors duration-300 hover:border-primary/50 hover:bg-primary/10";

/** Icon-round control (mute, rail arrows) — hairline pill in app tokens. */
export const ICON_BUTTON_CLASS =
  "flex items-center justify-center rounded-full border border-primary/30 " +
  "bg-primary/[0.06] text-foreground/90 transition-colors duration-300 " +
  "hover:border-primary/50 hover:bg-primary/15";
