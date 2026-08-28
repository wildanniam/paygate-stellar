import { createServer } from 'node:http';
import { Keypair } from '@stellar/stellar-sdk';
import verifyHandler from '../api/apis/[apiId]/verify.js';
import { createSessionToken, SESSION_COOKIE } from '../server/lib/auth.js';
import { encryptApiSecret } from '../server/lib/apiSecret.js';
import { clearRegistryForTest, getRegistryStore } from '../server/lib/registryStore.js';

process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'paygate-verify-smoke-session-secret-32';
process.env.API_SECRET_ENCRYPTION_KEY = process.env.API_SECRET_ENCRYPTION_KEY || 'paygate-verify-smoke-api-secret-key-32';
process.env.PAYGATE_REGISTRY_STORE = 'memory';
process.env.PAYGATE_RATE_LIMIT_STORE = 'memory';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function setupExpiresAt() {
  return new Date(Date.now() + 60_000).toISOString();
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
  const rejectedSecrets = [];
  const server = createServer((req, res) => {
    const suppliedSecret = req.headers['x-paygate-secret'];

    if (req.url?.startsWith('/v1/open-market-signal')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ signal: 'unguarded', confidence: 0.1 }));
      return;
    }

    if (req.url?.startsWith('/v1/old-probe-bypass')) {
      if (suppliedSecret === 'pgsec_invalid_setup_probe') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ signal: 'unguarded' }));
      return;
    }

    if (req.url?.startsWith('/v1/error-on-invalid')) {
      if (suppliedSecret !== expectedSecret) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Guard crashed' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ signal: 'bullish' }));
      return;
    }

    if (req.url?.startsWith('/v1/non-json-success')) {
      if (suppliedSecret !== expectedSecret) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('authenticated but not json');
      return;
    }

    if (req.url?.startsWith('/v1/malformed-json-success')) {
      if (suppliedSecret !== expectedSecret) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"signal":');
      return;
    }

    if (req.url?.startsWith('/v1/market-signal') || req.url?.startsWith('/v1/race-signal')) {
      if (suppliedSecret !== expectedSecret) {
        rejectedSecrets.push(suppliedSecret);
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
    rejectedSecrets,
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
    setup_expires_at: setupExpiresAt(),
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
  assert(upstream.rejectedSecrets.length === 2, 'failed verification should send negative and positive probes');
  assert(upstream.rejectedSecrets[0].startsWith('pgsec_'), 'negative probe should resemble a generated PayGate secret');
  assert(upstream.rejectedSecrets[0] !== 'pgsec_invalid_setup_probe', 'negative probe must not reuse the predictable legacy value');

  upstream.setExpectedSecret(upstreamSecret);
  const verified = await call(
    verifyHandler,
    makeReq({ cookie, url: `/api/apis/${api.id}/verify` }),
  );
  assert(verified.statusCode === 200, `verification expected 200, got ${verified.statusCode}`);
  assert(verified.body.api.status === 'active', 'verified API should become active');
  assert(verified.body.api.active === true, 'verified API should expose active=true');
  assert(verified.body.api.verifiedAt, 'verified API should expose verifiedAt');
  assert(upstream.rejectedSecrets.length === 3, 'successful verification should still send a negative probe');
  assert(upstream.rejectedSecrets[2] !== upstream.rejectedSecrets[0], 'each verification attempt must use a fresh negative secret');

  const afterPublic = await store.getPublicApi(api.id);
  assert(afterPublic?.id === api.id, 'active verified API should become public');

  const raceOwnerA = Keypair.random().publicKey();
  const raceOwnerB = Keypair.random().publicKey();
  await store.upsertDeveloper(raceOwnerA);
  await store.upsertDeveloper(raceOwnerB);
  const raceApiA = await store.createApi({
    owner_wallet: raceOwnerA,
    name: 'Race Claim A',
    upstream_base_url: upstream.baseUrl,
    path: '/v1/race-signal',
    method: 'GET',
    price_usdc: 0.01,
    status: 'pending_setup',
    active: false,
    setup_expires_at: setupExpiresAt(),
    ...encryptApiSecret(upstreamSecret),
  });
  const raceApiB = await store.createApi({
    owner_wallet: raceOwnerB,
    name: 'Race Claim B',
    upstream_base_url: upstream.baseUrl,
    path: '/v1/race-signal',
    method: 'GET',
    price_usdc: 0.01,
    status: 'pending_setup',
    active: false,
    setup_expires_at: setupExpiresAt(),
    ...encryptApiSecret(upstreamSecret),
  });
  const raceWinner = await call(
    verifyHandler,
    makeReq({
      cookie: `${SESSION_COOKIE}=${encodeURIComponent(createSessionToken(raceOwnerA))}`,
      url: `/api/apis/${raceApiA.id}/verify`,
    }),
  );
  assert(raceWinner.statusCode === 200, 'first verified endpoint claim should activate');
  const raceLoser = await call(
    verifyHandler,
    makeReq({
      cookie: `${SESSION_COOKIE}=${encodeURIComponent(createSessionToken(raceOwnerB))}`,
      url: `/api/apis/${raceApiB.id}/verify`,
    }),
  );
  assert(raceLoser.statusCode === 409, 'second verified endpoint claim should lose atomically');
  assert(raceLoser.body.code === 'endpoint_claimed', 'activation race should expose endpoint_claimed');
  const archivedRaceLoser = await store.getApi(raceApiB.id, raceOwnerB);
  assert(archivedRaceLoser.status === 'archived', 'losing endpoint claim should be archived');

  const expiredApi = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Expired Setup API',
    upstream_base_url: upstream.baseUrl,
    path: '/v1/expired',
    method: 'GET',
    price_usdc: 0.01,
    status: 'pending_setup',
    active: false,
    setup_expires_at: new Date(Date.now() - 1_000).toISOString(),
    ...encryptApiSecret(upstreamSecret),
  });
  const expiredVerify = await call(
    verifyHandler,
    makeReq({ cookie, url: `/api/apis/${expiredApi.id}/verify` }),
  );
  assert(expiredVerify.statusCode === 409, 'expired setup verification should return 409');
  assert(expiredVerify.body.code === 'setup_expired', 'expired setup should expose setup_expired');
  const archivedExpired = await store.getApi(expiredApi.id, ownerWallet);
  assert(archivedExpired.status === 'archived', 'expired setup should be archived');

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

  const openApi = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Open API',
    upstream_base_url: upstream.baseUrl,
    path: '/v1/open-market-signal',
    method: 'GET',
    price_usdc: 0.01,
    status: 'pending_setup',
    active: false,
    setup_expires_at: setupExpiresAt(),
    ...encryptApiSecret('open-secret'),
  });
  const openVerify = await call(
    verifyHandler,
    makeReq({ cookie, url: `/api/apis/${openApi.id}/verify` }),
  );
  assert(openVerify.statusCode === 400, 'unguarded API verification should return 400');
  assert(openVerify.body.code === 'setup_guard_missing', 'unguarded API should expose setup_guard_missing code');

  const oldProbeBypassApi = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Old Probe Bypass API',
    upstream_base_url: upstream.baseUrl,
    path: '/v1/old-probe-bypass',
    method: 'GET',
    price_usdc: 0.01,
    status: 'pending_setup',
    active: false,
    setup_expires_at: setupExpiresAt(),
    ...encryptApiSecret('old-probe-secret'),
  });
  const oldProbeBypassVerify = await call(
    verifyHandler,
    makeReq({ cookie, url: `/api/apis/${oldProbeBypassApi.id}/verify` }),
  );
  assert(oldProbeBypassVerify.statusCode === 400, 'legacy fixed-probe bypass should not verify');
  assert(oldProbeBypassVerify.body.code === 'setup_guard_missing', 'legacy fixed-probe bypass should expose setup_guard_missing');

  const errorOnInvalidApi = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Error On Invalid API',
    upstream_base_url: upstream.baseUrl,
    path: '/v1/error-on-invalid',
    method: 'GET',
    price_usdc: 0.01,
    status: 'pending_setup',
    active: false,
    setup_expires_at: setupExpiresAt(),
    ...encryptApiSecret(upstreamSecret),
  });
  const errorOnInvalidVerify = await call(
    verifyHandler,
    makeReq({ cookie, url: `/api/apis/${errorOnInvalidApi.id}/verify` }),
  );
  assert(errorOnInvalidVerify.statusCode === 400, '500 response to invalid secret should not verify');
  assert(
    errorOnInvalidVerify.body.code === 'setup_guard_rejection_unconfirmed',
    '500 response should expose setup_guard_rejection_unconfirmed',
  );

  const nonJsonApi = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Non JSON API',
    upstream_base_url: upstream.baseUrl,
    path: '/v1/non-json-success',
    method: 'GET',
    price_usdc: 0.01,
    status: 'pending_setup',
    active: false,
    setup_expires_at: setupExpiresAt(),
    ...encryptApiSecret(upstreamSecret),
  });
  const nonJsonVerify = await call(
    verifyHandler,
    makeReq({ cookie, url: `/api/apis/${nonJsonApi.id}/verify` }),
  );
  assert(nonJsonVerify.statusCode === 400, 'non-JSON authenticated response should not verify');
  assert(nonJsonVerify.body.code === 'setup_response_invalid', 'non-JSON response should expose setup_response_invalid');

  const malformedJsonApi = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Malformed JSON API',
    upstream_base_url: upstream.baseUrl,
    path: '/v1/malformed-json-success',
    method: 'GET',
    price_usdc: 0.01,
    status: 'pending_setup',
    active: false,
    setup_expires_at: setupExpiresAt(),
    ...encryptApiSecret(upstreamSecret),
  });
  const malformedJsonVerify = await call(
    verifyHandler,
    makeReq({ cookie, url: `/api/apis/${malformedJsonApi.id}/verify` }),
  );
  assert(malformedJsonVerify.statusCode === 400, 'malformed JSON response should not verify');
  assert(malformedJsonVerify.body.code === 'setup_response_invalid', 'malformed JSON should expose setup_response_invalid');
} finally {
  await upstream.close();
}

console.log('Phase 3 setup verification smoke test passed');
