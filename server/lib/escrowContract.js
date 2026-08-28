import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
} from '@stellar/stellar-sdk';
import { SOROBAN_RPC_URLS, STELLAR_TESTNET, fromBaseUnits } from '@stellar/mpp';
import { WITHDRAWAL_TRANSACTION_TIMEOUT_SECONDS } from './withdrawalTiming.js';

const DEFAULT_POLL_ATTEMPTS = 20;
const DEFAULT_POLL_DELAY_MS = 1_000;
const SIMULATION_SOURCE = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getEscrowContractId() {
  return process.env.ESCROW_CONTRACT_ID || process.env.PAYGATE_ESCROW_CONTRACT_ID || '';
}

function getNetworkPassphrase() {
  const network = process.env.STELLAR_NETWORK || STELLAR_TESTNET;
  if (network !== STELLAR_TESTNET && network !== 'testnet') {
    throw new Error('PayGate V1 demo only supports Stellar testnet contract crediting');
  }
  return Networks.TESTNET;
}

function getRpcUrl() {
  return process.env.STELLAR_RPC_URL || SOROBAN_RPC_URLS[STELLAR_TESTNET];
}

export function isMockEscrowCreditMode() {
  return process.env.PAYGATE_ESCROW_CREDIT_MODE === 'memory';
}

export function isMockEscrowWithdrawMode() {
  return process.env.PAYGATE_ESCROW_WITHDRAW_MODE === 'memory';
}

function requireSafeMockWithdrawMode() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Mock escrow withdrawal mode is not allowed in production');
  }
  if (process.env.PAYGATE_REGISTRY_STORE !== 'memory') {
    throw new Error('Mock escrow withdrawal mode is only allowed with the memory registry store');
  }
}

function getMockWithdrawState() {
  if (!globalThis.__PAYGATE_ESCROW_WITHDRAW_MEMORY) {
    globalThis.__PAYGATE_ESCROW_WITHDRAW_MEMORY = {
      developerBalanceBaseUnits: process.env.PAYGATE_MOCK_DEVELOPER_BALANCE_BASE_UNITS || '0',
      platformFeeBalanceBaseUnits: process.env.PAYGATE_MOCK_PLATFORM_FEE_BALANCE_BASE_UNITS || '0',
      withdrawals: new Map(),
    };
  }
  globalThis.__PAYGATE_ESCROW_WITHDRAW_MEMORY.withdrawals ??= new Map();
  return globalThis.__PAYGATE_ESCROW_WITHDRAW_MEMORY;
}

export function hasEscrowCreditConfig() {
  if (isMockEscrowCreditMode()) return process.env.PAYGATE_REGISTRY_STORE === 'memory';
  return Boolean(getEscrowContractId() && process.env.PAYGATE_OPERATOR_SECRET);
}

async function waitForSuccessfulTransaction(server, hash, label = 'Escrow transaction') {
  let lastError = null;

  for (let attempt = 0; attempt < DEFAULT_POLL_ATTEMPTS; attempt += 1) {
    try {
      const tx = await server.getTransaction(hash);
      if (tx.status === 'SUCCESS') return tx;
      if (tx.status === 'FAILED') {
        const error = new Error(`${label} failed: ${hash}`);
        error.code = 'ESCROW_TRANSACTION_FAILED';
        error.txHash = hash;
        throw error;
      }
      lastError = null;
    } catch (error) {
      if (error?.code === 'ESCROW_TRANSACTION_FAILED') throw error;
      lastError = error;
    }
    await delay(DEFAULT_POLL_DELAY_MS);
  }

  const error = new Error(`${label} did not confirm in time: ${hash}`);
  error.code = 'ESCROW_CONFIRMATION_UNCERTAIN';
  error.txHash = hash;
  if (lastError) error.cause = lastError;
  throw error;
}

function escrowTransactionError(message, code, txHash, cause = null) {
  const error = new Error(message);
  error.code = code;
  error.txHash = txHash;
  if (cause) error.cause = cause;
  return error;
}

function getMockCreditState() {
  if (!globalThis.__PAYGATE_ESCROW_CREDIT_MEMORY) {
    globalThis.__PAYGATE_ESCROW_CREDIT_MEMORY = {
      credits: new Map(),
      submissions: new Map(),
      uncertainOnce: new Set(),
    };
  }
  return globalThis.__PAYGATE_ESCROW_CREDIT_MEMORY;
}

function shouldSimulateMockCreditUncertainty(paymentId, state) {
  const configured = process.env.PAYGATE_MOCK_ESCROW_CREDIT_UNCERTAIN_ONCE;
  if (!configured || state.uncertainOnce.has(paymentId)) return false;
  return configured === 'true' || configured === '1' || configured === paymentId;
}

export function getMockEscrowCreditSubmissionCountForTest(paymentId) {
  return getMockCreditState().submissions.get(paymentId) ?? 0;
}

async function simulateEscrowCall(method, args = []) {
  const contractId = getEscrowContractId();
  if (!contractId) {
    throw new Error('Escrow contract id is not configured');
  }

  const server = new rpc.Server(getRpcUrl());
  const source = new Account(SIMULATION_SOURCE, '0');
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  const simulated = await server.simulateTransaction(tx);
  if (simulated.error) {
    throw new Error(simulated.error);
  }
  if (!simulated.result?.retval) {
    throw new Error(`Escrow ${method} simulation returned no value`);
  }

  return scValToNative(simulated.result.retval);
}

function balanceResult(baseUnits) {
  const value = BigInt(baseUnits ?? 0);
  return {
    baseUnits: value.toString(),
    usdc: fromBaseUnits(value.toString(), 7),
  };
}

export async function readEscrowBalances(developerWallet) {
  if (isMockEscrowWithdrawMode()) {
    requireSafeMockWithdrawMode();
    const state = getMockWithdrawState();
    return {
      configured: true,
      developerBalance: balanceResult(state.developerBalanceBaseUnits),
      platformFeeBalance: balanceResult(state.platformFeeBalanceBaseUnits),
    };
  }

  if (!getEscrowContractId()) {
    return {
      configured: false,
      developerBalance: balanceResult(0),
      platformFeeBalance: balanceResult(0),
      error: 'ESCROW_CONTRACT_ID is not configured',
    };
  }

  const [developerBalance, platformFeeBalance] = await Promise.all([
    simulateEscrowCall('balance', [new Address(developerWallet).toScVal()]),
    simulateEscrowCall('platform_fee_balance'),
  ]);

  return {
    configured: true,
    developerBalance: balanceResult(developerBalance),
    platformFeeBalance: balanceResult(platformFeeBalance),
  };
}

export async function creditEscrowPayment({
  paymentId,
  developerWallet,
  grossAmountBaseUnits,
  transactionXdr = null,
  expectedTxHash = null,
  onPrepared = null,
  onSubmitted = null,
}) {
  if (isMockEscrowCreditMode()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Mock escrow credit mode is not allowed in production');
    }
    if (process.env.PAYGATE_REGISTRY_STORE !== 'memory') {
      throw new Error('Mock escrow credit mode is only allowed with the memory registry store');
    }
    const state = getMockCreditState();
    const txHash = `mock-credit-${paymentId}`;
    const signedTransactionXdr = transactionXdr || `mock-credit-xdr:${paymentId}:${developerWallet}:${grossAmountBaseUnits}`;
    if (expectedTxHash && expectedTxHash !== txHash) {
      throw escrowTransactionError(
        'Persisted mock escrow credit transaction hash does not match its payment',
        'ESCROW_TRANSACTION_MISMATCH',
        txHash,
      );
    }
    if (onPrepared) await onPrepared({ txHash, transactionXdr: signedTransactionXdr });

    const result = state.credits.get(paymentId) ?? {
      mode: 'memory',
      txHash,
      transactionXdr: signedTransactionXdr,
    };
    if (!state.credits.has(paymentId)) {
      state.credits.set(paymentId, result);
      state.submissions.set(paymentId, (state.submissions.get(paymentId) ?? 0) + 1);
    }

    try {
      if (onSubmitted) await onSubmitted({ txHash });
    } catch (cause) {
      throw escrowTransactionError(
        `Escrow credit submission state could not be persisted: ${txHash}`,
        'ESCROW_CONFIRMATION_UNCERTAIN',
        txHash,
        cause,
      );
    }

    if (shouldSimulateMockCreditUncertainty(paymentId, state)) {
      state.uncertainOnce.add(paymentId);
      throw escrowTransactionError(
        `Escrow credit confirmation became uncertain: ${txHash}`,
        'ESCROW_CONFIRMATION_UNCERTAIN',
        txHash,
      );
    }
    return result;
  }

  const contractId = getEscrowContractId();
  const operatorSecret = process.env.PAYGATE_OPERATOR_SECRET;
  if (!contractId || !operatorSecret) {
    throw new Error('Escrow credit is not configured');
  }

  const operator = Keypair.fromSecret(operatorSecret);
  const server = new rpc.Server(getRpcUrl());
  const networkPassphrase = getNetworkPassphrase();
  let prepared;

  if (transactionXdr) {
    prepared = TransactionBuilder.fromXDR(transactionXdr, networkPassphrase);
  } else {
    const sourceAccount = await server.getAccount(operator.publicKey());
    const contract = new Contract(contractId);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call(
          'credit_payment',
          nativeToScVal(paymentId, { type: 'symbol' }),
          new Address(developerWallet).toScVal(),
          nativeToScVal(BigInt(grossAmountBaseUnits), { type: 'i128' }),
        ),
      )
      .setTimeout(60)
      .build();

    prepared = await server.prepareTransaction(tx);
    prepared.sign(operator);
  }

  const txHash = prepared.hash().toString('hex');
  if (expectedTxHash && expectedTxHash !== txHash) {
    throw escrowTransactionError(
      'Persisted escrow credit transaction hash does not match its signed XDR',
      'ESCROW_TRANSACTION_MISMATCH',
      txHash,
    );
  }

  const signedTransactionXdr = prepared.toXDR();
  if (onPrepared) await onPrepared({ txHash, transactionXdr: signedTransactionXdr });

  let existing;
  try {
    existing = await server.getTransaction(txHash);
  } catch (cause) {
    throw escrowTransactionError(
      `Escrow credit transaction state is uncertain: ${txHash}`,
      'ESCROW_CONFIRMATION_UNCERTAIN',
      txHash,
      cause,
    );
  }

  if (existing.status === 'SUCCESS') {
    return { mode: 'contract', txHash, transactionXdr: signedTransactionXdr };
  }
  if (existing.status === 'FAILED') {
    throw escrowTransactionError(
      `Escrow credit transaction failed: ${txHash}`,
      'ESCROW_TRANSACTION_FAILED',
      txHash,
    );
  }

  if (existing.status === 'NOT_FOUND') {
    const submitted = await server.sendTransaction(prepared);
    if (!['PENDING', 'DUPLICATE'].includes(submitted.status)) {
      const code = submitted.status === 'ERROR'
        ? 'ESCROW_TRANSACTION_FAILED'
        : 'ESCROW_CONFIRMATION_UNCERTAIN';
      throw escrowTransactionError(
        `Escrow credit submission failed with status ${submitted.status}: ${txHash}`,
        code,
        txHash,
      );
    }
  }

  try {
    if (onSubmitted) await onSubmitted({ txHash });
  } catch (cause) {
    throw escrowTransactionError(
      `Escrow credit submission state could not be persisted: ${txHash}`,
      'ESCROW_CONFIRMATION_UNCERTAIN',
      txHash,
      cause,
    );
  }

  await waitForSuccessfulTransaction(server, txHash, 'Escrow credit transaction');
  return {
    mode: 'contract',
    txHash,
    transactionXdr: signedTransactionXdr,
  };
}

export async function prepareEscrowWithdrawal(developerWallet) {
  if (isMockEscrowWithdrawMode()) {
    requireSafeMockWithdrawMode();
    const balances = await readEscrowBalances(developerWallet);
    const amountBaseUnits = BigInt(balances.developerBalance.baseUnits);
    if (amountBaseUnits <= 0n) {
      const error = new Error('No withdrawable balance');
      error.code = 'NO_WITHDRAWABLE_BALANCE';
      throw error;
    }
    const txHash = `mock-withdraw-${developerWallet.slice(0, 8).toLowerCase()}`;
    return {
      contractId: 'mock-escrow-contract',
      networkPassphrase: getNetworkPassphrase(),
      transactionXdr: `mock-withdrawal-xdr:${developerWallet}:${txHash}`,
      txHash,
      amountBaseUnits: amountBaseUnits.toString(),
      amountUsdc: balances.developerBalance.usdc,
    };
  }

  const contractId = getEscrowContractId();
  if (!contractId) {
    throw new Error('Escrow contract id is not configured');
  }

  const balances = await readEscrowBalances(developerWallet);
  const amountBaseUnits = BigInt(balances.developerBalance.baseUnits);
  if (amountBaseUnits <= 0n) {
    const error = new Error('No withdrawable balance');
    error.code = 'NO_WITHDRAWABLE_BALANCE';
    throw error;
  }

  const server = new rpc.Server(getRpcUrl());
  const sourceAccount = await server.getAccount(developerWallet);
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call('withdraw', new Address(developerWallet).toScVal()))
    .setTimeout(WITHDRAWAL_TRANSACTION_TIMEOUT_SECONDS)
    .build();

  const prepared = await server.prepareTransaction(tx);

  return {
    contractId,
    networkPassphrase: getNetworkPassphrase(),
    transactionXdr: prepared.toXDR(),
    txHash: prepared.hash().toString('hex'),
    amountBaseUnits: amountBaseUnits.toString(),
    amountUsdc: balances.developerBalance.usdc,
  };
}

function createWithdrawalPreparationMismatchError() {
  const error = new Error('Signed withdrawal transaction does not match the prepared withdrawal');
  error.code = 'WITHDRAWAL_PREPARATION_MISMATCH';
  return error;
}

export function validateEscrowWithdrawalTransaction(signedTransactionXdr, expectedDeveloperWallet, options = {}) {
  const expectedTxHash = options.expectedTxHash || null;

  if (isMockEscrowWithdrawMode()) {
    requireSafeMockWithdrawMode();
    if (!signedTransactionXdr.includes(expectedDeveloperWallet)) {
      throw new Error('Signed withdrawal transaction source does not match the authenticated wallet');
    }
    if (expectedTxHash && !signedTransactionXdr.includes(expectedTxHash)) {
      throw createWithdrawalPreparationMismatchError();
    }
    return {
      mode: 'memory',
      source: expectedDeveloperWallet,
      txHash: expectedTxHash,
    };
  }

  const tx = TransactionBuilder.fromXDR(signedTransactionXdr, getNetworkPassphrase());
  if (tx.source !== expectedDeveloperWallet) {
    throw new Error('Signed withdrawal transaction source does not match the authenticated wallet');
  }

  const txHash = tx.hash().toString('hex');
  if (expectedTxHash && txHash !== expectedTxHash) {
    throw createWithdrawalPreparationMismatchError();
  }

  return {
    mode: 'contract',
    source: tx.source,
    txHash,
  };
}

function withdrawalResultFromTransaction(txHash, transaction) {
  const amountBaseUnits = transaction.returnValue
    ? BigInt(scValToNative(transaction.returnValue)).toString()
    : '0';

  return {
    mode: 'contract',
    status: 'succeeded',
    txHash,
    amountBaseUnits,
    amountUsdc: fromBaseUnits(amountBaseUnits, 7),
  };
}

export async function readEscrowWithdrawalTransaction(txHash) {
  if (isMockEscrowWithdrawMode()) {
    requireSafeMockWithdrawMode();
    const result = getMockWithdrawState().withdrawals.get(txHash);
    return result ?? {
      mode: 'memory',
      status: 'not_found',
      txHash,
    };
  }

  const server = new rpc.Server(getRpcUrl());
  const transaction = await server.getTransaction(txHash);
  if (transaction.status === 'SUCCESS') return withdrawalResultFromTransaction(txHash, transaction);
  if (transaction.status === 'FAILED') {
    return {
      mode: 'contract',
      status: 'failed',
      txHash,
    };
  }

  return {
    mode: 'contract',
    status: transaction.status === 'NOT_FOUND' ? 'not_found' : 'pending',
    txHash,
  };
}

export async function submitEscrowWithdrawal(signedTransactionXdr, expectedDeveloperWallet, options = {}) {
  const validation = validateEscrowWithdrawalTransaction(signedTransactionXdr, expectedDeveloperWallet, options);

  if (isMockEscrowWithdrawMode()) {
    const state = getMockWithdrawState();
    const existing = state.withdrawals.get(validation.txHash);
    if (existing) return existing;

    const amountBaseUnits = state.developerBalanceBaseUnits;
    state.developerBalanceBaseUnits = '0';
    const result = {
      mode: 'memory',
      status: 'succeeded',
      txHash: validation.txHash,
      amountBaseUnits,
      amountUsdc: fromBaseUnits(amountBaseUnits, 7),
    };
    state.withdrawals.set(validation.txHash, result);
    return result;
  }

  const tx = TransactionBuilder.fromXDR(signedTransactionXdr, getNetworkPassphrase());

  const server = new rpc.Server(getRpcUrl());
  const txHash = validation.txHash;

  let existing = null;
  try {
    existing = await readEscrowWithdrawalTransaction(txHash);
  } catch {
    // A duplicate submission is safe because the signed transaction hash is stable.
  }

  if (existing?.status === 'succeeded') return existing;
  if (existing?.status === 'failed') {
    throw new Error(`Escrow withdrawal transaction failed: ${txHash}`);
  }

  if (existing?.status !== 'pending') {
    const submitted = await server.sendTransaction(tx);
    if (!['PENDING', 'DUPLICATE'].includes(submitted.status)) {
      throw new Error(`Escrow withdrawal submission failed with status ${submitted.status}`);
    }
  }

  const confirmed = await waitForSuccessfulTransaction(server, txHash, 'Escrow withdrawal transaction');
  return withdrawalResultFromTransaction(txHash, confirmed);
}

export async function withdrawPlatformFees() {
  if (isMockEscrowWithdrawMode()) {
    requireSafeMockWithdrawMode();
    const state = getMockWithdrawState();
    const amountBaseUnits = state.platformFeeBalanceBaseUnits;
    if (BigInt(amountBaseUnits) <= 0n) {
      const error = new Error('No platform fee balance');
      error.code = 'NO_PLATFORM_FEE_BALANCE';
      throw error;
    }
    state.platformFeeBalanceBaseUnits = '0';
    return {
      mode: 'memory',
      txHash: 'mock-platform-fee-withdrawal',
      amountBaseUnits,
      amountUsdc: fromBaseUnits(amountBaseUnits, 7),
    };
  }

  const contractId = getEscrowContractId();
  const operatorSecret = process.env.PAYGATE_OPERATOR_SECRET;
  if (!contractId || !operatorSecret) {
    throw new Error('Escrow platform fee withdrawal is not configured');
  }

  const operator = Keypair.fromSecret(operatorSecret);
  const balances = await readEscrowBalances(operator.publicKey());
  const amountBaseUnits = BigInt(balances.platformFeeBalance.baseUnits);
  if (amountBaseUnits <= 0n) {
    const error = new Error('No platform fee balance');
    error.code = 'NO_PLATFORM_FEE_BALANCE';
    throw error;
  }

  const server = new rpc.Server(getRpcUrl());
  const sourceAccount = await server.getAccount(operator.publicKey());
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call('withdraw_platform_fee'))
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(operator);

  const submitted = await server.sendTransaction(prepared);
  if (submitted.status !== 'PENDING') {
    throw new Error(`Escrow platform fee withdrawal submission failed with status ${submitted.status}`);
  }

  const confirmed = await waitForSuccessfulTransaction(server, submitted.hash, 'Escrow platform fee withdrawal transaction');
  const withdrawnBaseUnits = confirmed.returnValue ? BigInt(scValToNative(confirmed.returnValue)).toString() : amountBaseUnits.toString();

  return {
    mode: 'contract',
    txHash: submitted.hash,
    amountBaseUnits: withdrawnBaseUnits,
    amountUsdc: fromBaseUnits(withdrawnBaseUnits, 7),
  };
}
