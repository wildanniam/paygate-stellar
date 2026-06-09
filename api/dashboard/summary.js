import { toApiResponse, requireRegistryConfig, requireRegistrySession } from '../../server/lib/apiRegistry.js';
import { readEscrowBalances } from '../../server/lib/escrowContract.js';

function sumUsdc(rows, field) {
  return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
}

function formatUsdc(value) {
  return Number(value || 0).toFixed(7);
}

function isSuccessfulStatus(status) {
  return status === 'forwarded';
}

function isFailedStatus(status) {
  return ['payment_failed', 'duplicate_payment', 'upstream_failed'].includes(status);
}

function latestDate(rows, field) {
  return rows
    .map((row) => row[field])
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;
}

function buildApiStats(req, apis, proxyRequests, payments) {
  return apis.map((api) => {
    const apiRequests = proxyRequests.filter((request) => request.api_id === api.id);
    const apiPayments = payments.filter((payment) => payment.api_id === api.id);

    return {
      ...toApiResponse(req, api),
      calls: apiRequests.length,
      successfulCalls: apiRequests.filter((request) => isSuccessfulStatus(request.status)).length,
      failedCalls: apiRequests.filter((request) => isFailedStatus(request.status)).length,
      grossRevenueUsdc: formatUsdc(sumUsdc(apiPayments, 'gross_amount_usdc')),
      developerRevenueUsdc: formatUsdc(sumUsdc(apiPayments, 'developer_amount_usdc')),
      platformFeeUsdc: formatUsdc(sumUsdc(apiPayments, 'platform_fee_usdc')),
      lastRequestAt: latestDate(apiRequests, 'created_at'),
      lastPaymentAt: latestDate(apiPayments, 'created_at'),
    };
  });
}

function apiNameById(apis) {
  return new Map(apis.map((api) => [api.id, api.name]));
}

function serializeRequest(row, names) {
  return {
    id: row.id,
    apiId: row.api_id,
    apiName: names.get(row.api_id) || 'Unknown API',
    paymentId: row.payment_id,
    status: row.status,
    priceUsdc: Number(row.price_usdc),
    payerWallet: row.payer_wallet,
    txHash: row.tx_hash,
    upstreamStatus: row.upstream_status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    forwardedAt: row.forwarded_at,
  };
}

function serializePayment(row, names) {
  return {
    id: row.id,
    requestId: row.request_id,
    apiId: row.api_id,
    apiName: names.get(row.api_id) || 'Unknown API',
    paymentId: row.payment_id,
    txHash: row.tx_hash,
    creditTxHash: row.credit_tx_hash,
    grossAmountUsdc: Number(row.gross_amount_usdc),
    developerAmountUsdc: Number(row.developer_amount_usdc),
    platformFeeUsdc: Number(row.platform_fee_usdc),
    recipientMode: row.recipient_mode,
    verifiedAt: row.verified_at,
    creditedAt: row.credited_at,
    createdAt: row.created_at,
  };
}

function serializeWithdrawal(row) {
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    amountUsdc: Number(row.amount_usdc),
    txHash: row.tx_hash,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

async function readBalances(walletAddress) {
  try {
    return await readEscrowBalances(walletAddress);
  } catch (error) {
    return {
      configured: true,
      developerBalance: { baseUnits: '0', usdc: '0.0000000' },
      platformFeeBalance: { baseUnits: '0', usdc: '0.0000000' },
      error: error instanceof Error ? error.message : 'Failed to read escrow balance',
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = requireRegistrySession(req, res);
  if (!session) return undefined;

  const store = requireRegistryConfig(res);
  if (!store) return undefined;

  try {
    const [apis, proxyRequests, payments, withdrawals, escrow] = await Promise.all([
      store.listApis(session.walletAddress),
      store.listProxyRequests(session.walletAddress, 100),
      store.listPaymentsForOwner(session.walletAddress, 100),
      store.listWithdrawals(session.walletAddress, 50),
      readBalances(session.walletAddress),
    ]);

    const names = apiNameById(apis);
    const successfulCalls = proxyRequests.filter((request) => isSuccessfulStatus(request.status)).length;
    const failedCalls = proxyRequests.filter((request) => isFailedStatus(request.status)).length;

    return res.status(200).json({
      walletAddress: session.walletAddress,
      summary: {
        totalApis: apis.length,
        activeApis: apis.filter((api) => api.active).length,
        totalCalls: proxyRequests.length,
        successfulCalls,
        failedCalls,
        grossRevenueUsdc: formatUsdc(sumUsdc(payments, 'gross_amount_usdc')),
        developerRevenueUsdc: formatUsdc(sumUsdc(payments, 'developer_amount_usdc')),
        platformFeeUsdc: formatUsdc(sumUsdc(payments, 'platform_fee_usdc')),
        lastPaymentAt: latestDate(payments, 'created_at'),
      },
      escrow,
      apis: buildApiStats(req, apis, proxyRequests, payments),
      requests: proxyRequests.map((row) => serializeRequest(row, names)),
      payments: payments.map((row) => serializePayment(row, names)),
      withdrawals: withdrawals.map(serializeWithdrawal),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Dashboard summary error' });
  }
}
