import * as storageApi from '../../js/storage.js';

export const StorageComponent = {
  id: 'storage',
  version: '1.0.0',
  dependencies: [],
  init(ctx) {
    ctx.storage = storageApi;
  },
  health() {
    try {
      localStorage.setItem('ws_health_probe', '1');
      localStorage.removeItem('ws_health_probe');
      return { ok: true, status: 'ready' };
    } catch {
      return { ok: false, status: 'localStorage unavailable' };
    }
  },
};
