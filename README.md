# Astro static blog

Minimal [Astro](https://astro.build/) 5 starter: content collections, RSS, sitemap, static output, and a GitHub Pages workflow. Fork or clone and replace branding, copy, and posts with your own.

Created as a gift to Hannes.

## Requirements

- Node.js 22 (same as the GitHub Actions workflow)

## Quick start

```bash
npm install
make dev          # dev server with hot reload
make              # production build → dist/
make serve        # preview dist/ locally
npm test          # smoke tests
```

## Customize

- **`astro.config.mjs`** — default `site` is `https://example.com`; override with `SITE_URL` / `BASE_PATH` for GitHub project pages (see `.env.example`).
- **`src/content/`** — blog posts and config.
- **`.github/workflows/deploy-github-pages.yml`** — optional static deploy to GitHub Pages (enable Pages → Source: GitHub Actions).

## License

Use however you like after you fork it.
