// Reproducible `pnpm build` wrapper.
//
// Next.js uses jest-worker for lint/type-check/static generation. On most hosts
// it forks child processes (JSON transport). Some locked-down sandboxes forbid
// child_process.fork entirely (spawn EPERM on the named pipe). This wrapper
// probes fork capability once and picks the right path automatically:
//
//   * fork works  -> plain `next build` with Next's default workers.
//   * fork blocked -> set FENGHUO_SANDBOX_BUILD=1 so next.config.mjs disables
//     the webpack child compiler and switches to worker_threads, and preload
//     ./sandbox-preload.cjs (structuredClone compatibility for thread payloads
//     that contain functions). Enabled explicitly via FENGHUO_SANDBOX_BUILD too.
//
// Override: FENGHUO_SANDBOX_BUILD=1 forces sandbox mode, =0 forces normal mode.
import { spawnSync, fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const nextBin = path.join(here, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const probeChild = path.join(here, 'fork-probe-child.cjs');

function probeFork() {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { child.kill(); } catch {}
      resolve(ok);
    };
    let child;
    try {
      child = fork(probeChild, [], { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
    } catch {
      return resolve(false);
    }
    child.on('error', () => finish(false)); // EPERM / spawn blocked
    child.on('message', (m) => finish(m === 'ok'));
    child.on('exit', () => finish(false));
    const timer = setTimeout(() => finish(false), 5000);
  });
}

const override = process.env.FENGHUO_SANDBOX_BUILD;
const sandbox =
  override === '1' ? true :
  override === '0' ? false :
  !(await probeFork());

const env = {
  ...process.env,
  NEXT_TELEMETRY_DISABLED: '1',
  // The type-check/static-generation phase is memory-hungry; the Node default
  // (~4 GB on 64-bit, lower effective ceilings in constrained sandboxes) can
  // abort mid-build with SIGABRT/exit 134. Pin a generous heap explicitly.
  NODE_OPTIONS: [process.env.NODE_OPTIONS, '--max-old-space-size=4096']
    .filter(Boolean)
    .join(' '),
};
if (sandbox) {
  env.FENGHUO_SANDBOX_BUILD = '1';
  const preload = path.join(here, 'sandbox-preload.cjs');
  env.NODE_OPTIONS = [env.NODE_OPTIONS, `--require ${preload}`]
    .filter(Boolean)
    .join(' ');
  console.log('[fenghuo-geo] fork unavailable -> sandbox build mode (worker_threads + shim).');
}

const result = spawnSync(process.execPath, [nextBin, 'build'], {
  stdio: 'inherit',
  env,
});
process.exit(result.status ?? 1);
