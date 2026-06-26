import { consumeChallenge, createChallenge, getChallenge } from '../../server/lib/authStore.js';
import {
  clearSessionCookie,
  getOrigin,
  getSession,
  hasSessionSecret,
  isValidWalletAddress,
  methodNotAllowed,
  setSessionCookie,
  verifySignedMessage,
} from '../../server/lib/auth.js';
import { readJsonBody } from '../../server/lib/body.js';

function getAction(req) {
  const queryAction = req.query?.action;
  if (Array.isArray(queryAction)) return queryAction[0];
  if (queryAction) return String(queryAction);

  const parts = (req.url || '').split('?')[0].split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

function authStoreErrorMessage(error) {
  const raw = error instanceof Error ? error.message : String(error || '');
  const looksLikeHtml = /<(!doctype|html|head|body|div|span|meta|script)\b/i.test(raw);
  const looksLikeGatewayError = /cloudflare|connection timed out|error code 52\d|supabase\.co/i.test(raw);

  if (looksLikeHtml || looksLikeGatewayError || raw.length > 320) {
    return 'PayGate could not reach the wallet challenge database. Please try again in a moment.';
  }

  return raw || 'PayGate auth challenge store is not configured';
}

export async function handleChallenge(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const walletAddress = String(body.walletAddress || '').trim();
  if (!isValidWalletAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid Stellar wallet address' });
  }

  let challenge;
  try {
    challenge = await createChallenge({
      walletAddress,
      origin: getOrigin(req),
    });
  } catch (error) {
    console.error('Auth challenge store error:', error);
    return res.status(503).json({
      error: authStoreErrorMessage(error),
      requiredEnv: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
      testMode: 'Set PAYGATE_AUTH_CHALLENGE_STORE=memory for local smoke tests only.',
    });
  }

  return res.status(200).json({
    challengeId: challenge.id,
    walletAddress: challenge.walletAddress,
    message: challenge.message,
    expiresAt: challenge.expiresAt,
  });
}

export async function handleVerify(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  if (!hasSessionSecret()) {
    return res.status(503).json({ error: 'PayGate auth is not configured', requiredEnv: ['SESSION_SECRET'] });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const challengeId = String(body.challengeId || '').trim();
  const walletAddress = String(body.walletAddress || '').trim();
  const signerAddress = String(body.signerAddress || '').trim();
  const signedMessage = typeof body.signedMessage === 'string' ? body.signedMessage : '';

  if (!challengeId || !isValidWalletAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid verification payload' });
  }

  let challenge;
  try {
    challenge = await getChallenge(challengeId);
  } catch (error) {
    console.error('Auth challenge read error:', error);
    return res.status(503).json({
      error: authStoreErrorMessage(error),
      requiredEnv: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
      testMode: 'Set PAYGATE_AUTH_CHALLENGE_STORE=memory for local smoke tests only.',
    });
  }

  if (!challenge) {
    return res.status(400).json({ error: 'Challenge expired or not found' });
  }
  if (challenge.usedAt) {
    return res.status(400).json({ error: 'Challenge already used' });
  }
  if (challenge.walletAddress !== walletAddress || (signerAddress && signerAddress !== walletAddress)) {
    return res.status(400).json({ error: 'Signer wallet does not match challenge wallet' });
  }

  const validSignature = verifySignedMessage({
    message: challenge.message,
    signatureBase64: signedMessage,
    walletAddress,
  });

  if (!validSignature) {
    return res.status(401).json({ error: 'Invalid wallet signature' });
  }

  let consumed;
  try {
    consumed = await consumeChallenge(challengeId);
  } catch (error) {
    console.error('Auth challenge consume error:', error);
    return res.status(503).json({
      error: authStoreErrorMessage(error),
      requiredEnv: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
      testMode: 'Set PAYGATE_AUTH_CHALLENGE_STORE=memory for local smoke tests only.',
    });
  }

  if (!consumed) {
    return res.status(400).json({ error: 'Challenge already used or expired' });
  }

  setSessionCookie(req, res, walletAddress);

  return res.status(200).json({ walletAddress });
}

export function handleMe(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, 'GET');

  const session = getSession(req);
  if (!session) {
    return res.status(200).json({ authenticated: false });
  }

  return res.status(200).json({
    authenticated: true,
    walletAddress: session.walletAddress,
    expiresAt: new Date(session.exp * 1000).toISOString(),
  });
}

export function handleLogout(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}

export default async function handler(req, res) {
  const action = getAction(req);

  if (action === 'challenge') return handleChallenge(req, res);
  if (action === 'verify') return handleVerify(req, res);
  if (action === 'me') return handleMe(req, res);
  if (action === 'logout') return handleLogout(req, res);

  return res.status(404).json({ error: 'Auth route not found' });
}
