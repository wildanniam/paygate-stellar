import { createChallenge } from '../_lib/authStore.js';
import { getOrigin, isValidWalletAddress, methodNotAllowed } from '../_lib/auth.js';
import { readJsonBody } from '../_lib/body.js';

export default async function handler(req, res) {
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

  const challenge = createChallenge({
    walletAddress,
    origin: getOrigin(req),
  });

  return res.status(200).json({
    challengeId: challenge.id,
    walletAddress: challenge.walletAddress,
    message: challenge.message,
    expiresAt: challenge.expiresAt,
  });
}
