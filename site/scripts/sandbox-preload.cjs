// Opt-in preload for build hosts that forbid child_process.fork (e.g. locked-down
// CI / agent sandboxes). Enabled only when FENGHUO_SANDBOX_BUILD=1 via
// scripts/build-with-sandbox.mjs. On a normal machine this file is never loaded.
//
// Why it exists: Next.js static generation uses jest-worker. With
// experimental.workerThreads:true it sends task payloads through
// Worker.postMessage (structuredClone), which throws DataCloneError when a
// payload contains a function (Next passes config objects with callbacks such
// as `() => null`). The default fork transport uses JSON serialization and
// silently drops those functions instead. This shim mirrors that behaviour.
const { Worker } = require('worker_threads');

if (!Worker.prototype.__fenghuoStripPatched) {
  const original = Worker.prototype.postMessage;

  function strip(value, seen) {
    if (typeof value === 'function') return null;
    if (value === null || typeof value !== 'object') return value;
    if (seen.has(value)) return value;
    seen.add(value);
    const keys = Array.isArray(value)
      ? Array.from({ length: value.length }, (_, i) => i)
      : Object.keys(value);
    for (const key of keys) {
      const item = value[key];
      if (typeof item === 'function') value[key] = null;
      else if (item && typeof item === 'object') strip(item, seen);
    }
    return value;
  }

  Worker.prototype.postMessage = function (value, ...rest) {
    return original.call(this, strip(value, new Set()), ...rest);
  };
  Worker.prototype.__fenghuoStripPatched = true;
}
