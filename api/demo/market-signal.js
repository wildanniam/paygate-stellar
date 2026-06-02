import express from 'express';
import { Mppx } from 'mppx/express';
import { stellar, Store } from '@stellar/mpp/charge/server';
import { USDC_SAC_TESTNET } from '@stellar/mpp';

const appsByRealm = new Map();

function getOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

function isConfigured() {
  return Boolean(process.env.STELLAR_RECIPIENT && process.env.MPP_SECRET_KEY);
}

function getApp(realm) {
  const cached = appsByRealm.get(realm);
  if (cached) return cached;

  const mppx = Mppx.create({
    realm,
    secretKey: process.env.MPP_SECRET_KEY,
    methods: [
      stellar.charge({
        recipient: process.env.STELLAR_RECIPIENT,
        currency: USDC_SAC_TESTNET,
        network: 'stellar:testnet',
        store: Store.memory(),
      }),
    ],
  });

  const app = express();

  app.use(mppx.charge({ amount: '0.01' }));
  app.use((_req, res) => {
    res.json({
      signal: 'bullish',
      confidence: 0.82,
      source: 'PayGate demo API',
    });
  });

  appsByRealm.set(realm, app);
  return app;
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isConfigured()) {
    return res.status(503).json({
      error: 'PayGate demo API is not configured',
      requiredEnv: ['STELLAR_RECIPIENT', 'MPP_SECRET_KEY'],
    });
  }

  return getApp(getOrigin(req))(req, res);
}
