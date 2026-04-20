import test from 'node:test';
import assert from 'node:assert/strict';
import astroConfig from '../astro.config.mjs';

test('astro config keeps site metadata and performance defaults', () => {
  assert.equal(astroConfig.site, 'https://hanneskindbom.com');
  assert.equal(astroConfig.base, '/');
  assert.equal(astroConfig.output, 'static');
  assert.deepEqual(astroConfig.prefetch, {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  });
  assert.equal(astroConfig.markdown.shikiConfig.theme, 'github-dark');
});

test('astro config enables at least one integration for sitemap generation', () => {
  assert.ok(Array.isArray(astroConfig.integrations));
  assert.ok(astroConfig.integrations.some((integration) => {
    return integration?.name === '@astrojs/sitemap';
  }));
});
