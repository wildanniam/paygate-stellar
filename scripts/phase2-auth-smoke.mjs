import crypto from 'node:crypto';
import { Keypair } from '@stellar/stellar-sdk';
import { SESSION_COOKIE } from '../server/lib/auth.js';
import { clearChallengesForTest, expireChallengeForTest } from '../server/lib/authStore.js';

process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'paygate-phase2-smoke-session-secret-32';
process.env.PAYGATE_AUTH_CHALLENGE_STORE = 'memory';
process.env.PAYGATE_RATE_LIMIT_STORE = 'memory';

const {
  handleChallenge: challengeHandler,
  handleVerify: verifyHandler,
  handleMe: meHandler,
  handleLogout: logoutHandler,
} = await import('../api/auth/[action].js');

const SIGN_MESSAGE_PREFIX = 'Stellar Signed Message:\n';

function signChallenge(keypair, message) {
  const messageHash = crypto.createHash('sha256').update(`${SIGN_MESSAGE_PREFIX}${message}`).digest();
  return Buffer.from(keypair.sign(messageHash)).toString('base64');
}

function createSignedSessionPayload(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function makeReq({ method = 'GET', body, cookie } = {}) {
  return {
    method,
    body,
    headers: {
      host: 'localhost:3000',
      'x-forwarded-proto': 'http',
      ...(cookie ? { cookie } : {}),
    },
  };
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
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

async function call(handler, req) {
  const res = makeRes();
  await handler(req, res);
  return res;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function createChallenge(walletAddress) {
  const res = await call(
    challengeHandler,
    makeReq({
      method: 'POST',
      body: { walletAddress },
    }),
  );
  assert(res.statusCode === 200, `challenge expected 200, got ${res.statusCode}`);
  assert(res.body.challengeId, 'challengeId missing');
  assert(res.body.message.includes(walletAddress), 'challenge message missing wallet');
  return res.body;
}

async function verifyChallenge({ keypair, challenge, walletAddress = keypair.publicKey() }) {
  return call(
    verifyHandler,
    makeReq({
      method: 'POST',
      body: {
        challengeId: challenge.challengeId,
        walletAddress,
        signerAddress: walletAddress,
        signedMessage: signChallenge(keypair, challenge.message),
      },
    }),
  );
}

clearChallengesForTest();

const developer = Keypair.random();
const other = Keypair.random();

const invalid = await call(
  challengeHandler,
  makeReq({
    method: 'POST',
    body: { walletAddress: 'not-a-wallet' },
  }),
);
assert(invalid.statusCode === 400, 'invalid wallet should return 400');

const wrongSignatureChallenge = await createChallenge(developer.publicKey());
const wrongSignature = await verifyChallenge({
  keypair: other,
  challenge: wrongSignatureChallenge,
  walletAddress: developer.publicKey(),
});
assert(wrongSignature.statusCode === 401, 'wrong signature should return 401');

const expiredChallenge = await createChallenge(developer.publicKey());
expireChallengeForTest(expiredChallenge.challengeId);
const expired = await verifyChallenge({ keypair: developer, challenge: expiredChallenge });
assert(expired.statusCode === 400, 'expired challenge should return 400');

const validChallenge = await createChallenge(developer.publicKey());
const verified = await verifyChallenge({ keypair: developer, challenge: validChallenge });
assert(verified.statusCode === 200, `valid verify expected 200, got ${verified.statusCode}`);
assert(verified.body.walletAddress === developer.publicKey(), 'verified wallet mismatch');

const setCookie = verified.headers['set-cookie'];
assert(typeof setCookie === 'string' && setCookie.includes('HttpOnly'), 'session cookie missing HttpOnly');

const reused = await verifyChallenge({ keypair: developer, challenge: validChallenge });
assert(reused.statusCode === 400, 'reused challenge should return 400');

const me = await call(meHandler, makeReq({ method: 'GET', cookie: setCookie.split(';')[0] }));
assert(me.statusCode === 200, 'me should return 200');
assert(me.body.authenticated === true, 'session should be authenticated');
assert(me.body.walletAddress === developer.publicKey(), 'session wallet mismatch');

const malformedCookie = await call(
  meHandler,
  makeReq({ method: 'GET', cookie: `${SESSION_COOKIE}=%E0%A4%A` }),
);
assert(malformedCookie.statusCode === 200, 'malformed session cookie should not crash auth');
assert(malformedCookie.body.authenticated === false, 'malformed session cookie should be unauthenticated');

const validCookie = setCookie.split(';')[0];
const malformedNeighborCookie = await call(
  meHandler,
  makeReq({ method: 'GET', cookie: `broken=%E0%A4%A; ${validCookie}` }),
);
assert(malformedNeighborCookie.body.authenticated === true, 'malformed unrelated cookie should not hide a valid session');

const validToken = validCookie.slice(validCookie.indexOf('=') + 1);
const extraSegment = await call(
  meHandler,
  makeReq({ method: 'GET', cookie: `${SESSION_COOKIE}=${validToken}.unexpected` }),
);
assert(extraSegment.body.authenticated === false, 'session token with extra segments should be rejected');

const now = Math.floor(Date.now() / 1000);
const futureToken = createSignedSessionPayload({
  walletAddress: developer.publicKey(),
  iat: now + 5 * 60,
  exp: now + 5 * 60 + 60,
});
const futureSession = await call(
  meHandler,
  makeReq({ method: 'GET', cookie: `${SESSION_COOKIE}=${futureToken}` }),
);
assert(futureSession.body.authenticated === false, 'future-issued session token should be rejected');

const overlongToken = createSignedSessionPayload({
  walletAddress: developer.publicKey(),
  iat: now,
  exp: now + 8 * 24 * 60 * 60,
});
const overlongSession = await call(
  meHandler,
  makeReq({ method: 'GET', cookie: `${SESSION_COOKIE}=${overlongToken}` }),
);
assert(overlongSession.body.authenticated === false, 'session token beyond configured TTL should be rejected');

const logout = await call(logoutHandler, makeReq({ method: 'POST', cookie: setCookie.split(';')[0] }));
assert(logout.statusCode === 200, 'logout should return 200');
assert(logout.headers['set-cookie'].includes('Max-Age=0'), 'logout should clear cookie');

console.log('Phase 2 auth smoke test passed');
