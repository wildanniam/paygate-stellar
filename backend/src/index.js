import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import generateHandler from '../../api/generate.js';
import authHandler from '../../api/auth/[action].js';
import apisHandler from '../../api/apis/index.js';
import apiDetailHandler from '../../api/apis/[apiId].js';
import apiVerifyHandler from '../../api/apis/[apiId]/verify.js';
import dashboardSummaryHandler from '../../api/dashboard/summary.js';
import payHandler from '../../api/pay/[apiId].js';
import withdrawHandler from '../../api/withdraw/[action].js';
import demoMarketSignalHandler from '../../api/demo/market-signal.js';
import upstreamMarketSignalHandler from '../../api/upstream/market-signal.js';

function loadLocalEnv() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const envPath = path.join(rootDir, '.env.local');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadLocalEnv();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', limiter);

function vercelHandler(handler) {
  return async (req, res, next) => {
    Object.assign(req.query, req.params);

    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

app.all('/api/generate', vercelHandler(generateHandler));
app.all('/api/auth/:action', vercelHandler(authHandler));
app.all('/api/apis/:apiId/verify', vercelHandler(apiVerifyHandler));
app.all('/api/apis/:apiId', vercelHandler(apiDetailHandler));
app.all('/api/apis', vercelHandler(apisHandler));
app.all('/api/dashboard/summary', vercelHandler(dashboardSummaryHandler));
app.all('/api/pay/:apiId', vercelHandler(payHandler));
app.all('/api/withdraw/:action', vercelHandler(withdrawHandler));
app.all('/api/demo/market-signal', vercelHandler(demoMarketSignalHandler));
app.all('/api/upstream/market-signal', vercelHandler(upstreamMarketSignalHandler));

app.use('/api', (error, _req, res, next) => {
  if (res.headersSent) return next(error);
  console.error('PayGate local API error:', error);
  return res.status(500).json({ error: error.message || 'Local API error' });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`PayGate backend running on port ${PORT}`);
});
