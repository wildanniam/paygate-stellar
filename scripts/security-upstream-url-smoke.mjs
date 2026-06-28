import { assertSafeUpstreamUrl } from '../server/lib/upstreamSecurity.js';
import { getOrigin, requireSameOrigin } from '../server/lib/auth.js';
import { isRequestBodyTooLarge, readJsonBody } from '../server/lib/body.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function rejects(url) {
  try {
    await assertSafeUpstreamUrl(url);
    return false;
  } catch (error) {
    return error?.code === 'unsafe_upstream_url';
  }
}

async function accepts(url) {
  try {
    await assertSafeUpstreamUrl(url);
    return true;
  } catch {
    return false;
  }
}

function makeRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

const originalNodeEnv = process.env.NODE_ENV;
const originalRegistryStore = process.env.PAYGATE_REGISTRY_STORE;
const originalAllowPrivate = process.env.PAYGATE_ALLOW_PRIVATE_UPSTREAMS;
const originalPublicOrigin = process.env.PAYGATE_PUBLIC_ORIGIN;

delete process.env.PAYGATE_REGISTRY_STORE;
delete process.env.PAYGATE_ALLOW_PRIVATE_UPSTREAMS;
process.env.NODE_ENV = 'production';

assert(await rejects('http://93.184.216.34'), 'production upstreams must require HTTPS');
assert(await rejects('https://127.0.0.1'), 'loopback IPv4 upstreams must be blocked');
assert(await rejects('https://[::1]'), 'loopback IPv6 upstreams must be blocked');
assert(await rejects('https://169.254.169.254'), 'metadata IP upstreams must be blocked');
assert(await rejects('https://metadata.google.internal'), 'metadata hostnames must be blocked');
assert(await rejects('https://user:pass@example.com'), 'upstream URLs must not contain credentials');
assert(await accepts('https://93.184.216.34'), 'public HTTPS IP upstream should be allowed');

process.env.NODE_ENV = originalNodeEnv || '';
process.env.PAYGATE_REGISTRY_STORE = 'memory';
assert(await accepts('http://127.0.0.1:4000'), 'memory-mode smoke tests should allow local upstreams');

process.env.PAYGATE_PUBLIC_ORIGIN = 'https://trypaygate.com/';
const pinnedOrigin = getOrigin({
  headers: {
    host: 'localhost:3000',
    'x-forwarded-proto': 'https',
    'x-forwarded-host': 'evil.example',
  },
});
assert(pinnedOrigin === 'https://trypaygate.com', 'configured public origin should ignore forwarded host');

const blockedOriginRes = makeRes();
const blockedOrigin = requireSameOrigin(
  {
    method: 'POST',
    headers: {
      origin: 'https://evil.example',
      host: 'trypaygate.com',
    },
  },
  blockedOriginRes,
);
assert(blockedOrigin === false, 'cross-origin unsafe requests should be blocked');
assert(blockedOriginRes.statusCode === 403, 'cross-origin unsafe requests should return 403');

const allowedOriginRes = makeRes();
const allowedOrigin = requireSameOrigin(
  {
    method: 'POST',
    headers: {
      origin: 'https://trypaygate.com',
      host: 'trypaygate.com',
    },
  },
  allowedOriginRes,
);
assert(allowedOrigin === true, 'same-origin unsafe requests should be allowed');

try {
  await readJsonBody({ body: JSON.stringify({ value: 'x'.repeat(12) }) }, { maxBytes: 8 });
  throw new Error('oversized JSON body should be rejected');
} catch (error) {
  assert(isRequestBodyTooLarge(error), 'oversized JSON body should throw RequestBodyTooLargeError');
}

if (originalNodeEnv === undefined) {
  delete process.env.NODE_ENV;
} else {
  process.env.NODE_ENV = originalNodeEnv;
}
if (originalRegistryStore === undefined) {
  delete process.env.PAYGATE_REGISTRY_STORE;
} else {
  process.env.PAYGATE_REGISTRY_STORE = originalRegistryStore;
}
if (originalAllowPrivate === undefined) {
  delete process.env.PAYGATE_ALLOW_PRIVATE_UPSTREAMS;
} else {
  process.env.PAYGATE_ALLOW_PRIVATE_UPSTREAMS = originalAllowPrivate;
}
if (originalPublicOrigin === undefined) {
  delete process.env.PAYGATE_PUBLIC_ORIGIN;
} else {
  process.env.PAYGATE_PUBLIC_ORIGIN = originalPublicOrigin;
}

console.log('Security upstream URL smoke test passed');
