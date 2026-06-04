import crypto from 'node:crypto';

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const MAX_CHALLENGES = 1_000;

function getStore() {
  if (!globalThis.__PAYGATE_AUTH_CHALLENGES) {
    globalThis.__PAYGATE_AUTH_CHALLENGES = new Map();
  }
  return globalThis.__PAYGATE_AUTH_CHALLENGES;
}

function pruneExpired(now = Date.now()) {
  const store = getStore();
  for (const [id, challenge] of store.entries()) {
    if (challenge.expiresAtMs <= now || store.size > MAX_CHALLENGES) {
      store.delete(id);
    }
  }
}

export function createChallenge({ walletAddress, origin }) {
  pruneExpired();

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

  getStore().set(challengeId, challenge);
  return challenge;
}

export function getChallenge(challengeId) {
  pruneExpired();
  return getStore().get(challengeId) ?? null;
}

export function markChallengeUsed(challengeId) {
  const store = getStore();
  const challenge = store.get(challengeId);
  if (!challenge) return null;
  challenge.usedAt = new Date().toISOString();
  store.set(challengeId, challenge);
  return challenge;
}

export function expireChallengeForTest(challengeId) {
  const store = getStore();
  const challenge = store.get(challengeId);
  if (!challenge) return null;
  challenge.expiresAtMs = Date.now() - 1;
  challenge.expiresAt = new Date(challenge.expiresAtMs).toISOString();
  store.set(challengeId, challenge);
  return challenge;
}

export function clearChallengesForTest() {
  getStore().clear();
}
