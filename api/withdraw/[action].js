import { z } from 'zod';
import { requireRegistryConfig, requireRegistrySession } from '../../server/lib/apiRegistry.js';
import { readJsonBody } from '../../server/lib/body.js';
import {
  prepareEscrowWithdrawal,
  readEscrowBalances,
  submitEscrowWithdrawal,
} from '../../server/lib/escrowContract.js';

const submitSchema = z.object({
  signedTransactionXdr: z.string().min(20),
});

function nowIso() {
  return new Date().toISOString();
}

function getAction(req) {
  const queryAction = req.query?.action;
  if (Array.isArray(queryAction)) return queryAction[0];
  if (queryAction) return String(queryAction);

  const parts = (req.url || '').split('?')[0].split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

export async function handlePrepare(req, res) {
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

export async function handleSubmit(req, res) {
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

export default async function handler(req, res) {
  const action = getAction(req);

  if (action === 'prepare') return handlePrepare(req, res);
  if (action === 'submit') return handleSubmit(req, res);

  return res.status(404).json({ error: 'Withdrawal route not found' });
}
