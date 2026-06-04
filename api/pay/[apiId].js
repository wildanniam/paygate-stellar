import { Challenge, Credential, Receipt } from 'mppx';
import { Mppx, stellar } from '@stellar/mpp/charge/server';
import { USDC_SAC_TESTNET, fromBaseUnits, toBaseUnits } from '@stellar/mpp';
import { getOrigin } from '../_lib/auth.js';
import { decryptApiSecret } from '../_lib/apiSecret.js';
import { creditEscrowPayment, getEscrowContractId, hasEscrowCreditConfig } from '../_lib/escrowContract.js';
import { createMppReplayStore } from '../_lib/mppReplayStore.js';
import { createPaymentId } from '../_lib/paymentId.js';
import { getRegistryStore } from '../_lib/registryStore.js';

const mppxByConfig = new Map();

function nowIso() {
  return new Date().toISOString();
}

function getApiId(req) {
  if (req.query?.apiId) return String(req.query.apiId);
  const parts = (req.url || '').split('?')[0].split('/').filter(Boolean);
  return parts[parts.length - 1];
}

function getPaymentCredential(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || Array.isArray(header)) return null;
  const payment = Credential.extractPaymentScheme(header);
  if (!payment) return null;
  return Credential.deserialize(payment);
}

function getCredentialPaymentId(credential) {
  const externalId = credential?.challenge?.request?.externalId;
  return typeof externalId === 'string' ? externalId : null;
}

function getPayerWallet(credential) {
  const source = credential?.source;
  if (typeof source !== 'string') return null;
  const parts = source.split(':');
  return parts[parts.length - 1] || null;
}

function formatUsdcAmount(priceUsdc) {
  return String(priceUsdc);
}

function baseUnitsFromUsdc(priceUsdc) {
  return toBaseUnits(formatUsdcAmount(priceUsdc), 7);
}

function splitGrossBaseUnits(grossBaseUnits) {
  const gross = BigInt(grossBaseUnits);
  const platformFee = gross / 10n;
  const developerAmount = gross - platformFee;
  return {
    developerAmountBaseUnits: developerAmount.toString(),
    platformFeeBaseUnits: platformFee.toString(),
  };
}

function createWebHeaders(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (Array.isArray(value)) {
      for (const entry of value) headers.append(key, entry);
    } else if (value !== undefined) {
      headers.set(key, String(value));
    }
  }
  return headers;
}

function createWebRequest(req) {
  const origin = getOrigin(req);
  const url = new URL(req.url || '/', origin);
  return new Request(url, {
    method: req.method,
    headers: createWebHeaders(req),
  });
}

function createMppx({ realm, registryStore }) {
  const recipient = getEscrowContractId();
  const cacheKey = `${realm}:${recipient}:${registryStore.mode}`;
  const cached = mppxByConfig.get(cacheKey);
  if (cached) return cached;

  const mppx = Mppx.create({
    realm,
    secretKey: process.env.MPP_SECRET_KEY,
    methods: [
      stellar.charge({
        recipient,
        currency: USDC_SAC_TESTNET,
        network: 'stellar:testnet',
        store: createMppReplayStore(registryStore),
      }),
    ],
  });

  mppxByConfig.set(cacheKey, mppx);
  return mppx;
}

function isMockMppVerificationMode() {
  return process.env.PAYGATE_MPP_VERIFY_MODE === 'mock';
}

function createMockPaymentResult({ credential, expectedAmountBaseUnits, expectedPaymentId }) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Mock MPP verification mode is not allowed in production');
  }
  if (process.env.PAYGATE_REGISTRY_STORE !== 'memory') {
    throw new Error('Mock MPP verification mode is only allowed with the memory registry store');
  }
  if (!Challenge.verify(credential.challenge, { secretKey: process.env.MPP_SECRET_KEY })) {
    throw new Error('Mock MPP credential challenge was not issued by PayGate');
  }
  if (credential.challenge.request.externalId !== expectedPaymentId) {
    throw new Error('Mock MPP credential externalId mismatch');
  }
  if (credential.challenge.request.amount !== expectedAmountBaseUnits) {
    throw new Error('Mock MPP credential amount mismatch');
  }
  if (credential.challenge.request.currency !== USDC_SAC_TESTNET) {
    throw new Error('Mock MPP credential currency mismatch');
  }
  if (credential.challenge.request.recipient !== getEscrowContractId()) {
    throw new Error('Mock MPP credential recipient mismatch');
  }
  if (!credential.payload?.hash || !/^[0-9a-f]{64}$/i.test(credential.payload.hash)) {
    throw new Error('Mock MPP credential requires a 64 character tx hash payload');
  }

  const receipt = Receipt.from({
    method: 'stellar',
    reference: credential.payload.hash,
    status: 'success',
    timestamp: nowIso(),
    externalId: expectedPaymentId,
  });

  return {
    receipt,
    receiptHeader: Receipt.serialize(receipt),
  };
}

async function verifyPayment({ api, credential, mppx, paymentId, req }) {
  const expectedAmountBaseUnits = baseUnitsFromUsdc(api.price_usdc);

  if (isMockMppVerificationMode()) {
    return createMockPaymentResult({
      credential,
      expectedAmountBaseUnits,
      expectedPaymentId: paymentId,
    });
  }

  const paymentResult = await mppx.charge({
    amount: formatUsdcAmount(api.price_usdc),
    externalId: paymentId,
    scope: `paygate:api:${api.id}`,
  })(createWebRequest(req));

  if (paymentResult.status === 402) {
    return {
      challengeResponse: paymentResult.challenge,
    };
  }

  const receiptResponse = paymentResult.withReceipt(new Response(null, { status: 204 }));
  const receiptHeader = receiptResponse.headers.get('Payment-Receipt');
  if (!receiptHeader) {
    throw new Error('MPP verification succeeded but no Payment-Receipt header was produced');
  }

  const receipt = Receipt.deserialize(receiptHeader);
  if (receipt.externalId !== paymentId) {
    throw new Error('MPP receipt externalId does not match PayGate payment id');
  }

  return {
    receipt,
    receiptHeader,
  };
}

function sendJson(res, statusCode, payload, headers = {}) {
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined && value !== null) res.setHeader(key, value);
  }
  return res.status(statusCode).json(payload);
}

async function sendResponse(res, response, headers = {}) {
  res.statusCode = response.status;
  for (const [key, value] of response.headers) res.setHeader(key, value);
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined && value !== null) res.setHeader(key, value);
  }
  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}

function buildUpstreamUrl(req, api) {
  const upstream = new URL(api.path, `${api.upstream_base_url.replace(/\/+$/, '')}/`);
  const incoming = new URL(req.url || '/', getOrigin(req));
  for (const [key, value] of incoming.searchParams.entries()) {
    if (key !== 'apiId') upstream.searchParams.append(key, value);
  }
  return upstream;
}

async function forwardToUpstream(req, api) {
  const upstreamUrl = buildUpstreamUrl(req, api);
  const secret = decryptApiSecret(api);
  return fetch(upstreamUrl, {
    method: 'GET',
    headers: {
      Accept: req.headers.accept || 'application/json',
      'X-PayGate-Secret': secret,
    },
  });
}

function isDuplicateError(error) {
  return error?.code === '23505' || /duplicate/i.test(error?.message || '');
}

function paymentAmounts(grossBaseUnits) {
  const { developerAmountBaseUnits, platformFeeBaseUnits } = splitGrossBaseUnits(grossBaseUnits);
  return {
    grossAmountUsdc: fromBaseUnits(grossBaseUnits, 7),
    developerAmountUsdc: fromBaseUnits(developerAmountBaseUnits, 7),
    platformFeeUsdc: fromBaseUnits(platformFeeBaseUnits, 7),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const store = getRegistryStore();
  if (!store) {
    return res.status(503).json({
      error: 'PayGate registry is not configured',
      requiredEnv: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
    });
  }

  if (!process.env.MPP_SECRET_KEY || !getEscrowContractId()) {
    return res.status(503).json({
      error: 'PayGate paid proxy is not configured',
      requiredEnv: ['MPP_SECRET_KEY', 'ESCROW_CONTRACT_ID'],
    });
  }

  const apiId = getApiId(req);
  const api = await store.getPublicApi(apiId);
  if (!api) {
    return res.status(404).json({ error: 'API not found' });
  }

  let credential = null;
  try {
    credential = getPaymentCredential(req);
  } catch {
    credential = null;
  }

  let paymentId = credential ? getCredentialPaymentId(credential) : null;
  let proxyRequest = null;

  if (credential) {
    if (!hasEscrowCreditConfig()) {
      return res.status(503).json({
        error: 'PayGate escrow credit is not configured',
        requiredEnv: ['PAYGATE_OPERATOR_SECRET', 'ESCROW_CONTRACT_ID'],
      });
    }

    if (!paymentId) {
      return sendJson(res, 402, { error: 'Payment credential is missing PayGate payment id' });
    }

    proxyRequest = await store.getProxyRequestByPaymentId(paymentId);
    if (!proxyRequest) {
      return sendJson(res, 402, { error: 'Payment credential is not linked to a PayGate request' });
    }

    if (proxyRequest.api_id !== api.id) {
      return sendJson(res, 402, { error: 'Payment credential does not match this API' });
    }

    if (proxyRequest.status === 'forwarded' || proxyRequest.tx_hash) {
      return sendJson(res, 409, { error: 'Payment credential was already used' });
    }

    await store.updateProxyRequest(proxyRequest.id, { status: 'payment_submitted' });
  } else {
    paymentId = createPaymentId();
    proxyRequest = await store.createProxyRequest({
      api_id: api.id,
      owner_wallet: api.owner_wallet,
      payment_id: paymentId,
      status: 'challenge_sent',
      price_usdc: api.price_usdc,
    });
  }

  const mppx = createMppx({
    realm: getOrigin(req),
    registryStore: store,
  });

  if (!credential) {
    const paymentResult = await mppx.charge({
      amount: formatUsdcAmount(api.price_usdc),
      externalId: paymentId,
      scope: `paygate:api:${api.id}`,
    })(createWebRequest(req));

    res.setHeader('X-PayGate-Request-Id', proxyRequest.id);
    res.setHeader('X-PayGate-Payment-Id', paymentId);
    return sendResponse(res, paymentResult.challenge);
  }

  const grossBaseUnits = baseUnitsFromUsdc(api.price_usdc);
  let verified;
  try {
    verified = await verifyPayment({ api, credential, mppx, paymentId, req });
  } catch (error) {
    await store.updateProxyRequest(proxyRequest.id, {
      status: 'payment_failed',
      error_message: error instanceof Error ? error.message : 'Payment verification failed',
    });
    return sendJson(res, 402, { error: 'Payment verification failed' });
  }

  if (verified.challengeResponse) {
    await store.updateProxyRequest(proxyRequest.id, {
      status: 'payment_failed',
      error_message: 'Payment verification returned a new challenge',
    });
    return sendResponse(res, verified.challengeResponse);
  }

  const receipt = verified.receipt;
  const payerWallet = getPayerWallet(credential);

  await store.updateProxyRequest(proxyRequest.id, {
    status: 'payment_verified',
    payer_wallet: payerWallet,
    tx_hash: receipt.reference,
    paid_at: nowIso(),
  });

  const amounts = paymentAmounts(grossBaseUnits);
  try {
    await store.createPayment({
      request_id: proxyRequest.id,
      api_id: api.id,
      payment_id: paymentId,
      tx_hash: receipt.reference,
      gross_amount_usdc: amounts.grossAmountUsdc,
      developer_amount_usdc: amounts.developerAmountUsdc,
      platform_fee_usdc: amounts.platformFeeUsdc,
      recipient_mode: 'contract',
      verified_at: nowIso(),
    });
  } catch (error) {
    if (!isDuplicateError(error)) throw error;
    await store.updateProxyRequest(proxyRequest.id, {
      status: 'duplicate_payment',
      error_message: 'Payment was already recorded',
    });
    return sendJson(res, 409, { error: 'Payment was already recorded' });
  }

  await store.updateProxyRequest(proxyRequest.id, { status: 'credit_pending' });
  let credit;
  try {
    credit = await creditEscrowPayment({
      paymentId,
      developerWallet: api.owner_wallet,
      grossAmountBaseUnits: grossBaseUnits,
    });
  } catch (error) {
    await store.updateProxyRequest(proxyRequest.id, {
      status: 'credit_pending',
      error_message: error instanceof Error ? error.message : 'Escrow credit failed',
    });
    return sendJson(
      res,
      502,
      { error: 'Escrow credit failed' },
      { 'Payment-Receipt': verified.receiptHeader },
    );
  }

  await store.updatePayment(paymentId, {
    credit_tx_hash: credit.txHash,
    credited_at: nowIso(),
  });
  await store.updateProxyRequest(proxyRequest.id, { status: 'credited' });

  let upstreamResponse;
  try {
    upstreamResponse = await forwardToUpstream(req, api);
  } catch (error) {
    await store.updateProxyRequest(proxyRequest.id, {
      status: 'upstream_failed',
      error_message: error instanceof Error ? error.message : 'Upstream request failed',
    });
    return sendJson(
      res,
      502,
      { error: 'Upstream request failed' },
      { 'Payment-Receipt': verified.receiptHeader },
    );
  }

  const responseText = await upstreamResponse.text();
  if (!upstreamResponse.ok) {
    await store.updateProxyRequest(proxyRequest.id, {
      status: 'upstream_failed',
      upstream_status: upstreamResponse.status,
      error_message: responseText.slice(0, 500),
    });
    res.setHeader('Payment-Receipt', verified.receiptHeader);
    res.statusCode = upstreamResponse.status;
    res.setHeader('Content-Type', upstreamResponse.headers.get('Content-Type') || 'application/json');
    return res.end(responseText);
  }

  await store.updateProxyRequest(proxyRequest.id, {
    status: 'forwarded',
    upstream_status: upstreamResponse.status,
    forwarded_at: nowIso(),
  });

  res.statusCode = upstreamResponse.status;
  res.setHeader('Payment-Receipt', verified.receiptHeader);
  res.setHeader('Content-Type', upstreamResponse.headers.get('Content-Type') || 'application/json');
  return res.end(responseText);
}
