export const DASHBOARD_RANGES = [7, 30, 90];

export function shortValue(value, head = 7, tail = 5) {
  if (!value) return '-';
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatRangeLabel(days = 30, referenceDate = new Date()) {
  const end = referenceDate;
  const start = new Date(end);
  start.setDate(start.getDate() - Number(days || 30));

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const yearFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
  });

  return `${dateFormatter.format(start)} - ${dateFormatter.format(end)}, ${yearFormatter.format(end)}`;
}

export function formatUsdc(value, maxFractionDigits = 4) {
  const number = Number(value || 0);
  const formatted = number.toLocaleString(undefined, {
    minimumFractionDigits: number > 0 && number < 0.01 ? Math.min(4, maxFractionDigits) : 0,
    maximumFractionDigits: maxFractionDigits,
  });
  return `${formatted} USDC`;
}

export function formatSignedUsdc(value, maxFractionDigits = 4) {
  const number = Number(value || 0);
  if (number <= 0) return '0 USDC';
  return `+${formatUsdc(number, maxFractionDigits)}`;
}

export function formatPricePerCall(value) {
  return `${formatUsdc(value, 4)}/call`;
}

export function formatCompactNumber(value) {
  const number = Number(value || 0);
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${number}`;
}

export function getApiLifecycleCounts(apis = []) {
  return {
    active: apis.filter((api) => api.status === 'active').length,
    pending: apis.filter((api) => api.status === 'pending_setup').length,
    archived: apis.filter((api) => api.status === 'archived').length,
  };
}

export function getApiLifecycleLabel(status) {
  if (status === 'active') return 'Active';
  if (status === 'pending_setup') return 'Setup required';
  if (status === 'archived') return 'Archived';
  return 'Unknown';
}

export function isSuccessfulRequest(status) {
  return status === 'forwarded';
}

export function isFailedRequest(status) {
  return ['payment_failed', 'duplicate_payment', 'upstream_failed'].includes(status);
}

export function isPaymentRequiredRequest(status) {
  return status === 'challenge_sent';
}

export function isCreditedPayment(payment) {
  if (!payment) return false;
  if (payment.creditStatus) return payment.creditStatus === 'credited';
  return Boolean(payment.creditedAt && payment.creditTxHash);
}

export function requestStatusGroup(status, payment) {
  if (isPaymentRequiredRequest(status)) return '402';
  if (isFailedRequest(status)) return 'failed';
  if (status === 'forwarded' && payment) return 'mpp_verified';
  if (status === 'forwarded') return 'forwarded';
  return 'other';
}

export function requestTone(status, payment) {
  const group = requestStatusGroup(status, payment);
  if (group === '402') return 'warning';
  if (group === 'mpp_verified') return 'purple';
  if (group === 'forwarded') return 'blue';
  if (group === 'failed') return 'danger';
  return 'muted';
}

export function requestResultTone(status, upstreamStatus) {
  if (isPaymentRequiredRequest(status)) return 'warning';
  if (isFailedRequest(status)) return 'danger';
  if (Number(upstreamStatus) >= 200 && Number(upstreamStatus) < 300) return 'success';
  if (status === 'forwarded') return 'success';
  return 'muted';
}

export function getRequestActivityMeta(request, payment) {
  const credited = isCreditedPayment(payment);

  if (isPaymentRequiredRequest(request.status)) {
    return {
      group: '402',
      event: '402 required',
      eventTone: 'warning',
      result: 'Not forwarded',
      resultTone: 'warning',
      revenue: '0 USDC',
      revenueTone: 'muted',
    };
  }

  if (request.status === 'forwarded') {
    const upstream = request.upstreamStatus ? `${request.upstreamStatus} OK` : '200 OK';
    return {
      group: payment ? 'mpp_verified' : 'forwarded',
      event: payment ? 'MPP verified' : 'forwarded',
      eventTone: payment ? 'purple' : 'blue',
      result: upstream,
      resultTone: requestResultTone(request.status, request.upstreamStatus),
      revenue: credited ? formatSignedUsdc(payment.developerAmountUsdc ?? payment.grossAmountUsdc) : '0 USDC',
      revenueTone: credited ? 'positive' : 'muted',
    };
  }

  if (request.status === 'upstream_failed') {
    return {
      group: 'failed',
      event: 'upstream failed',
      eventTone: 'danger',
      result: request.upstreamStatus ? `${request.upstreamStatus}` : 'failed',
      resultTone: 'danger',
      revenue: credited ? formatSignedUsdc(payment.developerAmountUsdc ?? payment.grossAmountUsdc) : '0 USDC',
      revenueTone: credited ? 'positive' : 'muted',
    };
  }

  if (request.status === 'payment_failed' || request.status === 'duplicate_payment') {
    return {
      group: 'failed',
      event: request.status.replace(/_/g, ' '),
      eventTone: 'danger',
      result: 'failed',
      resultTone: 'danger',
      revenue: '0 USDC',
      revenueTone: 'muted',
    };
  }

  return {
    group: 'other',
    event: request.status?.replace(/_/g, ' ') || 'request',
    eventTone: requestTone(request.status, payment),
    result: request.upstreamStatus || '-',
    resultTone: requestResultTone(request.status, request.upstreamStatus),
    revenue: credited ? formatSignedUsdc(payment.developerAmountUsdc ?? payment.grossAmountUsdc) : '0 USDC',
    revenueTone: credited ? 'positive' : 'muted',
  };
}

function paymentMaps(payments = []) {
  return {
    byRequestId: new Map(payments.filter((payment) => payment.requestId).map((payment) => [payment.requestId, payment])),
    byPaymentId: new Map(payments.filter((payment) => payment.paymentId).map((payment) => [payment.paymentId, payment])),
  };
}

export function buildActivityRows(requests = [], payments = []) {
  const { byRequestId, byPaymentId } = paymentMaps(payments);
  const requestIds = new Set(requests.map((request) => request.id));

  const requestRows = requests.map((request) => {
    const payment = byRequestId.get(request.id) || byPaymentId.get(request.paymentId);
    const meta = getRequestActivityMeta(request, payment);

    return {
      id: request.id,
      requestId: request.id,
      apiId: request.apiId,
      apiName: request.apiName,
      paymentId: request.paymentId,
      createdAt: request.forwardedAt || request.paidAt || request.createdAt,
      payerWallet: request.payerWallet,
      upstreamStatus: request.upstreamStatus,
      errorMessage: request.errorMessage,
      txHash: request.txHash || payment?.txHash,
      creditTxHash: payment?.creditTxHash,
      payment,
      request,
      ...meta,
    };
  });

  const orphanPaymentRows = payments
    .filter((payment) => payment.requestId && !requestIds.has(payment.requestId))
    .map((payment) => {
      const credited = isCreditedPayment(payment);
      return {
        id: `payment-${payment.id}`,
        requestId: payment.requestId,
        apiId: payment.apiId,
        apiName: payment.apiName,
        paymentId: payment.paymentId,
        createdAt: payment.creditedAt || payment.verifiedAt || payment.createdAt,
        txHash: payment.txHash,
        creditTxHash: payment.creditTxHash,
        payment,
        request: null,
        group: credited ? 'mpp_verified' : 'other',
        event: credited ? 'MPP verified' : 'payment verified',
        eventTone: 'purple',
        result: credited ? 'credited' : 'credit pending',
        resultTone: credited ? 'success' : 'warning',
        revenue: credited ? formatSignedUsdc(payment.developerAmountUsdc ?? payment.grossAmountUsdc) : '0 USDC',
        revenueTone: credited ? 'positive' : 'muted',
      };
    });

  return [...requestRows, ...orphanPaymentRows]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function inSelectedRange(value, days, referenceDate = new Date()) {
  if (!value) return false;
  const createdAt = new Date(value).getTime();
  if (!Number.isFinite(createdAt)) return false;
  const end = referenceDate.getTime();
  const start = end - Number(days || 30) * 24 * 60 * 60 * 1000;
  return createdAt >= start && createdAt <= end;
}

export function filterRowsByRange(rows = [], days, dateField = 'createdAt', referenceDate = new Date()) {
  return rows.filter((row) => inSelectedRange(row[dateField], days, referenceDate));
}

function sumRows(rows, field) {
  return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
}

function aggregateAnalyticsRows(rows = []) {
  return {
    totalCalls: sumRows(rows, 'totalCalls'),
    successfulCalls: sumRows(rows, 'successfulCalls'),
    failedCalls: sumRows(rows, 'failedCalls'),
    paymentRequiredCalls: sumRows(rows, 'paymentRequiredCalls'),
    grossRevenueUsdc: sumRows(rows, 'grossRevenueUsdc'),
    developerRevenueUsdc: sumRows(rows, 'developerRevenueUsdc'),
    platformFeeUsdc: sumRows(rows, 'platformFeeUsdc'),
  };
}

function buildRevenueTrend(analyticsRows, payments, days, referenceDate) {
  const bucketCount = 8;
  const end = referenceDate.getTime();
  const duration = Number(days || 30) * 24 * 60 * 60 * 1000;
  const start = end - duration;
  const buckets = Array.from({ length: bucketCount }, () => 0);
  const source = analyticsRows.length > 0
    ? analyticsRows.map((row) => ({
      createdAt: `${row.date}T00:00:00.000Z`,
      value: Number(row.developerRevenueUsdc || 0),
    }))
    : payments.map((payment) => ({
      createdAt: payment.creditedAt || payment.createdAt,
      value: Number(payment.developerAmountUsdc || 0),
    }));

  for (const row of source) {
    const timestamp = new Date(row.createdAt || 0).getTime();
    if (!Number.isFinite(timestamp) || timestamp < start || timestamp > end) continue;
    const index = Math.min(bucketCount - 1, Math.floor(((timestamp - start) / duration) * bucketCount));
    buckets[index] += row.value;
  }
  return buckets;
}

export function buildDashboardModel(dashboard, days = 30, referenceDate = new Date()) {
  if (!dashboard) return null;

  const apis = dashboard.apis || [];
  const rangeRequests = filterRowsByRange(dashboard.requests || [], days, 'createdAt', referenceDate);
  const rangePayments = filterRowsByRange(dashboard.payments || [], days, 'createdAt', referenceDate);
  const rangeCreditedPayments = rangePayments.filter(isCreditedPayment);
  const rangeWithdrawals = filterRowsByRange(dashboard.withdrawals || [], days, 'createdAt', referenceDate);
  const hasAnalytics = Array.isArray(dashboard.analytics?.daily);
  const rangeAnalytics = hasAnalytics
    ? filterRowsByRange(dashboard.analytics.daily, days, 'date', referenceDate)
    : [];
  const activityRows = buildActivityRows(rangeRequests, rangePayments);
  const lifecycleCounts = getApiLifecycleCounts(apis);

  const apiStats = apis.map((api) => {
    const apiRequests = rangeRequests.filter((request) => request.apiId === api.id);
    const apiPayments = rangeCreditedPayments.filter((payment) => payment.apiId === api.id);
    const apiAnalytics = rangeAnalytics.filter((row) => row.apiId === api.id);
    const aggregate = aggregateAnalyticsRows(apiAnalytics);
    const successfulCalls = hasAnalytics
      ? aggregate.successfulCalls
      : apiRequests.filter((request) => isSuccessfulRequest(request.status)).length;
    const failedCalls = hasAnalytics
      ? aggregate.failedCalls
      : apiRequests.filter((request) => isFailedRequest(request.status)).length;

    return {
      ...api,
      rangeCalls: hasAnalytics ? aggregate.totalCalls : apiRequests.length,
      rangeSuccessfulCalls: successfulCalls,
      rangeFailedCalls: failedCalls,
      rangePaymentRequiredCalls: hasAnalytics
        ? aggregate.paymentRequiredCalls
        : apiRequests.filter((request) => isPaymentRequiredRequest(request.status)).length,
      rangeGrossRevenueUsdc: hasAnalytics ? aggregate.grossRevenueUsdc : sumRows(apiPayments, 'grossAmountUsdc'),
      rangeDeveloperRevenueUsdc: hasAnalytics
        ? aggregate.developerRevenueUsdc
        : sumRows(apiPayments, 'developerAmountUsdc'),
      rangePlatformFeeUsdc: hasAnalytics ? aggregate.platformFeeUsdc : sumRows(apiPayments, 'platformFeeUsdc'),
      rangeLastActivityAt: (hasAnalytics
        ? apiAnalytics.map((row) => row.date)
        : [...apiRequests.map((request) => request.createdAt), ...apiPayments.map((payment) => payment.createdAt)])
        .filter(Boolean)
        .sort()
        .at(-1) ?? api.lastRequestAt ?? api.lastPaymentAt,
    };
  });

  const rangeAggregate = aggregateAnalyticsRows(rangeAnalytics);
  const paidCalls = hasAnalytics
    ? rangeAggregate.successfulCalls
    : rangeRequests.filter((request) => isSuccessfulRequest(request.status)).length;
  const failedCalls = hasAnalytics
    ? rangeAggregate.failedCalls
    : rangeRequests.filter((request) => isFailedRequest(request.status)).length;
  const paymentRequiredCalls = hasAnalytics
    ? rangeAggregate.paymentRequiredCalls
    : rangeRequests.filter((request) => isPaymentRequiredRequest(request.status)).length;

  return {
    days,
    apis,
    apiStats,
    activityRows,
    rangeRequests,
    rangePayments,
    rangeWithdrawals,
    rangeAnalytics,
    revenueTrend: buildRevenueTrend(rangeAnalytics, rangeCreditedPayments, days, referenceDate),
    lifecycleCounts,
    summary: {
      totalApis: apis.length,
      activeApis: lifecycleCounts.active,
      setupRequiredApis: lifecycleCounts.pending,
      archivedApis: lifecycleCounts.archived,
      totalCalls: hasAnalytics ? rangeAggregate.totalCalls : rangeRequests.length,
      paidCalls,
      successfulCalls: paidCalls,
      failedCalls,
      paymentRequiredCalls,
      grossRevenueUsdc: hasAnalytics ? rangeAggregate.grossRevenueUsdc : sumRows(rangeCreditedPayments, 'grossAmountUsdc'),
      developerRevenueUsdc: hasAnalytics
        ? rangeAggregate.developerRevenueUsdc
        : sumRows(rangeCreditedPayments, 'developerAmountUsdc'),
      platformFeeUsdc: hasAnalytics
        ? rangeAggregate.platformFeeUsdc
        : sumRows(rangeCreditedPayments, 'platformFeeUsdc'),
      withdrawableUsdc: Number(dashboard.escrow?.developerBalance?.usdc || 0),
      platformFeeBalanceUsdc: Number(dashboard.escrow?.platformFeeBalance?.usdc || 0),
    },
    topEndpoints: [...apiStats]
      .sort((a, b) => (b.rangeDeveloperRevenueUsdc || 0) - (a.rangeDeveloperRevenueUsdc || 0) || (b.rangeCalls || 0) - (a.rangeCalls || 0))
      .slice(0, 5),
    needsAttention: {
      setupRequiredApis: lifecycleCounts.pending,
      failedCalls,
      paymentRequiredCalls,
      withdrawableUsdc: Number(dashboard.escrow?.developerBalance?.usdc || 0),
    },
  };
}
