import { createServer } from 'node:http';
import { encryptApiSecret } from '../server/lib/apiSecret.js';
import { createSessionToken, SESSION_COOKIE } from '../server/lib/auth.js';
import { clearRegistryForTest, getRegistryStore } from '../server/lib/registryStore.js';
import dashboardHandler from '../api/dashboard/summary.js';
import { buildDashboardModel } from '../frontend/src/lib/dashboardViewModel.js';

process.env.PAYGATE_REGISTRY_STORE = 'memory';
process.env.API_SECRET_ENCRYPTION_KEY = process.env.API_SECRET_ENCRYPTION_KEY || 'paygate-phase7-smoke-api-secret-key-32';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'paygate-phase7-smoke-session-secret-32';
process.env.ESCROW_CONTRACT_ID =
  process.env.ESCROW_CONTRACT_ID || 'CC3EERTU5TQOZ3E53NHYNNLCE4MCYMP6NT2LUV6OWSCZHM6V3L62MIEM';

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
    dashboardHandler(req, res);
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
const ownerWallet = 'GD5BCBBDALI3W35QY5DXB6JNP7SAZEXKEMOJJ4AJPTJABL4MTSZUSJKM';
const otherWallet = 'GAGUU5KHTCX23KGVPQALUKRDYA5DF7KUTOBGGLCPV3LMUPRBCMOX7RNS';
await store.upsertDeveloper(ownerWallet);
await store.upsertDeveloper(otherWallet);

const encrypted = encryptApiSecret('phase7-upstream-secret');
const ownerApi = await store.createApi({
  owner_wallet: ownerWallet,
  name: 'Dashboard Owner API',
  upstream_base_url: 'https://example.com',
  path: '/v1/owner',
  method: 'GET',
  price_usdc: 0.02,
  active: true,
  ...encrypted,
});
const otherApi = await store.createApi({
  owner_wallet: otherWallet,
  name: 'Other Wallet API',
  upstream_base_url: 'https://example.com',
  path: '/v1/other',
  method: 'GET',
  price_usdc: 0.99,
  active: true,
  ...encrypted,
});

const forwarded = await store.createProxyRequest({
  api_id: ownerApi.id,
  owner_wallet: ownerWallet,
  payment_id: 'powner001',
  status: 'forwarded',
  price_usdc: 0.02,
});
await store.updateProxyRequest(forwarded.id, {
  payer_wallet: 'GBGXIGC36FD6COHDTBOA6KU4BW3U7UBVABMHKNRB4CRUHCIKH42IILLW',
  tx_hash: 'b'.repeat(64),
  upstream_status: 200,
  paid_at: new Date().toISOString(),
  forwarded_at: new Date().toISOString(),
});
await store.createProxyRequest({
  api_id: ownerApi.id,
  owner_wallet: ownerWallet,
  payment_id: 'powner002',
  status: 'upstream_failed',
  price_usdc: 0.02,
});
await store.createProxyRequest({
  api_id: otherApi.id,
  owner_wallet: otherWallet,
  payment_id: 'pother001',
  status: 'forwarded',
  price_usdc: 0.99,
});

await store.createPayment({
  request_id: forwarded.id,
  api_id: ownerApi.id,
  payment_id: 'powner001',
  tx_hash: 'b'.repeat(64),
  credit_tx_hash: 'c'.repeat(64),
  gross_amount_usdc: '0.0200000',
  developer_amount_usdc: '0.0180000',
  platform_fee_usdc: '0.0020000',
  recipient_mode: 'contract',
  verified_at: new Date().toISOString(),
  credited_at: new Date().toISOString(),
});
await store.createPayment({
  request_id: '00000000-0000-0000-0000-000000000000',
  api_id: otherApi.id,
  payment_id: 'pother001',
  tx_hash: 'd'.repeat(64),
  credit_tx_hash: 'e'.repeat(64),
  gross_amount_usdc: '0.9900000',
  developer_amount_usdc: '0.8910000',
  platform_fee_usdc: '0.0990000',
  recipient_mode: 'contract',
  verified_at: new Date().toISOString(),
  credited_at: new Date().toISOString(),
});
await store.createPayment({
  request_id: '00000000-0000-0000-0000-000000000001',
  api_id: ownerApi.id,
  payment_id: 'pownerpending',
  tx_hash: 'f'.repeat(64),
  gross_amount_usdc: '9.9900000',
  developer_amount_usdc: '8.9910000',
  platform_fee_usdc: '0.9990000',
  recipient_mode: 'contract',
  verified_at: new Date().toISOString(),
});

const server = await startServer();

try {
  const unauthenticated = await fetch(`${server.baseUrl}/api/dashboard/summary`);
  assert(unauthenticated.status === 401, `unauthenticated dashboard expected 401, got ${unauthenticated.status}`);

  const authenticated = await fetch(`${server.baseUrl}/api/dashboard/summary`, {
    headers: {
      Cookie: `${SESSION_COOKIE}=${createSessionToken(ownerWallet)}`,
    },
  });
  assert(authenticated.status === 200, `authenticated dashboard expected 200, got ${authenticated.status}`);
  const body = await authenticated.json();

  assert(body.walletAddress === ownerWallet, 'dashboard wallet mismatch');
  assert(body.summary.totalApis === 1, 'dashboard should only count owner APIs');
  assert(body.summary.activeApis === 1, 'dashboard active API count mismatch');
  assert(body.summary.totalCalls === 2, 'dashboard owner request count mismatch');
  assert(body.summary.successfulCalls === 1, 'dashboard successful call count mismatch');
  assert(body.summary.failedCalls === 1, 'dashboard failed call count mismatch');
  assert(body.summary.grossRevenueUsdc === '0.0200000', 'dashboard gross revenue mismatch');
  assert(body.summary.platformFeeUsdc === '0.0020000', 'dashboard fee revenue mismatch');
  assert(body.apis.length === 1 && body.apis[0].id === ownerApi.id, 'dashboard leaked another owner API');
  assert(body.payments.length === 2, 'dashboard payment rows mismatch');
  assert(
    body.payments.some((payment) => payment.txHash === 'b'.repeat(64) && payment.creditStatus === 'credited'),
    'dashboard should identify credited payments',
  );
  assert(
    body.payments.some((payment) => payment.txHash === 'f'.repeat(64) && payment.creditStatus === 'unsubmitted'),
    'dashboard should identify payments awaiting escrow credit',
  );
  assert(body.requests.length === 2, 'dashboard request rows mismatch');
  assert(body.escrow && typeof body.escrow.developerBalance?.baseUnits === 'string', 'dashboard escrow balance missing');

  for (let index = 0; index < 105; index += 1) {
    await store.createProxyRequest({
      api_id: ownerApi.id,
      owner_wallet: ownerWallet,
      payment_id: `pcapped${String(index).padStart(3, '0')}`,
      status: 'challenge_sent',
      price_usdc: 0.02,
    });
  }
  const cappedResponse = await fetch(`${server.baseUrl}/api/dashboard/summary`, {
    headers: {
      Cookie: `${SESSION_COOKIE}=${createSessionToken(ownerWallet)}`,
    },
  });
  assert(cappedResponse.status === 200, 'dashboard cap verification request should succeed');
  const capped = await cappedResponse.json();
  assert(capped.requests.length === 100, 'dashboard activity feed should remain capped at 100 rows');
  assert(capped.summary.totalCalls === 107, 'all-time dashboard total must include rows beyond the activity cap');
  assert(capped.apis[0].calls === 107, 'per-API total must include rows beyond the activity cap');
  assert(
    capped.analytics.daily.reduce((sum, row) => sum + row.totalCalls, 0) === 107,
    'daily analytics should preserve exact request totals',
  );
  const model = buildDashboardModel(capped, 30, new Date());
  assert(model.summary.totalCalls === 107, 'frontend range metrics should use aggregate rows, not the recent feed');
  assert(
    Math.abs(model.summary.developerRevenueUsdc - 0.018) < 0.0000001,
    'frontend revenue must exclude payments that have not reached escrow credit',
  );
  const pendingCredit = model.activityRows.find((row) => row.paymentId === 'pownerpending');
  assert(pendingCredit?.result === 'credit pending', 'pending escrow credit should be visible in activity');
  assert(pendingCredit?.revenue === '0 USDC', 'pending escrow credit must not display earned revenue');
  assert(
    Math.abs(model.revenueTrend.reduce((sum, value) => sum + value, 0) - 0.018) < 0.0000001,
    'chronological revenue trend should preserve credited developer revenue',
  );
} finally {
  await server.close();
}

console.log('Phase 7 dashboard summary smoke test passed');
