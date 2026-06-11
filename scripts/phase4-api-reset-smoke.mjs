import { Keypair } from '@stellar/stellar-sdk';
import apisHandler from '../api/apis/index.js';
import apiDetailHandler from '../api/apis/[apiId].js';
import { createSessionToken, SESSION_COOKIE } from '../server/lib/auth.js';
import { encryptApiSecret } from '../server/lib/apiSecret.js';
import { clearRegistryForTest, getRegistryStore } from '../server/lib/registryStore.js';

process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'paygate-reset-smoke-session-secret-32';
process.env.API_SECRET_ENCRYPTION_KEY = process.env.API_SECRET_ENCRYPTION_KEY || 'paygate-reset-smoke-api-secret-key-32';
process.env.PAYGATE_REGISTRY_STORE = 'memory';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeCookie(walletAddress) {
  return `${SESSION_COOKIE}=${encodeURIComponent(createSessionToken(walletAddress))}`;
}

function makeReq({ method = 'GET', body, cookie, url = '/api/apis' } = {}) {
  return {
    method,
    body,
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

clearRegistryForTest();
const store = getRegistryStore();
const ownerWallet = Keypair.random().publicKey();
const cookie = makeCookie(ownerWallet);

await store.upsertDeveloper(ownerWallet);

const emptyApi = await store.createApi({
  owner_wallet: ownerWallet,
  name: 'Empty API',
  upstream_base_url: 'https://example.com',
  path: '/v1/empty',
  method: 'GET',
  price_usdc: 0.01,
  status: 'pending_setup',
  active: false,
  ...encryptApiSecret('empty-secret'),
});

const deleted = await call(
  apiDetailHandler,
  makeReq({ method: 'DELETE', cookie, url: `/api/apis/${emptyApi.id}` }),
);
assert(deleted.statusCode === 200, `delete empty API expected 200, got ${deleted.statusCode}`);
assert(deleted.body.deleted === true, 'empty API should be hard deleted');
assert(deleted.body.archived === false, 'empty API should not be archived');
assert(await store.getApi(emptyApi.id, ownerWallet) === null, 'hard deleted API should be gone');

const activeApi = await store.createApi({
  owner_wallet: ownerWallet,
  name: 'Used API',
  upstream_base_url: 'https://example.com',
  path: '/v1/used',
  method: 'GET',
  price_usdc: 0.01,
  status: 'active',
  active: true,
  verified_at: new Date().toISOString(),
  ...encryptApiSecret('used-secret'),
});
await store.createProxyRequest({
  api_id: activeApi.id,
  owner_wallet: ownerWallet,
  payment_id: 'reset-smoke-payment-id',
  status: 'challenge_sent',
  price_usdc: 0.01,
});

const archived = await call(
  apiDetailHandler,
  makeReq({ method: 'DELETE', cookie, url: `/api/apis/${activeApi.id}` }),
);
assert(archived.statusCode === 200, `archive used API expected 200, got ${archived.statusCode}`);
assert(archived.body.deleted === false, 'used API should not be hard deleted');
assert(archived.body.archived === true, 'used API should be archived');
assert(archived.body.api.status === 'archived', 'archived API should expose archived status');
assert(archived.body.activity.proxyRequests === 1, 'archive response should include activity counts');
assert(await store.getPublicApi(activeApi.id) === null, 'archived API should not be public');

const replacement = await call(
  apisHandler,
  makeReq({
    method: 'POST',
    cookie,
    body: {
      name: 'Used API Demo Reset',
      upstreamBaseUrl: 'https://example.com',
      path: '/v1/used',
      priceUsdc: '0.01',
    },
  }),
);
assert(replacement.statusCode === 201, `re-register archived endpoint expected 201, got ${replacement.statusCode}`);
assert(replacement.body.api.id !== activeApi.id, 'demo reset should create a fresh API id');

console.log('Phase 4 API reset smoke test passed');
