// Master portraits exposed as URL strings via Vite glob.
// Keep this eager so callers can synchronously resolve image URLs, but only
// lightweight URL modules are imported here — the JPG bytes still load only
// when an <img> or background actually uses a URL.

const modules = import.meta.glob("./*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

// Build { masterId: url } from filenames like "./krishna.jpg" -> "krishna"
export const MASTER_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => {
    const id = path.replace(/^\.\//, "").replace(/\.jpg$/, "");
    return [id, url];
  })
);
