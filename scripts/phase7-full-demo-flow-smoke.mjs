import { createServer } from 'node:http';
import { Challenge, Credential, Receipt } from 'mppx';
import { USDC_SAC_TESTNET } from '@stellar/mpp';
import apisHandler from '../api/apis/index.js';
import apiDetailHandler from '../api/apis/[apiId].js';
import verifyHandler from '../api/apis/[apiId]/verify.js';
import dashboardHandler from '../api/dashboard/summary.js';
import proxyHandler from '../api/pay/[apiId].js';
import { createSessionToken, SESSION_COOKIE } from '../server/lib/auth.js';
import { clearRegistryForTest, getRawPaymentsForTest, getRawProxyRequestsForTest, getRegistryStore } from '../server/lib/registryStore.js';

process.env.PAYGATE_REGISTRY_STORE = 'memory';
process.env.PAYGATE_MPP_VERIFY_MODE = 'mock';
process.env.PAYGATE_ESCROW_CREDIT_MODE = 'memory';
process.env.PAYGATE_ESCROW_WITHDRAW_MODE = 'memory';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'paygate-full-demo-session-secret-32';
process.env.API_SECRET_ENCRYPTION_KEY = process.env.API_SECRET_ENCRYPTION_KEY || 'paygate-full-demo-api-secret-key-32';
process.env.MPP_SECRET_KEY = process.env.MPP_SECRET_KEY || 'paygate-full-demo-mpp-secret-key-32';
process.env.ESCROW_CONTRACT_ID =
  process.env.ESCROW_CONTRACT_ID || 'CC3EERTU5TQOZ3E53NHYNNLCE4MCYMP6NT2LUV6OWSCZHM6V3L62MIEM';

const OWNER_WALLET = 'GD5BCBBDALI3W35QY5DXB6JNP7SAZEXKEMOJJ4AJPTJABL4MTSZUSJKM';
const PAYER_WALLET = 'GBGXIGC36FD6COHDTBOA6KU4BW3U7UBVABMHKNRB4CRUHCIKH42IILLW';
const PAYMENT_TX_HASH = 'b'.repeat(64);

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

async function startDemoServer() {
  let expectedSecret = 'not-configured-yet';
  const server = createServer((req, res) => {
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (payload) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(payload));
      return res;
    };

    if (req.url?.startsWith('/upstream/market-signal')) {
      if (req.headers['x-paygate-secret'] !== expectedSecret) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          signal: 'bullish',
          confidence: 0.82,
          source: 'PayGate demo upstream API',
        }),
      );
      return;
    }

    proxyHandler(req, res);
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
await store.upsertDeveloper(OWNER_WALLET);
const ownerCookie = makeCookie(OWNER_WALLET);
const server = await startDemoServer();

try {
  const registered = await call(
    apisHandler,
    makeReq({
      method: 'POST',
      cookie: ownerCookie,
      body: {
        name: 'Market Signal API',
        upstreamBaseUrl: server.baseUrl,
        path: '/upstream/market-signal',
        priceUsdc: '0.02',
      },
    }),
  );
  assert(registered.statusCode === 201, `register expected 201, got ${registered.statusCode}`);
  const api = registered.body.api;
  assert(api.status === 'pending_setup', 'registered API should start pending_setup');
  assert(api.active === false, 'registered API should not be active immediately');
  assert(api.secret?.startsWith('pgsec_'), 'registered API should expose generated setup secret');

  const pendingProxy = await fetch(`${server.baseUrl}/api/pay/${api.id}`);
  assert(pendingProxy.status === 404, `pending proxy expected 404 before verification, got ${pendingProxy.status}`);

  server.setExpectedSecret(api.secret);
  const verified = await call(
    verifyHandler,
    makeReq({ method: 'POST', cookie: ownerCookie, url: `/api/apis/${api.id}/verify` }),
  );
  assert(verified.statusCode === 200, `verify setup expected 200, got ${verified.statusCode}`);
  assert(verified.body.api.status === 'active', 'verified API should become active');

  const unpaid = await fetch(`${server.baseUrl}/api/pay/${api.id}`);
  assert(unpaid.status === 402, `unpaid active proxy expected 402, got ${unpaid.status}`);
  const requestId = unpaid.headers.get('x-paygate-request-id');
  const paymentId = unpaid.headers.get('x-paygate-payment-id');
  assert(requestId, 'unpaid proxy should expose request id');
  assert(paymentId, 'unpaid proxy should expose payment id');

  const challenge = Challenge.fromResponse(unpaid);
  assert(challenge.request.externalId === paymentId, 'challenge externalId should match PayGate payment id');
  assert(challenge.request.amount === '200000', `expected 0.02 USDC in base units, got ${challenge.request.amount}`);
  assert(challenge.request.currency === USDC_SAC_TESTNET, 'challenge currency should be testnet USDC');
  assert(challenge.request.recipient === process.env.ESCROW_CONTRACT_ID, 'challenge recipient should be escrow contract');

  const credential = Credential.serialize({
    challenge,
    payload: { type: 'hash', hash: PAYMENT_TX_HASH },
    source: `did:pkh:stellar:testnet:${PAYER_WALLET}`,
  });

  const paid = await fetch(`${server.baseUrl}/api/pay/${api.id}`, {
    headers: { Authorization: credential },
  });
  assert(paid.status === 200, `paid proxy expected 200, got ${paid.status}`);
  const receipt = Receipt.fromResponse(paid);
  assert(receipt.reference === PAYMENT_TX_HASH, 'receipt should carry payment tx hash');
  const paidBody = await paid.json();
  assert(paidBody.signal === 'bullish', 'paid response should return upstream data');
  assert(paidBody.source === 'PayGate demo upstream API', 'paid response should come from guarded upstream');

  const proxyRequest = getRawProxyRequestsForTest().find((row) => row.id === requestId);
  assert(proxyRequest?.status === 'forwarded', 'proxy request should end as forwarded');
  assert(getRawPaymentsForTest().length === 1, 'paid flow should create one payment row');

  const dashboard = await call(
    dashboardHandler,
    makeReq({ method: 'GET', cookie: ownerCookie, url: '/api/dashboard/summary' }),
  );
  assert(dashboard.statusCode === 200, `dashboard expected 200, got ${dashboard.statusCode}`);
  assert(dashboard.body.summary.totalApis === 1, 'dashboard should count one API');
  assert(dashboard.body.summary.activeApis === 1, 'dashboard should count one active API');
  assert(dashboard.body.summary.successfulCalls === 1, 'dashboard should count one successful paid call');
  assert(dashboard.body.payments.length === 1, 'dashboard should include payment history');

  const reset = await call(
    apiDetailHandler,
    makeReq({ method: 'DELETE', cookie: ownerCookie, url: `/api/apis/${api.id}` }),
  );
  assert(reset.statusCode === 200, `delete/archive expected 200, got ${reset.statusCode}`);
  assert(reset.body.archived === true, 'paid API should archive instead of hard delete');
  assert(reset.body.api.status === 'archived', 'reset API should expose archived status');
  assert(await store.getPublicApi(api.id) === null, 'archived API should no longer be public');

  const freshDemo = await call(
    apisHandler,
    makeReq({
      method: 'POST',
      cookie: ownerCookie,
      body: {
        name: 'Market Signal API Demo Reset',
        upstreamBaseUrl: server.baseUrl,
        path: '/upstream/market-signal',
        priceUsdc: '0.02',
      },
    }),
  );
  assert(freshDemo.statusCode === 201, `fresh demo re-register expected 201, got ${freshDemo.statusCode}`);
  assert(freshDemo.body.api.id !== api.id, 'fresh demo should create a new API id');
  assert(freshDemo.body.api.status === 'pending_setup', 'fresh demo should restart at pending_setup');
} finally {
  await server.close();
}

console.log('Phase 7 full demo flow smoke test passed');
