import { nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
import { Challenge, Credential, Receipt } from 'mppx';
import {
  createPaymentId,
  PAYMENT_ID_LENGTH,
  PAYMENT_ID_PATTERN,
  PAYMENT_ID_RANDOM_BYTES,
} from '../server/lib/paymentId.js';

const SAMPLE_SIZE = 4096;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(PAYMENT_ID_RANDOM_BYTES === 15, 'payment ids must contain 120 random bits');
assert(PAYMENT_ID_LENGTH === 31, 'payment ids must fit the 32-character Soroban Symbol limit');

const generated = new Set();
for (let index = 0; index < SAMPLE_SIZE; index += 1) {
  const paymentId = createPaymentId();
  assert(paymentId.length === PAYMENT_ID_LENGTH, 'generated payment id has an unexpected length');
  assert(PAYMENT_ID_PATTERN.test(paymentId), 'generated payment id has an unexpected format');
  assert(!generated.has(paymentId), 'generated duplicate payment ids during compatibility smoke');
  generated.add(paymentId);
}

const paymentId = createPaymentId();
const challenge = Challenge.from({
  id: 'payment-id-compatibility-smoke',
  realm: 'paygate.test',
  method: 'stellar',
  intent: 'charge',
  request: {
    amount: '1',
    currency: 'testnet-usdc',
    recipient: 'testnet-escrow',
    externalId: paymentId,
  },
});
const challengeRoundTrip = Challenge.deserialize(Challenge.serialize(challenge));
assert(challengeRoundTrip.request.externalId === paymentId, 'MPP challenge changed the payment id');

const credentialRoundTrip = Credential.deserialize(
  Credential.serialize({ challenge, payload: { type: 'hash', hash: 'a'.repeat(64) } }),
);
assert(
  credentialRoundTrip.challenge.request.externalId === paymentId,
  'MPP credential changed the payment id',
);

const receipt = Receipt.from({
  method: 'stellar',
  reference: 'a'.repeat(64),
  externalId: paymentId,
  status: 'success',
  timestamp: new Date().toISOString(),
});
const receiptRoundTrip = Receipt.deserialize(Receipt.serialize(receipt));
assert(receiptRoundTrip.externalId === paymentId, 'MPP receipt changed the payment id');

const symbol = nativeToScVal(paymentId, { type: 'symbol' });
assert(scValToNative(symbol) === paymentId, 'Stellar SDK Symbol encoding changed the payment id');

console.log('Payment ID entropy and compatibility smoke test passed');
