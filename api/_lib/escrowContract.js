import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc,
} from '@stellar/stellar-sdk';
import { SOROBAN_RPC_URLS, STELLAR_TESTNET } from '@stellar/mpp';

const DEFAULT_POLL_ATTEMPTS = 20;
const DEFAULT_POLL_DELAY_MS = 1_000;

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

export function hasEscrowCreditConfig() {
  if (isMockEscrowCreditMode()) return process.env.PAYGATE_REGISTRY_STORE === 'memory';
  return Boolean(getEscrowContractId() && process.env.PAYGATE_OPERATOR_SECRET);
}

async function waitForSuccessfulTransaction(server, hash) {
  for (let attempt = 0; attempt < DEFAULT_POLL_ATTEMPTS; attempt += 1) {
    const tx = await server.getTransaction(hash);
    if (tx.status === 'SUCCESS') return tx;
    if (tx.status === 'FAILED') {
      throw new Error(`Escrow credit transaction failed: ${hash}`);
    }
    await delay(DEFAULT_POLL_DELAY_MS);
  }

  throw new Error(`Escrow credit transaction did not confirm in time: ${hash}`);
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

  await waitForSuccessfulTransaction(server, submitted.hash);
  return {
    mode: 'contract',
    txHash: submitted.hash,
  };
}
