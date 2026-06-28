import dns from 'node:dns/promises';
import net from 'node:net';

const DEFAULT_UPSTREAM_TIMEOUT_MS = 10_000;
export const MAX_UPSTREAM_RESPONSE_BYTES = 1024 * 1024;
export const MAX_UPSTREAM_VERIFY_PREVIEW_BYTES = 4 * 1024;
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata',
]);

export class UnsafeUpstreamUrlError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsafeUpstreamUrlError';
    this.code = 'unsafe_upstream_url';
  }
}

export class UpstreamResponseTooLargeError extends Error {
  constructor(limitBytes = MAX_UPSTREAM_RESPONSE_BYTES) {
    super(`Upstream response exceeds ${limitBytes} bytes`);
    this.name = 'UpstreamResponseTooLargeError';
    this.code = 'upstream_response_too_large';
    this.statusCode = 502;
  }
}

export function isUpstreamResponseTooLarge(error) {
  return error instanceof UpstreamResponseTooLargeError || error?.code === 'upstream_response_too_large';
}

function allowPrivateUpstreams() {
  if (process.env.NODE_ENV === 'production') return false;
  return (
    process.env.PAYGATE_ALLOW_PRIVATE_UPSTREAMS === 'true'
    || process.env.PAYGATE_REGISTRY_STORE === 'memory'
  );
}

function hostnameWithoutBrackets(hostname) {
  return String(hostname || '').trim().replace(/^\[|\]$/g, '').toLowerCase().replace(/\.$/, '');
}

function parseIpv4(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;

  let value = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const octet = Number(part);
    if (octet < 0 || octet > 255) return null;
    value = (value << 8) + octet;
  }
  return value >>> 0;
}

function ipv4InCidr(ip, base, bits) {
  const value = parseIpv4(ip);
  const baseValue = parseIpv4(base);
  if (value === null || baseValue === null) return false;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (value & mask) === (baseValue & mask);
}

function isBlockedIpv4(ip) {
  return [
    ['0.0.0.0', 8],
    ['10.0.0.0', 8],
    ['100.64.0.0', 10],
    ['127.0.0.0', 8],
    ['169.254.0.0', 16],
    ['172.16.0.0', 12],
    ['192.0.0.0', 24],
    ['192.0.2.0', 24],
    ['192.168.0.0', 16],
    ['198.18.0.0', 15],
    ['198.51.100.0', 24],
    ['203.0.113.0', 24],
    ['224.0.0.0', 4],
    ['240.0.0.0', 4],
  ].some(([base, bits]) => ipv4InCidr(ip, base, bits));
}

function firstIpv6Hextet(ip) {
  const value = ip.split(':')[0];
  return value ? Number.parseInt(value, 16) : 0;
}

function isBlockedIpv6(ip) {
  const normalized = ip.toLowerCase();
  if (normalized === '::' || normalized === '::1') return true;
  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.slice('::ffff:'.length);
    if (net.isIP(mapped) === 4) return isBlockedIpv4(mapped);
  }

  const first = firstIpv6Hextet(normalized);
  return (
    (first >= 0xfc00 && first <= 0xfdff)
    || (first >= 0xfe80 && first <= 0xfebf)
    || normalized.startsWith('2001:db8:')
  );
}

function isBlockedIp(ip) {
  const version = net.isIP(ip);
  if (version === 4) return isBlockedIpv4(ip);
  if (version === 6) return isBlockedIpv6(ip);
  return false;
}

function isBlockedHostname(hostname) {
  const normalized = hostnameWithoutBrackets(hostname);
  return (
    BLOCKED_HOSTNAMES.has(normalized)
    || normalized.endsWith('.localhost')
    || normalized.endsWith('.local')
  );
}

export function validateUpstreamBaseUrlSyntax(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, message: 'Upstream base URL must be a valid URL' };
  }

  if (!['https:', 'http:'].includes(url.protocol)) {
    return { ok: false, message: 'Upstream base URL must use http or https' };
  }
  if (url.username || url.password) {
    return { ok: false, message: 'Upstream base URL must not include credentials' };
  }

  return { ok: true };
}

export async function assertSafeUpstreamUrl(value) {
  const url = value instanceof URL ? value : new URL(value);
  const syntax = validateUpstreamBaseUrlSyntax(url.toString());
  if (!syntax.ok) throw new UnsafeUpstreamUrlError(syntax.message);

  const allowPrivate = allowPrivateUpstreams();
  if (url.protocol !== 'https:' && !allowPrivate) {
    throw new UnsafeUpstreamUrlError('Production upstream APIs must use HTTPS');
  }

  const hostname = hostnameWithoutBrackets(url.hostname);
  if (!hostname) throw new UnsafeUpstreamUrlError('Upstream URL must include a host');

  if (isBlockedHostname(hostname) && !allowPrivate) {
    throw new UnsafeUpstreamUrlError('Private, local, and metadata upstream hosts are not allowed');
  }

  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname) && !allowPrivate) {
      throw new UnsafeUpstreamUrlError('Private, local, and reserved upstream IP addresses are not allowed');
    }
    return;
  }

  if (allowPrivate) return;

  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new UnsafeUpstreamUrlError('Upstream host could not be resolved safely');
  }

  if (addresses.length === 0) {
    throw new UnsafeUpstreamUrlError('Upstream host could not be resolved safely');
  }

  if (addresses.some((entry) => isBlockedIp(entry.address))) {
    throw new UnsafeUpstreamUrlError('Upstream host resolves to a private, local, or reserved IP address');
  }
}

export function upstreamFetchOptions(options = {}) {
  return {
    ...options,
    redirect: 'manual',
    signal: options.signal || AbortSignal.timeout(DEFAULT_UPSTREAM_TIMEOUT_MS),
  };
}

export async function readLimitedResponseText(
  response,
  { maxBytes = MAX_UPSTREAM_RESPONSE_BYTES, errorOnLimit = true } = {},
) {
  if (!response.body) {
    const body = Buffer.from(await response.arrayBuffer());
    if (body.byteLength > maxBytes) {
      if (errorOnLimit) throw new UpstreamResponseTooLargeError(maxBytes);
      return body.subarray(0, maxBytes).toString('utf8');
    }
    return body.toString('utf8');
  }

  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = Buffer.from(value);
    if (bytes + chunk.byteLength > maxBytes) {
      const remaining = maxBytes - bytes;
      if (remaining > 0) chunks.push(chunk.subarray(0, remaining));
      await reader.cancel();
      if (errorOnLimit) throw new UpstreamResponseTooLargeError(maxBytes);
      break;
    }

    bytes += chunk.byteLength;
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}
