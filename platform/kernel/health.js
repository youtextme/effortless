/**
 * Health orchestration — self-healing checks and recovery hooks.
 */

let intervalId = null;

export function createHealth({ registry, bus, recoveries = {} }) {
  async function checkAll() {
    const reports = registry.healthAll();
    const unhealthy = Object.entries(reports).filter(([, r]) => !r.ok);

    for (const [id, report] of unhealthy) {
      bus.emit('health.degraded', { component: id, report, timestamp: Date.now() });
      if (recoveries[id]) {
        try {
          await recoveries[id](report);
          bus.emit('health.recovered', { component: id, timestamp: Date.now() });
        } catch (err) {
          bus.emit('health.recovery-failed', { component: id, error: String(err), timestamp: Date.now() });
        }
      }
    }

    return { reports, ok: unhealthy.length === 0 };
  }

  return {
    checkAll,
    start(intervalMs = 60000) {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => { checkAll(); }, intervalMs);
    },
    stop() {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    },
  };
}
