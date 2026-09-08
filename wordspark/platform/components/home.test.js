import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HomeComponent,
  HOME_TABS,
  installState,
  isStandaloneDisplay,
  normalizeTab,
} from './home.js';

const here = dirname(fileURLToPath(import.meta.url));

test('story:home-three-tabs component:home Words Passages Settings', () => {
  assert.equal(HomeComponent.id, 'home');
  assert.equal(HOME_TABS.length, 3);
  assert.deepEqual(HOME_TABS.map((t) => t.id), ['words', 'passages', 'settings']);
  assert.equal(normalizeTab('nope'), 'passages');
  assert.equal(HomeComponent.health().ok, true);

  const html = readFileSync(join(here, '../../index.html'), 'utf8');
  assert.match(html, /id="screen-home"[^>]*data-speech-surface/);
  for (const id of ['words', 'passages', 'settings']) {
    assert.match(html, new RegExp(`data-home-tab="${id}"`));
  }
  assert.match(html, /id="settings-child-name"/);
  assert.match(html, /id="words-list"/);
  assert.match(html, /id="passage-list"/);
});

test('story:install-pwa-visible component:home install is always offered', () => {
  const html = readFileSync(join(here, '../../index.html'), 'utf8');
  assert.match(html, /id="btn-install"/);
  assert.match(html, /id="install-copy"/);
  assert.doesNotMatch(html, /id="btn-install"[^>]*\bhidden\b/);

  const installed = installState({ standalone: true, canPrompt: true });
  assert.equal(installed.kind, 'installed');
  assert.equal(installed.enabled, false);
  assert.match(installed.copy, /installed app/i);

  const prompt = installState({ standalone: false, canPrompt: true });
  assert.equal(prompt.kind, 'prompt');
  assert.equal(prompt.enabled, true);

  const howto = installState({ standalone: false, canPrompt: false });
  assert.equal(howto.kind, 'howto');
  assert.match(howto.copy, /Add to Home Screen/);

  assert.equal(isStandaloneDisplay({
    matchMedia: () => ({ matches: true }),
  }), true);
  assert.equal(isStandaloneDisplay({ standalone: true }), true);
  assert.equal(isStandaloneDisplay({}), false);

  const homeSrc = readFileSync(join(here, './home.js'), 'utf8');
  assert.match(homeSrc, /display-mode: standalone/);
  const shell = readFileSync(join(here, '../shell.js'), 'utf8');
  assert.match(shell, /beforeinstallprompt/);
  assert.match(shell, /updateInstallUi/);
  assert.match(shell, /isStandaloneDisplay/);
});
