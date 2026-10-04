# hanneskindbom.com

Personal blog built with [Astro](https://astro.build/).

## Development

```bash
npm install
make dev     # dev server
make         # production build
npm test     # tests
```

## Deploys and previews

- `main` is published to GitHub Pages (`.github/workflows/deploy-github-pages.yml`).
- Every other branch is built by Cloudflare Workers Builds (`wrangler.jsonc`) and served at
  `<branch>-personal-website.hanneskindbom.workers.dev`, behind Cloudflare Access. The Cloudflare bot
  comments the URL on the PR. Preview builds are marked `noindex`.
