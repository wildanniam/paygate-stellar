import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const MAX_CHALLENGES = 1_000;

function getMemoryStore() {
  if (!globalThis.__PAYGATE_AUTH_CHALLENGES) {
    globalThis.__PAYGATE_AUTH_CHALLENGES = new Map();
  }
  return globalThis.__PAYGATE_AUTH_CHALLENGES;
}

function pruneExpired(now = Date.now()) {
  const store = getMemoryStore();
  for (const [id, challenge] of store.entries()) {
    if (challenge.expiresAtMs <= now || store.size > MAX_CHALLENGES) {
      store.delete(id);
    }
  }
}

function buildChallenge({ walletAddress, origin }) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CHALLENGE_TTL_MS);
  const nonce = crypto.randomBytes(18).toString('base64url');
  const challengeId = crypto.randomUUID();
  const message = [
    'PayGate Wallet Login',
    '',
    `Domain: ${origin}`,
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    `Issued At: ${now.toISOString()}`,
    `Expires At: ${expiresAt.toISOString()}`,
    'Purpose: Connect developer wallet to PayGate V1',
  ].join('\n');

  const challenge = {
    id: challengeId,
    walletAddress,
    origin,
    nonce,
    message,
    expiresAt: expiresAt.toISOString(),
    expiresAtMs: expiresAt.getTime(),
    usedAt: null,
  };
  return challenge;
}

function toChallenge(row) {
  if (!row) return null;
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    nonce: row.nonce,
    message: row.message,
    expiresAt: row.expires_at,
    expiresAtMs: new Date(row.expires_at).getTime(),
    usedAt: row.used_at,
  };
}

function shouldUseMemoryStore() {
  return process.env.PAYGATE_AUTH_CHALLENGE_STORE === 'memory';
}

function createMemoryChallengeStore() {
  return {
    mode: 'memory',
    async createChallenge(input) {
      pruneExpired();
      const challenge = buildChallenge(input);
      getMemoryStore().set(challenge.id, challenge);
      return challenge;
    },
    async getChallenge(challengeId) {
      pruneExpired();
      return getMemoryStore().get(challengeId) ?? null;
    },
    async consumeChallenge(challengeId) {
      pruneExpired();
      const store = getMemoryStore();
      const challenge = store.get(challengeId);
      if (!challenge || challenge.usedAt || challenge.expiresAtMs <= Date.now()) return null;
      const used = {
        ...challenge,
        usedAt: new Date().toISOString(),
      };
      store.set(challengeId, used);
      return used;
    },
  };
}

function createSupabaseChallengeStore() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  const client = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    mode: 'supabase',
    async createChallenge(input) {
      const challenge = buildChallenge(input);
      const { data, error } = await client
        .from('auth_challenges')
        .insert({
          id: challenge.id,
          wallet_address: challenge.walletAddress,
          nonce: challenge.nonce,
          message: challenge.message,
          expires_at: challenge.expiresAt,
        })
        .select('id, wallet_address, nonce, message, expires_at, used_at')
        .single();
      if (error) throw error;
      return toChallenge(data);
    },
    async getChallenge(challengeId) {
      const { data, error } = await client
        .from('auth_challenges')
        .select('id, wallet_address, nonce, message, expires_at, used_at')
        .eq('id', challengeId)
        .maybeSingle();
      if (error) throw error;
      return toChallenge(data);
    },
    async consumeChallenge(challengeId) {
      const { data, error } = await client
        .from('auth_challenges')
        .update({ used_at: new Date().toISOString() })
        .eq('id', challengeId)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .select('id, wallet_address, nonce, message, expires_at, used_at')
        .maybeSingle();
      if (error) throw error;
      return toChallenge(data);
    },
  };
}

export function getAuthChallengeStore() {
  if (shouldUseMemoryStore()) return createMemoryChallengeStore();
  return createSupabaseChallengeStore();
}

export async function createChallenge(input) {
  const store = getAuthChallengeStore();
  if (!store) {
    throw new Error('PayGate auth challenge store is not configured');
  }
  return store.createChallenge(input);
}

export async function getChallenge(challengeId) {
  const store = getAuthChallengeStore();
  if (!store) return null;
  return store.getChallenge(challengeId);
}

export async function consumeChallenge(challengeId) {
  const store = getAuthChallengeStore();
  if (!store) return null;
  return store.consumeChallenge(challengeId);
}

export async function markChallengeUsed(challengeId) {
  return consumeChallenge(challengeId);
}

export function expireChallengeForTest(challengeId) {
  const store = getMemoryStore();
  const challenge = store.get(challengeId);
  if (!challenge) return null;
  challenge.expiresAtMs = Date.now() - 1;
  challenge.expiresAt = new Date(challenge.expiresAtMs).toISOString();
  store.set(challengeId, challenge);
  return challenge;
}

export function clearChallengesForTest() {
  getMemoryStore().clear();
}
