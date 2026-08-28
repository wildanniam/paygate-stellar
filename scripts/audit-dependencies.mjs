import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootPath = fileURLToPath(new URL('..', import.meta.url));
const includeDev = process.argv.includes('--include-dev');
const npmExecPath = process.env.npm_execpath;
const npmCommand = npmExecPath ? process.execPath : 'npm';
const npmPrefixArgs = npmExecPath ? [npmExecPath] : [];
const packages = [
  { name: 'root', path: rootPath },
  { name: 'frontend', path: fileURLToPath(new URL('../frontend', import.meta.url)) },
  { name: 'backend', path: fileURLToPath(new URL('../backend', import.meta.url)) },
  { name: 'express example', path: fileURLToPath(new URL('../examples/express-paid-api', import.meta.url)) },
];

const failures = [];

for (const pkg of packages) {
  const args = ['audit'];
  if (!includeDev) args.push('--omit=dev');

  console.log(`\n[audit] ${pkg.name} (${includeDev ? 'all dependencies' : 'production dependencies'})`);
  const result = spawnSync(npmCommand, [...npmPrefixArgs, ...args], {
    cwd: pkg.path,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`[fail] ${pkg.name}: ${result.error.message}`);
    failures.push(pkg.name);
  } else if (result.status !== 0) {
    console.error(`[fail] ${pkg.name}: npm audit exited with ${result.status}`);
    failures.push(pkg.name);
  } else {
    console.log(`[pass] ${pkg.name}`);
  }
}

if (failures.length > 0) {
  console.error(`\nDependency audit failed for: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`\nDependency audit passed for all ${packages.length} packages.`);
}
