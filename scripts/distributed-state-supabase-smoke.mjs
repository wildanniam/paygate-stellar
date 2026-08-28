import crypto from 'node:crypto';
import { Keypair } from '@stellar/stellar-sdk';
import { createClient } from '@supabase/supabase-js';
import { encryptApiSecret } from '../server/lib/apiSecret.js';
import { getRegistryStore } from '../server/lib/registryStore.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requireStagingTarget() {
  const expectedRef = process.env.PAYGATE_EXPECTED_SUPABASE_PROJECT_REF;
  assert(process.env.PAYGATE_SMOKE_TARGET === 'staging', 'Set PAYGATE_SMOKE_TARGET=staging explicitly.');
  assert(expectedRef, 'Set PAYGATE_EXPECTED_SUPABASE_PROJECT_REF to the isolated staging project ref.');
  const hostname = new URL(process.env.SUPABASE_URL).hostname;
  assert(
    hostname === `${expectedRef}.supabase.co`,
    `Refusing mutation smoke against unexpected Supabase host ${hostname}.`,
  );
}

requireStagingTarget();

const store = getRegistryStore();
assert(store?.mode === 'supabase', 'Distributed-state smoke requires the Supabase registry store.');

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const walletA = Keypair.random().publicKey();
const walletB = Keypair.random().publicKey();
const endpointSuffix = crypto.randomUUID();
const paymentId = `p${crypto.randomBytes(15).toString('hex')}`;
const withdrawalHash = crypto.randomBytes(32).toString('hex');
const lockName = `distributed_state_smoke_${crypto.randomUUID()}`;
const lockTokenA = crypto.randomUUID();
const lockTokenB = crypto.randomUUID();

try {
  await store.upsertDeveloper(walletA);
  await store.upsertDeveloper(walletB);
  const encrypted = encryptApiSecret(`smoke-${crypto.randomUUID()}`);
  const baseApi = {
    upstream_base_url: 'https://example.com',
    path: `/paygate-distributed-state-${endpointSuffix}`,
    method: 'GET',
    price_usdc: 0.01,
    status: 'pending_setup',
    active: false,
    setup_expires_at: new Date(Date.now() + 60_000).toISOString(),
    ...encrypted,
  };
  const pendingA = await store.createApi({ ...baseApi, owner_wallet: walletA, name: 'Smoke Claim A' });
  const pendingB = await store.createApi({ ...baseApi, owner_wallet: walletB, name: 'Smoke Claim B' });

  let sameOwnerDuplicate;
  try {
    await store.createApi({ ...baseApi, owner_wallet: walletA, name: 'Smoke Duplicate A' });
  } catch (error) {
    sameOwnerDuplicate = error;
  }
  assert(sameOwnerDuplicate?.code === '23505', 'same-wallet pending endpoint uniqueness is not enforced');

  assert(
    (await store.activatePendingApi(pendingA.id, walletA))?.status === 'active',
    'unexpired verified setup should activate conditionally',
  );
  let activationConflict;
  try {
    await store.activatePendingApi(pendingB.id, walletB);
  } catch (error) {
    activationConflict = error;
  }
  assert(activationConflict?.code === '23505', 'active endpoint ownership race is not enforced');

  const proxyRequest = await store.createProxyRequest({
    api_id: pendingA.id,
    owner_wallet: walletA,
    payment_id: paymentId,
    status: 'credited',
    price_usdc: 0.01,
  });
  const forwardingA = await store.claimProxyRequestForwarding(proxyRequest.id, lockTokenA);
  const forwardingB = await store.claimProxyRequestForwarding(proxyRequest.id, lockTokenB);
  assert(forwardingA?.forwarding_attempt_id === lockTokenA, 'first delivery claim should win');
  assert(forwardingB === null, 'second delivery claim should lose');
  assert(
    await store.transitionProxyRequest(proxyRequest.id, ['forwarding'], { status: 'forwarded' }, lockTokenB) === null,
    'wrong delivery claim token must not finalize a request',
  );
  assert(
    (await store.transitionProxyRequest(proxyRequest.id, ['forwarding'], { status: 'forwarded' }, lockTokenA))?.status === 'forwarded',
    'winning delivery claim should finalize',
  );

  await store.createPayment({
    request_id: proxyRequest.id,
    api_id: pendingA.id,
    payment_id: paymentId,
    tx_hash: crypto.randomBytes(32).toString('hex'),
    gross_amount_usdc: '0.0100000',
    developer_amount_usdc: '0.0090000',
    platform_fee_usdc: '0.0010000',
    recipient_mode: 'contract',
    verified_at: new Date().toISOString(),
  });
  const creditAttemptA = crypto.randomUUID();
  const creditAttemptB = crypto.randomUUID();
  assert(
    (await store.claimPaymentCredit(paymentId, creditAttemptA, new Date(0).toISOString()))?.credit_status === 'preparing',
    'first credit claim should win',
  );
  assert(
    await store.claimPaymentCredit(paymentId, creditAttemptB, new Date(0).toISOString()) === null,
    'second credit claim should lose',
  );
  assert(
    (await store.transitionPaymentCredit(paymentId, ['preparing'], {
      credit_status: 'prepared',
      credit_tx_hash: `smoke-credit-${paymentId}`,
      credit_transaction_xdr: `smoke-xdr-${paymentId}`,
    }, creditAttemptA))?.credit_status === 'prepared',
    'credit preparation transition should be conditional',
  );
  assert(
    (await store.transitionPaymentCredit(paymentId, ['prepared'], {
      credit_status: 'credited',
      credited_at: new Date().toISOString(),
    }, creditAttemptA))?.credit_status === 'credited',
    'credited transition should make the payment count as earned revenue',
  );

  const withdrawal = await store.createWithdrawal({
    wallet_address: walletA,
    amount_usdc: '0.0090000',
    tx_hash: withdrawalHash,
    status: 'pending',
  });
  assert(
    (await store.getWithdrawalByTxHash(withdrawalHash, walletA))?.id === withdrawal.id,
    'withdrawal should be recoverable by transaction hash',
  );
  let duplicateWithdrawal;
  try {
    await store.createWithdrawal({
      wallet_address: walletA,
      amount_usdc: '0.0090000',
      tx_hash: withdrawalHash,
      status: 'pending',
    });
  } catch (error) {
    duplicateWithdrawal = error;
  }
  assert(duplicateWithdrawal?.code === '23505', 'withdrawal transaction hash uniqueness is not enforced');

  assert(await store.claimOperatorSubmissionLock(lockName, lockTokenA, 10), 'operator lease should be claimable');
  assert(!(await store.claimOperatorSubmissionLock(lockName, lockTokenB, 10)), 'operator lease should exclude a contender');
  assert(await store.releaseOperatorSubmissionLock(lockName, lockTokenA), 'operator lease should release by owner token');

  const analytics = await store.getDashboardAnalytics(walletA, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  assert(Number(analytics?.all_time?.total_calls) === 1, 'dashboard aggregation should count the staging smoke request');
  assert(Number(analytics?.all_time?.developer_revenue_usdc) === 0.009, 'dashboard aggregation should sum revenue');

  console.log('Supabase distributed-state smoke test passed');
} finally {
  await store.releaseOperatorSubmissionLock(lockName, lockTokenA).catch(() => false);
  const { error } = await client.from('developers').delete().in('wallet_address', [walletA, walletB]);
  if (error) throw error;
}
