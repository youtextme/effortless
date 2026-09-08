import { createCapabilityRegistry, STUB_ACTIONS } from '../kernel/capabilities.js';
import { defaultPacks } from './capability-packs.js';

export const CapabilityComponent = {
  id: 'capability',
  version: '1.0.0',
  dependencies: ['storage'],
  init(ctx) {
    const registry = createCapabilityRegistry();
    const progress = () => ctx.storage.loadProgress();
    for (const action of STUB_ACTIONS) {
      registry.registerAction(action, () => {});
    }
    for (const pack of defaultPacks(progress)) {
      registry.register(pack);
    }
    ctx.capability = registry;
  },
  health() {
    const packs = defaultPacks(() => ({ completedPassages: [] }));
    const reports = packs.map((pack) => pack.health());
    return {
      ok: reports.every((r) => r.ok),
      status: reports.map((r) => r.status).join('; '),
    };
  },
};
