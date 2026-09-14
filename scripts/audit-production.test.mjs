import assert from 'node:assert/strict';
import { basename } from 'node:path';
import test from 'node:test';
import { auditProduction } from './audit-production.mjs';

const quiet = () => {};

for (const failure of [
  { status: 1 }, // Security findings or an npm registry error.
  { status: null, error: new Error('npm could not start') },
  { status: null, signal: 'SIGTERM' },
]) {
  test(`audit continues after ${JSON.stringify(failure)} and fails closed`, () => {
    const visited = [];
    const exitCode = auditProduction((_command, args, { cwd }) => {
      assert.deepEqual(args.slice(-2), ['audit', '--omit=dev']);
      visited.push(basename(cwd));
      return visited.length === 1 ? failure : { status: 0 };
    }, quiet);
    assert.equal(exitCode, 1);
    assert.equal(visited.length, 4);
    assert.deepEqual(visited.slice(1), ['frontend', 'backend', 'express-paid-api']);
  });
}

test('a failure in the last scope fails the combined audit', () => {
  let calls = 0;
  assert.equal(auditProduction(() => ({ status: ++calls === 4 ? 1 : 0 }), quiet), 1);
  assert.equal(calls, 4);
});

test('combined audit passes only after all four scopes pass', () => {
  let calls = 0;
  assert.equal(auditProduction(() => { calls++; return { status: 0 }; }, quiet), 0);
  assert.equal(calls, 4);
});
