import { z } from 'zod';
import { requireRegistryConfig, requireRegistrySession } from '../../server/lib/apiRegistry.js';
import { requireSameOrigin } from '../../server/lib/auth.js';
import { jsonBodyErrorResponse, readJsonBody } from '../../server/lib/body.js';
import { enforceRateLimit } from '../../server/lib/rateLimit.js';
import {
  prepareEscrowWithdrawal,
  readEscrowBalances,
  readEscrowWithdrawalTransaction,
  submitEscrowWithdrawal,
  validateEscrowWithdrawalTransaction,
} from '../../server/lib/escrowContract.js';
import { publicErrorMessage } from '../../server/lib/errors.js';
import { WITHDRAWAL_PREPARATION_TTL_MS } from '../../server/lib/withdrawalTiming.js';

const submitSchema = z.object({
  preparationId: z.string().uuid(),
  signedTransactionXdr: z.string().min(20),
});

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

async function retryStoreWrite(operation, attempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

function resolvedWithdrawalAmount(submitted, preparation, withdrawal) {
  if (Number(submitted?.amountUsdc || 0) > 0) return submitted.amountUsdc;
  return String(withdrawal?.amount_usdc ?? preparation.amount_usdc);
}

async function completeWithdrawal({ store, preparation, withdrawal, submitted, walletAddress }) {
  let currentWithdrawal = withdrawal;
  if (!currentWithdrawal && preparation.withdrawal_id) {
    currentWithdrawal = await store.getWithdrawal(preparation.withdrawal_id, walletAddress);
  }
  if (!currentWithdrawal) {
    currentWithdrawal = await retryStoreWrite(() => store.createWithdrawal({
      wallet_address: walletAddress,
      amount_usdc: preparation.amount_usdc,
      tx_hash: preparation.tx_hash,
      status: 'pending',
    }));
  }

  const txHash = submitted.txHash || preparation.tx_hash;
  const amountUsdc = resolvedWithdrawalAmount(submitted, preparation, currentWithdrawal);
  const completed = await retryStoreWrite(() => store.updateWithdrawal(currentWithdrawal.id, {
    amount_usdc: amountUsdc,
    tx_hash: txHash,
    status: 'succeeded',
    completed_at: nowIso(),
  }));
  await retryStoreWrite(() => store.updateWithdrawalPreparation(preparation.id, walletAddress, {
    status: 'succeeded',
    withdrawal_id: currentWithdrawal.id,
    submitted_tx_hash: txHash,
    completed_at: nowIso(),
  }));

  return {
    withdrawal: completed,
    txHash,
    amountUsdc,
    amountBaseUnits: submitted.amountBaseUnits || preparation.amount_base_units,
  };
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

  let preparation = null;
  let withdrawal = null;
  let claimedPreparation = null;
  try {
    preparation = await store.getWithdrawalPreparation(parsed.data.preparationId, session.walletAddress);
    if (!preparation) {
      return res.status(400).json({ error: 'Withdrawal preparation not found' });
    }

    validateEscrowWithdrawalTransaction(parsed.data.signedTransactionXdr, session.walletAddress, {
      expectedTxHash: preparation.tx_hash,
    });

    if (preparation.status === 'expired' || (preparation.status === 'prepared' && isExpired(preparation))) {
      await store.updateWithdrawalPreparation(preparation.id, session.walletAddress, {
        status: 'expired',
        completed_at: nowIso(),
      });
      return res.status(400).json({ error: 'Withdrawal preparation expired. Please prepare a new withdrawal.' });
    }

    if (preparation.withdrawal_id) {
      withdrawal = await store.getWithdrawal(preparation.withdrawal_id, session.walletAddress);
    }

    if (['submitted', 'succeeded', 'failed'].includes(preparation.status)) {
      claimedPreparation = preparation;
      const existing = await readEscrowWithdrawalTransaction(preparation.tx_hash);
      if (existing.status === 'succeeded') {
        const completed = await completeWithdrawal({
          store,
          preparation,
          withdrawal,
          submitted: existing,
          walletAddress: session.walletAddress,
        });
        return res.status(200).json({ ...completed, recovered: preparation.status !== 'succeeded' });
      }
      if (preparation.status === 'succeeded') {
        return res.status(409).json({
          error: 'Withdrawal is marked succeeded but could not be confirmed on Stellar. Please contact support.',
        });
      }
      if (existing.status === 'failed') {
        return res.status(409).json({
          error: 'The prepared withdrawal failed on Stellar. Please prepare a new withdrawal.',
        });
      }

      claimedPreparation = await store.updateWithdrawalPreparation(preparation.id, session.walletAddress, {
        status: 'submitted',
        completed_at: null,
      });
      if (withdrawal) {
        withdrawal = await store.updateWithdrawal(withdrawal.id, {
          tx_hash: preparation.tx_hash,
          status: 'pending',
          completed_at: null,
        });
      }
    } else if (preparation.status === 'prepared') {
      const before = await readEscrowBalances(session.walletAddress);
      if (BigInt(before.developerBalance.baseUnits) <= 0n) {
        return res.status(400).json({ error: 'No withdrawable balance' });
      }

      claimedPreparation = await store.claimWithdrawalPreparation(preparation.id, session.walletAddress);
      if (!claimedPreparation) {
        return res.status(409).json({ error: 'Withdrawal preparation was already used or expired' });
      }

      withdrawal = await store.createWithdrawal({
        wallet_address: session.walletAddress,
        amount_usdc: before.developerBalance.usdc,
        tx_hash: claimedPreparation.tx_hash,
        status: 'pending',
      });
      claimedPreparation = await store.updateWithdrawalPreparation(claimedPreparation.id, session.walletAddress, {
        withdrawal_id: withdrawal.id,
      });
    } else {
      return res.status(409).json({ error: 'Withdrawal preparation cannot be submitted in its current state' });
    }

    if (!withdrawal) {
      withdrawal = await store.createWithdrawal({
        wallet_address: session.walletAddress,
        amount_usdc: preparation.amount_usdc,
        tx_hash: preparation.tx_hash,
        status: 'pending',
      });
      claimedPreparation = await store.updateWithdrawalPreparation(preparation.id, session.walletAddress, {
        status: 'submitted',
        withdrawal_id: withdrawal.id,
        completed_at: null,
      });
    }

    const submitted = await submitEscrowWithdrawal(parsed.data.signedTransactionXdr, session.walletAddress, {
      expectedTxHash: preparation.tx_hash,
    });
    const completed = await completeWithdrawal({
      store,
      preparation: { ...preparation, withdrawal_id: withdrawal.id },
      withdrawal,
      submitted,
      walletAddress: session.walletAddress,
    });

    return res.status(200).json(completed);
  } catch (err) {
    if (claimedPreparation && preparation) {
      try {
        const existing = await readEscrowWithdrawalTransaction(preparation.tx_hash);
        if (existing.status === 'succeeded') {
          const completed = await completeWithdrawal({
            store,
            preparation: { ...preparation, withdrawal_id: withdrawal?.id ?? preparation.withdrawal_id },
            withdrawal,
            submitted: existing,
            walletAddress: session.walletAddress,
          });
          return res.status(200).json({ ...completed, recovered: true });
        }

        if (existing.status === 'failed') {
          if (withdrawal) {
            await retryStoreWrite(() => store.updateWithdrawal(withdrawal.id, {
              tx_hash: preparation.tx_hash,
              status: 'failed',
              completed_at: nowIso(),
            }));
          }
          await retryStoreWrite(() => store.updateWithdrawalPreparation(preparation.id, session.walletAddress, {
            status: 'failed',
            withdrawal_id: withdrawal?.id ?? preparation.withdrawal_id,
            completed_at: nowIso(),
          }));
        } else {
          if (withdrawal) {
            await retryStoreWrite(() => store.updateWithdrawal(withdrawal.id, {
              tx_hash: preparation.tx_hash,
              status: 'pending',
              completed_at: null,
            }));
          }
          await retryStoreWrite(() => store.updateWithdrawalPreparation(preparation.id, session.walletAddress, {
            status: 'submitted',
            withdrawal_id: withdrawal?.id ?? preparation.withdrawal_id,
            completed_at: null,
          }));
        }
      } catch (reconciliationError) {
        console.error('Withdrawal reconciliation error:', reconciliationError);
      }
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
    return res.status(claimedPreparation ? 503 : 500).json({
      error: publicErrorMessage(err, 'PayGate could not submit the withdrawal. Please try again in a moment.'),
      retryable: Boolean(claimedPreparation),
      preparationId: claimedPreparation?.id,
      txHash: claimedPreparation?.tx_hash,
    });
  }
}

export default async function handler(req, res) {
  const action = getAction(req);

  if (action === 'prepare') return handlePrepare(req, res);
  if (action === 'submit') return handleSubmit(req, res);

  return res.status(404).json({ error: 'Withdrawal route not found' });
}
