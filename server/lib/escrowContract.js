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
    };
  }
  return globalThis.__PAYGATE_ESCROW_WITHDRAW_MEMORY;
}

export function hasEscrowCreditConfig() {
  if (isMockEscrowCreditMode()) return process.env.PAYGATE_REGISTRY_STORE === 'memory';
  return Boolean(getEscrowContractId() && process.env.PAYGATE_OPERATOR_SECRET);
}

async function waitForSuccessfulTransaction(server, hash, label = 'Escrow transaction') {
  for (let attempt = 0; attempt < DEFAULT_POLL_ATTEMPTS; attempt += 1) {
    const tx = await server.getTransaction(hash);
    if (tx.status === 'SUCCESS') return tx;
    if (tx.status === 'FAILED') {
      throw new Error(`${label} failed: ${hash}`);
    }
    await delay(DEFAULT_POLL_DELAY_MS);
  }

  throw new Error(`${label} did not confirm in time: ${hash}`);
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

export async function creditEscrowPayment({ paymentId, developerWallet, grossAmountBaseUnits }) {
  if (isMockEscrowCreditMode()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Mock escrow credit mode is not allowed in production');
    }
    if (process.env.PAYGATE_REGISTRY_STORE !== 'memory') {
      throw new Error('Mock escrow credit mode is only allowed with the memory registry store');
    }
    return {
      mode: 'memory',
      txHash: `mock-credit-${paymentId}`,
    };
  }

  const contractId = getEscrowContractId();
  const operatorSecret = process.env.PAYGATE_OPERATOR_SECRET;
  if (!contractId || !operatorSecret) {
    throw new Error('Escrow credit is not configured');
  }

  const operator = Keypair.fromSecret(operatorSecret);
  const server = new rpc.Server(getRpcUrl());
  const sourceAccount = await server.getAccount(operator.publicKey());
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
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

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(operator);

  const submitted = await server.sendTransaction(prepared);
  if (submitted.status !== 'PENDING') {
    throw new Error(`Escrow credit submission failed with status ${submitted.status}`);
  }

  await waitForSuccessfulTransaction(server, submitted.hash, 'Escrow credit transaction');
  return {
    mode: 'contract',
    txHash: submitted.hash,
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
    .setTimeout(60)
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

export async function submitEscrowWithdrawal(signedTransactionXdr, expectedDeveloperWallet) {
  if (isMockEscrowWithdrawMode()) {
    requireSafeMockWithdrawMode();
    if (!signedTransactionXdr.includes(expectedDeveloperWallet)) {
      throw new Error('Signed withdrawal transaction source does not match the authenticated wallet');
    }
    const state = getMockWithdrawState();
    const amountBaseUnits = state.developerBalanceBaseUnits;
    state.developerBalanceBaseUnits = '0';
    return {
      mode: 'memory',
      txHash: `mock-withdraw-submit-${expectedDeveloperWallet.slice(0, 8).toLowerCase()}`,
      amountBaseUnits,
      amountUsdc: fromBaseUnits(amountBaseUnits, 7),
    };
  }

  const tx = TransactionBuilder.fromXDR(signedTransactionXdr, getNetworkPassphrase());
  if (tx.source !== expectedDeveloperWallet) {
    throw new Error('Signed withdrawal transaction source does not match the authenticated wallet');
  }

  const server = new rpc.Server(getRpcUrl());
  const txHash = tx.hash().toString('hex');
  const submitted = await server.sendTransaction(tx);
  if (submitted.status !== 'PENDING') {
    throw new Error(`Escrow withdrawal submission failed with status ${submitted.status}`);
  }

  const confirmed = await waitForSuccessfulTransaction(server, txHash, 'Escrow withdrawal transaction');
  const amountBaseUnits = confirmed.returnValue ? BigInt(scValToNative(confirmed.returnValue)).toString() : '0';

  return {
    mode: 'contract',
    txHash,
    amountBaseUnits,
    amountUsdc: fromBaseUnits(amountBaseUnits, 7),
  };
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
