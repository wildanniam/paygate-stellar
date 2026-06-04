import { createServer } from 'node:http';
import { encryptApiSecret } from '../api/_lib/apiSecret.js';
import { clearRegistryForTest, getRawProxyRequestsForTest, getRegistryStore } from '../api/_lib/registryStore.js';
import proxyHandler from '../api/pay/[apiId].js';

process.env.PAYGATE_REGISTRY_STORE = 'memory';
process.env.API_SECRET_ENCRYPTION_KEY = process.env.API_SECRET_ENCRYPTION_KEY || 'paygate-phase5-smoke-api-secret-key-32';
process.env.MPP_SECRET_KEY = process.env.MPP_SECRET_KEY || 'paygate-phase5-smoke-mpp-secret-key-32';
process.env.PAYGATE_ESCROW_CONTRACT_ID = process.env.PAYGATE_ESCROW_CONTRACT_ID || 'CC3EERTU5TQOZ3E53NHYNNLCE4MCYMP6NT2LUV6OWSCZHM6V3L62MIEM';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function decodeChallengeRequest(wwwAuthenticate) {
  const match = wwwAuthenticate.match(/request="([^"]+)"/);
  assert(match, 'www-authenticate missing request payload');
  return JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8'));
}

async function startServer() {
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
    proxyHandler(req, res);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

clearRegistryForTest();
const store = getRegistryStore();
const ownerWallet = 'GAGUU5KHTCX23KGVPQALUKRDYA5DF7KUTOBGGLCPV3LMUPRBCMOX7RNS';
await store.upsertDeveloper(ownerWallet);

const encrypted = encryptApiSecret('phase5-upstream-secret');
const activeApi = await store.createApi({
  owner_wallet: ownerWallet,
  name: 'Proxy Challenge API',
  upstream_base_url: 'https://example.com',
  path: '/v1/data',
  method: 'GET',
  price_usdc: 0.02,
  active: true,
  ...encrypted,
});

const inactiveApi = await store.createApi({
  owner_wallet: ownerWallet,
  name: 'Inactive API',
  upstream_base_url: 'https://example.com',
  path: '/v1/inactive',
  method: 'GET',
  price_usdc: 0.01,
  active: false,
  ...encrypted,
});

const server = await startServer();

try {
  const unknown = await fetch(`${server.baseUrl}/api/pay/not-real`);
  assert(unknown.status === 404, `unknown API expected 404, got ${unknown.status}`);

  const inactive = await fetch(`${server.baseUrl}/api/pay/${inactiveApi.id}`);
  assert(inactive.status === 404, `inactive API expected 404, got ${inactive.status}`);

  const before = getRawProxyRequestsForTest().length;
  const unpaid = await fetch(`${server.baseUrl}/api/pay/${activeApi.id}`);
  assert(unpaid.status === 402, `unpaid API expected 402, got ${unpaid.status}`);

  const requestId = unpaid.headers.get('x-paygate-request-id');
  const paymentId = unpaid.headers.get('x-paygate-payment-id');
  const challengeHeader = unpaid.headers.get('www-authenticate');
  assert(requestId, 'missing X-PayGate-Request-Id');
  assert(paymentId, 'missing X-PayGate-Payment-Id');
  assert(challengeHeader?.includes('method="stellar"'), 'missing stellar MPP challenge');

  const request = decodeChallengeRequest(challengeHeader);
  assert(request.amount === '200000', `expected amount 200000 stroops, got ${request.amount}`);
  assert(request.currency === 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA', 'unexpected challenge currency');
  assert(request.recipient === process.env.PAYGATE_ESCROW_CONTRACT_ID, 'unexpected challenge recipient');

  const logs = getRawProxyRequestsForTest();
  assert(logs.length === before + 1, 'proxy request log not created');
  const log = logs.find((row) => row.id === requestId);
  assert(log, 'logged proxy request id not found');
  assert(log.status === 'challenge_sent', 'proxy request status should be challenge_sent');
  assert(log.payment_id === paymentId, 'logged payment id mismatch');
  assert(log.api_id === activeApi.id, 'logged API id mismatch');
} finally {
  await server.close();
}

console.log('Phase 5 paid proxy unpaid smoke test passed');
