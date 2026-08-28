import crypto from 'node:crypto';

export const RATE_LIMIT_CREDENTIAL_PAIRS = [
  {
    urlEnvName: 'UPSTASH_REDIS_REST_URL',
    tokenEnvName: 'UPSTASH_REDIS_REST_TOKEN',
  },
  {
    urlEnvName: 'UPSTASH_REDIS_REST_KV_REST_API_URL',
    tokenEnvName: 'UPSTASH_REDIS_REST_KV_REST_API_TOKEN',
  },
  {
    urlEnvName: 'KV_REST_API_URL',
    tokenEnvName: 'KV_REST_API_TOKEN',
  },
];

function configuredValue(env, name) {
  const value = env[name];
  return typeof value === 'string' ? value.trim() : '';
}

export function getRateLimitRedisConfig(env = process.env) {
  const candidates = RATE_LIMIT_CREDENTIAL_PAIRS.map((pair) => ({
    ...pair,
    url: configuredValue(env, pair.urlEnvName),
    token: configuredValue(env, pair.tokenEnvName),
  }));
  const partial = candidates.filter((candidate) => Boolean(candidate.url) !== Boolean(candidate.token));
  if (partial.length > 0) {
    const names = partial
      .map((candidate) => `${candidate.urlEnvName} + ${candidate.tokenEnvName}`)
      .join(', ');
    return {
      url: '',
      token: '',
      urlEnvName: null,
      tokenEnvName: null,
      error: `Incomplete Upstash credential pair: ${names}`,
    };
  }

  const complete = candidates.filter((candidate) => candidate.url && candidate.token);
  if (complete.length === 0) {
    return {
      url: '',
      token: '',
      urlEnvName: null,
      tokenEnvName: null,
      error: null,
    };
  }

  const selected = complete[0];
  const conflicting = complete.filter(
    (candidate) => candidate.url !== selected.url || candidate.token !== selected.token,
  );
  if (conflicting.length > 0) {
    return {
      url: '',
      token: '',
      urlEnvName: null,
      tokenEnvName: null,
      error: 'Multiple conflicting Upstash credential pairs are configured',
    };
  }

  return {
    url: selected.url,
    token: selected.token,
    urlEnvName: selected.urlEnvName,
    tokenEnvName: selected.tokenEnvName,
    error: null,
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
