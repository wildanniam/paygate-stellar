import crypto from 'node:crypto';
import { Keypair } from '@stellar/stellar-sdk';
import { clearChallengesForTest, expireChallengeForTest } from '../api/_lib/authStore.js';

process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'paygate-phase2-smoke-session-secret-32';

const [{ default: challengeHandler }, { default: verifyHandler }, { default: meHandler }, { default: logoutHandler }] =
  await Promise.all([
    import('../api/auth/challenge.js'),
    import('../api/auth/verify.js'),
    import('../api/auth/me.js'),
    import('../api/auth/logout.js'),
  ]);

const SIGN_MESSAGE_PREFIX = 'Stellar Signed Message:\n';

function signChallenge(keypair, message) {
  const messageHash = crypto.createHash('sha256').update(`${SIGN_MESSAGE_PREFIX}${message}`).digest();
  return Buffer.from(keypair.sign(messageHash)).toString('base64');
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

const logout = await call(logoutHandler, makeReq({ method: 'POST', cookie: setCookie.split(';')[0] }));
assert(logout.statusCode === 200, 'logout should return 200');
assert(logout.headers['set-cookie'].includes('Max-Age=0'), 'logout should clear cookie');

console.log('Phase 2 auth smoke test passed');
