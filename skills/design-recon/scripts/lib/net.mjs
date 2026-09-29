// Node's built-in fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY=1 (Node >= 22.21).
// Re-exec once with it set, so corporate/sandbox proxies work with zero setup.
import { spawnSync } from 'node:child_process';
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.execArgv, ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}
