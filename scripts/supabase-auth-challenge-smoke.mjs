import { createClient } from '@supabase/supabase-js';
import { Keypair } from '@stellar/stellar-sdk';
import { consumeChallenge, createChallenge, getAuthChallengeStore, getChallenge } from '../api/_lib/authStore.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.log('Supabase auth challenge smoke skipped: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set.');
  process.exit(0);
}

if (process.env.PAYGATE_AUTH_CHALLENGE_STORE === 'memory') {
  throw new Error('Unset PAYGATE_AUTH_CHALLENGE_STORE=memory before running the Supabase auth challenge smoke.');
}

const client = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const createdIds = [];

async function cleanup() {
  if (createdIds.length === 0) return;
  await client.from('auth_challenges').delete().in('id', createdIds);
}

try {
  const store = getAuthChallengeStore();
  assert(store?.mode === 'supabase', 'auth challenge store should resolve to Supabase');

  const walletAddress = Keypair.random().publicKey();
  const first = await createChallenge({
    walletAddress,
    origin: 'https://paygate-supabase-auth-smoke.local',
  });
  createdIds.push(first.id);
  assert(first.id && first.message.includes(walletAddress), 'created challenge is malformed');

  const loaded = await getChallenge(first.id);
  assert(loaded?.id === first.id, 'created challenge should be readable');
  assert(!loaded.usedAt, 'new challenge should not be used');

  const consumed = await consumeChallenge(first.id);
  assert(consumed?.usedAt, 'first consume should mark the challenge used');

  const reused = await consumeChallenge(first.id);
  assert(reused === null, 'second consume should fail atomically');

  const expired = await createChallenge({
    walletAddress,
    origin: 'https://paygate-supabase-auth-smoke.local',
  });
  createdIds.push(expired.id);
  const { error: expireError } = await client
    .from('auth_challenges')
    .update({ expires_at: new Date(Date.now() - 1_000).toISOString(), used_at: null })
    .eq('id', expired.id);
  if (expireError) throw expireError;

  const expiredConsume = await consumeChallenge(expired.id);
  assert(expiredConsume === null, 'expired challenge should not be consumed');

  console.log('Supabase auth challenge smoke test passed');
} finally {
  await cleanup();
}
