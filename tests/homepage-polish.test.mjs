import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './test-helpers.mjs';

const homepageSource = readFileSync(resolve(repoRoot, 'src/pages/index.astro'), 'utf8');
const globalCss = readFileSync(resolve(repoRoot, 'src/styles/global.css'), 'utf8');

test('homepage keeps the same major sections without extra header chrome', () => {
  const headerIndex = homepageSource.indexOf('<header class="site-header">');
  const postsIndex = homepageSource.indexOf('<h2 class="posts-heading">');
  const footerIndex = homepageSource.indexOf('<SiteFooter />');

  assert.notEqual(headerIndex, -1);
  assert.notEqual(postsIndex, -1);
  assert.notEqual(footerIndex, -1);
  assert.ok(headerIndex < postsIndex);
  assert.ok(postsIndex < footerIndex);

  assert.doesNotMatch(homepageSource, /MACH 5 \/\/ personal logbook/);
  assert.doesNotMatch(homepageSource, /Tracking code, cameras, and aircraft from London\./);
  assert.match(homepageSource, /class="posts-panel"/);
});

test('homepage polish CSS defines the new hierarchy and panel selectors', () => {
  assert.match(globalCss, /\.site-bio\s*\{/);
  assert.match(globalCss, /\.posts-panel\s*\{/);
  assert.match(globalCss, /\.posts-heading-row\s*\{/);
});
