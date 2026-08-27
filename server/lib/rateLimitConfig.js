import crypto from 'node:crypto';

export const RATE_LIMIT_URL_ENV_NAMES = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_KV_REST_API_URL',
  'KV_REST_API_URL',
];

export const RATE_LIMIT_CREDENTIAL_ENV_NAMES = [
  'UPSTASH_REDIS_REST_TOKEN',
  'UPSTASH_REDIS_REST_KV_REST_API_TOKEN',
  'KV_REST_API_TOKEN',
];

function firstConfigured(env, names) {
  for (const name of names) {
    const value = env[name];
    if (typeof value === 'string' && value.trim()) {
      return { name, value: value.trim() };
    }
  }
  return { name: null, value: '' };
}

export function getRateLimitRedisConfig(env = process.env) {
  const url = firstConfigured(env, RATE_LIMIT_URL_ENV_NAMES);
  const token = firstConfigured(env, RATE_LIMIT_CREDENTIAL_ENV_NAMES);
  return {
    url: url.value,
    token: token.value,
    urlEnvName: url.name,
    tokenEnvName: token.name,
  };
}

export function getRateLimitNamespace(env = process.env) {
  const scope = (
    env.PAYGATE_RATE_LIMIT_NAMESPACE
    || env.PAYGATE_PUBLIC_ORIGIN
    || env.VERCEL_PROJECT_ID
    || 'local'
  );
  const scopeHash = crypto.createHash('sha256').update(scope).digest('hex').slice(0, 16);
  return `paygate:ratelimit:v1:${scopeHash}`;
}
