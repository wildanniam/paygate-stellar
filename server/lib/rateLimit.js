import crypto from 'node:crypto';
import { Redis } from '@upstash/redis';

const NAMESPACE = 'paygate:ratelimit:v1';
let redisClient = null;

function getMemoryStore() {
  if (!globalThis.__PAYGATE_RATE_LIMIT_MEMORY) {
    globalThis.__PAYGATE_RATE_LIMIT_MEMORY = new Map();
  }
  return globalThis.__PAYGATE_RATE_LIMIT_MEMORY;
}

function shouldUseMemoryStore() {
  return process.env.PAYGATE_RATE_LIMIT_STORE === 'memory';
}

function getRedisClient() {
  if (redisClient) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redisClient = new Redis({ url, token });
  return redisClient;
}

function currentWindow(windowSeconds) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowId = Math.floor(nowSeconds / windowSeconds);
  return {
    windowId,
    resetAt: (windowId + 1) * windowSeconds,
  };
}

function hashKey(parts) {
  return crypto
    .createHash('sha256')
    .update(parts.map((part) => String(part ?? '')).join('|'))
    .digest('hex');
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0].trim();
  }
  return (
    req.headers['x-real-ip']
    || req.headers['cf-connecting-ip']
    || req.socket?.remoteAddress
    || 'unknown'
  );
}

export function rateLimitKey(label, parts) {
  return `${label}:${hashKey(parts)}`;
}

async function checkMemoryLimit({ key, limit, windowSeconds }) {
  const { resetAt } = currentWindow(windowSeconds);
  const storeKey = `${NAMESPACE}:${key}:${resetAt}`;
  const store = getMemoryStore();
  const current = store.get(storeKey);
  const next = {
    count: (current?.count || 0) + 1,
    expiresAt: resetAt,
  };
  store.set(storeKey, next);

  for (const [entryKey, entry] of store.entries()) {
    if (entry.expiresAt <= Math.floor(Date.now() / 1000)) store.delete(entryKey);
  }

  return {
    allowed: next.count <= limit,
    count: next.count,
    limit,
    remaining: Math.max(0, limit - next.count),
    resetAt,
  };
}

async function checkRedisLimit({ key, limit, windowSeconds }) {
  const redis = getRedisClient();
  if (!redis) return null;

  const { windowId, resetAt } = currentWindow(windowSeconds);
  const redisKey = `${NAMESPACE}:${key}:${windowId}`;
  const count = await redis.incr(redisKey);
  if (count === 1) await redis.expire(redisKey, windowSeconds + 5);

  return {
    allowed: count <= limit,
    count,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

async function checkRateLimit(input) {
  if (shouldUseMemoryStore()) return checkMemoryLimit(input);
  return checkRedisLimit(input);
}

export async function enforceRateLimit(req, res, {
  label,
  keyParts,
  limit,
  windowSeconds,
  failOpen = false,
}) {
  const key = rateLimitKey(label, keyParts);

  let result;
  try {
    result = await checkRateLimit({ key, limit, windowSeconds });
  } catch (error) {
    if (failOpen) {
      console.warn('PayGate rate limiter unavailable:', error);
      return true;
    }
    res.status(503).json({ error: 'Rate limiter unavailable' });
    return false;
  }

  if (!result) return true;

  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetAt);

  if (result.allowed) return true;

  const retryAfter = Math.max(1, result.resetAt - Math.floor(Date.now() / 1000));
  res.setHeader('Retry-After', retryAfter);
  res.status(429).json({ error: 'Too many requests, please try again later.' });
  return false;
}

export function clearRateLimitsForTest() {
  getMemoryStore().clear();
}
