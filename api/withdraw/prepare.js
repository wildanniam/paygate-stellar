import { requireRegistryConfig, requireRegistrySession } from '../_lib/apiRegistry.js';
import { prepareEscrowWithdrawal } from '../_lib/escrowContract.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = requireRegistrySession(req, res);
  if (!session) return undefined;

  const store = requireRegistryConfig(res);
  if (!store) return undefined;

  try {
    const prepared = await prepareEscrowWithdrawal(session.walletAddress);
    return res.status(200).json({
      walletAddress: session.walletAddress,
      ...prepared,
    });
  } catch (err) {
    if (err.code === 'NO_WITHDRAWABLE_BALANCE') {
      return res.status(400).json({ error: 'No withdrawable balance' });
    }
    if (err.message?.includes('not configured')) {
      return res.status(503).json({
        error: err.message,
        requiredEnv: ['ESCROW_CONTRACT_ID'],
      });
    }
    return res.status(500).json({ error: err.message || 'Withdrawal preparation failed' });
  }
}
