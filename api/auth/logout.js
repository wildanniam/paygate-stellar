import { clearSessionCookie, methodNotAllowed } from '../_lib/auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
