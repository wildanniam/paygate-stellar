import test from 'node:test';
import assert from 'node:assert/strict';
import { RECEIPT_EXAMPLES } from './landingReceiptExamples.js';

test('receipt comparison isolates API outcome without implying payment was reversed', () => {
  const delivered = RECEIPT_EXAMPLES.find(record => record.responseStatus >= 200 && record.responseStatus < 300);
  const failed = RECEIPT_EXAMPLES.find(record => record.responseStatus >= 500);
  assert.ok(delivered, 'comparison needs a delivered request');
  assert.ok(failed, 'comparison needs an upstream failure');
  assert.equal(delivered.endpoint, failed.endpoint);
  assert.equal(delivered.paymentStatus, 'credited');
  assert.equal(failed.paymentStatus, 'credited', 'an upstream failure does not undo recorded credit');
  for (const field of ['gross', 'net', 'fee']) assert.equal(delivered[field], failed[field]);
});

test('sample evidence is unique, visibly illustrative, and conserves the 90/10 ledger', () => {
  for (const key of ['id', 'request', 'payment', 'shortRequest']) {
    assert.equal(new Set(RECEIPT_EXAMPLES.map(record => record[key])).size, RECEIPT_EXAMPLES.length);
  }
  for (const record of RECEIPT_EXAMPLES) {
    assert.match(record.request, /^req_demo_/);
    assert.match(record.payment, /^pay_demo_/);
    assert.ok(record.request.endsWith(record.shortRequest));
    const units = value => Math.round(Number(value) * 1000);
    const [gross, net, fee] = ['gross', 'net', 'fee'].map(key => units(record[key]));
    assert.equal(net + fee, gross);
    assert.equal(net * 10, gross * 9);
    assert.equal(fee * 10, gross);
  }
});
