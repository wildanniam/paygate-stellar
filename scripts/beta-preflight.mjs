import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { StrKey } from '@stellar/stellar-sdk';
import { getRateLimitRedisConfig } from '../server/lib/rateLimitConfig.js';

const EXPECTED_TESTNET_RPC = 'https://soroban-testnet.stellar.org';

const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SESSION_SECRET',
  'API_SECRET_ENCRYPTION_KEY',
  'MPP_SECRET_KEY',
  'CRON_SECRET',
  'ESCROW_CONTRACT_ID',
  'PAYGATE_OPERATOR_SECRET',
  'PAYGATE_DEMO_UPSTREAM_SECRET',
  'PAYGATE_PUBLIC_ORIGIN',
  'STELLAR_NETWORK',
  'STELLAR_RPC_URL',
];

const TABLE_CHECKS = [
  ['developers', 'id,wallet_address,created_at,last_login_at'],
  ['auth_challenges', 'id,wallet_address,nonce,message,expires_at,used_at,created_at'],
  ['apis', 'id,owner_wallet,name,upstream_base_url,path,method,price_usdc,status,active,setup_expires_at,created_at,updated_at'],
  ['proxy_requests', 'id,api_id,owner_wallet,payment_id,status,price_usdc,tx_hash,forwarding_started_at,forwarding_attempt_id,created_at'],
  ['payments', 'id,request_id,api_id,payment_id,tx_hash,credit_tx_hash,credit_status,credit_transaction_xdr,credit_attempt_id,credit_started_at,credit_submitted_at,credit_error,gross_amount_usdc,created_at'],
  ['withdrawals', 'id,wallet_address,amount_usdc,tx_hash,status,created_at,completed_at'],
  ['withdrawal_preparations', 'id,wallet_address,withdrawal_id,tx_hash,amount_usdc,status,expires_at,created_at'],
  ['mpp_store', 'key,value,created_at,updated_at'],
  ['operator_submission_locks', 'lock_name,lease_token,lease_expires_at,updated_at'],
];

const checks = [];

function addCheck(status, label, detail = '') {
  checks.push({ status, label, detail });
}

function pass(label, detail) {
  addCheck('pass', label, detail);
}

function warn(label, detail) {
  addCheck('warn', label, detail);
}

function fail(label, detail) {
  addCheck('fail', label, detail);
}

function isMissing(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function isUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function publicOriginError(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return 'PAYGATE_PUBLIC_ORIGIN must use https.';
    if (url.username || url.password) return 'PAYGATE_PUBLIC_ORIGIN must not include credentials.';
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === 'localhost'
      || hostname === '127.0.0.1'
      || hostname === '::1'
      || hostname === '[::1]'
      || hostname.endsWith('.localhost')
      || hostname.endsWith('.example')
    ) {
      return 'PAYGATE_PUBLIC_ORIGIN must be the real deployed hostname.';
    }
    if (url.pathname !== '/' || url.search || url.hash) {
      return 'PAYGATE_PUBLIC_ORIGIN must be an origin only, for example https://trypaygate.com.';
    }
    return '';
  } catch {
    return 'PAYGATE_PUBLIC_ORIGIN must be a valid URL.';
  }
}

async function checkUpstash() {
  const { url, token, error } = getRateLimitRedisConfig();
  if (error) return;
  if (!url || !token || !isHttpsUrl(url)) return;

  try {
    const response = await fetch(new URL('/ping', url), {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      fail('Upstash Redis is reachable', `PING returned HTTP ${response.status}.`);
      return;
    }
    pass('Upstash Redis is reachable and authenticated');
  } catch (error) {
    const cause = error.cause?.code || error.cause?.name || error.name;
    fail('Upstash Redis is reachable', cause || 'Network request failed.');
  }
}

function checkRequiredEnv() {
  for (const name of REQUIRED_ENV) {
    if (isMissing(process.env[name])) {
      fail(`${name} is set`, 'Required for deployed V1 beta.');
    } else {
      pass(`${name} is set`);
    }
  }

  const upstash = getRateLimitRedisConfig();
  if (upstash.error) {
    fail('Upstash Redis credentials resolve as one complete pair', upstash.error);
    return;
  }
  if (!upstash.url) {
    fail('Upstash Redis REST URL is set', 'Use UPSTASH_REDIS_REST_URL or the Vercel Marketplace KV_REST_API_URL alias.');
  } else {
    pass('Upstash Redis REST URL is set', `Resolved from ${upstash.urlEnvName}.`);
  }
  if (!upstash.token) {
    fail('Upstash Redis REST token is set', 'Use UPSTASH_REDIS_REST_TOKEN or the Vercel Marketplace KV_REST_API_TOKEN alias.');
  } else {
    pass('Upstash Redis REST token is set', `Resolved from ${upstash.tokenEnvName}.`);
  }
}

function checkEnvSemantics() {
  if (process.env.PAYGATE_AUTH_CHALLENGE_STORE === 'memory') {
    fail('PAYGATE_AUTH_CHALLENGE_STORE is not memory', 'Memory auth challenges are only for local smoke tests.');
  } else {
    pass('PAYGATE_AUTH_CHALLENGE_STORE is deployment-safe', 'Unset or Supabase-backed.');
  }

  if (process.env.PAYGATE_REGISTRY_STORE === 'memory') {
    fail('PAYGATE_REGISTRY_STORE is not memory', 'The deployed registry must use Supabase.');
  } else {
    pass('PAYGATE_REGISTRY_STORE is deployment-safe', 'Unset means Supabase when env is configured.');
  }

  if (process.env.PAYGATE_RATE_LIMIT_STORE === 'memory') {
    fail('PAYGATE_RATE_LIMIT_STORE is not memory', 'The deployed rate limiter must use Upstash Redis.');
  } else {
    pass('PAYGATE_RATE_LIMIT_STORE is deployment-safe', 'Unset means Upstash when its environment is configured.');
  }

  if (process.env.PAYGATE_MPP_VERIFY_MODE === 'mock') {
    fail('PAYGATE_MPP_VERIFY_MODE is not mock', 'Mock MPP verification is only for local smoke tests.');
  } else {
    pass('PAYGATE_MPP_VERIFY_MODE is deployment-safe', 'Unset means real MPP verification.');
  }

  for (const name of ['PAYGATE_ESCROW_CREDIT_MODE', 'PAYGATE_ESCROW_WITHDRAW_MODE']) {
    if (process.env[name] === 'memory') {
      fail(`${name} is not memory`, 'Mock escrow mode is local-test only.');
    }
  }

  if (process.env.SUPABASE_URL && !isHttpsUrl(process.env.SUPABASE_URL)) {
    fail('SUPABASE_URL is a valid HTTPS URL');
  } else if (process.env.SUPABASE_URL) {
    pass('SUPABASE_URL is a valid HTTPS URL');
  }

  if (!isMissing(process.env.PAYGATE_PUBLIC_ORIGIN)) {
    const originError = publicOriginError(process.env.PAYGATE_PUBLIC_ORIGIN);
    if (originError) {
      fail('PAYGATE_PUBLIC_ORIGIN is a valid production origin', originError);
    } else {
      pass('PAYGATE_PUBLIC_ORIGIN is a valid production origin');
    }
  }

  const upstash = getRateLimitRedisConfig();
  if (upstash.url && !isHttpsUrl(upstash.url)) {
    fail('Upstash Redis REST URL is a valid HTTPS URL');
  } else if (upstash.url) {
    pass('Upstash Redis REST URL is a valid HTTPS URL');
  }

  if (upstash.token && upstash.token.length < 16) {
    fail('Upstash Redis REST token length is plausible', 'Use the token generated by Upstash.');
  } else if (upstash.token) {
    pass('Upstash Redis REST token length is plausible');
  }

  if (!isMissing(process.env.SESSION_SECRET) && process.env.SESSION_SECRET.length < 32) {
    fail('SESSION_SECRET is at least 32 characters', 'Short session secrets are not acceptable for beta deploy.');
  } else if (!isMissing(process.env.SESSION_SECRET)) {
    pass('SESSION_SECRET length is acceptable');
  }

  if (!isMissing(process.env.API_SECRET_ENCRYPTION_KEY) && process.env.API_SECRET_ENCRYPTION_KEY.length < 32) {
    fail('API_SECRET_ENCRYPTION_KEY is at least 32 characters', 'Use a stable random secret or 32-byte key material.');
  } else if (!isMissing(process.env.API_SECRET_ENCRYPTION_KEY)) {
    pass('API_SECRET_ENCRYPTION_KEY length is acceptable');
  }

  if (!isMissing(process.env.MPP_SECRET_KEY) && process.env.MPP_SECRET_KEY.length < 32) {
    fail('MPP_SECRET_KEY is at least 32 characters', 'Use a stable random secret for MPP challenge signing.');
  } else if (!isMissing(process.env.MPP_SECRET_KEY)) {
    pass('MPP_SECRET_KEY length is acceptable');
  }

  if (!isMissing(process.env.PAYGATE_DEMO_UPSTREAM_SECRET) && process.env.PAYGATE_DEMO_UPSTREAM_SECRET.length < 16) {
    fail('PAYGATE_DEMO_UPSTREAM_SECRET is at least 16 characters', 'Use a stable random upstream guard secret.');
  } else if (!isMissing(process.env.PAYGATE_DEMO_UPSTREAM_SECRET)) {
    pass('PAYGATE_DEMO_UPSTREAM_SECRET length is acceptable');
  }

  if (!isMissing(process.env.CRON_SECRET) && process.env.CRON_SECRET.length < 16) {
    fail('CRON_SECRET is at least 16 characters', 'Use a stable random secret for the Vercel cron route.');
  } else if (!isMissing(process.env.CRON_SECRET)) {
    pass('CRON_SECRET length is acceptable');
  }

  if (process.env.STELLAR_NETWORK && process.env.STELLAR_NETWORK !== 'stellar:testnet') {
    fail('STELLAR_NETWORK is stellar:testnet', `Current value: ${process.env.STELLAR_NETWORK}`);
  } else if (process.env.STELLAR_NETWORK) {
    pass('STELLAR_NETWORK is stellar:testnet');
  }

  if (process.env.STELLAR_RPC_URL && process.env.STELLAR_RPC_URL !== EXPECTED_TESTNET_RPC) {
    warn('STELLAR_RPC_URL differs from the documented testnet RPC', process.env.STELLAR_RPC_URL);
  } else if (process.env.STELLAR_RPC_URL) {
    pass('STELLAR_RPC_URL matches documented testnet RPC');
  }

  if (process.env.PAYGATE_OPERATOR_SECRET && !StrKey.isValidEd25519SecretSeed(process.env.PAYGATE_OPERATOR_SECRET)) {
    fail('PAYGATE_OPERATOR_SECRET is a Stellar secret seed');
  } else if (process.env.PAYGATE_OPERATOR_SECRET) {
    pass('PAYGATE_OPERATOR_SECRET is a Stellar secret seed');
  }

  if (process.env.ESCROW_CONTRACT_ID && !StrKey.isValidContract(process.env.ESCROW_CONTRACT_ID)) {
    fail('ESCROW_CONTRACT_ID is a Stellar contract id');
  } else if (process.env.ESCROW_CONTRACT_ID) {
    pass('ESCROW_CONTRACT_ID is a Stellar contract id');
  }
}

async function checkVercelRewrites() {
  try {
    const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
    const rewrites = vercel.rewrites || [];
    const hasApisNew = rewrites.some((rewrite) => rewrite.source === '/apis/new' && rewrite.destination === '/index.html');
    const hasApiDetail = rewrites.some((rewrite) => rewrite.source === '/apis/:apiId' && rewrite.destination === '/index.html');
    if (hasApisNew && hasApiDetail) {
      pass('Vercel SPA rewrites include V1 API routes');
    } else {
      fail('Vercel SPA rewrites include V1 API routes', 'Expected /apis/new and /apis/:apiId to route to /index.html.');
    }
  } catch (err) {
    fail('vercel.json is readable JSON', err.message);
  }
}

function checkGeneratedArtifactsUntracked() {
  try {
    const output = execFileSync('git', ['ls-files', 'frontend/node_modules', 'frontend/dist'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    if (output) {
      fail('Generated frontend artifacts are untracked', output.split('\n').slice(0, 5).join('\n'));
    } else {
      pass('Generated frontend artifacts are untracked');
    }
  } catch (err) {
    warn('Generated frontend artifact git check skipped', err.message);
  }
}

async function checkSupabaseTables() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey || !isUrl(url)) {
    warn('Supabase table checks skipped', 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    return;
  }

  try {
    await fetch(new URL('/rest/v1/', url), {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      signal: AbortSignal.timeout(10_000),
    });
    pass('Supabase REST endpoint is reachable');
  } catch (error) {
    const cause = error.cause?.code || error.cause?.name || error.name;
    fail('Supabase REST endpoint is reachable', cause || 'Network request failed.');
    return;
  }

  const client = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  for (const [table, columns] of TABLE_CHECKS) {
    const { error } = await client.from(table).select(columns).limit(1);
    if (error) {
      fail(`Supabase table ${table} is queryable`, error.message);
    } else {
      pass(`Supabase table ${table} is queryable`);
    }
  }

  const { error: analyticsError } = await client.rpc('get_paygate_dashboard_analytics', {
    p_owner_wallet: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
    p_since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  });
  if (analyticsError) {
    fail('Supabase dashboard aggregation function is callable', analyticsError.message);
  } else {
    pass('Supabase dashboard aggregation function is callable');
  }

  const lockName = `beta_preflight_${crypto.randomUUID()}`;
  const leaseToken = crypto.randomUUID();
  const { data: claimed, error: claimError } = await client.rpc('claim_operator_submission_lock', {
    p_lock_name: lockName,
    p_lease_token: leaseToken,
    p_lease_seconds: 5,
  });
  const { data: released, error: releaseError } = claimError
    ? { data: false, error: claimError }
    : await client.rpc('release_operator_submission_lock', {
      p_lock_name: lockName,
      p_lease_token: leaseToken,
    });
  if (claimError || releaseError || claimed !== true || released !== true) {
    fail(
      'Supabase operator submission lease is atomic',
      claimError?.message || releaseError?.message || 'Lease claim/release returned an unexpected result.',
    );
  } else {
    pass('Supabase operator submission lease is atomic');
  }
}

checkRequiredEnv();
checkEnvSemantics();
await checkVercelRewrites();
checkGeneratedArtifactsUntracked();
await checkUpstash();
await checkSupabaseTables();

for (const check of checks) {
  const prefix = check.status === 'pass' ? '[pass]' : check.status === 'warn' ? '[warn]' : '[fail]';
  const suffix = check.detail ? ` - ${check.detail}` : '';
  console.log(`${prefix} ${check.label}${suffix}`);
}

const failures = checks.filter((check) => check.status === 'fail');
const warnings = checks.filter((check) => check.status === 'warn');
console.log(`\nBeta preflight complete: ${failures.length} failure(s), ${warnings.length} warning(s).`);

if (failures.length > 0) {
  process.exitCode = 1;
}
