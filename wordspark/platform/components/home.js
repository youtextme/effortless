/**
 * Home — catalog + settings surface.
 * Tabs are reusable: catalogs (words, passages / later exercises) and config.
 * New exercise packs opt into a tab with homeTab: true; Settings stays chrome.
 */

import { escapeHtml, homeTabsFromCapabilities } from '../kernel/capabilities.js';

export const HOME_TABS = Object.freeze([
  { id: 'words', label: 'Words', kind: 'catalog' },
  { id: 'passages', label: 'Passages', kind: 'catalog' },
  { id: 'settings', label: 'Settings', kind: 'config' },
]);

export function normalizeTab(id, tabs = HOME_TABS) {
  const ids = tabs.map((t) => t.id);
  if (ids.includes(id)) return id;
  return ids.includes('passages') ? 'passages' : ids[0];
}

export function tabsFromRegistry(registry) {
  const tabs = homeTabsFromCapabilities(registry);
  const catalogs = tabs.filter((t) => t.id !== 'settings');
  if (!catalogs.length) return [...HOME_TABS];
  return tabs;
}

export function catalogPanelHtml(cap) {
  const id = escapeHtml(cap?.id || '');
  const label = escapeHtml(cap?.label || cap?.id || '');
  if (!id) return { tab: '', panel: '' };
  return {
    tab: `<button type="button" class="home-tab" role="tab" data-home-tab="${id}">${label}</button>`,
    panel: `<div class="home-panel" role="tabpanel" data-home-panel="${id}" hidden><div class="catalog-list" data-catalog="${id}"></div></div>`,
  };
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
  version: '1.2.0',
  dependencies: ['storage', 'capability'],
  init(ctx) {
    const tabs = tabsFromRegistry(ctx.capability);
    let tab = normalizeTab('passages', tabs);
    ctx.home = {
      tabs,
      defaultTab: tab,
      getTab: () => tab,
      setTab(id) {
        tab = normalizeTab(id, tabs);
        return tab;
      },
      normalizeTab: (id) => normalizeTab(id, tabs),
      catalogPanelHtml,
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
