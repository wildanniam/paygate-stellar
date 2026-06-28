import { getRegistryStore } from '../server/lib/registryStore.js';

function parseLimit() {
  const index = process.argv.indexOf('--limit');
  if (index === -1) return 100;
  const value = Number(process.argv[index + 1]);
  return Number.isInteger(value) && value > 0 ? value : 100;
}

function classify(proxyRequest, payment) {
  if (!payment) return 'missing_payment_record';
  if (!payment.credit_tx_hash) return 'payment_verified_credit_pending';
  if (proxyRequest.status === 'upstream_failed') return 'paid_retry_available';
  if (proxyRequest.status === 'credited') return 'credited_delivery_pending';
  return 'needs_review';
}

const store = getRegistryStore();
if (!store) {
  console.error('PayGate registry is not configured. Set Supabase env vars or PAYGATE_REGISTRY_STORE=memory.');
  process.exit(1);
}

const limit = parseLimit();
const candidates = await store.listPaymentReconciliationCandidates(limit);
const items = [];

for (const proxyRequest of candidates) {
  const payment = await store.getPaymentByPaymentId(proxyRequest.payment_id);
  items.push({
    classification: classify(proxyRequest, payment),
    requestId: proxyRequest.id,
    apiId: proxyRequest.api_id,
    ownerWallet: proxyRequest.owner_wallet,
    paymentId: proxyRequest.payment_id,
    status: proxyRequest.status,
    txHash: proxyRequest.tx_hash,
    paymentTxHash: payment?.tx_hash ?? null,
    creditTxHash: payment?.credit_tx_hash ?? null,
    upstreamStatus: proxyRequest.upstream_status,
    errorMessage: proxyRequest.error_message,
    paidAt: proxyRequest.paid_at,
    forwardedAt: proxyRequest.forwarded_at,
  });
}

console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  mode: store.mode,
  count: items.length,
  items,
}, null, 2));
