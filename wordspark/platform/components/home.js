/**
 * Home — catalog + settings surface.
 * Tabs are reusable: catalogs (words, passages / later exercises) and config.
 */

export const HOME_TABS = Object.freeze([
  { id: 'words', label: 'Words', kind: 'catalog' },
  { id: 'passages', label: 'Passages', kind: 'catalog' },
  { id: 'settings', label: 'Settings', kind: 'config' },
]);

const TAB_IDS = HOME_TABS.map((t) => t.id);

export function normalizeTab(id) {
  return TAB_IDS.includes(id) ? id : 'passages';
}

export function isStandaloneDisplay({ matchMedia, standalone } = {}) {
  try {
    if (matchMedia?.('(display-mode: standalone)')?.matches) return true;
  } catch {
    /* ignore */
  }
  return Boolean(standalone);
}

export function installState({ standalone = false, canPrompt = false } = {}) {
  if (standalone) {
    return {
      kind: 'installed',
      button: 'Installed',
      enabled: false,
      copy: 'You are in the installed app. Your words, passages, and place in the story stay on this device, so you can pick up right where you left off.',
    };
  }
  if (canPrompt) {
    return {
      kind: 'prompt',
      button: 'Install app',
      enabled: true,
      copy: 'Install WordSpark so it feels like an app on this phone, tablet, or laptop. Your memory stays on this device — come back and we start where you stopped.',
    };
  }
  return {
    kind: 'howto',
    button: 'How to install',
    enabled: true,
    copy: 'Add WordSpark to your home screen so it opens like an app. On iPhone or iPad: tap Share, then Add to Home Screen. On a computer: use the browser menu → Install or Add to Home Screen. After that, your place is saved here.',
  };
}

export const HomeComponent = {
  id: 'home',
  version: '1.0.0',
  dependencies: ['storage'],
  init(ctx) {
    let tab = 'passages';
    ctx.home = {
      tabs: HOME_TABS,
      defaultTab: 'passages',
      getTab: () => tab,
      setTab(id) {
        tab = normalizeTab(id);
        return tab;
      },
      normalizeTab,
      installState,
      isStandaloneDisplay,
    };
  },
  health() {
    return {
      ok: HOME_TABS.length === 3 && HOME_TABS.every((t) => t.id && t.kind),
      status: 'ready',
    };
  },
};
