import { createServer } from 'node:http';
import { Keypair } from '@stellar/stellar-sdk';
import verifyHandler from '../api/apis/[apiId]/verify.js';
import { createSessionToken, SESSION_COOKIE } from '../server/lib/auth.js';
import { encryptApiSecret } from '../server/lib/apiSecret.js';
import { clearRegistryForTest, getRegistryStore } from '../server/lib/registryStore.js';

process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'paygate-verify-smoke-session-secret-32';
process.env.API_SECRET_ENCRYPTION_KEY = process.env.API_SECRET_ENCRYPTION_KEY || 'paygate-verify-smoke-api-secret-key-32';
process.env.PAYGATE_REGISTRY_STORE = 'memory';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeReq({ method = 'POST', cookie, url } = {}) {
  return {
    method,
    body: {},
    url,
    query: {},
    headers: {
      host: 'localhost:3000',
      'x-forwarded-proto': 'http',
      ...(cookie ? { cookie } : {}),
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

async function call(handler, req) {
  const res = makeRes();
  await handler(req, res);
  return res;
}

async function startUpstream() {
  let expectedSecret = 'not-yet-configured';
  const server = createServer((req, res) => {
    if (req.url?.startsWith('/v1/market-signal')) {
      if (req.headers['x-paygate-secret'] !== expectedSecret) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ signal: 'bullish', confidence: 0.82 }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    setExpectedSecret(secret) {
      expectedSecret = secret;
    },
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

clearRegistryForTest();
const store = getRegistryStore();
const ownerWallet = Keypair.random().publicKey();
const cookie = `${SESSION_COOKIE}=${encodeURIComponent(createSessionToken(ownerWallet))}`;
const upstreamSecret = 'phase3-verify-secret';

await store.upsertDeveloper(ownerWallet);
const upstream = await startUpstream();

try {
  const api = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Verify Setup API',
    upstream_base_url: upstream.baseUrl,
    path: '/v1/market-signal',
    method: 'GET',
    price_usdc: 0.01,
    status: 'pending_setup',
    active: false,
    ...encryptApiSecret(upstreamSecret),
  });

  const beforePublic = await store.getPublicApi(api.id);
  assert(beforePublic === null, 'pending setup API must not be public');

  const failed = await call(
    verifyHandler,
    makeReq({ cookie, url: `/api/apis/${api.id}/verify` }),
  );
  assert(failed.statusCode === 400, `verification without guard expected 400, got ${failed.statusCode}`);
  assert(failed.body.code === 'setup_verification_failed', 'failed verification should expose setup_verification_failed code');

  upstream.setExpectedSecret(upstreamSecret);
  const verified = await call(
    verifyHandler,
    makeReq({ cookie, url: `/api/apis/${api.id}/verify` }),
  );
  assert(verified.statusCode === 200, `verification expected 200, got ${verified.statusCode}`);
  assert(verified.body.api.status === 'active', 'verified API should become active');
  assert(verified.body.api.active === true, 'verified API should expose active=true');
  assert(verified.body.api.verifiedAt, 'verified API should expose verifiedAt');

  const afterPublic = await store.getPublicApi(api.id);
  assert(afterPublic?.id === api.id, 'active verified API should become public');

  const archived = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Archived API',
    upstream_base_url: upstream.baseUrl,
    path: '/v1/archived',
    method: 'GET',
    price_usdc: 0.01,
    status: 'archived',
    active: false,
    archived_at: new Date().toISOString(),
    ...encryptApiSecret('archived-secret'),
  });
  const archivedVerify = await call(
    verifyHandler,
    makeReq({ cookie, url: `/api/apis/${archived.id}/verify` }),
  );
  assert(archivedVerify.statusCode === 409, 'archived API verification should return 409');
} finally {
  await upstream.close();
}

console.log('Phase 3 setup verification smoke test passed');
