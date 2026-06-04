import fs from 'node:fs';
import upstreamHandler from '../api/upstream/market-signal.js';

process.env.PAYGATE_DEMO_UPSTREAM_SECRET = 'phase4-demo-upstream-secret';

function makeReq({ method = 'GET', secret } = {}) {
  return {
    method,
    headers: {
      ...(secret ? { 'x-paygate-secret': secret } : {}),
    },
  };
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function call(req) {
  const res = makeRes();
  upstreamHandler(req, res);
  return res;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const missing = call(makeReq());
assert(missing.statusCode === 401, 'missing secret should return 401');

const wrong = call(makeReq({ secret: 'wrong-secret' }));
assert(wrong.statusCode === 401, 'wrong secret should return 401');

const ok = call(makeReq({ secret: process.env.PAYGATE_DEMO_UPSTREAM_SECRET }));
assert(ok.statusCode === 200, 'correct secret should return 200');
assert(ok.body.signal === 'bullish', 'market signal missing');
assert(ok.body.source === 'PayGate demo upstream API', 'source mismatch');

const source = fs.readFileSync(new URL('../api/upstream/market-signal.js', import.meta.url), 'utf8');
assert(!source.includes('@stellar/mpp'), 'upstream API must not import @stellar/mpp');
assert(!source.includes('mppx'), 'upstream API must not import mppx');

console.log('Phase 4 upstream API smoke test passed');
