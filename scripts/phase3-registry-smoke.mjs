import { Keypair } from '@stellar/stellar-sdk';
import { clearRegistryForTest, getRawApisForTest } from '../server/lib/registryStore.js';

process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'paygate-phase3-smoke-session-secret-32';
process.env.API_SECRET_ENCRYPTION_KEY = process.env.API_SECRET_ENCRYPTION_KEY || 'paygate-phase3-smoke-api-secret-key-32';
process.env.PAYGATE_REGISTRY_STORE = 'memory';

const [{ default: apisHandler }, { default: apiDetailHandler }, { createSessionToken, SESSION_COOKIE }] =
  await Promise.all([
    import('../api/apis/index.js'),
    import('../api/apis/[apiId].js'),
    import('../server/lib/auth.js'),
  ]);

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

clearRegistryForTest();

const owner = Keypair.random().publicKey();
const other = Keypair.random().publicKey();
const ownerCookie = makeCookie(owner);
const otherCookie = makeCookie(other);

const unauth = await call(
  apisHandler,
  makeReq({
    method: 'POST',
    body: {
      name: 'Unauthorized API',
      upstreamBaseUrl: 'https://example.com',
      path: '/v1/data',
      priceUsdc: '0.01',
    },
  }),
);
assert(unauth.statusCode === 401, 'unauthenticated create should return 401');

const created = await call(
  apisHandler,
  makeReq({
    method: 'POST',
    cookie: ownerCookie,
    body: {
      name: 'Market Signal API',
      upstreamBaseUrl: 'https://example.com/',
      path: '/v1/market-signal',
      priceUsdc: '0.01',
    },
  }),
);
assert(created.statusCode === 201, `create expected 201, got ${created.statusCode}`);
assert(created.body.api.ownerWallet === owner, 'owner wallet should come from session');
assert(created.body.api.secret?.startsWith('pgsec_'), 'generated secret missing');
assert(created.body.api.proxyUrl.endsWith(`/api/pay/${created.body.api.id}`), 'proxy URL missing API id');
assert(created.body.api.status === 'pending_setup', 'new API should start in pending_setup');
assert(created.body.api.active === false, 'new API should not be active before setup verification');

const raw = getRawApisForTest();
assert(raw.length === 1, 'raw API record missing');
assert(raw[0].owner_wallet === owner, 'raw owner mismatch');
assert(!JSON.stringify(raw[0]).includes(created.body.api.secret), 'secret should not be stored plaintext');
assert(raw[0].secret_ciphertext && raw[0].secret_iv && raw[0].secret_auth_tag, 'encrypted secret fields missing');

const ownerList = await call(apisHandler, makeReq({ method: 'GET', cookie: ownerCookie }));
assert(ownerList.statusCode === 200, 'owner list should return 200');
assert(ownerList.body.apis.length === 1, 'owner should see one API');

const otherList = await call(apisHandler, makeReq({ method: 'GET', cookie: otherCookie }));
assert(otherList.statusCode === 200, 'other list should return 200');
assert(otherList.body.apis.length === 0, 'other wallet should not see owner API');

const detail = await call(
  apiDetailHandler,
  makeReq({
    method: 'GET',
    cookie: ownerCookie,
    url: `/api/apis/${created.body.api.id}`,
  }),
);
assert(detail.statusCode === 200, 'owner detail should return 200');
assert(detail.body.api.secret === created.body.api.secret, 'detail should decrypt owner secret');
assert(detail.body.api.status === 'pending_setup', 'detail should expose pending setup status');

const otherPatch = await call(
  apiDetailHandler,
  makeReq({
    method: 'PATCH',
    cookie: otherCookie,
    url: `/api/apis/${created.body.api.id}`,
    body: { active: false },
  }),
);
assert(otherPatch.statusCode === 404, 'other wallet should not update owner API');

const patch = await call(
  apiDetailHandler,
  makeReq({
    method: 'PATCH',
    cookie: ownerCookie,
    url: `/api/apis/${created.body.api.id}`,
    body: { active: false },
  }),
);
assert(patch.statusCode === 200, 'owner patch should return 200');
assert(patch.body.api.active === false, 'active state should update');

console.log('Phase 3 registry smoke test passed');
