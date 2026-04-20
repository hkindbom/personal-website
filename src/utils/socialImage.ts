/**
 * Turn frontmatter path (`/images/x.png`) or absolute URL into a full URL for OG tags.
 * `assetRoot` is usually `new URL(import.meta.env.BASE_URL, Astro.site)` so paths work
 * with a GitHub Pages project prefix.
 */
export function resolveSocialImage(
  assetRoot: URL,
  raw: string | undefined,
  defaultPath = '/og-default.png',
): string {
  const def = defaultPath.charAt(0) === '/' ? defaultPath.slice(1) : defaultPath;
  const fallback = new URL(def, assetRoot).href;
  if (!raw?.trim()) return fallback;
  const s = raw.trim();
  if (/^https?:\/\//i.test(s)) return s;
  const path = s.charAt(0) === '/' ? s.slice(1) : s;
  return new URL(path, assetRoot).href;
}
