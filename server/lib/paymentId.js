import crypto from 'node:crypto';

export function createPaymentId() {
  return `p${crypto.randomBytes(5).toString('hex')}`;
}
