import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { normalizeSignedMessage } from '../frontend/src/lib/walletAuth.js';

const expected = Buffer.from([1, 2, 3, 254, 255]).toString('base64');

assert.equal(normalizeSignedMessage('already-base64'), 'already-base64');
assert.equal(
  normalizeSignedMessage({ type: 'Buffer', data: [1, 2, 3, 254, 255] }),
  expected,
);
assert.equal(normalizeSignedMessage(Uint8Array.from([1, 2, 3, 254, 255])), expected);
assert.equal(
  normalizeSignedMessage(Uint8Array.from([0, 1, 2, 3, 254, 255, 0]).subarray(1, 6)),
  expected,
);
assert.equal(normalizeSignedMessage(Uint8Array.from([1, 2, 3, 254, 255]).buffer), expected);
assert.equal(normalizeSignedMessage(null), '');

console.log('Wallet auth signature normalization smoke test passed');
