import crypto from 'node:crypto';
import { creditEscrowPayment } from './escrowContract.js';

const CREDIT_PREPARATION_STALE_MS = 2 * 60 * 1000;
const OPERATOR_LOCK_NAME = 'stellar_escrow_credit_operator';
const OPERATOR_LOCK_LEASE_SECONDS = 90;
const OPERATOR_LOCK_WAIT_MS = 5_000;
const OPERATOR_LOCK_POLL_MS = 100;
const RECOVERABLE_CREDIT_STATUSES = ['prepared', 'submitted', 'uncertain'];
const PROCESSING_CREDIT_STATUSES = ['preparing', 'prepared', 'submitted', 'uncertain'];

function nowIso() {
  return new Date().toISOString();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCredited(payment) {
  return payment?.credit_status === 'credited' && Boolean(payment.credit_tx_hash);
}

function publicError(error) {
  return error instanceof Error ? error.message : 'Escrow credit failed';
}

export class EscrowCreditInProgressError extends Error {
  constructor(message = 'Escrow credit is already being processed') {
    super(message);
    this.name = 'EscrowCreditInProgressError';
    this.code = 'ESCROW_CREDIT_IN_PROGRESS';
  }
}

async function acquireOperatorLock(store, leaseToken) {
  const deadline = Date.now() + OPERATOR_LOCK_WAIT_MS;
  do {
    if (await store.claimOperatorSubmissionLock(
      OPERATOR_LOCK_NAME,
      leaseToken,
      OPERATOR_LOCK_LEASE_SECONDS,
    )) return true;
    await delay(OPERATOR_LOCK_POLL_MS);
  } while (Date.now() < deadline);
  return false;
}

async function claimCreditAttempt(store, payment, attemptId) {
  const updates = {
    credit_status: 'preparing',
    credit_attempt_id: attemptId,
    credit_started_at: nowIso(),
    credit_error: null,
  };

  if (RECOVERABLE_CREDIT_STATUSES.includes(payment.credit_status)) {
    return store.transitionPaymentCredit(
      payment.payment_id,
      [payment.credit_status],
      updates,
    );
  }

  return store.claimPaymentCredit(
    payment.payment_id,
    attemptId,
    new Date(Date.now() - CREDIT_PREPARATION_STALE_MS).toISOString(),
  );
}

export async function ensureEscrowCredit({
  store,
  paymentId,
  developerWallet,
  grossAmountBaseUnits,
}) {
  let payment = await store.getPaymentByPaymentId(paymentId);
  if (!payment) throw new Error('Recorded payment could not be found for escrow credit');
  if (isCredited(payment)) {
    return { txHash: payment.credit_tx_hash, payment, recovered: true };
  }

  const leaseToken = crypto.randomUUID();
  const acquired = await acquireOperatorLock(store, leaseToken);
  if (!acquired) {
    payment = await store.getPaymentByPaymentId(paymentId);
    if (isCredited(payment)) {
      return { txHash: payment.credit_tx_hash, payment, recovered: true };
    }
    throw new EscrowCreditInProgressError('Escrow operator is busy; retry this paid request shortly');
  }

  let attemptId = null;
  try {
    payment = await store.getPaymentByPaymentId(paymentId);
    if (!payment) throw new Error('Recorded payment disappeared before escrow credit');
    if (isCredited(payment)) {
      return { txHash: payment.credit_tx_hash, payment, recovered: true };
    }

    const previousStatus = payment.credit_status;
    attemptId = crypto.randomUUID();
    const claimed = await claimCreditAttempt(store, payment, attemptId);
    if (!claimed) {
      const latest = await store.getPaymentByPaymentId(paymentId);
      if (isCredited(latest)) {
        return { txHash: latest.credit_tx_hash, payment: latest, recovered: true };
      }
      throw new EscrowCreditInProgressError();
    }

    const canReplay = (
      RECOVERABLE_CREDIT_STATUSES.includes(previousStatus)
      && payment.credit_transaction_xdr
      && payment.credit_tx_hash
    );
    const credit = await creditEscrowPayment({
      paymentId,
      developerWallet,
      grossAmountBaseUnits,
      transactionXdr: canReplay ? payment.credit_transaction_xdr : null,
      expectedTxHash: canReplay ? payment.credit_tx_hash : null,
      onPrepared: async ({ txHash, transactionXdr }) => {
        const prepared = await store.transitionPaymentCredit(
          paymentId,
          ['preparing'],
          {
            credit_status: 'prepared',
            credit_tx_hash: txHash,
            credit_transaction_xdr: transactionXdr,
            credit_submitted_at: null,
            credit_error: null,
          },
          attemptId,
        );
        if (!prepared) throw new EscrowCreditInProgressError('Escrow credit preparation lease was lost');
      },
      onSubmitted: async ({ txHash }) => {
        const submitted = await store.transitionPaymentCredit(
          paymentId,
          ['prepared'],
          {
            credit_status: 'submitted',
            credit_tx_hash: txHash,
            credit_submitted_at: nowIso(),
            credit_error: null,
          },
          attemptId,
        );
        if (!submitted) throw new EscrowCreditInProgressError('Escrow credit submission lease was lost');
      },
    });

    let credited = await store.transitionPaymentCredit(
      paymentId,
      PROCESSING_CREDIT_STATUSES,
      {
        credit_status: 'credited',
        credit_tx_hash: credit.txHash,
        credited_at: nowIso(),
        credit_error: null,
      },
      attemptId,
    );
    if (!credited) {
      credited = await store.getPaymentByPaymentId(paymentId);
      if (!isCredited(credited)) {
        throw new EscrowCreditInProgressError('Escrow credit completed but its database lease was lost');
      }
    }

    return { ...credit, payment: credited, recovered: canReplay };
  } catch (error) {
    if (attemptId) {
      const latest = await store.getPaymentByPaymentId(paymentId);
      if (latest?.credit_attempt_id === attemptId && !isCredited(latest)) {
        const transactionFailed = error?.code === 'ESCROW_TRANSACTION_FAILED';
        const nextStatus = latest.credit_transaction_xdr && !transactionFailed ? 'uncertain' : 'failed';
        await store.transitionPaymentCredit(
          paymentId,
          PROCESSING_CREDIT_STATUSES,
          {
            credit_status: nextStatus,
            credit_tx_hash: error?.txHash || latest.credit_tx_hash,
            credit_error: publicError(error),
          },
          attemptId,
        );
      }
    }
    throw error;
  } finally {
    try {
      await store.releaseOperatorSubmissionLock(OPERATOR_LOCK_NAME, leaseToken);
    } catch (error) {
      console.error('PayGate could not release the escrow operator lease', error);
    }
  }
}
