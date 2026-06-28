import crypto from 'node:crypto';
import { Keypair, StrKey } from '@stellar/stellar-sdk';

export const SESSION_COOKIE = 'paygate_session';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const SIGN_MESSAGE_PREFIX = 'Stellar Signed Message:\n';

function firstHeaderValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function getConfiguredPublicOrigin() {
  const raw = process.env.PAYGATE_PUBLIC_ORIGIN || '';
  if (!raw.trim()) return '';

  try {
    const url = new URL(raw);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('invalid protocol');
    url.username = '';
    url.password = '';
    url.hash = '';
    url.search = '';
    url.pathname = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PAYGATE_PUBLIC_ORIGIN must be a valid http(s) origin');
    }
    return '';
  }
}

export function getOrigin(req) {
  const configuredOrigin = getConfiguredPublicOrigin();
  if (configuredOrigin) return configuredOrigin;

  const proto = firstHeaderValue(req.headers['x-forwarded-proto']) || 'http';
  const host = firstHeaderValue(req.headers['x-forwarded-host']) || firstHeaderValue(req.headers.host) || 'localhost';
  return `${proto}://${host}`;
}

export function isValidWalletAddress(walletAddress) {
  return typeof walletAddress === 'string' && StrKey.isValidEd25519PublicKey(walletAddress);
}

export function verifySignedMessage({ message, signatureBase64, walletAddress }) {
  if (!isValidWalletAddress(walletAddress)) return false;
  if (!signatureBase64 || typeof signatureBase64 !== 'string') return false;

  try {
    const keypair = Keypair.fromPublicKey(walletAddress);
    const messageHash = crypto.createHash('sha256').update(`${SIGN_MESSAGE_PREFIX}${message}`).digest();
    const signature = Buffer.from(signatureBase64, 'base64');
    return keypair.verify(messageHash, signature);
  } catch {
    return false;
  }
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || '';
}

export function hasSessionSecret() {
  return getSessionSecret().length >= 32;
}

function sign(value) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function createSessionToken(walletAddress) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    walletAddress,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !hasSessionSecret()) return null;

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature || !safeEqual(signature, sign(encoded))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!isValidWalletAddress(payload.walletAddress)) return null;
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        if (index === -1) return [part, ''];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

export function getSession(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[SESSION_COOKIE]);
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join('; ');
}

export function setSessionCookie(req, res, walletAddress) {
  const token = createSessionToken(walletAddress);
  const secure = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader(
    'Set-Cookie',
    serializeCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure,
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    }),
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(SESSION_COOKIE, '', {
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: 0,
    }),
  );
}

export function methodNotAllowed(res, method) {
  res.setHeader('Allow', method);
  return res.status(405).json({ error: 'Method not allowed' });
}
