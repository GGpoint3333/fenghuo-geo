// Runs a site/ script from the workspace root without assuming that any
// particular package manager binary (pnpm/npm/yarn) is on PATH. This keeps the
// root `pnpm dev|build|start|typecheck` commands working in every environment.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const site = path.join(root, 'site');
const bin = (...parts) => path.join(site, 'node_modules', ...parts);

const commands = {
  build: [path.join(site, 'scripts', 'build-with-sandbox.mjs')],
  dev: [bin('next', 'dist', 'bin', 'next'), 'dev'],
  start: [bin('next', 'dist', 'bin', 'next'), 'start'],
  typecheck: [bin('typescript', 'bin', 'tsc'), '--noEmit'],
};

const [name, ...args] = process.argv.slice(2);
const cmd = commands[name];
if (!cmd) {
  console.error(`Unknown site script: ${name}. Use one of: ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}

const result = spawnSync(process.execPath, [...cmd, ...args], {
  cwd: site,
  stdio: 'inherit',
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
});
process.exit(result.status ?? 1);
