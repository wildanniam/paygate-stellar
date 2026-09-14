import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootPath = fileURLToPath(new URL('..', import.meta.url));
export const auditScopes = ['.', 'frontend', 'backend', 'examples/express-paid-api'];

// Inspect every lockfile, even when another scope has advisories or a registry error.
export function auditProduction(run = spawnSync, log = console.log) {
  const results = auditScopes.map((scope) => {
    log(`\nProduction dependency audit: ${scope}`);
    const args = ['audit', '--omit=dev'];
    const result = process.env.npm_execpath
      ? run(process.execPath, [process.env.npm_execpath, ...args], {
        cwd: resolve(rootPath, scope), stdio: 'inherit',
      })
      : run('npm', args, { cwd: resolve(rootPath, scope), stdio: 'inherit' });
    if (result.error) log(`${scope}: ${result.error.message}`);
    return { scope, passed: result.status === 0 && !result.error && !result.signal };
  });

  log('\nProduction audit summary');
  for (const { scope, passed } of results) log(`${passed ? 'PASS' : 'FAIL'} ${scope}`);
  return results.every(({ passed }) => passed) ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = auditProduction();
}
