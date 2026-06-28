import { z } from 'zod';
import { requireRegistryConfig, requireRegistrySession } from '../../server/lib/apiRegistry.js';
import { requireSameOrigin } from '../../server/lib/auth.js';
import { jsonBodyErrorResponse, readJsonBody } from '../../server/lib/body.js';
import { enforceRateLimit } from '../../server/lib/rateLimit.js';
import {
  prepareEscrowWithdrawal,
  readEscrowBalances,
  submitEscrowWithdrawal,
  validateEscrowWithdrawalTransaction,
} from '../../server/lib/escrowContract.js';
import { publicErrorMessage } from '../../server/lib/errors.js';

const submitSchema = z.object({
  preparationId: z.string().uuid(),
  signedTransactionXdr: z.string().min(20),
});

const WITHDRAWAL_PREPARATION_TTL_MS = 2 * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

function withdrawalPreparationExpiresAt() {
  return new Date(Date.now() + WITHDRAWAL_PREPARATION_TTL_MS).toISOString();
}

function isExpired(row) {
  return Date.parse(row.expires_at) <= Date.now();
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
  if (!requireSameOrigin(req, res)) return undefined;

  const session = requireRegistrySession(req, res);
  if (!session) return undefined;

  const prepareRateAllowed = await enforceRateLimit(req, res, {
    label: 'withdraw_prepare_wallet',
    keyParts: [session.walletAddress],
    limit: 5,
    windowSeconds: 60,
  });
  if (!prepareRateAllowed) return undefined;

  const store = requireRegistryConfig(res);
  if (!store) return undefined;

  try {
    const prepared = await prepareEscrowWithdrawal(session.walletAddress);
    const preparation = await store.createWithdrawalPreparation({
      wallet_address: session.walletAddress,
      tx_hash: prepared.txHash,
      amount_usdc: prepared.amountUsdc,
      amount_base_units: prepared.amountBaseUnits,
      status: 'prepared',
      expires_at: withdrawalPreparationExpiresAt(),
    });
    return res.status(200).json({
      walletAddress: session.walletAddress,
      preparationId: preparation.id,
      expiresAt: preparation.expires_at,
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
    return res.status(500).json({
      error: publicErrorMessage(err, 'PayGate could not prepare the withdrawal. Please try again in a moment.'),
    });
  }
}

export async function handleSubmit(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireSameOrigin(req, res)) return undefined;

  const session = requireRegistrySession(req, res);
  if (!session) return undefined;

  const submitRateAllowed = await enforceRateLimit(req, res, {
    label: 'withdraw_submit_wallet',
    keyParts: [session.walletAddress],
    limit: 5,
    windowSeconds: 60,
  });
  if (!submitRateAllowed) return undefined;

  const store = requireRegistryConfig(res);
  if (!store) return undefined;

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    const response = jsonBodyErrorResponse(error);
    return res.status(response.statusCode).json(response.payload);
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  let withdrawal = null;
  let claimedPreparation = null;
  try {
    const preparation = await store.getWithdrawalPreparation(parsed.data.preparationId, session.walletAddress);
    if (!preparation) {
      return res.status(400).json({ error: 'Withdrawal preparation not found' });
    }
    if (preparation.status !== 'prepared') {
      return res.status(409).json({ error: 'Withdrawal preparation was already used' });
    }
    if (isExpired(preparation)) {
      await store.updateWithdrawalPreparation(preparation.id, session.walletAddress, {
        status: 'expired',
        completed_at: nowIso(),
      });
      return res.status(400).json({ error: 'Withdrawal preparation expired. Please prepare a new withdrawal.' });
    }

    validateEscrowWithdrawalTransaction(parsed.data.signedTransactionXdr, session.walletAddress, {
      expectedTxHash: preparation.tx_hash,
    });

    const before = await readEscrowBalances(session.walletAddress);
    const amountUsdc = before.developerBalance.usdc;
    if (BigInt(before.developerBalance.baseUnits) <= 0n) {
      return res.status(400).json({ error: 'No withdrawable balance' });
    }

    claimedPreparation = await store.claimWithdrawalPreparation(preparation.id, session.walletAddress);
    if (!claimedPreparation) {
      return res.status(409).json({ error: 'Withdrawal preparation was already used or expired' });
    }

    withdrawal = await store.createWithdrawal({
      wallet_address: session.walletAddress,
      amount_usdc: amountUsdc,
      status: 'pending',
    });
    await store.updateWithdrawalPreparation(claimedPreparation.id, session.walletAddress, {
      withdrawal_id: withdrawal.id,
    });

    const submitted = await submitEscrowWithdrawal(parsed.data.signedTransactionXdr, session.walletAddress, {
      expectedTxHash: claimedPreparation.tx_hash,
    });
    const completed = await store.updateWithdrawal(withdrawal.id, {
      amount_usdc: submitted.amountUsdc || amountUsdc,
      tx_hash: submitted.txHash,
      status: 'succeeded',
      completed_at: nowIso(),
    });
    await store.updateWithdrawalPreparation(claimedPreparation.id, session.walletAddress, {
      status: 'succeeded',
      withdrawal_id: withdrawal.id,
      submitted_tx_hash: submitted.txHash,
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
    if (claimedPreparation) {
      await store.updateWithdrawalPreparation(claimedPreparation.id, session.walletAddress, {
        status: 'failed',
        withdrawal_id: withdrawal?.id ?? claimedPreparation.withdrawal_id,
        completed_at: nowIso(),
      });
    }

    if (err.message?.includes('not configured')) {
      return res.status(503).json({
        error: err.message,
        requiredEnv: ['ESCROW_CONTRACT_ID'],
      });
    }
    if (
      err.code === 'WITHDRAWAL_PREPARATION_MISMATCH'
      || err.message?.includes('source does not match')
    ) {
      return res.status(400).json({
        error: 'Signed withdrawal transaction does not match the prepared withdrawal.',
      });
    }
    return res.status(500).json({
      error: publicErrorMessage(err, 'PayGate could not submit the withdrawal. Please try again in a moment.'),
    });
  }
}

export default async function handler(req, res) {
  const action = getAction(req);

  if (action === 'prepare') return handlePrepare(req, res);
  if (action === 'submit') return handleSubmit(req, res);

  return res.status(404).json({ error: 'Withdrawal route not found' });
}
