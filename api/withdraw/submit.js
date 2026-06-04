import { z } from 'zod';
import { requireRegistryConfig, requireRegistrySession } from '../_lib/apiRegistry.js';
import { readJsonBody } from '../_lib/body.js';
import { readEscrowBalances, submitEscrowWithdrawal } from '../_lib/escrowContract.js';

const submitSchema = z.object({
  signedTransactionXdr: z.string().min(20),
});

function nowIso() {
  return new Date().toISOString();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = requireRegistrySession(req, res);
  if (!session) return undefined;

  const store = requireRegistryConfig(res);
  if (!store) return undefined;

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  let withdrawal = null;
  try {
    const before = await readEscrowBalances(session.walletAddress);
    const amountUsdc = before.developerBalance.usdc;
    if (BigInt(before.developerBalance.baseUnits) <= 0n) {
      return res.status(400).json({ error: 'No withdrawable balance' });
    }

    withdrawal = await store.createWithdrawal({
      wallet_address: session.walletAddress,
      amount_usdc: amountUsdc,
      status: 'pending',
    });

    const submitted = await submitEscrowWithdrawal(parsed.data.signedTransactionXdr, session.walletAddress);
    const completed = await store.updateWithdrawal(withdrawal.id, {
      amount_usdc: submitted.amountUsdc || amountUsdc,
      tx_hash: submitted.txHash,
      status: 'succeeded',
      completed_at: nowIso(),
    });

    return res.status(200).json({
      withdrawal: completed,
      txHash: submitted.txHash,
      amountUsdc: submitted.amountUsdc,
      amountBaseUnits: submitted.amountBaseUnits,
    });
  } catch (err) {
    if (withdrawal) {
      await store.updateWithdrawal(withdrawal.id, {
        status: 'failed',
        completed_at: nowIso(),
      });
    }

    if (err.message?.includes('not configured')) {
      return res.status(503).json({
        error: err.message,
        requiredEnv: ['ESCROW_CONTRACT_ID'],
      });
    }
    return res.status(500).json({ error: err.message || 'Withdrawal submission failed' });
  }
}
