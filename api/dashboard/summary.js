import { toApiResponse, requireRegistryConfig, requireRegistrySession } from '../../server/lib/apiRegistry.js';
import { readEscrowBalances } from '../../server/lib/escrowContract.js';
import { publicErrorMessage } from '../../server/lib/errors.js';

function formatUsdc(value) {
  return Number(value || 0).toFixed(7);
}

function buildApiStats(req, apis, analytics) {
  const perApi = new Map((analytics?.per_api || []).map((row) => [row.api_id, row]));
  return apis.map((api) => {
    const stats = perApi.get(api.id) || {};

    return {
      ...toApiResponse(req, api),
      calls: Number(stats.total_calls || 0),
      successfulCalls: Number(stats.successful_calls || 0),
      failedCalls: Number(stats.failed_calls || 0),
      grossRevenueUsdc: formatUsdc(stats.gross_revenue_usdc),
      developerRevenueUsdc: formatUsdc(stats.developer_revenue_usdc),
      platformFeeUsdc: formatUsdc(stats.platform_fee_usdc),
      lastRequestAt: stats.last_request_at || null,
      lastPaymentAt: stats.last_payment_at || null,
    };
  });
}

function serializeAnalyticsAggregate(row = {}) {
  return {
    apiId: row.api_id || null,
    date: row.bucket_date || null,
    totalCalls: Number(row.total_calls || 0),
    successfulCalls: Number(row.successful_calls || 0),
    failedCalls: Number(row.failed_calls || 0),
    paymentRequiredCalls: Number(row.payment_required_calls || 0),
    grossRevenueUsdc: Number(row.gross_revenue_usdc || 0),
    developerRevenueUsdc: Number(row.developer_revenue_usdc || 0),
    platformFeeUsdc: Number(row.platform_fee_usdc || 0),
    lastRequestAt: row.last_request_at || null,
    lastPaymentAt: row.last_payment_at || null,
  };
}

function serializeAnalytics(analytics, since) {
  return {
    since,
    allTime: serializeAnalyticsAggregate(analytics?.all_time),
    perApi: (analytics?.per_api || []).map(serializeAnalyticsAggregate),
    daily: (analytics?.daily || []).map(serializeAnalyticsAggregate),
  };
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
    creditStatus: row.credit_status,
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
      error: publicErrorMessage(error, 'Escrow balance is temporarily unavailable.'),
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
    const analyticsSince = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const [apis, proxyRequests, payments, withdrawals, escrow, analytics] = await Promise.all([
      store.listApis(session.walletAddress),
      store.listProxyRequests(session.walletAddress, 100),
      store.listPaymentsForOwner(session.walletAddress, 100),
      store.listWithdrawals(session.walletAddress, 50),
      readBalances(session.walletAddress),
      store.getDashboardAnalytics(session.walletAddress, analyticsSince),
    ]);

    const names = apiNameById(apis);
    const allTime = analytics?.all_time || {};

    return res.status(200).json({
      walletAddress: session.walletAddress,
      summary: {
        totalApis: apis.length,
        activeApis: apis.filter((api) => api.active).length,
        totalCalls: Number(allTime.total_calls || 0),
        successfulCalls: Number(allTime.successful_calls || 0),
        failedCalls: Number(allTime.failed_calls || 0),
        grossRevenueUsdc: formatUsdc(allTime.gross_revenue_usdc),
        developerRevenueUsdc: formatUsdc(allTime.developer_revenue_usdc),
        platformFeeUsdc: formatUsdc(allTime.platform_fee_usdc),
        lastPaymentAt: allTime.last_payment_at || null,
      },
      escrow,
      analytics: serializeAnalytics(analytics, analyticsSince),
      apis: buildApiStats(req, apis, analytics),
      requests: proxyRequests.map((row) => serializeRequest(row, names)),
      payments: payments.map((row) => serializePayment(row, names)),
      withdrawals: withdrawals.map(serializeWithdrawal),
    });
  } catch (err) {
    return res.status(500).json({
      error: publicErrorMessage(err, 'PayGate could not load the dashboard workspace. Please try again in a moment.'),
    });
  }
}
