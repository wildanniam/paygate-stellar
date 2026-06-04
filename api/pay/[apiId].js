import express from 'express';
import { Mppx } from 'mppx/express';
import { stellar, Store } from '@stellar/mpp/charge/server';
import { USDC_SAC_TESTNET } from '@stellar/mpp';
import { getOrigin } from '../_lib/auth.js';
import { createPaymentId } from '../_lib/paymentId.js';
import { getRegistryStore } from '../_lib/registryStore.js';

const appsByChallengeKey = new Map();

function getApiId(req) {
  if (req.query?.apiId) return String(req.query.apiId);
  const parts = (req.url || '').split('?')[0].split('/').filter(Boolean);
  return parts[parts.length - 1];
}

function hasProxyConfig() {
  return Boolean(process.env.MPP_SECRET_KEY && process.env.PAYGATE_ESCROW_CONTRACT_ID);
}

function decimalAmount(priceUsdc) {
  return String(Number(priceUsdc));
}

function getChallengeApp({ realm, amount }) {
  const recipient = process.env.PAYGATE_ESCROW_CONTRACT_ID;
  const cacheKey = `${realm}:${recipient}:${amount}`;
  const cached = appsByChallengeKey.get(cacheKey);
  if (cached) return cached;

  const mppx = Mppx.create({
    realm,
    secretKey: process.env.MPP_SECRET_KEY,
    methods: [
      stellar.charge({
        recipient,
        currency: USDC_SAC_TESTNET,
        network: 'stellar:testnet',
        store: Store.memory(),
      }),
    ],
  });

  const app = express();
  app.use(mppx.charge({ amount }));
  app.use((_req, res) => {
    res.status(501).json({ error: 'Paid proxy success flow is not implemented yet' });
  });

  appsByChallengeKey.set(cacheKey, app);
  return app;
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

  if (!hasProxyConfig()) {
    return res.status(503).json({
      error: 'PayGate paid proxy is not configured',
      requiredEnv: ['MPP_SECRET_KEY', 'PAYGATE_ESCROW_CONTRACT_ID'],
    });
  }

  const apiId = getApiId(req);
  const api = await store.getPublicApi(apiId);
  if (!api) {
    return res.status(404).json({ error: 'API not found' });
  }

  const paymentId = createPaymentId();
  const proxyRequest = await store.createProxyRequest({
    api_id: api.id,
    owner_wallet: api.owner_wallet,
    payment_id: paymentId,
    status: 'challenge_sent',
    price_usdc: api.price_usdc,
  });

  res.setHeader('X-PayGate-Request-Id', proxyRequest.id);
  res.setHeader('X-PayGate-Payment-Id', paymentId);

  const app = getChallengeApp({
    realm: getOrigin(req),
    amount: decimalAmount(api.price_usdc),
  });

  return app(req, res);
}
