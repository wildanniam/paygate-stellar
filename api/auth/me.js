import { getSession, methodNotAllowed } from '../_lib/auth.js';

export default function handler(req, res) {
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
