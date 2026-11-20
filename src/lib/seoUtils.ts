/**
 * SEO utilities — slugify, canonical URL builders, etc.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function loopSlug(loop: { id: string; name: string }): string {
  return `${slugify(loop.name)}-${loop.id.toLowerCase()}`;
}

export function loopIdFromSlug(slug: string): string | null {
  const match = slug.match(/-([a-z]+\d+)$/i);
  return match ? match[1].toUpperCase() : null;
}
