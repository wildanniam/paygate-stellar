import { getChallenge, markChallengeUsed } from '../_lib/authStore.js';
import {
  hasSessionSecret,
  isValidWalletAddress,
  methodNotAllowed,
  setSessionCookie,
  verifySignedMessage,
} from '../_lib/auth.js';
import { readJsonBody } from '../_lib/body.js';

export default async function handler(req, res) {
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

  const challenge = getChallenge(challengeId);
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

  markChallengeUsed(challengeId);
  setSessionCookie(req, res, walletAddress);

  return res.status(200).json({ walletAddress });
}
