import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** @param {string} path */
function normalizeBase(path) {
  if (!path || path === '/') return '/';
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

const site =
  process.env.SITE_URL?.trim() ||
  process.env.PUBLIC_SITE_URL?.trim() ||
  'https://hanneskindbom.com';
const base = normalizeBase(
  process.env.BASE_PATH?.trim() ||
    process.env.PUBLIC_BASE_PATH?.trim() ||
    '/',
);

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
