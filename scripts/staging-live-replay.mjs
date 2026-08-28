import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';
import { stellar } from '@stellar/mpp/charge/client';
import { Mppx } from 'mppx/client';
import { Challenge, Receipt } from 'mppx';
import { createSessionToken, SESSION_COOKIE } from '../server/lib/auth.js';
import { encryptApiSecret } from '../server/lib/apiSecret.js';
import { getRegistryStore } from '../server/lib/registryStore.js';

const PRICE_USDC = '0.0010000';
const EXPECTED_DEVELOPER_AMOUNT_USDC = '0.0009000';
const EXPECTED_PLATFORM_FEE_USDC = '0.0001000';
const APPROVED_STAGING_PROJECT_REF = 'bdsahlijbhipzekhtyjq';
const APPROVED_STAGING_ORIGIN = 'https://project-02fi8.vercel.app';
const APPROVED_STAGING_ESCROW_CONTRACT_ID = 'CA5EI464RMAR55BQ6RYV3O6XX2LWGTI5CYGABDIXFKUKLCERQRGEQWPD';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function normalizeOrigin(value) {
  const url = new URL(value);
  assert(url.protocol === 'https:', 'PAYGATE_STAGING_ORIGIN must use HTTPS');
  assert(!url.username && !url.password, 'PAYGATE_STAGING_ORIGIN must not contain credentials');
  assert(url.pathname === '/' && !url.search && !url.hash, 'PAYGATE_STAGING_ORIGIN must be an origin only');
  return url.origin;
}

function assertStagingBoundary() {
  assert(process.env.PAYGATE_SMOKE_TARGET === 'staging', 'Refusing to mutate data without PAYGATE_SMOKE_TARGET=staging');
  assert(process.env.STELLAR_NETWORK === 'stellar:testnet', 'Live replay is testnet-only');
  assert(!process.env.PAYGATE_REGISTRY_STORE || process.env.PAYGATE_REGISTRY_STORE === 'supabase', 'Live replay requires Supabase registry storage');
  assert(!process.env.PAYGATE_MPP_VERIFY_MODE, 'Live replay refuses mock MPP verification');
  assert(!process.env.PAYGATE_ESCROW_CREDIT_MODE, 'Live replay refuses mock escrow crediting');
  assert(!process.env.PAYGATE_ESCROW_WITHDRAW_MODE, 'Live replay refuses mock escrow withdrawals');

  const expectedRef = requiredEnv('PAYGATE_EXPECTED_SUPABASE_PROJECT_REF');
  const actualRef = new URL(requiredEnv('SUPABASE_URL')).hostname.split('.')[0];
  assert(expectedRef === APPROVED_STAGING_PROJECT_REF, 'Expected Supabase ref is not the reviewed PayGate staging project');
  assert(actualRef === expectedRef, `Supabase project mismatch: expected ${expectedRef}, received ${actualRef}`);

  const origin = normalizeOrigin(requiredEnv('PAYGATE_STAGING_ORIGIN'));
  const expectedOrigin = normalizeOrigin(requiredEnv('PAYGATE_EXPECTED_STAGING_ORIGIN'));
  assert(expectedOrigin === APPROVED_STAGING_ORIGIN, 'Expected origin is not the reviewed PayGate staging deployment');
  assert(origin === expectedOrigin, `Staging origin mismatch: expected ${expectedOrigin}, received ${origin}`);
  return { origin, projectRef: actualRef };
}

async function responseJson(response, label) {
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${label} returned non-JSON HTTP ${response.status}`);
  }
  return body;
}

async function expectJson(response, status, label) {
  const body = await responseJson(response, label);
  assert(response.status === status, `${label} expected HTTP ${status}, received ${response.status}: ${body?.error || 'unknown error'}`);
  return body;
}

function makeSessionCookie(walletAddress) {
  const token = createSessionToken(walletAddress);
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}`;
}

async function deleteMatchingMppReplayRows(client, txHash) {
  if (!txHash) return;
  const { data, error } = await client
    .from('mpp_store')
    .select('key, value')
    .like('key', 'stellar:charge:challenge:%');
  if (error) throw error;

  const keys = (data || [])
    .filter((row) => String(row.value?.hash || '').toLowerCase() === txHash.toLowerCase())
    .map((row) => row.key);
  if (keys.length === 0) return;

  const deleted = await client.from('mpp_store').delete().in('key', keys);
  if (deleted.error) throw deleted.error;
}

async function deleteRows(client, table, filters) {
  let query = client.from(table).delete();
  for (const [column, value] of filters) query = query.eq(column, value);
  const { error } = await query;
  if (error) throw error;
}

const boundary = assertStagingBoundary();
const startedAt = new Date().toISOString();
const plainFetch = globalThis.fetch.bind(globalThis);
const operator = Keypair.fromSecret(requiredEnv('PAYGATE_OPERATOR_SECRET'));
const walletAddress = operator.publicKey();
const upstreamSecret = requiredEnv('PAYGATE_DEMO_UPSTREAM_SECRET');
const runId = crypto.randomUUID();
const path = `/api/upstream/market-signal?paygate_staging_replay=${runId}`;
const client = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { autoRefreshToken: false, persistSession: false },
});
const store = getRegistryStore();
assert(store?.mode === 'supabase', 'Supabase registry store is not configured');

let api = null;
let paymentTxHash = null;
let creditTxHash = null;
let withdrawalTxHash = null;
let developerExisted = null;
let replaySucceeded = false;

try {
  const existingDeveloper = await client
    .from('developers')
    .select('id')
    .eq('wallet_address', walletAddress)
    .maybeSingle();
  if (existingDeveloper.error) throw existingDeveloper.error;
  developerExisted = Boolean(existingDeveloper.data);

  const directUnauthorized = await plainFetch(`${boundary.origin}/api/upstream/market-signal`);
  assert(directUnauthorized.status === 401, `Guarded upstream expected HTTP 401, received ${directUnauthorized.status}`);

  const directAuthorized = await plainFetch(`${boundary.origin}${path}`, {
    headers: { 'X-PayGate-Secret': upstreamSecret },
  });
  const directBody = await expectJson(directAuthorized, 200, 'Guarded upstream with its secret');
  assert(directBody.source === 'PayGate demo upstream API', 'Guarded upstream returned unexpected data');

  await store.upsertDeveloper(walletAddress);
  api = await store.createApi({
    owner_wallet: walletAddress,
    name: `PayGate staging replay ${runId.slice(0, 8)}`,
    upstream_base_url: boundary.origin,
    path,
    method: 'GET',
    price_usdc: PRICE_USDC,
    status: 'active',
    active: true,
    verified_at: new Date().toISOString(),
    archived_at: null,
    setup_expires_at: null,
    ...encryptApiSecret(upstreamSecret),
  });

  const paidUrl = `${boundary.origin}/api/pay/${api.id}`;
  const unpaid = await plainFetch(paidUrl);
  assert(unpaid.status === 402, `Unpaid proxy expected HTTP 402, received ${unpaid.status}`);
  const unpaidChallenge = Challenge.fromResponse(unpaid);
  assert(
    unpaidChallenge.request.recipient === APPROVED_STAGING_ESCROW_CONTRACT_ID,
    'Staging challenge does not target the reviewed staging escrow contract',
  );
  assert(unpaid.headers.get('x-paygate-request-id'), 'Unpaid proxy did not return a request id');
  assert(unpaid.headers.get('x-paygate-payment-id'), 'Unpaid proxy did not return a payment id');

  const progressEvents = [];
  Mppx.create({
    methods: [
      stellar.charge({
        keypair: operator,
        mode: 'pull',
        rpcUrl: requiredEnv('STELLAR_RPC_URL'),
        onProgress(event) {
          progressEvents.push(event.type);
        },
      }),
    ],
  });

  const paid = await fetch(paidUrl, { headers: { Accept: 'application/json' } });
  const receipt = Receipt.fromResponse(paid);
  const paidBody = await expectJson(paid, 200, 'Paid proxy');
  assert(paidBody.source === 'PayGate demo upstream API', 'Paid proxy did not return guarded upstream data');
  assert(/^[0-9a-f]{64}$/i.test(receipt.reference), 'Paid response did not contain a Stellar transaction hash');
  paymentTxHash = receipt.reference;

  const paymentResult = await client
    .from('payments')
    .select('*')
    .eq('api_id', api.id)
    .eq('tx_hash', paymentTxHash)
    .single();
  if (paymentResult.error) throw paymentResult.error;
  const payment = paymentResult.data;
  assert(payment.credit_status === 'credited', `Payment credit status is ${payment.credit_status}, expected credited`);
  assert(/^[0-9a-f]{64}$/i.test(payment.credit_tx_hash), 'Payment credit transaction hash is missing');
  assert(Number(payment.gross_amount_usdc).toFixed(7) === PRICE_USDC, 'Gross payment amount is incorrect');
  assert(Number(payment.developer_amount_usdc).toFixed(7) === EXPECTED_DEVELOPER_AMOUNT_USDC, 'Developer amount is incorrect');
  assert(Number(payment.platform_fee_usdc).toFixed(7) === EXPECTED_PLATFORM_FEE_USDC, 'Platform fee is incorrect');
  creditTxHash = payment.credit_tx_hash;

  const proxyResult = await client
    .from('proxy_requests')
    .select('*')
    .eq('id', payment.request_id)
    .single();
  if (proxyResult.error) throw proxyResult.error;
  assert(proxyResult.data.status === 'forwarded', `Proxy request status is ${proxyResult.data.status}, expected forwarded`);
  assert(proxyResult.data.upstream_status === 200, 'Proxy request did not record upstream HTTP 200');

  const cookie = makeSessionCookie(walletAddress);
  const sessionHeaders = { Cookie: cookie };
  const dashboardBefore = await expectJson(
    await plainFetch(`${boundary.origin}/api/dashboard/summary`, { headers: sessionHeaders }),
    200,
    'Dashboard before withdrawal',
  );
  const dashboardPayment = dashboardBefore.payments.find((row) => row.txHash === paymentTxHash);
  assert(dashboardPayment?.creditStatus === 'credited', 'Dashboard did not expose the credited payment');
  assert(dashboardPayment.creditTxHash === creditTxHash, 'Dashboard credit transaction hash does not match storage');
  assert(Number(dashboardBefore.summary.grossRevenueUsdc).toFixed(7) === PRICE_USDC, 'Dashboard gross revenue is incorrect');
  assert(dashboardBefore.escrow.developerBalance.usdc === EXPECTED_DEVELOPER_AMOUNT_USDC, 'Dashboard escrow developer balance is incorrect');

  const mutationHeaders = {
    ...sessionHeaders,
    'Content-Type': 'application/json',
    Origin: boundary.origin,
  };
  const prepared = await expectJson(
    await plainFetch(`${boundary.origin}/api/withdraw/prepare`, {
      method: 'POST',
      headers: mutationHeaders,
      body: '{}',
    }),
    200,
    'Withdrawal preparation',
  );
  assert(prepared.walletAddress === walletAddress, 'Withdrawal preparation wallet does not match the session');
  assert(prepared.amountUsdc === EXPECTED_DEVELOPER_AMOUNT_USDC, 'Withdrawal preparation amount is incorrect');

  const withdrawalTransaction = TransactionBuilder.fromXDR(prepared.transactionXdr, prepared.networkPassphrase);
  withdrawalTransaction.sign(operator);
  const submitted = await expectJson(
    await plainFetch(`${boundary.origin}/api/withdraw/submit`, {
      method: 'POST',
      headers: mutationHeaders,
      body: JSON.stringify({
        preparationId: prepared.preparationId,
        signedTransactionXdr: withdrawalTransaction.toXDR(),
      }),
    }),
    200,
    'Withdrawal submission',
  );
  assert(/^[0-9a-f]{64}$/i.test(submitted.txHash), 'Withdrawal transaction hash is missing');
  assert(submitted.amountUsdc === EXPECTED_DEVELOPER_AMOUNT_USDC, 'Submitted withdrawal amount is incorrect');
  withdrawalTxHash = submitted.txHash;

  const dashboardAfter = await expectJson(
    await plainFetch(`${boundary.origin}/api/dashboard/summary`, { headers: sessionHeaders }),
    200,
    'Dashboard after withdrawal',
  );
  assert(dashboardAfter.escrow.developerBalance.usdc === '0.0000000', 'Developer escrow balance did not clear after withdrawal');
  assert(
    dashboardAfter.withdrawals.some((row) => row.txHash === withdrawalTxHash && row.status === 'succeeded'),
    'Dashboard did not expose the succeeded withdrawal',
  );

  replaySucceeded = true;
  console.log(JSON.stringify({
    status: 'passed',
    target: boundary.origin,
    supabaseProjectRef: boundary.projectRef,
    apiId: api.id,
    paymentTxHash,
    creditTxHash,
    withdrawalTxHash,
    progressEvents: [...new Set(progressEvents)],
    directUpstreamStatus: 401,
    unpaidProxyStatus: 402,
    paidProxyStatus: 200,
    developerAmountUsdc: EXPECTED_DEVELOPER_AMOUNT_USDC,
    platformFeeUsdc: EXPECTED_PLATFORM_FEE_USDC,
  }, null, 2));
} finally {
  const cleanupErrors = [];
  const cleanup = async (operation) => {
    try {
      await operation();
    } catch (error) {
      cleanupErrors.push(error);
    }
  };

  await cleanup(() => deleteMatchingMppReplayRows(client, paymentTxHash));
  if (api?.id) await cleanup(() => deleteRows(client, 'apis', [['id', api.id]]));
  await cleanup(async () => {
    const { error } = await client
      .from('withdrawal_preparations')
      .delete()
      .eq('wallet_address', walletAddress)
      .gte('created_at', startedAt);
    if (error) throw error;
  });
  await cleanup(async () => {
    const { error } = await client
      .from('withdrawals')
      .delete()
      .eq('wallet_address', walletAddress)
      .gte('created_at', startedAt);
    if (error) throw error;
  });
  if (developerExisted === false) {
    await cleanup(() => deleteRows(client, 'developers', [['wallet_address', walletAddress]]));
  }

  if (cleanupErrors.length > 0) {
    const details = cleanupErrors.map((error) => error?.message || String(error)).join('; ');
    throw new Error(`Staging replay cleanup failed: ${details}`);
  }
  if (replaySucceeded) console.log('Staging replay fixtures cleaned');
}
