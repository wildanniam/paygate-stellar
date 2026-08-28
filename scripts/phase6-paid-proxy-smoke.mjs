import { createServer } from 'node:http';
import { Challenge, Credential, Receipt } from 'mppx';
import { USDC_SAC_TESTNET } from '@stellar/mpp';
import { encryptApiSecret } from '../server/lib/apiSecret.js';
import { getMockEscrowCreditSubmissionCountForTest } from '../server/lib/escrowContract.js';
import { PAYMENT_ID_LENGTH, PAYMENT_ID_PATTERN } from '../server/lib/paymentId.js';
import {
  clearRegistryForTest,
  getRawPaymentsForTest,
  getRawProxyRequestsForTest,
  getRegistryStore,
} from '../server/lib/registryStore.js';
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
const RETRY_PAYMENT_TX_HASH = 'b'.repeat(64);
const REDIRECT_PAYMENT_TX_HASH = 'c'.repeat(64);
const CONCURRENT_PAYMENT_TX_HASH = 'd'.repeat(64);
const RECOVERY_PAYMENT_TX_HASH = 'e'.repeat(64);
let flakyFailuresRemaining = 1;
let concurrentUpstreamCalls = 0;
let recoveryUpstreamCalls = 0;
const concurrentDeliveryHeaders = [];

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

    if (
      req.url?.startsWith('/upstream/market-signal')
      || req.url?.startsWith('/upstream/flaky-signal')
      || req.url?.startsWith('/upstream/redirect-signal')
      || req.url?.startsWith('/upstream/concurrent-signal')
      || req.url?.startsWith('/upstream/recovery-signal')
    ) {
      if (req.headers['x-paygate-secret'] !== UPSTREAM_SECRET) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      if (req.url?.startsWith('/upstream/redirect-signal')) {
        res.statusCode = 307;
        res.setHeader('Location', '/upstream/market-signal');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Redirecting...');
        return;
      }

      if (req.url?.startsWith('/upstream/flaky-signal') && flakyFailuresRemaining > 0) {
        flakyFailuresRemaining -= 1;
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Temporary upstream outage' }));
        return;
      }

      const respond = () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(
          JSON.stringify({
            signal: 'bullish',
            confidence: 0.82,
            source: 'PayGate demo upstream API',
          }),
        );
      };
      if (req.url?.startsWith('/upstream/concurrent-signal')) {
        concurrentUpstreamCalls += 1;
        concurrentDeliveryHeaders.push({
          requestId: req.headers['x-paygate-request-id'],
          paymentId: req.headers['x-paygate-payment-id'],
          idempotencyKey: req.headers['idempotency-key'],
        });
        setTimeout(respond, 150);
        return;
      }
      if (req.url?.startsWith('/upstream/recovery-signal')) {
        recoveryUpstreamCalls += 1;
      }
      respond();
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
  assert(paymentId.length === PAYMENT_ID_LENGTH, 'payment id length is not contract-compatible');
  assert(PAYMENT_ID_PATTERN.test(paymentId), 'payment id does not contain 120 bits of hex entropy');

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
  assert(payments[0].credit_status === 'credited', 'payment credit state should be finalized');
  assert(payments[0].credit_transaction_xdr?.includes(paymentId), 'signed credit transaction should be persisted');
  assert(getMockEscrowCreditSubmissionCountForTest(paymentId) === 1, 'escrow credit should submit once');
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
    path: '/upstream/wrong-signal',
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

  const flakyApi = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Flaky Paid Proxy API',
    upstream_base_url: server.baseUrl,
    path: '/upstream/flaky-signal',
    method: 'GET',
    price_usdc: 0.02,
    active: true,
    ...encrypted,
  });

  const flakyUnpaid = await fetch(`${server.baseUrl}/api/pay/${flakyApi.id}`);
  assert(flakyUnpaid.status === 402, `flaky unpaid API expected 402, got ${flakyUnpaid.status}`);
  const flakyPaymentId = flakyUnpaid.headers.get('x-paygate-payment-id');
  const flakyChallenge = Challenge.fromResponse(flakyUnpaid);
  const flakyCredential = Credential.serialize({
    challenge: flakyChallenge,
    payload: { type: 'hash', hash: RETRY_PAYMENT_TX_HASH },
    source: `did:pkh:stellar:testnet:${PAYER_WALLET}`,
  });

  const flakyFirst = await fetch(`${server.baseUrl}/api/pay/${flakyApi.id}`, {
    headers: {
      Authorization: flakyCredential,
    },
  });
  assert(flakyFirst.status === 503, `flaky first paid API expected 503, got ${flakyFirst.status}`);
  assert(flakyFirst.headers.get('x-paygate-retryable') === 'true', 'failed upstream response should be retryable');
  assert(flakyFirst.headers.get('x-paygate-payment-id') === flakyPaymentId, 'retryable response payment id mismatch');

  const failedRequest = getRawProxyRequestsForTest().find((row) => row.payment_id === flakyPaymentId);
  assert(failedRequest.status === 'upstream_failed', `expected upstream_failed, got ${failedRequest.status}`);
  assert(failedRequest.tx_hash === RETRY_PAYMENT_TX_HASH, 'failed request tx hash not saved');
  assert(failedRequest.upstream_status === 503, 'failed request upstream status not saved');

  const failedPayment = getRawPaymentsForTest().find((row) => row.payment_id === flakyPaymentId);
  assert(failedPayment, 'failed upstream should still record payment');
  assert(failedPayment.credit_tx_hash === `mock-credit-${flakyPaymentId}`, 'failed upstream should still credit escrow once');

  const flakyRetry = await fetch(`${server.baseUrl}/api/pay/${flakyApi.id}`, {
    headers: {
      Authorization: flakyCredential,
    },
  });
  assert(flakyRetry.status === 200, `flaky retry paid API expected 200, got ${flakyRetry.status}`);
  assert(flakyRetry.headers.get('x-paygate-retryable') === 'false', 'successful retry should not be retryable');
  const retryBody = await flakyRetry.json();
  assert(retryBody.signal === 'bullish', 'retry response missing upstream signal');

  const retriedRequest = getRawProxyRequestsForTest().find((row) => row.payment_id === flakyPaymentId);
  assert(retriedRequest.status === 'forwarded', `expected forwarded after retry, got ${retriedRequest.status}`);
  assert(retriedRequest.upstream_status === 200, 'retried request upstream status not saved');

  const retryPayments = getRawPaymentsForTest().filter((row) => row.payment_id === flakyPaymentId);
  assert(retryPayments.length === 1, 'retry should not create another payment row');
  assert(retryPayments[0].credit_tx_hash === `mock-credit-${flakyPaymentId}`, 'retry should not credit escrow again');

  const flakyDuplicate = await fetch(`${server.baseUrl}/api/pay/${flakyApi.id}`, {
    headers: {
      Authorization: flakyCredential,
    },
  });
  assert(flakyDuplicate.status === 409, `flaky duplicate after success expected 409, got ${flakyDuplicate.status}`);

  const concurrentApi = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Concurrent Paid Proxy API',
    upstream_base_url: server.baseUrl,
    path: '/upstream/concurrent-signal',
    method: 'GET',
    price_usdc: 0.02,
    active: true,
    ...encrypted,
  });
  const concurrentUnpaid = await fetch(`${server.baseUrl}/api/pay/${concurrentApi.id}`);
  const concurrentRequestId = concurrentUnpaid.headers.get('x-paygate-request-id');
  const concurrentPaymentId = concurrentUnpaid.headers.get('x-paygate-payment-id');
  const concurrentCredential = Credential.serialize({
    challenge: Challenge.fromResponse(concurrentUnpaid),
    payload: { type: 'hash', hash: CONCURRENT_PAYMENT_TX_HASH },
    source: `did:pkh:stellar:testnet:${PAYER_WALLET}`,
  });
  const concurrentResponses = await Promise.all([
    fetch(`${server.baseUrl}/api/pay/${concurrentApi.id}`, {
      headers: { Authorization: concurrentCredential },
    }),
    fetch(`${server.baseUrl}/api/pay/${concurrentApi.id}`, {
      headers: { Authorization: concurrentCredential },
    }),
  ]);
  const concurrentStatuses = concurrentResponses.map((response) => response.status).sort();
  assert(
    concurrentStatuses[0] === 200 && concurrentStatuses[1] === 409,
    `concurrent paid requests expected 200/409, got ${concurrentStatuses.join('/')}`,
  );
  assert(concurrentUpstreamCalls === 1, 'concurrent credential use must forward upstream exactly once');
  assert(concurrentDeliveryHeaders.length === 1, 'only the claimed delivery should reach upstream');
  assert(concurrentDeliveryHeaders[0].requestId === concurrentRequestId, 'upstream request id should be stable');
  assert(concurrentDeliveryHeaders[0].paymentId === concurrentPaymentId, 'upstream payment id should be stable');
  assert(
    concurrentDeliveryHeaders[0].idempotencyKey === `paygate:${concurrentRequestId}`,
    'upstream idempotency key should be stable across recovery',
  );
  assert(
    getMockEscrowCreditSubmissionCountForTest(concurrentPaymentId) === 1,
    'concurrent payment handling must submit one escrow credit transaction',
  );
  const concurrentRequest = getRawProxyRequestsForTest().find((row) => row.payment_id === concurrentPaymentId);
  assert(concurrentRequest.status === 'forwarded', 'claimed concurrent delivery should finalize as forwarded');

  const recoveryApi = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Crash Recovery Paid Proxy API',
    upstream_base_url: server.baseUrl,
    path: '/upstream/recovery-signal',
    method: 'GET',
    price_usdc: 0.02,
    active: true,
    ...encrypted,
  });
  const recoveryUnpaid = await fetch(`${server.baseUrl}/api/pay/${recoveryApi.id}`);
  const recoveryPaymentId = recoveryUnpaid.headers.get('x-paygate-payment-id');
  const recoveryCredential = Credential.serialize({
    challenge: Challenge.fromResponse(recoveryUnpaid),
    payload: { type: 'hash', hash: RECOVERY_PAYMENT_TX_HASH },
    source: `did:pkh:stellar:testnet:${PAYER_WALLET}`,
  });
  process.env.PAYGATE_MOCK_ESCROW_CREDIT_UNCERTAIN_ONCE = recoveryPaymentId;
  const uncertainCredit = await fetch(`${server.baseUrl}/api/pay/${recoveryApi.id}`, {
    headers: { Authorization: recoveryCredential },
  });
  delete process.env.PAYGATE_MOCK_ESCROW_CREDIT_UNCERTAIN_ONCE;
  assert(uncertainCredit.status === 502, `uncertain credit expected 502, got ${uncertainCredit.status}`);
  const uncertainPayment = getRawPaymentsForTest().find((row) => row.payment_id === recoveryPaymentId);
  assert(uncertainPayment.credit_status === 'uncertain', 'ambiguous confirmation should remain recoverable');
  assert(uncertainPayment.credit_tx_hash === `mock-credit-${recoveryPaymentId}`, 'uncertain credit hash should persist');
  assert(uncertainPayment.credit_transaction_xdr?.includes(recoveryPaymentId), 'uncertain signed XDR should persist');
  assert(recoveryUpstreamCalls === 0, 'upstream must not run before escrow credit is confirmed');

  const recoveredCredit = await fetch(`${server.baseUrl}/api/pay/${recoveryApi.id}`, {
    headers: { Authorization: recoveryCredential },
  });
  assert(recoveredCredit.status === 200, `recovered credit expected 200, got ${recoveredCredit.status}`);
  const recoveredPayment = getRawPaymentsForTest().find((row) => row.payment_id === recoveryPaymentId);
  assert(recoveredPayment.credit_status === 'credited', 'replayed signed credit should finalize');
  assert(
    recoveredPayment.credit_transaction_xdr === uncertainPayment.credit_transaction_xdr,
    'credit recovery must reuse the exact signed transaction XDR',
  );
  assert(
    getMockEscrowCreditSubmissionCountForTest(recoveryPaymentId) === 1,
    'credit recovery must not submit a second transaction',
  );
  assert(recoveryUpstreamCalls === 1, 'recovered credit should forward upstream once');

  const redirectApi = await store.createApi({
    owner_wallet: ownerWallet,
    name: 'Redirecting Paid Proxy API',
    upstream_base_url: server.baseUrl,
    path: '/upstream/redirect-signal',
    method: 'GET',
    price_usdc: 0.02,
    active: true,
    ...encrypted,
  });

  const redirectUnpaid = await fetch(`${server.baseUrl}/api/pay/${redirectApi.id}`);
  assert(redirectUnpaid.status === 402, `redirect unpaid API expected 402, got ${redirectUnpaid.status}`);
  const redirectPaymentId = redirectUnpaid.headers.get('x-paygate-payment-id');
  const redirectChallenge = Challenge.fromResponse(redirectUnpaid);
  const redirectCredential = Credential.serialize({
    challenge: redirectChallenge,
    payload: { type: 'hash', hash: REDIRECT_PAYMENT_TX_HASH },
    source: `did:pkh:stellar:testnet:${PAYER_WALLET}`,
  });

  const redirectPaid = await fetch(`${server.baseUrl}/api/pay/${redirectApi.id}`, {
    headers: {
      Authorization: redirectCredential,
    },
  });
  assert(redirectPaid.status === 502, `redirecting paid API expected 502, got ${redirectPaid.status}`);
  assert(redirectPaid.headers.get('x-paygate-retryable') === 'true', 'redirected upstream response should be retryable');
  assert(redirectPaid.headers.get('x-paygate-payment-id') === redirectPaymentId, 'redirected response payment id mismatch');
  const redirectBody = await redirectPaid.json();
  assert(redirectBody.error === 'Upstream redirected', 'redirected response should explain upstream redirect');
  assert(redirectBody.retryable === true, 'redirected response body should be retryable');

  const redirectRequest = getRawProxyRequestsForTest().find((row) => row.payment_id === redirectPaymentId);
  assert(redirectRequest.status === 'upstream_failed', `expected upstream_failed for redirect, got ${redirectRequest.status}`);
  assert(redirectRequest.upstream_status === 307, 'redirected request upstream status should be saved');

  const redirectPayment = getRawPaymentsForTest().find((row) => row.payment_id === redirectPaymentId);
  assert(redirectPayment, 'redirected upstream should still record payment');
  assert(redirectPayment.credit_tx_hash === `mock-credit-${redirectPaymentId}`, 'redirected upstream should still credit escrow once');
} finally {
  await server.close();
}

console.log('Phase 6 paid proxy success smoke test passed');
