import 'dotenv/config';
import express from 'express';
import { paywall } from './mpp-middleware.js';

const PORT = Number(process.env.PORT || 4000);

const app = express();

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'paygate-express-paid-api-demo' });
});

app.get('/v1/market-signal', paywall, (_req, res) => {
  res.json({
    signal: 'bullish',
    confidence: 0.82,
    source: 'PayGate demo API',
  });
});

app.listen(PORT, () => {
  console.log(`PayGate demo API running at http://localhost:${PORT}`);
  console.log(`Paid endpoint: http://localhost:${PORT}/v1/market-signal`);
});
