import { assertSafeUpstreamUrl } from '../server/lib/upstreamSecurity.js';

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

const originalNodeEnv = process.env.NODE_ENV;
const originalRegistryStore = process.env.PAYGATE_REGISTRY_STORE;
const originalAllowPrivate = process.env.PAYGATE_ALLOW_PRIVATE_UPSTREAMS;

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

console.log('Security upstream URL smoke test passed');
