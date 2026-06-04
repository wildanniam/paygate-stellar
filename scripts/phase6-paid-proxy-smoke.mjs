import { createServer } from 'node:http';
import { Challenge, Credential, Receipt } from 'mppx';
import { USDC_SAC_TESTNET } from '@stellar/mpp';
import { encryptApiSecret } from '../api/_lib/apiSecret.js';
import {
  clearRegistryForTest,
  getRawPaymentsForTest,
  getRawProxyRequestsForTest,
  getRegistryStore,
} from '../api/_lib/registryStore.js';
import proxyHandler from '../api/pay/[apiId].js';

process.env.PAYGATE_REGISTRY_STORE = 'memory';
process.env.PAYGATE_MPP_VERIFY_MODE = 'mock';
process.env.PAYGATE_ESCROW_CREDIT_MODE = 'memory';
process.env.API_SECRET_ENCRYPTION_KEY = process.env.API_SECRET_ENCRYPTION_KEY || 'paygate-phase6-smoke-api-secret-key-32';
process.env.MPP_SECRET_KEY = process.env.MPP_SECRET_KEY || 'paygate-phase6-smoke-mpp-secret-key-32';
process.env.ESCROW_CONTRACT_ID =
  process.env.ESCROW_CONTRACT_ID || 'CC3EERTU5TQOZ3E53NHYNNLCE4MCYMP6NT2LUV6OWSCZHM6V3L62MIEM';

const UPSTREAM_SECRET = 'phase6-upstream-secret';
const PAYER_WALLET = 'GBGXIGC36FD6COHDTBOA6KU4BW3U7UBVABMHKNRB4CRUHCIKH42IILLW';
const PAYMENT_TX_HASH = 'a'.repeat(64);

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

    if (req.url?.startsWith('/upstream/market-signal')) {
      if (req.headers['x-paygate-secret'] !== UPSTREAM_SECRET) {
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
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

clearRegistryForTest();
const store = getRegistryStore();
const ownerWallet = 'GD5BCBBDALI3W35QY5DXB6JNP7SAZEXKEMOJJ4AJPTJABL4MTSZUSJKM';
await store.upsertDeveloper(ownerWallet);

const server = await startServer();

try {
  const encrypted = encryptApiSecret(UPSTREAM_SECRET);
  const api = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Phase 6 Paid Proxy API',
    upstream_base_url: server.baseUrl,
    path: '/upstream/market-signal',
    method: 'GET',
    price_usdc: 0.02,
    active: true,
    ...encrypted,
  });

  const unpaid = await fetch(`${server.baseUrl}/api/pay/${api.id}`);
  assert(unpaid.status === 402, `unpaid API expected 402, got ${unpaid.status}`);
  const requestId = unpaid.headers.get('x-paygate-request-id');
  const paymentId = unpaid.headers.get('x-paygate-payment-id');
  assert(requestId, 'missing unpaid X-PayGate-Request-Id');
  assert(paymentId, 'missing unpaid X-PayGate-Payment-Id');

  const challenge = Challenge.fromResponse(unpaid);
  assert(challenge.request.externalId === paymentId, 'challenge externalId must equal PayGate payment id');
  assert(challenge.request.amount === '200000', `expected 200000 base units, got ${challenge.request.amount}`);
  assert(challenge.request.currency === USDC_SAC_TESTNET, 'unexpected challenge currency');
  assert(challenge.request.recipient === process.env.ESCROW_CONTRACT_ID, 'unexpected challenge recipient');

  const credential = Credential.serialize({
    challenge,
    payload: { type: 'hash', hash: PAYMENT_TX_HASH },
    source: `did:pkh:stellar:testnet:${PAYER_WALLET}`,
  });

  const paid = await fetch(`${server.baseUrl}/api/pay/${api.id}`, {
    headers: {
      Authorization: credential,
    },
  });
  assert(paid.status === 200, `paid API expected 200, got ${paid.status}`);

  const receipt = Receipt.fromResponse(paid);
  assert(receipt.reference === PAYMENT_TX_HASH, 'receipt tx hash mismatch');
  assert(receipt.externalId === paymentId, 'receipt externalId mismatch');

  const body = await paid.json();
  assert(body.signal === 'bullish', 'paid response missing upstream signal');
  assert(body.source === 'PayGate demo upstream API', 'paid response did not come from upstream API');

  const proxyRequests = getRawProxyRequestsForTest();
  const request = proxyRequests.find((row) => row.id === requestId);
  assert(request, 'proxy request log not found');
  assert(request.status === 'forwarded', `expected forwarded status, got ${request.status}`);
  assert(request.tx_hash === PAYMENT_TX_HASH, 'proxy request tx hash not saved');
  assert(request.upstream_status === 200, 'proxy request upstream status not saved');
  assert(request.payer_wallet === PAYER_WALLET, 'proxy request payer wallet not saved');

  const payments = getRawPaymentsForTest();
  assert(payments.length === 1, `expected one payment row, got ${payments.length}`);
  assert(payments[0].payment_id === paymentId, 'payment row payment id mismatch');
  assert(payments[0].tx_hash === PAYMENT_TX_HASH, 'payment row tx hash mismatch');
  assert(payments[0].credit_tx_hash === `mock-credit-${paymentId}`, 'payment credit tx hash mismatch');
  assert(payments[0].gross_amount_usdc === '0.0200000', 'gross amount mismatch');
  assert(payments[0].developer_amount_usdc === '0.0180000', 'developer amount mismatch');
  assert(payments[0].platform_fee_usdc === '0.0020000', 'platform fee mismatch');

  const duplicate = await fetch(`${server.baseUrl}/api/pay/${api.id}`, {
    headers: {
      Authorization: credential,
    },
  });
  assert(duplicate.status === 409, `duplicate credential expected 409, got ${duplicate.status}`);
  assert(getRawPaymentsForTest().length === 1, 'duplicate payment created another payment row');

  const wrongApi = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Wrong API',
    upstream_base_url: server.baseUrl,
    path: '/upstream/market-signal',
    method: 'GET',
    price_usdc: 0.02,
    active: true,
    ...encrypted,
  });
  const wrongMapping = await fetch(`${server.baseUrl}/api/pay/${wrongApi.id}`, {
    headers: {
      Authorization: credential,
    },
  });
  assert(wrongMapping.status === 402, `wrong mapping expected 402, got ${wrongMapping.status}`);
  const requestAfterWrongMapping = getRawProxyRequestsForTest().find((row) => row.id === requestId);
  assert(requestAfterWrongMapping.status === 'forwarded', 'wrong mapping should not mutate original forwarded request');
} finally {
  await server.close();
}

console.log('Phase 6 paid proxy success smoke test passed');
