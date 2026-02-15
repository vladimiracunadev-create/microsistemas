export function deepSet(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] ?? {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

export function deepGet(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

export function applyDefaults(schema, target) {
  for (const group of schema.groups) {
    for (const field of group.fields) {
      const cur = deepGet(target, field.key);
      if (cur === undefined) deepSet(target, field.key, field.default);
    }
  }
  return target;
}

export function nowIso() {
  return new Date().toISOString();
}
