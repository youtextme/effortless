/**
 * Component registry — dependency-ordered init.
 */

const components = new Map();

export function register(component) {
  if (!component?.id) throw new Error('Component must have id');
  components.set(component.id, component);
}

export function get(id) {
  return components.get(id);
}

export function all() {
  return [...components.values()];
}

export function resolveInitOrder() {
  const ids = [...components.keys()];
  const order = [];
  const visiting = new Set();
  const visited = new Set();

  function visit(id) {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new Error(`Circular dependency involving ${id}`);
    visiting.add(id);
    const c = components.get(id);
    if (!c) throw new Error(`Missing component: ${id}`);
    for (const dep of c.dependencies || []) visit(dep);
    visiting.delete(id);
    visited.add(id);
    order.push(c);
  }

  for (const id of ids) visit(id);
  return order;
}

export async function initAll(ctx) {
  const order = resolveInitOrder();
  for (const component of order) {
    if (component.init) await component.init(ctx);
  }
  return order;
}

export async function destroyAll() {
  for (const component of [...components.values()].reverse()) {
    if (component.destroy) await component.destroy();
  }
}

export function healthAll() {
  const reports = {};
  for (const [id, c] of components) {
    reports[id] = c.health ? c.health() : { ok: true, status: 'unknown' };
  }
  return reports;
}
