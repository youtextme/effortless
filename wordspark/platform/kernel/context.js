/**
 * Platform context — shared services injected into every component.
 */

export function createContext({ bus, telemetry, policy, registry }) {
  const sessionId = `ws-${Date.now().toString(36)}`;

  return {
    sessionId,
    bus,
    telemetry,
    policy,
    registry,
    emit(type, component, payload = {}) {
      if (!policy.allowEvent(type, component, payload)) return false;
      const event = { type, timestamp: Date.now(), component, payload, sessionId };
      bus.emit(type, event);
      telemetry.record(event);
      return true;
    },
  };
}
