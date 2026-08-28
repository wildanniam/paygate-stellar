import crypto from 'node:crypto';

export const PAYMENT_ID_RANDOM_BYTES = 15;
export const PAYMENT_ID_LENGTH = 1 + PAYMENT_ID_RANDOM_BYTES * 2;
export const PAYMENT_ID_PATTERN = /^p[0-9a-f]{30}$/;

export function createPaymentId() {
  return `p${crypto.randomBytes(PAYMENT_ID_RANDOM_BYTES).toString('hex')}`;
}
